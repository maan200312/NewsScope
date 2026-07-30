import { Link } from "react-router-dom";
import BiasBar from "../common/biasbar";

function BlindspotCard({ cluster }) {
  if (!cluster) return null;

  return (
    <Link
      to={`/cluster/${cluster.slug}`}
      className="group block w-full overflow-hidden rounded-xl border- border-[#6e1e1e] dark:border-[#4a1212] bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={cluster.hero_image || "https://placehold.co/400x250?text=No+Image"}
          alt={cluster.main_title}
          className="w-full h- object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
      </div>

      <div className="p-3.5 bg-white dark:bg-zinc-900">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#5a1a1a] dark:bg-[#7f1d1d] text-white text- font-black tracking-wide px-2.5 py-1 rounded">
            Blindspot
          </span>
          <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text- font-semibold px-2.5 py-1 rounded-full">
            {cluster.source_count} Sources
          </span>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text- leading-[1.3] line-clamp-2 min-h- text-zinc-900 dark:text-white group-hover:text-[#6e1e1e] dark:group-hover:text-red-400 transition-colors">
          {cluster.main_title}
        </h3>

        {/* BiasBar */}
        <div className="mt-3.5 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <BiasBar
            leftCount={cluster.left_sources}
            centerCount={cluster.center_sources}
            rightCount={cluster.right_sources}
          />
        </div>
      </div>
    </Link>
  );
}

export default BlindspotCard;