import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - GibbiAI",
  description: "Learn how GibbiAI collects, uses, and protects your data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-muted-foreground">
        Last updated: [Insert Date]
      </p>

      <section>
        <h2 className="text-2xl font-semibold">1. Introduction</h2>
        <p>
          Welcome to GibbiAI! This Privacy Policy explains how we collect, use, and protect your
          personal information when you use our app. By using GibbiAI, you agree to the terms
          outlined in this policy.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Personal Information:</strong> Name, email address, and other details you
            provide when creating an account or using our services.
          </li>
          <li>
            <strong>Quiz Data:</strong> Quizzes you create, questions, answers, and performance
            metrics.
          </li>
          <li>
            <strong>Usage Data:</strong> Information about how you interact with the app, such as
            pages visited, time spent, and device information.
          </li>
          <li>
            <strong>Cookies and Tracking:</strong> We use cookies and similar technologies to
            enhance your experience and analyze app usage.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
        <p>We use your information for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>To provide, maintain, and improve our services.</li>
          <li>To personalize your experience and show relevant content.</li>
          <li>To communicate with you about updates, support, and promotions.</li>
          <li>To analyze app usage and improve functionality.</li>
          <li>To comply with legal obligations and protect our rights.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">4. Data Sharing and Disclosure</h2>
        <p>We do not sell your personal information. However, we may share it in the following cases:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Service Providers:</strong> With third-party vendors who assist in operating our
            app (e.g., hosting, analytics).
          </li>
          <li>
            <strong>Legal Requirements:</strong> When required by law or to protect our rights and
            safety.
          </li>
          <li>
            <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of
            assets.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">5. Data Security</h2>
        <p>
          We take reasonable measures to protect your data from unauthorized access, alteration, or
          destruction. However, no method of transmission over the internet is 100% secure.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">6. Your Rights</h2>
        <p>You have the following rights regarding your data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access and update your personal information.</li>
          <li>Request deletion of your data.</li>
          <li>Opt-out of marketing communications.</li>
          <li>Withdraw consent for data processing.</li>
        </ul>
        <p>
          To exercise these rights, contact us at [Insert Contact Email].
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">7. Third-Party Links</h2>
        <p>
          Our app may contain links to third-party websites or services. We are not responsible for
          their privacy practices. Please review their policies before providing any information.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of significant
          changes by posting the new policy on our app or sending you an email.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p className="font-semibold">[Insert Contact Email]</p>
      </section>
    </div>
  );
}