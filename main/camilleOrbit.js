// camilleOrbit.js - FINAL MERGED VERSION
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

let currentSelectedPlanet = 0;
let animationSpeed = 1;
let isAnimationPlaying = true;
let currentSystemPlanets = [];
let animationTimer = null;
let currentContainer = null;
let currentStage = 1;
let currentSystemId = null;

const systemNarratives = {
  "KOI-351": {
    title: "Kepler-90",
    id: "kepler",
    descriptions: {
      'b': "The innermost planet, orbits in 7 days. Earth-sized.",
      'c': "Super-Earth, orbits every 9 days.",
      'd': "Mini-Neptune, about 2.9× Earth's size.",
      'e': "Sub-Neptune, 2.7× Earth's size, orbits in 92 days.",
      'f': "Sub-Neptune orbiting every 125 days.",
      'g': "Gas giant, 8.1× Earth size, 210-day orbit.",
      'h': "Jupiter-sized planet orbiting every 331 days.",
      'i': "AI-discovered planet, super-Earth orbiting every 14 days."
    },
    color: "#FFA500"
  },
  "TOI-178": {
    title: "TOI-178: The Cosmic Orchestra",
    id: "toi",
    descriptions: {
      'b': "The innermost planet, orbiting every 1.9 days.",
      'c': "Second planet, with a 3.2-day orbital period.",
      'd': "Third planet in the resonance chain, 6.6-day orbit.",
      'e': "Fourth planet in the chain, 9.9-day orbit.",
      'f': "Fifth planet in the chain, 15.2-day orbit.",
      'g': "Outermost planet, completing the 18:9:6:4:3 resonance pattern."
    },
    color: "#4682B4"
  },
  "GJ 667 C": {
    title: "GJ 667C: The Habitable Triad",
    id: "gj",
    descriptions: {
      'b': "Inner planet, too hot for habitability.",
      'c': "Super-Earth in the habitable zone, 28-day orbit.",
      'd': "Potential second habitable planet, 92-day orbit.",
      'e': "Outer planet, may be in the habitable zone.",
      'f': "Candidate planet, existence still debated.",
      'g': "Outermost candidate, existence still debated."
    },
    color: "#8B0000"
  }
};

