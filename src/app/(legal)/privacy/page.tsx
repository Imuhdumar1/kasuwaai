export const metadata = {
  title: "Privacy Policy — KasuwaAI",
  description: "How KasuwaAI collects, uses, and protects your business data.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().getFullYear()}</p>

      <p>
        KasuwaAI (&quot;we&quot;, &quot;us&quot;, the &quot;App&quot;) helps traders, shop owners, and
        small businesses record sales, customers, debts, and payments. This policy explains what data
        we collect and how we handle it. We aim to comply with the{" "}
        <strong>Nigeria Data Protection Act 2023 (NDPA)</strong> and the NDPR.
      </p>

      <h2>1. Who is responsible for your data</h2>
      <p>
        When you use KasuwaAI to run your business, <strong>you are the data controller</strong> of the
        customer information you enter (names, phone numbers, balances, etc.). KasuwaAI acts as a data
        processor that stores and processes that information on your behalf. You are responsible for
        having a lawful basis to collect your customers&apos; details and for how you use them
        (including sending reminders by WhatsApp or SMS).
      </p>

      <h2>2. Information we collect</h2>
      <ul>
        <li><strong>Account &amp; business profile:</strong> your name, email, phone, business name, category, market/location, state and LGA.</li>
        <li><strong>Business records you create:</strong> customers, products, sales, payments, debts and notes.</li>
        <li><strong>Voice input:</strong> when you use voice recording, speech is converted to text in your browser to draft a sale; we do not store audio recordings on our servers.</li>
        <li><strong>Technical data:</strong> basic logs and error reports needed to keep the service running and secure.</li>
      </ul>

      <h2>3. How we use your information</h2>
      <ul>
        <li>To provide the App — record and calculate your sales, debts, payments and reports.</li>
        <li>To authenticate you and keep your account secure.</li>
        <li>To send you service and password/verification emails.</li>
        <li>To detect, prevent and fix errors, fraud and abuse.</li>
      </ul>
      <p>We do not sell your data, and we do not use your business records for advertising.</p>

      <h2>4. Legal basis</h2>
      <p>
        We process your data on the basis of the contract to provide the service to you, your consent,
        our legitimate interest in operating and securing the App, and, where applicable, legal
        obligations under Nigerian law.
      </p>

      <h2>5. Service providers</h2>
      <p>
        We use trusted providers to run KasuwaAI. Your data is stored with{" "}
        <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase</a>{" "}
        (database &amp; authentication) and the App is hosted on{" "}
        <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel</a>.
        We may use error-monitoring and rate-limiting services to keep the App reliable. These
        providers process data only to deliver their services to us.
      </p>

      <h2>6. Data security</h2>
      <p>
        Data is encrypted in transit (HTTPS) and access is restricted so that each business can only
        see its own records (row-level security). We keep dependencies updated and monitor for errors.
        No system is 100% secure, but we take reasonable measures to protect your information.
      </p>

      <h2>7. Data retention</h2>
      <p>
        We keep your data for as long as your account is active. You can delete individual records at
        any time, and you can request deletion of your account and its data by contacting us.
      </p>

      <h2>8. Your rights</h2>
      <p>Under the NDPA/NDPR you have the right to access, correct, delete, or export your personal data, to object to certain processing, and to withdraw consent. To exercise these rights, contact us using the details below.</p>

      <h2>9. Children</h2>
      <p>KasuwaAI is intended for business owners and is not directed at children under 18.</p>

      <h2>10. Changes</h2>
      <p>We may update this policy from time to time. Material changes will be reflected by the &quot;Last updated&quot; date above.</p>

      <h2>11. Contact</h2>
      <p>
        For any privacy question or request, contact us at{" "}
        <a href="mailto:support@kasuwaai.app">support@kasuwaai.app</a>.
      </p>

      <p className="!mt-8 !text-xs">
        This document is a general template for a Nigerian small-business app and is not legal advice.
        Please have it reviewed by a qualified legal practitioner before relying on it commercially.
      </p>
    </>
  );
}
