(() => {
  "use strict";

  // DOM Elements
  const inputEl = document.getElementById("leetInput");
  const outputEl = document.getElementById("leetOutput");
  const inputStatsEl = document.getElementById("inputStats");
  const outputStatsEl = document.getElementById("outputStats");
  const activeRulesSummaryEl = document.getElementById("activeRulesSummary");

  const ruleDigitsEl = document.getElementById("ruleDigits");
  const ruleSymbolsEl = document.getElementById("ruleSymbols");
  const ruleUmlautsEl = document.getElementById("ruleUmlauts");
  const ruleSyllablesEl = document.getElementById("ruleSyllables");
  const ruleSlangEl = document.getElementById("ruleSlang");
  const ruleMixedCaseEl = document.getElementById("ruleMixedCase");

  const intensityRangeEl = document.getElementById("intensityRange");
  const intensityValueEl = document.getElementById("intensityValue");

  const copyOutputBtn = document.getElementById("copyOutputBtn");
  const copyIconEl = document.getElementById("copyIcon");
  const copyLabelEl = document.getElementById("copyLabel");
  const sampleBtn = document.getElementById("sampleBtn");
  const clearInputBtn = document.getElementById("clearInputBtn");
  const resetRulesBtn = document.getElementById("resetRulesBtn");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIconEl = document.getElementById("themeIcon");
  const themeLabelEl = document.getElementById("themeLabel");

  const toastEl = document.getElementById("copyToast");
  const toastInstance = toastEl && window.bootstrap ? new window.bootstrap.Toast(toastEl, { delay: 2200 }) : null;

  // Mappings
  const DIGIT_MAP = {
    a: "4",
    e: "3",
    i: "1",
    l: "1",
    o: "0",
    s: "5",
    t: "7",
    z: "2"
  };

  // Symbole & ASCII-Varianten (werden genutzt, wenn "Symbole & ASCII" aktiv ist)
  const SYMBOL_PRIMARY_MAP = {
    a: "@",
    b: "|3",
    c: "<",
    h: "#",
    k: "|<",
    m: "/\\/\\",
    s: "$",
    v: "\\/",
    w: "\\/\\/"
  };

  // Falls Ziffern UND Symbole gleichzeitig aktiv sind, können bestimmte Zeichen zwischen Ziffer & Symbol wechseln
  const SYMBOL_ALT_MAP = {
    a: "@",
    e: "€",
    o: "()",
    s: "$",
    t: "+",
    x: "><"
  };

  const UMLAUT_MAP = {
    "ä": "43",
    "ö": "03",
    "ü": "|_|",
    "ß": "$5"
  };

  const WORD_REPLACEMENTS = [
    { pattern: /\belite\b/gi, replacement: "1337" },
    { pattern: /\bhacker\b/gi, replacement: "h4ck3r" },
    { pattern: /\bnoob\b/gi, replacement: "n00b" },
    { pattern: /\bnacht\b/gi, replacement: "n8" },
    { pattern: /\bfor\b/gi, replacement: "4" },
    { pattern: /\b(to|too)\b/gi, replacement: "2" },
    { pattern: /\bate\b/gi, replacement: "8" }
  ];

  const SLANG_WORDS = [
    { pattern: /\bpwned\b/gi, replacement: "pwn3d" },
    { pattern: /\bpwn\b/gi, replacement: "pwn3d" },
    { pattern: /\bawesome\b/gi, replacement: "4w350m3" },
    { pattern: /\bserver\b/gi, replacement: "53rv0r" }
  ];

  const SAMPLES = [
    "ansible automatisiert server und playbooks fuer elite admins.",
    "Hallo Welt! Heute Nacht spielen wir bis zum Ende.",
    "Code, Kaffee, Linux und ein starkes Passwort gehoeren zusammen."
  ];
  let sampleIndex = 0;
  let minimalPresetActive = false;

  // Deterministic pseudo-random helper based on index & char so live typing doesn't flicker wildly
  function shouldApply(index, intensityPercent) {
    if (intensityPercent >= 100) return true;
    const hash = ((index * 2654435761) >>> 0) % 100;
    return hash < intensityPercent;
  }

  function applyCase(str, index, mixedCase) {
    if (!mixedCase || !str) return str;
    return str
      .split("")
      .map((ch, i) => {
        if (!/[a-zA-Z]/.test(ch)) return ch;
        return (index + i) % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase();
      })
      .join("");
  }

  function transformText(rawText, options) {
    if (!rawText) return "";

    let text = rawText;

    // 1. Wort- & Silbenersetzungen (falls aktiviert)
    if (options.syllables) {
      for (const item of WORD_REPLACEMENTS) {
        text = text.replace(item.pattern, (match) =>
          shouldApply(match.length + text.length, options.intensity) ? item.replacement : match
        );
      }
    }

    // 2. Slang-Wörter & Endungen (falls aktiviert)
    if (options.slang) {
      for (const item of SLANG_WORDS) {
        text = text.replace(item.pattern, (match) =>
          shouldApply(match.length + 7, options.intensity) ? item.replacement : match
        );
      }
      // Typische -er Endung am Wortende -> -0r
      text = text.replace(/([a-zA-Z]{2,})er\b/gi, (fullMatch, stem) =>
        shouldApply(stem.length + 3, options.intensity) ? `${stem}0r` : fullMatch
      );
    }

    // 3. Zeichenweise Transformation
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const lower = ch.toLowerCase();

      // Umlaute & ß
      if (options.umlauts && Object.prototype.hasOwnProperty.call(UMLAUT_MAP, lower)) {
        if (shouldApply(i, options.intensity)) {
          result += UMLAUT_MAP[lower];
          continue;
        }
      }

      const canUseDigits = options.digits && Object.prototype.hasOwnProperty.call(DIGIT_MAP, lower);
      const canUseSymbolAlt = options.symbols && Object.prototype.hasOwnProperty.call(SYMBOL_ALT_MAP, lower);
      const canUseSymbolPrimary = options.symbols && Object.prototype.hasOwnProperty.call(SYMBOL_PRIMARY_MAP, lower);

      if (shouldApply(i, options.intensity)) {
        if (canUseDigits && canUseSymbolAlt) {
          // Abwechselnd Ziffer und Symbol nutzen
          result += i % 2 === 0 ? DIGIT_MAP[lower] : SYMBOL_ALT_MAP[lower];
          continue;
        }
        if (canUseDigits) {
          result += DIGIT_MAP[lower];
          continue;
        }
        if (canUseSymbolPrimary) {
          result += SYMBOL_PRIMARY_MAP[lower];
          continue;
        }
        if (canUseSymbolAlt) {
          result += SYMBOL_ALT_MAP[lower];
          continue;
        }
      }

      result += applyCase(ch, i, options.mixedCase);
    }

    return result;
  }

  function getCurrentOptions() {
    return {
      digits: ruleDigitsEl.checked,
      symbols: ruleSymbolsEl.checked,
      umlauts: ruleUmlautsEl.checked,
      syllables: ruleSyllablesEl.checked,
      slang: ruleSlangEl.checked,
      mixedCase: ruleMixedCaseEl.checked,
      intensity: Number(intensityRangeEl.value)
    };
  }

  function updateStats(text, targetEl) {
    const chars = text.length;
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    targetEl.textContent = `${chars} ${chars === 1 ? "Zeichen" : "Zeichen"} · ${words} ${words === 1 ? "Wort" : "Wörter"}`;
  }

  function syncRuleBoxes() {
    document.querySelectorAll(".rule-box").forEach((box) => {
      const checkbox = box.querySelector("input[type='checkbox']");
      if (checkbox) {
        box.classList.toggle("is-active", checkbox.checked);
      }
    });

    const activeNames = [];
    if (ruleDigitsEl.checked) activeNames.push("Ziffern");
    if (ruleSymbolsEl.checked) activeNames.push("Symbole");
    if (ruleUmlautsEl.checked) activeNames.push("Umlaute & ß");
    if (ruleSyllablesEl.checked) activeNames.push("Silben");
    if (ruleSlangEl.checked) activeNames.push("Slang");
    if (ruleMixedCaseEl.checked) activeNames.push("MixedCase");

    activeRulesSummaryEl.textContent =
      activeNames.length > 0 ? `Aktive Regeln: ${activeNames.join(", ")}` : "Keine Regel aktiv (Originaltext)";
  }

  function render() {
    const opts = getCurrentOptions();
    intensityValueEl.textContent = `${opts.intensity}%`;
    syncRuleBoxes();

    const raw = inputEl.value;
    const converted = minimalPresetActive
      ? raw.replace(/[eE]/g, "3")
      : transformText(raw, opts);
    outputEl.value = converted;

    updateStats(raw, inputStatsEl);
    updateStats(converted, outputStatsEl);
    if (minimalPresetActive) {
      activeRulesSummaryEl.textContent = "Preset: Minimal (nur E → 3)";
    }
  }

  function applyPreset(presetName) {
    const presets = {
      minimal: { digits: false, symbols: false, umlauts: false, syllables: false, slang: false, mixedCase: false, intensity: 100 },
      classic: { digits: true, symbols: false, umlauts: true, syllables: false, slang: false, mixedCase: false, intensity: 100 },
      hacker: { digits: true, symbols: true, umlauts: true, syllables: true, slang: false, mixedCase: false, intensity: 100 },
      max: { digits: true, symbols: true, umlauts: true, syllables: true, slang: true, mixedCase: true, intensity: 100 }
    };

    if (presetName === "minimal") {
      // Keep the minimal transformation active as the input changes.
      minimalPresetActive = true;
      ruleDigitsEl.checked = true;
      ruleSymbolsEl.checked = false;
      ruleUmlautsEl.checked = false;
      ruleSyllablesEl.checked = false;
      ruleSlangEl.checked = false;
      ruleMixedCaseEl.checked = false;
      intensityRangeEl.value = 100;

      render();
      return;
    }

    const cfg = presets[presetName];
    if (!cfg) return;
    minimalPresetActive = false;

    ruleDigitsEl.checked = cfg.digits;
    ruleSymbolsEl.checked = cfg.symbols;
    ruleUmlautsEl.checked = cfg.umlauts;
    ruleSyllablesEl.checked = cfg.syllables;
    ruleSlangEl.checked = cfg.slang;
    ruleMixedCaseEl.checked = cfg.mixedCase;
    intensityRangeEl.value = cfg.intensity;

    render();
  }

  // Event Listeners
  [
    ruleDigitsEl,
    ruleSymbolsEl,
    ruleUmlautsEl,
    ruleSyllablesEl,
    ruleSlangEl,
    ruleMixedCaseEl,
    intensityRangeEl
  ].forEach((el) => {
    const update = () => {
      minimalPresetActive = false;
      render();
    };
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });

  // Typing changes the text, but should not discard the selected Minimal preset.
  inputEl.addEventListener("input", render);
  inputEl.addEventListener("change", render);

  document.querySelectorAll("[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
  });

  resetRulesBtn.addEventListener("click", () => {
    minimalPresetActive = false;
    ruleDigitsEl.checked = true;
    ruleSymbolsEl.checked = false;
    ruleUmlautsEl.checked = true;
    ruleSyllablesEl.checked = false;
    ruleSlangEl.checked = false;
    ruleMixedCaseEl.checked = false;
    intensityRangeEl.value = 100;
    render();
  });

  sampleBtn.addEventListener("click", () => {
    sampleIndex = (sampleIndex + 1) % SAMPLES.length;
    inputEl.value = SAMPLES[sampleIndex];
    render();
  });

  clearInputBtn.addEventListener("click", () => {
    inputEl.value = "";
    render();
    inputEl.focus();
  });

  copyOutputBtn.addEventListener("click", async () => {
    const text = outputEl.value;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      outputEl.select();
      document.execCommand("copy");
    }

    if (toastInstance) {
      toastInstance.show();
    }

    copyIconEl.className = "bi bi-check2 me-1";
    copyLabelEl.textContent = "Kopiert";
    setTimeout(() => {
      copyIconEl.className = "bi bi-clipboard me-1";
      copyLabelEl.textContent = "Kopieren";
    }, 1600);
  });

  // Theme Switcher (Dark / Light)
  function setTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("leetforge-theme", theme);
    if (theme === "dark") {
      themeIconEl.className = "bi bi-sun-fill";
      themeLabelEl.textContent = "Light";
    } else {
      themeIconEl.className = "bi bi-moon-stars-fill";
      themeLabelEl.textContent = "Dark";
    }
  }

  themeToggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-bs-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });

  const savedTheme = localStorage.getItem("leetforge-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    setTheme(savedTheme);
  }

  // Initial Render
  render();
})();