export function renderSystem(containerId, planetData, stage = 1) {
  if (!planetData || planetData.length === 0) {
    console.warn(`No planet data provided for container: ${containerId}`);
    return;
  }

  const width = 600;
  const height = 600;
  const maxRadius = 280;

  const hostname = planetData[0].hostname;
  const systemInfo = systemNarratives[hostname] || {};
  const systemColor = systemInfo.color || "#FFFFFF";

  // Fix container selection - ensure we get the right element
  let container;
  if (typeof containerId === 'string') {
    // Handle both with and without # prefix
    const selector = containerId.startsWith('#') ? containerId : `#${containerId}`;
    container = d3.select(selector);
    
    // If that doesn't work, try selecting by ID directly
    if (container.empty()) {
      const element = document.getElementById(containerId.replace('#', ''));
      if (element) {
        container = d3.select(element);
      }
    }
  } else {
    container = d3.select(containerId);
  }
  
  if (container.empty()) {
    console.error(`Container not found: ${containerId}`);
    return;
  }

  container.selectAll("*").remove();

  const svg = container
    .append("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .style("background", "#000")
    .style("width", "100%")
    .style("height", "100%")
    .style("border-radius", "10px");

  // Add a central star
  svg.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 8)
    .style("fill", systemColor)
    .style("filter", "drop-shadow(0 0 10px " + systemColor + ")");

  // Process planet data with better error handling
  planetData = planetData
    .map(p => ({
      ...p,
      a: getOrbitValue(p),
      ecc: Math.max(0, Math.min(0.9, +(p.pl_orbeccen || 0)))
    }))
    .filter(p => p.a > 0 && Number.isFinite(p.a))
    .sort((a, b) => a.a - b.a);

  if (planetData.length === 0) {
    console.warn("No valid planet data after filtering");
    return;
  }

  const maxOrbitalDistance = d3.max(planetData, d => d.a);
  const minRadius = 40;

  const auToPixels = d3.scaleLinear()
    .domain([0, maxOrbitalDistance])
    .range([0, maxRadius - minRadius]);

  const radiusScale = d3.scaleSqrt()
    .domain([0.1, d3.max(planetData, d => d.pl_rade || 1)])
    .range([3, 12]);

  const tempColorScale = d3.scaleSequential(d3.interpolateRdYlBu)
    .domain([3000, 0]);

  // Draw orbits
  svg.selectAll(".orbit")
    .data(planetData)
    .enter()
    .append("ellipse")
    .attr("class", "orbit")
    .attr("cx", d => auToPixels(d.a * d.ecc))
    .attr("cy", 0)
    .attr("rx", d => auToPixels(d.a))
    .attr("ry", d => auToPixels(d.a * Math.sqrt(1 - d.ecc * d.ecc)))
    .style("fill", "none")
    .style("stroke", hostname === "TOI-178" ? "#335577" : "#555")
    .style("stroke-width", hostname === "TOI-178" ? 1.5 : 1)
    .style("stroke-dasharray", hostname === "TOI-178" ? "5,3" : "none");

  // Draw planets
  const planets = svg.selectAll(".planet")
    .data(planetData)
    .enter()
    .append("circle")
    .attr("class", "planet orbit-planet")
    .attr("r", d => getPlanetRadius(d, hostname, radiusScale))
    .attr("data-base-radius", d => getPlanetRadius(d, hostname, radiusScale))
    .style("fill", (d, i) => getPlanetColor(d, i, hostname, tempColorScale))
    .style("stroke", (d, i) => getPlanetStroke(d, i, hostname))
    .style("stroke-width", 1.5)
    .style("filter", d => getPlanetFilter(d, hostname));

  setupTooltips(planets, hostname, systemInfo);
  setupPlanetAnimation(planets, planetData, hostname, auToPixels);

  return { svg, planets, orbits: null, auToPixels };
}

export function initializeEnhancedSystem(containerId, hostname, stage = 1) {
  console.log(`Initializing enhanced system for ${hostname} in container ${containerId}`);
  
  if (!window.ExoplanetData || !window.ExoplanetData.isLoaded()) {
    console.log("Data not loaded yet, waiting...");
    window.ExoplanetData?.onDataLoaded(() => {
      const planetData = window.ExoplanetData.getByHostname(hostname);
      console.log(`Data loaded, found ${planetData.length} planets for ${hostname}`);
      renderSystem(containerId, planetData, stage);
    });
    return;
  }
  
  const planetData = window.ExoplanetData.getByHostname(hostname);
  console.log(`Found ${planetData.length} planets for ${hostname}`);
  
  if (planetData.length > 0) {
    renderSystem(containerId, planetData, stage);
  } else {
    console.warn(`No planets found for hostname: ${hostname}`);
  }
}

export function cleanupEnhancedSystem() {
  if (animationTimer) {
    animationTimer.stop();
    animationTimer = null;
  }
}

export function setupKeyboardNavigation() {
  document.addEventListener("keydown", (event) => {
    if (!currentSystemPlanets.length) return;
    if (event.key === "ArrowRight") {
      currentSelectedPlanet = (currentSelectedPlanet + 1) % currentSystemPlanets.length;
    } else if (event.key === "ArrowLeft") {
      currentSelectedPlanet = (currentSelectedPlanet - 1 + currentSystemPlanets.length) % currentSystemPlanets.length;
    }
  });
}

// ADDED: Render system in overview mode (Stage 1)
function renderOverviewSystem(system) {
  console.log(`🔧 FIXED: Rendering overview for: ${system.hostname}`);
  
  // Cleanup previous system
  cleanupEnhancedSystem();
  
  // Clear the main orbit container
  const orbitContainer = document.getElementById('orbit-container');
  if (orbitContainer) {
    orbitContainer.innerHTML = "";
  }
  
  // Hide interactive controls
  document.querySelectorAll('.system-interactive-controls').forEach(panel => {
    panel.style.display = 'none';
  });
  
  // Initialize enhanced system for Stage 1 (Overview mode)
  console.log('Initializing enhanced system for stage 1...');
  initializeEnhancedSystem('orbit-container', system.hostname, 1);
}

