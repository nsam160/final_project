// camilleOrbit.js - FINAL MERGED VERSION
6// camilleOrbit.js - PHASE 1
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

//  PHASE 1: Enhanced global variables
let currentSelectedPlanet = 0;
let animationSpeed = 1;
let isAnimationPlaying = true;
let currentSystemPlanets = [];
let animationTimer = null;
let currentContainer = null;
let currentStage = 1;

//  GLOBAL REFERENCE - Make functions available to global.js
window.currentActiveSystem = null;
window.renderOverviewSystem = renderOverviewSystem;
window.renderInteractiveSystem = renderInteractiveSystem;

//  PHASE 1: Enhanced system narratives (preserved your existing structure)
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

// ✅ PHASE 1: Enhanced renderSystem function
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

  console.log(`Rendering system: ${hostname} with ${planetData.length} planets (Stage ${stage})`);
  
  // ✅ PHASE 1: Store current system data
  currentSystemPlanets = planetData.slice();
  currentSelectedPlanet = 0;
  currentContainer = containerId;
  currentStage = stage;

  // ✅ PHASE 1: Enhanced container selection (preserved your logic)
  let container;
  if (typeof containerId === 'string') {
    const selector = containerId.startsWith('#') ? containerId : `#${containerId}`;
    container = d3.select(selector);
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

  // ✅ PHASE 1: Enhanced background elements
  addSystemSpecificBackground(svg, hostname, stage);

  // ✅ PHASE 1: Enhanced central star with click functionality
  svg.append("circle")
    .attr("class", "star")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", hostname === "GJ 667 C" ? 8 : 12)
    .style("fill", systemColor)
    .style("filter", "drop-shadow(0 0 10px " + systemColor + ")")
    .style("cursor", "pointer")
    .on("click", function(event) {
      event.stopPropagation();
      if (stage === 1) {
        showSystemInfo();
      }
    });

  // ✅ Process planet data (preserved your existing logic)
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

  // ✅ Draw orbits (preserved your existing logic)
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

  // ✅ PHASE 1: Enhanced planets with selection support
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
    .style("cursor", "pointer")
    .style("filter", d => getPlanetFilter(d, hostname));

  // ✅ PHASE 1: Setup enhanced functionality
  setupTooltips(planets, hostname, systemInfo);
  addPlanetSelectionToSystem(planets, planetData, hostname, systemInfo);
  setupPlanetAnimation(planets, planetData, hostname, auToPixels);

  // ✅ PHASE 1: Initialize UI based on stage
  if (stage === 1) {
    // Overview mode - setup planet profile
    setTimeout(() => {
      updatePlanetProfile(0, planetData, hostname, systemInfo);
      setupAnimationControls('animation');
      setupPlanetNavigation();
    }, 100);
  } else if (stage === 2) {
    // Interactive mode - setup interactive controls
    setTimeout(() => {
      setupAnimationControls('interactive-animation');
      showInteractiveControls(systemInfo.id);
    }, 100);
  }

  return { svg, planets, orbits: null, auToPixels };
}

