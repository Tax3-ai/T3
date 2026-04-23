// Instagram Graph API client
// Docs: https://developers.facebook.com/docs/instagram-api/content-publishing

const BASE_URL = "https://graph.facebook.com/v21.0";

interface IGMediaResponse {
  id: string;
  status?: string;
}

interface IGInsightsResponse {
  data: Array<{
    name: string;
    period: string;
    values: Array<{ value: number }>;
    id: string;
  }>;
}

function getToken(): string {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) throw new Error("INSTAGRAM_ACCESS_TOKEN not set");
  return token;
}

function getAccountId(): string {
  const id = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!id) throw new Error("INSTAGRAM_BUSINESS_ACCOUNT_ID not set");
  return id;
}

// Step 1: Create a container (reel or carousel)
export async function createReelContainer(
  videoUrl: string,
  caption: string,
  coverUrl?: string
): Promise<string> {
  const accountId = getAccountId();
  const token = getToken();

  const params = new URLSearchParams({
    media_type: "REELS",
    video_url: videoUrl,
    caption,
    access_token: token,
    ...(coverUrl ? { cover_url: coverUrl } : {}),
  });

  const res = await fetch(`${BASE_URL}/${accountId}/media`, {
    method: "POST",
    body: params,
  });

  const data = (await res.json()) as IGMediaResponse & { error?: { message: string } };
  if (!res.ok) throw new Error(data.error?.message ?? "Failed to create container");
  return data.id;
}

// Step 2: Wait for container to be ready
export async function waitForContainer(
  containerId: string,
  maxAttempts = 20
): Promise<void> {
  const token = getToken();
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${BASE_URL}/${containerId}?fields=status_code&access_token=${token}`
    );
    const data = (await res.json()) as { status_code: string };
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") throw new Error("Container processing failed");
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("Container processing timeout");
}

// Step 3: Publish container
export async function publishContainer(containerId: string): Promise<string> {
  const accountId = getAccountId();
  const token = getToken();

  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: token,
  });

  const res = await fetch(`${BASE_URL}/${accountId}/media_publish`, {
    method: "POST",
    body: params,
  });

  const data = (await res.json()) as IGMediaResponse & { error?: { message: string } };
  if (!res.ok) throw new Error(data.error?.message ?? "Failed to publish");
  return data.id;
}

// Full publish flow for a reel
export async function publishReel(
  videoUrl: string,
  caption: string,
  coverUrl?: string
): Promise<string> {
  const containerId = await createReelContainer(videoUrl, caption, coverUrl);
  await waitForContainer(containerId);
  return publishContainer(containerId);
}

// Get post insights
export async function getPostInsights(postId: string): Promise<{
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
}> {
  const token = getToken();
  const metrics = "video_views,likes,comments,shares,saved,reach,plays";

  const res = await fetch(
    `${BASE_URL}/${postId}/insights?metric=${metrics}&access_token=${token}`
  );
  const data = (await res.json()) as IGInsightsResponse & { error?: { message: string } };

  if (!res.ok) throw new Error(data.error?.message ?? "Failed to get insights");

  const get = (name: string): number => {
    const item = data.data?.find((d) => d.name === name);
    return item?.values?.[0]?.value ?? 0;
  };

  return {
    views: get("video_views") || get("plays"),
    likes: get("likes"),
    comments: get("comments"),
    shares: get("shares"),
    saves: get("saved"),
    reach: get("reach"),
  };
}

// Get account follower count
export async function getFollowerCount(): Promise<number> {
  const accountId = getAccountId();
  const token = getToken();

  const res = await fetch(
    `${BASE_URL}/${accountId}?fields=followers_count&access_token=${token}`
  );
  const data = (await res.json()) as { followers_count: number; error?: { message: string } };
  if (!res.ok) throw new Error(data.error?.message ?? "Failed to get followers");
  return data.followers_count;
}
