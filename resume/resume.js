const FONT_URL =
  "https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/cormorantgaramond/CormorantGaramond-Regular.json";
const FONT_IMAGE =
  "https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/cormorantgaramond/CormorantGaramond-Regular.png";

let uiAudioCtx = null;

function getUiAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return null;
  }
  if (!uiAudioCtx) {
    uiAudioCtx = new AudioCtx();
  }
  return uiAudioCtx;
}

function playUiSound(kind) {
  const ctx = getUiAudioContext();
  if (!ctx) {
    return;
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    let freq;
    let duration;
    if (kind === "hover") {
      osc.type = "sine";
      freq = 720;
      duration = 0.1;
    } else {
      osc.type = "triangle";
      freq = kind === "carousel" ? 400 : 340;
      duration = 0.22;
    }
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch (_) {
    /* ignore */
  }
}

document.body.addEventListener(
  "click",
  () => {
    const ctx = getUiAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  },
  { once: true },
);

const resumeWorld = document.getElementById("resumeWorld");
const sectionIndicator = document.getElementById("sectionIndicator");
const panelKicker = document.getElementById("panelKicker");
const panelTitle = document.getElementById("panelTitle");
const panelContent = document.getElementById("panelContent");
const detailsPanel = document.getElementById("detailsPanel");
const navButtons = [...document.querySelectorAll(".nav-chip")];
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const bootScreen = document.getElementById("bootScreen");

const sections = [
  { id: "entrance", label: "Arrival", angle: 0 },
  { id: "experience", label: "Experience", angle: 72 },
  { id: "skills", label: "Skills", angle: 144 },
  { id: "education", label: "Education", angle: 216 },
  { id: "contacts", label: "Contacts", angle: 288 },
];

const accentBySection = {
  entrance: { accent: "#7adfff", edge: "#c7efff" },
  experience: { accent: "#7adfff", edge: "#c7efff" },
  skills: { accent: "#95a7ff", edge: "#c8d6ff" },
  education: { accent: "#95a7ff", edge: "#c8d6ff" },
  contacts: { accent: "#95a7ff", edge: "#c8d6ff" },
};

let resumeData = null;
let currentSectionIndex = 0;
let carouselRoot = null;
const selectorNodes = new Map();

function createElement(tag, attrs = {}) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
  return el;
}

function createText(attrs = {}) {
  return createElement("a-text", {
    shader: "msdf",
    font: FONT_URL,
    "font-image": FONT_IMAGE,
    ...attrs,
  });
}

function badgeRow(items) {
  return `<div class="badge-row">${items
    .map((item) => `<span class="detail-badge">${item}</span>`)
    .join("")}</div>`;
}

function addEnvironment() {
  resumeWorld.appendChild(
    createElement("a-light", {
      type: "ambient",
      intensity: "0.34",
      color: "#d6e8ff",
    }),
  );

  resumeWorld.appendChild(
    createElement("a-light", {
      type: "directional",
      intensity: "0.42",
      color: "#7dd7ff",
      position: "-3 8 3",
    }),
  );

  resumeWorld.appendChild(
    createElement("a-light", {
      type: "directional",
      intensity: "0.18",
      color: "#95a7ff",
      position: "4 5 -4",
    }),
  );

  resumeWorld.appendChild(
    createElement("a-cylinder", {
      position: "0 -0.18 0",
      radius: "9.1",
      height: "0.34",
      color: "#040a13",
      material: "metalness: 0.08; roughness: 0.9",
    }),
  );

  resumeWorld.appendChild(
    createElement("a-ring", {
      position: "0 0.01 0",
      rotation: "-90 0 0",
      "radius-inner": "5.2",
      "radius-outer": "6.1",
      color: "#071120",
      material:
        "emissive: #3cbcff; emissiveIntensity: 0.24; opacity: 0.78; transparent: true",
    }),
  );

  resumeWorld.appendChild(
    createElement("a-ring", {
      position: "0 0.02 0",
      rotation: "-90 0 0",
      "radius-inner": "1.9",
      "radius-outer": "2.04",
      color: "#c7efff",
      material:
        "emissive: #7adfff; emissiveIntensity: 0.72; opacity: 0.84; transparent: true",
    }),
  );

  resumeWorld.appendChild(
    createElement("a-ring", {
      position: "0 2.64 -1.1",
      rotation: "-90 0 0",
      "radius-inner": "1.95",
      "radius-outer": "2.14",
      color: "#9de7ff",
      material:
        "transparent: true; opacity: 0.3; emissive: #7adfff; emissiveIntensity: 0.38",
    }),
  );

  resumeWorld.appendChild(
    createText({
      value: "Resume Carousel",
      position: "0 4.18 -2.4",
      align: "center",
      color: "#ecf6ff",
      width: "6.4",
      material: "emissive: #d8f2ff; emissiveIntensity: 0.22",
    }),
  );

  resumeWorld.appendChild(
    createText({
      value: "The archive rotates, the viewer stays centered.",
      position: "0 3.58 -2.3",
      align: "center",
      color: "#a9c9df",
      width: "4.2",
    }),
  );
}

