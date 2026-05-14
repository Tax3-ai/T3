import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Tax3 Social Agent",
  description: "Privacy Policy for Tax3 Social Agent",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/dashboard" className="text-brand-gray-400 hover:text-white text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-brand-gray-400 text-sm mb-10">Last updated: 13 May 2025</p>

      <div className="space-y-8 text-brand-gray-300 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Overview</h2>
          <p>
            Tax3 Social Agent (&quot;the App&quot;) is a social media management tool operated by Tax3
            (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). This Privacy Policy explains how we collect, use,
            and protect information when you use the App.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-white">TikTok account data:</strong> When you connect your TikTok account,
              we access your profile information, video metrics, and content data as permitted by TikTok&apos;s API.
            </li>
            <li>
              <strong className="text-white">Instagram account data:</strong> When you connect your Instagram
              account, we access your profile information and post metrics via the Instagram Graph API.
            </li>
            <li>
              <strong className="text-white">Usage data:</strong> We collect information about how the App is used,
              including pages visited and actions taken.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To operate and improve the Tax3 Social Agent dashboard</li>
            <li>To display analytics, trends, and performance metrics</li>
            <li>To schedule and post content on connected social media accounts</li>
            <li>To generate reports and insights for your social media strategy</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. Data from
            social media APIs is used solely to power the features of this App and is not shared
            with any external parties beyond what is required to operate those features.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active or as needed to provide
            services. You may request deletion of your data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your data
            against unauthorised access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Third-Party Services</h2>
          <p>
            This App integrates with TikTok and Instagram APIs. Use of these integrations is
            subject to TikTok&apos;s and Meta&apos;s respective privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. To exercise
            these rights, contact us at the address below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Contact</h2>
          <p>
            For any privacy-related questions, contact us at:{" "}
            <a href="mailto:hello@tax3.co.uk" className="text-brand-red hover:underline">
              hello@tax3.co.uk
            </a>
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-brand-gray-700 flex gap-6 text-sm text-brand-gray-400">
        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
      </div>
    </div>
  );
}
