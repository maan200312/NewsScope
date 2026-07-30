# news/services/bias.py

from news.models import Source

# ==========================================================
# BIAS FROM SOURCE
# ==========================================================

def detect_bias(source):
    if source is None:
        return "center", 50

    bias = source.bias or "center"
    bias_score = source.bias_score or 50

    return bias, bias_score

# ==========================================================
# BIAS FROM CLUSTER (Ye missing tha)
# ==========================================================

def calculate_cluster_bias(left, center, right):
    """
    left, center, right counts se cluster bias score nikalo
    Tumhare system me score 0-100 hai (50 = center)
    """
    total = left + center + right
    if total == 0:
        return "center", 50

    # Score logic: left = 0, center = 50, right = 100
    # Weighted average
    score = (left * 0 + center * 50 + right * 100) / total

    # Label decide
    if score < 35:
        label = "left"
    elif score > 65:
        label = "right"
    else:
        label = "center"

    return label, int(score)