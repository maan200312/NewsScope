import { Link } from "react-router-dom";
import BlindspotCard from "./BlindspotCard";

function RightSidebar({ blindspot = [] }) {
  return (
    <aside className="sticky top-24">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Blindspots
          </h2>
        </div>

        <p className="mb-5 text- leading-5 text-gray-500 dark:text-gray-400">
          Stories disproportionately covered by one side of the political spectrum.
        </p>

        <div className="space-y-6">
          {blindspot.length > 0? (
            blindspot.slice(0, 2).map((cluster) => (
              <BlindspotCard key={cluster.id} cluster={cluster} />
            ))
          ) : (
            <p className="text-gray-500">No blindspot stories available.</p>
          )}
        </div>

        <Link
          to="/blindspot"
          className="block text-center border border-gray-200 dark:border-gray-700 rounded-xl p-3 mt-6 text-sm font-semibold bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          View Blindspot Feed
        </Link>
      </div>
    </aside>
  );
}

export default RightSidebar;