# Techzu - On-Campus Car Rental & Control 🚗

Techzu is a comprehensive platform for on-campus car rental and remote vehicle control, featuring a mobile application for users and a robust backend for management.

## 🏗️ Project Structure

The project is divided into two main components:

- **[mobile/](./mobile)**: React Native (Expo) application for users to browse, book, and control vehicles.
- **[template/](./template)**: Express.js (TypeScript) backend server providing APIs, authentication, and push notification management.

## 🚀 Getting Started

To get the entire system up and running, follows the instructions in each project's directory:

### 1. Backend Setup
1. Navigate to the `template` directory.
2. Install dependencies: `npm install`.
3. Configure your `.env` file (see `template/README.md`).
4. Start the server: `npm run dev`.

### 2. Mobile App Setup
1. Navigate to the `mobile` directory.
2. Install dependencies: `npm install`.
3. Configure `google-services.json` for Firebase/Push Notifications.
4. Set up USB debugging (`adb reverse tcp:5000 tcp:5000`) if using a physical device without Wi-Fi.
5. Start the app: `npx expo run:android`.

## 📱 Features

- **Car Browsing**: View available vehicles on campus.
- **Remote Control**: Lock/Unlock and control vehicles directly from the app.
- **Push Notifications**: Receive real-time updates via Firebase Cloud Messaging (FCM).
- **Secure Authentication**: JWT-based login and signup flow.

---
Made with ❤️ by Techzu Team
# techzu
