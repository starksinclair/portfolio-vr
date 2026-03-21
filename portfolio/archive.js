const FONT_URL =
  "https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/cormorantgaramond/CormorantGaramond-Regular.json";
const FONT_IMAGE =
  "https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/cormorantgaramond/CormorantGaramond-Regular.png";

const archiveWorld = document.getElementById("archiveWorld");
const bootScreen = document.getElementById("bootScreen");
const archiveName = document.getElementById("archiveName");
const archiveTitle = document.getElementById("archiveTitle");
const archiveBio = document.getElementById("archiveBio");
const archiveLocation = document.getElementById("archiveLocation");
const projectCount = document.getElementById("projectCount");
const experienceCount = document.getElementById("experienceCount");
const focusLabel = document.getElementById("focusLabel");
const contactLinks = document.getElementById("contactLinks");
const aboutButton = document.getElementById("aboutButton");
const projectLink = document.getElementById("projectLink");
const voiceoverButton = document.getElementById("voiceoverButton");
const ambienceButton = document.getElementById("ambienceButton");
const transcriptModal = document.getElementById("transcriptModal");
const transcriptTitle = document.getElementById("transcriptTitle");
const transcriptBody = document.getElementById("transcriptBody");
const closeTranscript = document.getElementById("closeTranscript");
const forestAmbient = document.getElementById("forestAmbient");

const state = {
  archiveData: null,
  audioContext: null,
  audioUnlocked: false,
  ambienceEnabled: true,
  sceneVoiceover: null,
  currentFocus: "about",
  activeProjectIndex: 0,
  activeExperienceIndex: 0,
  projectSelectors: [],
  experienceCards: [],
  experienceSpinRoot: null,
  focusWall: null,
};

function ensureAudioContext() {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) {
    return null;
  }

  if (!state.audioContext) {
    state.audioContext = new Context();
  }

  if (state.audioContext.state === "suspended") {
    state.audioContext.resume().catch(() => {});
  }

  return state.audioContext;
}

function playUiSound(type = "hover") {
  const ctx = ensureAudioContext();
  if (!ctx) {
    return;
  }

  const now = ctx.currentTime;
  const gain = ctx.createGain();
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const config = {
    hover: { start: 420, end: 520, amp: 0.014, dur: 0.07 },
    click: { start: 260, end: 470, amp: 0.028, dur: 0.14 },
    move: { start: 150, end: 280, amp: 0.026, dur: 0.22 },
  }[type] || { start: 420, end: 520, amp: 0.014, dur: 0.07 };

  filter.type = "lowpass";
  filter.frequency.value = type === "move" ? 1100 : 1500;
  osc.type = type === "click" ? "triangle" : "sine";
  osc2.type = "sine";

  osc.frequency.setValueAtTime(config.start, now);
  osc.frequency.exponentialRampToValueAtTime(config.end, now + config.dur);
  osc2.frequency.setValueAtTime(config.start * 1.4, now);
  osc2.frequency.exponentialRampToValueAtTime(
    config.end * 1.16,
    now + config.dur,
  );

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(config.amp, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + config.dur);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc2.start(now);
  osc.stop(now + config.dur + 0.02);
  osc2.stop(now + config.dur + 0.02);
}

function wireUiSounds() {
  document.querySelectorAll(".sound-trigger").forEach((node) => {
    node.addEventListener("mouseenter", () => playUiSound("hover"));
    node.addEventListener("click", () => playUiSound("click"));
  });
}

function unlockAudio() {
  ensureAudioContext();
  if (state.audioUnlocked) {
    return;
  }

  state.audioUnlocked = true;
  if (state.ambienceEnabled) {
    forestAmbient.play().catch(() => {});
  }
}

function setAmbienceEnabled(enabled) {
  state.ambienceEnabled = enabled;
  ambienceButton.textContent = enabled ? "Mute Ambience" : "Play Ambience";

  if (!enabled) {
    forestAmbient.pause();
    return;
  }

  if (state.audioUnlocked) {
    forestAmbient.play().catch(() => {});
  }
}

function openTranscript(title, lines) {
  transcriptTitle.textContent = title;
  transcriptBody.innerHTML = lines.map((line) => `<p>${line}</p>`).join("");
  transcriptModal.hidden = false;
}

function closeTranscriptModal() {
  transcriptModal.hidden = true;
}

