from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
# Allow your Chrome tab & extension to call localhost:5000
CORS(app)

# --- lightweight scoring stub (replace with ML later) ---
STRONG_PATTERNS = [
    r"verify (your )?account",
    r"urgent|immediately|asap|right away",
    r"password|credentials|login|sign in",
    r"suspend(ed)?|locked|deactivate",
    r"reset (your )?password",
    r"confirm (your )?identity",
    r"pay(?:ment)?|invoice|wire|gift ?card",
]
CLICK_HERE = r"click here"

def score_text(text: str):
    t = (text or "").lower()
    if not t.strip():
        return 0.0, []

    reasons = []
    points = 0.0

    hits = 0
    for pat in STRONG_PATTERNS:
        if re.search(pat, t):
            hits += 1
            reasons.append(f'Phrase match: "{pat}"')
    points += 0.2 * hits

    if re.search(CLICK_HERE, t):  # only if actually present
        points += 0.1
        reasons.append('Call-to-action: "click here"')

    # simple link heuristics
    http_links = len(re.findall(r"https?://", t))
    if http_links >= 3:
        points += 0.15
        reasons.append(f"Multiple links: {http_links}")

    # clamp 0..1
    score = max(0.0, min(1.0, points))
    if score > 0.3 and not reasons:
        score = 0.3
    return score, reasons

@app.route("/scan", methods=["POST"])
def scan():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text", "")
    score, reasons = score_text(text)
    label = "Suspicious" if score >= 0.7 else "Warning" if score >= 0.4 else "Safe"
    return jsonify({
        "label": label,
        "confidence": score,
        "reasons": reasons,
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)