// ============================================================
// STYLEFRAME — clean ads portfolio
// ============================================================
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  /* ---------- THEME (white default + toggle) ---------- */
  const html = document.documentElement;
  let tBtn = $("#themeToggle");
  const stored = localStorage.getItem("styleframe-theme");
  // default to white/light unless the user explicitly chose dark before
  if (stored) html.setAttribute("data-theme", stored);
  else html.setAttribute("data-theme", "light");
  icon();
  function icon() {
    if (!tBtn) tBtn = $("#themeToggle");
    if (!tBtn) return;
    const dark = html.getAttribute("data-theme") === "dark" ||
      (!html.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    tBtn.textContent = dark ? "☀️" : "🌙";
  }
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (!html.getAttribute("data-theme")) icon(); });
  if (tBtn) tBtn.addEventListener("click", () => {
    const c = html.getAttribute("data-theme");
    if (c === "dark") html.setAttribute("data-theme", "light");
    else if (c === "light") html.removeAttribute("data-theme");
    else html.setAttribute("data-theme", "dark");
    localStorage.setItem("styleframe-theme", html.getAttribute("data-theme") || "auto");
    icon();
  });

  /* ---------- NAV ---------- */
  $$("[data-openmenu]").forEach((b) => b.addEventListener("click", () => $("#mobileMenu").classList.add("open")));
  $$("[data-closemenu]").forEach((b) => b.addEventListener("click", () => $("#mobileMenu").classList.remove("open")));
  window.addEventListener("scroll", () => { const n = $("#nav"); if (n) n.classList.toggle("scrolled", window.scrollY > 20); });

  /* ---------- ADS ---------- */
  const ADS = [
    { t: "Product Reveal", c: "Commercial", y: "2026", poster: "posters/product-reveal.jpg", v: "videos/product-reveal.mp4" },
    { t: "Sneaker Drop", c: "Commercial", y: "2026", poster: "posters/sneaker-drop.jpg", v: "videos/sneaker-drop.mp4" },
    { t: "Social Commercial", c: "Social", y: "2026", poster: "posters/social-commercial.jpg", v: "videos/social-commercial.mp4" },
    { t: "Brand Film", c: "Brand Film", y: "2026", poster: "posters/brand-film.jpg", v: "videos/brand-film.mp4" },
  ];
  const grid = $("#adsGrid");
  const modal = $("#videoModal");
  const modalVideo = $("#modalVideo");

  grid.innerHTML = ADS.map((a) => `
    <div class="ad-card" data-v="${a.v}" data-p="${a.poster}">
      <img src="${a.poster}" alt="${a.t}">
      <video class="hv" muted loop playsinline preload="none"></video>
      <span class="play"></span>
      <span class="year">${a.y}</span>
      <div class="info"><span class="cat">${a.c}</span><h3>${a.t}</h3></div>
    </div>`).join("");

  $$(".ad-card", grid).forEach((card) => {
    card.addEventListener("click", () => {
      modalVideo.src = card.dataset.v;
      modalVideo.poster = card.dataset.p;
      modal.classList.add("open");
      document.body.classList.add("modal-open");
      modalVideo.play();
    });
    const hv = card.querySelector(".hv");
    card.addEventListener("mouseenter", () => { hv.src = card.dataset.v; hv.play().then(() => hv.classList.add("playing")).catch(() => {}); });
    card.addEventListener("mouseleave", () => { hv.pause(); hv.classList.remove("playing"); });
  });

  function closeModal() {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
  }
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });

  /* ---------- BOOKING ---------- */
  const TIME = ["10:00", "11:30", "13:00", "15:00", "16:30", "18:00"];
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  let viewDate = new Date(); viewDate.setDate(1);
  let selDate = null, selSlot = null;
  const calDays = $("#calDays"), calMonth = $("#calMonth"), slots = $("#slots");

  function offCell(d) {
    const dow = d.getDay();
    const seed = (d.getDate() + d.getMonth() + d.getFullYear()) % 8;
    // Sundays off, plus a pseudo-full/partial day every ~8 days
    return dow === 0 || seed === 6;
  }
  function renderCal() {
    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    calMonth.textContent = MONTHS[m] + " " + y;
    const first = new Date(y, m, 1).getDay();
    const dim = new Date(y, m + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let h = '<span class="cw">S</span><span class="cw">M</span><span class="cw">T</span><span class="cw">W</span><span class="cw">T</span><span class="cw">F</span><span class="cw">S</span>';
    for (let i = 0; i < first; i++) h += '<button class="cal-day blank" type="button"></button>';
    for (let d = 1; d <= dim; d++) {
      const dt = new Date(y, m, d);
      const past = dt < today;
      const sel = selDate && dt.toDateString() === selDate.toDateString();
      h += `<button class="cal-day ${past ? "past" : ""} ${sel ? "selected" : ""}" type="button" data-date="${y}-${m}-${d}" ${past ? "" : ""}>${d}</button>`;
    }
    calDays.innerHTML = h;
    renderSlots();
  }
  function renderSlots() {
    if (!selDate) { slots.innerHTML = ""; $("#bookSummary").textContent = "Selected: choose a date & time"; return; }
    const n = (selDate.getDate() + selDate.getMonth()) % 3 === 1 ? 4 : 6;
    slots.innerHTML = TIME.slice(0, n).map((s) => `<button class="slot ${selSlot === s ? "selected" : ""}" type="button" data-s="${s}">${s}</button>`).join("");
    $$(".slot", slots).forEach((b) => b.addEventListener("click", () => {
      selSlot = b.dataset.s;
      $$(".slot", slots).forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
      $("#bookSummary").textContent = "Selected: " + fmt(selDate) + " · " + selSlot;
    }));
  }
  function fmt(d) { return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear(); }
  calDays.addEventListener("click", (e) => {
    const b = e.target.closest(".cal-day");
    if (!b || b.classList.contains("blank") || b.classList.contains("past")) return;
    const parts = b.dataset.date.split("-").map(Number);
    selDate = new Date(parts[0], parts[1], parts[2]);
    selSlot = null;
    renderCal();
  });
  $("#calPrev").addEventListener("click", () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCal(); });
  $("#calNext").addEventListener("click", () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCal(); });
  renderCal();

  /* ---------- BOOK FORM (validated) ---------- */
  const bkName = $("#bkName"), bkEmail = $("#bkEmail"), bkPhone = $("#bkPhone");
  const errName = $("#errName"), errEmail = $("#errEmail"), errPhone = $("#errPhone");

  /* ---- country codes (flags) ---- */
  const COUNTRIES = [
    {n:"India", c:"IN", f:"🇮🇳", cc:"+91"},
    {n:"United States", c:"US", f:"🇺🇸", cc:"+1"},
    {n:"United Kingdom", c:"GB", f:"🇬🇧", cc:"+44"},
    {n:"Canada", c:"CA", f:"🇨🇦", cc:"+1"},
    {n:"Australia", c:"AU", f:"🇦🇺", cc:"+61"},
    {n:"Pakistan", c:"PK", f:"🇵🇰", cc:"+92"},
    {n:"Bangladesh", c:"BD", f:"🇧🇩", cc:"+880"},
    {n:"Nepal", c:"NP", f:"🇳🇵", cc:"+977"},
    {n:"Sri Lanka", c:"LK", f:"🇱🇰", cc:"+94"},
    {n:"UAE", c:"AE", f:"🇦🇪", cc:"+971"},
    {n:"Saudi Arabia", c:"SA", f:"🇸🇦", cc:"+966"},
    {n:"Singapore", c:"SG", f:"🇸🇬", cc:"+65"},
    {n:"Malaysia", c:"MY", f:"🇲🇾", cc:"+60"},
    {n:"Indonesia", c:"ID", f:"🇮🇩", cc:"+62"},
    {n:"Philippines", c:"PH", f:"🇵🇭", cc:"+63"},
    {n:"Thailand", c:"TH", f:"🇹🇭", cc:"+66"},
    {n:"Vietnam", c:"VN", f:"🇻🇳", cc:"+84"},
    {n:"China", c:"CN", f:"🇨🇳", cc:"+86"},
    {n:"Japan", c:"JP", f:"🇯🇵", cc:"+81"},
    {n:"South Korea", c:"KR", f:"🇰🇷", cc:"+82"},
    {n:"Germany", c:"DE", f:"🇩🇪", cc:"+49"},
    {n:"France", c:"FR", f:"🇫🇷", cc:"+33"},
    {n:"Italy", c:"IT", f:"🇮🇹", cc:"+39"},
    {n:"Spain", c:"ES", f:"🇪🇸", cc:"+34"},
    {n:"Netherlands", c:"NL", f:"🇳🇱", cc:"+31"},
    {n:"Russia", c:"RU", f:"🇷🇺", cc:"+7"},
    {n:"Brazil", c:"BR", f:"🇧🇷", cc:"+55"},
    {n:"Mexico", c:"MX", f:"🇲🇽", cc:"+52"},
    {n:"South Africa", c:"ZA", f:"🇿🇦", cc:"+27"},
    {n:"Nigeria", c:"NG", f:"🇳🇬", cc:"+234"},
    {n:"Egypt", c:"EG", f:"🇪🇬", cc:"+20"},
    {n:"Kenya", c:"KE", f:"🇰🇪", cc:"+254"},
    {n:"Turkey", c:"TR", f:"🇹🇷", cc:"+90"},
    {n:"Ukraine", c:"UA", f:"🇺🇦", cc:"+380"},
    {n:"Argentina", c:"AR", f:"🇦🇷", cc:"+54"},
    {n:"New Zealand", c:"NZ", f:"🇳🇿", cc:"+64"},
    {n:"Poland", c:"PL", f:"🇵🇱", cc:"+48"},
    {n:"Sweden", c:"SE", f:"🇸🇪", cc:"+46"},
    {n:"Switzerland", c:"CH", f:"🇨🇭", cc:"+41"},
  ];
  let selectedCC = COUNTRIES[0];
  const ccBtn = $("#ccBtn"), ccDrop = $("#ccDrop"), ccFlag = $("#ccFlag"), ccCode = $("#ccCode");

  /* ---- AUTO country detect (locale + IP) ---- */
  const TZ_MAP = { "Asia/Kolkata":"+91","Asia/Karachi":"+92","Asia/Dhaka":"+880","Asia/Kathmandu":"+977","Asia/Colombo":"+94","Asia/Dubai":"+971","Asia/Riyadh":"+966","Asia/Singapore":"+65","Asia/Kuala_Lumpur":"+60","Asia/Jakarta":"+62","Asia/Manila":"+63","Asia/Bangkok":"+66","Asia/Ho_Chi_Minh":"+84","Asia/Shanghai":"+86","Asia/Tokyo":"+81","Asia/Seoul":"+82","Europe/London":"+44","Europe/Berlin":"+49","Europe/Paris":"+33","Europe/Rome":"+39","Europe/Madrid":"+34","Europe/Amsterdam":"+31","Europe/Moscow":"+7","Europe/Kyiv":"+380","Europe/Warsaw":"+48","Europe/Stockholm":"+46","Europe/Zurich":"+41","America/New_York":"+1","America/Chicago":"+1","America/Denver":"+1","America/Los_Angeles":"+1","America/Toronto":"+1","America/Sao_Paulo":"+55","America/Mexico_City":"+52","America/Argentina/Buenos_Aires":"+54","Australia/Sydney":"+61","Australia/Melbourne":"+61","Australia/Perth":"+61","Pacific/Auckland":"+64","Africa/Johannesburg":"+27","Africa/Lagos":"+234","Africa/Cairo":"+20","Africa/Nairobi":"+254","Europe/Istanbul":"+90" };
  function applyCC(cc) {
    const c = COUNTRIES.find((x) => x.cc === cc);
    if (!c) return;
    selectedCC = c; ccFlag.textContent = c.f; ccCode.textContent = c.cc;
  }
  function detectByLocale() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && TZ_MAP[tz]) { applyCC(TZ_MAP[tz]); return true; }
      const lang = (navigator.language || "").toLowerCase();
      const LANG_MAP = { in:"+91", us:"+1", gb:"+44", ca:"+1", au:"+61", pk:"+92", bd:"+880", np:"+977", ae:"+971", sg:"+65", my:"+60", id:"+62", ph:"+63", th:"+66", vn:"+84", cn:"+86", jp:"+81", kr:"+82", de:"+49", fr:"+33", it:"+39", es:"+34", nl:"+31", ru:"+7", br:"+55", mx:"+52", za:"+27", ng:"+234", eg:"+20", ke:"+254", tr:"+90", ua:"+380", ar:"+54", nz:"+64", pl:"+48", se:"+46", ch:"+41", lk:"+94" };
      if (lang && LANG_MAP[lang.split("-")[1] || lang.split("-")[0]]) applyCC(LANG_MAP[lang.split("-")[1] || lang.split("-")[0]]);
      return true;
    } catch (e) { return false; }
  }
  detectByLocale(); // instant locale hint (works offline)

  // IP-based (best accuracy) — silent fail if blocked
  try {
    fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3500) })
      .then((r) => r.json())
      .then((j) => { if (j && j.country_calling_code) applyCC(j.country_calling_code); })
      .catch(function () {});
  } catch (e) {}

  function renderCC() {
    ccDrop.innerHTML = COUNTRIES.map((c) =>
      `<button class="cc-item" type="button" data-cc="${c.cc}"><span class="cc-flag">${c.f}</span><span>${c.n}</span><span class="cc-name">${c.cc}</span></button>`
    ).join("");
  }
  renderCC();
  ccBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = ccDrop.style.display === "block";
    ccDrop.style.display = open ? "none" : "block";
  });
  ccDrop.addEventListener("click", (e) => {
    const item = e.target.closest(".cc-item");
    if (!item) return;
    const c = COUNTRIES.find((x) => x.cc === item.dataset.cc);
    if (c) { selectedCC = c; ccFlag.textContent = c.f; ccCode.textContent = c.cc; }
    ccDrop.style.display = "none";
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#ccSelect")) ccDrop.style.display = "none";
  });

  /* ---- spam security: 1 booking + cooldown + honeypot ---- */
  const BOOK_KEY = "styleframe-booked";
  const COOLDOWN_MS = 30 * 60 * 1000; // 30 min
  function bookBlocked() {
    const rec = localStorage.getItem(BOOK_KEY);
    if (!rec) return null;
    try {
      const r = JSON.parse(rec);
      const wait = r.at + COOLDOWN_MS - Date.now();
      if (wait > 0) return Math.ceil(wait / 60000);
    } catch (e) {}
    return null;
  }
  // honeypot: hidden field bots fill
  let hp = document.createElement("input");
  hp.type = "text";
  hp.id = "bkHp";
  hp.style.cssText = "position:absolute;left:-9999px;opacity:0;height:0;width:0;";
  $("#bookForm").appendChild(hp);

  function setErr(el, msg) {
    const err = el === bkName ? errName : el === bkEmail ? errEmail : errPhone;
    err.textContent = msg;
    el.classList.toggle("bad", !!msg);
    return !msg;
  }
  function validName(v) {
    v = v.trim();
    if (!v) return setErr(bkName, "Name is required.");
    if (v.length < 2) return setErr(bkName, "Name must be at least 2 letters.");
    if (!/^[A-Za-z][A-Za-z\s.'-]{1,49}$/.test(v)) return setErr(bkName, "Only letters allowed — no numbers or symbols.");
    return setErr(bkName, "");
  }
  function validEmail(v) {
    v = v.trim();
    if (!v) return setErr(bkEmail, "Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setErr(bkEmail, "Enter a valid email — like name@example.com.");
    return setErr(bkEmail, "");
  }
  function validPhone(v) {
    let digits = v.replace(/[\s()-]/g, "");
    // strips a leading country code if user typed the full international number
    const ccDigits = selectedCC.cc.replace("+", "");
    if (digits.indexOf(ccDigits) === 0 && digits.length > ccDigits.length) digits = digits.slice(ccDigits.length);
    if (!v) return setErr(bkPhone, "Enter your number.");
    if (!/^\d{6,15}$/.test(digits)) return setErr(bkPhone, "Enter a valid number — digits only, " + selectedCC.cc + ".");
    return setErr(bkPhone, "");
  }
  // live validation as user types
  bkName.addEventListener("input", () => validName(bkName.value));
  bkEmail.addEventListener("input", () => validEmail(bkEmail.value));
  bkPhone.addEventListener("input", () => validPhone(bkPhone.value));

  /* ---- full submission hardening ---- */
  const ATTEMPT_KEY = "styleframe-attempts";
  let submitLocked = false;
  const formOpenedAt = Date.now();
  function humanTimePassed() { return Date.now() - formOpenedAt > 1500; }
  function attemptsLeft() {
    try {
      const a = JSON.parse(localStorage.getItem(ATTEMPT_KEY) || "{}");
      if (a.until && a.until > Date.now()) return -Math.ceil((a.until - Date.now()) / 60000); // locked, minutes remaining (negative)
      return a.n || 0;
    } catch (e) { return 0; }
  }
  function noteAttempt() {
    try {
      const a = JSON.parse(localStorage.getItem(ATTEMPT_KEY) || "{}");
      const n = (a.n || 0) + 1;
      if (n >= 10) localStorage.setItem(ATTEMPT_KEY, JSON.stringify({ n: 0, until: Date.now() + 15 * 60000 })); // lock 15 min after 10 attempts
      else localStorage.setItem(ATTEMPT_KEY, JSON.stringify({ n: n }));
    } catch (e) {}
  }

  $("#bookForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const st = $("#bookStatus");

    // DOUBLE-SUBMIT guard
    if (submitLocked) { st.textContent = "Already submitting — please wait."; st.style.display = "block"; st.style.color = "#e5484d"; return; }

    // ATTEMPT lockout
    const al = attemptsLeft();
    if (al < 0) {
      st.textContent = "Too many attempts — locked for " + al + " min.";
      st.style.display = "block"; st.style.color = "#e5484d";
      return;
    }

    // SPAM: honeypot — bots fill hidden fields
    if (hp.value) { st.textContent = "Blocked by spam filter."; st.style.display = "block"; st.style.color = "#e5484d"; return; }
    // SPAM: too-fast submission (bots)
    if (!humanTimePassed()) { st.textContent = "Please take a moment to fill the form."; st.style.display = "block"; st.style.color = "#e5484d"; return; }
    // SPAM: rate limit — 1 booking per browser per 30 min
    const waitMin = bookBlocked();
    if (waitMin !== null) {
      st.textContent = "You already booked recently — please try again in " + waitMin + " min.";
      st.style.display = "block"; st.style.color = "#e5484d";
      return;
    }

    // sanitize + length caps (XSS / abuse) — apostrophes are fine; only flag real markup chars
    const hasDangerChars = /[<>&"]/.test(bkName.value) || /[<>&"]/.test(bkEmail.value) || /[<>&"]/.test(bkPhone.value);
    if (hasDangerChars || bkName.value.length > 60 || bkEmail.value.length > 120 || bkPhone.value.length > 20) {
      st.textContent = "Input too long or contains invalid characters.";
      st.style.display = "block"; st.style.color = "#e5484d";
      return;
    }

    // validate all fields
    const okName = validName(bkName.value);
    const okEmail = validEmail(bkEmail.value);
    const okPhone = validPhone(bkPhone.value);
    if (!okName || !okEmail || !okPhone) {
      noteAttempt();
      st.textContent = "Please fix the highlighted fields.";
      st.style.display = "block"; st.style.color = "#e5484d";
      return;
    }
    if (!selDate || !selSlot) {
      st.textContent = "Please pick a date and time first.";
      st.style.display = "block"; st.style.color = "#e5484d";
      return;
    }

    // success — lock the button (no double submit), remember cooldown
    submitLocked = true;
    st.textContent = "🎉 Booking confirmed — " + fmt(selDate) + " at " + selSlot + ". Sending to WhatsApp…";
    st.style.display = "block"; st.style.color = "#2eaf5d";
    localStorage.setItem(BOOK_KEY, JSON.stringify({ at: Date.now() }));
    localStorage.removeItem(ATTEMPT_KEY);
    // WhatsApp integration: open wa.me prefilled to the owner's number
    const text = encodeURIComponent(
      "New Booking — StyleFrame\nName: " + bkName.value.trim() +
      "\nEmail: " + bkEmail.value.trim() +
      "\nPhone: " + selectedCC.cc + " " + bkPhone.value.trim() +
      "\nDate: " + fmt(selDate) + " " + selSlot +
      "\nService: intro call"
    );
    try { window.open("https://wa.me/917876620064?text=" + text, "_blank"); } catch (e) {}
    e.target.reset();
    [errName, errEmail, errPhone].forEach((x) => (x.textContent = ""));
    [bkName, bkEmail, bkPhone].forEach((x) => x.classList.remove("bad"));
    selDate = null; selSlot = null; renderCal();
  });

  /* ---------- HERO FADE ---------- */
  $$(".hero-eyebrow, .hero-title, .hero-sub, .hero-actions, .hero-meta").forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transition = "opacity .6s ease " + (i * .1) + "s";
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = "1"; }));
  });

  /* ---------- HERO BACKGROUND VIDEO ---------- */
  const heroBg = $("#heroBg");
  if (heroBg) {
    heroBg.src = "videos/hero-bg.mp4";
    heroBg.play().catch(() => {});
  }
})();