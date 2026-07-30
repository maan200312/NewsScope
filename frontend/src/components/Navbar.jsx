import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    HiOutlineNewspaper,
    HiOutlineSparkles,
    HiOutlineEye,
    HiOutlineSearch,
    HiOutlineMenu,
    HiOutlineX,
    HiOutlineClock
} from 'react-icons/hi'
import useTheme from '../hooks/theme'

const CATEGORIES = [
  "politics", "business", "finance", "technology", "sports", "health",
  "science", "entertainment", "world", "crime", "education", "environment", "general"
];

export default function Navbar({ search, setSearch }) {
    const { theme, setTheme } = useTheme();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [now, setNow] = useState(new Date());
    const [selectedCats, setSelectedCats] = useState(() => {
        try { return JSON.parse(localStorage.getItem("selected_categories") || "[]") } catch { return [] }
    });
    const [mobileMenu, setMobileMenu] = useState(false);
    const [localSearch, setLocalSearch] = useState(search || localStorage.getItem("global_search") || "");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [allClustersCache, setAllClustersCache] = useState([]);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("access"));
        checkAuth();
        window.addEventListener("authChange", checkAuth);
        return () => window.removeEventListener("authChange", checkAuth);
    }, []);

    useEffect(() => { if (search!== undefined) setLocalSearch(search); }, [search]);

    // Cache all clusters once for fast suggestions
    useEffect(() => {
        const loadCache = async () => {
            try {
                const res = await axios.get("http://127.0.0.1:8000/api/clusters/")
                setAllClustersCache(res.data.results || res.data || [])
            } catch {}
        }
        loadCache()
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // ✅ SEARCH SUGGESTIONS - Category se independent, sirf title match
    useEffect(() => {
        const fetchSuggestions = async () => {
            const query = localSearch.trim().toLowerCase()
            if (!query || query.length < 2) { 
                setSuggestions([]); 
                setShowSuggestions(false); 
                return 
            }

            // 1. Try API search param
            try {
                const res = await axios.get(`http://127.0.0.1:8000/api/clusters/?search=${encodeURIComponent(localSearch)}`)
                const data = res.data.results || res.data || []
                if (data.length > 0) {
                    setSuggestions(data.slice(0, 8))
                    setShowSuggestions(true)
                    return
                }
            } catch {}

            // 2. Fallback - filter from cache / all clusters - IGNORE CATEGORY, only title match
            let source = allClustersCache
            if (source.length === 0) {
                try {
                    const res = await axios.get("http://127.0.0.1:8000/api/clusters/")
                    source = res.data.results || res.data || []
                } catch { source = [] }
            }

            const filtered = source.filter(c => {
                const title = (c.main_title || c.title || "").toLowerCase()
                return title.includes(query)
            }).slice(0, 8)

            setSuggestions(filtered)
            setShowSuggestions(filtered.length > 0)
        }
        const timeout = setTimeout(fetchSuggestions, 250)
        return () => clearTimeout(timeout)
    }, [localSearch, allClustersCache])

    const handleSearchChange = (val) => {
        setLocalSearch(val);
        if (setSearch) setSearch(val);
        localStorage.setItem("global_search", val);
        // Homepage filter ke liye events
        window.dispatchEvent(new Event("searchChange"));
        window.dispatchEvent(new Event("categoryChange"));
        window.dispatchEvent(new Event("categoriesChanged"));
    }

    const handleSuggestionClick = (cluster) => {
        setShowSuggestions(false)
        // ✅ Cluster detail page par jao - title click se
        const slug = cluster.slug || cluster.id
        navigate(`/cluster/${slug}`)
    }

    const toggleCategory = (cat) => {
        const updated = selectedCats.includes(cat)? selectedCats.filter(c => c!== cat) : [...selectedCats, cat];
        setSelectedCats(updated);
        localStorage.setItem("selected_categories", JSON.stringify(updated));
        window.dispatchEvent(new Event("categoryChange"));
        window.dispatchEvent(new Event("categoriesChanged"));
        window.dispatchEvent(new Event("searchChange"));
    };

    return (
        <div className="w-full">
            {/* LAYER 1 - FIXED */}
            <div className="fixed top-0 left-0 right-0 z-[60] flex justify-center items-center gap-2 md:gap-4 bg-[#43948d] py-2 px-2 text-xs md:text-sm w-full h-[32px]">
                <span className="font-semibold text-white text-center truncate">See every side of every news story</span>
                {!isLoggedIn && <NavLink to="/register" className="bg-black text-white px-2 md:px-3 py-1 rounded whitespace-nowrap text-[11px] md:text-xs shrink-0">Get Started</NavLink>}
            </div>
            <div className="h-[32px] w-full" />

            {/* LAYER 2 - Theme */}
            <div className="flex items-center justify-between bg-black text-white px-3 py-2 text-xs md:text-sm overflow-x-auto no-scrollbar whitespace-nowrap gap-4 w-full">
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <span className="text-gray-300 hidden sm:inline">Theme:</span>
                    <div className="flex items-center gap-3 md:gap-4">
                        {["light", "dark", "system"].map(t => (
                            <button key={t} onClick={() => setTheme(t)} className={`${theme === t? "text-white font-semibold" : "text-gray-400"} capitalize`}>{t === "system"? "Auto" : t}</button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-200 shrink-0">
                    <HiOutlineClock className="text-sm md:text-base" />
                    <span className="hidden md:inline">{now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className="font-mono font-semibold">{now.toLocaleTimeString()}</span>
                </div>
            </div>

            {/* LAYER 3 - Logo + Search with suggestions */}
            <div className="flex items-center justify-between border-b px-3 md:px-5 py-2.5 md:py-3 bg-[#FFFEF9] dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 gap-2 md:gap-3 w-full">
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <NavLink to="/" className="shrink-0">
                        <div className="text-xl md:text-3xl leading-none tracking-tighter font-black" style={{ fontFamily: 'Arial Black, sans-serif', transform: 'scaleY(1.3)' }}>
                            NewsScope
                        </div>
                    </NavLink>
                    <nav className="hidden md:flex gap-1 ml-1 md:ml-3">
                        {[{ to: "/", label: "Home" }, { to: "/foryou", label: "For You" },{ to: "/local", label: "Local" }, { to: "/blindspot", label: "Blindspot" },].map(link => (
                            <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive? 'bg-[#43948d] text-white font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm' : 'px-3 md:px-4 py-1.5 md:py-2 font-semibold text-xs md:text-sm'}>{link.label}</NavLink>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div ref={searchRef} className="relative">
                        <div className="relative">
                            <HiOutlineSearch className="absolute left-2.5 top-2.5 text-zinc-400 text-sm" />
                            <input 
                                value={localSearch} 
                                onChange={e => handleSearchChange(e.target.value)} 
                                onFocus={() => { if(localSearch.length>=2) setShowSuggestions(true) }}
                                placeholder="Search news by title..." 
                                className="w-36 sm:w-48 md:w-64 lg:w-72 pl-8 pr-3 py-1.5 rounded-md border-2 outline-none bg-white dark:bg-black text-xs md:text-sm focus:border-black dark:focus:border-white" 
                            />
                        </div>
                        {/* ✅ SUGGESTIONS - Category ignore, only title match */}
                        {showSuggestions && (
                            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-2xl z-50 overflow-hidden w-[300px] md:w-[400px] max-h-[380px] overflow-y-auto">
                                {suggestions.length > 0 ? (
                                    <>
                                        <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-[11px] text-zinc-500 uppercase tracking-wide font-semibold">Matching stories - Click to view</div>
                                        {suggestions.map((cluster) => (
                                            <div 
                                                key={cluster.id} 
                                                onClick={() => handleSuggestionClick(cluster)} 
                                                className="px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0 flex gap-3 group"
                                            >
                                                <img src={cluster.hero_image || cluster.image_url || "https://placehold.co/40x40"} alt="" className="w-11 h-11 rounded object-cover shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-medium line-clamp-2 leading-snug group-hover:text-[#43948d] group-hover:underline">{cluster.main_title || cluster.title}</p>
                                                    <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
                                                        <span className="capitalize px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px]">{cluster.category}</span>
                                                        <span>{cluster.source_count || 0} sources</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : localSearch.length >=2 ? (
                                    <div className="px-4 py-6 text-center text-sm text-zinc-500">No matching titles for "{localSearch}"</div>
                                ) : null}
                            </div>
                        )}
                    </div>
                    {isLoggedIn? <NavLink to="/account" className="hidden md:block border px-3 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm">My Account</NavLink> : <NavLink to="/login" className="hidden md:block border px-3 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm">Login</NavLink>}
                    <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 border rounded shrink-0">
                        {mobileMenu? <HiOutlineX className="text-lg" /> : <HiOutlineMenu className="text-lg" />}
                    </button>
                </div>
            </div>

            {/* LAYER 4 - Category - 4th position, full width, no scroller */}
            <div className="sticky top-[32px] z-40 bg-white dark:bg-zinc-900 border-b-2 border-zinc-200 dark:border-zinc-800 shadow-sm w-full">
                <div className="w-full px-2 md:px-5 py-2 md:py-2.5 flex flex-wrap gap-1.5 md:gap-2">
                    {CATEGORIES.map(cat => {
                        const isSelected = selectedCats.includes(cat);
                        return (
                            <button 
                                key={cat} 
                                onClick={() => toggleCategory(cat)} 
                                className={`px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-[4px] text-[11px] md:text-[12px] font-bold border uppercase tracking-wide ${isSelected ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"}`}
                            >
                                {cat}
                            </button>
                        )
                    })}
                </div>
            </div>

            {mobileMenu && (
                <div className="md:hidden fixed inset-0 z-[100] bg-black/50" onClick={() => setMobileMenu(false)}>
                    <div className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white dark:bg-zinc-900 shadow-xl p-5 overflow-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6"><span className="font-bold text-xl">Menu</span><button onClick={() => setMobileMenu(false)}><HiOutlineX className="text-2xl" /></button></div>
                        <div className="space-y-1 mb-6">
                            <NavLink to="/" onClick={() => setMobileMenu(false)} className="block py-3 font-semibold border-b">Home</NavLink>
                            <NavLink to="/foryou" onClick={() => setMobileMenu(false)} className="block py-3 font-semibold border-b">For You</NavLink>
                            <NavLink to="/local" onClick={() => setMobileMenu(false)} className="block py-3 font-semibold border-b">Local</NavLink>
                            <NavLink to="/blindspot" onClick={() => setMobileMenu(false)} className="block py-3 font-semibold border-b">Blindspot</NavLink>
                        </div>
                        <div className="mt-6">
                            {isLoggedIn? <NavLink to="/account" onClick={() => setMobileMenu(false)} className="block text-center bg-black text-white py-3 rounded-md">My Account</NavLink> : <NavLink to="/login" onClick={() => setMobileMenu(false)} className="block text-center border-2 py-3 rounded-md font-semibold">Login / Register</NavLink>}
                        </div>
                    </div>
                </div>
            )}

            <div className="md:hidden fixed inset-x-0 bottom-0 border-t-2 bg-white dark:bg-zinc-900 z-40">
                <div className="flex">
                    <NavLink to="/" className={({ isActive }) => `flex-1 flex flex-col items-center py-2.5 ${isActive? 'text-[#43948d]' : 'text-zinc-500'}`}><HiOutlineNewspaper className="text-xl" /><span className="text-[10px]">News</span></NavLink>
                    <NavLink to="/foryou" className={({ isActive }) => `flex-1 flex flex-col items-center py-2.5 ${isActive? 'text-[#43948d]' : 'text-zinc-500'}`}><HiOutlineSparkles className="text-xl" /><span className="text-[10px]">For You</span></NavLink>
                    <NavLink to="/blindspot" className={({ isActive }) => `flex-1 flex flex-col items-center py-2.5 ${isActive? 'text-[#43948d]' : 'text-zinc-500'}`}><HiOutlineEye className="text-xl" /><span className="text-[10px]">Blindspot</span></NavLink>
                </div>
            </div>
        </div>
    )
}