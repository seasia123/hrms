import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorText = 'Something went wrong! Please try again later.';
        try {
            const errorData = await response.json();
            errorText = errorData?.data?.error || JSON.stringify(errorData);
        } catch {
            errorText = 'Something went wrong! Please try again later.';
            // errorText = await response.text();
        }
        throw new Error(errorText);
    }
    return response;
};

const Http = {
    get: async (url, config = {}) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await fetch(BASE_URL + url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                    ...config.headers,
                },
                ...config,
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    delete: async (url, config = {}) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await fetch(BASE_URL + url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                    ...config.headers,
                },
                ...config,
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    put: async (url, payload = {}, config = {}) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await fetch(BASE_URL + url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                    ...config.headers,
                },
                body: JSON.stringify(payload),
                ...config,
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    post: async (url, payload = {}, config = {}) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await fetch(BASE_URL + url, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    ...config.headers,
                },
                body: payload,
                ...config,
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },
};

export default Http;
