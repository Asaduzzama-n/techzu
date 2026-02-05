import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from '../lib/api/client';

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'web') return;

    // remote push notifications are not supported in Expo Go SDK 53+
    if (Constants.executionEnvironment === 'storeClient') {
        console.log('Skipping push notification registration: Remote notifications are not supported in Expo Go. Use a development build for this feature.');
        return;
    }

    // Dynamic import to avoid crash on Expo Go SDK 54+ evaluation
    const Notifications = await import('expo-notifications');

    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        // Project ID is required for Expo Go or EAS builds
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.owner;

        try {
            // Get the native device push token (FCM on Android, APNs on iOS)
            const deviceToken = (await Notifications.getDevicePushTokenAsync()).data;
            console.log('Device FCM Token:', deviceToken);
            token = deviceToken;

            // Save token to profile
            await api.patch('/user/profile', { fcmToken: token });
        } catch (err) {
            console.error('Push Notification logic error:', err);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
