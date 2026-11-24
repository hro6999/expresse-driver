/* =========================================================
   EXPRESSE DRIVER – script.js
   ========================================================= */

/* ---------------------------------------------------------
   VOS RÉGLAGES — modifiez uniquement cette partie.
   Tout le site se met à jour automatiquement.
   --------------------------------------------------------- */
const CONFIG = {
  // Adresse qui reçoit les réservations (et affichée dans Contact)
  email: "expressedriver69@gmail.com",
  // Lien du bouton « M'ajouter sur WhatsApp » (section Contact)
  whatsappLien: "https://wa.me/qr/KYD4EWFPD52UM1",
  zone: "Lyon et alentours",

  // Textes de l'accueil (<br> = retour à la ligne, <em> = texte doré en italique)
  heroSurtitre: "Chauffeur privé VTC · Lyon",
  heroTitre: "L'élégance du trajet,<br><em>la précision de l'heure.</em>",
  heroSousTitre:
    "Transferts aéroport, gares, rendez-vous d'affaires et soirées : voyagez à Lyon avec un chauffeur dédié, ponctuel et discret.",

  // Chiffres clés (compteur kilométrique) — valeur = nombre entier
  chiffres: [
    { valeur: 24, unite: "h/24", label: "Disponibilité" },
    { valeur: 7, unite: "j/7", label: "Toute l'année" },
    { valeur: 100, unite: "%", label: "Ponctualité" },
    { valeur: 15, unite: "min", label: "D'avance au rendez-vous" },
  ],

  // Véhicule : mettez votre photo dans le dossier images puis changez le nom ici
  photoVehicule: "images/vehicule-placeholder.svg",
  vehiculeModele: "Une berline premium, pensée pour vous",

  // Tarifs indicatifs (prix en euros TTC)
  tarifs: [
    { depart: "Lyon centre", arrivee: "Aéroport Saint-Exupéry", prix: 65, detail: "Accueil personnalisé, suivi du vol" },
    { depart: "Lyon centre", arrivee: "Gare Part-Dieu / Perrache", prix: 25, detail: "Aide aux bagages incluse" },
    { depart: "Lyon centre", arrivee: "Eurexpo", prix: 45, detail: "Idéal salons et congrès" },
    { depart: "Lyon", arrivee: "Genève Aéroport", prix: 260, detail: "Porte à porte, sans correspondance" },
    { depart: "Lyon", arrivee: "Annecy", prix: 220, detail: "Confort longue distance" },
    { depart: "Mise à disposition", arrivee: "À l'heure", prix: 55, detail: "Minimum 2 heures", prefixe: "dès", suffixe: "/h" },
  ],

  // Avis clients (provisoires)
  avis: [
    { nom: "Sophie M.", contexte: "Transfert aéroport", note: 5, texte: "Chauffeur ponctuel et très courtois, voiture impeccable. Mon vol avait du retard, il m'attendait quand même avec le sourire. Je recommande vivement." },
    { nom: "Julien R.", contexte: "Déplacement d'affaires", note: 5, texte: "Service irréprochable pour mes rendez-vous clients. Trajet calme, Wi-Fi à bord, j'ai pu travailler tranquillement. Mon chauffeur attitré à Lyon." },
    { nom: "Claire & Thomas", contexte: "Mariage", note: 5, texte: "Discret, élégant et toujours à l'heure toute la soirée. Nos invités ont adoré. Merci pour cette prestation haut de gamme !" },
  ],

  // Réservation
  reservation: {
    objetEmail: "Nouvelle réservation Expresse Driver",
    maxPassagers: 4,
    maxBagages: 6,
    heureParDefaut: "08:00",
    pasMinutes: 5,      // les minutes avancent de 5 en 5
    moisReservables: 12 // jusqu'à combien de mois à l'avance
  },
};
/* ------------------ fin des réglages ------------------ */


