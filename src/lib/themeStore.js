import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("webchat-theme") || "dark",
  setTheme: (theme) => {
    localStorage.setItem("webchat-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("webchat-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return { theme: next };
    });
  },
  initTheme: () => {
    const saved = localStorage.getItem("webchat-theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    set({ theme: saved });
  },
}));
