// content_script.js — Purdue "P" on inbox, % on opened email (robust for Outlook)
(function main() {
  const WIDGET_ID = "purdue-phish-widget";
  if (document.getElementById(WIDGET_ID)) return;

  // ---------- UI ----------
  const badge = document.createElement("div");
  Object.assign(badge.style, {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    zIndex: "2147483647",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "black",
    color: "#DAAA00",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif",
    fontSize: "18px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    userSelect: "none",
    transition: "background 250ms ease,color 250ms ease"
  });
  badge.id = WIDGET_ID;
  document.body.appendChild(badge);

  const tip = document.createElement("div");
  Object.assign(tip.style, {
    position: "fixed",
    maxWidth: "320px",
    right: "20px",
    bottom: "90px",
    zIndex: "2147483647",
    background: "#111",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    lineHeight: "1.4",
    boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
    display: "none",
    whiteSpace: "pre-wrap"
  });
  document.body.appendChild(tip);

  badge.addEventListener("mouseenter", () => (tip.style.display = "block"));
  badge.addEventListener("mouseleave", () => (tip.style.display = "none"));

  function showP() {
    badge.textContent = "P";
    badge.style.background = "black";
    badge.style.color = "#DAAA00";
    tip.textContent = "Purdue Outlook scanner\nOpen an email to see the risk score.\n(Demo heuristic — ML model coming soon.)";
  }

  function showPct(score, reasons) {
    const pct = Math.round(score * 100);
    badge.textContent = pct + "%";
    const bg = score >= 0.7 ? "#E5534B" : score >= 0.4 ? "#FFC247" : "#2ECC71";
    const fg = score >= 0.7 ? "#fff" : "#000";
    badge.style.background = bg;
    badge.style.color = fg;
    tip.textContent = `Risk: ${pct}%\n${(reasons && reasons.length) ? reasons.map(r=>"• "+r).join("\n") : "No obvious phishing terms found."}`;
  }

  // ---------- Outlook detection ----------
  // A. Is a message selected in the list?
  function isMessageSelected() {
    // list items typically have role="option"; the selected one has aria-selected="true"
    return !!document.querySelector('[role="listbox"] [role="option"][aria-selected="true"]');
  }

  // B. Does the reading pane show a real message UI (Reply/Forward toolbar)?
  function hasReplyToolbar() {
    // Look for visible buttons that say Reply or Forward in the reading pane header
    const btn = document.querySelector('button[title="Reply"], button[aria-label="Reply"], button[title="Forward"], button[aria-label="Forward"]');
    return !!btn;
  }

  // C. Extract the actual message body element
  function getMessageBodyEl() {
    const sels = [
      '[aria-label="Message body"]',
      'div[role="document"]',
      '[data-app-section="ReadingPane"] [role="document"]',
      'div[role="main"] [role="document"]'
    ];
    for (const s of sels) {
      const el = document.querySelector(s);
      if (el) return el;
    }
    return null;
  }

  function getMessageText() {
    const el = getMessageBodyEl();
    if (!el) return "";
    return (el.innerText || "").trim();
  }

  // ---------- demo scoring ----------
  function simpleScore(text) {
    const pats = [
      /verify (your )?account/i,
      /urgent|immediately|asap|right away/i,
      /password|credentials|login|sign in/i,
      /suspend(ed)?|locked|deactivate/i,
      /click here/i
    ];
    const hits = pats.filter(re => re.test(text)).length;
    const score = Math.min(1, hits * 0.2);
    const reasons = hits ? [`${hits} suspicious keyword match(es)`] : [];
    return { score, reasons };
  }

  // ---------- state machine ----------
  let lastMode = "inbox";      // "inbox" | "email"
  let lastBodyHash = "";

  function hash(s) {
    let h = 0; for (let i=0;i<s.length;i++) h=(h*31 + s.charCodeAt(i))|0; return String(h);
  }

  function update() {
    const selected = isMessageSelected();
    const bodyEl = getMessageBodyEl();
    const bodyText = bodyEl ? (bodyEl.innerText||"").trim() : "";

    // Inbox mode when either:
    // - nothing is selected, OR
    // - reading pane has no body element, OR
    // - body text is extremely short (< 5 chars) — avoids QR/empty panels
    const inboxMode = !selected || !bodyEl || bodyText.length < 5 || !hasReplyToolbar();

    if (inboxMode) {
      if (lastMode !== "inbox") {
        lastMode = "inbox";
        showP();
      }
      return;
    }

    // Email open
    const h = hash(bodyText);
    if (lastMode !== "email" || h !== lastBodyHash) {
      lastMode = "email";
      lastBodyHash = h;

      // Water-wash animation
      badge.animate(
        [
          { transform: "scale(1)", filter: "blur(0px)" },
          { transform: "scale(1.12)", filter: "blur(4px)" },
          { transform: "scale(1)", filter: "blur(0px)" }
        ],
        { duration: 700, easing: "ease-in-out" }
      );

      const { score, reasons } = simpleScore(bodyText);
      setTimeout(() => showPct(score, reasons), 300);
    }
  }

  // Observe Outlook’s dynamic DOM
  const mo = new MutationObserver(() => {
    clearTimeout(update._t);
    update._t = setTimeout(update, 180); // snappy but debounced
  });
  mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  // First paint
  showP();
  update();

  // Support popup "Rescan" if you kept it
  chrome.runtime?.onMessage?.addListener((msg) => {
    if (msg.type === "simulateScan") update();
  });
})();