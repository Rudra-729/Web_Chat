import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from "fs";

// Load from .env.local
const env = fs.readFileSync(".env.local", "utf8");
const getEnv = (key) => {
  const match = env.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : null;
};

const firebaseConfig = {
  apiKey: getEnv("VITE_API_KEY"),
  authDomain: "reactchat-28b07.firebaseapp.com",
  projectId: "reactchat-28b07",
  storageBucket: "reactchat-28b07.appspot.com",
  messagingSenderId: "389270591244",
  appId: "1:389270591244:web:656ab3573c090da97e06ff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  console.log("Checking WebChat AI user doc...");
  const botSnap = await getDoc(doc(db, "users", "nexchat-ai-assistant-v1"));
  console.log("Bot exists?", botSnap.exists(), botSnap.data());

  // We don't have the user IDs readily available unless we search.
  // Instead of querying without an index, I'll just check if the bot exists.
  process.exit(0);
}

check();
