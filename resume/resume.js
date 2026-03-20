const FONT_URL =
  "https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/cormorantgaramond/CormorantGaramond-Regular.json";
const FONT_IMAGE =
  "https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/cormorantgaramond/CormorantGaramond-Regular.png";

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
  { id: "projects", label: "Projects", angle: 216 },
  { id: "education", label: "Education", angle: 288 },
];

const accentBySection = {
  entrance: { accent: "#7adfff", edge: "#c7efff" },
  experience: { accent: "#7adfff", edge: "#c7efff" },
  skills: { accent: "#95a7ff", edge: "#c8d6ff" },
  projects: { accent: "#c7efff", edge: "#e3f6ff" },
  education: { accent: "#95a7ff", edge: "#c8d6ff" },
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
    createElement("a-entity", {
      geometry: "primitive: torus; radius: 2.28; radiusTubular: 0.05",
      position: "0 2.64 -1.1",
      scale: "1 1.26 1",
      rotation: "0 0 90",
      material:
        "color: #9de7ff; emissive: #7adfff; emissiveIntensity: 0.4; opacity: 0.3; transparent: true",
      animation:
        "property: rotation; to: 0 0 450; dur: 25000; loop: true; easing: linear",
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

  const ring = createElement("a-entity", {
    geometry: "primitive: torus; radius: 0.72; radiusTubular: 0.04",
    position: "0 0 0.12",
    scale: "0.82 1.24 0.82",
    rotation: "0 0 90",
    material:
      "color: #c7efff; emissive: #7adfff; emissiveIntensity: 0.44; opacity: 0.42; transparent: true",
  });
  portal.appendChild(ring);

  portal.appendChild(
    createElement("a-plane", {
      position: "0 0 0.04",
      width: "0.92",
      height: "1.46",
      color: "#06111d",
      material:
        "transparent: true; opacity: 0.68; emissive: #15324f; emissiveIntensity: 0.28",
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
  createSectionTitle(anchor, "Arrival", "A professional overview staged as a calm focal monument");

  anchor.appendChild(
    createElement("a-box", {
      position: "0 2.36 -0.28",
      width: "4.8",
      height: "4.4",
      depth: "0.22",
      color: "#050d16",
      material:
        "opacity: 0.56; transparent: true; emissive: #071829; emissiveIntensity: 0.18",
    }),
  );

  anchor.appendChild(
    createElement("a-entity", {
      geometry: "primitive: torus; radius: 1.64; radiusTubular: 0.036",
      position: "0 2.52 -0.08",
      rotation: "0 0 90",
      scale: "1 1.28 1",
      material:
        "color: #9de7ff; emissive: #7adfff; emissiveIntensity: 0.42; opacity: 0.3; transparent: true",
      animation:
        "property: rotation; to: 0 0 450; dur: 24000; loop: true; easing: linear",
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
      value: resumeData.professional.title,
      position: "0 2.82 0.06",
      align: "center",
      color: "#7adfff",
      width: "4.4",
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

  anchor.appendChild(
    createText({
      value: resumeData.professional.location,
      position: "0 1.02 0.1",
      align: "center",
      color: "#95a7ff",
      width: "1.9",
    }),
  );
}

function buildExperienceSection() {
  const anchor = createSectionWrapper(sections[1]);
  createSectionTitle(anchor, "Experience", "Three anchored role stations aligned for a fixed viewer");

  const xPositions = [-3.5, 0, 3.5];
  resumeData.experience.slice(0, 3).forEach((item, index) => {
    const accent = index === 2 ? "#95a7ff" : index === 1 ? "#c7efff" : "#7adfff";
    const card = createElement("a-entity", {
      position: `${xPositions[index]} 0 0`,
    });

    card.appendChild(
      createElement("a-box", {
        position: "0 2.08 -0.2",
        width: "2.2",
        height: "3.3",
        depth: "0.18",
        color: "#050d16",
        material:
          "opacity: 0.56; transparent: true; emissive: #071829; emissiveIntensity: 0.16",
      }),
    );

    card.appendChild(
      createElement("a-entity", {
        geometry: "primitive: torus; radius: 0.94; radiusTubular: 0.026",
        position: "0 2.16 -0.06",
        rotation: "0 0 90",
        scale: "1 1.24 1",
        material: `color: ${accent}; emissive: ${accent}; emissiveIntensity: 0.34; opacity: 0.28; transparent: true`,
      }),
    );

    card.appendChild(
      createText({
        value: item.title,
        position: "0 3.02 0.04",
        align: "center",
        color: "#ecf6ff",
        width: "2.9",
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
  createSectionTitle(anchor, "Skills", "A constellation of capability clusters around a central core");

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

function buildProjectsSection() {
  const anchor = createSectionWrapper(sections[3]);
  createSectionTitle(anchor, "Projects", "Text-first project capsules reduce buffering inside the scene");

  const positions = [
    { x: -3.2, y: 3.0 },
    { x: 3.2, y: 3.0 },
    { x: -3.2, y: 1.2 },
    { x: 3.2, y: 1.2 },
  ];

  resumeData.projects.slice(0, 4).forEach((project, index) => {
    const pos = positions[index];
    const accent = index % 2 === 0 ? "#7adfff" : "#95a7ff";
    const card = createElement("a-entity", {
      position: `${pos.x} ${pos.y} 0`,
    });

    card.appendChild(
      createElement("a-box", {
        position: "0 0 0",
        width: "2.5",
        height: "1.8",
        depth: "0.16",
        color: "#050d16",
        material:
          "opacity: 0.56; transparent: true; emissive: #071829; emissiveIntensity: 0.16",
      }),
    );

    const veil = createElement("a-plane", {
      position: "0 0 0.08",
      width: "2.16",
      height: "1.42",
      color: accent,
      material: `opacity: 0.08; transparent: true; emissive: ${accent}; emissiveIntensity: 0.28`,
    });
    card.appendChild(veil);

    card.appendChild(
      createText({
        value: project.name,
        position: "0 0.44 0.08",
        align: "center",
        color: "#ecf6ff",
        width: "2.8",
      }),
    );

    card.appendChild(
      createText({
        value: project.description,
        position: "0 -0.04 0.08",
        align: "center",
        color: "#a9c9df",
        width: "2.2",
        wrapCount: "28",
      }),
    );

    card.appendChild(
      createText({
        value: project.technologies.slice(0, 3).join(" / "),
        position: "0 -0.62 0.08",
        align: "center",
        color: accent,
        width: "2.1",
      }),
    );

    const hitbox = createElement("a-plane", {
      class: "clickable",
      position: "0 0 0.1",
      width: "2.16",
      height: "1.42",
      material: "transparent: true; opacity: 0.001",
    });
    card.appendChild(hitbox);

    hitbox.addEventListener("mouseenter", () => {
      card.setAttribute(
        "animation__hover",
        "property: scale; to: 1.03 1.03 1.03; dur: 220; easing: easeInOutCubic",
      );
      veil.setAttribute("material", "opacity", 0.18);
    });

    hitbox.addEventListener("mouseleave", () => {
      card.setAttribute(
        "animation__hover",
        "property: scale; to: 1 1 1; dur: 220; easing: easeInOutCubic",
      );
      veil.setAttribute("material", "opacity", 0.08);
    });

    hitbox.addEventListener("click", () => {
      if (project.link && project.link !== "#") {
        window.open(project.link, "_blank", "noopener,noreferrer");
      }
    });

    anchor.appendChild(card);
  });
}

function buildEducationSection() {
  const anchor = createSectionWrapper(sections[4]);
  createSectionTitle(anchor, "Education", "Academic milestones and scholarship support in a quieter finale");

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
    createElement("a-entity", {
      geometry: "primitive: torus; radius: 1.44; radiusTubular: 0.03",
      position: "0 2.56 -0.08",
      rotation: "0 0 90",
      scale: "1 1.28 1",
      material:
        "color: #c8d6ff; emissive: #95a7ff; emissiveIntensity: 0.36; opacity: 0.28; transparent: true",
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

  anchor.appendChild(
    createText({
      value: `${certification.name} / ${certification.date}`,
      position: "0 0.72 0.08",
      align: "center",
      color: "#c8d6ff",
      width: "3.2",
    }),
  );
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

  if (sectionId === "projects") {
    return `
      <div class="detail-section">
        <h3>Selected Projects</h3>
        ${resumeData.projects
          .slice(0, 4)
          .map(
            (project) => `
              <article class="detail-block">
                <h4>${project.name}</h4>
                <div class="detail-meta">${project.category}</div>
                <p>${project.description}</p>
                <ul class="detail-list">
                  ${project.achievements
                    .map((achievement) => `<li>${achievement}</li>`)
                    .join("")}
                </ul>
                ${badgeRow(project.technologies)}
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
        "The opening monument now sits in a rotating archive, so the viewer stays centered while the content moves.",
      indicator: "Arrival",
    },
    experience: {
      kicker: "Career",
      title: "Experience Stations",
      content:
        "Roles now arrive in front of the user as a carousel panel instead of forcing locomotion between sections.",
      indicator: "Experience",
    },
    skills: {
      kicker: "Capabilities",
      title: "Skill Constellation",
      content:
        "Capabilities cluster around a central core, using motion and hierarchy without adding scene noise.",
      indicator: "Skills",
    },
    projects: {
      kicker: "Selected Work",
      title: "Project Capsules",
      content:
        "Project panels use text-first holographic cards to cut buffering from remote in-scene images.",
      indicator: "Projects",
    },
    education: {
      kicker: "Foundation",
      title: "Education and Recognition",
      content:
        "Education closes the carousel with a quieter ceremonial station and a clear in-place finish.",
      indicator: "Education",
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
  const nextIndex = (currentSectionIndex - 1 + sections.length) % sections.length;
  transitionToSection(sections[nextIndex].id);
}

function setupNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      transitionToSection(button.dataset.section);
    });
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
  buildProjectsSection();
  buildEducationSection();
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
      projects: [],
      certifications: [],
      about: {
        journey: "Resume data could not be loaded.",
        philosophy: "Serve the project over HTTP to restore the full experience.",
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
