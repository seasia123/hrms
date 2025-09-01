import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import Constants from "expo-constants";

export const useNotificationObserver = () => {

    useEffect(() => {
        let isMounted = true;

        function redirect(notification) {
            const id = notification.request.content.data?.id;
            if (id) {
                router.push(`${Constants.expoConfig?.scheme}://notification-details/${id}`);
            }
        }

        // Notifications.getLastNotificationResponseAsync()
        //     .then(response => {
        //         if (!isMounted || !response?.notification) {
        //             return;
        //         }
        //         redirect(response?.notification);
        //     });

        //Handle tap to redirect notification when app is in foreground/running state
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            redirect(response.notification);
        });

        return () => {
            isMounted = false;
            subscription.remove();
        };
    }, []);
}