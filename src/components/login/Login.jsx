import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, googleProvider } from "../../lib/firebase";
import { doc, setDoc, collection, query, where, getDocs, getDoc } from "firebase/firestore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

// Pre-made avatars — DiceBear (free, no attribution needed)
const DEFAULT_AVATARS = [
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Whisper&backgroundColor=b6e3f4",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Shadow&backgroundColor=c0aede",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Blaze&backgroundColor=d1f4d1",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Nova&backgroundColor=ffd5dc",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Storm&backgroundColor=ffdfbf",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Pixel&backgroundColor=b6e3f4",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Comet&backgroundColor=c0aede",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Echo&backgroundColor=d1f4d1",
];

const Login = () => {
  const { fetchUserInfo } = useUserStore();
  const [activeTab, setActiveTab] = useState("signin");
  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [defaultAvatar, setDefaultAvatar] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
      setDefaultAvatar(""); // Clear default selection when custom is uploaded
    }
  };

  // The avatar shown in the preview
  const previewUrl = avatar.url || defaultAvatar || "./avatar.png";
  const avatarReady = !!(avatar.file || defaultAvatar);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    if (!username || !email || !password) {
      toast.warn("Please fill in all fields!");
      setLoading(false);
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        await res.user.delete();
        toast.warn("Username already taken!");
        setLoading(false);
        return;
      }

      // Resolve avatar: custom upload > selected default > random default
      let imgUrl;
      if (avatar.file) {
        imgUrl = await upload(avatar.file);
      } else {
        // Use selected default or pick a random one
        imgUrl = defaultAvatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
      }

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
        createdAt: Date.now(),
        lastSeen: Date.now(),
        status: "online",
      });

      await setDoc(doc(db, "userchats", res.user.uid), { chats: [] });
      await fetchUserInfo(res.user.uid);
      toast.success("Account created successfully!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const docRef = doc(db, "users", res.user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(doc(db, "users", res.user.uid), {
          username: res.user.displayName || "User",
          email: res.user.email,
          avatar: res.user.photoURL || "./avatar.png",
          id: res.user.uid,
          blocked: [],
          createdAt: Date.now(),
          lastSeen: Date.now(),
          status: "online",
        });
        await setDoc(doc(db, "userchats", res.user.uid), { chats: [] });
      }

      await fetchUserInfo(res.user.uid);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      {/* Left branding panel */}
      <div className="loginLeft">
        <div className="leftContent">
          <div className="brandLogo">
            <div className="logoIcon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h1>WebChat</h1>
          </div>
          <div className="heroText">
            <h2>
              Your conversations,<br />
              <span>all in one place.</span>
            </h2>
            <p>A fast, secure, and modern messaging platform built for teams and individuals.</p>
          </div>
          <div className="trustIndicators">
            <div className="trustItem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Real-time delivery</span>
            </div>
            <div className="trustItem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>AI-powered assistant</span>
            </div>
          </div>
        </div>
        <div className="leftFooter">
          <span>&copy; {new Date().getFullYear()} WebChat. All rights reserved.</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="loginRight">
        <div className="formContainer">
          <div className="formHeader">
            <h2>{activeTab === "signin" ? "Sign in" : "Create account"}</h2>
            <p className="subtitle">
              {activeTab === "signin"
                ? "Enter your credentials to access your account."
                : "Fill in the details below to get started."}
            </p>
          </div>

          {activeTab === "signin" ? (
            <div className="formSection" key="signin">
              <form onSubmit={handleLogin}>
                <div className="inputGroup">
                  <label htmlFor="signin-email">Email</label>
                  <input id="signin-email" type="email" placeholder="you@example.com" name="email" required />
                </div>
                <div className="inputGroup">
                  <label htmlFor="signin-password">Password</label>
                  <input id="signin-password" type="password" placeholder="Enter your password" name="password" required />
                </div>
                <button type="submit" className="submitBtn" disabled={loading}>
                  {loading ? <span className="loginSpinner" /> : "Sign In"}
                </button>
              </form>

              <div className="divider"><span>or</span></div>

              <button className="googleBtn" onClick={handleGoogleSignIn} disabled={loading}>
                <svg className="googleIcon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {loading ? "Signing in..." : "Continue with Google"}
              </button>

              <p className="switchText">
                Don&apos;t have an account?{" "}
                <button className="switchBtn" onClick={() => setActiveTab("signup")}>
                  Create one
                </button>
              </p>
            </div>
          ) : (
            <div className="formSection" key="signup">
              <form onSubmit={handleRegister}>
                {/* Avatar section */}
                <div className="avatarSection">
                  <label htmlFor="avatarFile" className="avatarUploadWrap" title="Upload a custom photo">
                    <img src={previewUrl} alt="avatar preview" className="avatarPreview" />
                    <div className="uploadText">
                      <span>{avatar.url ? "Photo uploaded" : avatarReady ? "Avatar selected" : "Choose avatar"}</span>
                      <small>{avatar.url ? "Click to change" : "Upload or pick a preset"}</small>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="avatarFile"
                    style={{ display: "none" }}
                    onChange={handleAvatar}
                    accept="image/*"
                  />

                  {/* Default avatar grid */}
                  <div className="defaultAvatarGrid">
                    {DEFAULT_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`defaultAvatarBtn ${defaultAvatar === url && !avatar.file ? "selected" : ""}`}
                        onClick={() => { setDefaultAvatar(url); setAvatar({ file: null, url: "" }); }}
                        title={`Avatar ${i + 1}`}
                      >
                        <img src={url} alt={`Avatar ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="inputGroup">
                  <label htmlFor="signup-username">Username</label>
                  <input id="signup-username" type="text" placeholder="Choose a username" name="username" required />
                </div>
                <div className="inputGroup">
                  <label htmlFor="signup-email">Email</label>
                  <input id="signup-email" type="email" placeholder="you@example.com" name="email" required />
                </div>
                <div className="inputGroup">
                  <label htmlFor="signup-password">Password</label>
                  <input id="signup-password" type="password" placeholder="Minimum 6 characters" name="password" required />
                </div>
                <button type="submit" className="submitBtn" disabled={loading}>
                  {loading ? <span className="loginSpinner" /> : "Create Account"}
                </button>
              </form>

              <p className="switchText">
                Already have an account?{" "}
                <button className="switchBtn" onClick={() => setActiveTab("signin")}>
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
