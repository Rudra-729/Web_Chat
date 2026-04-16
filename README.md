npm# 🚀 ReactChat - Real-Time Chat Application

A modern, fully-featured real-time chat application built with React, Firebase, and Vite.

**Live Demo:** https://webchatxo.netlify.app/

---

## ✨ Features

### ✨ AI Integration
- 🤖 **AI Assistant** - Integrated with Gemini 1.5 Flash API for context-aware conversations
- ⚡ **Auto-Provisioned Bots** - Every user automatically has an AI chat companion

### 🔐 Authentication
- 🔐 **Email/Password & Google OAuth** - Flexible sign-in options via Firebase Auth
- ✅ **Unique Username Validation** - Prevents duplicate usernames across the platform

### 💬 Chat Functionality
- 💬 **Real-Time Messaging** - Instant message delivery with Firestore
- 🖼️ **Image Sharing** - Upload and share images through Cloudinary CDN
- 🧹 **Clear Chat** - Easily clear your message history for any specific conversation
- 😊 **Emoji Support** - Add emojis to your messages with emoji-picker-react
- ⏰ **Message Timestamps** - Relative timestamps utilizing timeago.js
- 🔍 **User Search & Blocking** - Search for users, start conversations, or block them

### 🎨 User Interface
- 🌗 **Light/Dark Themes** - Professional and sleek design with dynamic theme switching
- 📱 **Mobile Optimized** - Full responsiveness, touch-based navigation, and accessible panels (e.g., tap profile for details)
- 🎨 **Glassmorphism Aesthetics** - Modern blur glass effects and smooth micro-animations
- 💾 **Rich Profiles** - Display and manage user information with uploaded avatars

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - Modern UI library
- **Vite 5.2.7** - Lightning-fast build tool
- **Zustand** - Lightweight state management

### Backend & Services
- **Firebase 9+**
  - Authentication, Firestore Database, and real-time syncing
- **Google AI** - Integration with the Gemini 1.5 Flash API

### APIs & Libraries
- **Cloudinary** - Cloud image storage and CDN
- **Axios** - HTTP client for API requests
- **React Toastify** - Toast notifications
- **emoji-picker-react** - Emoji selection component
- **timeago.js** - Relative time formatting
- **@google/genai** - Intelligent conversational API integration

---

## 📋 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Git
- Cloudinary account (free tier available)
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/react-firebase-chat.git
   cd react-firebase-chat-completed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_API_KEY=your_firebase_api_key
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

   Find these values:
   - **Firebase API Key**: Firebase Console → Project Settings → Web App Config
   - **Cloudinary Details**: Cloudinary Dashboard → Settings → API Keys
   - **Gemini API Key**: Google Cloud Console or Google AI Studio

4. **Start development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser

---

## 🔧 Configuration

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable these authentication methods:
   - Email/Password
   - Google OAuth
4. Create a Firestore Database in production mode
5. Add your authorized domains to Authentication → Settings
6. Update Firestore Security Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection
       match /users/{userId} {
         allow create: if request.auth == null;
         allow read, update, delete: if request.auth != null && request.auth.uid == userId;
       }
       
       // UserChats collection
       match /userchats/{userId} {
         allow create: if request.auth == null;
         allow read, update, delete: if request.auth != null && request.auth.uid == userId;
       }
       
       // Chats collection
       match /chats/{chatId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### Cloudinary Setup
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard → Settings → Upload
3. Create an unsigned upload preset
4. Copy your Cloud Name from the Dashboard
5. Add to `.env.local`

---

## 📁 Project Structure

```
src/
├── components/
│   ├── chat/           # Chat interface component
│   ├── detail/         # User detail panel
│   ├── list/           # Chat list & user search
│   ├── login/          # Authentication forms
│   └── notification/   # Toast notifications
├── lib/
│   ├── firebase.js     # Firebase configuration
│   ├── upload.js       # Cloudinary upload handler
│   ├── chatStore.js    # Chat state (Zustand)
│   └── userStore.js    # User state (Zustand)
├── App.jsx             # Main application component
├── main.jsx            # React DOM entry point
└── index.css           # Global styles
```

---

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## 🎯 Key Features Explained

### Message Race Condition Fix
The app handles a race condition where `onAuthStateChanged` fires before Firestore documents are created. Fixed by manually calling `fetchUserInfo()` after document writes.

### CSS SCSS to Standard CSS
All component styles use standard CSS selectors (no SCSS nesting) for compatibility with Vite's CSS processing.

### Secure Image Uploads
Images bypass Firebase Storage and go directly to Cloudinary using unsigned upload presets with auto-folder organization.

### Real-Time Sync
Messages and user data sync instantly using Firestore's real-time listeners, providing seamless multi-user chat experience.

---

## 🐛 Known Issues & Solutions

**Issue:** Permission denied on Firestore reads
- **Solution:** Ensure security rules are published and user is authenticated before reading

**Issue:** Images not uploading
- **Solution:** Verify Cloudinary credentials in `.env.local` and upload preset exists

**Issue:** Chat doesn't load after signup
- **Solution:** Check browser console for Firestore permission errors; rules might need republishing

---

## 🚀 Deployment

### Deploy to Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard:
   - `VITE_API_KEY`
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Deploy!

**Live Demo:** https://webchatxo.netlify.app/

---

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues and questions:
1. Check the [Issues](https://github.com/yourusername/react-firebase-chat/issues) section
2. Review Firestore rules and security settings
3. Verify `.env.local` configuration

---

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com) - Backend infrastructure
- [Cloudinary](https://cloudinary.com) - Image hosting
- [React](https://react.dev) - UI library
- [Vite](https://vitejs.dev) - Build tool
- Community for libraries and support

---

**Made with ❤️ by Rudra Shekhar**