function setupVoiceoverButton(voiceover) {
  if (voiceover && voiceover.src) {
    const audio = new Audio(voiceover.src);
    audio.preload = "metadata";
    state.sceneVoiceover = audio;
    voiceoverButton.textContent = "Play Guide Voiceover";

    voiceoverButton.addEventListener("click", () => {
      unlockAudio();
      if (audio.paused) {
        audio.play().catch(() => openTranscript(voiceover.title, voiceover.transcript));
        voiceoverButton.textContent = "Pause Voiceover";
      } else {
        audio.pause();
        voiceoverButton.textContent = "Play Guide Voiceover";
      }
    });

    audio.addEventListener("ended", () => {
      voiceoverButton.textContent = "Play Guide Voiceover";
    });
    return;
  }

  voiceoverButton.textContent = "View Guide Script";
  voiceoverButton.addEventListener("click", () => {
    openTranscript(voiceover.title, voiceover.transcript);
  });
}

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

function addForestBackdrop(root, centerZ) {
  const trunks = [
    { x: -8.5, z: -2.9, radius: 0.2, height: 6.9 },
    { x: -6.1, z: -4.6, radius: 0.24, height: 7.4 },
    { x: -3.2, z: -5.8, radius: 0.18, height: 7.1 },
    { x: -0.2, z: -6.3, radius: 0.22, height: 7.5 },
    { x: 3.1, z: -5.7, radius: 0.19, height: 7.2 },
    { x: 6.2, z: -4.6, radius: 0.25, height: 7.4 },
    { x: 8.4, z: -3.1, radius: 0.2, height: 7.0 },
  ];

  trunks.forEach((trunk, index) => {
    root.appendChild(
      createElement("a-cylinder", {
        position: `${trunk.x} ${(trunk.height / 2 - 0.1).toFixed(2)} ${(centerZ + trunk.z).toFixed(2)}`,
        radius: trunk.radius.toFixed(2),
        height: trunk.height.toFixed(2),
        color: index % 2 === 0 ? "#1b1611" : "#211a13",
        material: "roughness: 1; metalness: 0",
      }),
    );
  });

  [
    { x: -6.8, z: -4.7, width: 2.6, height: 5.9, rot: 16 },
    { x: -2.4, z: -6.1, width: 3.5, height: 6.2, rot: 6 },
    { x: 2.1, z: -6.05, width: 3.5, height: 6.2, rot: -5 },
    { x: 6.5, z: -4.65, width: 2.6, height: 5.9, rot: -16 },
  ].forEach((plane) => {
    root.appendChild(
      createElement("a-plane", {
        position: `${plane.x} 2.82 ${(centerZ + plane.z).toFixed(2)}`,
        rotation: `0 ${plane.rot} 0`,
        width: plane.width.toFixed(2),
        height: plane.height.toFixed(2),
        material:
          "color: #1b2118; opacity: 0.4; transparent: true; side: double",
      }),
    );
  });

  [
    { y: 0.2, z: -0.1, width: 7.4, height: 2.2, dur: 7600 },
    { y: 0.3, z: -0.55, width: 6.2, height: 1.6, dur: 9200 },
  ].forEach((fog, index) => {
    root.appendChild(
      createElement("a-plane", {
        position: `0 ${fog.y.toFixed(2)} ${(centerZ + fog.z).toFixed(2)}`,
        rotation: "-90 0 0",
        width: fog.width.toFixed(2),
        height: fog.height.toFixed(2),
        material:
          "color: #e5e0d4; opacity: 0.05; transparent: true; side: double",
        [`animation__drift${index}`]: `property: position; from: 0 ${fog.y.toFixed(2)} ${(centerZ + fog.z).toFixed(2)}; to: 0 ${(fog.y + 0.03).toFixed(2)} ${(centerZ + fog.z + 0.16).toFixed(2)}; dur: ${fog.dur}; dir: alternate; loop: true; easing: easeInOutSine`,
      }),
    );
  });
}

