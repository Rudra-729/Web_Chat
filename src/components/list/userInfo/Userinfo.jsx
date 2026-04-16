import { useState } from "react";
import "./userInfo.css";
import { useUserStore } from "../../../lib/userStore";
import { auth } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { useThemeStore } from "../../../lib/themeStore";
import Settings from "./Settings";

const Userinfo = () => {
  const { currentUser } = useUserStore();
  const { resetChat } = useChatStore();
  const { theme, toggleTheme } = useThemeStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut();
    resetChat();
  };

  return (
    <>
      <div className="userInfo">
        <div className="user">
          <div className="avatarWrapper">
            <img src={currentUser.avatar || "./avatar.png"} alt="" />
            <div className="onlineDot" />
          </div>
          <div className="userTexts">
            <h2>{currentUser.username}</h2>
            <span>● Online</span>
          </div>
        </div>
        <div className="icons">
          <button
            className="iconBtn themeToggle"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            className="iconBtn"
            title="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            ⚙️
          </button>
          <button className="iconBtn" title="Sign Out" onClick={handleLogout}>
            🚪
          </button>
        </div>
      </div>

      {settingsOpen && (
        <Settings onClose={() => setSettingsOpen(false)} />
      )}
    </>
  );
};

export default Userinfo;