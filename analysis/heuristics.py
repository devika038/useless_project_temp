import os, hashlib, random
import numpy as np
try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False
from PIL import Image

def analyze_image(file_path: str) -> dict:
    """
    Extract purely visual heuristics from an image.
    Returns a dict of numeric scores — NOT medical analysis.
    For entertainment purposes only.
    """
    try:
        img_pil = Image.open(file_path).convert('RGB')
        img_pil.thumbnail((800, 800))
        img_arr = np.array(img_pil)
    except Exception:
        return _fallback_scores(file_path)

    h, w = img_arr.shape[:2]

    # Use image hash as random seed for determinism
    with open(file_path, 'rb') as f:
        raw = f.read(8192)
    seed = int(hashlib.md5(raw).hexdigest()[:8], 16)

    # Top 45% of image = likely head/hairline zone
    top_zone   = img_arr[:int(h * 0.45), :]
    # Top 15% = very top, likely hair or scalp
    hair_zone  = img_arr[:int(h * 0.15), :]
    # 15-35% = transition zone (hairline)
    hairline_zone = img_arr[int(h * 0.15):int(h * 0.35), :]

    # 1. Mean brightness of top zone
    brightness = float(np.mean(top_zone)) / 255.0

    # 2. Color variance in hairline zone (lower = more uniform = more skin)
    variance = float(np.var(hairline_zone)) / (255.0 ** 2)

    # 3. Edge density in hair zone (more edges = more texture = more hair)
    gray_hair = np.mean(hair_zone, axis=2).astype(np.uint8)
    if OPENCV_AVAILABLE:
        edges = cv2.Canny(gray_hair, 50, 150)
        edge_density = float(np.mean(edges > 0))
    else:
        gy = np.abs(np.diff(gray_hair.astype(float), axis=0))
        gx = np.abs(np.diff(gray_hair.astype(float), axis=1))
        edge_density = min(float(np.mean(gy)) + float(np.mean(gx)), 255.0) / 255.0

    # 4. Darkness of hair zone (hair is dark, skin/background is light)
    r, g, b = hair_zone[:,:,0].mean(), hair_zone[:,:,1].mean(), hair_zone[:,:,2].mean()
    darkness = 1.0 - (float(r + g + b) / (3 * 255))

    # 5. Contrast in full top zone
    contrast = float(top_zone.std()) / 128.0

    # 6. HAIR DARK RATIO — most reliable direct signal.
    #    Hair pixels are definitively dark (luminance < 80 on 0-255 scale).
    #    Skin and backgrounds (white, grey, beige) are all light (> 100).
    #    A bald person has near-zero dark pixels in the upper portion.
    #    This is invariant to background colour.
    luminance_top = np.mean(top_zone, axis=2)          # per-pixel mean RGB
    hair_dark_ratio = float(np.mean(luminance_top < 80))   # fraction that is dark

    # Also check a narrower band (top 30%) for robustness
    narrow_zone = img_arr[:int(h * 0.30), :]
    lum_narrow  = np.mean(narrow_zone, axis=2)
    narrow_dark_ratio = float(np.mean(lum_narrow < 80))

    # Add small seeded jitter for variety (NOT applied to dark_ratio — keep it clean)
    rng = random.Random(seed)
    jitter = lambda v, amt=0.07: max(0, min(1, v + rng.uniform(-amt, amt)))

    return {
        'brightness':       jitter(brightness),
        'variance':         jitter(variance),
        'edge_density':     jitter(edge_density),
        'darkness':         jitter(darkness),
        'contrast':         jitter(contrast),
        'hair_dark_ratio':  hair_dark_ratio,       # no jitter — primary signal
        'narrow_dark_ratio': narrow_dark_ratio,
        'seed': seed
    }

def _fallback_scores(file_path: str) -> dict:
    """Fallback if image can't be processed — use filename hash."""
    seed = int(hashlib.md5(file_path.encode()).hexdigest()[:8], 16)
    rng = random.Random(seed)
    return {
        'brightness':        rng.uniform(0.4, 0.8),
        'variance':          rng.uniform(0.1, 0.4),
        'edge_density':      rng.uniform(0.2, 0.6),
        'darkness':          rng.uniform(0.3, 0.7),
        'contrast':          rng.uniform(0.2, 0.5),
        'hair_dark_ratio':   rng.uniform(0.1, 0.4),  # assume moderate hair
        'narrow_dark_ratio': rng.uniform(0.1, 0.4),
        'seed': seed
    }

