(function () {
  const initFloatingShare = () => {
    if (document.querySelector("[data-share-fab]")) return;

    const markup = `
      <div class="share-fab" data-share-fab>
        <div class="share-fab__overlay" aria-hidden="true"></div>
        <div class="share-fab__dock">
          <div class="share-fab__actions" id="share-fab-menu" aria-hidden="true">
            <a
              class="share-fab__action share-fab__action--instagram"
              href="https://www.instagram.com/wellnessbeiigor/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              data-share-action
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.95 1.35a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z" />
              </svg>
            </a>
            <a
              class="share-fab__action share-fab__action--whatsapp"
              href="https://wa.me/491727889306"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              data-share-action
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M12.04 2A9.94 9.94 0 0 0 3.5 17.04L2 22l5.1-1.43A9.96 9.96 0 1 0 12.04 2Zm0 18.11a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.03.85.89-2.95-.2-.31a8.15 8.15 0 1 1 6.78 3.72Zm4.47-6.12c-.25-.13-1.5-.74-1.73-.82-.23-.09-.4-.13-.57.13-.17.26-.66.82-.81 1-.15.17-.3.2-.56.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.25-1.47-1.39-1.72-.14-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.07-.13-.57-1.37-.78-1.88-.21-.49-.43-.42-.57-.43h-.49c-.17 0-.44.06-.67.31-.23.26-.87.85-.87 2.06 0 1.22.89 2.4 1.01 2.57.13.17 1.75 2.67 4.24 3.74.59.26 1.05.42 1.41.54.59.19 1.13.16 1.56.1.48-.07 1.5-.61 1.71-1.2.21-.59.21-1.09.15-1.2-.07-.11-.24-.18-.49-.31Z" />
              </svg>
            </a>
            <a
              class="share-fab__action share-fab__action--facebook"
              href="https://www.facebook.com/profile.php?id=61577681453275"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              data-share-action
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M13.36 22v-8.18h2.75l.41-3.19h-3.16V8.6c0-.92.25-1.55 1.58-1.55H16.7V4.19c-.31-.04-1.38-.13-2.62-.13-2.59 0-4.37 1.58-4.37 4.48v2.09H6.77v3.19h2.94V22h3.65Z" />
              </svg>
            </a>
          </div>
          <button
            class="share-fab__toggle"
            type="button"
            aria-label="Share"
            aria-expanded="false"
            aria-controls="share-fab-menu"
          >
            <span class="share-fab__pulse-ring" aria-hidden="true"></span>
            <span class="share-fab__tooltip" aria-hidden="true">Share</span>
            <span class="share-fab__icon share-fab__icon--share" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15.5 5a2.5 2.5 0 1 0 2.36 3.3l-8 4.06a2.5 2.5 0 0 0-2.36-.86 2.5 2.5 0 1 0 2.36 4.14l8 4.05A2.5 2.5 0 1 0 18 18a2.52 2.52 0 0 0-.14-.83l-8-4.06a2.48 2.48 0 0 0 0-1.22l8-4.05c.28.7.97 1.16 1.74 1.16A2.5 2.5 0 0 0 15.5 5Z" fill="currentColor" />
              </svg>
            </span>
            <span class="share-fab__icon share-fab__icon--close" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6.75 6.75 17.25 17.25M17.25 6.75 6.75 17.25" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", markup);

    const root = document.querySelector("[data-share-fab]");
    if (!root) return;

    const dock = root.querySelector(".share-fab__dock");
    const toggle = root.querySelector(".share-fab__toggle");
    const menu = root.querySelector("#share-fab-menu");
    const actions = Array.from(root.querySelectorAll("[data-share-action]"));

    let state = "closed";
    let animationTimer = null;
    let lastScrollY = window.scrollY;
    let scrollTicking = false;

    const syncActionAccessibility = (isExpanded) => {
      menu.setAttribute("aria-hidden", String(!isExpanded));
      actions.forEach((action) => {
        action.tabIndex = isExpanded ? 0 : -1;
      });
    };

    const clearAnimationTimer = () => {
      if (animationTimer) {
        window.clearTimeout(animationTimer);
        animationTimer = null;
      }
    };

    const setExpanded = (isExpanded) => {
      toggle.setAttribute("aria-expanded", String(isExpanded));
      syncActionAccessibility(isExpanded);
    };

    const setScrollHidden = (isHidden) => {
      root.classList.toggle("is-hidden-by-scroll", isHidden);
    };

    const getViewportHeight = () => {
      if (window.visualViewport && window.visualViewport.height) {
        return window.visualViewport.height;
      }

      return window.innerHeight;
    };

    const getDocumentHeight = () => {
      const { body, documentElement } = document;

      return Math.max(
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
        documentElement.scrollHeight,
        documentElement.offsetHeight,
        documentElement.clientHeight,
      );
    };

    const openMenu = () => {
      if (state === "open" || state === "opening") return;
      clearAnimationTimer();
      root.classList.remove("is-closing");
      root.classList.add("is-opening");
      state = "opening";
      setExpanded(true);

      window.requestAnimationFrame(() => {
        root.classList.add("is-open");
      });

      animationTimer = window.setTimeout(() => {
        root.classList.remove("is-opening");
        state = "open";
      }, 560);
    };

    const closeMenu = () => {
      if (state === "closed" || state === "closing") return;
      clearAnimationTimer();
      root.classList.remove("is-opening");
      root.classList.add("is-closing");
      root.classList.remove("is-open");
      state = "closing";
      setExpanded(false);

      animationTimer = window.setTimeout(() => {
        root.classList.remove("is-closing");
        state = "closed";
      }, 420);
    };

    toggle.addEventListener("click", () => {
      if (state === "open" || state === "opening") {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (state !== "open" && state !== "opening") return;
      if (dock.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    actions.forEach((action) => {
      action.addEventListener("click", () => {
        closeMenu();
      });
    });

    const updateVisibilityOnScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const documentHeight = getDocumentHeight();
      const viewportHeight = getViewportHeight();
      const maxScrollY = Math.max(0, documentHeight - viewportHeight);
      const nearBottom = maxScrollY - currentScrollY <= 18;

      if (scrollingUp) {
        setScrollHidden(false);
      } else if (
        nearBottom &&
        (scrollingDown || currentScrollY >= maxScrollY)
      ) {
        if (state === "open" || state === "opening") {
          closeMenu();
        }
        setScrollHidden(true);
      }

      if (!nearBottom && !root.classList.contains("is-hidden-by-scroll")) {
        lastScrollY = currentScrollY;
        return;
      }

      if (!nearBottom && scrollingUp) {
        setScrollHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    const scheduleVisibilityUpdate = () => {
      if (scrollTicking) return;

      scrollTicking = true;
      window.requestAnimationFrame(() => {
        updateVisibilityOnScroll();
        scrollTicking = false;
      });
    };

    window.addEventListener("scroll", scheduleVisibilityUpdate, {
      passive: true,
    });

    window.addEventListener("resize", scheduleVisibilityUpdate, {
      passive: true,
    });

    window.addEventListener("orientationchange", scheduleVisibilityUpdate, {
      passive: true,
    });

    window.addEventListener("touchend", scheduleVisibilityUpdate, {
      passive: true,
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        scheduleVisibilityUpdate,
        {
          passive: true,
        },
      );
      window.visualViewport.addEventListener(
        "scroll",
        scheduleVisibilityUpdate,
        {
          passive: true,
        },
      );
    }

    syncActionAccessibility(false);
    updateVisibilityOnScroll();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFloatingShare, {
      once: true,
    });
  } else {
    initFloatingShare();
  }
})();
