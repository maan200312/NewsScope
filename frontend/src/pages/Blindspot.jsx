import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BlindspotCardPage from "../components/BlindspotCard";

function Blindspot() {
  const [news, setNews] = useState([]);
  const [visible, setVisible] = useState(4);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/clusters/blindspot/").then((res) => {
      setNews(res.data.results || res.data || []);
    });
  }, []);

  const leftNews = news.filter((a) => a.blindspot_type === "right");
  const rightNews = news.filter((a) => a.blindspot_type === "left");

  const handleMore = () => {
    const token = localStorage.getItem("access") || localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setVisible((v) => v + 4);
  };

  const showMore = leftNews.length > visible || rightNews.length > visible;

  return (
    <main className="max-w-7xl mx-auto px-5 py-8 min-h-screen">
      <div className="border-b border-zinc-200 dark:border-zinc-700 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Blindspot</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
            Stories disproportionately covered by one side.
          </p>
        </div>
        {showMore && (
          <button
            onClick={handleMore}
            className="border border-zinc-300 dark:border-zinc-600 text-sm px-4 py-1.5 rounded-md hover:bg-black hover:text-white transition"
          >
            More stories
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-bold">For the Left</h2>
            <p className="text-sm text-zinc-500">News stories ignored by the Left.</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {leftNews.slice(0, visible).map((a) => (
              <BlindspotCardPage key={a.id} article={a} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-6">
            <h2 className="text-lg font-bold">For the Right</h2>
            <p className="text-sm text-zinc-500">News stories ignored by the Right.</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {rightNews.slice(0, visible).map((a) => (
              <BlindspotCardPage key={a.id} article={a} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Blindspot;