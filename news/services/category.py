import numpy as np

# ==========================================================
# TRY TO LOAD AI MODEL (Optional)
# ==========================================================
try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity

    HAS_AI = True
    print("Loading AI model for categories...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
except ImportError:
    HAS_AI = False
    model = None
    print("⚠️ sentence_transformers not found - using keyword fallback for categories")

# ==========================================================
# CATEGORY LABELS (Same as yours)
# ==========================================================

CATEGORIES = {
    "politics": """
    government politics parliament senate assembly election vote voting
    prime minister president minister cabinet opposition democracy
    constitution legislation policy law diplomacy foreign affairs
    pti pmln ppp mqm judiciary supreme court
    """,
    "business": """
    business company corporate startup entrepreneur commerce trade
    industry manufacturing enterprise ceo investor merger acquisition
    export import retail production
    """,
    "finance": """
    finance economy banking bank stock exchange psx kse
    inflation interest budget tax currency rupee dollar
    forex bitcoin crypto cryptocurrency shares investment
    """,
    "technology": """
    technology software hardware programming coding developer
    artificial intelligence ai machine learning deep learning
    chatgpt openai google microsoft apple meta tesla
    android iphone internet cloud cybersecurity robotics
    """,
    "sports": """
    sports cricket football soccer fifa tennis badminton
    hockey basketball volleyball olympics athlete coach
    psl ipl icc match tournament championship league
    """,
    "health": """
    health hospital doctor medical medicine disease patient
    surgery vaccine virus covid dengue malaria diabetes
    healthcare treatment clinic
    """,
    "science": """
    science scientist research laboratory discovery experiment
    biology chemistry physics astronomy nasa spacex satellite
    mars moon galaxy universe
    """,
    "entertainment": """
    entertainment movie film cinema actor actress singer
    celebrity drama music netflix television tv showbiz
    bollywood hollywood lollywood concert album
    """,
    "world": """
    world international global united nations un nato
    usa america china india russia uk france germany
    europe middle east africa diplomacy war conflict
    """,
    "crime": """
    crime criminal robbery theft thief arrest arrested
    police fia nab murder killing homicide shooting
    rape assault kidnapping kidnap fraud scam gang
    mafia smuggling drugs narcotics prison jail suspect
    accused investigation honey trap honey-trap cyber crime
    extortion
    """,
    "education": """
    education school college university student teacher
    examination exam syllabus classroom scholarship admission
    academic learning
    """,
    "environment": """
    environment climate weather pollution flood rainfall
    earthquake forest wildlife conservation nature
    renewable energy global warming carbon emission
    """,
    "general": """
    local public community society lifestyle people
    culture daily news miscellaneous
    """
}

CATEGORY_NAMES = list(CATEGORIES.keys())
CATEGORY_TEXTS = list(CATEGORIES.values())

# ==========================================================
# PRE-COMPUTE EMBEDDINGS (Only if AI available)
# ==========================================================

if HAS_AI:
    print("Building category embeddings...")
    CATEGORY_EMBEDDINGS = model.encode(CATEGORY_TEXTS, normalize_embeddings=True)
    print(f"✅ {len(CATEGORY_NAMES)} categories loaded (AI Mode)")
else:
    CATEGORY_EMBEDDINGS = None
    print(f"✅ {len(CATEGORY_NAMES)} categories loaded (Keyword Mode)")

# ==========================================================
# KEYWORD FALLBACK LOGIC
# ==========================================================
KEYWORD_MAP = {
    "politics": ["government","politics","parliament","election","pti","pmln","minister","president","vote"],
    "business": ["business","company","corporate","startup","trade","industry","ceo","market"],
    "finance": ["finance","economy","bank","stock","psx","inflation","tax","rupee","dollar","crypto","bitcoin"],
    "technology": ["technology","software","ai","openai","google","microsoft","apple","android","iphone","programming"],
    "sports": ["sport","cricket","football","fifa","psl","ipl","match","tournament","hockey","tennis"],
    "health": ["health","hospital","doctor","medical","disease","vaccine","covid","patient"],
    "science": ["science","research","nasa","spacex","satellite","experiment","physics","biology"],
    "entertainment": ["movie","film","actor","actress","music","netflix","bollywood","hollywood","drama","celebrity"],
    "world": ["world","international","usa","america","china","india","russia","war","conflict","un"],
    "crime": ["crime","police","arrest","murder","robbery","theft","rape","kidnap","fraud","jail","narcotics"],
    "education": ["school","college","university","student","teacher","exam","education","scholarship"],
    "environment": ["climate","weather","flood","earthquake","pollution","environment","rainfall"],
}

def detect_category_keyword(title, content=""):
    text = f"{title} {content}".lower()
    scores = {}
    for cat, keywords in KEYWORD_MAP.items():
        scores[cat] = sum(1 for k in keywords if k in text)

    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return "general"
    return best

# ==========================================================
# MAIN DETECT FUNCTION (Works in both modes)
# ==========================================================

def detect_category(title, content=""):
    if not title:
        return "general"

    # AI MODE
    if HAS_AI:
        try:
            text = f"{title} {content[:300]}"
            text_emb = model.encode([text], normalize_embeddings=True)
            from sklearn.metrics.pairwise import cosine_similarity
            scores = cosine_similarity(text_emb, CATEGORY_EMBEDDINGS)[0]
            best_idx = int(np.argmax(scores))
            best_score = float(scores[best_idx])
            best_category = CATEGORY_NAMES[best_idx]
            if best_score < 0.20:
                return "general"
            return best_category
        except Exception:
            # AI fail ho jaye to keyword pe gir jao
            return detect_category_keyword(title, content)

    # KEYWORD MODE (Render pe)
    else:
        return detect_category_keyword(title, content)

def get_category_scores(title, content=""):
    if not HAS_AI:
        return {detect_category_keyword(title, content): 1.0}

    text = f"{title} {content[:300]}"
    text_emb = model.encode([text], normalize_embeddings=True)
    from sklearn.metrics.pairwise import cosine_similarity
    scores = cosine_similarity(text_emb, CATEGORY_EMBEDDINGS)[0]
    result = {}
    for name, score in zip(CATEGORY_NAMES, scores):
        result[name] = round(float(score), 3)
    result = dict(sorted(result.items(), key=lambda x: x[1], reverse=True))
    return result

def categorize_news(title, content=""):
    return detect_category(title, content)