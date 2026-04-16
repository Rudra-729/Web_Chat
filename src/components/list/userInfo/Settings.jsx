import { useState } from "react";
import { createPortal } from "react-dom";
import "./Settings.css";
import { useUserStore } from "../../../lib/userStore";
import { auth } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { useThemeStore } from "../../../lib/themeStore";
import { toast } from "react-toastify";

const TABS = ["Profile", "Notifications", "Privacy", "Appearance"];

const Settings = ({ onClose }) => {
  const { currentUser } = useUserStore();
  const { resetChat } = useChatStore();
  const { theme, setTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState("Profile");

  // Appearance state
  const [settings, setSettings] = useState({
    messagePreview: true,
    soundEnabled: true,
    desktopNotifications: false,
    readReceipts: true,
    onlineStatus: true,
    typingIndicators: true,
    fontSize: "medium",
    colorTheme: "indigo",
    enterToSend: true,
    compactMode: false,
    lastSeen: "everyone",
    blockedCount: currentUser?.blocked?.length || 0,
  });

  const toggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => {
    auth.signOut();
    resetChat();
    toast.info("Signed out. See you soon! 👋");
  };

  const handleSave = () => {
    toast.success("Settings saved! ✓");
    onClose();
  };

  // Tab icons
  const tabIcons = {
    Profile: "👤",
    Notifications: "🔔",
    Privacy: "🔒",
    Appearance: "🎨",
  };

  return createPortal(
    <>
      <div className="settingsOverlay" onClick={onClose} />
      <div className="settingsModal">
        {/* Header */}
        <div className="settingsHeader">
          <div className="headerLeft">
            <div className="settingsIcon">⚙️</div>
            <h2>Settings</h2>
          </div>
          <button className="closeBtn" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="settingsTabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`sTab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              <span>{tabIcons[tab]}</span>
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="settingsBody">
          {/* ── PROFILE TAB ── */}
          {activeTab === "Profile" && (
            <>
              {/* Profile card */}
              <div className="profileEditRow">
                <div className="profileAvatar">
                  <img src={currentUser?.avatar || "./avatar.png"} alt="" />
                  <div className="editBadge">✏️</div>
                </div>
                <div className="profileInfo">
                  <span className="pName">{currentUser?.username}</span>
                  <span className="pEmail">{currentUser?.email}</span>
                </div>
              </div>

              <div className="sSection">
                <div className="sSectionLabel">Account</div>
                <div className="sCard">
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon purple">👤</div>
                      <div className="sRowText">
                        <span>Display Name</span>
                        <small>{currentUser?.username}</small>
                      </div>
                    </div>
                    <span className="sChevron">›</span>
                  </div>
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon blue">📧</div>
                      <div className="sRowText">
                        <span>Email</span>
                        <small>{currentUser?.email}</small>
                      </div>
                    </div>
                    <span className="sChevron">›</span>
                  </div>
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon orange">🔑</div>
                      <div className="sRowText">
                        <span>Change Password</span>
                        <small>Update your login credentials</small>
                      </div>
                    </div>
                    <span className="sChevron">›</span>
                  </div>
                </div>
              </div>

              <div className="sSection">
                <div className="sSectionLabel">Session</div>
                <div className="sCard">
                  <div className="sRow" style={{ cursor: "pointer" }} onClick={handleLogout}>
                    <div className="sRowLeft">
                      <div className="sRowIcon red">🚪</div>
                      <div className="sRowText">
                        <span style={{ color: "#ef4444" }}>Sign Out</span>
                        <small>Log out of WebChat</small>
                      </div>
                    </div>
                    <span className="sChevron">›</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === "Notifications" && (
            <>
              <div className="sSection">
                <div className="sSectionLabel">Messages</div>
                <div className="sCard">
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon purple">📩</div>
                      <div className="sRowText">
                        <span>Message Preview</span>
                        <small>Show content in notifications</small>
                      </div>
                    </div>
                    <label className="sToggle">
                      <input
                        type="checkbox"
                        checked={settings.messagePreview}
                        onChange={() => toggle("messagePreview")}
                      />
                      <span className="sSlider" />
                    </label>
                  </div>
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon blue">🔊</div>
                      <div className="sRowText">
                        <span>Sound</span>
                        <small>Play sound for new messages</small>
                      </div>
                    </div>
                    <label className="sToggle">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={() => toggle("soundEnabled")}
                      />
                      <span className="sSlider" />
                    </label>
                  </div>
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon green">🖥️</div>
                      <div className="sRowText">
                        <span>Desktop Notifications</span>
                        <small>Notify even when tab is inactive</small>
                      </div>
                    </div>
                    <label className="sToggle">
                      <input
                        type="checkbox"
                        checked={settings.desktopNotifications}
                        onChange={() => toggle("desktopNotifications")}
                      />
                      <span className="sSlider" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="sSection">
                <div className="sSectionLabel">Do Not Disturb</div>
                <div className="sCard">
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon orange">🌙</div>
                      <div className="sRowText">
                        <span>Quiet Hours</span>
                        <small>Mute notifications at night</small>
                      </div>
                    </div>
                    <label className="sToggle">
                      <input type="checkbox" />
                      <span className="sSlider" />
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── PRIVACY TAB ── */}
          {activeTab === "Privacy" && (
            <>
              <div className="sSection">
                <div className="sSectionLabel">Visibility</div>
                <div className="sCard">
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon green">🟢</div>
                      <div className="sRowText">
                        <span>Online Status</span>
                        <small>Show when you're active</small>
                      </div>
                    </div>
                    <label className="sToggle">
                      <input
                        type="checkbox"
                        checked={settings.onlineStatus}
                        onChange={() => toggle("onlineStatus")}
                      />
                      <span className="sSlider" />
                    </label>
                  </div>
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon blue">✓</div>
                      <div className="sRowText">
                        <span>Read Receipts</span>
                        <small>Let others know you've read messages</small>
                      </div>
                    </div>
                    <label className="sToggle">
                      <input
                        type="checkbox"
                        checked={settings.readReceipts}
                        onChange={() => toggle("readReceipts")}
                      />
                      <span className="sSlider" />
                    </label>
                  </div>
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon yellow">✍️</div>
                      <div className="sRowText">
                        <span>Typing Indicators</span>
                        <small>Show when you're typing</small>
                      </div>
                    </div>
                    <label className="sToggle">
                      <input
                        type="checkbox"
                        checked={settings.typingIndicators}
                        onChange={() => toggle("typingIndicators")}
                      />
                      <span className="sSlider" />
                    </label>
                  </div>
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon purple">🕒</div>
                      <div className="sRowText">
                        <span>Last Seen</span>
                        <small>Who can see your last active time</small>
                      </div>
                    </div>
                    <select
                      className="sSelect"
                      value={settings.lastSeen}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, lastSeen: e.target.value }))
                      }
                    >
                      <option value="everyone">Everyone</option>
                      <option value="contacts">My Contacts</option>
                      <option value="nobody">Nobody</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="sSection">
                <div className="sSectionLabel">Blocked Users</div>
                <div className="sCard">
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon red">🚫</div>
                      <div className="sRowText">
                        <span>Blocked List</span>
                        <small>
                          {settings.blockedCount === 0
                            ? "No blocked users"
                            : `${settings.blockedCount} user${settings.blockedCount > 1 ? "s" : ""} blocked`}
                        </small>
                      </div>
                    </div>
                    <span className="sChevron">›</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── APPEARANCE TAB ── */}
          {activeTab === "Appearance" && (
            <>
              {/* Theme Switcher */}
              <div className="sSection">
                <div className="sSectionLabel">Theme</div>
                <div className="sCard">
                  <div className="sRow" style={{ padding: "16px" }}>
                    <div className="themeSwitch">
                      <button
                        className={`themeOption ${theme === "dark" ? "active" : ""}`}
                        onClick={() => setTheme("dark")}
                      >
                        <div className="themePreview dark" />
                        <span className="themeName">🌙 Dark</span>
                        <span className="themeCheck">✓</span>
                      </button>
                      <button
                        className={`themeOption ${theme === "light" ? "active" : ""}`}
                        onClick={() => setTheme("light")}
                      >
                        <div className="themePreview light" />
                        <span className="themeName">☀️ Light</span>
                        <span className="themeCheck">✓</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sSection">
                <div className="sSectionLabel">Chat</div>
                <div className="sCard">
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon blue">⏎</div>
                      <div className="sRowText">
                        <span>Enter to Send</span>
                        <small>Press Enter to send messages</small>
                      </div>
                    </div>
                    <label className="sToggle">
                      <input
                        type="checkbox"
                        checked={settings.enterToSend}
                        onChange={() => toggle("enterToSend")}
                      />
                      <span className="sSlider" />
                    </label>
                  </div>
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon purple">📐</div>
                      <div className="sRowText">
                        <span>Compact Mode</span>
                        <small>Reduce spacing in message list</small>
                      </div>
                    </div>
                    <label className="sToggle">
                      <input
                        type="checkbox"
                        checked={settings.compactMode}
                        onChange={() => toggle("compactMode")}
                      />
                      <span className="sSlider" />
                    </label>
                  </div>
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon orange">🔤</div>
                      <div className="sRowText">
                        <span>Font Size</span>
                        <small>Adjust message text size</small>
                      </div>
                    </div>
                    <select
                      className="sSelect"
                      value={settings.fontSize}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, fontSize: e.target.value }))
                      }
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="sSection">
                <div className="sSectionLabel">Theme Color</div>
                <div className="sCard">
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon pink">🎨</div>
                      <div className="sRowText">
                        <span>Accent Color</span>
                        <small>Choose your accent color</small>
                      </div>
                    </div>
                    <select
                      className="sSelect"
                      value={settings.colorTheme}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, colorTheme: e.target.value }))
                      }
                    >
                      <option value="indigo">Indigo (Default)</option>
                      <option value="blue">Ocean Blue</option>
                      <option value="purple">Violet</option>
                      <option value="emerald">Emerald</option>
                      <option value="rose">Rose</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="sSection">
                <div className="sSectionLabel">About</div>
                <div className="sCard">
                  <div className="sRow">
                    <div className="sRowLeft">
                      <div className="sRowIcon purple">💬</div>
                      <div className="sRowText">
                        <span>WebChat</span>
                        <small>Version 1.0.0</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="settingsFooter">
          <button className="cancelBtn" onClick={onClose}>Cancel</button>
          <button className="saveBtn" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </>,
    document.body
  );
};

export default Settings;
