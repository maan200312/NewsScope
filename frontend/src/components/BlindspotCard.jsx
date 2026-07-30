import { Link } from "react-router-dom";

function BlindspotCard({ article }) {
  const total =
    (article.left_sources ?? 0) +
    (article.center_sources ?? 0) +
    (article.right_sources ?? 0);

  const left =
    total > 0
      ? Math.round((article.left_sources / total) * 100)
      : 0;

  const center =
    total > 0
      ? Math.round((article.center_sources / total) * 100)
      : 0;

  const right =
    total > 0
      ? Math.round((article.right_sources / total) * 100)
      : 0;

  const blindspotLabel =
    article.left_sources === 0
      ? `Only ${left}% Left`
      : `Only ${right}% Right`;

  return (
    <Link
      to={`/cluster/${article.slug}`}
      className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* IMAGE */}
      <div className="overflow-hidden">
        <img
          src={article.hero_image}
          alt={article.main_title}
          className="w-full h-52 object-cover hover:scale-105 transition duration-500"
        />
      </div>

      <div className="p-4">
        {/* TOP */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              🕶 Blindspot
            </span>
            <span className="bg-red-700 text-white text-xs font-bold px-2 py-1 rounded">
              {blindspotLabel}
            </span>
          </div>
          <span className="text-sm ">
            {article.source_count} sources
          </span>
        </div>

        {/* TITLE - ✅ Click se cluster detail */}
        <h2 className="text-xl font-bold leading-7 line-clamp-2 hover:text-blue-700 transition">
          {article.main_title}
        </h2>

        {/* Bias Distribution */}
        <div className="mt-5 space-y-3">
          {/* Left */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-red-600 font-semibold">Left</span>
              <span>{left}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-red-600 h-full rounded-full" style={{ width: `${left}%` }} />
            </div>
          </div>

          {/* Center */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-semibold">Center</span>
              <span>{center}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-gray-400 h-full rounded-full" style={{ width: `${center}%` }} />
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-blue-700 font-semibold">Right</span>
              <span>{right}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-blue-800 h-full rounded-full" style={{ width: `${right}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default BlindspotCard;