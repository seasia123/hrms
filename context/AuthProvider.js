import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { Platform } from "react-native";

const AuthContext = createContext();
export const useAuthContext = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('user_token');
        const userId = await SecureStore.getItemAsync('user_id');
        // console.log("loadUser=>", "Token:", token, "| user_id:", userId);
        if (token) {
          const user = await fetchCurrentUser(token, userId);
          if (user.name) {
            setIsLogged(true);
            setUser(user);
          } else {
            setIsLogged(false);
            setUser(null);
          }
        } else {
          setIsLogged(false);
          setUser(null);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (MobileNo, Password, deviceToken) => {
    try {
      const token = await authenticate(MobileNo, Password, deviceToken);
      const data = token.data;

      if (data.token && data.user_id) {
        await SecureStore.setItemAsync('user_token', `Bearer ${data.token}`);
        await SecureStore.setItemAsync('user_id', JSON.stringify(data.user_id));
        const user = await fetchCurrentUser(`Bearer ${data?.token}`, data.user_id);
        setIsLogged(true);
        setUser(user);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    const token = await SecureStore.getItemAsync('user_token');
    const userId = await SecureStore.getItemAsync('user_id');
    try {
      const formData = new FormData();
      formData.append('user_id', userId);

      const response = await fetch(`${apiUrl}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to Logout');
      }

    } catch (error) {
      console.log(error);
      return null;
    } finally {

      await SecureStore.deleteItemAsync('user_token');
      await SecureStore.deleteItemAsync('user_id');
      await SecureStore.deleteItemAsync('expoPushToken');

      setIsLogged(false);
      setUser(null);
    }
    // await SecureStore.deleteItemAsync('user_token');
    // await SecureStore.deleteItemAsync('user_id');
    // await SecureStore.deleteItemAsync('expoPushToken');

    // setIsLogged(false);
    // setUser(null);
  };


  //validate stored token & send expoPushToken from async store
  const fetchCurrentUser = async (token, id) => {
    const expoPushToken = await SecureStore.getItemAsync('expoPushToken')
    const platform = Platform.OS;

    try {
      const formData = new FormData();
      formData.append('user_id', id);
      formData.append('deviceToken', expoPushToken || null);
      formData.append('platform', platform || null);

      const response = await fetch(`${apiUrl}/authcheck`, {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate');
      }

      const data = await response.json();
      return data.data;

    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const authenticate = async (email, password, deviceToken) => {
    const platform = Platform.OS;
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('deviceToken', deviceToken?.data || null);
      formData.append('platform', platform || null);
      // console.log(formData);

      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.log("API Request Error: ", error);
      throw error;
    }
  };


  return (
    <AuthContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