function addEnvironment() {
  archiveWorld.appendChild(
    createElement("a-light", {
      type: "ambient",
      intensity: "0.44",
      color: "#cbc6ba",
    }),
  );

  archiveWorld.appendChild(
    createElement("a-light", {
      type: "directional",
      intensity: "0.58",
      color: "#e2d2b0",
      position: "-5 8 2",
    }),
  );

  archiveWorld.appendChild(
    createElement("a-light", {
      type: "directional",
      intensity: "0.16",
      color: "#7e8875",
      position: "5 3 -4",
    }),
  );

  archiveWorld.appendChild(
    createElement("a-cylinder", {
      position: "0 -0.18 -4.1",
      radius: "9.4",
      height: "0.36",
      material:
        "src: #forestGroundDiffuse; normalMap: #forestGroundNormal; normalTextureRepeat: 4 4; repeat: 4 4; roughness: 1; metalness: 0",
    }),
  );

  archiveWorld.appendChild(
    createElement("a-cylinder", {
      position: "0 -0.04 -4.1",
      radius: "3.7",
      height: "0.08",
      color: "#2a2d25",
      material: "roughness: 1; metalness: 0",
    }),
  );

  archiveWorld.appendChild(
    createElement("a-box", {
      position: "0 2.56 -6.25",
      width: "6.4",
      height: "5.4",
      depth: "0.4",
      color: "#151712",
      material: "opacity: 0.46; transparent: true",
    }),
  );

  archiveWorld.appendChild(
    createElement("a-box", {
      position: "-3.06 2.72 -5.95",
      width: "0.26",
      height: "5.7",
      depth: "0.44",
      color: "#1b1914",
    }),
  );

  archiveWorld.appendChild(
    createElement("a-box", {
      position: "3.06 2.72 -5.95",
      width: "0.26",
      height: "5.7",
      depth: "0.44",
      color: "#1b1914",
    }),
  );

  archiveWorld.appendChild(
    createElement("a-box", {
      position: "0 5.08 -5.95",
      width: "6.1",
      height: "0.24",
      depth: "0.44",
      color: "#1d1914",
    }),
  );

  archiveWorld.appendChild(
    createElement("a-box", {
      position: "-4.32 0.74 -4.3",
      width: "2.74",
      height: "0.08",
      depth: "4.4",
      color: "#292d24",
    }),
  );

  archiveWorld.appendChild(
    createElement("a-box", {
      position: "4.32 0.74 -4.3",
      width: "2.74",
      height: "0.08",
      depth: "4.4",
      color: "#292d24",
    }),
  );

  addForestBackdrop(archiveWorld, -4.1);
}

function buildFocusWall() {
  const root = createElement("a-entity", { position: "0 0 -5.55" });

  root.appendChild(
    createElement("a-box", {
      position: "0 2.26 0",
      width: "4.92",
      height: "4.52",
      depth: "0.22",
      color: "#141612",
      material: "opacity: 0.58; transparent: true",
    }),
  );

  const accent = createElement("a-box", {
    position: "0 1.14 0.08",
    width: "2.42",
    height: "0.05",
    depth: "0.04",
    color: "#d0b683",
    material:
      "emissive: #8b6f45; emissiveIntensity: 0.14; opacity: 0.84; transparent: true",
  });
  root.appendChild(accent);

  const kicker = createText({
    value: "Biography",
    position: "0 4.02 0.08",
    align: "center",
    color: "#aeb9a2",
    width: "2.4",
  });
  root.appendChild(kicker);

  const title = createText({
    value: "Sinclair Ihuanyachukwu Nzenwata",
    position: "0 3.45 0.1",
    align: "center",
    color: "#f1ede4",
    width: "6.1",
    material: "emissive: #d8ccb7; emissiveIntensity: 0.08",
  });
  root.appendChild(title);

  const subtitle = createText({
    value: "Full Stack Software Engineer | AI Systems Builder",
    position: "0 2.88 0.12",
    align: "center",
    color: "#b7c5b1",
    width: "4.1",
  });
  root.appendChild(subtitle);

  const body = createText({
    value: "",
    position: "0 2.02 0.14",
    align: "center",
    color: "#ddd6ca",
    width: "4.5",
    wrapCount: "46",
  });
  root.appendChild(body);

  const meta = createText({
    value: "",
    position: "0 1.12 0.14",
    align: "center",
    color: "#d0b683",
    width: "3.2",
    wrapCount: "40",
  });
  root.appendChild(meta);

  const detailA = createText({
    value: "",
    position: "0 0.58 0.14",
    align: "center",
    color: "#d9d3c7",
    width: "4.3",
    wrapCount: "44",
  });
  root.appendChild(detailA);

  const detailB = createText({
    value: "",
    position: "0 0.08 0.14",
    align: "center",
    color: "#d9d3c7",
    width: "4.3",
    wrapCount: "44",
  });
  root.appendChild(detailB);

  const footnote = createText({
    value: "",
    position: "0 -0.42 0.14",
    align: "center",
    color: "#b8b2a7",
    width: "3.6",
    wrapCount: "38",
  });
  root.appendChild(footnote);

  archiveWorld.appendChild(root);
  state.focusWall = {
    accent,
    kicker,
    title,
    subtitle,
    body,
    meta,
    detailA,
    detailB,
    footnote,
  };
}

