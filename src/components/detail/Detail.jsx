import { useState } from "react";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";
import { toast } from "react-toastify";
import CallOverlay from "../call/CallOverlay";

const Detail = () => {
  const {
    chatId, user, isCurrentUserBlocked, isReceiverBlocked, isMuted,
    changeBlock, changeMute, resetChat, setMobilePanel,
  } = useChatStore();
  const { currentUser } = useUserStore();

  const [sections, setSections] = useState({ photos: false, settings: false });
  const [callType, setCallType] = useState(null); // null | 'voice' | 'video'

  const toggleSection = (key) =>
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
      toast.error("Failed to update block status.");
    }
  };

  const handleLogout = () => {
    auth.signOut();
    resetChat();
    toast.info("Signed out. See you soon! 👋");
  };

  const handleMute = () => {
    changeMute();
    toast.info(isMuted ? "🔔 Notifications unmuted" : "🔕 Conversation muted");
  };

  if (!user) {
    return (
      <div className="detail emptyDetail">
        <span className="emptyDetailIcon">👤</span>
        <p>Select a conversation to see details</p>
      </div>
    );
  }

  return (
    <div className="detail">
      {/* Call overlay */}
      {callType && (
        <CallOverlay user={user} type={callType} onHangUp={() => setCallType(null)} />
      )}

      {/* Back button (mobile — from detail to chat) */}
      <div className="detailMobileBack">
        <button onClick={() => setMobilePanel("chat")}>‹ Back</button>
      </div>

      {/* Profile section */}
      <div className="profileSection">
        <div className="avatarLarge">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="onlineDot" />
        </div>
        <h2>{user?.username}</h2>
        <div className="statusBadge">
          <span>●</span>
          <span>Active now</span>
        </div>
        <div className="quickActions">
          <button className="actionBtn" title="Voice call" onClick={() => setCallType("voice")}>
            📞<span>Call</span>
          </button>
          <button className="actionBtn" title="Video call" onClick={() => setCallType("video")}>
            📹<span>Video</span>
          </button>
          <button
            className={`actionBtn ${isMuted ? "mutedActive" : ""}`}
            title={isMuted ? "Unmute" : "Mute"}
            onClick={handleMute}
          >
            {isMuted ? "🔕" : "🔔"}<span>{isMuted ? "Unmute" : "Mute"}</span>
          </button>
        </div>
      </div>

      {/* Info body */}
      <div className="infoBody">
        {/* Shared photos from actual messages */}
        <div className="infoSection">
          <div className="sectionHeader" onClick={() => toggleSection("photos")}>
            <div className="sectionTitle">
              <span className="sectionIcon">🖼️</span>
              Shared Photos
            </div>
            <span className={`chevron ${sections.photos ? "open" : ""}`}>▼</span>
          </div>
          {sections.photos && (
            <div className="sectionContent">
              <SharedPhotos chatId={chatId} />
            </div>
          )}
        </div>

        {/* Chat settings */}
        <div className="infoSection">
          <div className="sectionHeader" onClick={() => toggleSection("settings")}>
            <div className="sectionTitle">
              <span className="sectionIcon">⚙️</span>
              Chat Settings
            </div>
            <span className={`chevron ${sections.settings ? "open" : ""}`}>▼</span>
          </div>
          {sections.settings && (
            <div className="sectionContent">
              <div className="settingRow">
                <span>🔔 Notifications</span>
                <button
                  className={`miniToggle ${isMuted ? "" : "on"}`}
                  onClick={handleMute}
                >
                  {isMuted ? "Off" : "On"}
                </button>
              </div>
              <div className="settingRow">
                <span>🎨 Chat Theme</span>
                <span className="settingValue">Default</span>
              </div>
              <div className="settingRow">
                <span>📌 Pinned Messages</span>
                <span className="settingValue">None</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="actionButtons">
        <button className="blockBtn" onClick={handleBlock}>
          {isCurrentUserBlocked ? (
            <><span>🚫</span> You are Blocked</>
          ) : isReceiverBlocked ? (
            <><span>✅</span> Unblock User</>
          ) : (
            <><span>🚫</span> Block User</>
          )}
        </button>
        <button className="logoutBtn" onClick={handleLogout}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  );
};

// Sub-component: loads real shared images from Firestore chat
import { useEffect } from "react";
import { onSnapshot } from "firebase/firestore";

const SharedPhotos = ({ chatId }) => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (snap) => {
      const msgs = snap.data()?.messages || [];
      setPhotos(msgs.filter((m) => m.img).map((m) => m.img).reverse());
    });
    return () => unSub();
  }, [chatId]);

  if (photos.length === 0) {
    return <p className="noPhotos">No shared photos yet.</p>;
  }

  return (
    <div className="photoGrid">
      {photos.slice(0, 9).map((src, i) => (
        <div
          key={i}
          className="photoItem"
          onClick={() => window.open(src, "_blank")}
        >
          <img src={src} alt="" />
        </div>
      ))}
      {photos.length > 9 && (
        <div className="morePhotos">+{photos.length - 9} more</div>
      )}
    </div>
  );
};

export default Detail;
