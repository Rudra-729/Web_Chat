# WebChat

A modern, real-time web-based messaging application built with React, Vite, and Firebase. This project demonstrates real-time state synchronization, secure authentication, media management, and the integration of a generative AI assistant.

**Live Demo:** https://webchatxo.netlify.app/

---

## Features

### AI Integration
* **Conversational Agent:** Deep integration with the Gemini 1.5 Flash API for context-aware interactions.
* **Auto-Provisioned Bots:** Each registered user automatically receives a dedicated AI chat companion for immediate engagement.

### Authentication & Security
* **Multi-Provider Auth:** Support for traditional email/password registration and Google OAuth via Firebase Authentication.
* **Username Validation:** Global uniqueness checks for usernames to ensure distinct identifiability.
* **Access Control:** Firebase Security Rules enforce row-level access, limiting reads and writes strictly to authenticated users and authorized chat participants.

### Messaging & Communication
* **Real-Time Data Sync:** Instantaneous message delivery and state updates using Firestore's WebSocket connections.
* **Media Handling:** Direct-to-URL image uploads managed through the Cloudinary CDN.
* **Chat Management:** Granular controls to clear chat history, block/unblock specified users, and query active connections.
* **Rich Text Capabilities:** Full emoji support and dynamically rendered relative timestamps.

### User Interface & Experience
* **Theming System:** Robust CSS variables implementation supporting dynamic toggling between Light and Dark themes.
* **Responsive Layout:** Adaptive design with touch-friendly navigation components tailored for mobile and tablet usage.
* **Modern Aesthetics:** Implements glassmorphism UI patterns with smooth micro-interactions while maintaining high performance.

---

## Technologies

### Core
* React 18.2.0
* Vite 5.2.7
* Zustand (State Management)
* Vanilla CSS

### Backend & AI Services
* Firebase 9+ (Auth, Firestore)
* Cloudinary API (Media CDN)
* @google/genai (Gemini AI Integration)

### Utilities
* Axios (HTTP Client)
* React Toastify (Notifications)
* timeago.js (Time formatting)
* emoji-picker-react

---

## Getting Started

### Prerequisites
* Node.js v16 or higher
* npm or yarn
* Accounts for Firebase, Cloudinary, and Google AI Studio (or Google Cloud Platform)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rudra-729/Web_Chat.git
   cd Web_Chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the project directory root:
   ```env
   VITE_API_KEY="your_firebase_api_key"
   VITE_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
   VITE_CLOUDINARY_UPLOAD_PRESET="your_unsigned_upload_preset"
   VITE_GEMINI_API_KEY="your_gemini_api_key"
   ```

4. **Initialize Development Server**
   ```bash
   npm run dev
   ```

---

## Configuration Guidelines

### Firebase Configuration
1. Create a Firebase project and enable **Authentication** (Email/Password, Google).
2. Provision a **Firestore** database instance.
3. Update Firestore security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow create: if request.auth == null;
         allow read, update, delete: if request.auth != null && request.auth.uid == userId;
       }
       match /userchats/{userId} {
         allow create: if request.auth == null;
         allow read, update, delete: if request.auth != null && request.auth.uid == userId;
       }
       match /chats/{chatId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### Cloudinary Configuration
Ensure you have created an **unsigned upload preset** from the Cloudinary dashboard under Settings > Upload.

---

## Deployment

The application is optimized for static hosting platforms like Netlify or Vercel. Ensure client-side routing is supported by provisioning a `_redirects` file (for Netlify) or configuring equivalent rewrite rules setting all paths to index.html.

To build the production assets locally:
```bash
npm run build
```

---

## License

This project is open-source and available under the terms of the MIT License.
