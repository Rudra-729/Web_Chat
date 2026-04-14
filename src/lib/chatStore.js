import { create } from "zustand";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  isMuted: false,
  // mobile panel: 'list' | 'chat' | 'detail'
  mobilePanel: "list",

  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
        isMuted: false,
        mobilePanel: "chat",
      });
    } else if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
        isMuted: false,
        mobilePanel: "chat",
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
        isMuted: false,
        mobilePanel: "chat",
      });
    }
  },

  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },

  changeMute: () => {
    set((state) => ({ ...state, isMuted: !state.isMuted }));
  },

  resetChat: () => {
    set({
      chatId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
      isMuted: false,
      mobilePanel: "list",
    });
  },

  setMobilePanel: (panel) => set({ mobilePanel: panel }),
}));
