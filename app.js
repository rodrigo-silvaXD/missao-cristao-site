const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function updateThemeColor(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.setAttribute("content", theme === "light" ? "#f6f7fb" : "#090c11");
}

function setTheme(theme) {
  const html = document.documentElement;
  if (theme === "light") html.setAttribute("data-theme", "light");
  else html.removeAttribute("data-theme");
  updateThemeColor(theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
  return prefersLight ? "light" : "dark";
}

let isAutoScrolling = false;
let scrollTimeout = null;

function scrollToTarget(selector) {
  const el = $(selector);
  if (!el) return;
  
  isAutoScrolling = true;
  window.clearTimeout(scrollTimeout);
  
  // Atualiza visualmente o botão imediatamente para evitar delay
  $$("[data-nav][data-jump]").forEach((b) => b.removeAttribute("aria-current"));
  const navBtn = $(`[data-nav][data-jump="${selector}"]`);
  if (navBtn) navBtn.setAttribute("aria-current", "true");

  el.scrollIntoView({ behavior: "smooth", block: "start" });
  
  // Libera o scroll spy após a animação (aprox. 800ms)
  scrollTimeout = window.setTimeout(() => {
    isAutoScrolling = false;
  }, 800);
}

function initJumpButtons() {
  $$("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Se for um botão de navegação, podemos prevenir comportamento padrão
      e.preventDefault();
      const target = btn.getAttribute("data-jump");
      if (!target) return;
      scrollToTarget(target);
    });
  });
}

function initAccordion() {
  $$("[data-accordion]").forEach((acc) => {
    const isSingle = acc.getAttribute("data-single") === "true";
    const items = $$(".acc-item", acc);
    let n = 0;

    items.forEach((item) => {
      const trigger = $(".acc-trigger", item);
      const panel = $(".acc-panel", item);
      if (!trigger) return;

      n += 1;
      if (panel) {
        if (!trigger.id) trigger.id = `acc-trigger-${n}`;
        if (!panel.id) panel.id = `acc-panel-${n}`;
        trigger.setAttribute("aria-controls", panel.id);
        panel.setAttribute("aria-labelledby", trigger.id);
      }

      const syncA11y = (open) => {
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
        if (panel) panel.setAttribute("aria-hidden", open ? "false" : "true");
      };

      syncA11y(item.classList.contains("is-open"));

      trigger.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");

        if (isSingle) {
          items.forEach((other) => {
            if (other === item) return;
            other.classList.remove("is-open");
            const t = $(".acc-trigger", other);
            if (t) t.setAttribute("aria-expanded", "false");
            const p = $(".acc-panel", other);
            if (p) p.setAttribute("aria-hidden", "true");
          });
        }

        item.classList.toggle("is-open", willOpen);
        syncA11y(willOpen);
      });
    });
  });
}

function initReflectCards() {
  $$("[data-reflect]").forEach((btn) => {
    btn.setAttribute("aria-pressed", btn.classList.contains("is-open") ? "true" : "false");
    btn.addEventListener("click", () => {
      const open = !btn.classList.contains("is-open");
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-pressed", open ? "true" : "false");
    });
  });
}

let toastTimer = null;
function showToast(message) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.classList.remove("is-visible");
  }, 1600);
}

function initToasts() {
  $$("[data-toast]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const msg = btn.getAttribute("data-toast");
      if (msg) showToast(msg);
    });
  });
}

function initVerseModal() {
  const modal = $("#verseModal");
  if (!modal) return;

  const titleEl = $("#verseModalTitle");
  const explainEl = $("#verseModalExplain");
  const applyEl = $("#verseModalApply");
  const impactEl = $("#verseModalImpact");
  const closeBtn = $(".modal__close", modal);
  const closeTargets = $$("[data-modal-close]", modal);

  const content = {
    mt28: {
      title: "Mateus 28:19-20 — O Mandato",
      explain:
        "Quando Jesus fala “fazei discípulos”, Ele não está falando apenas de conversões rápidas, mas de transformação de vida. Discipular é caminhar com alguém, ensinar na prática e ajudar a viver aquilo que foi aprendido. A missão não termina quando alguém ouve o evangelho — ela começa ali.",
      apply:
        "Olhe ao seu redor: existe alguém que você pode acompanhar mais de perto? Discipular pode começar com uma conversa, uma oração e constância.",
      impact: "Evangelizar alcança. Discipular transforma.",
    },
    mc16: {
      title: "Marcos 16:15 — O Alcance",
      explain:
        "O “ide por todo o mundo” não significa apenas viajar para outros países. Significa viver com consciência de envio onde você já está. Seu ambiente — escola, trabalho, família — já é um campo missionário. Missão não começa longe, começa perto.",
      apply:
        "Pare de esperar o momento perfeito. Comece sendo intencional com quem já faz parte da sua rotina.",
      impact: "O seu mundo já é o seu campo missionário.",
    },
    at18: {
      title: "Atos 1:8 — O Poder",
      explain:
        "Jesus não mandou os discípulos irem antes de receberem poder. Isso mostra que a missão não depende da nossa capacidade, mas da ação do Espírito Santo. Sem Ele, vira esforço. Com Ele, até o simples se torna poderoso.",
      apply:
        "Antes de falar de Jesus para alguém, fale com Deus sobre essa pessoa. Missão começa na dependência, não na pressa.",
      impact: "Não é sobre capacidade, é sobre dependência.",
    },
    mt513: {
      title: "Mateus 5:13-16 — O Testemunho",
      explain:
        "Ser sal e luz significa viver de forma visível e diferente. O evangelho não é apenas falado, ele é percebido. As pessoas enxergam Jesus primeiro nas atitudes antes de ouvirem palavras. Uma vida coerente abre portas que discursos nunca abririam.",
      apply:
        "No seu dia a dia, pequenas atitudes revelam muito: como você fala, reage, trata as pessoas e se posiciona.",
      impact: "Quem você é fala antes do que você diz.",
    },
  };

  let isOpen = false;
  let lastFocus = null;
  const prevBodyOverflow = document.body.style.overflow;

  const open = (key) => {
    const data = content[key];
    if (!data) return;
    if (titleEl) titleEl.textContent = data.title;
    if (explainEl) explainEl.textContent = data.explain;
    if (applyEl) applyEl.textContent = data.apply;
    if (impactEl) impactEl.textContent = data.impact;

    lastFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    isOpen = true;
    closeBtn?.focus?.({ preventScroll: true });
  };

  const close = () => {
    if (!isOpen) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = prevBodyOverflow;
    isOpen = false;
    lastFocus?.focus?.({ preventScroll: true });
  };

  $$("[data-verse]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-verse");
      if (key) open(key);
    });
  });

  closeTargets.forEach((el) => el.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key !== "Escape") return;
    e.preventDefault();
    close();
  });
}