function addHomePortal() {
  const portal = createElement("a-entity", {
    position: "-3.8 1.38 -2.35",
    rotation: "0 24 0",
  });

  const ring = createElement("a-ring", {
    position: "0 0 0.12",
    rotation: "-90 0 0",
    "radius-inner": "0.52",
    "radius-outer": "0.72",
    color: "#c7efff",
    material:
      "transparent: true; opacity: 0.42; emissive: #7adfff; emissiveIntensity: 0.44",
  });
  portal.appendChild(ring);

  portal.appendChild(
    createElement("a-plane", {
      position: "0 0 0.04",
      width: "0.92",
      height: "1.46",
      color: "#06111d",
      material:
        "transparent: true; opacity: 0.68; emissive: #ba0c2f; emissiveIntensity: 0.28",
    }),
  );

  const hitbox = createElement("a-plane", {
    class: "clickable",
    position: "0 0 0.08",
    width: "0.84",
    height: "1.3",
    material: "transparent: true; opacity: 0.001",
  });
  portal.appendChild(hitbox);

  portal.appendChild(
    createText({
      value: "Home",
      position: "0 -1.08 0.12",
      align: "center",
      color: "#ecf6ff",
      width: "1.9",
    }),
  );

  portal.appendChild(
    createText({
      value: "Return portal",
      position: "0 -1.34 0.12",
      align: "center",
      color: "#a9c9df",
      width: "1.4",
    }),
  );

  hitbox.addEventListener("mouseenter", () => {
    playUiSound("hover");
    portal.setAttribute(
      "animation__hover",
      "property: scale; to: 1.05 1.05 1.05; dur: 220; easing: easeInOutCubic",
    );
    ring.setAttribute("material", "emissiveIntensity", 0.8);
  });

  hitbox.addEventListener("mouseleave", () => {
    portal.setAttribute(
      "animation__hover",
      "property: scale; to: 1 1 1; dur: 220; easing: easeInOutCubic",
    );
    ring.setAttribute("material", "emissiveIntensity", 0.44);
  });

  hitbox.addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  resumeWorld.appendChild(portal);
}

