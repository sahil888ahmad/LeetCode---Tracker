import { Env } from '../index';
import { getRecentGlobalSubmissions } from '../services/database';

export async function handleGetFeed(env: Env): Promise<Response> {
  try {
    const feed = await getRecentGlobalSubmissions(env);
    return new Response(
      JSON.stringify({ success: true, data: feed }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
