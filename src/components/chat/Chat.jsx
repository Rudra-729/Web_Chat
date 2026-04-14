import { useEffect, useRef, useState, useCallback } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  setDoc,
  collection,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";
import CallOverlay from "../call/CallOverlay";
import { toast } from "react-toastify";
import { BOT_ID, getSmartReply, BOT_TYPING_DELAY } from "../../lib/botConfig";

const Chat = () => {
  const [chat, setChat] = useState(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });
  const [sending, setSending] = useState(false);
  const [botTyping, setBotTyping] = useState(false);

  // Icon states
  const [callType, setCallType] = useState(null); // null | 'voice' | 'video'
  const [moreOpen, setMoreOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Camera capture
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const cameraVideoRef = useRef(null);
  const canvasRef = useRef(null);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, isMuted, changeMute, setMobilePanel } =
    useChatStore();

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const moreRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // Real-time receiver block tracking
  useEffect(() => {
    if (!user?.id || user.id === BOT_ID) return;
    const unSub = onSnapshot(doc(db, "users", user.id), (res) => {
      const freshUser = res.data();
      if (!freshUser) return;
      const amIBlocked = freshUser.blocked.includes(currentUser.id);
      if (amIBlocked !== isCurrentUserBlocked) {
        useChatStore.setState({ isCurrentUserBlocked: amIBlocked });
      }
    });
    return () => unSub();
  }, [user?.id, currentUser.id, isCurrentUserBlocked]);

  useEffect(() => {
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) =>
      setChat(res.data())
    );
    return () => { unSub(); };
  }, [chatId]);

  // Close emoji / more-menu on outside click
  useEffect(() => {
    const handle = (e) => {
      if (emojiOpen && !e.target.closest(".emojiPickerWrapper") && !e.target.closest(".emojiToggle"))
        setEmojiOpen(false);
      if (moreOpen && !e.target.closest(".moreMenu") && !e.target.closest(".moreBtn"))
        setMoreOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [emojiOpen, moreOpen]);

  // Camera stream lifecycle
  useEffect(() => {
    if (!cameraOpen) {
      cameraStream?.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
      setCameraError("");
      return;
    }
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((stream) => {
        setCameraStream(stream);
        if (cameraVideoRef.current) cameraVideoRef.current.srcObject = stream;
      })
      .catch(() => {
        setCameraError("Camera access denied or unavailable.");
      });
  }, [cameraOpen]); // eslint-disable-line

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    inputRef.current?.focus();
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({ file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const cancelImg = () => {
    setImg({ file: null, url: "" });
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSend = useCallback(async () => {
    if (text.trim() === "" && !img.file) return;
    if (sending) return;
    setSending(true);

    // ── Step 1: Upload image (isolated — upload.js shows its own error toast) ──
    let imgUrl = null;
    if (img.file) {
      try {
        imgUrl = await upload(img.file);
      } catch {
        // upload.js already showed an error toast.
        // If the user only had an image (no text), abort here.
        if (!text.trim()) {
          setImg({ file: null, url: "" });
          if (fileRef.current) fileRef.current.value = "";
          setSending(false);
          return;
        }
        // Otherwise continue — send text-only without the image.
      }
    }

    // ── Step 2: Write the message to Firestore ──
    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: text.trim(),
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      // ── Step 3: Update lastMessage in userchats (non-critical, silent fail) ──
      const lastMsg = text.trim() || "📷 Photo";
      const ts = Date.now();
      const userIDs = [currentUser.id, user.id];
      Promise.all(userIDs.map(async (id) => {
        try {
          const ref = doc(db, "userchats", id);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            const idx = data.chats.findIndex((c) => c.chatId === chatId);
            if (idx >= 0) {
              data.chats[idx].lastMessage = lastMsg;
              data.chats[idx].isSeen = id === currentUser.id;
              data.chats[idx].updatedAt = ts;
              await updateDoc(ref, { chats: data.chats });
            }
          }
        } catch (e) {
          console.warn("userchats sync:", id, e.message);
        }
      }));

      // ── Bot auto-reply ──
      if (user?.id === BOT_ID) {
        const sentText = text.trim();
        setBotTyping(true);
        setTimeout(async () => {
          try {
            const reply = await getSmartReply(sentText || "[image]");
            if (reply) {
              await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                  senderId: BOT_ID,
                  text: reply,
                  createdAt: new Date(),
                }),
              });
              const ucRef = doc(db, "userchats", currentUser.id);
              const ucSnap = await getDoc(ucRef);
              if (ucSnap.exists()) {
                const data = ucSnap.data();
                const idx = data.chats.findIndex((c) => c.chatId === chatId);
                if (idx >= 0) {
                  data.chats[idx].lastMessage = reply.slice(0, 60);
                  data.chats[idx].isSeen = false;
                  data.chats[idx].updatedAt = Date.now();
                  await updateDoc(ucRef, { chats: data.chats });
                }
              }
            }
          } catch (e) {
            console.warn("Bot reply error:", e.message);
          } finally {
            setBotTyping(false);
          }
        }, BOT_TYPING_DELAY());
      }
    } catch (err) {
      // Only fires if the ACTUAL message write to Firestore fails
      console.error("Message send failed:", err);
      toast.error("Message could not be sent. Please try again.");
    } finally {
      setImg({ file: null, url: "" });
      setText("");
      setSending(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [text, img, sending, chatId, currentUser.id, user?.id]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === "Escape") { setEmojiOpen(false); setMoreOpen(false); }
  };

  // Camera: take photo & attach it
  const handleCapture = () => {
    if (!cameraVideoRef.current || !canvasRef.current) return;
    const video = cameraVideoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      setImg({ file, url: URL.createObjectURL(file) });
      setCameraOpen(false);
    }, "image/jpeg", 0.92);
  };

  const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

  // Collect shared images from chat
  const sharedImages = (chat?.messages || []).filter((m) => m.img).map((m) => m.img);

  // Filter messages by search
  const groupedMessages = [];
  let lastDate = null;
  const messages = chat?.messages || [];
  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  filteredMessages.forEach((msg) => {
    const msgDate = msg.createdAt?.toDate?.() || new Date(msg.createdAt);
    const dateStr = msgDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    if (dateStr !== lastDate) {
      groupedMessages.push({ type: "divider", date: dateStr });
      lastDate = dateStr;
    }
    groupedMessages.push({ type: "message", ...msg });
  });

  if (!chatId) {
    return (
      <div className="chat noChatSelected">
        <div className="emptyChat">
          <span className="emptyIcon">💬</span>
          <h3>Select a conversation</h3>
          <p>Choose an existing chat or start a new one with the + button.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat">
      {/* Call overlay */}
      {callType && (
        <CallOverlay
          user={user}
          type={callType}
          onHangUp={() => setCallType(null)}
        />
      )}

      {/* Camera capture modal */}
      {cameraOpen && (
        <div className="cameraModal">
          <div className="cameraOverlay" onClick={() => setCameraOpen(false)} />
          <div className="cameraContent">
            <div className="cameraHeader">
              <span>📷 Take a Photo</span>
              <button onClick={() => setCameraOpen(false)}>✕</button>
            </div>
            {cameraError ? (
              <div className="cameraError">{cameraError}</div>
            ) : (
              <video ref={cameraVideoRef} autoPlay playsInline className="cameraFeed" />
            )}
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div className="cameraActions">
              <button className="camCapture" onClick={handleCapture} disabled={!!cameraError || !cameraStream}>
                📸 Capture
              </button>
              <button className="camCancel" onClick={() => setCameraOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="top">
        {/* Back button (mobile only) */}
        <button
          className="backBtn"
          onClick={() => setMobilePanel("list")}
          title="Back"
        >
          ‹
        </button>

        <div className="user">
          <div className="avatarWrapper">
            <img src={isCurrentUserBlocked ? "./avatar.png" : (user?.avatar || "./avatar.png")} alt="" />
            <div className="onlineDot" />
          </div>
          <div className="texts">
            <span>{user?.username || "User"}</span>
            <p>● Active now</p>
          </div>
        </div>

        <div className="icons">
          {/* Search in chat */}
          {searchOpen && (
            <input
              className="chatSearchInput"
              type="text"
              placeholder="Search messages…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); } }}
            />
          )}

          <button
            className={`iconBtn ${searchOpen ? "active" : ""}`}
            title="Search"
            onClick={() => { setSearchOpen((p) => !p); if (searchOpen) setSearchQuery(""); }}
          >
            🔍
          </button>
          <button
            className="iconBtn"
            title="Voice call"
            onClick={() => setCallType("voice")}
          >
            📞
          </button>
          <button
            className="iconBtn"
            title="Video call"
            onClick={() => setCallType("video")}
          >
            📹
          </button>

          {/* More options */}
          <div style={{ position: "relative" }}>
            <button
              ref={moreRef}
              className={`iconBtn moreBtn ${moreOpen ? "active" : ""}`}
              title="More options"
              onClick={() => setMoreOpen((p) => !p)}
            >
              ⋯
            </button>

            {moreOpen && (
              <div className="moreMenu">
                <button
                  className="moreItem"
                  onClick={() => {
                    setSearchOpen(true);
                    setMoreOpen(false);
                    inputRef.current?.focus();
                  }}
                >
                  <span>🔍</span> Search in Chat
                </button>
                <button
                  className="moreItem"
                  onClick={() => {
                    toast.info("📸 Shared photos: " + (sharedImages.length || 0) + " media items");
                    setMoreOpen(false);
                  }}
                >
                  <span>🖼️</span> View Shared Media ({sharedImages.length})
                </button>
                <button
                  className="moreItem"
                  onClick={() => {
                    changeMute();
                    toast.info(isMuted ? "🔔 Notifications unmuted" : "🔕 Conversation muted");
                    setMoreOpen(false);
                  }}
                >
                  <span>{isMuted ? "🔔" : "🔕"}</span> {isMuted ? "Unmute Conversation" : "Mute Conversation"}
                </button>
                <div className="moreMenuDivider" />
                <button
                  className="moreItem danger"
                  onClick={() => {
                    toast.warn("Clear chat coming soon.");
                    setMoreOpen(false);
                  }}
                >
                  <span>🗑️</span> Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search result notice */}
      {searchQuery && (
        <div className="searchBanner">
          {filteredMessages.length} result{filteredMessages.length !== 1 ? "s" : ""} for "{searchQuery}"
          <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }}>✕ Clear</button>
        </div>
      )}

      {/* Messages */}
      <div className="center">
        {/* Bot typing indicator */}
        {botTyping && user?.id === BOT_ID && (
          <div className="message botTypingRow">
            <img className="avatarMsg" src="/bot-avatar.png" alt="" />
            <div className="messageContent">
              <div className="texts">
                <div className="typingBubble">
                  <span /><span /><span />
                </div>
                <div className="msgMeta">
                  <span className="time">typing…</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {groupedMessages.map((item, idx) => {
          if (item.type === "divider") {
            return (
              <div className="dateDivider" key={`d-${idx}`}>
                <span>{item.date}</span>
              </div>
            );
          }

          const isOwn = item.senderId === currentUser?.id;
          const msgTime = item.createdAt?.toDate?.() || new Date(item.createdAt);

          return (
            <div className={`message ${isOwn ? "own" : ""}`} key={idx}>
              {!isOwn && (
                <img className="avatarMsg" src={isCurrentUserBlocked ? "./avatar.png" : (user?.avatar || "./avatar.png")} alt="" />
              )}
              <div className="messageContent">
                <div className="texts">
                  {item.img && (
                    <img
                      className="msgImg"
                      src={item.img}
                      alt=""
                      onClick={() => window.open(item.img, "_blank")}
                    />
                  )}
                  {item.text && <p>{item.text}</p>}
                  <div className="msgMeta">
                    <span className="time">{format(msgTime)}</span>
                    {isOwn && <span className="readStatus">✓✓</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {img.url && (
          <div className="pendingImg">
            <img src={img.url} alt="pending" />
            <button className="cancelImg" onClick={cancelImg}>✕</button>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div className="bottom">
        {/* Emoji picker (rendered above bottom bar) */}
        {emojiOpen && (
          <div className="emojiPickerWrapper">
            <EmojiPicker
              onEmojiClick={handleEmoji}
              theme="dark"
              skinTonesDisabled
              height={360}
              width={320}
            />
          </div>
        )}

        <div className="inputIcons">
          {/* Attach image */}
          <button
            className="iconBtn"
            title="Attach image"
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            📎
          </button>
          <input
            type="file"
            ref={fileRef}
            style={{ display: "none" }}
            onChange={handleImg}
            accept="image/*"
          />

          {/* Camera capture */}
          <button
            className="iconBtn"
            title="Take photo"
            type="button"
            onClick={() => setCameraOpen(true)}
          >
            📷
          </button>
        </div>

        <div className="inputWrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder={isBlocked ? "You cannot send messages here" : "Type a message…"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isBlocked}
          />
          <button
            className="emojiToggle"
            onClick={() => setEmojiOpen((p) => !p)}
            type="button"
            disabled={isBlocked}
          >
            😊
          </button>
        </div>

        <button
          className="sendBtn"
          onClick={handleSend}
          disabled={isBlocked || (text.trim() === "" && !img.file) || sending}
          title="Send (Enter)"
        >
          {sending ? "⏳" : "➤"}
        </button>
      </div>
    </div>
  );
};

export default Chat;
