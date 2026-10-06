/**
 * Telegram Notification Service
 *
 * Uses the official Telegram Bot API to send notifications.
 *
 * Setup (one-time for admin):
 * 1. Message @BotFather on Telegram to create a bot.
 * 2. Get the bot token and add to .dev.vars / Cloudflare secrets as TELEGRAM_BOT_TOKEN
 *
 * Setup (for users):
 * 1. Users must message @userinfobot to get their Chat ID.
 * 2. Users must start a chat with your newly created bot to allow it to message them.
 */

export interface TelegramResult {
  success: boolean;
  error?: string;
}

/**
 * Send a Telegram notification.
 * @param chatId   User's Telegram chat ID
 * @param botToken Bot token from BotFather
 * @param text     Message text to send
 */
export async function sendTelegramNotification(
  chatId: string,
  botToken: string,
  text: string
): Promise<TelegramResult> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    const body = await res.json() as any;

    if (!res.ok || !body.ok) {
      return {
        success: false,
        error: `Telegram error (${res.status}): ${body.description || 'Unknown error'}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error sending Telegram message',
    };
  }
}

/**
 * Format a submission notification message for Telegram.
 */
export function formatSubmissionMessage(
  username: string,
  problemName: string,
  stats: { total: number; easy: number; medium: number; hard: number }
): string {
  return (
    `👤 <b>User:</b> <code>${username}</code>\n` +
    `📝 <b>Problem:</b> <code>${problemName}</code>\n\n` +
    `✅ <b>Total Solved:</b> <b>${stats.total}</b>\n` +
    `🟢 <b>Easy:</b> ${stats.easy}\n` +
    `🟡 <b>Medium:</b> ${stats.medium}\n` +
    `🔴 <b>Hard:</b> ${stats.hard}\n\n` +
    `🔗 https://leetcode.com/${username}/`
  );
}
