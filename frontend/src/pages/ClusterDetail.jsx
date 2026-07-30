import { useEffect, useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import BiasBar from "../components/common/biasbar"

const formatDate = (d) => d? new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Just now"

function BookmarkIcon({ saved = false, className = "w-5 h-5" }) {
  if (saved) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M6 2a2 2 0 0 0-2 2v18l8-5 8 5V4a2 2 0 0 0-2-2H6z" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.9} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 11.186 0Z" />
    </svg>
  )
}

export default function ClusterDetail() {
  const { slug } = useParams()
  const [cluster, setCluster] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState("All")
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("saved_news") || "[]") } catch { return [] }
  })
  const token = localStorage.getItem("access")

  useEffect(() => {
    const fetchCluster = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://127.0.0.1:8000/api/clusters/${slug}/`)
        if (!res.ok) throw new Error(`API Error ${res.status}`)
        const data = await res.json()
        setCluster(data)
        if (token) {
          try {
            const savedRes = await fetch("http://127.0.0.1:8000/api/saved/", { headers: { Authorization: `Bearer ${token}` } })
            if (savedRes.ok) {
              const savedData = await savedRes.json()
              const articleIds = savedData.filter(s => s.article).map(s => s.article)
              const backendIds = savedData.map(s => s.article || s.cluster).filter(Boolean)
              if (backendIds.length > 0) {
                setSavedIds(prev => {
                  const merged = [...new Set([...prev, ...articleIds, ...backendIds])]
                  localStorage.setItem("saved_news", JSON.stringify(merged))
                  return merged
                })
              }
            }
          } catch {}
        }
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    }
    if (slug) fetchCluster()
  }, [slug])

  const toggleSave = async (article) => {
    const isSaved = savedIds.includes(article.id)
    let updated = isSaved ? savedIds.filter(id => id!== article.id) : [...savedIds, article.id]
    setSavedIds(updated)
    localStorage.setItem("saved_news", JSON.stringify(updated))
    try {
      const savedArticles = JSON.parse(localStorage.getItem("saved_articles") || "[]")
      if (isSaved) {
        localStorage.setItem("saved_articles", JSON.stringify(savedArticles.filter(a => a.id!== article.id)))
      } else {
        if (!savedArticles.find(a => a.id === article.id)) {
          savedArticles.push(article)
          localStorage.setItem("saved_articles", JSON.stringify(savedArticles))
        }
      }
    } catch {}
    if (token && cluster) {
      try {
        if (isSaved) {
          await fetch("http://127.0.0.1:8000/api/saved/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ cluster_id: cluster.id, article_id: article.id })
          })
        } else {
          await fetch("http://127.0.0.1:8000/api/saved/", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ cluster_id: cluster.id, article_id: article.id })
          })
        }
      } catch {}
    }
  }

  const filteredArticles = useMemo(() => {
    if (!cluster?.articles) return []
    if (activeFilter === "All") return cluster.articles
    return cluster.articles.filter(a => a.bias?.toLowerCase() === activeFilter.toLowerCase())
  }, [cluster, activeFilter])

  const uniqueSources = useMemo(() => {
    if (!cluster?.articles) return { left: [], center: [], right: [] }
    const getUnique = (arr) => {
      const seen = new Set()
      return arr.filter(item => {
        const key = item.source_name?.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }
    return {
      left: getUnique(cluster.articles.filter(a => a.bias?.toLowerCase() === "left")),
      center: getUnique(cluster.articles.filter(a => a.bias?.toLowerCase() === "center")),
      right: getUnique(cluster.articles.filter(a => a.bias?.toLowerCase() === "right")),
    }
  }, [cluster])

  // ✅ Summary ko paragraphs me split karo - 3-4 paragraphs
  const summaryParagraphs = useMemo(() => {
    if (!cluster?.summary) return []
    // \n\n se split karo, agar single line hai to sentences se 3 para banao
    let paras = cluster.summary.split("\n\n").filter(p => p.trim().length > 0)
    if (paras.length === 1 && cluster.summary.length > 300) {
      // Agar ek hi long para hai to sentences se 3 para banao
      const sentences = cluster.summary.split(". ").filter(s => s.trim())
      const chunkSize = Math.ceil(sentences.length / 3)
      paras = []
      for (let i = 0; i < sentences.length; i += chunkSize) {
        paras.push(sentences.slice(i, i + chunkSize).join(". ") + ".")
      }
    }
    return paras.slice(0, 4) // max 4 paras
  }, [cluster])

  const getLogo = (article) => {
    if (article.source_logo) return article.source_logo
    try { return `https://www.google.com/s2/favicons?domain=${new URL(article.url).hostname}&sz=64` }
    catch { return `https://ui-avatars.com/api/?name=${article.source_name}&background=random` }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="p-20 text-center text-red-500">{error}</div>
  if (!cluster) return <div className="p-20 text-center">Not found</div>

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div>
          {/* ✅ TITLE + 3-4 PARA SUMMARY */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8">
            <h1 className="text-[26px] md:text-[32px] font-extrabold leading-tight tracking-tight">{cluster.main_title}</h1>
            
            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
              {cluster.category && <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full capitalize border">{cluster.category}</span>}
              {cluster.latest_published && <span>{formatDate(cluster.latest_published)}</span>}
            </div>

            {/* 3-4 Paragraph Summary */}
            <div className="mt-6 space-y-4">
              {summaryParagraphs.length > 0 ? (
                summaryParagraphs.map((para, idx) => (
                  <p key={idx} className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                    {para}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                    {cluster.main_title} - This developing story has drawn coverage from {cluster.source_count} sources across the political spectrum.
                  </p>
                  <p className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                    The coverage analysis shows {cluster.left_sources} sources from left-leaning outlets, {cluster.center_sources} from center, and {cluster.right_sources} from right-leaning media, indicating {cluster.bias} leaning overall.
                  </p>
                  <p className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                    Multiple perspectives are emerging as the story develops. Readers are encouraged to explore coverage from different bias categories below to get a balanced understanding.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <button onClick={() => setActiveFilter("All")} className={`px-4 py-1.5 rounded-md text-sm font-semibold border ${activeFilter === "All"? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-zinc-800"}`}>All</button>
            <button onClick={() => setActiveFilter("Left")} className={`px-4 py-1.5 rounded-md text-sm font-semibold border ${activeFilter === "Left"? "bg-red-600 text-white" : "bg-white dark:bg-zinc-800"}`}>Left</button>
            <button onClick={() => setActiveFilter("Center")} className={`px-4 py-1.5 rounded-md text-sm font-semibold border ${activeFilter === "Center"? "bg-white text-black border-zinc-300" : "bg-white dark:bg-zinc-800"}`}>Center</button>
            <button onClick={() => setActiveFilter("Right")} className={`px-4 py-1.5 rounded-md text-sm font-semibold border ${activeFilter === "Right"? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-800"}`}>Right</button>
          </div>

          <div className="mt-2">
            {filteredArticles.map((a) => {
              const isSaved = savedIds.includes(a.id)
              return (
                <div key={a.id} className="flex flex-col py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={getLogo(a)} alt="" className="w-6 h-6 rounded-full border bg-white"/>
                      <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs border">{a.source_name}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-md text-xs font-bold ${a.bias?.toLowerCase() === "left"? "bg-red-600 text-white" : a.bias?.toLowerCase() === "right"? "bg-blue-600 text-white" : "bg-white text-black border"}`}>{a.bias?.toUpperCase()}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 mt-3">
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex-1 font-medium hover:underline leading-snug">{a.title}</a>
                    <button onClick={() => toggleSave(a)} className={`shrink-0 p-1 ${isSaved ? "text-black dark:text-white" : "text-zinc-400 hover:text-black"}`}>
                      <BookmarkIcon saved={isSaved} className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-xs text-zinc-500 mt-2">{formatDate(a.published_at)}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 p-5 h-fit sticky top-6">
          <h3 className="text-sm font-bold mb-3">Coverage Details</h3>
          <div className="text-sm space-y-1 mb-4">
            <div className="flex justify-between"><span>Total Sources</span><span className="font-bold">{cluster.source_count}</span></div>
            <div className="flex justify-between"><span>Left</span><span className="text-red-600 font-bold">{cluster.left_sources}</span></div>
            <div className="flex justify-between"><span>Center</span><span className="font-bold">{cluster.center_sources}</span></div>
            <div className="flex justify-between"><span>Right</span><span className="text-blue-600 font-bold">{cluster.right_sources}</span></div>
          </div>
          <BiasBar leftCount={cluster.left_sources} centerCount={cluster.center_sources} rightCount={cluster.right_sources} />
          <div className="text-xs text-zinc-500 mt-2">Bias Score: {cluster.bias_score} ({cluster.bias})</div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="bg-red-50 dark:bg-[#2a1212] rounded-lg border p-2 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-red-600">LEFT</span>
              {uniqueSources.left.map((a,i)=>(<img key={i} src={getLogo(a)} alt="" className="w-8 h-8 rounded-full bg-white border"/>))}
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg border p-2 flex flex-col items-center gap-2">
              <span className="text-xs font-bold">CENTER</span>
              {uniqueSources.center.map((a,i)=>(<img key={i} src={getLogo(a)} alt="" className="w-8 h-8 rounded-full bg-white border"/>))}
            </div>
            <div className="bg-blue-50 dark:bg-[#121a2a] rounded-lg border p-2 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-blue-600">RIGHT</span>
              {uniqueSources.right.map((a,i)=>(<img key={i} src={getLogo(a)} alt="" className="w-8 h-8 rounded-full bg-white border"/>))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}