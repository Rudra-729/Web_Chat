import { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId, mobilePanel } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });
    return () => { unSub(); };
  }, [fetchUserInfo]);

  if (isLoading) {
    return <div className="loading">Loading WebChat…</div>;
  }

  if (!currentUser) {
    return (
      <div className="container">
        <Login />
        <Notification />
      </div>
    );
  }

  return (
    <div
      className={`container appContainer mobilePanelActive--${mobilePanel}`}
      data-mobile-panel={mobilePanel}
    >
      <List />
      <Chat />
      {chatId && <Detail />}
      <Notification />
    </div>
  );
};

export default App;
