import {
  getSchemaJson,
  downloadJSON,
  copyToClipboard,
  debounce,
  setupValidatorLinks,
  setupValidatorDropdown,
} from "./utils.js";
import {
  downloadSVG,
  copySVG,
  codeSVG,
  externalLinkSVG,
  starSVG,
  WEB_STORE_REVIEW_URL,
  RATING_PROMPT_THRESHOLD,
  SNOOZE_DAYS,
  CHANGELOG,
} from "./constants.js";

let currentHighlightIndex = -1;
let highlightedElements = [];
let originalJsonData = [];

const FEEDBACK_KEY = "smr_feedback";
const DEFAULT_FEEDBACK_STATE = {
  valueActions: 0,
  promptState: "pending",
  snoozedUntil: 0,
  lastSeenVersion: "",
};

function getFeedbackState() {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    if (!raw) return { ...DEFAULT_FEEDBACK_STATE };
    return { ...DEFAULT_FEEDBACK_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_FEEDBACK_STATE };
  }
}

function setFeedbackState(patch) {
  const next = { ...getFeedbackState(), ...patch };
  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

function incrementValueAction() {
  const state = getFeedbackState();
  setFeedbackState({ valueActions: state.valueActions + 1 });
}

function shouldShowRatingPrompt(state) {
  if (state.promptState === "rated" || state.promptState === "dismissed") {
    return false;
  }
  if (state.promptState === "snoozed") {
    return Date.now() >= state.snoozedUntil;
  }
  return state.valueActions >= RATING_PROMPT_THRESHOLD;
}

function getCurrentVersion() {
  try {
    return chrome.runtime.getManifest().version;
  } catch {
    return "";
  }
}

document.addEventListener("DOMContentLoaded", init);

function init() {
  setupEventListeners();
  setupValidatorDropdown();
  setupValidatorLinks();
  paintFooterIcons();
  loadSchemaDataWithRetry();
}

function paintFooterIcons() {
  const star = document.querySelector("#rate-us-link .rate-star");
  if (star) star.innerHTML = starSVG;
}

function loadSchemaDataWithRetry(retries = 5, delay = 1000) {
  const checkAndLoadData = (attempt) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      const loading = document.getElementById("loading");

      if (!tab || !tab.id || !/^https?:/i.test(tab.url || "")) {
        loading.textContent =
          "Schema inspection is only available on http(s) pages.";
        displayResults();
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: getSchemaJson,
        },
        (results) => {
          if (chrome.runtime.lastError) {
            loading.textContent = `Cannot access this page: ${chrome.runtime.lastError.message}`;
            displayResults();
            return;
          }

          const payload = results?.[0]?.result;
          const schemas = payload?.schemas || [];
          const errors = payload?.errors || [];
          const otherFormats = payload?.otherFormats || {};

          if (schemas.length > 0 || errors.length > 0) {
            displayResults(schemas, errors, otherFormats);
          } else if (attempt < retries) {
            loading.textContent = "No schema found yet. Retrying...";
            setTimeout(() => checkAndLoadData(attempt + 1), delay);
          } else {
            displayResults([], [], otherFormats);
          }
        }
      );
    });
  };

  checkAndLoadData(0);
}

function setupEventListeners() {
  const searchBox = document.getElementById("search-box");
  searchBox.addEventListener("input", debounce(searchJSON, 300));
  searchBox.addEventListener("keydown", handleSearchKeydown);

  document.getElementById("clear").addEventListener("click", clearSearch);

  document.getElementById("previous").addEventListener("click", () => {
    if (highlightedElements.length === 0) return;
    currentHighlightIndex =
      (currentHighlightIndex - 1 + highlightedElements.length) %
      highlightedElements.length;
    scrollToHighlight();
  });

  document.getElementById("next").addEventListener("click", () => {
    if (highlightedElements.length === 0) return;
    currentHighlightIndex =
      (currentHighlightIndex + 1) % highlightedElements.length;
    scrollToHighlight();
  });
}

