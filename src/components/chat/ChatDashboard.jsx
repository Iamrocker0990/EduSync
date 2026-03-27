import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Book, Plus, ArrowLeft } from 'lucide-react';
import { io } from 'socket.io-client';
import chatService from '../../services/chatService';

export default function ChatDashboard({ userType }) {
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [showNewChatPanel, setShowNewChatPanel] = useState(false);
    const [eligibleTeachers, setEligibleTeachers] = useState([]);
    const [socket, setSocket] = useState(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const currentUserId = userInfo?._id;
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Init socket
        const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
        const newSocket = io(baseUrl);
        setSocket(newSocket);

        newSocket.emit("setup", currentUserId);

        newSocket.on("connected", () => {
            console.log("Socket connected");
        });

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [currentUserId]);

    // Handle new incoming messages
    useEffect(() => {
        if (!socket) return;

        const messageHandler = (newMessage) => {
            // Refresh sidebar to update lastMessage snippet
            fetchConversations();

            // If the message belongs to the currently active chat, append it to the open window
            if (activeChat && newMessage.conversationId === activeChat._id) {
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        socket.on("message_received", messageHandler);

        return () => {
            socket.off("message_received", messageHandler);
        };
    }, [socket, activeChat]);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const data = await chatService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const data = await chatService.getMessages(conversationId);
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const handleSelectConversation = (conv) => {
        setActiveChat(conv);
        fetchMessages(conv._id);
        setShowNewChatPanel(false);
    };

    const handleNewChatClick = async () => {
        if (userType === 'student') {
            try {
                const teachers = await chatService.getTeachers();
                setEligibleTeachers(teachers);
                setShowNewChatPanel(true);
            } catch (error) {
                console.error("Failed to fetch eligible teachers", error);
            }
        }
    };

    const startNewConversation = (teacherCoursePair) => {
        const existingConv = conversations.find(c => c.course._id === teacherCoursePair.courseId && c.teacher._id === teacherCoursePair.teacherId);
        if (existingConv) {
            handleSelectConversation(existingConv);
        } else {
            setActiveChat({
                isNew: true,
                teacher: { _id: teacherCoursePair.teacherId, name: teacherCoursePair.teacherName, avatar: teacherCoursePair.teacherAvatar },
                course: { _id: teacherCoursePair.courseId, title: teacherCoursePair.courseTitle }
            });
            setMessages([]);
            setShowNewChatPanel(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || !activeChat) return;

        const receiverId = userType === 'student' ? activeChat.teacher._id : activeChat.student._id;
        const courseId = activeChat.course._id;

        try {
            const newMessage = await chatService.sendMessage({ receiverId, courseId, text: input });

            // Emit via socket immediately
            if (socket) {
                socket.emit("new_message", { ...newMessage, receiverId });
            }

            setMessages((prev) => [...prev, newMessage]);
            setInput("");

            // If it's the very first message of a new chat, refresh everything to lock in DB _ids
            if (activeChat.isNew) {
                await fetchConversations();
                setActiveChat(null); // Optionally keep active by finding the newly created conversation
            } else {
                fetchConversations(); // Just update lastMessage snippet in sidebar
            }

        } catch (error) {
            console.error("Failed to send message", error);
            alert("Failed to send message.");
        }
    };

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const displayUser = (conv) => userType === 'student' ? conv.teacher : conv.student;

    return (
        <div className="flex h-[80vh] bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Sidebar */}
            <div className={`w-full md:w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Private Doubts</h2>
                        {userType === 'student' && !showNewChatPanel && (
                            <button
                                onClick={handleNewChatClick}
                                className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 p-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                                title="New Conversation"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        )}
                        {showNewChatPanel && (
                            <button
                                onClick={() => setShowNewChatPanel(false)}
                                className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 p-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {showNewChatPanel ? (
                        <div className="p-2 space-y-1">
                            <p className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start new chat regarding...</p>
                            {eligibleTeachers.map((pair, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => startNewConversation(pair)}
                                    className="p-3 mx-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm cursor-pointer transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                                            {pair.teacherName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{pair.teacherName}</h4>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                                                <Book className="h-3 w-3" /> {pair.courseTitle}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {eligibleTeachers.length === 0 && (
                                <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">You are not enrolled in any courses yet.</p>
                            )}
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {conversations.map((conv) => (
                                <div
                                    key={conv._id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`p-3 mx-2 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${activeChat?._id === conv._id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                            : 'bg-transparent border border-transparent hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 hover:border-slate-200 dark:border-slate-700 dark:hover:border-slate-700'
                                        }`}
                                >
                                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                                        {displayUser(conv)?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{displayUser(conv)?.name || 'User'}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                            {conv.lastMessage ? conv.lastMessage.text : 'New Conversation'}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="inline-flex text-[10px] items-center text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded px-2">
                                                <Book className="h-2.5 w-2.5 mr-1" /> {conv.course?.title}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {conversations.length === 0 && (
                                <div className="text-center p-6">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No active conversations.</p>
                                    {userType === 'student' && (
                                        <button
                                            onClick={handleNewChatClick}
                                            className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                                        >
                                            <Plus className="h-4 w-4 mr-1" /> Start one now
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`w-full md:w-2/3 flex flex-col bg-[#f0f2f5] dark:bg-slate-900 relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                {activeChat ? (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-white dark:bg-slate-900 shadow-[0_2px_5px_rgba(0,0,0,0.05)] flex items-center justify-between z-10 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <button className="md:hidden text-slate-500 dark:text-slate-400 mr-2" onClick={() => setActiveChat(null)}>
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                                    {(activeChat.isNew ? activeChat.teacher.name : displayUser(activeChat).name).charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                                        {activeChat.isNew ? activeChat.teacher.name : displayUser(activeChat).name}
                                    </h3>
                                    {/* The Contextual Course Tag */}
                                    <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <Book className="h-3 w-3" /> {activeChat.course.title}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://wallpapers.com/images/hd/whatsapp-chat-background-scxjz0xeyp5ts34a.jpg')] bg-cover bg-center">
                            {messages.map((msg, idx) => {
                                const isMine = msg.sender === currentUserId;
                                return (
                                    <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`rounded-xl px-4 py-2 max-w-[80%] shadow-sm ${isMine
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700'
                                            }`}>
                                            <p className="text-[15px] leading-relaxed">{msg.text}</p>
                                            <span className={`text-[10px] mt-1 block ${isMine ? 'text-blue-200 text-right' : 'text-slate-400 dark:text-slate-500 dark:text-gray-400'}`}>
                                                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {activeChat.isNew && (
                                <div className="text-center w-full mt-10">
                                    <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-500 text-xs px-3 py-1.5 rounded-full shadow-sm">
                                        This is the beginning of your conversation regarding {activeChat.course.title}.
                                    </span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input Container */}
                        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-2 max-w-4xl mx-auto">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 dark:text-white shadow-inner"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!input.trim()}
                                    className="h-11 w-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center transition-colors shadow-md"
                                >
                                    <Send className="h-5 w-5 ml-1" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900">
                        <div className="h-24 w-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                            <Send className="h-10 w-10 text-blue-200 dark:text-blue-800" />
                        </div>
                        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Select a chat or start a new one</p>
                        <p className="text-sm mt-2 text-slate-400 dark:text-slate-500 dark:text-gray-400">Your "Private Doubts" with instructors will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