function createSelectorNode(section, index) {
  const selector = createElement("a-entity", {
    position: `${-2.7 + index * 1.35} 0.86 -2.15`,
  });

  const accent = accentBySection[section.id];
  const ring = createElement("a-ring", {
    "radius-inner": "0.12",
    "radius-outer": "0.18",
    color: accent.edge,
    material: `transparent: true; opacity: 0.34; emissive: ${accent.accent}; emissiveIntensity: 0.38`,
  });
  selector.appendChild(ring);

  selector.appendChild(
    createText({
      value: section.label,
      position: "0 -0.34 0.02",
      align: "center",
      color: "#a9c9df",
      width: "1.4",
    }),
  );

  const hitbox = createElement("a-plane", {
    class: "clickable",
    position: "0 0 0.02",
    width: "0.5",
    height: "0.5",
    material: "transparent: true; opacity: 0.001",
  });
  selector.appendChild(hitbox);

  hitbox.addEventListener("click", () => {
    transitionToSection(section.id);
  });

  hitbox.addEventListener("mouseenter", () => {
    playUiSound("hover");
    selector.setAttribute(
      "animation__hover",
      "property: scale; to: 1.08 1.08 1.08; dur: 180; easing: easeInOutCubic",
    );
  });

  hitbox.addEventListener("mouseleave", () => {
    selector.setAttribute(
      "animation__hover",
      "property: scale; to: 1 1 1; dur: 180; easing: easeInOutCubic",
    );
  });

  selectorNodes.set(section.id, { selector, ring });
  resumeWorld.appendChild(selector);
}

function createSectionWrapper(section) {
  const wrapper = createElement("a-entity", {
    rotation: `0 ${section.angle} 0`,
  });

  const anchor = createElement("a-entity", {
    position: "0 0 -8.2",
  });
  wrapper.appendChild(anchor);
  carouselRoot.appendChild(wrapper);
  return anchor;
}

function createSectionTitle(anchor, title, subtitle) {
  anchor.appendChild(
    createText({
      value: title,
      position: "0 5.2 0.06",
      align: "center",
      color: "#ecf6ff",
      width: "6.2",
      material: "emissive: #d8f2ff; emissiveIntensity: 0.18",
    }),
  );

  anchor.appendChild(
    createText({
      value: subtitle,
      position: "0 4.58 0.08",
      align: "center",
      color: "#a9c9df",
      width: "4.2",
    }),
  );
}

function buildEntranceSection() {
  const anchor = createSectionWrapper(sections[0]);
  createSectionTitle(
    anchor,
    "Arrival",
    "A professional overview staged as a calm focal monument",
  );

  anchor.appendChild(
    createElement("a-box", {
      position: "0 2.36 -0.28",
      width: "5.5",
      height: "4.4",
      depth: "0.22",
      color: "#050d16",
      material:
        "opacity: 0.56; transparent: true; emissive: #071829; emissiveIntensity: 0.18",
    }),
  );

  anchor.appendChild(
    createElement("a-ring", {
      position: "0 2.52 -0.08",
      rotation: "-90 0 0",
      "radius-inner": "1.38",
      "radius-outer": "1.58",
      color: "#9de7ff",
      material:
        "transparent: true; opacity: 0.32; emissive: #7adfff; emissiveIntensity: 0.4",
    }),
  );

  anchor.appendChild(
    createText({
      value: resumeData.professional.name,
      position: "0 3.46 0.04",
      align: "center",
      color: "#ecf6ff",
      width: "6.2",
      material: "emissive: #d8f2ff; emissiveIntensity: 0.2",
    }),
  );

  anchor.appendChild(
    createText({
      value: resumeData.professional.summary,
      position: "0 1.98 0.08",
      align: "center",
      color: "#b2cddd",
      width: "4.8",
      wrapCount: "40",
    }),
  );
}