function displayResults(schemas = [], errors = [], otherFormats = {}) {
  const loading = document.getElementById("loading");
  const jsonContent = document.getElementById("json-content");
  const noDataContent = document.getElementById("no-data-content");
  const fixedSearchContainer = document.querySelector(
    ".fixed-search-container"
  );

  loading.style.display = "none";

  jsonContent.innerHTML = "";
  originalJsonData = [];
  highlightedElements = [];
  currentHighlightIndex = -1;

  const state = getFeedbackState();
  const showRating = schemas.length > 0 && shouldShowRatingPrompt(state);
  if (showRating) {
    renderRatingPrompt(jsonContent);
  } else {
    renderChangelogBanner(jsonContent, state);
  }

  renderErrorBanner(errors);
  renderOtherFormatsBanner(otherFormats);

  if (schemas.length === 0) {
    const hasBanner = jsonContent.children.length > 0;
    if (errors.length > 0) {
      jsonContent.style.display = "block";
      noDataContent.style.display = "none";
      fixedSearchContainer.style.display = "none";
    } else {
      jsonContent.style.display = hasBanner ? "block" : "none";
      noDataContent.style.display = "block";
      fixedSearchContainer.style.display = "none";
    }
    return;
  }

  jsonContent.style.display = "block";
  noDataContent.style.display = "none";
  fixedSearchContainer.style.display = "";
  originalJsonData = schemas;
  schemas.forEach((json, index) => createAccordion(json, index));
}

function renderRatingPrompt(container) {
  const banner = document.createElement("div");
  banner.className = "rating-banner";

  const text = document.createElement("div");
  text.className = "rating-banner-text";
  text.innerHTML =
    '<strong>Enjoying SEOMarkup Inspector?</strong> A 30-second review on the Web Store helps a lot.';
  banner.appendChild(text);

  const actions = document.createElement("div");
  actions.className = "rating-banner-actions";

  const rate = document.createElement("a");
  rate.className = "rating-btn primary";
  rate.href = WEB_STORE_REVIEW_URL;
  rate.target = "_blank";
  rate.rel = "noopener noreferrer";
  rate.innerHTML = `<span class="rate-star" aria-hidden="true">${starSVG}</span>Rate on Web Store`;
  rate.addEventListener("click", () => {
    setFeedbackState({ promptState: "rated" });
    banner.remove();
  });
  actions.appendChild(rate);

  const snooze = document.createElement("button");
  snooze.type = "button";
  snooze.className = "rating-btn secondary";
  snooze.textContent = "Remind me later";
  snooze.addEventListener("click", () => {
    setFeedbackState({
      promptState: "snoozed",
      snoozedUntil: Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000,
    });
    banner.remove();
  });
  actions.appendChild(snooze);

  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "rating-btn tertiary";
  dismiss.textContent = "No thanks";
  dismiss.addEventListener("click", () => {
    setFeedbackState({ promptState: "dismissed" });
    banner.remove();
  });
  actions.appendChild(dismiss);

  banner.appendChild(actions);
  container.appendChild(banner);
}

function renderChangelogBanner(container, state) {
  const currentVersion = getCurrentVersion();
  if (!currentVersion) return;

  if (!state.lastSeenVersion) {
    setFeedbackState({ lastSeenVersion: currentVersion });
    return;
  }

  if (state.lastSeenVersion === currentVersion) return;

  const entry = CHANGELOG.find((e) => e.version === currentVersion);
  if (!entry) {
    setFeedbackState({ lastSeenVersion: currentVersion });
    return;
  }

  const banner = document.createElement("div");
  banner.className = "changelog-banner";

  const header = document.createElement("div");
  header.className = "changelog-header";
  header.innerHTML = `<span class="changelog-pill">New</span><span>What's new in ${entry.version}</span>`;
  banner.appendChild(header);

  const list = document.createElement("ul");
  list.className = "changelog-list";
  entry.bullets.forEach((b) => {
    const li = document.createElement("li");
    li.textContent = b;
    list.appendChild(li);
  });
  banner.appendChild(list);

  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "changelog-dismiss";
  dismiss.textContent = "Got it";
  dismiss.addEventListener("click", () => {
    setFeedbackState({ lastSeenVersion: currentVersion });
    banner.remove();
  });
  banner.appendChild(dismiss);

  container.appendChild(banner);
}

