(function () {
  if (window.__wellnessCookieConsentInitialized) {
    return;
  }
  window.__wellnessCookieConsentInitialized = true;

  var STORAGE_KEY = "wellness_cookie_consent_v1";
  var COOKIE_KEY = "wellness_cookie_consent_v1";
  var COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
  var GA_MEASUREMENT_ID = "G-F4EZJEZF7R";
  var COOKIE_POLICY_PATH = "cookie-richtlinie.html";

  var bannerElement;
  var modalBackdropElement;
  var analyticsCheckbox;

  function getLastElement(selector) {
    var list = document.querySelectorAll(selector);
    if (!list.length) return null;
    return list[list.length - 1];
  }

  function readConsentCookie() {
    var parts = document.cookie ? document.cookie.split(";") : [];

    for (var i = 0; i < parts.length; i += 1) {
      var cookiePart = parts[i].trim();
      if (cookiePart.indexOf(COOKIE_KEY + "=") !== 0) continue;

      var encoded = cookiePart.substring((COOKIE_KEY + "=").length);
      try {
        var json = decodeURIComponent(encoded);
        var parsed = JSON.parse(json);
        if (!parsed || !parsed.categories) return null;
        return parsed;
      } catch (error) {
        return null;
      }
    }

    return null;
  }

  function writeConsentCookie(payload) {
    try {
      var encoded = encodeURIComponent(JSON.stringify(payload));
      document.cookie =
        COOKIE_KEY +
        "=" +
        encoded +
        "; path=/; max-age=" +
        COOKIE_MAX_AGE_SECONDS +
        "; samesite=lax";
    } catch (error) {}
  }

  function createGtagStub() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }

    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });
  }

  function getStoredConsent() {
    var cookieConsent = readConsentCookie();
    if (cookieConsent) return cookieConsent;

    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.categories) return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function persistConsent(categories) {
    var payload = {
      categories: {
        necessary: true,
        analytics: !!categories.analytics,
      },
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {}

    writeConsentCookie(payload);
    return payload;
  }

  function getAnalyticsPreferenceOrDefault(storedConsent) {
    if (
      storedConsent &&
      storedConsent.categories &&
      typeof storedConsent.categories.analytics === "boolean"
    ) {
      return storedConsent.categories.analytics;
    }

    return true;
  }

  function deleteCookieEverywhere(cookieName) {
    var host = window.location.hostname;
    var parts = host.split(".");
    var domainCandidates = [host];

    for (var i = 1; i < parts.length - 1; i += 1) {
      domainCandidates.push(parts.slice(i).join("."));
    }

    var expires = "Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = cookieName + "=; expires=" + expires + "; path=/";

    for (var j = 0; j < domainCandidates.length; j += 1) {
      document.cookie =
        cookieName +
        "=; expires=" +
        expires +
        "; path=/; domain=" +
        domainCandidates[j];
      document.cookie =
        cookieName +
        "=; expires=" +
        expires +
        "; path=/; domain=." +
        domainCandidates[j];
    }
  }

  function clearAnalyticsCookies() {
    var cookies = document.cookie ? document.cookie.split(";") : [];

    for (var i = 0; i < cookies.length; i += 1) {
      var cookieName = cookies[i].split("=")[0].trim();
      if (cookieName === "_ga" || cookieName.indexOf("_ga_") === 0) {
        deleteCookieEverywhere(cookieName);
      }
    }
  }

  function setAnalyticsDisabled(isDisabled) {
    window["ga-disable-" + GA_MEASUREMENT_ID] = isDisabled;
  }

  function updateConsentMode(analyticsGranted) {
    try {
      window.gtag("consent", "update", {
        analytics_storage: analyticsGranted ? "granted" : "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    } catch (error) {}
  }

  function loadGoogleAnalytics() {
    if (document.querySelector('script[data-cookie-ga="true"]')) {
      return;
    }

    var script = document.createElement("script");
    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    script.setAttribute("data-cookie-ga", "true");

    script.addEventListener("load", function () {
      window.gtag("js", new Date());
      window.gtag("config", GA_MEASUREMENT_ID, {
        anonymize_ip: true,
        transport_type: "beacon",
      });
    });

    document.head.appendChild(script);
  }

  function applyConsent(categories, options) {
    var analyticsGranted = !!categories.analytics;
    var shouldPersist = !options || options.persist !== false;

    setAnalyticsDisabled(!analyticsGranted);
    updateConsentMode(analyticsGranted);

    try {
      if (analyticsGranted) {
        loadGoogleAnalytics();
      } else {
        clearAnalyticsCookies();
      }
    } catch (error) {}

    if (shouldPersist) {
      persistConsent({ analytics: analyticsGranted });
    }
  }

  function hideBanner() {
    if (bannerElement) {
      bannerElement.hidden = true;
      bannerElement.style.display = "none";
    }

    document.querySelectorAll("[data-cookie-banner]").forEach(function (el) {
      el.hidden = true;
      el.style.display = "none";
      el.remove();
    });
  }

  function showBanner() {
    if (bannerElement) {
      bannerElement.hidden = false;
    }
  }

  function openSettings() {
    if (modalBackdropElement) {
      modalBackdropElement.hidden = false;
      document.body.classList.add("cookie-modal-open");
      if (analyticsCheckbox) analyticsCheckbox.focus();
    }
  }

  function closeSettings() {
    if (modalBackdropElement) {
      modalBackdropElement.hidden = true;
      modalBackdropElement.style.display = "none";
      document.body.classList.remove("cookie-modal-open");
    }

    document.querySelectorAll("[data-cookie-modal]").forEach(function (el) {
      el.hidden = true;
      el.style.display = "none";
      el.remove();
    });
  }

  function footerHasCookieSettingsLink(footer) {
    return !!footer.querySelector("[data-cookie-settings-link]");
  }

  function appendFooterLinks() {
    var footerBlocks = document.querySelectorAll(".footer-legal");

    for (var i = 0; i < footerBlocks.length; i += 1) {
      var block = footerBlocks[i];
      if (footerHasCookieSettingsLink(block)) continue;

      var separator = document.createTextNode(" | ");
      var settingsLink = document.createElement("a");
      settingsLink.href = "#";
      settingsLink.className = "footer-link cookie-footer-link";
      settingsLink.setAttribute("data-cookie-settings-link", "true");
      settingsLink.textContent = "Cookie-Einstellungen";

      var separatorTwo = document.createTextNode(" | ");
      var policyLink = document.createElement("a");
      policyLink.href = COOKIE_POLICY_PATH;
      policyLink.className = "footer-link";
      policyLink.textContent = "Cookie-Richtlinie";

      block.appendChild(separator);
      block.appendChild(settingsLink);
      block.appendChild(separatorTwo);
      block.appendChild(policyLink);
    }
  }

  function renderConsentUi() {
    document.querySelectorAll("[data-cookie-banner]").forEach(function (el) {
      el.remove();
    });
    document.querySelectorAll("[data-cookie-modal]").forEach(function (el) {
      el.remove();
    });

    var wrapper = document.createElement("div");
    wrapper.innerHTML =
      '<section class="cookie-consent-banner" data-cookie-banner hidden>' +
      '<h2 class="cookie-consent-title">Cookie-Einstellungen</h2>' +
      '<p class="cookie-consent-text">Wir verwenden notwendige Cookies. Mit Ihrer Einwilligung nutzen wir zusaetzlich Google Analytics (gtag.js), um die Website zu verbessern. Ihre Auswahl koennen Sie jederzeit ueber "Cookie-Einstellungen" im Footer widerrufen oder aendern.</p>' +
      '<div class="cookie-consent-actions">' +
      '<button type="button" class="cookie-btn cookie-btn-primary" data-cookie-accept>Alle akzeptieren</button>' +
      '<button type="button" class="cookie-btn" data-cookie-reject>Ablehnen</button>' +
      '<button type="button" class="cookie-btn" data-cookie-settings>Einstellungen</button>' +
      "</div>" +
      "</section>" +
      '<div class="cookie-consent-backdrop" data-cookie-modal hidden>' +
      '<div class="cookie-consent-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">' +
      '<h2 id="cookie-modal-title">Cookie-Einstellungen</h2>' +
      "<p>Sie koennen festlegen, welche Cookie-Kategorien verwendet werden. Notwendige Cookies sind fuer den Betrieb der Website erforderlich und koennen nicht deaktiviert werden.</p>" +
      '<div class="cookie-category">' +
      '<div class="cookie-category-header">' +
      '<span class="cookie-category-title">Notwendige Cookies</span>' +
      '<input type="checkbox" checked disabled class="cookie-switch" />' +
      "</div>" +
      "<small>Erforderlich fuer Grundfunktionen wie Navigation und Sicherheit.</small>" +
      "</div>" +
      '<div class="cookie-category">' +
      '<div class="cookie-category-header">' +
      '<span class="cookie-category-title">Analyse (Google Analytics)</span>' +
      '<input type="checkbox" class="cookie-switch" data-cookie-analytics checked />' +
      "</div>" +
      "<small>Hilft uns zu verstehen, wie Besucher die Website nutzen (nur mit Einwilligung).</small>" +
      '<div class="cookie-note">Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO.</div>' +
      "</div>" +
      '<div class="cookie-consent-actions">' +
      '<button type="button" class="cookie-btn cookie-btn-primary" data-cookie-save>Auswahl speichern</button>' +
      '<button type="button" class="cookie-btn" data-cookie-cancel>Abbrechen</button>' +
      "</div>" +
      "</div>" +
      "</div>";

    while (wrapper.firstChild) {
      document.body.appendChild(wrapper.firstChild);
    }

    bannerElement = getLastElement("[data-cookie-banner]");
    modalBackdropElement = getLastElement("[data-cookie-modal]");
    analyticsCheckbox = getLastElement("[data-cookie-analytics]");

    var acceptButton = getLastElement("[data-cookie-accept]");
    var rejectButton = getLastElement("[data-cookie-reject]");
    var settingsButton = getLastElement("[data-cookie-settings]");
    var saveButton = getLastElement("[data-cookie-save]");
    var cancelButton = getLastElement("[data-cookie-cancel]");

    function finalizeConsent(analyticsGranted) {
      hideBanner();
      closeSettings();
      applyConsent({ analytics: !!analyticsGranted });
    }

    if (acceptButton) {
      acceptButton.addEventListener("click", function () {
        finalizeConsent(true);
      });
    }

    if (rejectButton) {
      rejectButton.addEventListener("click", function () {
        finalizeConsent(false);
      });
    }

    if (settingsButton) {
      settingsButton.addEventListener("click", function () {
        var stored = getStoredConsent();
        if (analyticsCheckbox) {
          analyticsCheckbox.checked = getAnalyticsPreferenceOrDefault(stored);
        }
        openSettings();
      });
    }

    if (saveButton) {
      saveButton.addEventListener("click", function () {
        finalizeConsent(analyticsCheckbox && analyticsCheckbox.checked);
      });
    }

    if (cancelButton) {
      cancelButton.addEventListener("click", closeSettings);
    }

    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest("[data-cookie-save]")) {
        event.preventDefault();
        var liveCheckbox = getLastElement("[data-cookie-analytics]");
        finalizeConsent(liveCheckbox && liveCheckbox.checked);
        return;
      }

      if (target.closest("[data-cookie-accept]")) {
        event.preventDefault();
        finalizeConsent(true);
        return;
      }

      if (target.closest("[data-cookie-reject]")) {
        event.preventDefault();
        finalizeConsent(false);
        return;
      }

      if (target.closest("[data-cookie-cancel]")) {
        event.preventDefault();
        closeSettings();
      }
    });

    if (modalBackdropElement) {
      modalBackdropElement.addEventListener("click", function (event) {
        if (event.target === modalBackdropElement) {
          closeSettings();
        }
      });
    }

    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.matches("[data-cookie-settings-link]")) return;
      event.preventDefault();

      var stored = getStoredConsent();
      if (analyticsCheckbox) {
        analyticsCheckbox.checked = getAnalyticsPreferenceOrDefault(stored);
      }
      openSettings();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeSettings();
      }
    });
  }

  function bootstrapConsent() {
    createGtagStub();
    renderConsentUi();
    appendFooterLinks();

    var stored = getStoredConsent();
    if (stored) {
      if (analyticsCheckbox) {
        analyticsCheckbox.checked = getAnalyticsPreferenceOrDefault(stored);
      }
      applyConsent(stored.categories, { persist: false });
      hideBanner();
      return;
    }

    if (analyticsCheckbox) {
      analyticsCheckbox.checked = true;
    }

    showBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapConsent);
  } else {
    bootstrapConsent();
  }
})();
