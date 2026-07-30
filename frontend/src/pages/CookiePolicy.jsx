export default function CookiePolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 min-h-screen">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Cookie Policy
            </h1>

            <p className="text-sm mt-2 mb-8">
                Last Updated: July 2026
            </p>

            <div className="space-y-4 leading-7 md:leading-8">

                <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3">
                        1. What Are Cookies?
                    </h2>
                    <p className="text-[14px]">
                        Cookies are small text files stored on your device when you visit a
                        website. They help remember your preferences and improve your
                        browsing experience.
                    </p>
                </section>

                <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3">
                        2. How We Use Cookies
                    </h2>
                    <ul className="list-disc pl-6 space-y-2 text-[14px]">
                        <li>Remember your preferences.</li>
                        <li>Keep you signed in.</li>
                        <li>Improve website performance.</li>
                        <li>Analyze visitor activity.</li>
                        <li>Enhance website security.</li>
                    </ul>
                </section>

                <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3">
                        3. Types of Cookies
                    </h2>
                    <ul className="list-disc pl-6 space-y-2 text-[14px]">
                        <li><strong>Essential Cookies:</strong> Required for basic website functionality.</li>
                        <li><strong>Performance Cookies:</strong> Help us understand website usage.</li>
                        <li><strong>Preference Cookies:</strong> Save language and theme settings.</li>
                        <li><strong>Analytics Cookies:</strong> Measure traffic and improve user experience.</li>
                    </ul>
                </section>

                <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3">
                        4. Third-Party Cookies
                    </h2>
                    <p className="text-[14px]">
                        Some services such as analytics or embedded content may place
                        cookies through trusted third-party providers. These providers have
                        their own privacy and cookie policies.
                    </p>
                </section>

                <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3">
                        5. Managing Cookies
                    </h2>
                    <p className="text-[14px]">
                        Most browsers allow you to control, block, or delete cookies from
                        your browser settings. Disabling cookies may affect certain website
                        features.
                    </p>
                </section>

                <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3">
                        6. Changes to This Policy
                    </h2>
                    <p className="text-[14px]">
                        We may update this Cookie Policy from time to time. Any changes will
                        be published on this page with an updated revision date.
                    </p>
                </section>

            </div>
        </div>
    );
}