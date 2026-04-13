import "./addUser.css";
import { db } from "../../../../lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";
import { toast } from "react-toastify";

const AddUser = ({ onClose }) => {
  const [user, setUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [adding, setAdding] = useState(false);

  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    if (!username.trim()) return;

    setSearching(true);
    setSearched(false);
    setUser(null);

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username.trim()));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        const foundUser = querySnapShot.docs[0].data();
        if (foundUser.id === currentUser.id) {
          toast.warn("That's you! 😄");
        } else {
          setUser(foundUser);
        }
      }
      setSearched(true);
    } catch (err) {
      console.log(err);
      toast.error("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!user) return;
    setAdding(true);

    try {
      // ── Check if a chat with this user already exists ──
      const currentUserChatsRef = doc(db, "userchats", currentUser.id);
      const currentUserChatsSnap = await getDoc(currentUserChatsRef);

      if (currentUserChatsSnap.exists()) {
        const existingChats = currentUserChatsSnap.data().chats || [];
        const chatAlreadyExists = existingChats.some(
          (c) => c.receiverId === user.id
        );
        if (chatAlreadyExists) {
          toast.info(`You already have a chat with ${user.username}!`);
          setAdding(false);
          onClose?.();
          return;
        }
      }

      // ── Create the new chat document ──
      const newChatRef = doc(collection(db, "chats"));
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const timestamp = Date.now();

      // ── Update (or create) the OTHER user's userchats doc ──
      await setDoc(
        doc(db, "userchats", user.id),
        {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: currentUser.id,
            updatedAt: timestamp,
            isSeen: false,
          }),
        },
        { merge: true }   // ← safe: creates the doc if it doesn't exist
      );

      // ── Update (or create) the CURRENT user's userchats doc ──
      await setDoc(
        doc(db, "userchats", currentUser.id),
        {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: user.id,
            updatedAt: timestamp,
            isSeen: true,
          }),
        },
        { merge: true }
      );

      toast.success(`Started chat with ${user.username}! 🎉`);
      onClose?.();
    } catch (err) {
      console.error("handleAdd error:", err);
      toast.error(`Failed: ${err.message}`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div className="addUserOverlay" onClick={onClose} />
      <div className="addUser">
        <div className="modalHeader">
          <h3>New Conversation</h3>
          <button className="closeBtn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by username..."
            name="username"
            autoFocus
          />
          <button type="submit" disabled={searching}>
            {searching ? "..." : "Search"}
          </button>
        </form>

        {searched && !user && (
          <p className="noResult">No user found. Try a different username.</p>
        )}

        {user && (
          <div className="resultUser">
            <div className="userDetail">
              <img src={user.avatar || "./avatar.png"} alt="" />
              <div className="userDetailText">
                <span>{user.username}</span>
                <small>{user.email}</small>
              </div>
            </div>
            <button className="addUserBtn" onClick={handleAdd} disabled={adding}>
              {adding ? "Adding…" : "Add"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AddUser;
