const FONT_URL =
  "https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/cormorantgaramond/CormorantGaramond-Regular.json";
const FONT_IMAGE =
  "https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/cormorantgaramond/CormorantGaramond-Regular.png";

const resumeWorld = document.getElementById("resumeWorld");
const rig = document.getElementById("rig");
const sectionIndicator = document.getElementById("sectionIndicator");
const panelKicker = document.getElementById("panelKicker");
const panelTitle = document.getElementById("panelTitle");
const panelContent = document.getElementById("panelContent");
const detailsPanel = document.getElementById("detailsPanel");
const navButtons = [...document.querySelectorAll(".nav-chip")];
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

const sections = [
  { id: "entrance", label: "Arrival", rigPosition: "0 0 6", anchorZ: -4 },
  { id: "experience", label: "Experience", rigPosition: "0 0 -2", anchorZ: -12 },
  { id: "skills", label: "Skills", rigPosition: "0 0 -10", anchorZ: -20 },
  { id: "projects", label: "Projects", rigPosition: "0 0 -18", anchorZ: -28 },
  { id: "education", label: "Education", rigPosition: "0 0 -26", anchorZ: -36 },
];

let resumeData = null;
let currentSectionIndex = 0;

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

function createSectionLabel(title, subtitle, z) {
  resumeWorld.appendChild(
    createText({
      value: title,
      position: `0 5.8 ${z - 2}`,
      align: "center",
      color: "#ecf6ff",
      width: "7.4",
      material: "emissive: #d8f2ff; emissiveIntensity: 0.24",
    }),
  );

  resumeWorld.appendChild(
    createText({
      value: subtitle,
      position: `0 5.18 ${z - 2}`,
      align: "center",
      color: "#a9c9df",
      width: "4.8",
    }),
  );
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
      intensity: "0.16",
      color: "#95a7ff",
      position: "4 5 -6",
    }),
  );

  resumeWorld.appendChild(
    createElement("a-plane", {
      rotation: "-90 0 0",
      position: "0 -0.18 -20",
      width: "30",
      height: "82",
      color: "#040a13",
      material: "metalness: 0.08; roughness: 0.92",
    }),
  );

  resumeWorld.appendChild(
    createElement("a-plane", {
      rotation: "-90 0 0",
      position: "0 -0.08 -20",
      width: "9.2",
      height: "78",
      color: "#08121f",
      material:
        "emissive: #0c2134; emissiveIntensity: 0.14; opacity: 0.9; transparent: true",
    }),
  );

  resumeWorld.appendChild(
    createElement("a-plane", {
      rotation: "-90 0 0",
      position: "0 -0.07 -20",
      width: "0.18",
      height: "78",
      color: "#c7efff",
      material:
        "emissive: #7adfff; emissiveIntensity: 0.86; opacity: 0.82; transparent: true",
    }),
  );

  resumeWorld.appendChild(
    createElement("a-box", {
      position: "-11.4 3.25 -20",
      width: "0.3",
      height: "6.5",
      depth: "82",
      color: "#050d16",
      material:
        "opacity: 0.42; transparent: true; emissive: #061426; emissiveIntensity: 0.08",
    }),
  );

  resumeWorld.appendChild(
    createElement("a-box", {
      position: "11.4 3.25 -20",
      width: "0.3",
      height: "6.5",
      depth: "82",
      color: "#050d16",
      material:
        "opacity: 0.42; transparent: true; emissive: #061426; emissiveIntensity: 0.08",
    }),
  );

  for (let i = 0; i < 8; i += 1) {
    const z = -4 - i * 9.2;

    resumeWorld.appendChild(
      createElement("a-box", {
        position: "-8.2 3.15 " + z,
        width: "0.14",
        height: "4",
        depth: "0.16",
        color: "#d2f3ff",
        material:
          "emissive: #7adfff; emissiveIntensity: 0.54; opacity: 0.76; transparent: true",
      }),
    );

    resumeWorld.appendChild(
      createElement("a-box", {
        position: "8.2 3.15 " + z,
        width: "0.14",
        height: "4",
        depth: "0.16",
        color: "#d2f3ff",
        material:
          "emissive: #7adfff; emissiveIntensity: 0.54; opacity: 0.76; transparent: true",
      }),
    );

    resumeWorld.appendChild(
      createElement("a-entity", {
        geometry: "primitive: torus; radius: 5.4; radiusTubular: 0.018",
        position: `0 5.2 ${z}`,
        rotation: "0 0 90",
        scale: "1 0.58 1",
        material:
          "color: #9fe7ff; emissive: #7adfff; emissiveIntensity: 0.26; opacity: 0.2; transparent: true",
      }),
    );
  }
}

