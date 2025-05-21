import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// ===========================
// Nghi's Code 
// ===========================

const scenes = []
const cameras = []
const renderers = []
const controls = []

function createSystem(starRadius, planetsRadius){
    scenes.append(new THREE.Scene());
    cameras.append(new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000));
    renderers.append(new THREE.WebGLRenderer());

    const current_scene = scenes.at(-1);
    const current_camera = cameras.at(-1);
    const current_renderer = renderers.at(-1);

    current_renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(current_renderer.domElement);

    controls.append(new OrbitControls(current_camera, current_renderer.domElement));
    controls[controls.length - 1].enableDamping = true;


}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const control = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Star
const star = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
scene.add(star);

// Planet
const planet = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x00aaff })
);
scene.add(planet);

// Light
scene.add(new THREE.AmbientLight(0xffffff));

// Position camera
camera.position.z = 3;

function animate(time) {
  requestAnimationFrame(animate);
  control.update();
  const t = time / 1000; // time in seconds
  const radius = 1.5;
  planet.position.x = radius * Math.cos(t);
  planet.position.z = radius * Math.sin(t); // circular orbit in XZ plane
  renderer.render(scene, camera);
}
animate();

// ==================================================
// D3 ORBIT STORIES Global Code: Camille's Code START: Scroll to line:279
// ==================================================
import { renderSystem } from './camilleOrbit.js';

const visitedSystems = new Set();
let allExoplanets = [];
let showingConnections = false;

const overview = document.getElementById("overview");
const detailedView = document.getElementById("detailed-view");
const orbitContainer = document.getElementById("orbit-container");
const synthesis = document.getElementById("synthesis");

const systemData = [
  {
    id: "kepler",
    hostname: "KOI-351",
    title: "Kepler-90: The Cosmic Mirror",
    shortDesc: "The first 8-planet system discovered",
    fullDesc: "Kepler-90 is a stellar twin to our Sun, hosting a planetary system that eerily mirrors our own...",
    color: "#FFA500",
    position: { x: 25, y: 20 }
  },
  {
    id: "toi",
    hostname: "TOI-178",
    // "TOI-178: The Cosmic Orchestra",
    title: "TOI-178",
    shortDesc: "Six planets dancing in perfect resonance",
    //orchestra
    fullDesc: "TOI-178 is the universe's most precisely tuned ...",
    color: "#4682B4",
    position: { x: 50, y: 65 }
  },
  {
    id: "gj",
    hostname: "GJ 667 C",
    title: "GJ 667C: The Habitable Triad",
    shortDesc: "Multiple potentially habitable worlds",
    fullDesc: "GJ 667C tells a story of cosmic habitability...",
    color: "#8B0000",
    position: { x: 75, y: 20 }
  }
];

// Load exoplanet data
d3.csv("exoplanet.csv").then(data => {
  allExoplanets = data;
  systemData.forEach(system => {
    const planetData = data.filter(d => d.hostname === system.hostname);
    drawMiniSystem(`#mini-${system.id}`, planetData);
  });
  setupConnectionLines();
  enhanceCapsules();
});

// Draw mini orbit previews
function drawMiniSystem(selector, planets) {
  const svg = d3.select(selector).attr("viewBox", "0 0 100 80");
  svg.selectAll("*").remove();
  const center = 50;
  const maxAU = d3.max(planets, d => +d.pl_orbsmax || getOrbitValue(d)) || 1;
  const scale = d3.scaleLinear().domain([0, maxAU]).range([3, 25]);

  svg.append("circle")
    .attr("cx", center)
    .attr("cy", 40)
    .attr("r", 4)
    .attr("fill", selector.includes("gj") ? "#FF6347" : "#FFFF99");

  svg.selectAll(".orbit")
    .data(planets).enter()
    .append("circle")
    .attr("class", "orbit")
    .attr("cx", center).attr("cy", 40)
    .attr("r", d => scale(+d.pl_orbsmax || getOrbitValue(d)))
    .attr("stroke", "#aaa")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 0.5);

  if (selector.includes("gj")) {
    svg.append("circle")
      .attr("cx", center).attr("cy", 40).attr("r", 15)
      .attr("stroke", "#3a3").attr("stroke-width", 2)
      .attr("fill", "none").attr("stroke-opacity", 0.3);
  }

  svg.selectAll(".planet")
    .data(planets).enter()
    .append("circle")
    .attr("class", "planet")
    .attr("cx", (d, i) => center + scale(+d.pl_orbsmax || getOrbitValue(d)) * Math.cos(i * Math.PI / 4))
    .attr("cy", (d, i) => 40 + scale(+d.pl_orbsmax || getOrbitValue(d)) * Math.sin(i * Math.PI / 4))
    .attr("r", d => Math.min(1.2 * (+d.pl_rade || 1) / 2, 2.5))
    .attr("fill", (d, i) =>
      selector.includes("gj") ? "#32CD32" :
      selector.includes("kepler") ? (i < 4 ? "#8B8378" : "#4682B4") :
      "#66B2FF"
    );
}

