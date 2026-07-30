import BiasBar from "../common/biasbar";
import { Link } from "react-router-dom";

function Hero({ article }) {
  if (!article) {
    return (
      <div className="h- flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-xl text-sm">
        Loading...
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-xl group">

      <img
        src={article.hero_image || article.image_url || `https://picsum.photos/seed/${article.id}/600/400`}
        alt={article.main_title}
        className="w-full h-80 object-cover"
      />

      <div className="absolute inset-0 bg-black/45"></div>

      <div className="absolute inset-0 flex flex-col justify-end p-3">

        <Link to={`/cluster/${article.slug}`}>
          <h1 className="text-white text-3xl font-bold leading-[1.2] p-2 line-clamp-2 hover:underline">
            {article.main_title || article.title}
          </h1>
        </Link>

        <div className="mt-1.5 w-[100%]">
          <BiasBar
            leftCount={article.left_sources?? 0}
            centerCount={article.center_sources?? 0}
            rightCount={article.right_sources?? 0}
          />
        </div>

      </div>
    </section>
  );
}

export default Hero;