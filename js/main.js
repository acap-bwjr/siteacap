document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Nav: scroll state + mobile menu ---------- */
const nav = document.getElementById("siteNav");
const burger = document.getElementById("navBurger");
const navLinks = document.getElementById("navLinks");

const onScroll = () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

burger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  burger.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
});
navLinks.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  });
});

/* ---------- Cursor glow + hero "wolf eyes" following pointer ---------- */
const glow = document.getElementById("cursorGlow");
const eyes = document.getElementById("heroEyes");
const hero = document.querySelector(".hero");
const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (supportsHover) {
  window.addEventListener("mousemove", (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    glow.classList.add("active");
  });

  if (hero && eyes) {
    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      eyes.style.left = `${e.clientX - rect.left}px`;
      eyes.style.top = `${e.clientY - rect.top}px`;
      eyes.classList.add("active");
    });
    hero.addEventListener("mouseleave", () => eyes.classList.remove("active"));
  }
}

/* ---------- Scroll reveal ---------- */
const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
revealItems.forEach(el => revealObserver.observe(el));

/* ---------- Count-up stats ---------- */
const countEls = document.querySelectorAll(".stat__num");
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const duration = 1200;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
countEls.forEach(el => countObserver.observe(el));

/* ---------- Timeline line-fill on scroll ---------- */
const timeline = document.getElementById("timeline");
if (timeline) {
  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          timeline.classList.add("is-filled");
          timelineObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  timelineObserver.observe(timeline);
}

/* ---------- FAQ accordion ---------- */
document.querySelectorAll(".faq__item").forEach(item => {
  const q = item.querySelector(".faq__q");
  const a = item.querySelector(".faq__a");
  q.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq__item.open").forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove("open");
        openItem.querySelector(".faq__q").setAttribute("aria-expanded", "false");
        openItem.querySelector(".faq__a").style.maxHeight = null;
      }
    });

    item.classList.toggle("open", !isOpen);
    q.setAttribute("aria-expanded", String(!isOpen));
    a.style.maxHeight = isOpen ? null : `${a.scrollHeight}px`;
  });
});

/* ---------- Jogos: filtro por time + tabs próximos/resultados ---------- */
const teamFilters = document.querySelectorAll("[data-team-filter]");
const statusTabs = document.querySelectorAll("[data-status-filter]");
const statusPanels = document.querySelectorAll("[data-status-panel]");

teamFilters.forEach(btn => {
  btn.addEventListener("click", () => {
    teamFilters.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const team = btn.dataset.teamFilter;
    document.querySelectorAll(".jogo-card").forEach(card => {
      card.style.display = (team === "todos" || card.dataset.team === team) ? "" : "none";
    });
  });
});

statusTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    statusTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    statusPanels.forEach(panel => {
      panel.hidden = panel.dataset.statusPanel !== tab.dataset.statusFilter;
    });
  });
});

/* pseudo-3D tilt + fabric sheen on uniform cards */
if (supportsHover) {
  document.querySelectorAll(".uniform-card").forEach(card => {
    const visual = card.querySelector(".uniform-card__visual");
    const photo = card.querySelector(".uniform-card__photo");

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `perspective(900px) rotateX(${y * -10}deg) rotateY(${x * 10}deg) translateY(-6px) translateZ(10px)`;
      card.style.boxShadow = `${x * -26}px ${18 - y * 18}px 44px -18px rgba(0,0,0,.65)`;

      if (visual) {
        visual.style.setProperty("--px", `${(x + 0.5) * 100}%`);
        visual.style.setProperty("--py", `${(y + 0.5) * 100}%`);
        visual.classList.add("is-active");
      }
      if (photo) {
        photo.style.transform = `translate(${x * -10}px, ${y * -10}px) scale(1.04)`;
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.boxShadow = "";
      if (visual) visual.classList.remove("is-active");
      if (photo) photo.style.transform = "";
    });
  });
}

/* subtle tilt on category cards */
if (supportsHover) {
  document.querySelectorAll(".cat-card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(500px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-2px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}
