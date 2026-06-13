import Link from 'next/link';
import { notFound } from 'next/navigation';

const agentData: Record<string, {
  name: string; role: string; tagline: string; icon: string; description: string;
  capabilities: { title: string; detail: string }[];
  whoFor: string[]; integrations: string[];
  testimonial: { quote: string; author: string; company: string };
  metrics: { value: string; label: string }[];
}> = {
  admin: {
    name: 'Admin Agent', role: 'Operations & Organisation', tagline: 'The ultimate executive assistant. Never overwhelmed. Always on.', icon: '⚙️',
    description: 'Your Admin Agent handles the operational backbone of your business — from calendar management and email triage to document creation and data entry. It works silently in the background, ensuring nothing falls through the cracks.',
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
    name: 'Social Media Agent', role: 'Brand & Content', tagline: 'Always posting. Always engaging. Never burning out.', icon: '📡',
    description: "Your Social Media Agent is a full-time content machine — creating platform-specific posts, scheduling them at optimal times, engaging with your audience, and reporting on what's working.",
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
    name: 'Customer Support Agent', role: 'Client Experience', tagline: 'Instant answers. Happy customers. Zero wait time.', icon: '💬',
    description: 'Your Customer Support Agent handles enquiries across every channel — live chat, email, and ticketing — with speed and accuracy. It knows your products, your policies, and your tone.',
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
    name: 'Sales Agent', role: 'Revenue & Growth', tagline: 'Leads qualified. Pipelines full. Revenue growing.', icon: '🎯',
    description: 'Your Sales Agent works your pipeline around the clock — qualifying inbound leads, sending personalised follow-up sequences, updating your CRM, and booking meetings. It never lets a warm lead go cold.',
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
    name: 'Finance Agent', role: 'Accounts & Reporting', tagline: 'Numbers handled. Cash flow clear. Decisions informed.', icon: '📊',
    description: 'Your Finance Agent takes the pain out of financial admin — processing invoices, tracking expenses, chasing payments, and producing clean reports. It keeps your numbers accurate without you lifting a finger.',
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
    <div style={{background:'#050505',minHeight:'100vh'}}>
      <section className="relative pt-32 pb-24 px-6 grid-bg border-b border-green-500/10">
        <div className="max-w-5xl mx-auto">
          <Link href="/#agents" className="text-gray-500 text-sm hover:text-green-500 transition-colors mb-8 inline-flex items-center gap-2">← Back to All Agents</Link>
          <div className="text-6xl mb-6">{agent.icon}</div>
          <div className="text-green-500 font-mono text-sm tracking-widest mb-4">{agent.role}</div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-none">{agent.name}</h1>
          <p className="text-green-500 text-xl mb-6 italic">&ldquo;{agent.tagline}&rdquo;</p>
          <p className="text-gray-400 text-lg max-w-3xl leading-relaxed mb-10">{agent.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/#book-demo" className="inline-flex items-center gap-2 bg-green-500 text-black font-black px-8 py-4 hover:bg-green-400 transition-all glow-green">Deploy This Agent →</Link>
            <Link href="/#pricing" className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 hover:border-green-500 hover:text-green-500 transition-all">View Pricing</Link>
          </div>
          <div className="grid grid-cols-3 gap-8 max-w-md">
            {agent.metrics.map(m => (
              <div key={m.label} className="text-center border border-white/5 p-4" style={{background:'#0A0A0A'}}>
                <div className="text-3xl font-black text-green-500">{m.value}</div>
                <div className="text-gray-500 text-xs tracking-wide mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-green-500 font-mono text-sm tracking-widest mb-4">// CAPABILITIES</div>
          <h2 className="text-3xl font-black text-white mb-12">What It Does</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {agent.capabilities.map(cap => (
              <div key={cap.title} className="border border-white/5 p-6 hover:border-green-500/30 transition-all" style={{background:'#0A0A0A'}}>
                <h3 className="text-green-500 font-bold mb-2">{cap.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{cap.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-y border-white/5 grid-bg" style={{background:'#0A0A0A'}}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-green-500 font-mono text-sm tracking-widest mb-4">// IDEAL FOR</div>
          <h2 className="text-3xl font-black text-white mb-12">Who Needs This Agent?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {agent.whoFor.map(item => (
              <div key={item} className="flex items-start gap-4 border border-white/5 p-5">
                <span className="text-green-500 text-xl shrink-0">▸</span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-green-500 font-mono text-sm tracking-widest mb-4">// INTEGRATIONS</div>
          <h2 className="text-3xl font-black text-white mb-12">Works With Your Stack</h2>
          <div className="flex flex-wrap gap-4">
            {agent.integrations.map(tool => (
              <div key={tool} className="border border-white/10 px-6 py-3 text-gray-400 text-sm font-mono hover:border-green-500/50 hover:text-green-500 transition-all" style={{background:'#0A0A0A'}}>{tool}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-y border-white/5" style={{background:'#0A0A0A'}}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-green-500 text-4xl mb-8 font-mono">&ldquo;</div>
          <p className="text-white text-xl md:text-2xl leading-relaxed mb-8 font-light italic">{agent.testimonial.quote}</p>
          <div className="text-green-500 font-bold">{agent.testimonial.author}</div>
          <div className="text-gray-500 text-sm">{agent.testimonial.company}</div>
        </div>
      </section>

      <section className="py-32 px-6 text-center grid-bg">
        <div className="max-w-2xl mx-auto">
          <div className="text-green-500 font-mono text-sm tracking-widest mb-4">// READY?</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Deploy Your {agent.name} Today</h2>
          <p className="text-gray-400 text-lg mb-10">Live in 48 hours. No lengthy onboarding. No hidden costs.</p>
          <Link href="/#book-demo" className="inline-flex items-center gap-2 bg-green-500 text-black font-black text-xl px-12 py-5 hover:bg-green-400 transition-all glow-green">Book Your Demo →</Link>
        </div>
      </section>
    </div>
  );
}
