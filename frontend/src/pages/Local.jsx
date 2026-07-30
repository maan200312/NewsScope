import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BiasBar from "../components/common/BiasBar";
import getTimeAgo from "../utils/timeAgo";

function Local() {
  const navigate = useNavigate();
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("pk");

  const countries = [
    { label: "Pakistan", value: "pk" },
    { label: "United States", value: "us" },
    { label: "United Kingdom", value: "gb" },
    { label: "India", value: "in" },
    { label: "Canada", value: "ca" },
    { label: "Australia", value: "au" },
    { label: "Germany", value: "de" },
    { label: "France", value: "fr" },
  ];

  useEffect(() => {
    const loadLocalNews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:8000/api/clusters/local/?country=${selectedCountry}`
        );
        setClusters(response.data.results || response.data);
      } catch (err) {
        setError("Failed to load local news.");
      } finally {
        setLoading(false);
      }
    };
    loadLocalNews();
  }, [selectedCountry]);

  const filteredClusters = useMemo(() => {
    if (!search.trim()) return clusters;
    return clusters.filter((cluster) => {
      const title = (cluster.main_title || cluster.title || "").toLowerCase();
      return title.includes(search.toLowerCase());
    });
  }, [clusters, search]);

  const heroCluster = filteredClusters[0];
  const latestClusters = filteredClusters.slice(1);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#fafafa] dark:bg-black">
        <div className="w-6 h-6 border-2 border-zinc-300 border-t-black dark:border-zinc-700 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }
  if (error) {
    return <div className="min-h-screen flex justify-center items-center text-red-500">{error}</div>;
  }

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-black text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-5 md:px-6 py-6 md:py-8">
        {/* HEADER - Compact */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Local News</h1>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">Local stories from trusted sources.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full">
              {filteredClusters.length} stories • {countries.find(c=>c.value===selectedCountry)?.label}
            </span>
          </div>
        </div>

        {/* HERO + SIDEBAR */}
        <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-6">
          {/* HERO - Clean Card */}
          <div>
            {heroCluster ? (
              <div
                onClick={() => navigate(`/cluster/${heroCluster.slug || heroCluster.id}`)}
                className="group cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-md transition-all"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={heroCluster.hero_image || heroCluster.image_url || "https://placehold.co/800x450"}
                    alt={heroCluster.main_title}
                    className="w-full h-[280px] md:h-[340px] object-cover group-hover:scale-[1.02] transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 p-5 md:p-6 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-1 bg-white text-black rounded-full uppercase tracking-wide">{heroCluster.category}</span>
                      <span className="text-[11px] text-white/80">{heroCluster.source_count} sources • {getTimeAgo(heroCluster.latest_published)}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold leading-tight text-white line-clamp-2">{heroCluster.main_title}</h2>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <BiasBar leftCount={heroCluster.left_sources} centerCount={heroCluster.center_sources} rightCount={heroCluster.right_sources} />
                  <span className="text-[11px] text-zinc-500">{heroCluster.hero_source}</span>
                </div>
              </div>
            ) : (
              <div className="h-[340px] border border-dashed rounded-2xl flex items-center justify-center text-zinc-400">No hero story</div>
            )}
          </div>

          {/* RIGHT PANEL - Theme oriented compact */}
          <aside className="h-fit bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sticky top-6">
            <h2 className="text-[15px] font-bold flex items-center gap-2">🌍 Location</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Filter local news by country</p>

            <div className="relative mt-4">
              <input
                type="text"
                placeholder="Search stories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 placeholder:text-zinc-400"
              />
            </div>

            <button
              onClick={() => { setSelectedCountry("pk"); setSearch(""); }}
              className="w-full mt-3 bg-black dark:bg-white text-white dark:text-black rounded-full py-2.5 text-sm font-medium hover:opacity-90 transition"
            >
              📍 Pakistan
            </button>

            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Popular</h3>
              <div className="flex flex-wrap gap-2">
                {countries.map((country) => (
                  <button
                    key={country.value}
                    onClick={() => setSelectedCountry(country.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      selectedCountry === country.value
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {country.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* LATEST STORIES - Compact & Professional */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Latest Local Stories</h2>
            <span className="text-xs text-zinc-500">{latestClusters.length} more</span>
          </div>

          {latestClusters.length === 0 ? (
            <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
              <p className="text-sm text-zinc-500">No local news found for this location.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {latestClusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex gap-4 hover:shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full uppercase tracking-wide">{cluster.category}</span>
                      <span className="text-[10px] text-zinc-500">{cluster.source_count} sources • {getTimeAgo(cluster.latest_published)}</span>
                    </div>
                    <h3
                      onClick={() => navigate(`/cluster/${cluster.slug || cluster.id}`)}
                      className="text-[14px] font-bold leading-snug line-clamp-2 cursor-pointer group-hover:text-blue-600 dark:group-hover:text-blue-400 transition"
                    >
                      {cluster.main_title || cluster.title}
                    </h3>
                    <div className="mt-3 max-w-[180px]">
                      <BiasBar leftCount={cluster.left_sources} centerCount={cluster.center_sources} rightCount={cluster.right_sources} />
                    </div>
                  </div>
                  <div
                    onClick={() => navigate(`/cluster/${cluster.slug || cluster.id}`)}
                    className="w-[88px] h-[88px] md:w-[96px] md:h-[96px] shrink-0 rounded-xl overflow-hidden cursor-pointer bg-zinc-100 dark:bg-zinc-800"
                  >
                    <img
                      src={cluster.hero_image || cluster.image_url || "https://placehold.co/200x200"}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Local;