(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Point sur un arc de cadran : angle 0 = vers le haut */
  const polar = (cx, cy, r, deg) => {
    const a = (deg * Math.PI) / 180;
    return [+(cx + r * Math.sin(a)).toFixed(2), +(cy - r * Math.cos(a)).toFixed(2)];
  };

  /* ---------- 1. Injection des réglages ---------- */
  function applyConfig() {
    $$("[data-bind]").forEach((el) => {
      const v = CONFIG[el.dataset.bind];
      if (v != null) el.textContent = v;
    });
    $$("[data-bind-html]").forEach((el) => {
      const v = CONFIG[el.dataset.bindHtml];
      if (v != null) el.innerHTML = v;
    });
    $$("[data-bind-src]").forEach((el) => {
      const v = CONFIG[el.dataset.bindSrc];
      if (v) el.src = v;
    });
    const links = { mail: "mailto:" + CONFIG.email, whatsapp: CONFIG.whatsappLien };
    $$("[data-href]").forEach((el) => {
      if (links[el.dataset.href]) el.href = links[el.dataset.href];
    });
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------- 2. Chiffres clés : compteur kilométrique ---------- */
  function renderStats() {
    const box = $("#stats");
    if (!box) return;
    const strip = Array.from({ length: 30 }, (_, i) => `<span>${i % 10}</span>`).join("");
    box.innerHTML = CONFIG.chiffres
      .map((c) => {
        const digits = String(c.valeur).split("").map((d) =>
          `<span class="odo__digit"><span class="odo__strip" style="--i:${20 + Number(d)}">${strip}</span></span>`
        ).join("");
        return `
        <div class="stat reveal">
          <div class="odo" aria-hidden="true">${digits}<span class="odo__unit">${esc(c.unite || "")}</span></div>
          <p class="sr-only">${esc(c.valeur)} ${esc(c.unite || "")}</p>
          <p class="stat__label">${esc(c.label)}</p>
        </div>`;
      })
      .join("");
  }

  /* ---------- 3. Tarifs : compteurs de vitesse ---------- */
  function gaugeTicks() {
    let out = "";
    for (let i = 0; i <= 12; i++) {
      const deg = -120 + i * 20;
      const major = i % 2 === 0;
      const [x1, y1] = polar(100, 100, major ? 62 : 66, deg);
      const [x2, y2] = polar(100, 100, 72, deg);
      out += `<line${major ? ' class="major"' : ""} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }
    return out;
  }

  function renderPrices() {
    const box = $("#prices");
    if (!box) return;
    const max = Math.max(...CONFIG.tarifs.map((t) => t.prix)) * 1.08;
    const ticks = gaugeTicks();
    const arc = "M30.72 140A80 80 0 1 1 169.28 140";

    box.innerHTML = CONFIG.tarifs
      .map((t) => {
        // échelle racine carrée : l'aiguille bouge joliment même pour les petits prix
        const ratio = Math.min(1, Math.max(0.08, Math.sqrt(t.prix / max)));
        const angle = -120 + 240 * ratio;
        const off = (100 - ratio * 100).toFixed(1);
        return `
        <article class="gauge-card reveal" style="--angle:${angle.toFixed(1)}deg;--off:${off}">
          <div class="gauge">
            <svg class="gauge__svg" viewBox="0 0 200 165" aria-hidden="true">
              <path class="gauge__track" d="${arc}"/>
              <path class="gauge__value" pathLength="100" d="${arc}"/>
              <g class="gauge__ticks">${ticks}</g>
              <g class="gauge__needle">
                <path d="M100 30L103 100H97Z"/>
                <circle cx="100" cy="100" r="8"/>
              </g>
            </svg>
            <p class="gauge__price"><small>${esc(t.prefixe || "à partir de")}</small>
              <strong>${esc(t.prix)}<sup>€</sup>${t.suffixe ? `<em>${esc(t.suffixe)}</em>` : ""}</strong></p>
          </div>
          <h3 class="gauge-card__route">${esc(t.depart)}
            <svg class="icon-sm" aria-hidden="true"><use href="#i-arrow"/></svg>
            <span class="sr-only">vers</span> ${esc(t.arrivee)}</h3>
          ${t.detail ? `<p class="gauge-card__detail">${esc(t.detail)}</p>` : ""}
        </article>`;
      })
      .join("");
  }

  /* ---------- 4. Avis ---------- */
  function renderReviews() {
    const box = $("#reviews");
    if (!box) return;
    const star = '<svg aria-hidden="true"><use href="#i-star"/></svg>';
    box.innerHTML = CONFIG.avis
      .map((a) => {
        const note = Math.max(0, Math.min(5, a.note || 5));
        return `
        <figure class="review reveal">
          <div class="stars" role="img" aria-label="Note : ${note} sur 5">${star.repeat(note)}</div>
          <blockquote><p>${esc(a.texte)}</p></blockquote>
          <figcaption><strong>${esc(a.nom)}</strong>${esc(a.contexte || "")}</figcaption>
        </figure>`;
      })
      .join("");
  }

  /* ---------- 5. Menu ---------- */
  function initMenu() {
    const header = $("#header");
    const burger = $("#burger");
    const nav = $("#nav");

    const close = () => {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Ouvrir le menu");
    };
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());

    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if ("IntersectionObserver" in window) {
      const navLinks = $$(".nav__list a");
      const spy = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id));
        }),
        { rootMargin: "-45% 0px -50% 0px" }
      );
      $$("main section[id]").forEach((s) => spy.observe(s));
    }
  }

  /* ---------- 6. Apparition douce ---------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }),
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => {
      const parent = el.parentElement;
      if (parent && parent.children.length > 2 && !el.closest(".hero")) {
        const i = Array.prototype.indexOf.call(parent.children, el);
        el.style.transitionDelay = Math.min(i * 0.09, 0.45) + "s";
      }
      io.observe(el);
    });
  }

  /* ---------- 7. Curseur doré (ordinateur) ---------- */
  function initCursor() {
    const cursor = $(".cursor");
    if (!cursor || reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let x = 0, y = 0, cx = 0, cy = 0, raf = null;
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : null;
    };
    document.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      cursor.classList.add("is-on");
      if (!raf) raf = requestAnimationFrame(loop);
    });
    document.addEventListener("mouseover", (e) => {
      cursor.classList.toggle("is-hover", !!e.target.closest("a, button, label, input, textarea, .dial__svg"));
    });
    document.documentElement.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
  }

  /* ---------- 8. Réservation en 4 étapes ---------- */
  function initBooking() {
    const form = $("#booking-form");
    if (!form) return;

    const R = CONFIG.reservation;
    const steps = $$(".step", form);
    const labels = $$(".trip__steps li");
    const car = $("#trip-car");
    const road = $(".trip__road");
    const status = $("#form-status");
    const startBtn = $("#start-btn");
    let current = 1;

    form.action = "https://formsubmit.co/" + CONFIG.email;
    form.elements._subject.value = R.objetEmail;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const state = {
      date: null,
      minutes: (() => { const [h, m] = R.heureParDefaut.split(":").map(Number); return h * 60 + m; })(),
      viewY: today.getFullYear(),
      viewM: today.getMonth(),
      counters: { passagers: 1, bagages: 0 },
    };

    /* --- Erreurs --- */
    const setFieldError = (input, msg) => {
      const field = input.closest(".field");
      const err = $("#" + input.id + "-err");
      if (field) field.classList.toggle("has-error", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) {
        err.textContent = msg;
        msg ? input.setAttribute("aria-describedby", err.id) : input.removeAttribute("aria-describedby");
      }
      return !msg;
    };
    const setMsg = (id, msg) => { $("#" + id).textContent = msg; return !msg; };

    /* --- Position de la voiture sur la route --- */
    const placeCar = (step, finish) => {
      const w = road.clientWidth;
      const usable = w - 10 - 46;
      let x = finish ? w - 52 - 40 : 10 + (usable * (step - 1)) / 3 - 26;
      x = Math.max(0, Math.min(x, w - 52 - 40));
      car.style.transform = `translateX(${x}px)`;
      if (!reduceMotion) {
        car.classList.remove("is-driving");
        void car.offsetWidth;
        car.classList.add("is-driving");
      }
    };
    window.addEventListener("resize", () => placeCar(current));

    /* --- Navigation entre étapes --- */
    const showStep = (n, focus = true) => {
      current = n;
      steps.forEach((s) => {
        const active = Number(s.dataset.step) === n;
        s.hidden = !active;
        s.classList.toggle("is-entering", active && !reduceMotion);
      });
      labels.forEach((li) => {
        const k = Number(li.dataset.stepLabel);
        li.classList.toggle("is-done", k < n);
        k === n ? li.setAttribute("aria-current", "step") : li.removeAttribute("aria-current");
      });
      placeCar(n);
      if (n === 4) buildRecap();
      if (focus) {
        const title = $(".step__title", steps[n - 1]);
        title.focus({ preventScroll: true });
        const top = $(".booking").getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 70) - 10;
        if (window.scrollY > top) window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      }
    };

    /* --- Validation de chaque étape --- */
    const validators = {
      1: () => {
        const checked = form.querySelector('input[name="Type de course"]:checked');
        return setMsg("type-err", checked ? "" : "Choisissez un type de course pour continuer.");
      },
      2: () => {
        const dep = $("#f-depart"), dest = $("#f-destination");
        const a = setFieldError(dep, dep.value.trim().length >= 3 ? "" : "Indiquez l'adresse de départ.");
        const b = setFieldError(dest, dest.value.trim().length >= 3 ? "" : "Indiquez la destination.");
        if (!a) dep.focus(); else if (!b) dest.focus();
        return a && b;
      },
      3: () => {
        const okDate = setMsg("date-err", state.date ? "" : "Choisissez une date dans le calendrier.");
        let timeMsg = "";
        if (state.date && state.date.getTime() === today.getTime()) {
          const now = new Date();
          if (state.minutes <= now.getHours() * 60 + now.getMinutes()) timeMsg = "Cette heure est déjà passée, choisissez une heure plus tardive.";
        }
        const okTime = setMsg("heure-err", timeMsg);
        return okDate && okTime;
      },
      4: () => {
        const nom = $("#f-nom"), tel = $("#f-tel"), mail = $("#f-email");
        const digits = tel.value.replace(/[^\d+]/g, "");
        const a = setFieldError(nom, nom.value.trim().length >= 2 ? "" : "Indiquez votre nom.");
        const b = setFieldError(tel, /^\+?\d{10,15}$/.test(digits) ? "" : "Numéro invalide (ex. 06 00 00 00 00).");
        const c = setFieldError(mail, !mail.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim()) ? "" : "Adresse email invalide.");
        if (!a) nom.focus(); else if (!b) tel.focus(); else if (!c) mail.focus();
        return a && b && c;
      },
    };

    $$("[data-next]", form).forEach((btn) =>
      btn.addEventListener("click", () => { if (validators[current]()) showStep(current + 1); })
    );
    $$("[data-prev]", form).forEach((btn) => btn.addEventListener("click", () => showStep(current - 1)));

    // Correction à la volée
    $$("#f-depart, #f-destination, #f-nom, #f-tel, #f-email", form).forEach((input) =>
      input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true") setFieldError(input, ""); })
    );

    /* --- Étape 1 : type de course --- */
    const placeholders = {
      "Course en ville": "Ex. : Vieux Lyon",
      "Transfert aéroport": "Ex. : Aéroport Lyon Saint-Exupéry",
      "Transfert gare": "Ex. : Gare Part-Dieu",
      "Mise à disposition": "Ex. : rendez-vous successifs dans Lyon",
      "Longue distance": "Ex. : Genève, Annecy, Paris…",
    };
    $$('input[name="Type de course"]', form).forEach((radio) =>
      radio.addEventListener("change", () => {
        setMsg("type-err", "");
        $("#f-destination").placeholder = placeholders[radio.value] || "";
      })
    );

    /* --- Étape 2 : passagers / bagages --- */
    const limits = { passagers: [1, R.maxPassagers], bagages: [0, R.maxBagages] };
    const updateCounter = (name) => {
      const v = state.counters[name];
      $("#out-" + name).textContent = v;
      $("#f-" + name).value = v;
      $$(`[data-counter="${name}"]`, form).forEach((b) => {
        const d = Number(b.dataset.delta);
        b.disabled = (d < 0 && v <= limits[name][0]) || (d > 0 && v >= limits[name][1]);
      });
    };
    $$("[data-counter]", form).forEach((btn) =>
      btn.addEventListener("click", () => {
        const name = btn.dataset.counter;
        const [min, max] = limits[name];
        state.counters[name] = Math.max(min, Math.min(max, state.counters[name] + Number(btn.dataset.delta)));
        updateCounter(name);
      })
    );
    updateCounter("passagers");
    updateCounter("bagages");

    /* --- Étape 3 : calendrier --- */
    const grid = $("#cal-grid");
    const monthLabel = $("#cal-month");
    const [prevBtn, nextBtn] = $$(".cal__nav", form);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + R.moisReservables, 1);
    const longDate = (d) => {
      const s = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const renderCalendar = () => {
      const { viewY: y, viewM: m } = state;
      monthLabel.textContent = new Date(y, m, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      const offset = (new Date(y, m, 1).getDay() + 6) % 7;
      const days = new Date(y, m + 1, 0).getDate();
      let html = '<span class="cal__blank"></span>'.repeat(offset);
      for (let d = 1; d <= days; d++) {
        const date = new Date(y, m, d);
        const past = date < today;
        const sel = state.date && state.date.getTime() === date.getTime();
        const isToday = date.getTime() === today.getTime();
        html += `<button type="button" class="cal__day${isToday ? " is-today" : ""}" data-day="${d}"
          aria-pressed="${sel}" aria-label="${longDate(date)}${isToday ? " (aujourd'hui)" : ""}"${past ? " disabled" : ""}>${d}</button>`;
      }
      grid.innerHTML = html;
      prevBtn.disabled = y === today.getFullYear() && m === today.getMonth();
      nextBtn.disabled = new Date(y, m + 1, 1) >= maxDate;
    };

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".cal__day");
      if (!btn || btn.disabled) return;
      state.date = new Date(state.viewY, state.viewM, Number(btn.dataset.day));
      $("#f-date").value = longDate(state.date);
      setMsg("date-err", "");
      setMsg("heure-err", "");
      renderCalendar();
      const again = grid.querySelector(`[data-day="${btn.dataset.day}"]`);
      if (again) again.focus();
    });
    [prevBtn, nextBtn].forEach((b) =>
      b.addEventListener("click", () => {
        const d = new Date(state.viewY, state.viewM + Number(b.dataset.cal), 1);
        state.viewY = d.getFullYear();
        state.viewM = d.getMonth();
        renderCalendar();
      })
    );
    renderCalendar();

    /* --- Étape 3 : cadran d'heure façon compteur --- */
    const needle = $("#dial-needle");
    const valueArc = $("#dial-value");
    const readout = $("#dial-time");
    const live = $("#time-live");
    const svg = $("#dial-svg");

    (function drawDial() {
      let out = '<g class="dial__ticks">';
      for (let h = 0; h <= 24; h++) {
        const deg = -120 + h * 10;
        const major = h % 3 === 0;
        const [x1, y1] = polar(110, 110, major ? 70 : 74, deg);
        const [x2, y2] = polar(110, 110, 80, deg);
        out += `<line${major ? ' class="major"' : ""} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
        if (major) {
          const [tx, ty] = polar(110, 110, 58, deg);
          out += `<text x="${tx}" y="${ty}">${h}</text>`;
        }
      }
      $("#dial-ticks").innerHTML = out + "</g>";
    })();

    const setTime = (total, announce) => {
      const step = R.pasMinutes;
      total = ((Math.round(total / step) * step) % 1440 + 1440) % 1440;
      state.minutes = total;
      const h = Math.floor(total / 60), m = total % 60;
      const ratio = total / 1440;
      needle.style.transform = `rotate(${(-120 + 240 * ratio).toFixed(2)}deg)`;
      valueArc.style.strokeDashoffset = (100 - ratio * 100).toFixed(2);
      readout.textContent = `${pad(h)}:${pad(m)}`;
      $("#f-heure").value = `${pad(h)}h${pad(m)}`;
      if (announce) live.textContent = `Heure choisie : ${h} heures ${m ? m : ""}`;
      setMsg("heure-err", "");
    };
    setTime(state.minutes);

    $$("[data-time]", form).forEach((btn) =>
      btn.addEventListener("click", () => {
        const unit = btn.dataset.time === "h" ? 60 : R.pasMinutes;
        setTime(state.minutes + unit * Number(btn.dataset.delta), true);
      })
    );

    // Toucher / glisser sur le cadran
    const fromPointer = (e) => {
      const r = svg.getBoundingClientRect();
      const x = ((e.clientX - r.left) * 220) / r.width - 110;
      const y = ((e.clientY - r.top) * 178) / r.height - 110;
      let deg = (Math.atan2(x, -y) * 180) / Math.PI;
      deg = Math.max(-120, Math.min(120, deg));
      setTime(((deg + 120) / 240) * 1439);
    };
    svg.addEventListener("pointerdown", (e) => {
      svg.setPointerCapture(e.pointerId);
      fromPointer(e);
      const move = (ev) => fromPointer(ev);
      const up = () => {
        svg.removeEventListener("pointermove", move);
        svg.removeEventListener("pointerup", up);
        svg.removeEventListener("pointercancel", up);
        live.textContent = `Heure choisie : ${readout.textContent}`;
      };
      svg.addEventListener("pointermove", move);
      svg.addEventListener("pointerup", up);
      svg.addEventListener("pointercancel", up);
    });

    /* --- Étape 4 : récapitulatif --- */
    function buildRecap() {
      const type = form.querySelector('input[name="Type de course"]:checked');
      const rows = [
        ["Course", type ? type.value : "—"],
        ["Départ", $("#f-depart").value.trim()],
        ["Arrivée", $("#f-destination").value.trim()],
        ["Quand", state.date ? `${longDate(state.date)} à ${readout.textContent.replace(":", "h")}` : "—"],
        ["À bord", `${state.counters.passagers} passager${state.counters.passagers > 1 ? "s" : ""}, ${state.counters.bagages} bagage${state.counters.bagages > 1 ? "s" : ""}`],
      ];
      $("#recap").innerHTML = "<dl>" + rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("") + "</dl>";
    }

    /* --- Envoi (bouton START) --- */
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (startBtn.disabled) return;

      for (let n = 1; n <= 4; n++) {
        if (!validators[n]()) {
          if (n !== current) showStep(n);
          status.textContent = "Il manque une information : vérifiez le champ indiqué.";
          status.classList.add("is-error");
          return;
        }
      }

      if (location.protocol === "file:") {
        status.textContent = "L'envoi fonctionne uniquement quand le site est en ligne (ou ouvert via un petit serveur local). Voir les explications fournies.";
        status.classList.add("is-error");
        return;
      }

      status.classList.remove("is-error");
      status.textContent = "Démarrage… envoi de votre réservation";
      form.elements._next.value = location.origin + location.pathname + "?reservation=confirmee";
      startBtn.disabled = true;
      startBtn.classList.add("is-starting");
      labels.forEach((li) => li.classList.add("is-done"));
      placeCar(4, true);

      setTimeout(() => HTMLFormElement.prototype.submit.call(form), reduceMotion ? 50 : 1000);
    });

    // Si l'on revient en arrière depuis FormSubmit, on réactive le bouton
    window.addEventListener("pageshow", () => {
      startBtn.disabled = false;
      startBtn.classList.remove("is-starting");
    });

    showStep(1, false);
  }

  /* ---------- 9. Fenêtres : mentions légales & confirmation ---------- */
  function openDialog(d) {
    if (!d) return;
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
  }
  function closeDialog(d) {
    if (typeof d.close === "function") d.close();
    else d.removeAttribute("open");
  }
  function initDialogs() {
    const legalBtn = $("#open-legal");
    if (legalBtn) legalBtn.addEventListener("click", () => openDialog($("#legal")));
    $$("dialog").forEach((d) => {
      $$("[data-close]", d).forEach((b) => b.addEventListener("click", () => closeDialog(d)));
      d.addEventListener("click", (e) => { if (e.target === d) closeDialog(d); });
    });

    // Retour de FormSubmit : afficher la confirmation élégante
    const params = new URLSearchParams(location.search);
    if (params.get("reservation") === "confirmee") {
      history.replaceState(null, "", location.pathname);
      openDialog($("#confirmation"));
    }
  }

  /* ---------- Démarrage ---------- */
  applyConfig();
  renderStats();
  renderPrices();
  renderReviews();
  initMenu();
  initReveal();
  initCursor();
  initBooking();
  initDialogs();
})();