// ✅ PHASE 1: Enhanced system-specific background elements
function addSystemSpecificBackground(svg, hostname, stage = 1) {
  // System-specific decorations
  if (hostname === "GJ 667 C") {
    // Habitable zone
    svg.append("circle")
      .attr("class", "habitable-zone")
      .attr("cx", 0).attr("cy", 0).attr("r", 80)
      .attr("fill", "none")
      .attr("stroke", "#3a3")
      .attr("stroke-width", 8)
      .attr("stroke-opacity", stage === 2 ? 0.25 : 0.15);
      
    // Binary companion stars
    svg.append("circle")
      .attr("class", "companion-star")
      .attr("cx", -180).attr("cy", -160).attr("r", 6)
      .attr("fill", "#FFD700")
      .style("filter", "drop-shadow(0 0 5px gold)")
      .style("opacity", stage === 2 ? 0.8 : 0.6);
      
    svg.append("circle")
      .attr("class", "companion-star")
      .attr("cx", -195).attr("cy", -150).attr("r", 5)
      .attr("fill", "#FFD700")
      .style("filter", "drop-shadow(0 0 4px gold)")
      .style("opacity", stage === 2 ? 0.8 : 0.6);
      
    svg.append("text")
      .attr("x", -190).attr("y", -185)
      .attr("text-anchor", "middle")
      .attr("fill", "#aaa")
      .style("font-size", "10px")
      .style("opacity", stage === 2 ? 0.8 : 0.5)
      .text("GJ 667 A & B");
  } else if (hostname === "TOI-178") {
    // Musical notes (more prominent in interactive mode)
    const notePositions = [
      { x: -140, y: -120, rotation: 15, symbol: "♪" },
      { x: 120, y: 150, rotation: -20, symbol: "♫" },
      { x: 160, y: -80, rotation: 5, symbol: "♩" }
    ];
    
    notePositions.forEach(note => {
      svg.append("text")
        .attr("class", "musical-note")
        .attr("x", note.x).attr("y", note.y)
        .attr("transform", `rotate(${note.rotation}, ${note.x}, ${note.y})`)
        .style("font-size", stage === 2 ? "50px" : "40px")
        .style("opacity", stage === 2 ? 0.25 : 0.15)
        .style("fill", "#4682B4")
        .text(note.symbol);
    });
    
    svg.append("text")
      .attr("x", 0).attr("y", -220)
      .attr("text-anchor", "middle")
      .attr("fill", "#89CFF0")
      .style("font-size", "12px")
      .style("opacity", stage === 2 ? 0.9 : 0.7)
      .text("18 : 9 : 6 : 4 : 3 Resonance Chain");
  } else if (hostname === "KOI-351") {
    // Earth orbit comparison (more prominent in interactive mode)
    svg.append("circle")
      .attr("class", "earth-orbit-marker")
      .attr("cx", 0).attr("cy", 0).attr("r", 150)
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("stroke-width", stage === 2 ? 2 : 1)
      .attr("stroke-dasharray", "2,4")
      .attr("stroke-opacity", stage === 2 ? 0.5 : 0.3);
      
    svg.append("text")
      .attr("x", 150).attr("y", 10)
      .attr("fill", "#aaa")
      .style("font-size", "10px")
      .style("opacity", stage === 2 ? 0.7 : 0.5)
      .text("Earth's orbit");
  }
}

// ✅ PHASE 1: Planet selection functionality
function addPlanetSelectionToSystem(planets, planetData, hostname, systemInfo) {
  planets.on("click", function(event, d) {
    event.stopPropagation();
    const planetIndex = planetData.indexOf(d);
    selectPlanetInSystem(planetIndex, planetData, hostname, systemInfo);
  });
  
  // Highlight first planet by default in overview mode
  if (currentStage === 1 && planetData.length > 0) {
    selectPlanetInSystem(0, planetData, hostname, systemInfo);
  }
}

// ✅ PHASE 1: Select a specific planet and update the profile
function selectPlanetInSystem(planetIndex, planetData, hostname, systemInfo) {
  if (planetIndex < 0 || planetIndex >= planetData.length) return;
  
  currentSelectedPlanet = planetIndex;
  
  // Update visual selection
  const containerSelector = currentContainer.startsWith('#') ? currentContainer : `#${currentContainer}`;
  d3.select(containerSelector).selectAll(".orbit-planet")
    .classed("selected", (d, i) => i === planetIndex)
    .style("filter", function(d, i) {
      const baseFilter = getPlanetFilter(d, hostname);
      if (i === planetIndex) {
        return baseFilter + " drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))";
      }
      return baseFilter;
    })
    .attr("r", function(d, i) {
      const baseRadius = d3.select(this).attr("data-base-radius") || d3.select(this).attr("r");
      return i === planetIndex ? parseFloat(baseRadius) * 1.3 : baseRadius;
    });
  
  // Update planet profile panel
  updatePlanetProfile(planetIndex, planetData, hostname, systemInfo);
}

