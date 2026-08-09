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

  hero?.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    eyes.style.left = `${e.clientX - rect.left}px`;
    eyes.style.top = `${e.clientY - rect.top}px`;
    eyes.classList.add("active");
  });
  hero?.addEventListener("mouseleave", () => eyes.classList.remove("active"));
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