function updateFocusWall(content) {
  state.focusWall.kicker.setAttribute("value", content.kicker);
  state.focusWall.title.setAttribute("value", content.title);
  state.focusWall.subtitle.setAttribute("value", content.subtitle);
  state.focusWall.body.setAttribute("value", content.body);
  state.focusWall.meta.setAttribute("value", content.meta);
  state.focusWall.detailA.setAttribute("value", content.detailA);
  state.focusWall.detailB.setAttribute("value", content.detailB);
  state.focusWall.footnote.setAttribute("value", content.footnote);
  state.focusWall.accent.setAttribute("color", content.accentColor);
  state.focusWall.accent.setAttribute("material", "emissive", content.accentEmissive);
}

function configureProjectLink(project) {
  if (project && project.externalLink) {
    projectLink.href = project.externalLink;
    projectLink.textContent = project.linkLabel || "Open Project";
    projectLink.classList.remove("ghost-link-disabled");
    projectLink.setAttribute("aria-disabled", "false");
    return;
  }

  projectLink.href = "#";
  projectLink.textContent = project ? project.linkLabel || "No Public Link" : "No Public Link";
  projectLink.classList.add("ghost-link-disabled");
  projectLink.setAttribute("aria-disabled", "true");
}

function updateProjectSelectors() {
  state.projectSelectors.forEach((selector, index) => {
    const active = state.currentFocus === "project" && index === state.activeProjectIndex;
    selector.root.setAttribute(
      "animation__focus",
      `property: scale; to: ${active ? "1.03 1.03 1.03" : "1 1 1"}; dur: 220; easing: easeInOutCubic`,
    );
    selector.accent.setAttribute("material", "emissiveIntensity", active ? 0.3 : 0.12);
    selector.accent.setAttribute("material", "opacity", active ? 0.9 : 0.68);
    selector.plate.setAttribute("material", "opacity", active ? 0.82 : 0.58);
    selector.title.setAttribute("color", active ? "#f1ede4" : "#d9d3c7");
  });
}

function updateExperienceCarousel(animated = true) {
  const count = state.archiveData.experience.length;
  const targetRotation = -((360 / count) * state.activeExperienceIndex);
  if (animated) {
    state.experienceSpinRoot.setAttribute(
      "animation__spin",
      `property: rotation; to: 0 ${targetRotation} 0; dur: 900; easing: easeInOutCubic`,
    );
  } else {
    state.experienceSpinRoot.setAttribute("rotation", `0 ${targetRotation} 0`);
  }

  state.experienceCards.forEach((card, index) => {
    const active = index === state.activeExperienceIndex;
    card.root.setAttribute(
      "animation__focus",
      `property: scale; to: ${active ? "1 1 1" : "0.84 0.84 0.84"}; dur: 220; easing: easeInOutCubic`,
    );
    card.plate.setAttribute("material", "opacity", active ? 0.8 : 0.34);
    card.accent.setAttribute("material", "emissiveIntensity", active ? 0.28 : 0.08);
    card.body.setAttribute("color", active ? "#ddd6ca" : "#9e9a92");
  });
}

function showAbout() {
  const { identity, contact } = state.archiveData;
  state.currentFocus = "about";
  focusLabel.textContent = "Biography";
  configureProjectLink(null);
  updateProjectSelectors();
  updateExperienceCarousel(false);

  updateFocusWall({
    kicker: "Biography",
    title: identity.name,
    subtitle: identity.title,
    body: identity.longBio,
    meta: identity.location,
    detailA: `Contact / ${contact.map((item) => item.value).join("  •  ")}`,
    detailB: "Focus / Scalable systems, AI-powered tools, product-minded engineering.",
    footnote: "Select a project on the left or rotate the experience carousel on the right.",
    accentColor: "#d0b683",
    accentEmissive: "#8b6f45",
  });
}

