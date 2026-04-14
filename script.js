// Progressive enhancement only:
// - mobile navigation
// - gallery modal
// - AI teaser interaction
// - multi-step consultation form
// - tracking and webhook-ready hooks

(() => {
  const root = document.documentElement;
  root.classList.add("js");

  const body = document.body;
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const siteNav = document.getElementById("site-nav");
  const langButtons = Array.from(document.querySelectorAll("[data-lang-switch]"));

  const trackEvent = (name, detail = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...detail });
    window.dispatchEvent(new CustomEvent(name, { detail }));
  };

  const updateHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      body.classList.toggle("nav-open", isOpen);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        body.classList.remove("nav-open");
      });
    });
  }

  const setLanguage = (lang) => {
    body.classList.remove("lang-en", "lang-es");
    body.classList.add(`lang-${lang}`);
    langButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.langSwitch === lang);
    });
  };

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.langSwitch);
    });
  });

  setLanguage(body.classList.contains("lang-es") ? "es" : "en");

  document.querySelectorAll("[data-track]").forEach((element) => {
    element.addEventListener("click", () => {
      trackEvent(element.dataset.track, {
        label: element.textContent.trim()
      });
    });
  });

  const modal = document.querySelector(".project-modal");
  const modalImage = document.querySelector("[data-modal-image]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalSubtitle = document.querySelector("[data-modal-subtitle]");
  const modalStory = document.querySelector("[data-modal-story]");
  const modalBefore = document.querySelector("[data-modal-before]");
  const modalAfter = document.querySelector("[data-modal-after]");
  let previousFocus = null;

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    body.classList.remove("modal-open");
    if (previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  };

  if (modal) {
    document.querySelectorAll("[data-gallery-card]").forEach((card) => {
      card.addEventListener("click", () => {
        previousFocus = document.activeElement;
        modalTitle.textContent = card.dataset.title || "";
        modalSubtitle.textContent = card.dataset.subtitle || "";
        modalStory.textContent = card.dataset.story || "";
        modalBefore.textContent = card.dataset.before || "";
        modalAfter.textContent = card.dataset.after || "";
        modalImage.src = card.dataset.image || "";
        modalImage.alt = card.dataset.title || "Project image";
        modal.hidden = false;
        body.classList.add("modal-open");
        trackEvent("ironwood_project_story_open", {
          project: card.dataset.title || ""
        });
      });
    });

    modal.querySelectorAll("[data-modal-close]").forEach((element) => {
      element.addEventListener("click", closeModal);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });
  }

  const aiStatus = document.querySelector("[data-ai-status]");
  const aiPrompt = document.getElementById("ai-prompt");
  const aiPreviews = Array.from(document.querySelectorAll("[data-ai-preview]"));
  const aiChips = document.querySelectorAll("[data-ai-chip]");
  const aiGenerateBtn = document.querySelector("[data-ai-generate]");
  const aiUploadInput = document.querySelector("[data-ai-upload]");
  const aiUploadArea = document.getElementById("ai-upload-area");
  const aiUploadText = document.querySelector("[data-ai-upload-text]");
  const aiUploadRemove = document.querySelector("[data-ai-upload-remove]");

  const aiStates = [
    {
      en: "Generating pergola-led direction...",
      es: "Generando propuesta con pérgola...",
      prompt: "Create a California backyard concept with charcoal pergola framing, warm lighting, integrated pavers and a more premium hospitality flow."
    },
    {
      en: "Trying deck-first hospitality layout...",
      es: "Probando layout enfocado en deck...",
      prompt: "Reframe the backyard around a larger deck platform, floating lounge arrangement and cleaner circulation to the garden edge."
    },
    {
      en: "Testing poolside resort atmosphere...",
      es: "Probando atmósfera de piscina tipo resort...",
      prompt: "Build a poolside concept with large-format pavers, integrated planters, privacy screening and a resort-style hospitality mood."
    }
  ];

  if (aiUploadInput && aiUploadArea && aiUploadText && aiUploadRemove) {
    aiUploadInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        aiUploadArea.classList.add("has-file");
        aiUploadRemove.hidden = false;
        const fileName = file.name.length > 20 ? file.name.substring(0, 17) + "..." : file.name;
        aiUploadText.innerHTML = `<span>${fileName}</span>`;
      }
    });

    aiUploadRemove.addEventListener("click", (e) => {
      e.stopPropagation();
      aiUploadInput.value = "";
      aiUploadArea.classList.remove("has-file");
      aiUploadRemove.hidden = true;
      const isEs = document.body.classList.contains("lang-es");
      aiUploadText.innerHTML = isEs 
        ? '<span class="lang-en">Upload reference image</span><span class="lang-es">Sube imagen de referencia</span>'
        : '<span class="lang-en">Upload reference image</span><span class="lang-es">Sube imagen de referencia</span>';
    });
  }

  if (aiChips) {
    aiChips.forEach(chip => {
      chip.addEventListener("click", () => {
        chip.classList.toggle("is-active");
      });
    });
  }

  if (aiGenerateBtn && aiStatus && aiPrompt) {
    aiGenerateBtn.addEventListener("click", () => {
      const isEs = document.body.classList.contains("lang-es");
      const randomState = aiStates[Math.floor(Math.random() * aiStates.length)];
      
      aiGenerateBtn.disabled = true;
      aiStatus.textContent = isEs ? "Procesando..." : "Processing...";
      
      setTimeout(() => {
        aiStatus.textContent = isEs ? randomState.es : randomState.en;
        aiPrompt.value = randomState.prompt;
        
        const randomIndex = Math.floor(Math.random() * aiPreviews.length);
        aiPreviews.forEach((card, index) => {
          card.classList.toggle("ai-preview-card--active", index === randomIndex);
        });

        aiGenerateBtn.disabled = false;
        
        trackEvent("ironwood_ai_generate_click", {
          prompt: randomState.prompt
        });
      }, 1500);
    });
  }

  const form = document.getElementById("consultation-form");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll("[data-form-step]"));
  const status = form.querySelector("[data-form-status]");
  const progressFill = form.querySelector("[data-progress-fill]");
  const progressLabel = form.querySelector("[data-progress-label]");
  const photoInput = form.querySelector("[data-photo-input]");
  const photoHelper = form.querySelector("[data-photo-helper]");
  const hiddenFields = {
    utm_source: form.querySelector('input[name="utm_source"]'),
    utm_medium: form.querySelector('input[name="utm_medium"]'),
    utm_campaign: form.querySelector('input[name="utm_campaign"]'),
    gclid: form.querySelector('input[name="gclid"]'),
    lead_priority: form.querySelector('input[name="lead_priority"]')
  };

  const searchParams = new URLSearchParams(window.location.search);
  Object.entries(hiddenFields).forEach(([name, field]) => {
    if (!field || name === "lead_priority") return;
    field.value = searchParams.get(name) || "";
  });

  let currentStep = 0;
  form.classList.add("is-enhanced");

  const setStatus = (message, type = "") => {
    if (!status) return;
    status.textContent = message;
    status.classList.remove("is-success", "is-error");
    if (type) {
      status.classList.add(type === "success" ? "is-success" : "is-error");
    }
  };

  const getPriority = () => {
    const project = form.querySelector('input[name="project_type"]:checked')?.value || "";
    const budget = form.querySelector('input[name="budget"]:checked')?.value || "";

    if (budget.includes("$50k") || budget.includes("$25k")) {
      if (project.toLowerCase().includes("full") || project.toLowerCase().includes("outdoor")) {
        return "high";
      }
      return "medium";
    }

    return budget ? "standard" : "";
  };

  const updateProgress = () => {
    const total = steps.length;
    const value = ((currentStep + 1) / total) * 100;

    if (progressFill) progressFill.style.width = `${value}%`;
    if (progressLabel) progressLabel.textContent = `Step ${currentStep + 1} of ${total}`;
  };

  const showStep = (index) => {
    currentStep = index;
    steps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex === index);
    });
    updateProgress();
    setStatus("");
  };

  const validateStep = (step) => {
    const fields = Array.from(step.querySelectorAll("input, textarea"));

    for (const field of fields) {
      if (field.type === "radio") continue;
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }

    const radioGroups = [...new Set(
      Array.from(step.querySelectorAll('input[type="radio"][required]')).map((radio) => radio.name)
    )];

    for (const groupName of radioGroups) {
      const checked = form.querySelector(`input[name="${groupName}"]:checked`);
      if (!checked) {
        setStatus("Please select one option before continuing. / Selecciona una opcion antes de continuar.", "error");
        return false;
      }
    }

    if (photoInput && step.contains(photoInput) && photoInput.files.length > 2) {
      setStatus("You can upload up to 2 images only. / Solo puedes subir hasta 2 imagenes.", "error");
      return false;
    }

    return true;
  };

  form.querySelectorAll("[data-step-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const current = steps[currentStep];
      if (!validateStep(current)) return;

      trackEvent("ironwood_form_step_complete", {
        step: currentStep + 1
      });

      showStep(Math.min(currentStep + 1, steps.length - 1));
    });
  });

  form.querySelectorAll("[data-step-back]").forEach((button) => {
    button.addEventListener("click", () => {
      showStep(Math.max(currentStep - 1, 0));
    });
  });

  if (photoInput && photoHelper) {
    photoInput.addEventListener("change", () => {
      const count = photoInput.files.length;
      if (!count) {
        photoHelper.textContent = "No files selected yet.";
        return;
      }

      if (count > 2) {
        photoHelper.textContent = "Only 2 files are allowed. / Solo se permiten 2 archivos.";
        setStatus("You can upload up to 2 images only. / Solo puedes subir hasta 2 imagenes.", "error");
        return;
      }

      photoHelper.textContent = `${count} file${count > 1 ? "s" : ""} selected.`;
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const current = steps[currentStep];
    if (!validateStep(current)) return;

    hiddenFields.lead_priority.value = getPriority();

    const endpoint = form.dataset.webhookEndpoint;
    const formData = new FormData(form);

    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error("Webhook rejected the request");
        }
      }

      form.reset();
      if (photoHelper) photoHelper.textContent = "No files selected yet.";
      showStep(0);
      setStatus(
        "Thanks. The consultation request is ready for follow-up. / Gracias. La solicitud de consulta quedo lista para seguimiento.",
        "success"
      );
      trackEvent("ironwood_lead_submit", {
        priority: hiddenFields.lead_priority.value || "unknown"
      });
    } catch (error) {
      console.error(error);
      setStatus(
        "The request could not be sent right now. Connect the webhook to enable live delivery. / No se pudo enviar en este momento. Conecta el webhook para habilitar el envio real.",
        "error"
      );
    }
  });

  showStep(0);
})();
