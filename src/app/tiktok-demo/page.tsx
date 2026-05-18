"use client";

import { useState } from "react";
import Image from "next/image";

const MOCK_PROFILE = {
  display_name: "Tax3 Official",
  bio_description: "London streetwear. The Tax3 Way. 🖤 tax3.co.uk",
  profile_web_link: "https://tax3.co.uk",
  profile_deep_link: "https://vm.tiktok.com/tax3official",
  is_verified: false,
};

const MOCK_STATS = {
  follower_count: 12400,
  following_count: 312,
  likes_count: 84200,
  video_count: 47,
};

const MOCK_VIDEOS = [
  {
    id: "v1",
    title: "Tax3 Spring Drop — Shell Suit SZN 🔥",
    like_count: 4821,
    comment_count: 203,
    share_count: 512,
    view_count: 98400,
    create_time: "2026-04-28",
  },
  {
    id: "v2",
    title: "90s bedroom set BTS 🎬",
    like_count: 2310,
    comment_count: 97,
    share_count: 188,
    view_count: 41200,
    create_time: "2026-04-20",
  },
  {
    id: "v3",
    title: "Fit check — baggy graphic tee 🤍",
    like_count: 6104,
    comment_count: 341,
    share_count: 870,
    view_count: 134000,
    create_time: "2026-04-14",
  },
];

type Step = "login" | "authorise" | "profile" | "stats" | "videos";

const STEPS: Step[] = ["login", "authorise", "profile", "stats", "videos"];

const STEP_LABELS: Record<Step, string> = {
  login: "Connect TikTok",
  authorise: "Authorise Scopes",
  profile: "user.info.profile",
  stats: "user.info.stats",
  videos: "video.list",
};