CATEGORIES = [
    {
        'id': 'stronghold',
        'name': 'Stronghold',
        'emoji': '🏰',
        'subtitle': 'Hair: 1, Time: 0',
        'comments': [
            "Your hairline is holding a parliamentary majority. Nothing to worry about — statistically speaking.",
            "The follicles are thriving. They've formed a union and submitted a growth proposal.",
            "Scientists have been called in. They're baffled and slightly jealous.",
        ]
    },
    {
        'id': 'early_retreat',
        'name': 'Early Retreat',
        'emoji': '🚶',
        'subtitle': 'Negotiations underway',
        'comments': [
            "Your hairline is showing diplomatic tendencies. It hasn't left yet, but it's looking at the door.",
            "Think of it as hair exploring its options. Very normal. Very human.",
            "The temples are engaged in active peace talks. Current outlook: cautiously optimistic.",
        ]
    },
    {
        'id': 'temple_negotiations',
        'name': 'Temple Negotiations',
        'emoji': '🤝',
        'subtitle': 'Both sides at the table',
        'comments': [
            "Your temples are having a productive meeting. Agreement expected in 10–15 years.",
            "The hairline is adopting a more... minimalist philosophy. A bold aesthetic choice.",
            "You're developing what the industry calls 'distinguished temporal recession.' Very presidential.",
        ]
    },
    {
        'id': 'strategic_withdrawal',
        'name': 'Strategic Withdrawal',
        'emoji': '🎖️',
        'subtitle': 'Tactical repositioning',
        'comments': [
            "Your hair is making a brave strategic pivot. Forward is overrated — bald is aerodynamic.",
            "The follicles are on sabbatical. They've earned it. Many years of hard work.",
            "You're entering the elite tier: 0 hair-product spend, maximum wind resistance. Peak efficiency.",
        ]
    },
    {
        'id': 'chrome_dome',
        'name': 'Chrome Dome',
        'emoji': '✨',
        'subtitle': 'Peak aerodynamics achieved',
        'comments': [
            "Congratulations — you've already crossed the finish line. The scalp is smooth, the journey is complete.",
            "You are the endgame. Other hairlines look at you for inspiration and weep.",
            "Zero follicles, zero regrets. You're not losing hair — you're gaining face.",
        ]
    }
]

TIMELINE_LABELS = [
    "Now", "Raising an eyebrow", "Widow's peak emerging", "Temples widening",
    "Top-light detected", "Polishing required", "Chrome Dome Achieved"
]

