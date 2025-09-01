import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';


const token = await SecureStore.getItemAsync('userToken');

const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Retrieve the token from SecureStore
                if (!token) {
                    throw new Error('No token found');
                }

                // Make the HTTP request with authorization header
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setData(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, setData, loading, error };
};

export default useFetch;