function buildExperienceSection() {
  const anchor = createSectionWrapper(sections[1]);
  createSectionTitle(
    anchor,
    "Experience",
    "Three anchored role stations aligned for a fixed viewer",
  );

  const xPositions = [-2.5, 0, 2.5];
  resumeData.experience.forEach((item, index) => {
    const accent =
      index === 2 ? "#95a7ff" : index === 1 ? "#c7efff" : "#7adfff";
    const card = createElement("a-entity", {
      position: `${xPositions[index]} 0 0`,
    });

    card.appendChild(
      createElement("a-box", {
        position: "0 2.4 -0.2",
        width: "2.4",
        height: "3.3",
        depth: "0.18",
        color: "#050d16",
        material:
          "opacity: 0.56; transparent: true; emissive: #071829; emissiveIntensity: 0.16",
      }),
    );

    card.appendChild(
      createElement("a-ring", {
        position: "0 2.16 -0.06",
        rotation: "-90 0 0",
        "radius-inner": "0.78",
        "radius-outer": "0.96",
        color: accent,
        material: `transparent: true; opacity: 0.3; emissive: ${accent}; emissiveIntensity: 0.36`,
      }),
    );

    card.appendChild(
      createText({
        value: item.title,
        position: "0 3.02 0.04",
        align: "center",
        color: "#ecf6ff",
        width: "2",
      }),
    );

    card.appendChild(
      createText({
        value: item.company,
        position: "0 2.5 0.06",
        align: "center",
        color: accent,
        width: "2.3",
      }),
    );

    card.appendChild(
      createText({
        value: item.duration,
        position: "0 2.04 0.08",
        align: "center",
        color: "#b9d8f1",
        width: "1.4",
      }),
    );

    card.appendChild(
      createText({
        value: item.description,
        position: "0 1.46 0.08",
        align: "center",
        color: "#a9c9df",
        width: "2.15",
        wrapCount: "26",
      }),
    );

    anchor.appendChild(card);
  });
}

function buildSkillsSection() {
  const anchor = createSectionWrapper(sections[2]);
  createSectionTitle(
    anchor,
    "Skills",
    "A constellation of capability clusters around a central core",
  );

  anchor.appendChild(
    createElement("a-sphere", {
      position: "0 2.34 0",
      radius: "0.44",
      color: "#c7efff",
      material: "emissive: #7adfff; emissiveIntensity: 0.92",
      animation:
        "property: scale; from: 1 1 1; to: 1.12 1.12 1.12; dur: 2600; easing: easeInOutSine; dir: alternate; loop: true",
    }),
  );

  const positions = [
    { x: 3.4, y: 3.1, color: "#7adfff" },
    { x: -3.4, y: 3.1, color: "#95a7ff" },
    { x: 3.4, y: 1.3, color: "#c7efff" },
    { x: -3.4, y: 1.3, color: "#7adfff" },
  ];

  Object.entries(resumeData.skills).forEach(([category, skills], index) => {
    const pos = positions[index];
    if (!pos) {
      return;
    }

    anchor.appendChild(
      createElement("a-line", {
        start: "0 2.34 0",
        end: `${pos.x} ${pos.y} 0`,
        color: pos.color,
        opacity: "0.5",
      }),
    );

    const card = createElement("a-entity", {
      position: `${pos.x} ${pos.y} 0`,
    });

    card.appendChild(
      createElement("a-box", {
        position: "0 0 0",
        width: "2.5",
        height: "1.7",
        depth: "0.16",
        color: "#050d16",
        material:
          "opacity: 0.56; transparent: true; emissive: #071829; emissiveIntensity: 0.16",
      }),
    );

    card.appendChild(
      createText({
        value: category,
        position: "0 0.5 0.06",
        align: "center",
        color: "#ecf6ff",
        width: "2.9",
      }),
    );

    card.appendChild(
      createText({
        value: skills
          .slice(0, 3)
          .map((skill) => `${skill.name} ${"|".repeat(skill.level)}`)
          .join("\n"),
        position: "0 -0.16 0.08",
        align: "center",
        color: pos.color,
        width: "2.2",
        wrapCount: "28",
      }),
    );

    anchor.appendChild(card);
  });
}