function buildEntranceSection() {
  const z = sections[0].anchorZ;
  createSectionLabel("Resume Observatory", "A guided professional narrative", z);

  const group = createElement("a-entity", { position: `0 0 ${z}` });
  group.appendChild(
    createElement("a-cylinder", {
      position: "0 0.16 0",
      radius: "2.2",
      height: "0.24",
      color: "#07101a",
      material: "emissive: #16324f; emissiveIntensity: 0.16",
    }),
  );

  group.appendChild(
    createElement("a-entity", {
      geometry: "primitive: torus; radius: 1.8; radiusTubular: 0.04",
      position: "0 2.7 -0.2",
      rotation: "0 0 90",
      scale: "0.92 1.32 0.92",
      material:
        "color: #9de7ff; emissive: #7adfff; emissiveIntensity: 0.44; opacity: 0.34; transparent: true",
      animation:
        "property: rotation; to: 0 0 450; dur: 28000; loop: true; easing: linear",
    }),
  );

  group.appendChild(
    createElement("a-box", {
      position: "0 2.5 -0.4",
      width: "4.6",
      height: "4.4",
      depth: "0.24",
      color: "#050d16",
      material:
        "opacity: 0.56; transparent: true; emissive: #071829; emissiveIntensity: 0.18",
    }),
  );

  group.appendChild(
    createText({
      value: resumeData.professional.name,
      position: "0 3.48 0",
      align: "center",
      color: "#ecf6ff",
      width: "6.4",
      material: "emissive: #d8f2ff; emissiveIntensity: 0.26",
    }),
  );

  group.appendChild(
    createText({
      value: resumeData.professional.title,
      position: "0 2.82 0.02",
      align: "center",
      color: "#7adfff",
      width: "4.8",
    }),
  );

  group.appendChild(
    createText({
      value: resumeData.professional.summary,
      position: "0 2.04 0.06",
      align: "center",
      color: "#b2cddd",
      width: "4.9",
      wrapCount: "42",
    }),
  );

  group.appendChild(
    createText({
      value: resumeData.professional.location,
      position: "0 1.16 0.1",
      align: "center",
      color: "#95a7ff",
      width: "2.2",
    }),
  );

  group.appendChild(
    createElement("a-light", {
      type: "point",
      color: "#7adfff",
      intensity: "0.78",
      distance: "8",
      position: "0 3 1.8",
    }),
  );

  resumeWorld.appendChild(group);
}

