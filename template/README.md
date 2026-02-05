# Techzu - Backend Server 🚀

A robust Express.js (TypeScript) backend server for the Techzu On-Campus Car Rental platform.

## 🌟 Features

- **🔐 Enterprise Authentication**: Secure JWT-based auth with refresh token rotation and brute-force protection.
- **📱 Push Notifications**: Full integration with Firebase Cloud Messaging (FCM) to send notifications to mobile clients.
- **🔔 Notification Management**: Dedicated module for creating and history-tracking of in-app and push notifications.
- **🛡️ Security**: Rate limiting, security headers, and sanitized inputs.
- **📂 File Storage**: AWS S3 and Cloudinary support for vehicle images and user profiles.

## 📋 Prerequisites

- Node.js (>=18.x)
- MongoDB
- Firebase Project (for FCM)

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in the required fields:
   - `DATABASE_URL`: Your MongoDB connection string.
   - `FIREBASE_SERVICE_ACCOUNT_BASE64`: Your Firebase Admin service account JSON (base64 encoded).
   - `JWT_SECRET`: A strong secret for token signing.

3. **Database Seeding** (Optional):
   ```bash
   npm run seed:admin
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🧪 API Modules

- `/auth`: Login, Signup, OTP Verification, Social Login.
- `/user`: Profile management and FCM token synchronization.
- `/posts`: Feed and content management.
- `/notifications`: Notification history and delivery.

---
Made with ❤️ by Techzu Team