// //ADDED: Render system in interactive mode (Stage 2)
function renderInteractiveSystem(system) {
  console.log(`🔧 FIXED: Rendering interactive mode for: ${system.hostname}`);
  
  // Cleanup previous system
  cleanupEnhancedSystem();
  
  // Clear the main orbit container
  const orbitContainer = document.getElementById('orbit-container');
  if (orbitContainer) {
    orbitContainer.innerHTML = "";
  }
  
  // Initialize enhanced system for Stage 2 (Interactive mode)
  console.log('Initializing enhanced system for stage 2...');
const planetData = window.ExoplanetData.getByHostname(system.hostname);
if (planetData.length > 0) {
  renderSystem('orbit-container', planetData, 2);
  
  setTimeout(() => {
    const systemInfo = systemNarratives[system.hostname] || {};
    if (systemInfo.id) {
      showInteractiveControls(systemInfo.id);
      setupInteractiveAnimationControls();
    }
  }, 200);
}
  
  // Show interactive controls after a short delay
  setTimeout(() => {
    const systemInfo = systemNarratives[system.hostname] || {};
    if (systemInfo.id) {
      showInteractiveControls(systemInfo.id);
    }
  }, 200);
}

// === Helpers ===
function getOrbitValue(p) {
  if (p.pl_orbsmax) return +p.pl_orbsmax;
  if (p.pl_orbper && p.st_mass) {
    const P = +p.pl_orbper / 365.25;
    return Math.cbrt(P * P * +p.st_mass);
  }
  return 1;
}

function getPlanetRadius(d, hostname, scale) {
  return scale(+d.pl_rade || 1);
}

function getPlanetColor(d, i, hostname, scale) {
  const temp = d.pl_eqt || d.pl_teq || 500;
  return scale(+temp);
}

function getPlanetStroke(d, i, hostname) {
  return "#fff";
}

function getPlanetFilter(d, hostname) {
  if (hostname === "GJ 667 C") return "drop-shadow(0 0 4px rgba(0,255,0,0.6))";
  if (hostname === "TOI-178") return "drop-shadow(0 0 4px rgba(0,0,255,0.6))";
  return "drop-shadow(0 0 4px rgba(255,255,255,0.5))";
}

function setupTooltips(planets, hostname, systemInfo) {
  // Remove any existing tooltip first
  d3.select("#tooltip").remove();
  
  const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("color", "#fff")
    .style("background", "#111")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("z-index", "1000");

  planets.on("mouseover", function (event, d) {
    const letter = d.pl_name?.split(" ").pop();
    const desc = systemInfo.descriptions?.[letter] || "An exoplanet orbiting " + hostname;
    tooltip
      .style("opacity", 1)
      .html(`<strong>${d.pl_name || 'Unknown Planet'}</strong><br/>${desc}`);
  }).on("mousemove", function (event) {
    tooltip
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  }).on("mouseout", () => {
    tooltip.style("opacity", 0);
  });
}

function setupPlanetAnimation(planets, planetData, hostname, auToPixels) {
  if (animationTimer) animationTimer.stop();

  animationTimer = d3.timer(function (elapsed) {
    if (!isAnimationPlaying) return;
    planets.attr("transform", function (d) {
      const period = +d.pl_orbper || 365;
      const angle = (elapsed / 1000) * (2 * Math.PI / period) * animationSpeed;
      const a = d.a;
      const ecc = d.ecc;
      const rx = auToPixels(a);
      const ry = auToPixels(a * Math.sqrt(1 - ecc * ecc));
      return `translate(${rx * Math.cos(angle)}, ${ry * Math.sin(angle)})`;
    });
  });
}