function buildEducationSection() {
  const anchor = createSectionWrapper(sections[3]);
  createSectionTitle(
    anchor,
    "Education",
    "Academic milestones and scholarship support in a quieter finale",
  );

  const education = resumeData.education[0] || {
    institution: "Education data unavailable",
    degree: "Serve over HTTP",
    field: "Resume archive",
    graduation: "Unavailable",
    highlights: ["Resume data could not be loaded."],
  };
  const certification = resumeData.certifications[0] || {
    name: "Recognition unavailable",
    issuer: "Serve over HTTP",
    date: "Unavailable",
    description: "Resume data could not be loaded.",
  };

  anchor.appendChild(
    createElement("a-box", {
      position: "0 2.34 -0.24",
      width: "4.5",
      height: "4.2",
      depth: "0.18",
      color: "#050d16",
      material:
        "opacity: 0.56; transparent: true; emissive: #071829; emissiveIntensity: 0.16",
    }),
  );

  anchor.appendChild(
    createElement("a-ring", {
      position: "0 2.56 -0.08",
      rotation: "-90 0 0",
      "radius-inner": "1.22",
      "radius-outer": "1.42",
      color: "#c8d6ff",
      material:
        "transparent: true; opacity: 0.3; emissive: #95a7ff; emissiveIntensity: 0.36",
    }),
  );

  anchor.appendChild(
    createText({
      value: education.institution,
      position: "0 3.42 0.04",
      align: "center",
      color: "#ecf6ff",
      width: "5.2",
    }),
  );

  anchor.appendChild(
    createText({
      value: `${education.degree} in ${education.field}`,
      position: "0 2.84 0.06",
      align: "center",
      color: "#7adfff",
      width: "3.8",
    }),
  );

  anchor.appendChild(
    createText({
      value: education.graduation,
      position: "0 2.34 0.08",
      align: "center",
      color: "#95a7ff",
      width: "1.7",
    }),
  );

  anchor.appendChild(
    createText({
      value: education.highlights.join("\n"),
      position: "0 1.6 0.08",
      align: "center",
      color: "#a9c9df",
      width: "4.1",
      wrapCount: "38",
    }),
  );
}

function buildContactsSection() {
  const anchor = createSectionWrapper(sections[4]);
  createSectionTitle(anchor, "Contacts", "Reach out through any channel");

  const contacts = resumeData.contact || [];
  const accent = accentBySection.contacts?.accent || "#95a7ff";
  const edge = accentBySection.contacts?.edge || "#c8d6ff";

  anchor.appendChild(
    createElement("a-box", {
      position: "0 2.05 -0.24",
      width: "5.2",
      height: "3.8",
      depth: "0.18",
      color: "#050d16",
      material:
        "opacity: 0.56; transparent: true; emissive: #071829; emissiveIntensity: 0.16",
    }),
  );

  if (contacts.length === 0) {
    anchor.appendChild(
      createText({
        value: "No contact data available.",
        position: "0 2.05 0.1",
        align: "center",
        color: "#a9c9df",
        width: "4.4",
        wrapCount: "26",
      }),
    );
    return;
  }

  const maxItems = Math.min(contacts.length, 3);

  for (let idx = 0; idx < maxItems; idx++) {
    const c = contacts[idx];
    const y = 2.55 - idx * 0.78;

    // Card base (rendered slightly “below” the texts)
    const cardBox = createElement("a-box", {
      position: `0 ${y - 1.7} 0`,
      width: "4.9",
      height: "0.72",
      depth: "0.14",
      color: "#050d16",
      material: `opacity: 0.44; transparent: true; emissive: ${accent}; emissiveIntensity: 0.16`,
    });

    const card = createElement("a-entity", { position: "0 0 0" });
    card.appendChild(cardBox);

    const hitbox = createElement("a-plane", {
      class: "clickable",
      position: `0 ${y - 1.7} 0.08`,
      width: "4.9",
      height: "0.98",
      material: "transparent: true; opacity: 0.001",
    });

    hitbox.addEventListener("mouseenter", () => {
      playUiSound("hover");
      cardBox.setAttribute(
        "material",
        `opacity: 0.62; transparent: true; emissive: ${accent}; emissiveIntensity: 0.22`,
      );
    });
    hitbox.addEventListener("mouseleave", () => {
      cardBox.setAttribute(
        "material",
        `opacity: 0.44; transparent: true; emissive: ${accent}; emissiveIntensity: 0.16`,
      );
    });
    hitbox.addEventListener("click", () => {
      if (c.href) {
        window.open(c.href, "_blank", "noopener,noreferrer");
      }
    });

    card.appendChild(hitbox);

    card.appendChild(
      createText({
        value: c.value,
        position: `0 ${y} 0.12`,
        align: "center",
        color: "#a9c9df",
        width: "4.3",
        wrapCount: "24",
      }),
    );

    anchor.appendChild(card);
  }
}

