# Techzu - Mobile App 📱

The mobile client for the Techzu platform, built with React Native and Expo.

## 🛠️ Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Networking**: Axios
- **Push Notifications**: Expo Notifications + Firebase (FCM)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js
- Expo Go (for development) or Development Build
- Android Studio / ADB (for physical device debugging)

### 2. Installation
```bash
npm install
```

### 3. Firebase Configuration
To enable Push Notifications:
1. Place your `google-services.json` in the project root.
2. Ensure `app.json` has the correct `package` name and `googleServicesFile` path.

### 4. Running the App
For physical devices without Wi-Fi (USB debugging):

1. **Port Forwarding**:
   ```bash
   adb reverse tcp:5000 tcp:5000
   ```
2. **Start the App**:
   ```bash
   npx expo run:android --device
   ```

## 📁 Structure

- `src/app`: File-based routing (Login, Signup, Tabs).
- `src/components`: Reusable UI components.
- `src/store`: Global state management.
- `src/utils`: Utility functions, including Push Notification registration.

## 🔑 Environment
Update `src/lib/api/client.ts` with your backend `API_URL`. Use `localhost` if using `adb reverse`.
