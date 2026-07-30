import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ForYou() {
  const [activeTab, setActiveTab] = useState("feed");
  const [feedNews, setFeedNews] = useState([]);
  const [savedNews, setSavedNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCats, setSelectedCats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("selected_categories") || "[]") } catch { return [] }
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("access") || localStorage.getItem("token");

  useEffect(() => {
    const syncCats = () => {
      try {
        const cats = JSON.parse(localStorage.getItem("selected_categories") || "[]")
        setSelectedCats(prev => JSON.stringify(prev) !== JSON.stringify(cats) ? cats : prev)
      } catch { setSelectedCats([]) }
    }
    syncCats()
    const interval = setInterval(syncCats, 300)
    window.addEventListener("categoriesChanged", syncCats)
    window.addEventListener("categoryChange", syncCats)
    window.addEventListener("storage", syncCats)
    return () => {
      clearInterval(interval)
      window.removeEventListener("categoriesChanged", syncCats)
      window.removeEventListener("categoryChange", syncCats)
      window.removeEventListener("storage", syncCats)
    }
  }, [])

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const fetchData = async () => {
      setLoading(true)
      try {
        if (activeTab === "feed") {
          if (selectedCats.length === 0) { setFeedNews([]); setLoading(false); return; }
          const res = await axios.get(`http://127.0.0.1:8000/api/clusters/for-you/`, { headers: { Authorization: `Bearer ${token}` } })
          let data = res.data.results || res.data
          data = data.filter(item => selectedCats.includes(item.category?.toLowerCase()))
          setFeedNews(data)
        }
        if (activeTab === "saved") {
          const res = await axios.get(`http://127.0.0.1:8000/api/saved/`, { headers: { Authorization: `Bearer ${token}` } })
          setSavedNews(res.data.map(i => i.cluster_detail || i).filter(Boolean))
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [activeTab, token, navigate, selectedCats]);

  const goToCluster = (a) => {
    const slug = a.slug || a.cluster_slug || a.id
    if (slug) navigate(`/cluster/${slug}`)
  }

  const Card = ({ a }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition">
      <div onClick={()=>goToCluster(a)} className="cursor-pointer">
        <img src={a.hero_image || a.image_url} className="w-full h-44 object-cover" alt="" />
      </div>
      <div className="p-4">
        <h3 onClick={()=>goToCluster(a)} className="font-bold text-[15px] line-clamp-2 leading-snug cursor-pointer hover:underline text-black dark:text-white">
          {a.main_title || a.title}
        </h3>
        <p className="text-[11px] mt-2 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full inline-block capitalize border border-zinc-200 dark:border-zinc-700">{a.category}</p>
      </div>
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 min-h-screen bg-[#FFFEF9] dark:bg-black text-black dark:text-white">
      <div className="flex gap-8 border-b border-zinc-200 dark:border-zinc-800 mb-8">
        <button onClick={()=>setActiveTab("feed")} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab==="feed"? "border-black dark:border-white text-black dark:text-white" : "border-transparent text-zinc-400"}`}>My Feed</button>
        <button onClick={()=>setActiveTab("saved")} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab==="saved"? "border-black dark:border-white text-black dark:text-white" : "border-transparent text-zinc-400"}`}>Saved Stories</button>
      </div>

      {loading && <div className="flex justify-center mt-20"><div className="w-6 h-6 border-2 border-zinc-300 border-t-black dark:border-zinc-600 dark:border-t-white rounded-full animate-spin"></div></div>}

      {activeTab==="feed" && !loading && (
        <>
          {selectedCats.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20">
              <div className="w-16 h-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-6 h-6 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-[15px] font-bold mb-1">Personalize your feed</h3>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Select categories to see news tailored for you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {feedNews.map(a=><Card key={a.id} a={a}/>)}
            </div>
          )}
        </>
      )}

      {activeTab==="saved" && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {savedNews.map(a=><Card key={a.id || a.slug} a={a}/>)}
        </div>
      )}
    </main>
  );
}

export default ForYou;