// ✅ PHASE 1: Update planet profile panel
function updatePlanetProfile(planetIndex, planetData, hostname, systemInfo) {
  if (planetIndex >= planetData.length) return;
  
  const planet = planetData[planetIndex];
  const planetLetter = planet.pl_name.split(" ").pop();
  const descriptions = systemInfo.descriptions || {};
  const description = descriptions[planetLetter] || 
    `${planet.pl_name} is a fascinating world in the ${hostname} system.`;
  
  // Update profile fields
  const updates = [
    { id: 'profile-planet-name', text: planet.pl_name || 'Unknown' },
    { id: 'profile-planet-mass', text: formatValue(planet.pl_bmasse, 'Earth masses') },
    { id: 'profile-planet-radius', text: formatValue(planet.pl_rade, 'Earth radii') },
    { id: 'profile-planet-period', text: formatValue(planet.pl_orbper, 'days') },
    { id: 'profile-planet-temp', text: formatValue(planet.pl_eqt, 'K') },
    { id: 'profile-planet-distance', text: `${(getOrbitValue(planet)).toFixed(3)} AU` },
    { id: 'profile-planet-description', text: description }
  ];
  
  updates.forEach(({ id, text }) => {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  });
  
  updatePlanetVisual(planet, hostname);
}

// ✅ PHASE 1: Show system information when star is clicked
function showSystemInfo() {
  if (currentSystemPlanets.length === 0) return;
  
  const hostname = currentSystemPlanets[0].hostname;
  const systemInfo = systemNarratives[hostname] || {};
  
  const updates = [
    { id: 'profile-planet-name', text: systemInfo.title || hostname },
    { id: 'profile-planet-mass', text: `${currentSystemPlanets.length} planets` },
    { id: 'profile-planet-radius', text: formatValue(currentSystemPlanets[0].st_rad, 'Solar radii') },
    { id: 'profile-planet-period', text: formatValue(currentSystemPlanets[0].st_age, 'Gyr') },
    { id: 'profile-planet-temp', text: formatValue(currentSystemPlanets[0].st_teff, 'K') },
    { id: 'profile-planet-distance', text: formatValue(currentSystemPlanets[0].sy_dist, 'parsecs') },
    { id: 'profile-planet-description', text: `This is the ${hostname} system, located ${formatValue(currentSystemPlanets[0].sy_dist, 'parsecs')} away. It contains ${currentSystemPlanets.length} confirmed planets. Click on individual planets to learn more about each world.` }
  ];
  
  updates.forEach(({ id, text }) => {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  });
  
  updatePlanetVisual({ hostname }, hostname, true);
}

// ✅ PHASE 1: Update 3D planet visual
function updatePlanetVisual(planet, hostname, isSystemView = false) {
  const visual = document.getElementById('planet-visual-display');
  if (!visual) return;
  
  let planetColor;
  if (isSystemView) {
    planetColor = hostname === "GJ 667 C" ? "#FF6347" : "#FFFF99";
  } else {
    planetColor = getPlanetDisplayColor(planet, hostname);
  }
  
  visual.style.background = `radial-gradient(circle at 30% 30%, ${planetColor}, ${planetColor}88)`;
  visual.style.boxShadow = `0 0 30px ${planetColor}66, inset -10px -10px 20px rgba(0, 0, 0, 0.3)`;
  
  // Special effects
  if (!isSystemView) {
    if (hostname === "GJ 667 C" && isInHabitableZone(planet)) {
      visual.style.boxShadow += `, 0 0 40px rgba(50, 205, 50, 0.4)`;
    } else if (hostname === "KOI-351" && planet.pl_name.includes("i")) {
      visual.style.boxShadow += `, 0 0 40px rgba(255, 215, 0, 0.4)`;
    }
  }
}

// ✅ PHASE 1: Setup animation controls
function setupAnimationControls(prefix = 'animation') {
  const playPauseBtn = document.getElementById(`${prefix}-play-pause`);
  const speedSlider = document.getElementById(`${prefix}-speed-slider`);
  const speedValue = document.getElementById(`${prefix}-speed-value`);
  
  if (playPauseBtn) {
    // Remove existing listeners
    playPauseBtn.replaceWith(playPauseBtn.cloneNode(true));
    const newBtn = document.getElementById(`${prefix}-play-pause`);
    
    newBtn.onclick = function() {
      isAnimationPlaying = !isAnimationPlaying;
      this.textContent = isAnimationPlaying ? '⏸️ Pause' : '▶️ Play';
      
      // Update both animation controls if they exist
      const otherBtn = document.getElementById(prefix === 'animation' ? 'interactive-animation-play-pause' : 'animation-play-pause');
      if (otherBtn) {
        otherBtn.textContent = this.textContent;
      }
    };
  }
  
  if (speedSlider && speedValue) {
    speedSlider.oninput = function() {
      animationSpeed = parseFloat(this.value);
      speedValue.textContent = `${animationSpeed}x`;
      
      // Update both speed controls if they exist
      const otherSlider = document.getElementById(prefix === 'animation' ? 'interactive-animation-speed-slider' : 'animation-speed-slider');
      const otherValue = document.getElementById(prefix === 'animation' ? 'interactive-animation-speed-value' : 'animation-speed-value');
      if (otherSlider && otherValue) {
        otherSlider.value = this.value;
        otherValue.textContent = speedValue.textContent;
      }
    };
  }
}

