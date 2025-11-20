// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;


// ===== Telegram Bot Setup =====

const TelegramBot = require("node-telegram-bot-api");

// Your BotFather token
const TOKEN = "8434640824:AAGnZI_D7J_6tXjPdaECc-o812ZNLs8gL6w";

// Replace with your admin chat ID
const ADMIN_CHAT_ID = "1419201572";

// Keep track of users who messaged
const userMap = new Map();

// Create bot
const bot = new TelegramBot(TOKEN, { polling: true });

/**
 * Handle /start command
 */
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "👋 Welcome to YodhaPlay Support!\n\nSend us your issue and our support team will help you."
  );
});

/**
 * Handle normal messages
 */
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // Ignore if message is /start (we already handled it above)
  if (msg.text && msg.text.startsWith("/start")) return;

  // If message is from a user (not admin)
  if (chatId.toString() !== ADMIN_CHAT_ID) {
    // Save user info for replies
    userMap.set(chatId, msg.from.username || msg.from.first_name);

    // Forward user message to admin
    bot.sendMessage(
      ADMIN_CHAT_ID,
      `📩 New Support Query\nFrom: @${msg.from.username || msg.from.id}\nID: ${chatId}\n\nMessage: ${msg.text}`
    );

    // Confirm to user
    bot.sendMessage(chatId, "✅ Thanks! Our support team will reply shortly.");
  }
});

/**
 * Admin replies with: /reply USER_ID message
 */
bot.onText(/\/reply (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  // Only allow admin to use /reply
  if (chatId.toString() === ADMIN_CHAT_ID) {
    const parts = match[1].split(" ");
    const userId = parts[0];
    const replyMsg = parts.slice(1).join(" ");

    if (!userId || !replyMsg) {
      return bot.sendMessage(ADMIN_CHAT_ID, "⚠️ Usage: /reply USER_ID message");
    }

    bot.sendMessage(userId, `💬 Support: ${replyMsg}`);
    bot.sendMessage(ADMIN_CHAT_ID, "✅ Reply sent!");
  }
});
// ===== Express Website Setup =====
// Configure paths
const publicPath = path.join(__dirname, '../public');
const downloadsPath = path.join(publicPath, 'downloads');

// Serve static files
app.use(express.static(publicPath));

// APK download route
app.get('/download-app', (req, res) => {
    const filePath = path.join(downloadsPath, 'yodhaplay19nov-app.apk');
    res.download(filePath, 'YodhaPlay-Esports.apk', (err) => {
        if (err) {
            res.status(500).send('Error downloading file');
        }
    });
});

// Handle SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});