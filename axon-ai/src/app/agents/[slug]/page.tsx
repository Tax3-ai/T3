import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const agentData: Record<string, {
  name: string;
  character: string;
  avatar: string;
  role: string;
  tagline: string;
  bio: string;
  description: string;
  capabilities: { title: string; detail: string }[];
  whoFor: string[];
  integrations: string[];
  testimonial: { quote: string; author: string; company: string };
  metrics: { value: string; label: string }[];
}> = {
  admin: {
    name: 'Admin Agent',
    character: 'Betsy',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Betsy-admin&skinColor=d78774&backgroundColor=0f0f0f&radius=12&accessories=prescription01&clothing=blazer',
    role: 'Operations & Organisation',
    tagline: 'The ultimate executive assistant. Never overwhelmed. Always on.',
    bio: 'Betsy never takes a day off. She organises your calendar, handles your emails and keeps every task on track — around the clock. When you decide to switch off, Betsy doesn\'t.',
    description: 'Your Admin Agent handles the operational backbone of your business — from calendar management and email triage to document creation and data entry. It works silently in the background, ensuring nothing falls through the cracks, while your human team focuses on high-value work.',
    capabilities: [
      { title: 'Calendar & Scheduling', detail: 'Manages meetings, sends invites, resolves conflicts, and sets reminders across all time zones.' },
      { title: 'Email Drafting & Triage', detail: 'Reads, categorises, and drafts responses to emails. Flags urgent items and archives noise.' },
      { title: 'Document Creation', detail: 'Produces reports, proposals, contracts, and templates in your brand voice.' },
      { title: 'Data Entry & Management', detail: 'Populates spreadsheets, CRMs, and databases with accuracy and speed.' },
      { title: 'Meeting Summaries', detail: 'Produces structured action-point summaries after every meeting.' },
      { title: 'Task Coordination', detail: 'Tracks tasks across your team, sends reminders, and escalates blockers.' },
    ],
    whoFor: ['Founders & CEOs drowning in admin', 'EA-less startups scaling fast', 'Operations managers with too many plates spinning', 'Remote teams that need coordination'],
    integrations: ['Google Workspace', 'Microsoft 365', 'Notion', 'Slack', 'Trello', 'Asana', 'HubSpot'],
    testimonial: { quote: "Our Admin Agent handles roughly 4 hours of work per day that used to fall to me or my EA. It's like having an extra team member who never needs a day off.", author: 'Sarah M.', company: 'CEO, FinTech Startup' },
    metrics: [{ value: '4hrs', label: 'Saved Daily' }, { value: '99%', label: 'Task Accuracy' }, { value: '48hrs', label: 'Go-Live' }],
  },
  'social-media': {
    name: 'Social Media Agent',
    character: 'Maya',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Maya-social&skinColor=4a3728&backgroundColor=0f0f0f&radius=12&clothing=hoodie',
    role: 'Brand & Content',
    tagline: 'Always posting. Always engaging. Never burning out.',
    bio: 'Maya lives on social. She creates content for every platform, schedules it at the perfect time, responds to your audience and tracks what\'s working — all without being asked twice.',
    description: "Your Social Media Agent is a full-time content machine — creating platform-specific posts, scheduling them at optimal times, engaging with your audience, and reporting on what's working. It knows your brand voice and never goes off-message.",
    capabilities: [
      { title: 'Content Creation', detail: 'Writes captions, threads, carousels, and scripts tailored to each platform and your tone of voice.' },
      { title: 'Post Scheduling', detail: 'Schedules content at peak engagement windows for maximum reach.' },
      { title: 'Comment Moderation', detail: 'Replies to comments thoughtfully, handles DMs, and escalates complex queries.' },
      { title: 'Trend Monitoring', detail: 'Tracks relevant hashtags, trends, and competitor activity to keep you ahead.' },
      { title: 'Performance Reporting', detail: 'Delivers monthly reports on reach, engagement, growth, and what drove results.' },
      { title: 'Hashtag Research', detail: 'Identifies high-performing hashtags for each piece of content.' },
    ],
    whoFor: ['E-commerce brands with no time to post', 'Agencies managing multiple clients', 'Coaches and consultants building a personal brand', 'B2B companies with low social presence'],
    integrations: ['Instagram', 'LinkedIn', 'X (Twitter)', 'TikTok', 'Facebook', 'Buffer', 'Hootsuite'],
    testimonial: { quote: 'We went from posting twice a week inconsistently to daily content across three platforms. Our follower count doubled in 90 days.', author: 'James K.', company: 'Marketing Director, E-commerce Brand' },
    metrics: [{ value: '30+', label: 'Posts/Month' }, { value: '3x', label: 'Avg. Engagement Boost' }, { value: '24/7', label: 'Monitoring' }],
  },
  'customer-support': {
    name: 'Customer Support Agent',
    character: 'Alex',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Alex-support&skinColor=c8a882&backgroundColor=0f0f0f&radius=12&accessories=prescription02&clothing=shirt',
    role: 'Client Experience',
    tagline: 'Instant answers. Happy customers. Zero wait time.',
    bio: 'Alex is endlessly patient. He answers every customer query instantly, 24 hours a day. He never gets frustrated, never makes a customer feel like a burden, and always knows what to say.',
    description: 'Your Customer Support Agent handles enquiries across every channel — live chat, email, and ticketing — with speed and accuracy. It knows your products, your policies, and your tone. Customers get answers instantly; complex cases get escalated to humans with full context.',
    capabilities: [
      { title: '24/7 FAQ Handling', detail: 'Answers common questions instantly at any hour, any day, in any language.' },
      { title: 'Live Chat Management', detail: 'Handles live chat conversations in real time with natural, on-brand responses.' },
      { title: 'Ticket Creation & Routing', detail: 'Logs support tickets, categorises them, and routes to the right team member.' },
      { title: 'Smart Escalation', detail: 'Recognises when a human is needed and hands over with full conversation context.' },
      { title: 'Knowledge Base Updates', detail: 'Continuously updates your FAQ and help docs based on new questions.' },
      { title: 'CSAT Surveys', detail: 'Sends satisfaction surveys post-resolution and reports on trends.' },
    ],
    whoFor: ['SaaS products with high support volume', 'E-commerce brands handling returns & queries', 'Service businesses with repeat FAQ patterns', "Scaling teams that can't hire fast enough"],
    integrations: ['Intercom', 'Zendesk', 'Freshdesk', 'HubSpot', 'Crisp', 'WhatsApp Business', 'Email'],
    testimonial: { quote: 'Response times went from hours to seconds. Our customer satisfaction score jumped from 72% to 91% in the first month.', author: 'Tom R.', company: 'Head of Support, SaaS Platform' },
    metrics: [{ value: '<30s', label: 'Response Time' }, { value: '85%', label: 'Auto-Resolved' }, { value: '91%', label: 'CSAT Score' }],
  },
  sales: {
    name: 'Sales Agent',
    character: 'Marcus',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Marcus-sales&skinColor=3d2b1f&backgroundColor=0f0f0f&radius=12&clothing=blazerShirt',
    role: 'Revenue & Growth',
    tagline: 'Leads qualified. Pipelines full. Revenue growing.',
    bio: 'Marcus never lets a lead go cold. He qualifies every inbound enquiry, follows up without fail, keeps your CRM spotless and books meetings straight into your calendar. He doesn\'t miss.',
    description: 'Your Sales Agent works your pipeline around the clock — qualifying inbound leads, sending personalised follow-up sequences, updating your CRM, and booking meetings. It never forgets a follow-up and never lets a warm lead go cold.',
    capabilities: [
      { title: 'Lead Qualification', detail: 'Scores and qualifies leads based on your ICP criteria before they reach your sales team.' },
      { title: 'Follow-Up Sequences', detail: 'Sends personalised multi-touch email sequences that convert without being spammy.' },
      { title: 'CRM Management', detail: 'Keeps your CRM spotless — logs activity, updates stages, and flags stale deals.' },
      { title: 'Meeting Booking', detail: 'Books discovery calls directly into your calendar when leads are ready.' },
      { title: 'Pipeline Reporting', detail: 'Produces weekly pipeline reports with conversion rates and revenue forecasts.' },
      { title: 'Objection Handling Templates', detail: 'Drafts responses to common objections based on your proven playbook.' },
    ],
    whoFor: ['B2B companies with long sales cycles', 'SDR-less startups trying to scale revenue', 'Agencies handling new business development', 'Sales managers stretched across too many deals'],
    integrations: ['Salesforce', 'HubSpot CRM', 'Pipedrive', 'Close.io', 'Gmail', 'Outlook', 'Calendly'],
    testimonial: { quote: 'We added the Sales Agent in February. By April, our pipeline had tripled. It handles the boring bits so our closers can actually close.', author: 'Priya S.', company: 'VP Sales, B2B SaaS' },
    metrics: [{ value: '3x', label: 'Pipeline Growth' }, { value: '60%', label: 'More Follow-Ups' }, { value: '£0', label: 'Commission' }],
  },
  finance: {
    name: 'Finance Agent',
    character: 'Claire',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Claire-finance&skinColor=f0c8a0&backgroundColor=0f0f0f&radius=12&accessories=prescription01&clothing=blazerSweater',
    role: 'Accounts & Reporting',
    tagline: 'Numbers handled. Cash flow clear. Decisions informed.',
    bio: 'Claire keeps your numbers clean. She sends invoices, chases late payments, tracks every expense and delivers clear financial reports — so you always know where your money is.',
    description: 'Your Finance Agent takes the pain out of financial admin — processing invoices, tracking expenses, chasing payments, and producing clean reports. It keeps your numbers accurate and your accountant happy, without you lifting a finger.',
    capabilities: [
      { title: 'Invoice Processing', detail: 'Reads, logs, and processes incoming invoices. Flags duplicates and discrepancies.' },
      { title: 'Payment Chasing', detail: 'Sends polite, persistent follow-ups on overdue invoices to improve cash flow.' },
      { title: 'Expense Tracking', detail: 'Categorises expenses, reconciles receipts, and flags unusual spend.' },
      { title: 'Monthly Reporting', detail: 'Produces P&L summaries, cash flow statements, and budget vs actual reports.' },
      { title: 'Budget Alerts', detail: 'Monitors spend against budgets and alerts when thresholds are approaching.' },
      { title: 'Supplier Payments', detail: 'Schedules supplier payments and maintains an up-to-date creditor list.' },
    ],
    whoFor: ['SMEs without a full-time finance team', 'Founders managing their own accounts', 'Agencies billing multiple clients monthly', 'Growing businesses needing better financial visibility'],
    integrations: ['Xero', 'QuickBooks', 'FreeAgent', 'Sage', 'Stripe', 'GoCardless', 'Google Sheets'],
    testimonial: { quote: 'Late payments dropped by 80% after the Finance Agent started chasing invoices. Our cash flow has never been healthier.', author: 'David L.', company: 'Founder, Creative Agency' },
    metrics: [{ value: '80%', label: 'Fewer Late Payments' }, { value: '10hrs', label: 'Saved Per Month' }, { value: '100%', label: 'Accuracy Rate' }],
  },
};