// ✅ PHASE 1: Setup planet navigation
function setupPlanetNavigation() {
  const nextPlanetBtn = document.getElementById('next-planet-btn');
  
  if (nextPlanetBtn) {
    // Remove existing listeners
    nextPlanetBtn.replaceWith(nextPlanetBtn.cloneNode(true));
    const newBtn = document.getElementById('next-planet-btn');
    
    newBtn.onclick = function() {
      if (currentSystemPlanets.length === 0) return;
      
      currentSelectedPlanet = (currentSelectedPlanet + 1) % currentSystemPlanets.length;
      const hostname = currentSystemPlanets[0].hostname;
      const systemInfo = systemNarratives[hostname] || {};
      selectPlanetInSystem(currentSelectedPlanet, currentSystemPlanets, hostname, systemInfo);
      
      // Visual feedback
      this.style.transform = 'scale(0.95)';
      setTimeout(() => this.style.transform = 'scale(1)', 150);
    };
  }
}

// ✅ PHASE 1: Show interactive controls (basic for now)
function showInteractiveControls(systemId) {
  console.log(`Showing interactive controls for: ${systemId}`);
  
  // Hide all interactive control panels
  document.querySelectorAll('.system-interactive-controls').forEach(panel => {
    panel.style.display = 'none';
  });
  
  // Show default message for now
  const defaultPanel = document.getElementById('default-interactive-message');
  if (defaultPanel) {
    defaultPanel.style.display = 'block';
    
    // Update title
    const titleElement = document.getElementById('interactive-controls-title');
    if (titleElement) {
      const systemNames = {
        'kepler': 'Kepler-90 Interactive Controls',
        'toi': 'TOI-178 Interactive Controls', 
        'gj': 'GJ 667C Interactive Controls'
      };
      titleElement.textContent = systemNames[systemId] || 'Interactive Controls';
    }
  }
}

