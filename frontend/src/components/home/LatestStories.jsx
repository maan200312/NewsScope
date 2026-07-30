import { useNavigate } from "react-router-dom";
import BiasBarSmall from "./BiasBarSmall";
import timeAgo from "../../utils/timeAgo";

function LatestStories({ news = [] }) {
  const navigate = useNavigate();

  if (!news || news.length === 0) {
    return <div className="text-sm text-zinc-500 py-10">No stories found</div>;
  }

  return (
    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {news.map((article) => (
        <div key={article.id} className="grid grid-cols-4 gap-4 py-4 group">
          <div className="col-span-3">
            <p className="text- text-zinc-500 mb-1 uppercase">
              {article.category || "General"} • {article.source_count} sources
            </p>

            <h2
              onClick={() => navigate(`/cluster/${article.slug || article.id}`)}
              className="text- font-bold leading-tight cursor-pointer hover:text-blue-600 line-clamp-2"
            >
              {article.main_title || article.title}
            </h2>

            <div className="mt-2 ">
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
            <img
              src={article.hero_image || article.image_url}
              alt=""
              className="w-full h-24 object-cover rounded-md"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default LatestStories;