export function generateStaticParams() {
  return Object.keys(agentData).map(slug => ({ slug }));
}

export default function AgentPage({ params }: { params: { slug: string } }) {
  const agent = agentData[params.slug];
  if (!agent) notFound();

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 grid-bg overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: 'rgba(34,197,94,0.05)' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/#agents" className="text-gray-500 text-sm hover:text-green-500 transition-colors mb-8 inline-flex items-center gap-2">
            ← Back to All Agents
          </Link>

          {/* Character profile */}
          <div className="flex items-start gap-8 mb-10">
            <div className="shrink-0">
              <div className="border-2 border-green-500/30 p-1" style={{ background: '#0A0A0A', imageRendering: 'pixelated' }}>
                <Image
                  src={agent.avatar}
                  alt={agent.character}
                  width={128}
                  height={128}
                  unoptimized
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="text-center mt-2">
                <div className="text-white font-bold text-sm">{agent.character}</div>
                <div className="text-green-500 text-xs font-mono">{agent.role}</div>
              </div>
            </div>

            <div className="flex-1">
              <div className="text-green-500 font-mono text-sm tracking-widest mb-3">{agent.role.toUpperCase()}</div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-none">{agent.name}</h1>
              <p className="text-gray-400 text-lg md:text-xl mb-3 max-w-2xl leading-relaxed font-light italic">&ldquo;{agent.tagline}&rdquo;</p>
              <div className="border-l-2 border-green-500/40 pl-4 mt-4">
                <p className="text-gray-400 text-sm leading-relaxed max-w-xl">{agent.bio}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/#book-demo" className="inline-flex items-center gap-2 bg-green-500 text-black font-black px-8 py-4 hover:bg-green-400 transition-all glow-green">
              Deploy {agent.character} →
            </Link>
            <Link href="/#pricing" className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 hover:border-green-500 hover:text-green-500 transition-all">
              View Pricing
            </Link>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-md">
            {agent.metrics.map(m => (
              <div key={m.label} className="text-center border border-white/5 p-4" style={{ background: '#0A0A0A' }}>
                <div className="text-3xl font-black text-green-500">{m.value}</div>
                <div className="text-gray-500 text-xs tracking-wide mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-green-500 font-mono text-sm tracking-widest mb-4">// CAPABILITIES</div>
        <h2 className="text-3xl font-black text-white mb-12">What {agent.character} Does</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {agent.capabilities.map((cap) => (
            <div key={cap.title} className="border border-white/5 p-6 hover:border-green-500/30 transition-all" style={{ background: '#0A0A0A' }}>
              <h3 className="text-green-500 font-bold mb-2">{cap.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{cap.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-24 border-y border-white/5 grid-bg" style={{ background: '#0A0A0A' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-green-500 font-mono text-sm tracking-widest mb-4">// IDEAL FOR</div>
          <h2 className="text-3xl font-black text-white mb-12">Who Needs {agent.character}?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {agent.whoFor.map((item) => (
              <div key={item} className="flex items-start gap-4 border border-white/5 p-5">
                <span className="text-green-500 text-xl shrink-0">▸</span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-green-500 font-mono text-sm tracking-widest mb-4">// INTEGRATIONS</div>
        <h2 className="text-3xl font-black text-white mb-12">Works With Your Stack</h2>
        <div className="flex flex-wrap gap-4">
          {agent.integrations.map((tool) => (
            <div key={tool} className="border border-white/10 px-6 py-3 text-gray-400 text-sm font-mono hover:border-green-500/50 hover:text-green-500 transition-all" style={{ background: '#0A0A0A' }}>
              {tool}
            </div>
          ))}
          <div className="border border-green-500/20 px-6 py-3 text-green-500 text-sm font-mono" style={{ background: 'rgba(34,197,94,0.05)' }}>
            + Many more
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 border-y border-white/5" style={{ background: '#0A0A0A' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-green-500 text-4xl mb-8 font-mono">&ldquo;</div>
          <p className="text-white text-xl md:text-2xl leading-relaxed mb-8 font-light italic">{agent.testimonial.quote}</p>
          <div>
            <div className="text-green-500 font-bold">{agent.testimonial.author}</div>
            <div className="text-gray-500 text-sm">{agent.testimonial.company}</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center grid-bg">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="border-2 border-green-500/40 p-1" style={{ background: '#0A0A0A' }}>
              <Image
                src={agent.avatar}
                alt={agent.character}
                width={96}
                height={96}
                unoptimized
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
          <div className="text-green-500 font-mono text-sm tracking-widest mb-4">// READY?</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Deploy {agent.character} Today</h2>
          <p className="text-gray-400 text-lg mb-10">Live in 48 hours. No lengthy onboarding. No hidden costs.</p>
          <Link href="/#book-demo" className="inline-flex items-center gap-2 bg-green-500 text-black font-black text-xl px-12 py-5 hover:bg-green-400 transition-all glow-green">
            Book Your Demo →
          </Link>
        </div>
      </section>
    </div>
  );
}