// ✅ PHASE 1: Enhanced initializeEnhancedSystem (preserved your existing logic)
export function initializeEnhancedSystem(containerId, hostname, stage = 1) {
  console.log(`Initializing enhanced system for ${hostname} in container ${containerId} (Stage ${stage})`);
  
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

// ✅ PHASE 1: Enhanced cleanup
export function cleanupEnhancedSystem() {
  if (animationTimer) {
    animationTimer.stop();
    animationTimer = null;
  }
  
  // Remove any global tooltips
  d3.select("#tooltip").remove();
  
  // Reset state variables
  currentSystemPlanets = [];
  currentSelectedPlanet = 0;
  isAnimationPlaying = true;
  animationSpeed = 1;
  currentContainer = null;
  currentStage = 1;
}

// ✅ PHASE 1: Enhanced keyboard navigation
export function setupKeyboardNavigation() {
  document.addEventListener("keydown", (event) => {
    if (!currentSystemPlanets.length) return;
    
    switch(event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (currentStage === 1) {
          currentSelectedPlanet = currentSelectedPlanet > 0 ? 
            currentSelectedPlanet - 1 : currentSystemPlanets.length - 1;
          const hostname = currentSystemPlanets[0].hostname;
          const systemInfo = systemNarratives[hostname] || {};
          selectPlanetInSystem(currentSelectedPlanet, currentSystemPlanets, hostname, systemInfo);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (currentStage === 1) {
          currentSelectedPlanet = (currentSelectedPlanet + 1) % currentSystemPlanets.length;
          const hostname = currentSystemPlanets[0].hostname;
          const systemInfo = systemNarratives[hostname] || {};
          selectPlanetInSystem(currentSelectedPlanet, currentSystemPlanets, hostname, systemInfo);
        }
        break;
      case ' ':
        event.preventDefault();
        const playBtn = document.getElementById(currentStage === 1 ? 'animation-play-pause' : 'interactive-animation-play-pause');
        playBtn?.click();
        break;
    }
  });
}

// ✅ PHASE 1: Render system in overview mode (Stage 1) - FIXED
function renderOverviewSystem(system) {
  console.log(`🔧 Rendering overview for: ${system.hostname}`);
  
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

// ✅ PHASE 1: Render system in interactive mode (Stage 2) - FIXED
function renderInteractiveSystem(system) {
  console.log(`🔧 Rendering interactive mode for: ${system.hostname}`);
  
  // Cleanup previous system
  cleanupEnhancedSystem();
  
  // Clear the main orbit container
  const orbitContainer = document.getElementById('orbit-container');
  if (orbitContainer) {
    orbitContainer.innerHTML = "";
  }
  
  // Initialize enhanced system for Stage 2 (Interactive mode)
  console.log('Initializing enhanced system for stage 2...');
  initializeEnhancedSystem('orbit-container', system.hostname, 2);
  
  // Show interactive controls after a short delay
  setTimeout(() => {
    const systemInfo = systemNarratives[system.hostname] || {};
    if (systemInfo.id) {
      showInteractiveControls(systemInfo.id);
    }
  }, 200);
}

// ✅ PHASE 1: Enhanced helper functions (preserved your existing logic where possible)
function getOrbitValue(p) {
  if (p.pl_orbsmax) return +p.pl_orbsmax;
  if (p.pl_orbper && p.st_mass) {
    const P = +p.pl_orbper / 365.25;
    return Math.cbrt(P * P * +p.st_mass);
  }
  return 1;
}

function getPlanetRadius(d, hostname, scale) {
  const baseSize = scale(+d.pl_rade || 1);
  
  if (hostname === "KOI-351") {
    return baseSize * 1.2;
  } 
  else if (hostname === "GJ 667 C" && isInHabitableZone(d)) {
    return baseSize * 1.3;
  }
  else if (hostname === "TOI-178") {
    const planetLetter = d.pl_name.split(" ").pop();
    const letterIndex = (planetLetter.charCodeAt(0) || 98) - 98;
    return baseSize * (1 + (letterIndex * 0.05));
  }
  
  return baseSize;
}

function getPlanetColor(d, i, hostname, scale) {
  if (hostname === "KOI-351") {
    return i < 4 ? "#B8A89A" : scale(d.pl_eqt || 0);
  } 
  else if (hostname === "TOI-178") {
    const densities = [0.5, 1.0, 1.5, 0.8, 2.0, 1.2];
    const densityIndex = Math.min(i, densities.length - 1);
    const brightness = 40 + (densities[densityIndex] * 30);
    return `hsl(210, 80%, ${brightness}%)`;
  } 
  else if (hostname === "GJ 667 C") {
    return isInHabitableZone(d) ? "#50C878" : "#8B4513";
  }
  
  const temp = d.pl_eqt || d.pl_teq || 500;
  return scale(+temp);
}

function getPlanetStroke(d, i, hostname) {
  if (hostname === "GJ 667 C" && isInHabitableZone(d)) {
    return "#32CD32";
  } 
  else if (hostname === "KOI-351" && d.pl_name.includes("i")) {
    return "#FFC107";
  }
  else if (hostname === "TOI-178") {
    const planetLetter = d.pl_name.split(" ").pop();
    const letterIndex = (planetLetter.charCodeAt(0) || 98) - 98;
    const hue = 210 + (letterIndex * 20);
    return `hsl(${hue}, 70%, 60%)`;
  }
  
  return "rgba(255,255,255,0.3)";
}

function getPlanetFilter(d, hostname) {
  if (hostname === "GJ 667 C" && isInHabitableZone(d)) {
    return "drop-shadow(0 0 5px rgba(50, 205, 50, 0.8))";
  } else if (hostname === "KOI-351" && d.pl_name.includes("i")) {
    return "drop-shadow(0 0 5px rgba(255, 215, 0, 0.8))";
  } else if (hostname === "TOI-178") {
    return "drop-shadow(0 0 4px rgba(70, 130, 180, 0.7))";
  }
  return "drop-shadow(0 0 4px rgba(0, 150, 255, 0.7))";
}

function getPlanetDisplayColor(planet, hostname) {
  if (hostname === "KOI-351") {
    return planet.pl_name.includes("i") ? "#feca57" : "#ff6b6b";
  } else if (hostname === "TOI-178") {
    return "#4ecdc4";
  } else if (hostname === "GJ 667 C") {
    return isInHabitableZone(planet) ? "#50C878" : "#8B4513";
  }
  return "#4ecdc4";
}

function isInHabitableZone(planet) {
  const orbitalPeriod = +planet.pl_orbper || 0;
  return orbitalPeriod >= 20 && orbitalPeriod <= 60;
}

function formatValue(value, unit) {
  const num = parseFloat(value);
  return isNaN(num) ? "Unknown" : `${num.toFixed(2)} ${unit}`;
}

// ✅ PHASE 1: Enhanced tooltips (preserved your existing logic)
function setupTooltips(planets, hostname, systemInfo) {
  // Remove any existing tooltip first
  d3.select("#tooltip").remove();
  
  const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("color", "#fff")
    .style("background", "rgba(0, 0, 0, 0.85)")
    .style("padding", "10px")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("z-index", "999")
    .style("max-width", "300px")
    .style("font-size", "0.9rem");

  planets.on("mouseover", function (event, d) {
    const planetLetter = d.pl_name?.split(" ").pop();
    const descriptions = systemInfo.descriptions || {};
    const description = descriptions[planetLetter] || `A planet in the ${hostname} system.`;
    
    let specialInfo = "";
    if (hostname === "TOI-178") {
      specialInfo = `<p style="color: #4ecdc4; font-style: italic;">Part of the cosmic orchestra's resonance chain.</p>`;
    } else if (hostname === "GJ 667 C" && isInHabitableZone(d)) {
      specialInfo = `<p style="color: #50C878; font-style: italic;">Located in the star's habitable zone.</p>`;
    } else if (hostname === "KOI-351" && d.pl_name.includes("i")) {
      specialInfo = `<p style="color: #feca57; font-style: italic;">Discovered by Google's AI in 2017.</p>`;
    }
    
    tooltip.style("opacity", 1)
      .html(`
        <strong style="color: #fff; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 5px; margin-bottom: 5px; display: block;">${d.pl_name}</strong>
        <p style="margin: 5px 0;">${description}</p>
        ${specialInfo}
        <div style="margin-top: 10px;">
          <div>Mass: ${formatValue(d.pl_bmasse, 'Earth masses')}</div>
          <div>Radius: ${formatValue(d.pl_rade, 'Earth radii')}</div>
          <div>Period: ${formatValue(d.pl_orbper, 'days')}</div>
          <div>Temperature: ${formatValue(d.pl_eqt, 'K')}</div>
          <div>Discovery: ${d.disc_year || 'Unknown'}</div>
        </div>
      `);
  }).on("mousemove", function (event) {
    tooltip.style("left", (event.pageX + 10) + "px")
           .style("top", (event.pageY - 28) + "px");
  }).on("mouseout", () => {
    tooltip.style("opacity", 0);
  });
}

// ✅ PHASE 1: Enhanced planet animation (improved from your existing logic)
function setupPlanetAnimation(planets, planetData, hostname, auToPixels) {
  if (animationTimer) animationTimer.stop();

  animationTimer = d3.timer(function (elapsed) {
    if (!isAnimationPlaying) return;
    
    planets.attr("transform", function (d, i) {
      const period = +d.pl_orbper || 365;
      const ecc = d.ecc;
      const a = d.a;
      
      // System-specific speed factors
      let speedFactor = 1;
      if (hostname === "TOI-178") speedFactor = 0.7;
      else if (hostname === "GJ 667 C") speedFactor = 1.2;
      
      // Calculate orbital position
      const timeScale = period * 100 / speedFactor;
      const progress = (elapsed * animationSpeed / timeScale) % 1;
      const M = progress * 2 * Math.PI;
      
      // Solve Kepler's equation
      let E = M;
      for (let j = 0; j < 5; j++) {
        E = M + ecc * Math.sin(E);
      }
      
      // Position in orbital plane
      let x_rel = a * (Math.cos(E) - ecc);
      let y_rel = a * Math.sqrt(1 - ecc * ecc) * Math.sin(E);
      
      // Add ellipse center offset
      let x_orb = x_rel + (a * ecc);
      let y_orb = y_rel;
      
      // Convert to screen coordinates
      const x = auToPixels(x_orb);
      const y = auToPixels(y_orb);
      
      return `translate(${x}, ${y})`;
    });
  });
}