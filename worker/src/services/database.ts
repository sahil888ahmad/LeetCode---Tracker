/**
 * Database Service — Supabase PostgreSQL
 * All database queries are isolated here for easy replacement.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  leetcode_username: string;
  telegram_chat_id: string;
  notification_enabled: boolean;
  last_checked_at: string | null;
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  leetcode_submission_id: number;
  problem_name: string;
  problem_slug: string | null;
  difficulty: string | null;
  language: string | null;
  status: string;
  submitted_at: string | null;
  notification_sent: boolean;
  created_at: string;
}

export interface CreateUserInput {
  leetcode_username: string;
  telegram_chat_id: string;
}

export interface CreateSubmissionInput {
  user_id: string;
  leetcode_submission_id: string;
  title: string;
  difficulty: string;
  language: string;
  status: string;
  submitted_at: string;
}

function getSupabase(env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string }): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

// ── User Operations ──────────────────────────────────────

export async function createUser(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  input: CreateUserInput
): Promise<User> {
  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from('users')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`DB createUser failed: ${error.message}`);
  return data as User;
}

export async function getUserById(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  id: string
): Promise<User | null> {
  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error?.code === 'PGRST116') return null; // not found
  if (error) throw new Error(`DB getUserById failed: ${error.message}`);
  return data as User;
}

export async function getUserByUsername(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  username: string
): Promise<User | null> {
  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('leetcode_username', username)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw new Error(`DB getUserByUsername failed: ${error.message}`);
  return data as User;
}

export async function getUsersByTelegramId(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  telegramChatId: string
): Promise<User[]> {
  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_chat_id', telegramChatId);

  if (error) throw new Error(`DB getUsersByTelegramId failed: ${error.message}`);
  return data || [];
}

export async function getAllActiveUsers(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string }
): Promise<User[]> {
  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('notification_enabled', true);

  if (error) throw new Error(`DB getAllActiveUsers failed: ${error.message}`);
  return (data || []) as User[];
}

export async function updateUserStats(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  userId: string,
  stats: {
    total_solved?: number;
    easy_solved?: number;
    medium_solved?: number;
    hard_solved?: number;
    last_checked_at?: string;
  }
): Promise<void> {
  const supabase = getSupabase(env);
  const { error } = await supabase
    .from('users')
    .update({ ...stats, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw new Error(`DB updateUserStats failed: ${error.message}`);
}

export async function toggleNotifications(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  userId: string,
  enabled: boolean
): Promise<void> {
  const supabase = getSupabase(env);
  const { error } = await supabase
    .from('users')
    .update({ notification_enabled: enabled, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw new Error(`DB toggleNotifications failed: ${error.message}`);
}

export async function deleteUser(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  userId: string
): Promise<void> {
  const supabase = getSupabase(env);
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw new Error(`DB deleteUser failed: ${error.message}`);
}

// ── Submission Operations ────────────────────────────────

export async function getSubmissionsByUserId(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  userId: string,
  limit = 20
): Promise<Submission[]> {
  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`DB getSubmissions failed: ${error.message}`);
  return (data || []) as Submission[];
}

export async function submissionExists(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  leetcodeSubmissionId: number
): Promise<boolean> {
  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from('submissions')
    .select('id')
    .eq('leetcode_submission_id', leetcodeSubmissionId)
    .single();

  if (error?.code === 'PGRST116') return false;
  if (error) throw new Error(`DB submissionExists failed: ${error.message}`);
  return !!data;
}

export async function createSubmission(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  input: CreateSubmissionInput
): Promise<Submission> {
  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from('submissions')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`DB createSubmission failed: ${error.message}`);
  return data as Submission;
}

export async function markNotificationSent(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  submissionId: string
): Promise<void> {
  const supabase = getSupabase(env);
  const { error } = await supabase
    .from('submissions')
    .update({ notification_sent: true })
    .eq('id', submissionId);

  if (error) throw new Error(`DB markNotificationSent failed: ${error.message}`);
}

export async function getRecentGlobalSubmissions(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  limit = 20
): Promise<any[]> {
  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id,
      title,
      difficulty,
      language,
      submitted_at,
      users (
        leetcode_username
      )
    `)
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`DB getRecentGlobalSubmissions failed: ${error.message}`);
  return data || [];
}
