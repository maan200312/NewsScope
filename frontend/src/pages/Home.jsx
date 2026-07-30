import { useEffect, useState } from "react";
import axios from "axios";
import DailyBriefing from "../components/home/DailyBriefing";
import Hero from "../components/home/Hero";
import LatestStories from "../components/home/LatestStories";
import Politics from "../components/home/Politics";
import ClusterFeed from "../components/home/ClusterFeed";
import RightSidebar from "../components/home/RightSidebar";

function Home() {
  const [topStories, setTopStories] = useState([]);
  const [latestStories, setLatestStories] = useState([]);
  const [politicsStories, setPoliticsStories] = useState([]);
  const [clusterFeed, setClusterFeed] = useState([]);
  const [blindspot, setBlindspot] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);

        // Baaki APIs
        const [topRes, latestRes, politicsRes, blindspotRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/clusters/top/"),
          axios.get("http://127.0.0.1:8000/api/clusters/latest/"),
          axios.get("http://127.0.0.1:8000/api/clusters/?category=politics"),
          axios.get("http://127.0.0.1:8000/api/clusters/blindspot/"),
        ]);

        setTopStories(topRes.data.results || topRes.data);
        setLatestStories(latestRes.data.results || latestRes.data);
        setPoliticsStories(politicsRes.data.results || politicsRes.data);
        setBlindspot(blindspotRes.data.results || blindspotRes.data);

        // CLUSTERS wali API - saare pages fetch karo
        let allClusters = [];
        let nextUrl = "http://127.0.0.1:8000/api/clusters/";

        while (nextUrl) {
          const res = await axios.get(nextUrl);
          const data = res.data;
          const results = data.results || data;
          allClusters = [...allClusters,...results];
          nextUrl = data.next; // DRF pagination ka next page
          if (allClusters.length >= 250) break; // safety
        }

        setClusterFeed(allClusters);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  const remainingClusters = clusterFeed.slice(8);

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3"><DailyBriefing news={topStories} /><hr /></aside>
        <section className="lg:col-span-6 space-y-6">
          <Hero article={topStories[0]} />
          <LatestStories news={latestStories} />
          <hr />
        </section>
        <aside className="lg:col-span-3"><RightSidebar blindspot={blindspot} /></aside>
      </div>

      <Politics news={politicsStories} />
      <hr className="my-10 border-zinc-200 dark:border-zinc-800" />

      <ClusterFeed news={remainingClusters} />
    </main>
  );
}
export default Home;