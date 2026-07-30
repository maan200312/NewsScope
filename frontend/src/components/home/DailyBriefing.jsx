import { Link } from "react-router-dom";

function DailyBriefing({ news = [] }) {

    const topStories = news.slice(1, 6);

    return (

        <aside className="sticky top-24">

            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6">

                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    Daily Briefing
                </h2>

                <div className="space-y-5">

                    {topStories.map((story) => (

                        <Link
                            key={story.id}
                            to={`/cluster/${story.slug}`}
                            className="group block border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0"
                        >

                            <h3 className="text-sm font-semibold leading-5 text-gray-900 dark:text-white group-hover:text-blue-600 transition">

                                {story.main_title}

                            </h3>

                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">

                                {story.article_count} Articles • {story.source_count} Sources

                            </p>

                        </Link>

                    ))}

                </div>

            </div>

        </aside>

    );

}

export default DailyBriefing;