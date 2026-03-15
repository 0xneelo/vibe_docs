const navToggle = document.querySelector("[data-nav-toggle]");
const navPanel = document.querySelector("[data-nav-panel]");
const navFilter = document.querySelector("[data-nav-filter]");

if (navToggle && navPanel) {
  navToggle.addEventListener("click", () => {
    navPanel.classList.toggle("is-open");
  });

  document.addEventListener("click", (event) => {
    if (
      navPanel.classList.contains("is-open") &&
      !navPanel.contains(event.target) &&
      !navToggle.contains(event.target)
    ) {
      navPanel.classList.remove("is-open");
    }
  });
}

if (navFilter) {
  navFilter.addEventListener("input", () => {
    const query = navFilter.value.trim().toLowerCase();
    const collections = document.querySelectorAll(".nav-collection");

    collections.forEach((collection) => {
      const links = [...collection.querySelectorAll(".nav-link")];
      let visibleCount = 0;

      links.forEach((link) => {
        const text = link.textContent.toLowerCase();
        const visible = !query || text.includes(query);
        link.parentElement.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      collection.hidden = visibleCount === 0;
    });
  });
}

const tocLinks = [...document.querySelectorAll(".page-toc-link")];
const observedHeadings = tocLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (tocLinks.length && observedHeadings.length && "IntersectionObserver" in window) {
  const linkById = new Map(
    tocLinks.map((link) => [link.getAttribute("href").slice(1), link]),
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        tocLinks.forEach((link) => link.classList.remove("is-current"));
        const activeLink = linkById.get(entry.target.id);
        if (activeLink) {
          activeLink.classList.add("is-current");
        }
      });
    },
    {
      rootMargin: "-20% 0px -70% 0px",
      threshold: [0, 1],
    },
  );

  observedHeadings.forEach((heading) => observer.observe(heading));
}