function initThemeToggle() {
  const btn = $("#toggleTheme");
  if (!btn) return;

  const theme = getInitialTheme();
  setTheme(theme);

  btn.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    setTheme(isLight ? "dark" : "light");
    showToast(isLight ? "Modo escuro" : "Modo claro");
  });
}

function initReveal() {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const targets = [
    ...$$(".hero__title, .hero__subtitle, .hero__actions, .hero__quick > *"),
    ...$$(".section__header"),
    ...$$(".section .card"),
    ...$$(".section .grid > *"),
  ].filter((el) => el && el.classList && !el.classList.contains("reveal"));

  if (targets.length === 0) return;

  targets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(260, i * 30)}ms`;
    if (reduceMotion) el.classList.add("is-visible");
  });

  if (reduceMotion) return;
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { root: null, threshold: 0.14, rootMargin: "0px 0px -12% 0px" }
  );

  targets.forEach((el) => io.observe(el));
}

function initScrollProgress() {
  const bar = $("#scrollProgressBar");
  if (!bar) return;

  const update = () => {
    // Usar scrollY ou documentElement.scrollTop para maior compatibilidade
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // Pegar o tamanho real da página
    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    
    // Altura visível
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;

    const max = Math.max(1, scrollHeight - clientHeight);
    const p = Math.min(1, Math.max(0, scrollTop / max));
    bar.style.width = `${(p * 100).toFixed(2)}%`;
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function initScrollSpy() {
  const navButtons = $$("[data-nav][data-jump]");
  if (navButtons.length === 0) return;

  // Pegar todas as seções linkadas nos botões, incluindo o #inicio (header)
  const sections = navButtons
    .map((b) => $(b.getAttribute("data-jump")))
    .filter(Boolean);

  if (sections.length === 0) return;

  const setActive = (id) => {
    navButtons.forEach((b) => b.removeAttribute("aria-current"));
    const btn = $(`[data-nav][data-jump="#${id}"]`);
    if (btn) btn.setAttribute("aria-current", "true");
  };

  const visibleSections = new Map();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Calcula a porcentagem da TELA que o elemento ocupa, não a porcentagem do elemento.
          // Isso resolve o bug de seções grandes perderem para seções pequenas.
          const viewportHeight = entry.rootBounds ? entry.rootBounds.height : window.innerHeight;
          const visibleHeight = entry.intersectionRect.height;
          const screenCoverage = visibleHeight / viewportHeight;
          
          visibleSections.set(entry.target.id, screenCoverage);
        } else {
          visibleSections.delete(entry.target.id);
        }
      });

      // Se estivermos rolando via clique, não atualiza o menu pelo observer
      if (isAutoScrolling) return;

      if (visibleSections.size === 0) return;

      // Encontra a seção que mais ocupa a tela
      let maxCoverage = -1;
      let activeId = null;
      for (const [id, coverage] of visibleSections.entries()) {
        if (coverage > maxCoverage) {
          maxCoverage = coverage;
          activeId = id;
        }
      }

      if (activeId) {
        setActive(activeId);
      }
    },
    {
      root: null,
      // Cria vários limiares para termos uma leitura precisa
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      rootMargin: "-10% 0px -10% 0px",
    }
  );

  sections.forEach((s) => io.observe(s));
  
  // Setar estado inicial
  setActive("inicio");
}

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initReveal();
  initJumpButtons();
  initAccordion();
  initReflectCards();
  initToasts();
  initVerseModal();
  initScrollProgress();
  initScrollSpy();
});
