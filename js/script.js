/* ==========================================================
   Namma RO: site scripts
   ========================================================== */

/* ---------- Header: sticky shadow, mobile menu, Legal dropdown ---------- */
(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const nav = document.getElementById("primary-nav");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const dropdownToggle = document.querySelector("[data-dropdown-toggle]");
  const dropdownMenu = document.getElementById("legal-menu");

  // Sticky header shadow
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  navToggle.addEventListener("click", () => {
    setMenu(!nav.classList.contains("is-open"));
  });

  // Close the menu after tapping a link
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });

  // Legal dropdown
  const setDropdown = (open) => {
    dropdownMenu.classList.toggle("is-open", open);
    dropdownToggle.setAttribute("aria-expanded", String(open));
  };

  dropdownToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setDropdown(!dropdownMenu.classList.contains("is-open"));
  });

  // Click outside closes the dropdown
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav__item--dropdown")) setDropdown(false);
  });

  // Escape closes everything
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setDropdown(false);
      setMenu(false);
    }
  });

  // Reset the mobile menu if the window is resized to desktop
  window.matchMedia("(min-width: 992px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });
})();

/* ---------- TDS checker ---------- */
(() => {
  "use strict";

  const root = document.querySelector("[data-tds]");
  if (!root) return;

  const range = root.querySelector("[data-tds-range]");
  const valueEl = root.querySelector("[data-tds-value]");
  const resultEl = root.querySelector("[data-tds-result]");
  const statusEl = root.querySelector("[data-tds-status]");
  const messageEl = root.querySelector("[data-tds-message]");
  const setupEl = root.querySelector("[data-tds-setup]");
  const sourceButtons = root.querySelectorAll("[data-ppm]");

  // Each level applies up to and including its "max" value (PPM)
  const LEVELS = [
    {
      max: 150,
      key: "excellent",
      label: "Excellent \u00b7 Very Low TDS",
      message:
        "Your water has very low dissolved solids and is generally safe to drink. A basic UV + UF purifier is usually enough, and a full RO system may strip out useful minerals.",
      setup: "UV + UF Purifier",
    },
    {
      max: 300,
      key: "good",
      label: "Good \u00b7 Comfortable Range",
      message:
        "Your water is within a comfortable drinking range. A UV + UF purifier keeps it microbiologically safe, and RO is optional if you prefer a softer taste.",
      setup: "UV + UF Purifier (RO optional)",
    },
    {
      max: 500,
      key: "moderate",
      label: "Moderate \u00b7 Needs Treatment",
      message:
        "Dissolved salts are higher than ideal. This affects taste, causes scaling in kettles and appliances, and RO purification is recommended to bring TDS down to a healthy level.",
      setup: "7-Stage RO + UV + TDS Controller",
    },
    {
      max: 900,
      key: "high",
      label: "High \u00b7 RO Essential",
      message:
        "This is above the 500 PPM acceptable limit in India's BIS drinking-water standard (IS 10500). RO purification is essential for safe daily drinking water.",
      setup: "High-Recovery 7-Stage RO + UV",
    },
    {
      max: Infinity,
      key: "severe",
      label: "Very High \u00b7 Treatment Mandatory",
      message:
        "Dissolved salts are very high. A heavy-duty multi-stage RO with regular membrane servicing is strongly recommended, and a full lab test is advisable.",
      setup: "Heavy-Duty RO + Pre-Filter + UV",
    },
  ];

  const getLevel = (ppm) => LEVELS.find((level) => ppm <= level.max);

  const update = () => {
    const ppm = Number(range.value);
    const level = getLevel(ppm);
    const percent = (ppm / Number(range.max)) * 100;

    valueEl.textContent = ppm;
    range.style.setProperty("--fill", percent + "%");
    range.setAttribute("aria-valuetext", ppm + " PPM, " + level.label);

    resultEl.dataset.level = level.key;
    statusEl.textContent = level.label;
    messageEl.textContent = level.message;
    setupEl.textContent = level.setup;
  };

  range.addEventListener("input", update);

  // Clicking a water-source chip jumps the slider to that value
  sourceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      range.value = button.dataset.ppm;
      update();
    });
  });

  update();
})();

/* ---------- Footer year ---------- */
(() => {
  "use strict";

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();

/* ---------- Scroll-to-top button ---------- */
(() => {
  "use strict";

  const button = document.querySelector("[data-scroll-top]");
  if (!button) return;

  const toggle = () => {
    button.classList.toggle("is-visible", window.scrollY > 500);
  };

  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
})();

/* ---------- Social-proof toast ---------- */
(() => {
  "use strict";

  const toast = document.querySelector("[data-toast]");
  if (!toast) return;

  const titleEl = toast.querySelector("[data-toast-title]");
  const actionEl = toast.querySelector("[data-toast-action]");
  const timeEl = toast.querySelector("[data-toast-time]");
  const closeBtn = toast.querySelector("[data-toast-close]");

  // Sample messages (replace with real ones, or remove this feature if not wanted)
  const MESSAGES = [
    { title: "Karthik from Madurai", action: "booked an RO Service", time: "7 minutes ago" },
    { title: "Divya from Coimbatore", action: "chose the Gold AMC plan", time: "18 minutes ago" },
    { title: "Arun from Salem", action: "booked a Membrane Replacement", time: "32 minutes ago" },
    { title: "Lakshmi from Chennai", action: "requested a Free Water Test", time: "1 hour ago" },
  ];

  const FIRST_DELAY = 5000;   // wait before the first toast
  const VISIBLE_TIME = 6000;  // how long each toast stays
  const GAP_TIME = 14000;     // pause before the next one

  let index = 0;
  let timer = null;
  let dismissed = false;

  const hide = () => toast.classList.remove("is-visible");

  const show = () => {
    if (dismissed) return;

    const message = MESSAGES[index % MESSAGES.length];
    titleEl.textContent = message.title;
    actionEl.textContent = message.action;
    timeEl.textContent = message.time;
    toast.classList.add("is-visible");
    index += 1;

    timer = setTimeout(() => {
      hide();
      timer = setTimeout(show, GAP_TIME);
    }, VISIBLE_TIME);
  };

  closeBtn.addEventListener("click", () => {
    dismissed = true;
    clearTimeout(timer);
    hide();
  });

  timer = setTimeout(show, FIRST_DELAY);
})();