const ALL_SCOPES = [
  {
    scope: "user.info.profile",
    description: "Read profile info: display name, bio, links, verification status",
    color: "blue",
  },
  {
    scope: "user.info.stats",
    description: "Read account stats: follower count, likes, video count",
    color: "purple",
  },
  {
    scope: "video.list",
    description: "Read the account's public videos and performance data",
    color: "green",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function TikTokDemoPage() {
  const [step, setStep] = useState<Step>("login");
  const [loading, setLoading] = useState(false);

  const currentIndex = STEPS.indexOf(step);

  const advance = (next: Step) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(next);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Image src="/icon.png" alt="Tax3 Social Agent" width={36} height={36} className="rounded-lg" />
        <span className="text-white font-semibold text-lg">Tax3 Social Agent</span>
      </div>
      <div className="flex items-center gap-2 mb-8">
        <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-mono border">
          DEMO / SANDBOX PREVIEW
        </span>
        <span className="text-xs text-brand-gray-400">Demonstrates TikTok API integration</span>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1.5 mb-8 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs
              ${step === s ? "bg-[#fe2c55] text-white" :
                currentIndex > i ? "bg-green-500 text-white" :
                "bg-brand-gray-700 text-brand-gray-400"}`}>
              {currentIndex > i ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-brand-gray-700" />}
          </div>
        ))}
        <span className="ml-2 text-xs text-brand-gray-400">{STEP_LABELS[step]}</span>
      </div>

      {/* Step: Login */}
      {step === "login" && (
        <div className="border border-brand-gray-700 rounded-xl p-8 text-center space-y-5">
          <div className="text-4xl">🎵</div>
          <h2 className="text-xl font-bold text-white">Connect your TikTok account</h2>
          <p className="text-brand-gray-400 text-sm max-w-sm mx-auto">
            Tax3 Social Agent uses TikTok Login Kit to securely authenticate your brand account
            and manage content publishing.
          </p>
          <button
            onClick={() => advance("authorise")}
            className="w-full bg-[#fe2c55] hover:bg-[#e0253e] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? "Redirecting to TikTok..." : <><span>🎵</span> Connect with TikTok</>}
          </button>
        </div>
      )}

      {/* Step: Authorise */}
      {step === "authorise" && (
        <div className="border border-brand-gray-700 rounded-xl p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-xl">🎵</div>
            <div>
              <h2 className="text-white font-bold">TikTok Login</h2>
              <p className="text-brand-gray-400 text-xs">sandbox.tiktok.com · OAuth 2.0</p>
            </div>
          </div>
          <p className="text-brand-gray-300 text-sm">
            <span className="font-semibold text-white">Tax3 Social Agent</span> is requesting the following permissions:
          </p>
          <div className="space-y-2">
            {ALL_SCOPES.map((s) => (
              <div key={s.scope} className="flex items-start gap-3 bg-brand-gray-900 rounded-lg p-3">
                <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                <div>
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${colorMap[s.color]}`}>
                    {s.scope}
                  </span>
                  <p className="text-brand-gray-400 text-xs mt-1">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => advance("profile")}
            className="w-full bg-[#fe2c55] hover:bg-[#e0253e] text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? "Authorising..." : "Authorise"}
          </button>
        </div>
      )}

      {/* Step: Profile */}
      {step === "profile" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${colorMap["blue"]}`}>user.info.profile</span>
            <span className="text-xs text-green-400">✓ Data retrieved</span>
          </div>
          <div className="border border-brand-gray-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Image src="/icon.png" alt="Avatar" width={64} height={64} className="rounded-full border-2 border-brand-gray-600" />
              <div>
                <p className="text-white font-bold text-lg">{MOCK_PROFILE.display_name}</p>
                <p className="text-brand-gray-400 text-sm">{MOCK_PROFILE.bio_description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-brand-gray-900 rounded-lg p-3">
                <p className="text-brand-gray-400 text-xs mb-1">profile_web_link</p>
                <p className="text-white font-mono text-xs">{MOCK_PROFILE.profile_web_link}</p>
              </div>
              <div className="bg-brand-gray-900 rounded-lg p-3">
                <p className="text-brand-gray-400 text-xs mb-1">profile_deep_link</p>
                <p className="text-white font-mono text-xs truncate">{MOCK_PROFILE.profile_deep_link}</p>
              </div>
              <div className="bg-brand-gray-900 rounded-lg p-3 col-span-2">
                <p className="text-brand-gray-400 text-xs mb-1">bio_description</p>
                <p className="text-white text-xs">{MOCK_PROFILE.bio_description}</p>
              </div>
            </div>
          </div>
          <button onClick={() => advance("stats")} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition-colors">
            {loading ? "Loading..." : "Next: Account Stats →"}
          </button>
        </div>
      )}

      {/* Step: Stats */}
      {step === "stats" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${colorMap["purple"]}`}>user.info.stats</span>
            <span className="text-xs text-green-400">✓ Data retrieved</span>
          </div>
          <div className="border border-brand-gray-700 rounded-xl p-6">
            <p className="text-white font-semibold mb-4">Account Statistics — @tax3official</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "follower_count", value: MOCK_STATS.follower_count },
                { label: "likes_count", value: MOCK_STATS.likes_count },
                { label: "video_count", value: MOCK_STATS.video_count },
                { label: "following_count", value: MOCK_STATS.following_count },
              ].map((s) => (
                <div key={s.label} className="bg-brand-gray-900 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{s.value.toLocaleString()}</p>
                  <p className="text-brand-gray-400 text-xs mt-1 font-mono">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => advance("videos")} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition-colors">
            {loading ? "Loading..." : "Next: Video List →"}
          </button>
        </div>
      )}

      {/* Step: Video List */}
      {step === "videos" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${colorMap["green"]}`}>video.list</span>
            <span className="text-xs text-green-400">✓ Data retrieved</span>
          </div>
          <div className="border border-brand-gray-700 rounded-xl p-6 space-y-3">
            <p className="text-white font-semibold">Public Videos — @tax3official</p>
            {MOCK_VIDEOS.map((v) => (
              <div key={v.id} className="bg-brand-gray-900 rounded-lg p-3 flex gap-3 items-start">
                <div className="w-16 h-12 rounded bg-brand-gray-700 flex items-center justify-center shrink-0">
                  <span className="text-xl">🎬</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{v.title}</p>
                  <p className="text-brand-gray-500 text-xs">{v.create_time}</p>
                  <div className="flex gap-3 mt-1.5 text-xs text-brand-gray-400">
                    <span>👁 {v.view_count.toLocaleString()}</span>
                    <span>❤️ {v.like_count.toLocaleString()}</span>
                    <span>💬 {v.comment_count}</span>
                    <span>↗️ {v.share_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border border-green-500/30 bg-green-500/10 rounded-xl p-5 text-center space-y-2">
            <div className="text-2xl">✅</div>
            <p className="text-white font-bold text-lg">All Scopes Demonstrated</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {ALL_SCOPES.map((s) => (
                <span key={s.scope} className={`text-xs font-mono px-2 py-0.5 rounded border ${colorMap[s.color]}`}>
                  ✓ {s.scope}
                </span>
              ))}
            </div>
            <a href="/dashboard" className="inline-block mt-3 text-sm text-brand-gray-400 hover:text-white underline">
              → Go to Dashboard
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
