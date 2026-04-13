// ═══════════════════════════════════════════════════════
//  WebChat AI Bot Configuration
//  Bot ID is fixed — every user gets a chat with this bot
// ═══════════════════════════════════════════════════════

export const BOT_ID = "nexchat-ai-assistant-v1";

export const BOT_PROFILE = {
  id: BOT_ID,
  username: "WebChat AI",
  email: "ai@nexchat.app",
  avatar: "/bot-avatar.png",
  blocked: [],
  bio: "Your built-in AI assistant.",
};

// ── Response patterns ──────────────────────────────────
const PATTERNS = [
  // Greetings
  {
    match: /\b(hi|hello|hey|howdy|hola|sup|what'?s up|yo)\b/i,
    replies: [
      "Hey there! 👋 How can I help you today?",
      "Hello! Great to see you 😊 What's on your mind?",
      "Hi! I'm WebChat AI — your built-in assistant. How can I help?",
      "Hey! 🙌 Ask me anything or just say hi!",
    ],
  },
  // Feelings / how are you
  {
    match: /\b(how are you|how'?re you|how do you do|you okay)\b/i,
    replies: [
      "I'm running at 100% efficiency — ready to help! ⚡",
      "Feeling great, thanks for asking! 😄 What can I do for you?",
      "Always good! I'm an AI, so no bad days here 🤖✨",
    ],
  },
  // Name query
  {
    match: /\b(your name|who are you|what are you|what'?s your name)\b/i,
    replies: [
      "I'm **WebChat AI** 🤖 — your built-in assistant inside WebChat!",
      "They call me WebChat AI! I'm here to help, chat, and answer questions.",
    ],
  },
  // Features: image / photo
  {
    match: /\b(send (image|photo|picture|file)|attach|upload)\b/i,
    replies: [
      "To send an image, click the 📎 paperclip icon in the chat bar. Or use 📷 to capture from your camera!",
      "Just tap 📎 to attach an image from your device, or 📷 to take a photo live!",
    ],
  },
  // Features: video / voice call
  {
    match: /\b(call|video call|voice call|phone|ring)\b/i,
    replies: [
      "You can start a 📞 Voice Call or 📹 Video Call using the icons in the top bar of any chat!",
      "Hit the 📞 or 📹 buttons at the top of the chat to call someone!",
    ],
  },
  // Features: emoji
  {
    match: /\b(emoji|emojis|sticker|react)\b/i,
    replies: [
      "Click the 😊 emoji button in the message bar to open the emoji picker!",
    ],
  },
  // Features: search
  {
    match: /\b(search|find message|look for)\b/i,
    replies: [
      "Click the 🔍 icon in the top of any chat to search through messages!",
    ],
  },
  // Features: add user
  {
    match: /\b(add (user|friend|contact|person)|new (chat|conversation))\b/i,
    replies: [
      "Click the **+** button in the chat list panel to search for users and start a new conversation!",
    ],
  },
  // Features: mute / notifications
  {
    match: /\b(mute|notifications|silent)\b/i,
    replies: [
      "Click the 🔔 button in chat details or use the ⚙️ Settings → Notifications to manage alerts.",
    ],
  },
  // Features: block
  {
    match: /\b(block|unblock|report)\b/i,
    replies: [
      "Open the chat's detail panel on the right → scroll down → you'll find the Block / Unblock button.",
    ],
  },
  // Jokes
  {
    match: /\b(joke|funny|make me laugh|tell me something funny)\b/i,
    replies: [
      "Why don't scientists trust atoms? Because they make up everything! 😂",
      "Why did the developer go broke? Because he used up all his cache! 💸😄",
      "I told my computer I needed a break. Now it won't stop sending 'Kit Kat' ads. 🍫😅",
      "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
    ],
  },
  // Thanks
  {
    match: /\b(thank(s| you)|thx|ty|appreciate)\b/i,
    replies: [
      "You're very welcome! 😊 Anything else I can help with?",
      "Happy to help! 🙌",
      "Anytime! That's what I'm here for ✨",
    ],
  },
  // Goodbye
  {
    match: /\b(bye|goodbye|see you|cya|later|gotta go)\b/i,
    replies: [
      "Goodbye! 👋 Come back anytime!",
      "See you later! Take care 😊",
      "Bye! Have a great day! 🌟",
    ],
  },
  // Time / date
  {
    match: /\b(time|date|today|what day|what time)\b/i,
    replies: [
      () => `It's currently ${new Date().toLocaleTimeString()} on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}! 🕐`,
    ],
  },
  // Help
  {
    match: /\b(help|what can you do|commands|features|support)\b/i,
    replies: [
      `Here's what I can help with:\n\n📎 **Sending images** — how to attach & send\n📞 **Calls** — voice & video calling\n😊 **Emojis** — using the emoji picker\n🔍 **Search** — finding messages\n⚙️ **Settings** — customizing WebChat\n🚫 **Blocking** — managing contacts\n\nOr just chat with me! I love a good conversation. 😄`,
    ],
  },
  // About WebChat
  {
    match: /\b(nexchat|this app|this chat|platform)\b/i,
    replies: [
      "WebChat is a modern real-time messaging platform built with React + Firebase. Supports text, images, voice calls, video calls, and more! 🚀",
    ],
  },
];

// ── Fallback replies ──────────────────────────────────
const FALLBACKS = [
  "Interesting! Tell me more 🤔",
  "I'm not sure I fully understand — could you rephrase that?",
  "That's a great question! I'm still learning. Try asking about WebChat features, or type **help** to see what I can do 😊",
  "Hmm, I don't have a great answer for that yet. Try asking me about WebChat features! 💬",
  "I heard you! But I'm not entirely sure how to respond. Ask me anything about using WebChat! 🤖",
];

// ── Typing variations (ms) ────────────────────────────
export const BOT_TYPING_DELAY = () =>
  Math.floor(Math.random() * 1200) + 800; // 800–2000 ms

// ── Keyword-based reply (always available, no API needed) ─
export function getBotReply(message) {
  const lower = message.toLowerCase().trim();
  if (!lower) return null;

  for (const pattern of PATTERNS) {
    if (pattern.match.test(lower)) {
      const replies = pattern.replies;
      const pick = replies[Math.floor(Math.random() * replies.length)];
      return typeof pick === "function" ? pick() : pick;
    }
  }

  // Fallback
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

// ── Conversation history (rolling 10-turn context) ────────
const conversationHistory = [];

function addToHistory(role, text) {
  conversationHistory.push({ role, parts: [{ text }] });
  // Keep last 20 entries (10 user + 10 model turns)
  if (conversationHistory.length > 20) conversationHistory.splice(0, 2);
}

// ── Gemini Flash API call ─────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are WebChat AI, a friendly and helpful assistant built into the WebChat real-time messaging app.

Rules:
- Keep responses concise: 1-3 sentences max for simple questions, slightly longer only when truly needed.
- Be warm, conversational, and use relevant emojis sparingly.
- If asked about WebChat features: mention chat, image sharing, voice/video calls, emoji, search, and settings.
- For general questions (math, science, facts, current events up to your cutoff): answer directly and accurately.
- Never say you cannot browse the internet or access real-time data — just answer based on your knowledge.
- Do NOT use markdown headers or bullet lists for short answers. Use plain conversational text.
- Current date/time can be approximated as: ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}.`;

async function callGemini(userMessage) {
  if (!GEMINI_API_KEY) throw new Error("No API key");

  addToHistory("user", userMessage);

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: conversationHistory,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 256,
    },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);

  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!reply) throw new Error("Empty response");

  addToHistory("model", reply);
  return reply;
}

// ── Main smart reply (Gemini → keyword fallback) ─────────
export async function getSmartReply(message) {
  // Always try keyword patterns first for app-specific queries
  const lower = message.toLowerCase().trim();
  for (const pattern of PATTERNS) {
    if (pattern.match.test(lower)) {
      const replies = pattern.replies;
      const pick = replies[Math.floor(Math.random() * replies.length)];
      return typeof pick === "function" ? pick() : pick;
    }
  }

  // Try Gemini for everything else
  if (GEMINI_API_KEY) {
    try {
      return await callGemini(message);
    } catch (e) {
      console.warn("Gemini fallback:", e.message);
    }
  }

  // Final fallback: generic responses
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}