function buildExperienceSection() {
  const z = sections[1].anchorZ;
  createSectionLabel("Career Timeline", "Key roles presented as anchored stations", z);

  resumeWorld.appendChild(
    createElement("a-box", {
      position: `0 2.7 ${z}`,
      width: "0.08",
      height: "3.8",
      depth: "0.08",
      color: "#d8f6ff",
      material:
        "emissive: #7adfff; emissiveIntensity: 0.52; opacity: 0.8; transparent: true",
    }),
  );

  resumeData.experience.forEach((item, index) => {
    const xPositions = [-4.2, 0, 4.2];
    const zOffsets = [0.55, -0.2, 0.55];
    const accents = ["#7adfff", "#c7efff", "#95a7ff"];
    const accent = accents[index % accents.length];

    const card = createElement("a-entity", {
      position: `${xPositions[index]} 0 ${z + zOffsets[index]}`,
    });

    card.appendChild(
      createElement("a-cylinder", {
        position: "0 0.16 0",
        radius: "1.1",
        height: "0.24",
        color: "#07101a",
        material: `emissive: ${accent}; emissiveIntensity: 0.18`,
      }),
    );

    card.appendChild(
      createElement("a-box", {
        position: "0 2.4 -0.3",
        width: "2.6",
        height: "3.8",
        depth: "0.22",
        color: "#050d16",
        material:
          "opacity: 0.56; transparent: true; emissive: #071829; emissiveIntensity: 0.18",
      }),
    );

    card.appendChild(
      createElement("a-entity", {
        geometry: "primitive: torus; radius: 1.18; radiusTubular: 0.026",
        position: "0 2.6 -0.12",
        rotation: "0 0 90",
        scale: "1 1.32 1",
        material: `color: ${accent}; emissive: ${accent}; emissiveIntensity: 0.36; opacity: 0.28; transparent: true`,
      }),
    );

    card.appendChild(
      createText({
        value: item.title,
        position: "0 3.55 0.02",
        align: "center",
        color: "#ecf6ff",
        width: "3.4",
        material: "emissive: #d8f2ff; emissiveIntensity: 0.18",
      }),
    );

    card.appendChild(
      createText({
        value: item.company,
        position: "0 2.98 0.04",
        align: "center",
        color: accent,
        width: "2.7",
      }),
    );

    card.appendChild(
      createText({
        value: item.duration,
        position: "0 2.46 0.06",
        align: "center",
        color: "#b9d8f1",
        width: "1.6",
      }),
    );

    card.appendChild(
      createText({
        value: item.description,
        position: "0 1.82 0.08",
        align: "center",
        color: "#a9c9df",
        width: "2.65",
        wrapCount: "28",
      }),
    );

    card.appendChild(
      createElement("a-light", {
        type: "point",
        color: accent,
        intensity: "0.65",
        distance: "7",
        position: "0 2.8 1.5",
      }),
    );

    resumeWorld.appendChild(card);
  });
}

function buildSkillsSection() {
  const z = sections[2].anchorZ;
  createSectionLabel("Skill Constellation", "Four capability clusters linked to a central core", z);

  resumeWorld.appendChild(
    createElement("a-sphere", {
      position: `0 2.7 ${z}`,
      radius: "0.48",
      color: "#c7efff",
      material: "emissive: #7adfff; emissiveIntensity: 0.92",
      animation:
        "property: scale; from: 1 1 1; to: 1.12 1.12 1.12; dur: 2800; easing: easeInOutSine; dir: alternate; loop: true",
    }),
  );

  resumeWorld.appendChild(
    createElement("a-entity", {
      geometry: "primitive: torus; radius: 1.95; radiusTubular: 0.03",
      position: `0 2.7 ${z}`,
      rotation: "90 0 0",
      material:
        "color: #9de7ff; emissive: #7adfff; emissiveIntensity: 0.38; opacity: 0.26; transparent: true",
      animation:
        "property: rotation; to: 90 360 0; dur: 22000; loop: true; easing: linear",
    }),
  );

  const skillPositions = [
    { x: 3.8, y: 3.5, color: "#7adfff" },
    { x: -3.8, y: 3.5, color: "#95a7ff" },
    { x: 3.8, y: 1.5, color: "#c7efff" },
    { x: -3.8, y: 1.5, color: "#7adfff" },
  ];

  Object.entries(resumeData.skills).forEach(([category, skills], index) => {
    const pos = skillPositions[index];

    resumeWorld.appendChild(
      createElement("a-line", {
        start: `0 2.7 ${z}`,
        end: `${pos.x} ${pos.y} ${z}`,
        color: pos.color,
        opacity: "0.5",
      }),
    );

    const card = createElement("a-entity", {
      position: `${pos.x} ${pos.y} ${z}`,
    });

    card.appendChild(
      createElement("a-box", {
        position: "0 0 0",
        width: "2.7",
        height: "1.8",
        depth: "0.18",
        color: "#050d16",
        material:
          "opacity: 0.56; transparent: true; emissive: #071829; emissiveIntensity: 0.18",
      }),
    );

    card.appendChild(
      createText({
        value: category,
        position: "0 0.52 0.08",
        align: "center",
        color: "#ecf6ff",
        width: "3",
        material: "emissive: #d8f2ff; emissiveIntensity: 0.16",
      }),
    );

    const skillCopy = skills
      .slice(0, 3)
      .map((skill) => `${skill.name} ${"|".repeat(skill.level)}`)
      .join("\n");

    card.appendChild(
      createText({
        value: skillCopy,
        position: "0 -0.18 0.08",
        align: "center",
        color: pos.color,
        width: "2.5",
        wrapCount: "30",
      }),
    );

    resumeWorld.appendChild(card);
  });
}

