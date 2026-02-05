import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:5000/api/v1'; // Use localhost with 'adb reverse' for USB debugging

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 seconds timeout
});

api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.log('[API Request Error]', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        let message = error.response?.data?.message || error.message;

        if (error.code === 'ECONNABORTED') {
            message = 'Request timed out using local IP. Please check your network connection and server status.';
        } else if (error.message.includes('Network Error')) {
            message = 'Network Error. Ensure your phone is on the same Wi-Fi as your PC and port 5000 is open.';
        }

        console.log(`[API Response Error] ${error.code || error.response?.status} ${error.config?.url}`, message);

        // Return a custom error object or modify the error message for the UI to display
        const customError = {
            ...error,
            response: {
                ...error.response,
                data: {
                    ...(error.response?.data || {}),
                    message: message
                }
            }
        };
        return Promise.reject(customError);
    }
);

export default api;