function showProject(index) {
  const project = state.archiveData.projects[index];
  state.currentFocus = "project";
  state.activeProjectIndex = index;
  focusLabel.textContent = `${project.title} / ${project.status}`;
  configureProjectLink(project);
  updateProjectSelectors();

  updateFocusWall({
    kicker: "Selected System",
    title: project.title,
    subtitle: project.subtitle,
    body: project.description,
    meta: `Role / ${project.role}`,
    detailA: `Stack / ${project.stack.join(" / ")}`,
    detailB: `Challenge / ${project.challenge}\nSolution / ${project.solution}`,
    footnote: `Status / ${project.status}`,
    accentColor: index % 2 === 0 ? "#d0b683" : "#aeb9a2",
    accentEmissive: index % 2 === 0 ? "#8b6f45" : "#677360",
  });
}

function showExperience(index, animated = true) {
  const experience = state.archiveData.experience[index];
  state.currentFocus = "experience";
  state.activeExperienceIndex = index;
  focusLabel.textContent = `${experience.role} / ${experience.company}`;
  configureProjectLink(null);
  updateProjectSelectors();
  updateExperienceCarousel(animated);

  updateFocusWall({
    kicker: "Experience",
    title: experience.role,
    subtitle: `${experience.company} / ${experience.dates}`,
    body: experience.summary,
    meta: `Tools / ${experience.tools.join(" / ")}`,
    detailA: experience.bullets[0] || "",
    detailB: (experience.bullets[1] || "") + (experience.bullets[2] ? `\n${experience.bullets[2]}` : ""),
    footnote: "Use the carousel controls to move between roles.",
    accentColor: "#aeb9a2",
    accentEmissive: "#677360",
  });
}

function buildProjectZone(projects) {
  archiveWorld.appendChild(
    createText({
      value: "Selected Systems",
      position: "-4.38 4.48 -4.36",
      rotation: "0 22 0",
      align: "center",
      color: "#f0ebe1",
      width: "3.2",
      material: "emissive: #d8ccb7; emissiveIntensity: 0.08",
    }),
  );

  archiveWorld.appendChild(
    createText({
      value: "Choose a system to load it into the main wall",
      position: "-4.36 4.08 -4.34",
      rotation: "0 22 0",
      align: "center",
      color: "#b8b2a7",
      width: "2.2",
    }),
  );

  projects.forEach((project, index) => {
    const y = 3.35 - index * 0.74;
    const root = createElement("a-entity", {
      position: `-4.42 ${y.toFixed(2)} -4.18`,
      rotation: "0 22 0",
    });

    const plate = createElement("a-box", {
      width: "2.24",
      height: "0.62",
      depth: "0.16",
      color: "#141612",
      material: "opacity: 0.58; transparent: true",
    });
    root.appendChild(plate);

    const accent = createElement("a-box", {
      position: "-0.92 0 0.08",
      width: "0.05",
      height: "0.38",
      depth: "0.04",
      color: index % 2 === 0 ? "#d0b683" : "#aeb9a2",
      material:
        "emissive: #8b6f45; emissiveIntensity: 0.12; opacity: 0.68; transparent: true",
    });
    root.appendChild(accent);

    const title = createText({
      value: project.title,
      position: "0.08 0.12 0.1",
      align: "center",
      color: "#d9d3c7",
      width: "2.2",
    });
    root.appendChild(title);

    root.appendChild(
      createText({
        value: project.status,
        position: "0.08 -0.14 0.1",
        align: "center",
        color: "#b8b296",
        width: "1.5",
      }),
    );

    const hitbox = createElement("a-plane", {
      class: "clickable",
      position: "0 0 0.12",
      width: "2.12",
      height: "0.58",
      material: "transparent: true; opacity: 0.001",
    });
    root.appendChild(hitbox);

    hitbox.addEventListener("mouseenter", () => {
      playUiSound("hover");
      root.setAttribute(
        "animation__hover",
        "property: scale; to: 1.02 1.02 1.02; dur: 180; easing: easeInOutCubic",
      );
    });

    hitbox.addEventListener("mouseleave", () => {
      if (!(state.currentFocus === "project" && state.activeProjectIndex === index)) {
        root.setAttribute(
          "animation__hover",
          "property: scale; to: 1 1 1; dur: 180; easing: easeInOutCubic",
        );
      }
    });

    hitbox.addEventListener("click", () => {
      playUiSound("click");
      showProject(index);
    });

    archiveWorld.appendChild(root);
    state.projectSelectors.push({ root, plate, accent, title });
  });
}

