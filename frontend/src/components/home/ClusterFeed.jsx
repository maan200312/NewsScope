import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BiasBarSmall from "./BiasBarSmall";
import timeAgo from "../../utils/timeAgo";

function ClusterFeed({ news = [] }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(6);

  if (!news?.length) return null;
  const toShow = news.slice(0, visible);

  return (
    <div className="mt-6">
      {/* Latest Stories jesi heading */}
      <h2 className="text- font-black  text-3xl mb-2 dark:text-white">
        Latest Stories
      </h2>
      <div className="h- w-full bg-zinc-900 dark:bg-white mb-4"></div>

      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {toShow.map((article) => (
          <div key={article.id} className="grid grid-cols-4 gap-4 py-5 group">
            <div className="col-span-3">
              <p className="text- text-zinc-500 mb-1.5 uppercase tracking-wide">
                {article.category || "General"} • {article.source_count} sources
              </p>
              <h2
                onClick={() => navigate(`/cluster/${article.slug || article.id}`)}
                className="text- font-bold leading-[1.3] cursor-pointer hover:underline line-clamp-2 dark:text-white"
              >
                {article.main_title || article.title}
              </h2>
              <div className="mt-2 max-w-">
                <BiasBarSmall
                  leftCount={article.left_sources?? article.left_count?? 0}
                  centerCount={article.center_sources?? article.center_count?? 0}
                  rightCount={article.right_sources?? article.right_count?? 0}
                />
              </div>
              <div className="mt-2 flex items-center gap-2 text- text-zinc-500">
                <span>{article.source_count} sources</span>
                <span>•</span>
                <span>{timeAgo(article.latest_published)}</span>
              </div>
            </div>
            <div onClick={() => navigate(`/cluster/${article.slug || article.id}`)} className="cursor-pointer">
              <img src={article.hero_image || article.image_url} alt="" className="w-full h-20 object-cover rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {visible < news.length && (
        <div className="mt-8">
          <button
            onClick={() => setVisible((v) => v + 6)}
            className="border border-zinc-900 dark:border-zinc-200 rounded- px-5 py- text- font-medium bg-white dark:bg-transparent hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition"
          >
            More stories
          </button>
        </div>
      )}
    </div>
  );
}
export default ClusterFeed;