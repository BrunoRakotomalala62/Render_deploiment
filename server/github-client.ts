import { Octokit } from '@octokit/rest';
import { db } from './db';
import { users } from '@shared/schema';

async function getAccessToken() {
  const allUsers = await db.select().from(users).limit(1);
  
  if (allUsers.length === 0) {
    throw new Error('GitHub not connected. Please authenticate at /api/auth/github');
  }
  
  const user = allUsers[0];
  return user.accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}
