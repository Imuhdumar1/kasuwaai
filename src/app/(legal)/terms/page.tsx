export const metadata = {
  title: "Terms of Service — KasuwaAI",
  description: "The terms governing your use of KasuwaAI.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().getFullYear()}</p>

      <p>
        These Terms govern your use of KasuwaAI (the &quot;App&quot;). By creating an account or using
        the App, you agree to these Terms. If you do not agree, please do not use the App.
      </p>

      <h2>1. Your account</h2>
      <ul>
        <li>You must provide accurate information and keep your login details secure.</li>
        <li>One account is allowed per email address and per phone number.</li>
        <li>You are responsible for all activity under your account.</li>
      </ul>

      <h2>2. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the App for anything unlawful, fraudulent, or harmful.</li>
        <li>Send spam, harassment, or unlawful messages when contacting your customers (including via WhatsApp or SMS reminders).</li>
        <li>Attempt to break, overload, reverse-engineer, or gain unauthorised access to the App or other users&apos; data.</li>
      </ul>

      <h2>3. Your data and your customers</h2>
      <p>
        You own the business records you enter and are responsible for the accuracy and lawful use of
        your customers&apos; information, including obtaining any consent required to store their
        details and send them messages. See our{" "}
        <a href="/privacy">Privacy Policy</a> for how we handle data.
      </p>

      <h2>4. Voice and AI features</h2>
      <p>
        Voice transcription and the AI assistant are provided to help you draft and understand your
        records. They can make mistakes — always review the details before saving. You remain
        responsible for the correctness of every sale, payment, and debt you record.
      </p>

      <h2>5. Service availability</h2>
      <p>
        We work to keep the App available and reliable, but we provide it &quot;as is&quot; and cannot
        guarantee uninterrupted or error-free service. We may perform maintenance or update features
        from time to time.
      </p>

      <h2>6. Fees</h2>
      <p>
        KasuwaAI is currently free to use. If paid plans are introduced in future, we will give notice
        and you may choose whether to continue.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, KasuwaAI is not liable for any indirect or
        consequential loss, or for loss of profits, data, or goodwill arising from your use of the App.
        The App is a record-keeping tool and is not a substitute for professional accounting or legal
        advice.
      </p>

      <h2>8. Termination</h2>
      <p>
        You may stop using the App and delete your account at any time. We may suspend or terminate
        accounts that breach these Terms.
      </p>

      <h2>9. Governing law</h2>
      <p>These Terms are governed by the laws of the Federal Republic of Nigeria.</p>

      <h2>10. Contact</h2>
      <p>
        Questions about these Terms? Contact us at{" "}
        <a href="mailto:support@kasuwaai.app">support@kasuwaai.app</a>.
      </p>

      <p className="!mt-8 !text-xs">
        This document is a general template for a Nigerian small-business app and is not legal advice.
        Please have it reviewed by a qualified legal practitioner before relying on it commercially.
      </p>
    </>
  );
}
