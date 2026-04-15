import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/chat';

// Fetch eligible teachers (for students to start a chat)
const getTeachers = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const response = await axios.get(`${API_URL}/teachers`, {
        headers: {
            Authorization: `Bearer ${userInfo.token}`,
        },
    });
    return response.data;
};

// Fetch all conversations for the sidebar
const getConversations = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const response = await axios.get(`${API_URL}/conversations`, {
        headers: {
            Authorization: `Bearer ${userInfo.token}`,
        },
    });
    return response.data;
};

// Fetch messages for a specific conversation
const getMessages = async (conversationId) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const response = await axios.get(`${API_URL}/messages/${conversationId}`, {
        headers: {
            Authorization: `Bearer ${userInfo.token}`,
        },
    });
    return response.data;
};

// Send a new message
const sendMessage = async (messageData) => {
    // messageData: { receiverId, courseId, text, file }
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    let payload = messageData;
    let headers = {
        Authorization: `Bearer ${userInfo.token}`,
    };

    if (messageData.file) {
        payload = new FormData();
        payload.append('receiverId', messageData.receiverId);
        payload.append('courseId', messageData.courseId);
        payload.append('text', messageData.text || "");
        payload.append('file', messageData.file);
    }

    const response = await axios.post(`${API_URL}/messages`, payload, {
        headers,
    });
    return response.data;
};

const deleteMessage = async (messageId) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const response = await axios.delete(`${API_URL}/messages/${messageId}`, {
        headers: {
            Authorization: `Bearer ${userInfo.token}`,
        },
    });
    return response.data;
};

const chatService = {
    getTeachers,
    getConversations,
    getMessages,
    sendMessage,
    deleteMessage,
};

export default chatService;
