import { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { format } from "timeago.js";
import { BOT_ID, BOT_PROFILE } from "../../../lib/botConfig";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data()?.chats || [];
        console.log("ChatList onSnapshot items:", items);
        
        const promises = items.map(async (item) => {
          // Skip Firestore for the bot — use local profile directly.
          // This prevents the chat from disappearing if Firestore rules
          // block reads on the bot's user document.
          if (item.receiverId === BOT_ID) {
            return { ...item, user: { ...BOT_PROFILE } };
          }

          try {
            const userDocRef = doc(db, "users", item.receiverId);
            const userDocSnap = await getDoc(userDocRef);
            const user = userDocSnap.exists() ? userDocSnap.data() : null;
            return { ...item, user };
          } catch {
            // Permission error or network issue — return entry without user data
            return { ...item, user: null };
          }
        });

        const chatData = await Promise.all(promises);
        console.log("ChatList chatData resolved:", chatData);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      },
      (error) => {
        console.error("ChatList onSnapshot ERROR:", error);
      }
    );
    return () => { unSub(); };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    // Always open the chat immediately — don't wait for isSeen update
    changeChat(chat.chatId, chat.user);

    // Mark as seen using FRESH Firestore data (never local stale state)
    try {
      const userChatsRef = doc(db, "userchats", currentUser.id);
      const snap = await getDoc(userChatsRef);
      if (snap.exists()) {
        const freshChats = [...(snap.data().chats || [])];
        const idx = freshChats.findIndex((c) => c.chatId === chat.chatId);
        if (idx >= 0 && !freshChats[idx].isSeen) {
          freshChats[idx] = { ...freshChats[idx], isSeen: true };
          await updateDoc(userChatsRef, { chats: freshChats });
        }
      }
    } catch (err) {
      // Non-critical — just log, the chat is already open
      console.warn("isSeen update failed:", err.message);
    }
  };

  const filteredChats = chats.filter((c) => {
    // Guard: if user data is null (failed to load), always show the entry
    if (!c.user) return true;
    const name = c.user.username?.toLowerCase() ?? "";
    return name.includes(input.toLowerCase());
  });

  return (
    <div className="chatList">
      <div className="listHeader">
        <h3>Messages</h3>
        <div className="search">
          <div className="searchBar">
            <span className="searchIcon">🔍</span>
            <input
              type="text"
              placeholder="Search conversations..."
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </div>
          <button
            className="addBtn"
            onClick={() => setAddMode((prev) => !prev)}
            title={addMode ? "Close" : "New chat"}
          >
            {addMode ? "✕" : "+"}
          </button>
        </div>
      </div>

      <div className="chatsContainer">
        {filteredChats.length === 0 ? (
          <div className="emptyState">
            <span className="emptyIcon">💬</span>
            <p>{input ? "No chats match your search." : "No conversations yet.\nClick + to start chatting!"}</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isBot = chat.user?.id === BOT_ID;
            const isBlocked = chat.user?.blocked?.includes(currentUser.id);

            return (
              <div
                className={`item ${chatId === chat.chatId ? "active" : ""} ${!chat.isSeen ? "unread" : ""} ${isBot ? "botItem" : ""}`}
                key={chat.chatId}
                onClick={() => handleSelect(chat)}
              >
                <div className="avatarWrapper">
                  <img
                    src={isBlocked ? "./avatar.png" : chat.user?.avatar || "./avatar.png"}
                    alt=""
                  />
                  {/* Bot gets a special AI badge instead of online dot */}
                  {isBot ? (
                    <div className="botBadge" title="AI Assistant">🤖</div>
                  ) : (
                    <div className="onlineDot" />
                  )}
                </div>
                <div className="texts">
                  <div className="nameRow">
                    <span>
                      {isBlocked ? "User" : chat.user?.username}
                      {isBot && <span className="aiBadge"> AI</span>}
                    </span>
                    <span className="time">
                      {chat.updatedAt ? format(chat.updatedAt) : ""}
                    </span>
                  </div>
                  <p className="lastMsg">
                    {chat.lastMessage || "Start a conversation..."}
                  </p>
                </div>
                {!chat.isSeen && <div className="unreadBadge">1</div>}
              </div>
            );
          })
        )}
      </div>

      {addMode && <AddUser onClose={() => setAddMode(false)} />}
    </div>
  );
};

export default ChatList;
