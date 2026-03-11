const state = {
  cargos: [],
  activeTrailer: "lowloader",
  selectedCargo: null,
};

const sampleImages = [
  "./assets/cargo_1.svg",
  "./assets/cargo_2.svg",
  "./assets/cargo_3.svg",
  "./assets/cargo_4.svg",
];

const el = {
  activeTrailer: document.getElementById("activeTrailer"),
  activeCargo: document.getElementById("activeCargo"),
  lowloader: document.getElementById("lowloader"),
  lowloaderModel: document.getElementById("lowloaderModel"),
  flatbed: document.getElementById("flatbed"),
  cargoLow: document.getElementById("cargoLow"),
  cargoFlat: document.getElementById("cargoFlat"),
  cargoTrack: document.getElementById("cargoTrack"),
  toLowloader: document.getElementById("toLowloader"),
  toFlatbed: document.getElementById("toFlatbed"),
};

function colorFromName(name) {
  let s = 0;
  for (const ch of name) s += ch.charCodeAt(0);
  const r = 60 + (s % 120);
  const g = 110 + (s % 100);
  const b = 90 + (s % 110);
  return `rgb(${r}, ${g}, ${b})`;
}

function imageForCargo(cargo) {
  const idx = Math.abs((cargo.id || 0) - 1) % sampleImages.length;
  return sampleImages[idx];
}

function supportsActive(cargo) {
  return state.activeTrailer === "lowloader" ? cargo.supports_lowloader : cargo.supports_flatbed;
}

function applyCargo() {
  if (!state.selectedCargo) return;

  const col = colorFromName(state.selectedCargo.name);
  const img = imageForCargo(state.selectedCargo);

  el.activeCargo.textContent = state.selectedCargo.name;

  el.cargoLow.style.backgroundColor = col;
  el.cargoFlat.style.backgroundColor = col;
  el.cargoLow.style.backgroundImage = `url(${img})`;
  el.cargoFlat.style.backgroundImage = `url(${img})`;
  el.cargoLow.style.backgroundSize = "cover";
  el.cargoFlat.style.backgroundSize = "cover";
  el.cargoLow.style.display = state.activeTrailer === "lowloader" ? "block" : "none";
  el.cargoFlat.style.display = state.activeTrailer === "flatbed" ? "block" : "none";

  document.querySelectorAll(".cargo-card").forEach((card) => {
    card.classList.toggle("active", Number(card.dataset.id) === state.selectedCargo.id);
  });
}

function renderTrailers() {
  const lowMain = state.activeTrailer === "lowloader";
  el.activeTrailer.textContent = lowMain ? "Lowloader" : "Flachbett";

  if (lowMain) {
    el.lowloader.className = "trailer trailer-main";
    el.lowloader.style.display = "block";
    el.flatbed.style.display = "none";
  } else {
    el.flatbed.className = "trailer trailer-main";
    el.flatbed.style.display = "block";
    el.lowloader.style.display = "none";
  }

  applyCargo();
  renderCargoCards();
}

function renderCargoCards() {
  el.cargoTrack.innerHTML = "";

  state.cargos.forEach((cargo) => {
    const card = document.createElement("button");
    card.className = "cargo-card";
    card.type = "button";
    card.dataset.id = String(cargo.id);

    const thumb = document.createElement("span");
    thumb.className = "cargo-thumb";
    thumb.style.backgroundColor = colorFromName(cargo.name);
    thumb.style.backgroundImage = `linear-gradient(rgba(0,0,0,.08), rgba(0,0,0,.28)), url(${imageForCargo(cargo)})`;

    const name = document.createElement("div");
    name.className = "cargo-name";
    name.textContent = cargo.name;

    const meta = document.createElement("div");
    const ok = supportsActive(cargo);
    meta.className = `cargo-meta${ok ? "" : " warn"}`;
    meta.textContent = ok ? "Kompatibel" : "Nicht empfohlen";

    card.append(thumb, name, meta);

    if (state.selectedCargo && state.selectedCargo.id === cargo.id) {
      card.classList.add("active");
    }

    card.addEventListener("click", () => {
      state.selectedCargo = cargo;
      applyCargo();
    });

    el.cargoTrack.appendChild(card);
  });
}

function setTrailer(trailerKey) {
  state.activeTrailer = trailerKey;
  renderTrailers();
}

function initEvents() {
  el.toLowloader.addEventListener("click", () => setTrailer("lowloader"));
  el.toFlatbed.addEventListener("click", () => setTrailer("flatbed"));

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") setTrailer("lowloader");
    if (e.key === "ArrowRight") setTrailer("flatbed");
  });
}

function forceVisibleMaterials() {
  const modelViewer = el.lowloaderModel;
  if (!modelViewer || !modelViewer.model || !modelViewer.model.materials) return;

  for (const material of modelViewer.model.materials) {
    if (!material || !material.pbrMetallicRoughness) continue;

    const pbr = material.pbrMetallicRoughness;
    // No forced overrides; keep GLB materials as-is.
    pbr.setBaseColorFactor(pbr.baseColorFactor || [1, 1, 1, 1]);
  }
}

async function boot() {
  if (el.lowloaderModel) {
    el.lowloaderModel.addEventListener("load", forceVisibleMaterials);
    el.lowloaderModel.addEventListener("scene-graph-ready", forceVisibleMaterials);
    // Fallback in case the load event fires before the scene graph is ready.
    setTimeout(forceVisibleMaterials, 500);
  }

  const res = await fetch("./data.json", { cache: "no-store" });
  const data = await res.json();

  state.cargos = data.cargos || [];
  state.selectedCargo = state.cargos[0] || null;

  initEvents();
  renderTrailers();
}

boot().catch((err) => {
  console.error(err);
  el.activeCargo.textContent = "Fehler beim Laden";
});
