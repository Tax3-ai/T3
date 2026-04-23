"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { BrandBible } from "@/types";

export default function BrandBiblePage() {
  const [bible, setBible] = useState<BrandBible | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<BrandBible>>({});

  useEffect(() => {
    fetch("/api/brand-bible")
      .then((r) => r.json())
      .then(setBible);
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/brand-bible", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bible, ...editData }),
      });
      const updated = await res.json();
      setBible(updated);
      setEditing(false);
      setEditData({});
    } finally {
      setSaving(false);
    }
  }

  if (!bible) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Brand Bible</h1>
          <p className="text-brand-gray-400 text-sm mt-0.5">
            The source of truth. The agent never posts outside these rules.
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditData({}); }}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={save} loading={saving}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Identity */}
      <Section title="Identity" icon="🏷">
        <Field label="Brand Name" value={bible.brandName} />
        <Field label="Tagline" value={bible.tagline} accentColor="#E31E24" />
        <Field label="Mission" value={bible.mission} />
        <Field label="Vision" value={bible.vision} />
        <Field label="Personality" value={bible.personality.join(" · ")} />
        <div className="col-span-2">
          <p className="text-xs text-brand-gray-400 mb-1">Origin Story</p>
          <p className="text-sm text-brand-gray-200 leading-relaxed whitespace-pre-line">{bible.originStory}</p>
        </div>
      </Section>

      {/* Audience */}
      <Section title="Target Audience" icon="👥">
        <Field label="Age Range" value={bible.audience.ageRange} />
        <Field label="Gender" value={bible.audience.gender} />
        <Field label="Locations" value={bible.audience.locations.join(", ")} />
        <Field label="Income" value={bible.audience.income} />
        <Field label="Aspiration" value={bible.audience.aspiration} />
        <Field label="Pain Point" value={bible.audience.painPoint} />
        <Field label="Slang" value={bible.audience.slang} />
        <div className="col-span-2">
          <p className="text-xs text-brand-gray-400 mb-2">Desired Emotions</p>
          <div className="flex flex-wrap gap-2">
            {bible.audience.desiredEmotions.map((e) => (
              <Badge key={e} variant="blue">{e}</Badge>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-brand-gray-400 mb-2">Lifestyle</p>
          <div className="flex flex-wrap gap-2">
            {bible.audience.lifestyle.map((l) => (
              <Badge key={l} variant="default">{l}</Badge>
            ))}
          </div>
        </div>
      </Section>

      {/* Voice */}
      <Section title="Voice & Tone" icon="🗣">
        <Field label="Person" value={bible.voice.person} />
        <Field label="Formality" value={bible.voice.formality} />
        <Field label="Swearing" value={bible.voice.swearing ? "Allowed" : "Not allowed"} />
        <Field label="Humour" value={bible.voice.humour} />
        <div className="col-span-2">
          <p className="text-xs text-brand-gray-400 mb-2">Loved Phrases</p>
          <div className="flex flex-wrap gap-2">
            {bible.lovedPhrases.map((p) => (
              <Badge key={p} variant="green">{p}</Badge>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-brand-gray-400 mb-2">Banned Phrases</p>
          <div className="flex flex-wrap gap-2">
            {bible.offLimitPhrases.map((p) => (
              <Badge key={p} variant="red">{p}</Badge>
            ))}
          </div>
        </div>
      </Section>

      {/* Visual */}
      <Section title="Visual Identity" icon="🎨">
        <div>
          <p className="text-xs text-brand-gray-400 mb-2">Brand Colors</p>
          <div className="flex gap-2">
            {Object.entries(bible.visual.colors).map(([name, hex]) => (
              <div key={name} className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded border border-brand-gray-600" style={{ backgroundColor: hex }} />
                <span className="text-xs text-brand-gray-400">{hex}</span>
              </div>
            ))}
          </div>
        </div>
        <Field label="Aesthetic" value={bible.visual.aesthetic} />
        <Field label="On Camera" value={bible.visual.faces} />
        <div className="col-span-2">
          <p className="text-xs text-brand-gray-400 mb-2">Shot Types</p>
          <div className="flex flex-wrap gap-2">
            {bible.visual.shotTypes.map((s) => (
              <Badge key={s} variant="default">{s}</Badge>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-brand-gray-400 mb-2">Visual Rules</p>
          <ul className="space-y-1">
            {bible.visual.rules.map((r) => (
              <li key={r} className="text-sm text-brand-gray-200 flex gap-2">
                <span className="text-brand-red">→</span> {r}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Content pillars */}
      <Section title="Content Pillars" icon="📋">
        <div className="col-span-2 grid md:grid-cols-3 gap-3">
          {bible.contentPillars.map((p) => (
            <div key={p.slug} className="bg-brand-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white text-sm">{p.name}</span>
                <span className="text-brand-red font-bold text-sm">{Math.round(p.ratio * 100)}%</span>
              </div>
              <p className="text-brand-gray-400 text-xs">{p.description}</p>
              <p className="text-brand-gray-600 text-xs mt-1">Purpose: {p.purpose}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Slogans */}
      <Section title="Slogans & Red Lines" icon="⚡">
        <div className="col-span-2">
          <p className="text-xs text-brand-gray-400 mb-2">Slogans</p>
          <div className="flex flex-wrap gap-2">
            {bible.slogans.map((s) => (
              <Badge key={s} variant="red">{s}</Badge>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-brand-gray-400 mb-2">Red Lines — NEVER post</p>
          <ul className="space-y-1">
            {bible.redLines.map((r) => (
              <li key={r} className="text-sm text-red-400 flex gap-2">
                <span>✕</span> {r}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Competitors */}
      <Section title="Competitors & Inspiration" icon="🔍">
        <div className="col-span-2 space-y-2">
          {bible.competitors.map((c) => (
            <div key={c.account} className="flex items-start gap-3 bg-brand-gray-800 rounded-lg p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">@{c.account}</span>
                  <RelationshipBadge rel={c.relationship} />
                </div>
                {c.strengths && (
                  <p className="text-brand-gray-400 text-xs mt-0.5">{c.strengths}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {children}
      </div>
    </Card>
  );
}

function Field({ label, value, accentColor }: { label: string; value: string; accentColor?: string }) {
  return (
    <div>
      <p className="text-xs text-brand-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium" style={accentColor ? { color: accentColor } : { color: "#FFFFFF" }}>
        {value}
      </p>
    </div>
  );
}

function RelationshipBadge({ rel }: { rel: string }) {
  const map: Record<string, { label: string; variant: "green" | "blue" | "yellow" | "red" }> = {
    competitor: { label: "Competitor", variant: "yellow" },
    aspiration: { label: "Inspiration", variant: "blue" },
    avoid_comparison: { label: "Avoid Comparison", variant: "red" },
    never_reference: { label: "Never Reference", variant: "red" },
  };
  const cfg = map[rel] ?? { label: rel, variant: "yellow" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