function renderErrorBanner(errors) {
  if (!errors || errors.length === 0) return;
  const jsonContent = document.getElementById("json-content");
  const banner = document.createElement("div");
  banner.className = "error-banner";
  const header = document.createElement("h3");
  header.textContent = `${errors.length} JSON-LD block(s) failed to parse`;
  banner.appendChild(header);
  errors.forEach((err, i) => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = `Block ${i + 1}: ${err.message}`;
    details.appendChild(summary);
    const pre = document.createElement("pre");
    pre.textContent = err.snippet;
    details.appendChild(pre);
    banner.appendChild(details);
  });
  jsonContent.appendChild(banner);
}

function renderOtherFormatsBanner(otherFormats) {
  if (!otherFormats) return;
  const { microdataCount = 0, rdfaCount = 0 } = otherFormats;
  if (microdataCount === 0 && rdfaCount === 0) return;
  const jsonContent = document.getElementById("json-content");
  const banner = document.createElement("div");
  banner.className = "info-banner";
  const parts = [];
  if (microdataCount > 0) parts.push(`${microdataCount} Microdata item(s)`);
  if (rdfaCount > 0) parts.push(`${rdfaCount} RDFa item(s)`);
  banner.textContent = `Detected on this page (not shown here): ${parts.join(
    ", "
  )}.`;
  jsonContent.appendChild(banner);
}

function createAccordion(json, index) {
  const jsonContent = document.getElementById("json-content");
  const accordion = document.createElement("div");
  accordion.className = "accordion";
  accordion.setAttribute("role", "button");
  accordion.setAttribute("tabindex", "0");
  accordion.setAttribute("aria-expanded", "false");
  const type = json["@type"] || "Unknown Type";

  const titleWrap = document.createElement("div");
  titleWrap.className = "accordion-title";

  const indexEl = document.createElement("span");
  indexEl.className = "accordion-index";
  indexEl.textContent = `${index + 1}`;
  titleWrap.appendChild(indexEl);

  const typeEl = document.createElement("span");
  typeEl.className = "accordion-type";

  const typeText = document.createElement("span");
  typeText.className = "accordion-type-text";
  typeText.textContent = typeLabel(type);
  typeEl.appendChild(typeText);

  if (type !== "Unknown Type" && typeof type === "string") {
    typeEl.classList.add("is-link");
    typeEl.setAttribute("role", "link");
    typeEl.tabIndex = 0;
    typeEl.setAttribute("aria-label", `Open ${type} on Schema.org (new tab)`);

    const arrow = document.createElement("span");
    arrow.className = "type-link-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.innerHTML = externalLinkSVG;
    typeEl.appendChild(arrow);

    const openDocs = (e) => {
      e.stopPropagation();
      window.open(`https://schema.org/${encodeURIComponent(type)}`, "_blank");
    };
    typeEl.addEventListener("click", openDocs);
    typeEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openDocs(e);
    });
  }
  titleWrap.appendChild(typeEl);
  accordion.appendChild(titleWrap);

  const panel = document.createElement("div");
  panel.className = "panel";

  const wrapper = document.createElement("div");
  wrapper.id = `wrapper-${index}`;
  wrapper.classList.add("wrapper");
  const tree = jsonTree.create(json, wrapper);
  tree.expand();

  const accordionRightAction = document.createElement("div");
  accordionRightAction.className = "accordion-actions";
  accordionRightAction.appendChild(
    createIconButton(
      copySVG,
      "Copy JSON",
      JSON.stringify(json, null, 2),
      "copy"
    )
  );
  accordionRightAction.appendChild(
    createIconButton(
      codeSVG,
      "Copy as <script> tag",
      `<script type="application/ld+json">${JSON.stringify(
        json,
        null,
        2
      )}</script>`,
      "copy"
    )
  );
  accordionRightAction.appendChild(createDownloadButton(json, type, index));

  accordion.appendChild(accordionRightAction);
  panel.appendChild(wrapper);
  jsonContent.appendChild(accordion);
  jsonContent.appendChild(panel);
  accordion.addEventListener("click", toggleAccordion);
  accordion.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target === accordion) {
      e.preventDefault();
      toggleAccordion.call(accordion);
    }
  });
}

