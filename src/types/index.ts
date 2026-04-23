export type Platform = "INSTAGRAM" | "TIKTOK";
export type PostStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "FAILED";
export type ContentType = "REEL" | "STORY" | "CAROUSEL" | "VIDEO";
export type ApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "AUTO_APPROVED";
export type ContentPillar =
  | "lifestyle"
  | "behind_scenes"
  | "campaign"
  | "community"
  | "events";

export interface Post {
  id: string;
  platform: Platform;
  status: PostStatus;
  contentType: ContentType;
  caption: string;
  hashtags: string[];
  audioTrack?: string | null;
  hook?: string | null;
  pillar: ContentPillar;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  mediaUrls?: string[] | null;
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
  platformPostId?: string | null;
  approvalStatus: ApprovalStatus;
  approvalNotes?: string | null;
  aiReasoning?: string | null;
  predictedScore?: number | null;
  flaggedForReview: boolean;
  metrics?: PostMetrics[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostMetrics {
  id: string;
  postId: string;
  checkpointHours: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  completionRate?: number | null;
  followerGrowth?: number | null;
  engagementRate?: number | null;
  recordedAt: Date;
}

export interface TrendingItem {
  id: string;
  platform: Platform;
  itemType: "AUDIO" | "HASHTAG" | "FORMAT" | "HOOK";
  value: string;
  category?: string | null;
  saturation: number;
  growthRate: number;
  usageCount: number;
  niches: string[];
  exampleUrls: string[];
  isActive: boolean;
  recordedAt: Date;
  expiresAt: Date;
}

export interface BrandBible {
  id: string;
  brandName: string;
  tagline: string;
  originStory: string;
  mission: string;
  vision: string;
  personality: string[];
  audience: AudienceProfile;
  voice: VoiceProfile;
  visual: VisualProfile;
  contentPillars: PillarConfig[];
  competitors: CompetitorEntry[];
  redLines: string[];
  offLimitPhrases: string[];
  lovedPhrases: string[];
  slogans: string[];
  inspirationAccounts: string[];
  avoidAccounts: string[];
  topics: string[];
  updatedAt: Date;
  createdAt: Date;
}

export interface AudienceProfile {
  ageRange: string;
  gender: string;
  locations: string[];
  income: string;
  lifestyle: string[];
  aspiration: string;
  painPoint: string;
  followsAccounts: string[];
  slang: string;
  desiredEmotions: string[];
}

export interface VoiceProfile {
  person: string;
  formality: string;
  swearing: boolean;
  humour: string;
  lovedPhrases: string[];
  bannedPhrases: string[];
  offLimitTopics: string[];
}

export interface VisualProfile {
  colors: { primary: string; secondary: string; tertiary: string };
  aesthetic: string;
  faces: string;
  shotTypes: string[];
  rules: string[];
  neverPost: string[];
}

export interface PillarConfig {
  name: string;
  slug: ContentPillar;
  ratio: number;
  purpose: string;
  description: string;
}

export interface CompetitorEntry {
  account: string;
  platform: string;
  strengths: string;
  relationship: "competitor" | "aspiration" | "avoid_comparison" | "never_reference";
}

export interface ContentSuggestion {
  id: string;
  platform: Platform;
  pillar: ContentPillar;
  hook: string;
  captionDraft: string;
  hashtags: string[];
  audioSuggestion?: string | null;
  visualNotes: string;
  reasoning: string;
  predictedScore?: number | null;
  status: "PENDING" | "ACCEPTED" | "DISMISSED";
  createdAt: Date;
}

export interface PatternEntry {
  id: string;
  pattern: string;
  category: string;
  avgViews: number;
  avgLikes: number;
  avgEngagement: number;
  sampleSize: number;
  score: number;
  notes?: string | null;
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export interface StrategyReport {
  id: string;
  weekStarting: Date;
  totalPosts: number;
  avgViews: number;
  avgEngagement: number;
  topPosts: string[];
  wins: string;
  losses: string;
  insights: string;
  nextWeekPlan: string;
  recommendations: string[];
  createdAt: Date;
}

export interface DashboardStats {
  totalPosts: number;
  pendingApproval: number;
  scheduledPosts: number;
  publishedThisWeek: number;
  avgViews7d: number;
  avgEngagement7d: number;
  followerGrowth7d: number;
  topPerformer?: Post;
}

export interface GenerateContentRequest {
  platform: Platform;
  pillar: ContentPillar;
  slot: "morning" | "midday" | "evening";
  instructions?: string;
}

export interface PostingSlot {
  slot: "morning" | "midday" | "evening";
  timeGMT: string;
  instagram: string;
  tiktok: string;
}