function buildExperienceZone(experiences) {
  archiveWorld.appendChild(
    createText({
      value: "Experience Carousel",
      position: "4.18 4.48 -4.12",
      rotation: "0 -28 0",
      align: "center",
      color: "#f0ebe1",
      width: "3.4",
      material: "emissive: #d8ccb7; emissiveIntensity: 0.08",
    }),
  );

  archiveWorld.appendChild(
    createText({
      value: "Rotate through role chapters or click a card to focus it",
      position: "4.12 4.08 -4.1",
      rotation: "0 -28 0",
      align: "center",
      color: "#b8b2a7",
      width: "2.4",
    }),
  );

  const zoneRoot = createElement("a-entity", {
    position: "4.18 2.1 -4.1",
    rotation: "0 -28 0",
  });

  const spinRoot = createElement("a-entity", { id: "experienceSpinRoot" });
  zoneRoot.appendChild(spinRoot);
  state.experienceSpinRoot = spinRoot;

  const step = 360 / experiences.length;
  const radius = 0.96;

  experiences.forEach((experience, index) => {
    const angle = step * index;
    const radians = (angle * Math.PI) / 180;
    const x = Math.sin(radians) * radius;
    const z = Math.cos(radians) * radius;

    const root = createElement("a-entity", {
      position: `${x.toFixed(2)} 0 ${z.toFixed(2)}`,
      rotation: `0 ${(-angle).toFixed(2)} 0`,
      scale: "0.84 0.84 0.84",
    });

    const plate = createElement("a-box", {
      width: "2.18",
      height: "2.74",
      depth: "0.16",
      color: "#141612",
      material: "opacity: 0.34; transparent: true",
    });
    root.appendChild(plate);

    const accent = createElement("a-box", {
      position: "0 1.02 0.08",
      width: "1.32",
      height: "0.04",
      depth: "0.04",
      color: "#aeb9a2",
      material:
        "emissive: #677360; emissiveIntensity: 0.08; opacity: 0.72; transparent: true",
    });
    root.appendChild(accent);

    root.appendChild(
      createText({
        value: experience.role,
        position: "0 0.82 0.1",
        align: "center",
        color: "#f1ede4",
        width: "2.6",
      }),
    );

    root.appendChild(
      createText({
        value: experience.company,
        position: "0 0.46 0.1",
        align: "center",
        color: "#b7c5b1",
        width: "2.2",
        wrapCount: "28",
      }),
    );

    root.appendChild(
      createText({
        value: experience.dates,
        position: "0 0.14 0.1",
        align: "center",
        color: "#d0b683",
        width: "1.6",
      }),
    );

    const body = createText({
      value: experience.summary,
      position: "0 -0.42 0.1",
      align: "center",
      color: "#9e9a92",
      width: "2.0",
      wrapCount: "26",
    });
    root.appendChild(body);

    root.appendChild(
      createText({
        value: experience.tools.slice(0, 3).join(" / "),
        position: "0 -1.0 0.1",
        align: "center",
        color: "#b8b296",
        width: "1.8",
        wrapCount: "28",
      }),
    );

    const hitbox = createElement("a-plane", {
      class: "clickable",
      position: "0 0 0.12",
      width: "2.04",
      height: "2.62",
      material: "transparent: true; opacity: 0.001",
    });
    root.appendChild(hitbox);

    hitbox.addEventListener("mouseenter", () => {
      playUiSound("hover");
      if (index !== state.activeExperienceIndex) {
        root.setAttribute(
          "animation__hover",
          "property: scale; to: 0.9 0.9 0.9; dur: 180; easing: easeInOutCubic",
        );
      }
    });

    hitbox.addEventListener("mouseleave", () => {
      if (index !== state.activeExperienceIndex) {
        root.setAttribute(
          "animation__hover",
          "property: scale; to: 0.84 0.84 0.84; dur: 180; easing: easeInOutCubic",
        );
      }
    });

    hitbox.addEventListener("click", () => {
      playUiSound(index === state.activeExperienceIndex ? "click" : "move");
      showExperience(index, true);
    });

    spinRoot.appendChild(root);
    state.experienceCards.push({ root, plate, accent, body });
  });

  const prevButton = createElement("a-entity", {
    position: "-0.88 -2.02 1.18",
  });
  prevButton.appendChild(
    createElement("a-box", {
      width: "0.76",
      height: "0.42",
      depth: "0.14",
      color: "#181915",
      material: "opacity: 0.76; transparent: true",
    }),
  );
  prevButton.appendChild(
    createText({
      value: "Prev",
      position: "0 0 0.08",
      align: "center",
      color: "#ddd6ca",
      width: "1.1",
    }),
  );
  const prevHitbox = createElement("a-plane", {
    class: "clickable",
    width: "0.76",
    height: "0.42",
    position: "0 0 0.12",
    material: "transparent: true; opacity: 0.001",
  });
  prevButton.appendChild(prevHitbox);
  prevHitbox.addEventListener("click", () => {
    playUiSound("move");
    const nextIndex =
      (state.activeExperienceIndex - 1 + experiences.length) % experiences.length;
    showExperience(nextIndex, true);
  });
  prevHitbox.addEventListener("mouseenter", () => playUiSound("hover"));
  zoneRoot.appendChild(prevButton);

  const nextButton = createElement("a-entity", {
    position: "0.88 -2.02 1.18",
  });
  nextButton.appendChild(
    createElement("a-box", {
      width: "0.76",
      height: "0.42",
      depth: "0.14",
      color: "#181915",
      material: "opacity: 0.76; transparent: true",
    }),
  );
  nextButton.appendChild(
    createText({
      value: "Next",
      position: "0 0 0.08",
      align: "center",
      color: "#ddd6ca",
      width: "1.1",
    }),
  );
  const nextHitbox = createElement("a-plane", {
    class: "clickable",
    width: "0.76",
    height: "0.42",
    position: "0 0 0.12",
    material: "transparent: true; opacity: 0.001",
  });
  nextButton.appendChild(nextHitbox);
  nextHitbox.addEventListener("click", () => {
    playUiSound("move");
    const nextIndex = (state.activeExperienceIndex + 1) % experiences.length;
    showExperience(nextIndex, true);
  });
  nextHitbox.addEventListener("mouseenter", () => playUiSound("hover"));
  zoneRoot.appendChild(nextButton);

  archiveWorld.appendChild(zoneRoot);
  updateExperienceCarousel(false);
}

