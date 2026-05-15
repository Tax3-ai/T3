import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Tax3 Social Agent",
  description: "Terms of Service for Tax3 Social Agent",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/dashboard" className="text-brand-gray-400 hover:text-white text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Image src="/icon.png" alt="Tax3 Social Agent" width={40} height={40} className="rounded-lg" />
        <span className="text-white font-semibold text-lg">Tax3 Social Agent</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-brand-gray-400 text-sm mb-10">Last updated: 13 May 2025</p>

      <div className="space-y-8 text-brand-gray-300 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Tax3 Social Agent (&quot;the App&quot;), you agree to be bound by
            these Terms of Service. If you do not agree with any part of these terms, you may not
            use the App.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
          <p>
            Tax3 Social Agent is a social media management platform that integrates with TikTok,
            Instagram, and other social media APIs to help manage content, track analytics, and
            grow social media presence for Tax3.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Use of the App</h2>
          <p>You agree to use the App only for lawful purposes and in accordance with these Terms. You must not:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Violate TikTok&apos;s or Meta&apos;s platform terms of service</li>
            <li>Attempt to gain unauthorised access to any part of the App</li>
            <li>Use the App to distribute spam or misleading content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Integrations</h2>
          <p>
            The App uses TikTok and Instagram APIs. By connecting your accounts, you grant us
            permission to access and interact with those accounts in accordance with this App&apos;s
            features. Use of third-party platforms is also subject to their own terms of service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
          <p>
            All content, design, and code within the App is the property of Tax3 and may not be
            copied, reproduced, or distributed without written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Disclaimer of Warranties</h2>
          <p>
            The App is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
            uninterrupted or error-free operation. Use of the App is at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Tax3 shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of the App.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Continued use of the App
            after changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Governing Law</h2>
          <p>
            These Terms are governed by the laws of England and Wales. Any disputes shall be
            subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
          <p>
            For any questions regarding these Terms, contact us at:{" "}
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
