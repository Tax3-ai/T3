// TikTok Content Posting API v2 client
// Docs: https://developers.tiktok.com/doc/content-posting-api-get-started

const BASE_URL = "https://open.tiktokapis.com/v2";

function getToken(): string {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) throw new Error("TIKTOK_ACCESS_TOKEN not set");
  return token;
}

interface TikTokResponse<T> {
  data: T;
  error: { code: string; message: string; log_id: string };
}

interface InitUploadData {
  publish_id: string;
  upload_url: string;
}

interface StatusData {
  status: "PROCESSING_UPLOAD" | "PUBLISH_COMPLETE" | "FAILED" | "SEND_TO_USER_INBOX";
  publicaly_available_post_id?: string[];
  fail_reason?: string;
}

// Initialize a video upload
export async function initVideoUpload(params: {
  videoUrl: string;
  title: string;
  privacyLevel?: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "FOLLOWER_OF_CREATOR" | "SELF_ONLY";
  disableDuet?: boolean;
  disableStitch?: boolean;
  disableComment?: boolean;
}): Promise<{ publishId: string }> {
  const token = getToken();
  const openId = process.env.TIKTOK_OPEN_ID;
  if (!openId) throw new Error("TIKTOK_OPEN_ID not set");

  const res = await fetch(`${BASE_URL}/post/publish/video/init/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title: params.title,
        privacy_level: params.privacyLevel ?? "PUBLIC_TO_EVERYONE",
        disable_duet: params.disableDuet ?? false,
        disable_stitch: params.disableStitch ?? false,
        disable_comment: params.disableComment ?? false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: params.videoUrl,
      },
    }),
  });

  const data = (await res.json()) as TikTokResponse<InitUploadData>;
  if (data.error?.code !== "ok") {
    throw new Error(data.error?.message ?? "TikTok init upload failed");
  }
  return { publishId: data.data.publish_id };
}

// Poll publish status
export async function getPublishStatus(publishId: string): Promise<StatusData> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}/post/publish/status/fetch/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ publish_id: publishId }),
  });

  const data = (await res.json()) as TikTokResponse<StatusData>;
  if (data.error?.code !== "ok") {
    throw new Error(data.error?.message ?? "TikTok status check failed");
  }
  return data.data;
}

// Full publish flow — returns TikTok post ID
export async function publishVideo(
  videoUrl: string,
  caption: string,
  options?: {
    privacyLevel?: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS";
    disableComment?: boolean;
  }
): Promise<string> {
  const { publishId } = await initVideoUpload({
    videoUrl,
    title: caption.slice(0, 150),
    privacyLevel: options?.privacyLevel ?? "PUBLIC_TO_EVERYONE",
    disableComment: options?.disableComment ?? false,
  });

  // Poll until complete
  for (let i = 0; i < 24; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const status = await getPublishStatus(publishId);
    if (status.status === "PUBLISH_COMPLETE") {
      return status.publicaly_available_post_id?.[0] ?? publishId;
    }
    if (status.status === "FAILED") {
      throw new Error(`TikTok publish failed: ${status.fail_reason ?? "unknown"}`);
    }
  }

  throw new Error("TikTok publish timeout after 2 minutes");
}

// Get video stats via Query API
export async function getVideoStats(videoId: string): Promise<{
  views: number;
  likes: number;
  comments: number;
  shares: number;
}> {
  const token = getToken();

  const res = await fetch(
    `${BASE_URL}/video/query/?fields=view_count,like_count,comment_count,share_count`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        filters: { video_ids: [videoId] },
      }),
    }
  );

  type VideoData = { view_count: number; like_count: number; comment_count: number; share_count: number };
  const data = (await res.json()) as TikTokResponse<{ videos: VideoData[] }>;
  if (data.error?.code !== "ok") throw new Error(data.error?.message);

  const video = data.data.videos?.[0];
  return {
    views: video?.view_count ?? 0,
    likes: video?.like_count ?? 0,
    comments: video?.comment_count ?? 0,
    shares: video?.share_count ?? 0,
  };
}