function buildDetailsMarkup(sectionId) {
  if (sectionId === "experience") {
    return `
      <div class="detail-section">
        <h3>Career Progression</h3>
        ${resumeData.experience
          .map(
            (item) => `
              <article class="detail-block">
                <h4>${item.title}</h4>
                <div class="detail-meta">${item.company} / ${item.duration}</div>
                <p>${item.description}</p>
                <ul class="detail-list">
                  ${item.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}
                </ul>
                ${badgeRow(item.technologies)}
              </article>
            `,
          )
          .join("")}
      </div>
    `;
  }

  if (sectionId === "skills") {
    return `
      <div class="detail-section">
        <h3>Capability Matrix</h3>
        ${Object.entries(resumeData.skills)
          .map(
            ([category, skills]) => `
              <article class="detail-block">
                <h4>${category}</h4>
                ${skills
                  .map(
                    (skill) => `
                      <div class="detail-meter">
                        <span class="meter-label">${skill.name}</span>
                        <span class="meter-bars">${"|".repeat(skill.level)}</span>
                      </div>
                    `,
                  )
                  .join("")}
              </article>
            `,
          )
          .join("")}
      </div>
    `;
  }

  if (sectionId === "education") {
    const education = resumeData.education[0] || {
      institution: "Education data unavailable",
      degree: "Serve over HTTP",
      field: "Resume archive",
      graduation: "Unavailable",
      highlights: ["Resume data could not be loaded."],
    };
    const certification = resumeData.certifications[0] || {
      name: "Recognition unavailable",
      issuer: "Serve over HTTP",
      date: "Unavailable",
      description: "Resume data could not be loaded.",
    };
    return `
      <div class="detail-section">
        <h3>Academic Foundation</h3>
        <article class="detail-block">
          <h4>${education.institution}</h4>
          <div class="detail-meta">${education.degree} / ${education.field}</div>
          <p>${education.graduation}</p>
          <ul class="detail-list">
            ${education.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}
          </ul>
        </article>
        <article class="detail-block">
          <h4>${certification.name}</h4>
          <div class="detail-meta">${certification.issuer} / ${certification.date}</div>
          <p>${certification.description}</p>
        </article>
      </div>
    `;
  }

  if (sectionId === "contacts") {
    const contacts = resumeData.contact || [];
    return `
      <div class="detail-section">
        <h3>My Contacts</h3>
        <article class="detail-block">
          <h4>Get in touch</h4>
          <ul class="detail-list">
            ${contacts
              .slice(0, 6)
              .map(
                (c) =>
                  `<li><span style="color: var(--accent-cyan)">${c.label}:</span> <a href="${c.href}" target="_blank" rel="noreferrer noopener">${c.value}</a></li>`,
              )
              .join("")}
          </ul>
        </article>
      </div>
    `;
  }

  return `
    <div class="detail-section">
      <h3>About This Archive</h3>
      <article class="detail-block">
        <h4>Spatial Resume Format</h4>
        <p>${resumeData.about.journey}</p>
        <p>${resumeData.about.philosophy}</p>
        ${badgeRow(resumeData.about.interests)}
      </article>
    </div>
  `;
}

function updateSelectors(sectionId) {
  selectorNodes.forEach((node, id) => {
    const accent = accentBySection[id];
    const active = id === sectionId;
    node.ring.setAttribute("material", "opacity", active ? 0.74 : 0.34);
    node.ring.setAttribute(
      "material",
      "emissiveIntensity",
      active ? 0.86 : 0.38,
    );
    node.selector.setAttribute(
      "animation__select",
      `property: scale; to: ${active ? "1.12 1.12 1.12" : "1 1 1"}; dur: 220; easing: easeInOutCubic`,
    );
  });
}