def generate_result(scores_list: list, demo_mode: bool = False) -> dict:
    """
    Aggregate raw heuristic scores into a funny, friendly result.
    Clearly non-medical, for entertainment only.
    """
    if demo_mode or not scores_list:
        rng = random.Random(42)
        scores_list = [{
            'brightness':        rng.uniform(0.45, 0.65),
            'variance':          rng.uniform(0.15, 0.35),
            'edge_density':      rng.uniform(0.25, 0.55),
            'darkness':          rng.uniform(0.35, 0.65),
            'contrast':          rng.uniform(0.25, 0.45),
            'hair_dark_ratio':   rng.uniform(0.18, 0.40),   # demo = moderate hair
            'narrow_dark_ratio': rng.uniform(0.18, 0.40),
            'seed': 42
        }]

    # Average across images
    all_keys = ['brightness', 'variance', 'edge_density', 'darkness', 'contrast',
                'hair_dark_ratio', 'narrow_dark_ratio']
    avg = {k: float(np.mean([s[k] for s in scores_list if k in s]))
           for k in all_keys}

    combined_seed = sum(s.get('seed', 0) for s in scores_list)
    rng = random.Random(combined_seed)

    # ---------------------------------------------------------------
    # PRIMARY SIGNAL: hair_dark_ratio
    # Dark pixels (luminance < 80) in the upper portion = hair presence.
    # This is background-colour-invariant: white, grey, or dark backgrounds
    # are all irrelevant because we only count definitively dark pixels.
    # A bald person scores ~0.01-0.04; a hairy person scores ~0.20-0.55.
    # ---------------------------------------------------------------
    hair_dark  = avg.get('hair_dark_ratio',   0.2)
    narrow_dark = avg.get('narrow_dark_ratio', 0.2)
    # Take the more conservative (lower) of the two zones
    best_dark  = min(hair_dark, narrow_dark)

    # Early-exit: if almost no dark pixels exist → already bald
    if best_dark < 0.06:
        already_bald = True
        years_low, years_high = 0, 0
        density_score    = max(0, round(best_dark * 150))   # ~0-9
        recession_score  = round(min(10, 9.5 + (0.06 - best_dark) * 30), 1)
        cat              = CATEGORIES[4]  # Chrome Dome
        comment          = rng.choice(cat['comments'])
        confidence       = round(rng.uniform(82, 95), 1)   # extra confident for obvious cases
        timeline_pos     = 6
        follicle_names   = ['The Last Guardians', 'The Brave Few', 'The Survivors']
        follicle_name    = rng.choice(follicle_names)
        return {
            'years_low': years_low, 'years_high': years_high,
            'already_bald': already_bald,
            'recession_score': recession_score,
            'density_score': density_score,
            'confidence': confidence,
            'category': cat,
            'comment': comment,
            'timeline_pos': timeline_pos,
            'timeline_labels': TIMELINE_LABELS,
            'follicle_name': follicle_name,
            'demo_mode': demo_mode,
            'disclaimer': 'For entertainment only. Not medical advice. Cannot diagnose or predict hair loss.'
        }

    # Recession score (0-10): higher brightness + lower edge density + lower variance = more recession
    # Amplified to be more sensitive — a bright, smooth, featureless top = very high recession.
    # Also factor in hair_dark_ratio directly: more dark pixels = lower recession.
    recession_raw = (avg['brightness'] * 0.35 + (1 - avg['edge_density']) * 0.30 +
                     (1 - avg['variance']) * 0.15 + (1 - min(best_dark / 0.30, 1.0)) * 0.20)
    recession_score = round(min(10, max(0, recession_raw * 11.0 + rng.uniform(-0.3, 0.3))), 1)

    # Density score (0-100): more dark pixels + more edges + more variance = denser hair
    density_raw = (best_dark * 0.50 + avg['edge_density'] * 0.30 + avg['variance'] * 0.20)
    density_score = round(min(100, max(0, density_raw * 200 + rng.uniform(-3, 3))))

    # --- Tiered years-until-bald logic (purely fictional) ---
    # This avoids the old linear formula's artificial floor that made bald heads look "safe".
    already_bald = False
    if recession_score >= 9.5 or density_score <= 8:
        # Almost certainly already in Chrome Dome territory
        already_bald = True
        years_low = 0
        years_high = 0
    elif recession_score >= 8.0 or density_score <= 18:
        # Deep into Strategic Withdrawal — very little time left
        years_low = 0
        years_high = rng.randint(1, 3)
    elif recession_score >= 6.5:
        # Temple Negotiations — a few years remain
        center = rng.randint(3, 8)
        years_low = max(0, center - rng.randint(1, 2))
        years_high = center + rng.randint(1, 3)
    else:
        # Healthy territory — use density + recession to compute runway
        base = (density_score / 100) * 35 + (1 - recession_score / 10) * 20
        center = max(5, min(50, int(base) + rng.randint(-3, 3)))
        years_low = max(2, center - rng.randint(2, 5))
        years_high = center + rng.randint(2, 6)

    # Category — 5 tiers including Chrome Dome for already-bald
    if already_bald or recession_score >= 9.5:
        cat = CATEGORIES[4]  # Chrome Dome
    elif recession_score >= 7.5:
        cat = CATEGORIES[3]  # Strategic Withdrawal
    elif recession_score >= 5.0:
        cat = CATEGORIES[2]  # Temple Negotiations
    elif recession_score >= 2.5:
        cat = CATEGORIES[1]  # Early Retreat
    else:
        cat = CATEGORIES[0]  # Stronghold

    comment = rng.choice(cat['comments'])

    # Confidence (always comedically high for entertainment)
    confidence = round(rng.uniform(62, 91), 1)

    # Timeline position (0-6) — use full scale, bald = 6
    if already_bald:
        timeline_pos = 6
    else:
        timeline_pos = min(6, round(recession_score * 0.62))

    # Fun follicle name
    follicle_names = [
        "The Invincibles", "Brave Battalion", "The Resilient Ones",
        "The Pioneers", "Bold Frontiersmen", "The Last Guardians"
    ]
    follicle_name = rng.choice(follicle_names)

    return {
        'years_low': years_low,
        'years_high': years_high,
        'already_bald': already_bald,
        'recession_score': recession_score,
        'density_score': density_score,
        'confidence': confidence,
        'category': cat,
        'comment': comment,
        'timeline_pos': timeline_pos,
        'timeline_labels': TIMELINE_LABELS,
        'follicle_name': follicle_name,
        'demo_mode': demo_mode,
        'disclaimer': 'For entertainment only. Not medical advice. Cannot diagnose or predict hair loss.'
    }
