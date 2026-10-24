/**
 * LeetCode Service
 * Fetches user profile stats and recent submissions via LeetCode's public GraphQL API.
 * This module is intentionally isolated so it can be swapped if LeetCode changes their API.
 */

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

export interface LeetCodeProfile {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions?: number;
  exists: boolean;
}

export interface LeetCodeSubmission {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
  difficulty?: string;
}

/**
 * Fetch a user's solve counts and verify the profile exists.
 */
export async function fetchUserProfile(username: string): Promise<LeetCodeProfile> {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
    }
  `;

  const res = await fetch(LEETCODE_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com',
    },
    body: JSON.stringify({ query, variables: { username } }),
  });

  if (!res.ok) {
    throw new Error(`LeetCode GraphQL request failed: ${res.status}`);
  }

  const data: any = await res.json();
  const user = data?.data?.matchedUser;

  if (!user) {
    return {
      username,
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      totalSubmissions: 0,
      exists: false,
    };
  }

  const stats = user.submitStats?.acSubmissionNum || [];
  const getCount = (diff: string) =>
    stats.find((s: any) => s.difficulty === diff)?.count || 0;
  const getSubmissions = (diff: string) =>
    stats.find((s: any) => s.difficulty === diff)?.submissions || 0;

  return {
    username: user.username,
    totalSolved: getCount('All'),
    easySolved: getCount('Easy'),
    mediumSolved: getCount('Medium'),
    hardSolved: getCount('Hard'),
    totalSubmissions: getSubmissions('All'),
    exists: true,
  };
}

/**
 * Fetch the most recent submissions for a user (up to 20, public API limit).
 * Only returns ACCEPTED submissions.
 */
export async function fetchRecentSubmissions(username: string): Promise<LeetCodeSubmission[]> {
  const query = `
    query getRecentSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
  `;

  const res = await fetch(LEETCODE_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com',
    },
    body: JSON.stringify({
      query,
      variables: { username, limit: 20 },
    }),
  });

  if (!res.ok) {
    throw new Error(`LeetCode submissions request failed: ${res.status}`);
  }

  const data: any = await res.json();
  const submissions: LeetCodeSubmission[] = data?.data?.recentAcSubmissionList || [];

  // Return only accepted submissions
  return submissions.filter((s) => s.statusDisplay === 'Accepted');
}

/**
 * Fetch difficulty for a specific problem slug.
 * Used to enrich submission data since recentSubmissionList doesn't include difficulty.
 */
export async function fetchProblemDifficulty(titleSlug: string): Promise<string> {
  const query = `
    query getProblem($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        difficulty
      }
    }
  `;

  try {
    const res = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({ query, variables: { titleSlug } }),
    });

    if (!res.ok) return 'Unknown';
    const data: any = await res.json();
    return data?.data?.question?.difficulty || 'Unknown';
  } catch {
    return 'Unknown';
  }
}