function typeLabel(type) {
  if (Array.isArray(type)) return type.join(", ");
  return type;
}

function createIconButton(svg, label, copyText) {
  const btn = document.createElement("button");
  btn.className = "icon-btn";
  btn.type = "button";
  btn.innerHTML = svg;
  btn.dataset.tooltip = label;
  btn.setAttribute("aria-label", label);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    copyToClipboard(copyText)
      .then(() => {
        incrementValueAction();
        btn.classList.add("is-copied");
        btn.dataset.tooltip = "Copied!";
        setTimeout(() => {
          btn.classList.remove("is-copied");
          btn.dataset.tooltip = label;
        }, 1500);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  });
  return btn;
}

function createDownloadButton(json, type, index) {
  const downloadBtn = document.createElement("button");
  downloadBtn.className = "icon-btn";
  downloadBtn.type = "button";
  downloadBtn.innerHTML = downloadSVG;
  const safeType =
    typeof type === "string" ? type.replace(/[^a-z0-9_-]/gi, "_") : "schema";
  const label = `Download ${type} JSON`;
  downloadBtn.dataset.tooltip = label;
  downloadBtn.setAttribute("aria-label", `Download ${type} schema as JSON`);
  downloadBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    downloadJSON(json, `schema_${safeType}_${index + 1}.json`);
    incrementValueAction();
  });
  return downloadBtn;
}

function toggleAccordion() {
  const isActive = this.classList.toggle("active");
  this.setAttribute("aria-expanded", isActive ? "true" : "false");
  const panel = this.nextElementSibling;
  panel.classList.toggle("open", isActive);
}

function searchJSON() {
  const searchTerm = document.getElementById("search-box").value.toLowerCase();
  const panels = document.getElementsByClassName("panel");
  highlightedElements = [];
  currentHighlightIndex = -1;

  Array.from(panels).forEach((panel, index) => {
    const wrapper = panel.getElementsByClassName("wrapper")[0];
    const json = originalJsonData[index];
    const accordion = panel.previousElementSibling;
    if (!wrapper || !json || !accordion) return;

    wrapper.innerHTML = "";
    const tree = jsonTree.create(json, wrapper);
    tree.expand();

    if (searchTerm) {
      tree.search(searchTerm);
      accordion.classList.add("active");
      accordion.setAttribute("aria-expanded", "true");
      panel.classList.add("open");
      collectHighlights(panel);
    } else {
      accordion.classList.remove("active");
      accordion.setAttribute("aria-expanded", "false");
      panel.classList.remove("open");
    }
  });

  if (highlightedElements.length > 0) {
    currentHighlightIndex = 0;
    scrollToHighlight();
  } else {
    updateCountDisplay(searchTerm ? "0 of 0" : "");
  }
}

function handleSearchKeydown(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (highlightedElements.length === 0) return;
  currentHighlightIndex =
    (currentHighlightIndex + 1) % highlightedElements.length;
  scrollToHighlight();
}

function collectHighlights(panel) {
  const highlights = panel.querySelectorAll(".highlight-child");
  highlightedElements.push(...highlights);
}

function scrollToHighlight() {
  if (
    currentHighlightIndex < 0 ||
    currentHighlightIndex >= highlightedElements.length
  ) {
    return;
  }
  highlightedElements.forEach((el) =>
    el.classList.remove("selected-highlight")
  );
  const highlight = highlightedElements[currentHighlightIndex];
  highlight.classList.add("selected-highlight");
  highlight.scrollIntoView({ block: "center", inline: "nearest" });

  updateCountDisplay(
    `${currentHighlightIndex + 1} of ${highlightedElements.length}`
  );
}

function updateCountDisplay(text = "") {
  document.getElementById("search-count").textContent = text;
}

function clearSearch() {
  document.getElementById("search-box").value = "";
  updateCountDisplay("");
  currentHighlightIndex = -1;
  highlightedElements = [];
  searchJSON();
}
