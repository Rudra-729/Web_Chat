import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";
import { BOT_ID, BOT_PROFILE } from "./botConfig";

/**
 * Ensures the WebChat AI bot chat exists for the given user.
 * Called once per login. Safe to call multiple times — duplicate-guards prevent re-creation.
 */
async function ensureBotChat(userId) {
  try {
    // ── 1. Try to ensure bot user doc (non-critical — Firestore rules may block this) ──
    // The ChatList uses local BOT_PROFILE for bot display, so this step is optional.
    try {
      const botUserRef = doc(db, "users", BOT_ID);
      const botSnap = await getDoc(botUserRef);
      if (!botSnap.exists()) {
        await setDoc(botUserRef, BOT_PROFILE);
      }
    } catch {
      // Firestore rules may prevent writing to bot's user doc — that's OK, continue
    }

    // ── 2. Check if user already has a bot chat ──
    const userChatsRef = doc(db, "userchats", userId);
    const userChatsSnap = await getDoc(userChatsRef);

    if (userChatsSnap.exists()) {
      const existing = userChatsSnap.data().chats || [];
      const alreadyHasBot = existing.some((c) => c.receiverId === BOT_ID);
      if (alreadyHasBot) return; // Already set up — nothing to do
    }

    // ── 3. Create new chat document with welcome message ──
    const newChatRef = doc(collection(db, "chats")); // Static collection() — no dynamic import
    const welcomeText = `👋 Hey! I'm **WebChat AI**, your built-in assistant.\n\nHere's what I can help with:\n• 📎 Sending images\n• 📞 Voice & video calls\n• ⚙️ App features & settings\n\nJust send me a message! Type **help** to see everything I can do. 🤖`;

    await setDoc(newChatRef, {
      createdAt: serverTimestamp(),
      messages: [
        {
          senderId: BOT_ID,
          text: welcomeText,
          createdAt: new Date(),
        },
      ],
    });

    const ts = Date.now();

    // ── 4. Add bot entry to the USER's userchats (critical step) ──
    await setDoc(
      userChatsRef,
      {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "👋 Hey! I'm WebChat AI, your built-in assistant.",
          receiverId: BOT_ID,
          updatedAt: ts,
          isSeen: false,
        }),
      },
      { merge: true }
    );

    // ── 5. Add entry to bot's userchats (non-critical — rules may block this) ──
    try {
      await setDoc(
        doc(db, "userchats", BOT_ID),
        {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: userId,
            updatedAt: ts,
            isSeen: true,
          }),
        },
        { merge: true }
      );
    } catch {
      // Ignore — bot's userchats entry failing doesn't affect the user's experience
    }

    console.log("✅ WebChat AI bot chat created for", userId);
  } catch (err) {
    console.warn("⚠️ Bot chat setup failed:", err.message);
  }
}

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        set({ currentUser: userData, isLoading: false });

        // Provision bot chat in background (non-blocking)
        ensureBotChat(uid);
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.log(err);
      return set({ currentUser: null, isLoading: false });
    }
  },
}));
