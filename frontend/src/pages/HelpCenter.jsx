import { useState } from "react";

export default function HelpCenter() {
  const [openIndex, setOpenIndex] = useState(null);

  const articles = [
    {
      title: "Getting Started with NewsScope",
      icon: "🚀",
      content: "NewsScope is your intelligent news companion that helps you see every side of every story. Unlike traditional news apps, NewsScope aggregates articles from hundreds of trusted sources worldwide and organizes them into meaningful clusters. You can browse trending stories, compare how different outlets cover the same event, and discover perspectives you might have missed. Simply select your favorite categories from the top bar, use the search to find specific topics, and dive into detailed coverage. Your personalized For You feed learns from your interests to deliver news that truly matters to you.",
    },
    {
      title: "How News Clusters Work",
      icon: "📰",
      content: "NewsScope uses advanced AI to group similar news articles into a single cluster. When multiple outlets report on the same event, our system intelligently identifies the common story and bundles all related articles together. Each cluster shows you the main headline, a hero image, the category, and how many sources are covering it. Inside a cluster, you can read the full coverage from different publishers side by side, compare headlines, and understand the complete picture. This saves you time from visiting multiple sites and helps you avoid missing important angles of a story.",
    },
    {
      title: "Understanding Bias Analysis",
      icon: "⚖️",
      content: "Every news outlet has an editorial perspective, and NewsScope believes transparency is key. Our Bias Analysis feature examines how different sources report on the same cluster and provides an overview of their political or editorial leaning. We analyze language, framing, and coverage focus to help you understand if a story is presented from a left, center, or right perspective. This doesn't mean one source is right or wrong — it helps you recognize different viewpoints and form your own balanced opinion. You can find the bias breakdown inside each cluster detail page with visual indicators.",
    },
    {
      title: "Saving & Managing Articles",
      icon: "🔖",
      content: "Found an interesting story you want to read later? NewsScope makes it easy to save. Click the bookmark icon on any article card or inside the cluster detail page, and it will be instantly saved to your Saved Stories tab in the For You section. Your saved articles are synced to your account, so you can access them from any device. You can organize your reading list, remove articles you've finished, and even filter your saved stories by category. It's your personal news library that grows with your interests, always available when you need it.",
    },
    {
      title: "Account & Personalization",
      icon: "👤",
      content: "Creating a free NewsScope account unlocks the full experience. With an account, you can save unlimited articles, personalize your feed by selecting preferred categories, and get a tailored homepage that reflects your interests. Your For You feed adapts based on the categories you select in the top bar — choose from Politics, Business, Technology, Sports, Health, and more. Your preferences are stored securely and you can update them anytime. Account also enables future features like daily briefings, email digests, and personalized notifications for breaking news in your favorite topics.",
    },
    {
      title: "Contact Support",
      icon: "💬",
      content: "Need more help or have a suggestion to improve NewsScope? Our team is here to assist you. Whether you are facing a technical issue, have feedback about our clustering, or want to report a problem with an article, we want to hear from you. Email us at support@newsscope.com and we typically respond within 24 hours. You can also reach us through the feedback option in your account menu. We constantly work to make NewsScope more accurate, faster, and more useful, and your input directly shapes our updates and new features.",
    },
  ];

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 min-h-screen">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Help Center
        </h1>
        <p className="text-sm md:text-[14px] text-zinc-500 dark:text-zinc-400 mt-3 max-w-2xl">
          Welcome to <span className="font-semibold text-black dark:text-white">NewsScope</span> — Find answers to common questions and learn how to get the most out of your news experience.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {articles.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`group bg-white dark:bg-zinc-900 border rounded-xl transition-all ${isOpen ? "border-black dark:border-white shadow-sm" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"}`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between gap-4 p-4 md:p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[16px] shrink-0 transition-colors ${isOpen ? "bg-black dark:bg-white text-white dark:text-black" : "bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"}`}>
                    {item.icon}
                  </div>
                  <h2 className="font-semibold text-[14px] md:text-[15px]">
                    {item.title}
                  </h2>
                </div>

                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[16px] font-light shrink-0 transition-all ${isOpen ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white rotate-0" : "border-zinc-200 dark:border-zinc-700 text-zinc-500"}`}>
                  {isOpen ? "−" : "+"}
                </div>
              </button>

              {/* Expandable Content */}
              <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <div className="px-4 md:px-5 pb-5 pt-1">
                    <div className="ml-12 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                      <p className="text-[13px] md:text-[14px] leading-6 md:leading-7 text-zinc-600 dark:text-zinc-300">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

  
    </div>
  );
}