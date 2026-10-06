/**
 * Cron Job — Submission Checker
 * Runs every 15 minutes via Cloudflare Cron Triggers.
 *
 * Flow per user:
 * 1. Fetch active users from DB
 * 2. For each user: fetch recent LeetCode submissions
 * 3. Compare with already stored submissions
 * 4. For new accepted submissions: save to DB, send Telegram notification
 * 5. Mark notification as sent
 * 6. Update user stats
 */

import { Env } from './index';
import {
  getAllActiveUsers,
  submissionExists,
  createSubmission,
  markNotificationSent,
  updateUserStats,
} from './services/database';
import {
  fetchRecentSubmissions,
  fetchUserProfile,
  fetchProblemDifficulty,
} from './services/leetcode';
import { sendTelegramNotification, formatSubmissionMessage } from './services/telegram';

export async function runScheduledCheck(env: Env): Promise<void> {
  console.log(`[Cron] Starting submission check at ${new Date().toISOString()}`);

  let users;
  try {
    users = await getAllActiveUsers(env);
  } catch (err) {
    console.error('[Cron] Failed to fetch users from DB:', err);
    return;
  }

  console.log(`[Cron] Checking ${users.length} active users`);

  for (const user of users) {
    try {
      await checkUserSubmissions(user, env);
    } catch (err) {
      console.error(`[Cron] Error processing user ${user.leetcode_username}:`, err);
      // Continue with next user — don't abort the whole job
    }
  }

  console.log('[Cron] Submission check complete');
}

async function checkUserSubmissions(user: any, env: Env): Promise<void> {
  const username = user.leetcode_username;
  console.log(`[Cron] Checking submissions for: ${username}`);

  // Fetch recent submissions & profile from LeetCode
  let submissions;
  let profile;
  try {
    submissions = await fetchRecentSubmissions(username);
    profile = await fetchUserProfile(username);
  } catch (err) {
    console.error(`[Cron] LeetCode fetch failed for ${username}:`, err);
    return;
  }

  // Process each accepted submission
  for (const sub of submissions) {
    const submissionId = parseInt(sub.id, 10);

    // Skip if already processed (idempotency)
    const alreadyExists = await submissionExists(env, submissionId);
    if (alreadyExists) continue;

    console.log(`[Cron] New submission detected for ${username}: ${sub.title} (ID: ${submissionId})`);

    // Fetch difficulty (separate query since recentSubmissionList doesn't include it)
    const difficulty = await fetchProblemDifficulty(sub.titleSlug);

    // Save submission to DB
    let savedSubmission;
    try {
      savedSubmission = await createSubmission(env, {
        user_id: user.id,
        leetcode_submission_id: submissionId,
        title: sub.title,
        difficulty,
        language: sub.lang,
        status: sub.statusDisplay,
        submitted_at: new Date(parseInt(sub.timestamp) * 1000).toISOString(),
      });
    } catch (err) {
      console.error(`[Cron] DB save failed for submission ${submissionId}:`, err);
      continue;
    }

    // Send Telegram notification only if enabled
    if (user.notification_enabled) {
      const stats = {
        total: profile.totalSolved,
        easy: profile.easySolved,
        medium: profile.mediumSolved,
        hard: profile.hardSolved
      };
      const message = formatSubmissionMessage(username, sub.title, stats);
      
      // Need TELEGRAM_BOT_TOKEN in env
      if (!env.TELEGRAM_BOT_TOKEN) {
        console.error('[Cron] Missing TELEGRAM_BOT_TOKEN');
        continue;
      }

      const result = await sendTelegramNotification(
        user.telegram_chat_id,
        env.TELEGRAM_BOT_TOKEN,
        message
      );

      if (result.success) {
        console.log(`[Cron] Telegram sent to ${user.telegram_chat_id} for ${sub.title}`);
        await markNotificationSent(env, savedSubmission.id);
      } else {
        console.error(`[Cron] Telegram failed for ${username}:`, result.error);
        // Don't throw — submission is saved, notification_sent stays false for retry
      }
    }
  }

  // Update user stats in DB
  try {
    if (profile.exists) {
      await updateUserStats(env, user.id, {
        total_solved: profile.totalSolved,
        easy_solved: profile.easySolved,
        medium_solved: profile.mediumSolved,
        hard_solved: profile.hardSolved,
        last_checked_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error(`[Cron] Failed to update stats for ${username}:`, err);
  }
}
