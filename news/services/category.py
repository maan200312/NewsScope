from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# ==========================================================
# LOAD MODEL
# ==========================================================

model = SentenceTransformer("all-MiniLM-L6-v2")

# ==========================================================
# CATEGORY LABELS
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

# ==========================================================
# PRE-COMPUTE CATEGORY EMBEDDINGS (Once)
# ==========================================================

print("Building category embeddings...")

CATEGORY_NAMES = list(CATEGORIES.keys())
CATEGORY_TEXTS = list(CATEGORIES.values())

CATEGORY_EMBEDDINGS = model.encode(CATEGORY_TEXTS, normalize_embeddings=True)

print(f"✅ {len(CATEGORY_NAMES)} categories loaded")

# ==========================================================
# DETECT CATEGORY
# ==========================================================

def detect_category(title, content=""):
    """
    Detect category using embedding similarity
    """
    if not title:
        return "general"

    text = f"{title} {content[:300]}"

    # Text embedding
    text_emb = model.encode([text], normalize_embeddings=True)

    # Cosine similarity with all categories
    scores = cosine_similarity(text_emb, CATEGORY_EMBEDDINGS)[0]

    # Best match
    best_idx = int(np.argmax(scores))
    best_score = float(scores[best_idx])
    best_category = CATEGORY_NAMES[best_idx]

    # Agar score bahut kam hai to general
    if best_score < 0.20:
        return "general"

    return best_category

def get_category_scores(title, content=""):
    """
    Sab categories ke scores dekhne ke liye (debug)
    """
    text = f"{title} {content[:300]}"
    text_emb = model.encode([text], normalize_embeddings=True)
    scores = cosine_similarity(text_emb, CATEGORY_EMBEDDINGS)[0]

    result = {}
    for name, score in zip(CATEGORY_NAMES, scores):
        result[name] = round(float(score), 3)

    # Sort high to low
    result = dict(sorted(result.items(), key=lambda x: x[1], reverse=True))
    return result

# ==========================================================
# ALIAS FOR OLD CODE
# ==========================================================

def categorize_news(title, content=""):
    return detect_category(title, content)
    