import { useState } from "react";

export default function FAQ(){
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "How does NewsScope clustering work?",
      a: "NewsScope uses advanced AI to identify when multiple outlets report on the same event. Our models analyze headlines, content, and timestamps to group similar stories into a single cluster. This lets you see all coverage in one place instead of browsing multiple sites. Each cluster shows the main story, hero image, category, and source count."
    },
    {
      q: "How is bias calculated?",
      a: "We analyze language, framing, headline choices, and source history using NLP models. Bias is not about fact-checking, but about perspective — whether coverage leans left, center, or right. Inside each cluster detail page, you can see a breakdown of how different outlets covered the same story, helping you understand diverse viewpoints."
    },
    {
      q: "Is NewsScope free to use?",
      a: "Yes, NewsScope is completely free. You can browse all clusters, read bias analysis, and use search without an account. Creating a free account unlocks extra features like saving articles, personalized For You feed, and future features like daily briefings and email digests."
    },
    {
      q: "How is NewsScope different from other news apps?",
      a: "Most news apps show you a single feed from selected sources. NewsScope shows you every side of every story. We don't just aggregate — we cluster similar stories, compare coverage, and highlight bias transparently. You get less repetition and more perspective in one clean interface."
    },
    {
      q: "How often is news updated?",
      a: "NewsScope fetches new articles every few minutes. Top Stories, Latest Stories, and Blindspot sections are refreshed automatically. Our clustering runs continuously, so breaking news appears within minutes of publication across sources."
    },
    {
      q: "Can I personalize my feed?",
      a: "Absolutely. Click any category in the top bar like Politics, Technology, or Sports to filter your feed. Your selections are saved and your For You page will only show stories matching your chosen categories. You can also combine categories with search to narrow results further."
    },
    {
      q: "What is the Blindspot section?",
      a: "Blindspot highlights stories that are getting heavily covered by one side of the media spectrum but ignored by the other. It helps you discover under-reported stories and understand potential coverage gaps across different outlets."
    },
    {
      q: "How does the search work?",
      a: "The search bar in the navbar lets you search by title. Type any keyword and you'll get instant suggestions showing matching stories with images. Click any suggestion to go directly to its cluster detail page. Search works independently of category filters."
    },
    {
      q: "Can I save articles for later?",
      a: "Yes. Click the bookmark icon on any article card or inside cluster detail. Saved articles go to your Saved Stories tab in For You. You need to be logged in to save, and your saved list syncs across devices."
    },
    {
      q: "How do I report an issue or give feedback?",
      a: "We love feedback! If you find incorrect clustering, missing images, or have ideas to improve NewsScope, email us at support@newsscope.com. We review every message and use it to improve our AI models and user experience."
    },
  ];

  return(
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">
          Everything you need to know about <span className="font-semibold text-black dark:text-white">NewsScope</span>
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className={`bg-white dark:bg-zinc-900 border rounded-xl transition-all ${isOpen ? "border-black dark:border-white shadow-sm" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"}`}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-4 p-4 md:p-5 text-left"
              >
                <h2 className="font-semibold text-[14px] md:text-[15px] leading-snug pr-2">
                  {item.q}
                </h2>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[16px] shrink-0 transition-all ${isOpen ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "border-zinc-200 dark:border-zinc-700 text-zinc-500"}`}>
                  {isOpen ? "−" : "+"}
                </div>
              </button>

              <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <div className="px-4 md:px-5 pb-5">
                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                      <p className="text-[13px] md:text-[14px] leading-6 md:leading-7 text-zinc-600 dark:text-zinc-300">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}