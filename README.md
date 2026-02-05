# Techzu - Technical Assignment Task �

This repository contains a full-stack technical assignment consisting of a mobile application and a backend server. The project demonstrates core functionalities like user authentication, push notifications, and API integration.

## 🏗️ Project Structure

The repository is organized into two main parts:

- **[mobile/](./mobile)**: A React Native (Expo) mobile client featuring:
  - User Login & Signup flows.
  - Native Push Notification registration (FCM).
  - Global state management with Zustand.
  - Form validation with React Hook Form & Zod.
- **[template/](./template)**: A robust Express.js (TypeScript) backend providing:
  - Secure JWT authentication with refresh token logic.
  - Firebase Cloud Messaging (FCM) integration for push notifications.
  - Modular architecture for scalability.
  - Input validation and global error handling.

## 🚀 Getting Started

To set up the project locally, follow the specific instructions in each directory:

### 1. Backend Setup
1. Navigate to the `template` directory.
2. Install dependencies: `npm install`.
3. Set up your `.env` file based on `.example.env` (provide MongoDB and Firebase credentials).
4. Start the development server: `npm run dev`.

### 2. Mobile App Setup
1. Navigate to the `mobile` directory.
2. Install dependencies: `npm install`.
3. Configure `google-services.json` in the root of the `mobile` folder.
4. If debugging on a physical device without Wi-Fi, use USB port forwarding:
   ```bash
   adb reverse tcp:5000 tcp:5000
   ```
5. Build and run the app: `npx expo run:android --device`.

## �️ Key Features

- **End-to-End Authentication**: Full signup, email verify (OTP), and login flow.
- **Push Notification Sync**: Automatic FCM token retrieval and backend synchronization.
- **Robust API Client**: Configurable Axios client with interceptors for token handling.
- **USB Tunneling Support**: Pre-configured for seamless development over USB.

---
Made with ❤️ by Techzu Team
