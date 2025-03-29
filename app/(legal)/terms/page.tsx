import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - GibbiAI",
  description: "Learn the rules and guidelines for using GibbiAI.",
};

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="text-muted-foreground">
        Last updated: [Insert Date]
      </p>

      <section>
        <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
        <p>
          By accessing or using GibbiAI (`&quot;`the App`&quot;`), you agree to be bound by these Terms of Service
          (`&quot;`Terms`&quot;`). If you do not agree to these Terms, you may not use the App.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">2. Use of the App</h2>
        <p>You agree to use the App only for lawful purposes and in accordance with these Terms:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You must be at least 13 years old to use the App.</li>
          <li>You are responsible for maintaining the confidentiality of your account and password.</li>
          <li>You agree not to use the App for any illegal or unauthorized purpose.</li>
          <li>You must not interfere with or disrupt the operation of the App.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">3. Intellectual Property</h2>
        <p>
          All content, features, and functionality of the App, including but not limited to text,
          graphics, logos, and software, are the property of GibbiAI or its licensors and are
          protected by intellectual property laws.
        </p>
        <p>
          You may not reproduce, distribute, modify, or create derivative works of any content
          without our prior written consent.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">4. User Content</h2>
        <p>
          You retain ownership of any content you create or upload to the App (`&quot;`User Content`&quot;`).
          However, by submitting User Content, you grant GibbiAI a worldwide, non-exclusive,
          royalty-free license to use, reproduce, and display your content for the purpose of
          operating and improving the App.
        </p>
        <p>
          You are solely responsible for your User Content and agree not to submit any content that
          is illegal, offensive, or violates the rights of others.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">5. Prohibited Activities</h2>
        <p>You agree not to engage in any of the following activities:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Violating any applicable laws or regulations.</li>
          <li>Harassing, abusing, or harming others.</li>
          <li>Uploading viruses or malicious code.</li>
          <li>Attempting to gain unauthorized access to the App or its systems.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">6. Limitation of Liability</h2>
        <p>
          GibbiAI and its affiliates shall not be liable for any indirect, incidental, or
          consequential damages arising out of your use of the App. In no event shall our total
          liability exceed the amount you paid to use the App.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">7. Termination</h2>
        <p>
          We reserve the right to terminate or suspend your access to the App at any time, without
          notice, for any reason, including but not limited to a violation of these Terms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">8. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. We will notify you of significant changes by
          posting the new Terms on the App or sending you an email. Your continued use of the App
          after such changes constitutes your acceptance of the updated Terms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">9. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of New Delhi, without regard to its conflict of law principles.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">10. Contact Us</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at:
        </p>
        <p className="font-semibold">princediwakar25@gmail.com</p>
      </section>
    </div>
  );
}