/**
 * Google Review Link Widget - Vanilla JavaScript
 * Generates a direct Google Review link from a Google Maps URL.
 * No API keys required — 100% client-side.
 */
(function () {
  "use strict";

  const CONFIG = {
    containerSelector: "[data-review-qr-widget]",
  };

  function generateId() {
    return "review-qr-" + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Try to extract a Place ID from a Google Maps address bar URL.
   *
   * Google Maps long-form URLs embed the Place ID in the data segment after "!1s":
   *   https://www.google.com/maps/place/Name/@lat,lng/data=!...!1sChIJxxxxxxxx!...
   *
   * Returns the Place ID string (e.g. "ChIJxxxxxxxx") or null when not found.
   * Note: short goo.gl share links cannot be resolved client-side, so they return null.
   */
  function parsePlaceId(mapsUrl) {
    if (!mapsUrl || typeof mapsUrl !== "string") return null;

    // Pattern: !1s followed by a Place ID that starts with ChIJ
    const match = mapsUrl.match(/[!|]1s(ChIJ[^!|&?]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }

    return null;
  }

  /**
   * Build the review URL.
   * - With Place ID: direct write-review endpoint (opens the review form immediately)
   * - Without Place ID: Google Maps search (customer can tap "Write a review" from the listing)
   */
  function buildReviewUrl(placeId, businessName, city) {
    if (placeId) {
      return (
        "https://search.google.com/local/writereview?placeid=" +
        encodeURIComponent(placeId)
      );
    }

    // Fallback: Maps search URL
    const query = [businessName, city].filter(Boolean).join(" ");
    return (
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(query)
    );
  }

  function createWidgetHTML(title) {
    const id = generateId();

    return `
      <div class="review-qr-widget" id="${id}">
        <h2 class="review-qr-widget__title">${title}</h2>
        <p class="review-qr-widget__subtitle">
          Generate a direct Google review link for your business — no tech skills needed.
        </p>

        <form class="review-qr-widget__form">

          <div class="review-qr-widget__input-group">
            <label class="review-qr-widget__label" for="${id}-name">Business Name</label>
            <input
              type="text"
              id="${id}-name"
              class="review-qr-widget__input review-qr-widget__input--name"
              placeholder="e.g. Cleanline Pressure Washing"
              required
              autocomplete="organization"
            />
          </div>

          <div class="review-qr-widget__input-group">
            <label class="review-qr-widget__label" for="${id}-city">City &amp; State</label>
            <input
              type="text"
              id="${id}-city"
              class="review-qr-widget__input review-qr-widget__input--city"
              placeholder="e.g. Indianapolis, IN"
              autocomplete="address-level2"
            />
          </div>

          <div class="review-qr-widget__input-group">
            <label class="review-qr-widget__label" for="${id}-url">
              Google Maps URL <span style="font-weight:400;color:#6b7280;">(optional but recommended)</span>
            </label>
            <input
              type="text"
              id="${id}-url"
              class="review-qr-widget__input review-qr-widget__input--url"
              placeholder="https://www.google.com/maps/place/..."
            />
            <div class="review-qr-widget__instructions">
              <p class="review-qr-widget__instructions-title">How to get your Maps URL:</p>
              <ol class="review-qr-widget__instructions-list">
                <li>Open <strong>google.com</strong> and search your business name</li>
                <li>Click your listing in the results</li>
                <li>Click <strong>"View on Google Maps"</strong></li>
                <li>Copy the full URL from your <strong>browser address bar</strong> (not the Share button)</li>
                <li>Paste it in the field above</li>
              </ol>
              <button type="button" class="review-qr-widget__find-btn" data-find-btn>
                🔍 Search my business on Maps
              </button>
            </div>
          </div>

          <button type="submit" class="review-qr-widget__submit-btn">
            Generate Review Link
          </button>

        </form>

        <div class="review-qr-widget__results" style="display:none;">
          <h3 class="review-qr-widget__results-title">Your Review Link</h3>

          <div class="review-qr-widget__fallback-notice" style="display:none;">
            <strong>Heads up:</strong> We couldn't find your exact listing in that URL, so this link opens a
            Google Maps search for your business. Customers can tap <strong>"Write a review"</strong> from there.
            For a more direct link, paste the full address bar URL from Google Maps.
          </div>

          <div class="review-qr-widget__link-section">
            <p class="review-qr-widget__link-label">Your Review Link</p>
            <div class="review-qr-widget__link-box">
              <p class="review-qr-widget__link-text"></p>
              <button type="button" class="review-qr-widget__copy-btn">Copy</button>
            </div>
          </div>

          <button type="button" class="review-qr-widget__reset-btn">&#8592; Start Over</button>
        </div>

      </div>
    `;
  }

  function setupHandlers(container) {
    var form = container.querySelector(".review-qr-widget__form");
    var nameInput = container.querySelector(".review-qr-widget__input--name");
    var cityInput = container.querySelector(".review-qr-widget__input--city");
    var urlInput = container.querySelector(".review-qr-widget__input--url");
    var findBtn = container.querySelector("[data-find-btn]");
    var resultsSection = container.querySelector(".review-qr-widget__results");
    var fallbackNotice = container.querySelector(
      ".review-qr-widget__fallback-notice",
    );
    var linkText = container.querySelector(".review-qr-widget__link-text");
    var copyBtn = container.querySelector(".review-qr-widget__copy-btn");
    var resetBtn = container.querySelector(".review-qr-widget__reset-btn");

    var currentReviewUrl = "";

    // ── "Find my business" helper ──────────────────────────────────────────────
    findBtn.addEventListener("click", function () {
      var name = nameInput.value.trim();
      var city = cityInput.value.trim();
      var query = [name, city].filter(Boolean).join(" ");
      if (!query) {
        nameInput.focus();
        return;
      }
      window.open(
        "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent(query),
        "_blank",
        "noopener,noreferrer",
      );
    });

    // ── Form submit ────────────────────────────────────────────────────────────
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var businessName = nameInput.value.trim();
      var city = cityInput.value.trim();
      var mapsUrl = urlInput.value.trim();

      if (!businessName) {
        nameInput.focus();
        return;
      }

      var placeId = parsePlaceId(mapsUrl);
      var reviewUrl = buildReviewUrl(placeId, businessName, city);
      currentReviewUrl = reviewUrl;

      // Show or hide fallback notice depending on whether we got a Place ID
      fallbackNotice.style.display = placeId ? "none" : "block";

      // Populate the link text — textContent prevents XSS
      linkText.textContent = reviewUrl;

      // Swap form for results
      form.style.display = "none";
      resultsSection.style.display = "block";
      resultsSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    // ── Copy link ──────────────────────────────────────────────────────────────
    copyBtn.addEventListener("click", function () {
      if (!currentReviewUrl) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(currentReviewUrl)
          .then(function () {
            showCopied(copyBtn);
          })
          .catch(function () {
            fallbackCopy(currentReviewUrl, copyBtn);
          });
      } else {
        fallbackCopy(currentReviewUrl, copyBtn);
      }
    });

    // ── Start Over ─────────────────────────────────────────────────────────────
    resetBtn.addEventListener("click", function () {
      form.reset();
      form.style.display = "flex";
      resultsSection.style.display = "none";
      currentReviewUrl = "";
      copyBtn.textContent = "Copy";
      copyBtn.classList.remove("review-qr-widget__copy-btn--copied");
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function showCopied(btn) {
    btn.textContent = "Copied!";
    btn.classList.add("review-qr-widget__copy-btn--copied");
    setTimeout(function () {
      btn.textContent = "Copy";
      btn.classList.remove("review-qr-widget__copy-btn--copied");
    }, 2000);
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      showCopied(btn);
    } catch (err) {
      console.error("Copy failed:", err);
    }
    document.body.removeChild(ta);
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function initWidget(container) {
    if (container.dataset.initialized) return;

    var title = container.dataset.title || "Google Review Link Generator";
    container.innerHTML = createWidgetHTML(title);
    setupHandlers(container);
    container.dataset.initialized = "true";
  }

  function initAllWidgets() {
    var containers = document.querySelectorAll(CONFIG.containerSelector);
    containers.forEach(initWidget);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllWidgets);
  } else {
    initAllWidgets();
  }

  window.ReviewQRWidget = {
    init: initAllWidgets,
    initContainer: initWidget,
  };
})();