function buildProjectsSection() {
  const z = sections[3].anchorZ;
  createSectionLabel("Project Gallery", "Selected builds framed as responsive media installations", z);

  const cards = resumeData.projects.slice(0, 4);
  const positions = [
    { x: -3.3, y: 3.2, imageId: "#eng104-img" },
    { x: 3.3, y: 3.2, imageId: "#corpstube-img" },
    { x: -3.3, y: 1.1, imageId: "#corpsify-img" },
    { x: 3.3, y: 1.1, imageId: "#saintly-img" },
  ];

  cards.forEach((project, index) => {
    const pos = positions[index];
    const card = createElement("a-entity", {
      position: `${pos.x} ${pos.y} ${z}`,
    });

    card.appendChild(
      createElement("a-plane", {
        class: "resume-project-frame",
        position: "0 0 0",
        width: "2.6",
        height: "1.85",
        color: "#07101a",
        material: "opacity: 0.84; transparent: true; emissive: #15324f; emissiveIntensity: 0.18",
      }),
    );

    card.appendChild(
      createElement("a-plane", {
        position: "0 0 0.05",
        width: "2.28",
        height: "1.34",
        src: pos.imageId,
        material: "shader: flat",
      }),
    );

    const veil = createElement("a-plane", {
      class: "resume-project-veil",
      position: "0 0 0.08",
      width: "2.28",
      height: "1.34",
      color: "#7adfff",
      material: "opacity: 0.08; transparent: true; emissive: #7adfff; emissiveIntensity: 0.28",
    });
    card.appendChild(veil);

    const hitbox = createElement("a-plane", {
      class: "clickable",
      position: "0 0 0.1",
      width: "2.28",
      height: "1.34",
      color: "#ffffff",
      material: "opacity: 0.001; transparent: true",
    });
    card.appendChild(hitbox);

    card.appendChild(
      createText({
        value: project.name,
        position: "0 -1.14 0.02",
        align: "center",
        color: "#ecf6ff",
        width: "3",
      }),
    );

    card.appendChild(
      createText({
        value: project.technologies.join(" / "),
        position: "0 -1.48 0.04",
        align: "center",
        color: "#a9c9df",
        width: "2.4",
      }),
    );

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

    resumeWorld.appendChild(card);
  });
}

