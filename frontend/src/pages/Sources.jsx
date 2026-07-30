import { useEffect, useState } from "react";
import axios from "axios";

export default function Sources() {
  const [sources, setSources] = useState([]);
  const [search, setSearch] = useState("");

  const fallbackSources = [
    { name: "Times of India", domain: "timesofindia.indiatimes.com", logo: "https://www.google.com/s2/favicons?domain=timesofindia.indiatimes.com&sz=64", color: "bg-red-600" },
    { name: "The Hindu", domain: "thehindu.com", logo: "https://www.google.com/s2/favicons?domain=thehindu.com&sz=64", color: "bg-white" },
    { name: "Metrópoles", domain: "metropoles.com", logo: "https://www.google.com/s2/favicons?domain=metropoles.com&sz=64", color: "bg-red-600" },
    { name: "La Razón", domain: "larazon.es", logo: "https://www.google.com/s2/favicons?domain=larazon.es&sz=64", color: "bg-blue-700" },
    { name: "Haberler", domain: "haberler.com", logo: "https://www.google.com/s2/favicons?domain=haberler.com&sz=64", color: "bg-red-600" },
    { name: "Seeking Alpha", domain: "seekingalpha.com", logo: "https://www.google.com/s2/favicons?domain=seekingalpha.com&sz=64", color: "bg-orange-500" },
    { name: "Dainik Bhaskar", domain: "bhaskar.com", logo: "https://www.google.com/s2/favicons?domain=bhaskar.com&sz=64", color: "bg-white" },
    { name: "LaProvence", domain: "laprovence.com", logo: "https://www.google.com/s2/favicons?domain=laprovence.com&sz=64", color: "bg-black" },
    { name: "Pmg-ky3", domain: "pmg-ky3.com", logo: "https://www.google.com/s2/favicons?domain=pmg-ky3.com&sz=64", color: "bg-black" },
    { name: "News-Topic", domain: "news-topic.com", logo: "https://www.google.com/s2/favicons?domain=news-topic.com&sz=64", color: "bg-white" },
    { name: "Ussa News", domain: "ussanews.com", logo: "https://www.google.com/s2/favicons?domain=ussanews.com&sz=64", color: "bg-black" },
    { name: "Gazete Pencere", domain: "gazetepencere.com", logo: "https://www.google.com/s2/favicons?domain=gazetepencere.com&sz=64", color: "bg-black" },
    { name: "BBC News", domain: "bbc.com", logo: "https://www.google.com/s2/favicons?domain=bbc.com&sz=64", color: "bg-black" },
    { name: "CNN", domain: "cnn.com", logo: "https://www.google.com/s2/favicons?domain=cnn.com&sz=64", color: "bg-red-600" },
    { name: "Reuters", domain: "reuters.com", logo: "https://www.google.com/s2/favicons?domain=reuters.com&sz=64", color: "bg-orange-600" },
    { name: "Al Jazeera", domain: "aljazeera.com", logo: "https://www.google.com/s2/favicons?domain=aljazeera.com&sz=64", color: "bg-orange-500" },
    { name: "The Guardian", domain: "theguardian.com", logo: "https://www.google.com/s2/favicons?domain=theguardian.com&sz=64", color: "bg-blue-900" },
    { name: "NDTV", domain: "ndtv.com", logo: "https://www.google.com/s2/favicons?domain=ndtv.com&sz=64", color: "bg-red-600" },
  ];

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/sources/");
        const data = res.data.results || res.data;
        if (data && data.length > 0) {
          const mapped = data.map(s => ({
            name: s.name || s.domain,
            domain: s.domain,
            logo: s.logo || `https://www.google.com/s2/favicons?domain=${s.domain}&sz=64`,
          }));
          setSources(mapped);
        } else {
          setSources(fallbackSources);
        }
      } catch {
        setSources(fallbackSources);
      }
    };
    fetchSources();
  }, []);

  const filtered = sources.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 min-h-screen">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Sources</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
          NewsScope aggregates news from trusted publishers worldwide. Click any source to visit their site.
        </p>
        <div className="mt-4 max-w-sm relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sources..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none focus:border-black dark:focus:border-white"
          />
          <span className="absolute left-3 top-2.5 text-zinc-400 text-sm">🔍</span>
        </div>
      </div>

      {/* Grid - Same as screenshot but without + icon */}
      <div className="bg-[#f5f5f0] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((src, idx) => (
            <a
              key={idx}
              href={`https://${src.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-full md:rounded-lg px-3 py-2.5 md:py-3 hover:border-black dark:hover:border-white hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-zinc-100 dark:border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={src.logo}
                  alt={src.name}
                  className="w-6 h-6 md:w-7 md:h-7 object-contain"
                  onError={(e) => { e.target.src = `https://www.google.com/s2/favicons?domain=${src.domain}&sz=64` }}
                />
              </div>
              <span className="text-[13px] md:text-[14px] font-medium truncate group-hover:underline">
                {src.name}
              </span>
            </a>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-zinc-500">No sources found for "{search}"</div>
        )}
      </div>

      {/* Popular Heading like screenshot */}
      <div className="mt-10">
        <h2 className="text-2xl font-black mb-4">Popular</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.slice(0, 6).map((src, idx) => (
            <a
              key={idx}
              href={`https://${src.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition"
            >
              <img src={src.logo} alt="" className="w-8 h-8 rounded-full" />
              <div>
                <p className="text-sm font-semibold">{src.name}</p>
                <p className="text-[11px] text-zinc-500">{src.domain}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}