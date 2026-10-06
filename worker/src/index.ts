/**
 * Cloudflare Worker — Main Entry Point
 * Handles HTTP requests and scheduled cron events.
 */

import {
  handleCreateUser,
  handleGetUser,
  handleGetSubmissions,
  handleToggleNotifications,
  handleDeleteUser,
  handleGetAccountsByTelegram,
} from './routes/users';
import { handleGetFeed } from './routes/feed';
import { runScheduledCheck } from './cron';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  FRONTEND_URL: string;
  TELEGRAM_BOT_TOKEN: string;
}

export default {
  /**
   * Handle HTTP Requests
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // ── CORS Preflight ──────────────────────────────────
    if (method === 'OPTIONS') {
      return corsResponse();
    }

    let response: Response;

    try {
      response = await route(request, env, path, method);
    } catch (err) {
      console.error('Unhandled error:', err);
      response = new Response(
        JSON.stringify({ success: false, error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Attach CORS headers to all responses
    return addCors(response, env.FRONTEND_URL);
  },

  /**
   * Handle Cron Triggers (every 15 minutes)
   */
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runScheduledCheck(env));
  },
};

/**
 * Route incoming requests to the correct handler
 */
async function route(request: Request, env: Env, path: string, method: string): Promise<Response> {
  // GET /api/health
  if (path === '/api/health' && method === 'GET') {
    return new Response(
      JSON.stringify({ success: true, status: 'ok', timestamp: new Date().toISOString() }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // POST /api/users
  if (path === '/api/users' && method === 'POST') {
    return handleCreateUser(request, env);
  }

  // GET /api/feed
  if (path === '/api/feed' && method === 'GET') {
    return handleGetFeed(env);
  }

  // GET /api/accounts/:telegram_id
  const accountsMatch = path.match(/^\/api\/accounts\/([^/]+)$/);
  if (accountsMatch && method === 'GET') {
    return handleGetAccountsByTelegram(accountsMatch[1], env);
  }

  // Routes with userId
  const userMatch = path.match(/^\/api\/users\/([^/]+)(\/.*)?$/);
  if (userMatch) {
    const userId = userMatch[1];
    const sub = userMatch[2] || '';

    // GET /api/users/:id
    if (method === 'GET' && sub === '') {
      return handleGetUser(userId, env);
    }

    // GET /api/users/:id/submissions
    if (method === 'GET' && sub === '/submissions') {
      return handleGetSubmissions(userId, env);
    }

    // POST /api/users/:id/toggle-notifications
    if (method === 'POST' && sub === '/toggle-notifications') {
      return handleToggleNotifications(userId, request, env);
    }

    // DELETE /api/users/:id
    if (method === 'DELETE' && sub === '') {
      return handleDeleteUser(userId, env);
    }
  }

  // 404
  return new Response(
    JSON.stringify({ success: false, error: 'Endpoint not found' }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}

function corsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

function addCors(response: Response, frontendUrl: string): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', frontendUrl || '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