function updateUI(sectionId) {
  const sectionInfo = {
    entrance: {
      kicker: "Arrival",
      title: "Professional Summary",
      content:
        "Opening overview: you stay centered while each section turns into view.",
      indicator: "Arrival",
    },
    experience: {
      kicker: "Career",
      title: "Experience Stations",
      content:
        "Roles appear as panels in front of you—no walking between stations.",
      indicator: "Experience",
    },
    skills: {
      kicker: "Capabilities",
      title: "Skill Constellation",
      content:
        "Capabilities cluster around a central core with clear hierarchy.",
      indicator: "Skills",
    },
    education: {
      kicker: "Foundation",
      title: "Education and Recognition",
      content: "Education and recognition in a calmer closing section.",
      indicator: "Education",
    },
    contacts: {
      kicker: "Connect",
      title: "My Contacts",
      content: "Email and links to connect with me.",
      indicator: "Contacts",
    },
  };

  const info = sectionInfo[sectionId];
  panelKicker.textContent = info.kicker;
  panelTitle.textContent = info.title;
  panelContent.textContent = info.content;
  sectionIndicator.textContent = info.indicator;
  detailsPanel.innerHTML = buildDetailsMarkup(sectionId);

  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.section === sectionId);
  });

  updateSelectors(sectionId);
}

function transitionToSection(sectionId) {
  const nextIndex = sections.findIndex((section) => section.id === sectionId);
  if (nextIndex === -1) {
    return;
  }

  if (nextIndex !== currentSectionIndex) {
    playUiSound("carousel");
  }
  currentSectionIndex = nextIndex;
  carouselRoot.setAttribute(
    "animation__spin",
    `property: rotation; to: 0 ${-sections[nextIndex].angle} 0; dur: 1200; easing: easeInOutCubic`,
  );
  updateUI(sectionId);
}

function nextSection() {
  const nextIndex = (currentSectionIndex + 1) % sections.length;
  transitionToSection(sections[nextIndex].id);
}

function previousSection() {
  const nextIndex =
    (currentSectionIndex - 1 + sections.length) % sections.length;
  transitionToSection(sections[nextIndex].id);
}

function setupNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      playUiSound("hover");
    });
    button.addEventListener("click", () => {
      transitionToSection(button.dataset.section);
    });
  });

  prevButton.addEventListener("mouseenter", () => {
    playUiSound("hover");
  });
  nextButton.addEventListener("mouseenter", () => {
    playUiSound("hover");
  });
  prevButton.addEventListener("click", previousSection);
  nextButton.addEventListener("click", nextSection);

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === " ") {
      nextSection();
    }

    if (event.key === "ArrowLeft") {
      previousSection();
    }
  });
}

function buildScene() {
  addEnvironment();
  addHomePortal();
  sections.forEach(createSelectorNode);
  carouselRoot = createElement("a-entity", {
    id: "carouselRoot",
    rotation: "0 0 0",
  });
  resumeWorld.appendChild(carouselRoot);

  buildEntranceSection();
  buildExperienceSection();
  buildSkillsSection();
  buildEducationSection();
  buildContactsSection();
}

async function initializeResume() {
  try {
    const response = await fetch("resume-data.json", {
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    resumeData = await response.json();
  } catch (error) {
    resumeData = {
      professional: {
        name: "Nzenwata Sinclair",
        title: "Full-Stack Developer and Creative Technologist",
        summary:
          "A focused developer building web products, immersive experiences, and thoughtful interfaces.",
        location: "Muncie, Indiana",
      },
      experience: [],
      education: [],
      skills: {},
      contact: [],
      certifications: [],
      about: {
        journey: "Resume data could not be loaded.",
        philosophy:
          "Serve the project over HTTP to restore the full experience.",
        interests: ["Web Development", "Immersive UI"],
      },
    };
  }

  buildScene();
  setupNavigation();
  updateUI("entrance");

  window.setTimeout(() => {
    bootScreen.classList.add("is-hidden");
  }, 260);
}

initializeResume();
