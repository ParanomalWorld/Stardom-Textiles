const TelegramBot = require("node-telegram-bot-api");

// Your BotFather token
const TOKEN = "8434640824:AAGnZI_D7J_6tXjPdaECc-o812ZNLs8gL6w";

// Replace with your admin chat ID
const ADMIN_CHAT_ID = "1419201572";

// Keep track of users who messaged
const userMap = new Map();

// Create bot
const bot = new TelegramBot(TOKEN, { polling: true });

// When a user messages the bot
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

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

// Admin replies in this format: /reply USER_ID your message
bot.onText(/\/reply (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  // Only allow admin to use /reply
  if (chatId.toString() === ADMIN_CHAT_ID) {
    const parts = match[1].split(" ");
    const userId = parts[0];
    const replyMsg = parts.slice(1).join(" ");

    bot.sendMessage(userId, `💬 Support: ${replyMsg}`);
    bot.sendMessage(ADMIN_CHAT_ID, "✅ Reply sent!");
  }
});
