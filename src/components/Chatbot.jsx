import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Smile, Frown, Meh } from 'lucide-react';
import { analyzeSentiment, generateResponse, getLanguageName } from '../utils/chatbot';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: '1',
        text: getWelcomeMessage(currentLanguage),
        sender: 'bot',
        timestamp: new Date(),
        language: currentLanguage,
        sentiment: 'neutral'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, currentLanguage]);

  const getWelcomeMessage = (lang) => {
    const msgs = {
      en: "Hello! I'm your learning assistant. I can help you find courses, answer questions, and support your learning journey. How can I help you today?",
      hi: "नमस्ते! मैं आपका शिक्षा सहायक हूं। मैं आपको पाठ्यक्रम खोजने, प्रश्नों के उत्तर देने और आपकी शिक्षा यात्रा में सहायता कर सकता हूं। मैं आज आपकी कैसे मदद कर सकता हूं?",
      fr: "Bonjour ! Je suis votre assistant d'apprentissage. Je peux vous aider à trouver des cours, répondre aux questions et soutenir votre parcours d'apprentissage. Comment puis-je vous aider aujourd'hui ?"
    };
    return msgs[lang];
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const sentiment = analyzeSentiment(inputText);

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      language: currentLanguage,
      sentiment
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(async () => {
      const botResponse = await generateResponse(inputText, sentiment, currentLanguage);

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        language: currentLanguage,
        sentiment: 'neutral'
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'happy':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'sad':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-xl hover:scale-110 transition-all ${
          isOpen ? 'hidden' : 'block'
        }`}
      >
        <MessageCircle className="h-8 w-8" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between">
            <div>
              <h3 className="font-semibold">EduMaster Assistant</h3>
              <p className="text-sm">{getLanguageName(currentLanguage)} • Online</p>
            </div>

            <div className="flex gap-2">
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className="bg-white dark:bg-slate-900/20 text-white rounded px-2"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="hi">🇮🇳 HI</option>
                <option value="fr">🇫🇷 FR</option>
              </select>

              <button onClick={() => setIsOpen(false)}>
                <X />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl max-w-[80%] ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white dark:bg-slate-900 border'
                }`}>
                  <p>{msg.text}</p>
                  <div className="flex justify-between text-xs mt-1">
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {getSentimentIcon(msg.sentiment)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && <p className="text-sm text-gray-400">Typing...</p>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t flex gap-2">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className="bg-blue-600 text-white px-4 rounded"
            >
              <Send />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
