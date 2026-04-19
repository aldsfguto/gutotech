const header = document.querySelector(".site-header");
const nav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const revealItems = document.querySelectorAll(".reveal");
const mobileQuickNavLinks = document.querySelectorAll(".mobile-quick-nav__link");
const reviewForm = document.querySelector("#review-form");
const testimonialList = document.querySelector("#testimonial-list");
const reviewRatingInput = document.querySelector("#review-rating");
const reviewStars = document.querySelectorAll(".review-star");
const reviewFeedback = document.querySelector("#review-feedback");
const reviewsStorageKey = "guto-tech-site-reviews";

const updateHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

const closeMenu = () => {
  if (!nav || !navToggle) return;

  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("is-menu-open");
};

const toggleMenu = () => {
  if (!nav || !navToggle) return;

  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("is-menu-open", isOpen);
};

if (navToggle) {
  navToggle.addEventListener("click", toggleMenu);
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("click", (event) => {
  if (!nav || !navToggle) return;

  const target = event.target;
  if (!(target instanceof Node)) return;

  if (!nav.contains(target) && !navToggle.contains(target)) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -40px 0px"
  }
);

revealItems.forEach((item) => {
  revealObserver.observe(item);
});

const setActiveMobileQuickNav = (sectionId) => {
  let activeLink = null;

  mobileQuickNavLinks.forEach((link) => {
    const isActive = link.dataset.mobileNav === sectionId;
    link.classList.toggle("is-active", isActive);
    if (isActive) activeLink = link;
  });

  if (activeLink) {
    activeLink.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  }
};

const quickNavSections = [...mobileQuickNavLinks]
  .map((link) => document.getElementById(link.dataset.mobileNav || ""))
  .filter(Boolean);

let activeQuickNavSectionId = "inicio";

if (quickNavSections.length > 0) {
  const quickNavObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

      if (visibleEntries.length === 0) return;

      const nextSectionId = visibleEntries[0].target.id;
      if (!nextSectionId || nextSectionId === activeQuickNavSectionId) return;

      activeQuickNavSectionId = nextSectionId;
      setActiveMobileQuickNav(nextSectionId);
    },
    {
      threshold: [0.2, 0.35, 0.55],
      rootMargin: "-20% 0px -55% 0px"
    }
  );

  quickNavSections.forEach((section) => {
    quickNavObserver.observe(section);
  });
}

setActiveMobileQuickNav(activeQuickNavSectionId);

const normalizeText = (value) => value.replace(/\s+/g, " ").trim();

const getStoredReviews = () => {
  try {
    const saved = window.localStorage.getItem(reviewsStorageKey);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveStoredReviews = (reviews) => {
  try {
    window.localStorage.setItem(
      reviewsStorageKey,
      JSON.stringify(reviews.slice(0, 8))
    );
  } catch {
    // Keep the page usable even if storage is blocked.
  }
};

const getInitials = (name) =>
  normalizeText(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const getRatingStars = (rating) =>
  `${"★".repeat(rating)}${"☆".repeat(Math.max(0, 5 - rating))}`;

const setReviewFeedback = (message, isError = false) => {
  if (!reviewFeedback) return;

  reviewFeedback.textContent = message;
  reviewFeedback.classList.toggle("is-error", isError);
};

const setActiveRating = (value) => {
  if (!reviewRatingInput) return;

  reviewRatingInput.value = String(value);

  reviewStars.forEach((star) => {
    const starValue = Number(star.dataset.value);
    star.classList.toggle("is-active", starValue <= value);
  });
};

const buildReviewCard = (review) => {
  const article = document.createElement("article");
  article.className = "testimonial-card testimonial-card--user is-visible";

  const top = document.createElement("div");
  top.className = "testimonial-card__top";

  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.textContent = getInitials(review.name) || "GT";

  const content = document.createElement("div");

  const title = document.createElement("h3");
  title.textContent = review.name;

  const service = document.createElement("span");
  service.textContent = review.service;

  content.append(title, service);
  top.append(avatar, content);

  const rating = document.createElement("div");
  rating.className = "testimonial-rating";
  rating.setAttribute("aria-label", `${review.rating} de 5 estrelas`);
  rating.textContent = getRatingStars(review.rating);

  const comment = document.createElement("p");
  comment.textContent = `“${review.comment}”`;

  article.append(top, rating, comment);

  return article;
};

const renderStoredReviews = () => {
  if (!testimonialList) return;

  testimonialList
    .querySelectorAll(".testimonial-card--user")
    .forEach((card) => card.remove());

  const reviews = getStoredReviews();
  const firstSampleCard = testimonialList.querySelector(".testimonial-card--sample");

  reviews.forEach((review) => {
    const card = buildReviewCard(review);

    if (firstSampleCard) {
      testimonialList.insertBefore(card, firstSampleCard);
      return;
    }

    testimonialList.append(card);
  });
};

reviewStars.forEach((star) => {
  star.addEventListener("click", () => {
    setActiveRating(Number(star.dataset.value));
  });
});

mobileQuickNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const sectionId = link.dataset.mobileNav;
    if (!sectionId) return;

    activeQuickNavSectionId = sectionId;
    setActiveMobileQuickNav(sectionId);
  });
});

if (reviewForm && reviewRatingInput) {
  setActiveRating(Number(reviewRatingInput.value) || 5);
  renderStoredReviews();

  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(reviewForm);
    const name = normalizeText(String(formData.get("name") || "")).slice(0, 40);
    const service = normalizeText(String(formData.get("service") || "")).slice(0, 40);
    const comment = normalizeText(String(formData.get("comment") || "")).slice(0, 220);
    const rating = Number(formData.get("rating"));

    if (!name || !service || !comment || Number.isNaN(rating) || rating < 1 || rating > 5) {
      setReviewFeedback("Preencha nome, serviço, nota e comentário para enviar.", true);
      return;
    }

    const reviews = getStoredReviews();
    reviews.unshift({
      id: String(Date.now()),
      name,
      service,
      comment,
      rating
    });

    saveStoredReviews(reviews);
    renderStoredReviews();
    reviewForm.reset();
    setActiveRating(5);
    setReviewFeedback("Avaliação enviada com sucesso. Ela já apareceu acima.");

    const newestReview = testimonialList?.querySelector(".testimonial-card--user");
    newestReview?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });
