import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Log full error details for debugging
            console.error("API Error Response:", {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });

            if (error.response.status === 401) {
                // Token invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                // Optional: Redirect to login
                // window.location.href = '/login'; 
            }
        } else if (error.request) {
            console.error("API No Response:", error.request);
        } else {
            console.error("API Request Setup Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
