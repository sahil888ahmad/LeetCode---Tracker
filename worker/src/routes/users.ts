/**
 * User API Routes
 * Handles all /api/users/* endpoints.
 */

import {
  createUser,
  getUserById,
  getUserByUsername,
  getSubmissionsByUserId,
  toggleNotifications,
  deleteUser,
} from '../services/database';
import { fetchUserProfile } from '../services/leetcode';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  FRONTEND_URL: string;
  TELEGRAM_BOT_TOKEN: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function error(message: string, status = 400): Response {
  return json({ success: false, error: message }, status);
}

/**
 * POST /api/users
 * Register a new user tracker
 */
export async function handleCreateUser(req: Request, env: Env): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return error('Invalid JSON body');
  }

  const { leetcode_username, telegram_chat_id } = body;

  // Validate inputs
  if (!leetcode_username?.trim()) return error('LeetCode username is required');
  if (!telegram_chat_id?.trim()) return error('Telegram Chat ID is required');

  const username = leetcode_username.trim().toLowerCase();
  const chatId = telegram_chat_id.trim();

  // Check if user already exists
  const existing = await getUserByUsername(env, username);
  if (existing) {
    return json({ success: true, user: existing, alreadyExists: true });
  }

  // Verify the LeetCode profile exists
  let profile;
  try {
    profile = await fetchUserProfile(username);
  } catch (err) {
    return error('Failed to reach LeetCode. Please try again later.', 503);
  }

  if (!profile.exists) {
    return error(`LeetCode profile "${username}" not found. Please check the username.`, 404);
  }

  // Create user in DB
  try {
    const user = await createUser(env, {
      leetcode_username: username,
      telegram_chat_id: chatId,
    });
    return json({ success: true, user }, 201);
  } catch (err) {
    console.error('createUser DB error:', err);
    return error('Failed to create user. Please try again.', 500);
  }
}

/**
 * GET /api/users/:id
 * Get user data + their LeetCode stats
 */
export async function handleGetUser(userId: string, env: Env): Promise<Response> {
  const user = await getUserById(env, userId);
  if (!user) return error('User not found', 404);

  // Fetch latest profile stats from LeetCode
  try {
    const profile = await fetchUserProfile(user.leetcode_username);
    return json({
      success: true,
      user: {
        ...user,
        total_solved: profile.totalSolved,
        easy_solved: profile.easySolved,
        medium_solved: profile.mediumSolved,
        hard_solved: profile.hardSolved,
      },
    });
  } catch {
    // Return DB data if LeetCode is unreachable
    return json({ success: true, user });
  }
}

/**
 * GET /api/users/:id/submissions
 * Get recent submissions for a user
 */
export async function handleGetSubmissions(userId: string, env: Env): Promise<Response> {
  const user = await getUserById(env, userId);
  if (!user) return error('User not found', 404);

  const submissions = await getSubmissionsByUserId(env, userId, 20);
  return json({ success: true, submissions });
}

/**
 * POST /api/users/:id/toggle-notifications
 * Enable or disable WhatsApp notifications
 */
export async function handleToggleNotifications(userId: string, _req: Request, env: Env): Promise<Response> {
  const user = await getUserById(env, userId);
  if (!user) return error('User not found', 404);

  const newState = !user.notification_enabled;
  await toggleNotifications(env, userId, newState);

  return json({
    success: true,
    notification_enabled: newState,
    message: `Notifications ${newState ? 'enabled' : 'disabled'}`,
  });
}

/**
 * GET /api/accounts/:telegram_id
 * Get all accounts associated with a telegram chat ID
 */
export async function handleGetAccountsByTelegram(telegramId: string, env: Env): Promise<Response> {
  const { getUsersByTelegramId } = await import('../services/database');
  const users = await getUsersByTelegramId(env, telegramId);
  return json({ success: true, users });
}

/**
 * DELETE /api/users/:id
 * Remove a user and all their submissions
 */
export async function handleDeleteUser(userId: string, env: Env): Promise<Response> {
  const user = await getUserById(env, userId);
  if (!user) return error('User not found', 404);

  await deleteUser(env, userId);
  return json({ success: true, message: 'Tracker deleted successfully' });
}