// Show detailed view
function showDetailedSystem(systemKey) {
  const system = systemData.find(s => s.id === systemKey);
  document.getElementById("system-title").textContent = system.title;
  document.getElementById("system-description").textContent = system.fullDesc;

  const data = allExoplanets.filter(d => d.hostname === system.hostname);
  orbitContainer.innerHTML = "";
  const container = document.createElement("div");
  container.id = `container-${system.id}`;
  orbitContainer.appendChild(container);
  renderSystem(`container-${system.id}`, data);
}

// Capsule click + back
function enhanceCapsules() {
  document.querySelectorAll(".capsule").forEach(el => {
    const id = el.dataset.system;
    const marker = document.createElement("div");
    marker.className = "visited-marker";
    marker.textContent = "Visited";
    el.appendChild(marker);

    el.addEventListener("click", () => {
      el.classList.add("visited");
      visitedSystems.add(id);
      overview.style.opacity = 0;
      setTimeout(() => {
        overview.style.display = "none";
        showDetailedSystem(id);
        detailedView.style.display = "block";
        detailedView.style.opacity = 1;
      }, 400);
      checkStoryProgression();
    });
  });

  document.getElementById("back-button").addEventListener("click", () => {
    detailedView.style.opacity = 0;
    setTimeout(() => {
      detailedView.style.display = "none";
      orbitContainer.innerHTML = "";
      overview.style.display = "flex";
      overview.style.opacity = 1;
    }, 400);
  });
}

// Connections
function setupConnectionLines() {
  if (document.getElementById("capsule-connections")) return;
  const container = document.createElement("svg");
  container.id = "capsule-connections";
  Object.assign(container.style, {
    position: "absolute", top: "0", left: "0", width: "100%", height: "100%",
    pointerEvents: "none", zIndex: "0"
  });
  overview.insertBefore(container, overview.firstChild);
  const svg = d3.select("#capsule-connections");

  svg.selectAll("path").data([
    ["kepler", "toi"],
    ["toi", "gj"],
    ["gj", "kepler"]
  ]).enter().append("path")
    .attr("class", "connection-line")
    .attr("d", ([f, t]) => generateCurvedPath(f, t))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .attr("fill", "none")
    .attr("stroke-dasharray", "5,3")
    .style("opacity", 0);
}

function checkStoryProgression() {
  if (visitedSystems.size === systemData.length && !showingConnections) {
    showingConnections = true;
    setTimeout(() => {
      document.querySelectorAll(".connection-line").forEach((line, i) => {
        setTimeout(() => line.classList.add("visible"), i * 500);
      });
      setTimeout(() => synthesis.style.display = "block", 2000);
    }, 500);
  }
}

// Curve and orbit helpers
function generateCurvedPath(from, to) {
  const a = systemData.find(s => s.id === from);
  const b = systemData.find(s => s.id === to);
  const cx = (a.position.x + b.position.x) / 2;
  const cy = (a.position.y + b.position.y) / 2 + (from === "gj" ? -10 : 10);
  return `M${a.position.x}% ${a.position.y}% Q${cx}% ${cy}% ${b.position.x}% ${b.position.y}%`;
}

function getOrbitValue(p) {
  if (p.pl_orbsmax) return +p.pl_orbsmax;
  if (p.pl_orbper && p.st_mass) {
    const P = +p.pl_orbper / 365.25;
    return Math.cbrt(P * P * +p.st_mass);
  }
  return 1.0;
}
  // Add more interactive elements here
// ==================================================
// D3 ORBIT STORIES Global Code: Camille's Code END
// ==================================================


// ==================================================
// Jacquelyn's Code
// ==================================================

// Defining Planets in Timeline
const planets = [
  { name: "Mercury", discovered: "Prehistoric", color: "#b1b1b1", radius: 10 },
  { name: "Venus", discovered: "Prehistoric", color: "#f5deb3", radius: 20 },
  { name: "Earth", discovered: "Prehistoric", color: "#2e8b57", radius: 22 },
  { name: "Mars", discovered: "Prehistoric", color: "#b22222", radius: 18 },
  { name: "Jupiter", discovered: "Prehistoric", color: "#d2b48c", radius: 40 },
  { name: "Saturn", discovered: "Prehistoric", color: "#deb887", radius: 35 },
  { name: "Uranus", discovered: "1781", color: "#afeeee", radius: 28 },
  { name: "Neptune", discovered: "1846", color: "#4169e1", radius: 28 }
];

// SVG Container
const svg = d3.select("#timeline")
  .append("svg")
  .attr("width", "100%")
  .attr("height", planets.length * 150)
  .style("background", "#000");

const g = svg.selectAll("g")
  .data(planets)
  .enter()
  .append("g")
  .attr("transform", (d, i) => `translate(200, ${i * 150 + 75})`);

// Circles for each planet
g.append("circle")
  .attr("r", d => d.radius)
  .attr("fill", d => d.color)
  .attr("stroke", "#fff")
  .attr("stroke-width", 2);

// Adding labels
g.append("text")
  .text(d => `${d.name} — Discovered: ${d.discovered}`)
  .attr("x", d => d.radius + 20)
  .attr("y", 5)
  .attr("fill", "#fff")
  .attr("font-size", "16px");

// ==================================================
// Jacquelyn's Code END
// ==================================================
