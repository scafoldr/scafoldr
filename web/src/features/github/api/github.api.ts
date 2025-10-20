// const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
// const clientSecret = process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET;
// const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

import { FileMap } from '@/features/code-editor';

export class GithubApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'GithubApiError';
  }
}

export async function getAccessToken() {
  try {
    const response = await fetch('/api/github/get_access_token');
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch token');
    }
    if (!data.access_token) {
      throw new Error('Access token is null');
    }
    console.log(data.access_token.value);
    return data.access_token.value;
  } catch (err) {
    console.error('Error:', err);
  }
}

export async function authorizeGitHub() {
  const scope = 'repo';
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirectUri!
  )}&scope=${scope}`;

  window.open(authUrl);
}

export async function createGithubRepo(
  name: string,
  description: string,
  isPrivate: boolean,
  accessToken: string,
  files: FileMap
) {
  try {
    const res = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`, // token koji si dobio kroz OAuth
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json'
      },
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create repository');
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await uploadFiles(data.owner.login, data.name, accessToken, files);

    console.log('Repository created:', data.html_url);
    return data;
  } catch (err) {
    console.error('Error:', err);
  }
}

async function uploadFiles(owner: string, repo: string, token: string, files: FileMap) {
  // 1️⃣ Create a tree with all files
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json'
  };

  const refRes = await fetch(`${baseUrl}/git/refs/heads/main`, { headers });
  const refData = await refRes.json();
  if (!refRes.ok) throw new Error('Failed to get main branch reference');

  const currentCommitSha = refData.object.sha;

  // Step 2: Get the current commit to find its tree
  const commitRes = await fetch(`${baseUrl}/git/commits/${currentCommitSha}`, { headers });
  const commitData = await commitRes.json();
  if (!commitRes.ok) throw new Error('Failed to get current commit');

  const blobs = await Promise.all(
    Object.entries(files).map(async ([path, content]) => {
      const res = await fetch(`${baseUrl}/git/blobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content,
          encoding: 'utf-8'
        })
      });
      const blob = await res.json();
      if (!res.ok) throw new Error(`Failed to create blob for ${path}: ${blob.message}`);
      return { path, sha: blob.sha };
    })
  );
  const treeRes = await fetch(`${baseUrl}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      base_tree: commitData.tree.sha,
      tree: blobs.map(({ path, sha }) => ({
        path,
        mode: '100644',
        type: 'blob',
        sha
      }))
    })
  });
  const tree = await treeRes.json();
  if (!treeRes.ok) throw new Error('Failed to create tree');

  // Step 5: Create new commit
  const newCommitRes = await fetch(`${baseUrl}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: 'Initial commit with project files',
      tree: tree.sha,
      parents: [currentCommitSha]
    })
  });
  const newCommit = await newCommitRes.json();
  if (!newCommitRes.ok) throw new Error('Failed to create commit');

  // Step 6: Update main branch to point to new commit
  const updateRefRes = await fetch(`${baseUrl}/git/refs/heads/main`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      sha: newCommit.sha,
      force: true
    })
  });

  if (!updateRefRes.ok) {
    const updateData = await updateRefRes.json();
    throw new Error(`Failed to update reference: ${updateData.message}`);
  }

  console.log(`Uploaded ${blobs.length} files in a single commit`);
}
