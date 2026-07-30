export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight">
        Privacy Policy
      </h1>

      <p className="text-sm mt-2 mb-8">
        Last Updated: July 2026
      </p>

      <div className="space-y-8 leading-7 md:leading-8">

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            1. Introduction
          </h2>
          <p className="text-[14px]">
            Welcome to <span className="font-bold">NewsScope</span>. We value your privacy and are committed to
            protecting your personal information. This Privacy Policy explains
            how we collect, use, and safeguard your data while you use our
            website.
          </p>
        </section>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            2. Information We Collect
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-[14px]">
            <li>Name and email address (if you create an account).</li>
            <li>Saved articles and preferences.</li>
            <li>Device and browser information.</li>
            <li>Anonymous analytics data to improve our services.</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-[14px]">
            <li>Provide personalized news recommendations.</li>
            <li>Improve website performance.</li>
            <li>Respond to support requests.</li>
            <li>Maintain account security.</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            4. Cookies
          </h2>
          <p className="text-[14px]">
            We use cookies to remember your preferences, improve user
            experience, and analyze website traffic. You can disable cookies
            from your browser settings at any time.
          </p>
        </section>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            5. Data Security
          </h2>
          <p className="text-[14px]">
            We use reasonable security measures to protect your personal
            information. However, no online platform can guarantee complete
            security.
          </p>
        </section>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            6. Third-Party Services
          </h2>
          <p className="text-[14px]">
            Our website may use third-party services such as analytics tools or
            external news sources. These services have their own privacy
            policies.
          </p>
        </section>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            7. Your Rights
          </h2>
          <p className="text-[14px]">
            You may request access, correction, or deletion of your personal
            data at any time by contacting our support team at support@newsscope.com.
          </p>
        </section>

      </div>
    </div>
  );
}