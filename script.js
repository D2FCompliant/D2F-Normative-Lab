const navToggle = document.querySelector(".nav-toggle");
const menu = document.querySelector(".menu");
const copyEmailButton = document.querySelector("#copy-email");
const postsContainer = document.querySelector("#linkedin-posts");
const filtersContainer = document.querySelector("#post-filters");

if (navToggle && menu) {
  navToggle.addEventListener("click", () => {
    const expanded = menu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(expanded));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (copyEmailButton) {
  copyEmailButton.addEventListener("click", async () => {
    const htmlLang = document.documentElement.lang || "en";
    const email = "contact@d2fcompliant.com";

    try {
      await navigator.clipboard.writeText(email);
      copyEmailButton.textContent =
        htmlLang === "fr" ? "Email copié" : "Email copied";
    } catch (error) {
      copyEmailButton.textContent = email;
    }
  });
}

const formatDate = (dateString, lang) => {
  const locale = lang === "fr" ? "fr-FR" : "en-GB";

  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const createPostCard = (post, lang) => {
  const expertLabel = lang === "fr" ? "Intervention experte" : "Expert intervention";
  const openLabel = lang === "fr" ? "Voir le post LinkedIn" : "Open LinkedIn post";

  const tagsMarkup = post.tags
    .map((tag) => `<span class="chip">${tag}</span>`)
    .join("");

  return `
    <article class="post-card glass-card" data-category="${post.category}">
      <div class="post-meta">
        <span class="mini-tag">${post.category}</span>
        <time datetime="${post.date}">${formatDate(post.date, lang)}</time>
      </div>

      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>

      <div class="post-tags">
        ${tagsMarkup}
      </div>

      <div class="expert-block">
        <p class="expert-label">${expertLabel}</p>
        <strong>${post.expert_name}</strong>
        <p class="expert-role">${post.expert_role}</p>
        <p>${post.expert_comment}</p>
      </div>

      <div class="hero-actions">
        <a class="btn btn-secondary" href="${post.linkedin_url}" target="_blank" rel="noopener noreferrer">
          ${openLabel}
        </a>
      </div>
    </article>
  `;
};

const renderPosts = (posts, filterValue, lang) => {
  const filteredPosts =
    filterValue === "all"
      ? posts
      : posts.filter((post) => post.category === filterValue);

  if (filteredPosts.length === 0) {
    postsContainer.innerHTML = `
      <article class="post-card glass-card">
        <p>${lang === "fr" ? "Aucun post dans cette catégorie." : "No posts in this category."}</p>
      </article>
    `;
    return;
  }

  postsContainer.innerHTML = filteredPosts
    .map((post) => createPostCard(post, lang))
    .join("");
};

const initLinkedInPosts = async () => {
  if (!postsContainer) {
    return;
  }

  const lang = document.documentElement.lang || "en";

  try {
    const response = await fetch(
      `${lang === "fr" ? "../" : ""}data/linkedin-posts.json`
    );
    const allPosts = await response.json();

    const localizedPosts = allPosts.filter((post) => post.lang === lang);

    renderPosts(localizedPosts, "all", lang);

    if (filtersContainer) {
      filtersContainer.querySelectorAll("[data-filter]").forEach((button) => {
        button.addEventListener("click", () => {
          filtersContainer
            .querySelectorAll("[data-filter]")
            .forEach((item) => item.classList.remove("is-active"));

          button.classList.add("is-active");
          renderPosts(localizedPosts, button.dataset.filter, lang);
        });
      });
    }
  } catch (error) {
    postsContainer.innerHTML = `
      <article class="post-card glass-card">
        <p>${lang === "fr"
          ? "Impossible de charger les publications pour le moment."
          : "Unable to load posts at the moment."}</p>
      </article>
    `;
  }
};

initLinkedInPosts();