function buildEducationSection() {
  const z = sections[4].anchorZ;
  createSectionLabel("Education and Recognition", "Academic foundation and scholarship support", z);

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

  const educationCard = createElement("a-entity", {
    position: `0 0 ${z}`,
  });

  educationCard.appendChild(
    createElement("a-box", {
      position: "0 2.7 -0.3",
      width: "4.2",
      height: "4.4",
      depth: "0.22",
      color: "#050d16",
      material:
        "opacity: 0.56; transparent: true; emissive: #071829; emissiveIntensity: 0.18",
    }),
  );

  educationCard.appendChild(
    createElement("a-entity", {
      geometry: "primitive: torus; radius: 1.58; radiusTubular: 0.03",
      position: "0 2.9 -0.12",
      rotation: "0 0 90",
      scale: "1 1.3 1",
      material:
        "color: #9de7ff; emissive: #7adfff; emissiveIntensity: 0.38; opacity: 0.28; transparent: true",
    }),
  );

  educationCard.appendChild(
    createText({
      value: education.institution,
      position: "0 3.74 0.02",
      align: "center",
      color: "#ecf6ff",
      width: "5.2",
      material: "emissive: #d8f2ff; emissiveIntensity: 0.18",
    }),
  );

  educationCard.appendChild(
    createText({
      value: `${education.degree} in ${education.field}`,
      position: "0 3.04 0.04",
      align: "center",
      color: "#7adfff",
      width: "3.8",
    }),
  );

  educationCard.appendChild(
    createText({
      value: education.graduation,
      position: "0 2.44 0.06",
      align: "center",
      color: "#95a7ff",
      width: "1.8",
    }),
  );

  educationCard.appendChild(
    createText({
      value: education.highlights.join("\n"),
      position: "0 1.56 0.08",
      align: "center",
      color: "#a9c9df",
      width: "4",
      wrapCount: "38",
    }),
  );

  resumeWorld.appendChild(educationCard);

  const scholarshipCard = createElement("a-entity", {
    position: `0 0 ${z - 4.4}`,
  });

  scholarshipCard.appendChild(
    createElement("a-cylinder", {
      position: "0 0.18 0",
      radius: "1.5",
      height: "0.24",
      color: "#07101a",
      material: "emissive: #243057; emissiveIntensity: 0.18",
    }),
  );

  scholarshipCard.appendChild(
    createElement("a-entity", {
      geometry: "primitive: torus; radius: 1.02; radiusTubular: 0.032",
      position: "0 2.2 -0.08",
      rotation: "0 0 90",
      scale: "1 1.26 1",
      material:
        "color: #c7d2ff; emissive: #95a7ff; emissiveIntensity: 0.4; opacity: 0.3; transparent: true",
    }),
  );

  scholarshipCard.appendChild(
    createText({
      value: certification.name,
      position: "0 3.05 0.02",
      align: "center",
      color: "#ecf6ff",
      width: "4.4",
    }),
  );

  scholarshipCard.appendChild(
    createText({
      value: `${certification.issuer} / ${certification.date}`,
      position: "0 2.44 0.04",
      align: "center",
      color: "#95a7ff",
      width: "3.1",
    }),
  );

  scholarshipCard.appendChild(
    createText({
      value: certification.description,
      position: "0 1.72 0.06",
      align: "center",
      color: "#a9c9df",
      width: "3.2",
      wrapCount: "34",
    }),
  );

  resumeWorld.appendChild(scholarshipCard);
}

function buildScene() {
  addEnvironment();
  buildEntranceSection();
  buildExperienceSection();
  buildSkillsSection();
  buildProjectsSection();
  buildEducationSection();
}

function badgeRow(items) {
  return `<div class="badge-row">${items
    .map((item) => `<span class="detail-badge">${item}</span>`)
    .join("")}</div>`;
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

function updateUI(sectionId) {
  const sectionInfo = {
    entrance: {
      kicker: "Arrival",
      title: "Professional Summary",
      content:
        "The opening monument frames the resume as a curated narrative, not a stack of bullet points.",
      indicator: "Arrival",
    },
    experience: {
      kicker: "Career",
      title: "Experience Stations",
      content:
        "Each role is staged as a lit monolith with enough hierarchy to read quickly from desktop or VR.",
      indicator: "Experience",
    },
    skills: {
      kicker: "Capabilities",
      title: "Skill Constellation",
      content:
        "Capabilities sit around a shared core to show range without turning the scene into noisy decoration.",
      indicator: "Skills",
    },
    projects: {
      kicker: "Selected Work",
      title: "Project Gallery",
      content:
        "Project cards use the same frame, glow, and hover language as the museum for continuity across the experience.",
      indicator: "Projects",
    },
    education: {
      kicker: "Foundation",
      title: "Education and Recognition",
      content:
        "Education and scholarship details close the walkthrough with a quieter, more ceremonial station.",
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
}

function transitionToSection(sectionId) {
  const nextIndex = sections.findIndex((section) => section.id === sectionId);
  if (nextIndex === -1) {
    return;
  }

  currentSectionIndex = nextIndex;
  rig.setAttribute(
    "animation__move",
    `property: position; to: ${sections[nextIndex].rigPosition}; dur: 1600; easing: easeInOutCubic`,
  );
  updateUI(sectionId);
}

function nextSection() {
  const nextIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
  transitionToSection(sections[nextIndex].id);
}

function previousSection() {
  const nextIndex = Math.max(currentSectionIndex - 1, 0);
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
}

initializeResume();
