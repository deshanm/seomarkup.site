export function getSchemaJson() {
  const NUMERIC_AS_STRING_FIELDS = [
    "gtin",
    "gtin8",
    "gtin12",
    "gtin13",
    "gtin14",
    "isbn",
    "mpn",
    "sku",
    "productID",
    "telephone",
    "faxNumber",
    "postalCode",
    "taxID",
    "vatID",
    "iataCode",
    "icaoCode",
  ];

  function coerceNumericFieldsToStrings(jsonString) {
    const pattern = new RegExp(
      `("(?:${NUMERIC_AS_STRING_FIELDS.join("|")})"\\s*:\\s*)(\\d+)`,
      "g"
    );
    return jsonString.replace(pattern, (_, key, num) => `${key}"${num}"`);
  }

  function parseJsonLD(rawText) {
    try {
      return { value: JSON.parse(rawText) };
    } catch (firstError) {
      try {
        return { value: JSON.parse(coerceNumericFieldsToStrings(rawText)) };
      } catch (secondError) {
        return {
          error: {
            message: secondError.message,
            snippet: rawText.length > 500 ? rawText.slice(0, 500) + "…" : rawText,
          },
        };
      }
    }
  }

  const scripts = document.querySelectorAll(
    'script[type="application/ld+json"]'
  );
  const schemas = [];
  const errors = [];

  scripts.forEach((item) => {
    const text = item.textContent || "";
    if (!text.trim()) return;
    const result = parseJsonLD(text);
    if (result.error) {
      errors.push(result.error);
      return;
    }
    const parsed = result.value;
    if (parsed && parsed["@graph"] && Array.isArray(parsed["@graph"])) {
      schemas.push(...parsed["@graph"]);
    } else if (Array.isArray(parsed)) {
      schemas.push(...parsed);
    } else if (parsed && typeof parsed === "object") {
      schemas.push(parsed);
    }
  });

  const microdataCount = document.querySelectorAll("[itemscope][itemtype]")
    .length;
  const rdfaCount = document.querySelectorAll("[typeof][vocab], [typeof]")
    .length;

  return {
    schemas,
    errors,
    otherFormats: { microdataCount, rdfaCount },
  };
}

export function downloadJSON(json, filename) {
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export function setupValidatorDropdown() {
  const dropdownButton = document.getElementById("validate");
  const dropdownContent = document.getElementById("dropdown-content");
  if (!dropdownButton || !dropdownContent) return;

  dropdownButton.setAttribute("aria-haspopup", "menu");
  dropdownButton.setAttribute("aria-expanded", "false");
  dropdownContent.setAttribute("role", "menu");

  dropdownButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = dropdownContent.classList.toggle("show");
    dropdownButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", (event) => {
    if (!dropdownButton.contains(event.target)) {
      dropdownContent.classList.remove("show");
      dropdownButton.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      dropdownContent.classList.remove("show");
      dropdownButton.setAttribute("aria-expanded", "false");
    }
  });
}

export function setupValidatorLinks() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs?.[0]?.url || "";
    const richResultsLink = document.getElementById("rich-results-link");
    const schemaLink = document.getElementById("schema-link");
    if (richResultsLink) {
      richResultsLink.href = `https://search.google.com/test/rich-results?url=${encodeURIComponent(
        currentUrl
      )}`;
    }
    if (schemaLink) {
      schemaLink.href = `https://validator.schema.org/#url=${encodeURIComponent(
        currentUrl
      )}`;
    }
  });
}