function populateOverlay(data) {
  archiveName.textContent = data.identity.name;
  archiveTitle.textContent = data.identity.title;
  archiveBio.textContent = data.identity.shortBio;
  archiveLocation.textContent = data.identity.location;
  projectCount.textContent = `${data.projects.length} selected systems`;
  experienceCount.textContent = `${data.experience.length} experience chapters`;
  contactLinks.innerHTML = data.contact
    .map(
      (item) =>
        `<a class="contact-link sound-trigger" href="${item.href}" target="_blank" rel="noreferrer">${item.label}: ${item.value}</a>`,
    )
    .join("");
}

async function loadArchiveData() {
  const response = await fetch("../archive-data.json", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

async function initializeArchive() {
  state.archiveData = await loadArchiveData();
  populateOverlay(state.archiveData);
  setupVoiceoverButton(state.archiveData.voiceover.archive);
  wireUiSounds();
  addEnvironment();
  buildFocusWall();
  buildProjectZone(state.archiveData.projects);
  buildExperienceZone(state.archiveData.experience);
  showAbout();
}

window.addEventListener("load", async () => {
  document.addEventListener("pointerdown", unlockAudio, { once: true });
  document.addEventListener("keydown", unlockAudio, { once: true });

  aboutButton.addEventListener("click", () => {
    showAbout();
  });

  ambienceButton.addEventListener("click", () => {
    setAmbienceEnabled(!state.ambienceEnabled);
  });

  closeTranscript.addEventListener("click", closeTranscriptModal);
  transcriptModal.addEventListener("click", (event) => {
    if (event.target === transcriptModal) {
      closeTranscriptModal();
    }
  });

  try {
    await initializeArchive();
  } catch (error) {
    console.error("Failed to initialize archive.", error);
    focusLabel.textContent = "Data load failed";
  }

  window.setTimeout(() => {
    bootScreen.classList.add("is-hidden");
  }, 360);
});
