// camilleOrbit.js 
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

//Enhanced global variables
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

// system narratives
const systemNarratives = {
  "KOI-351": {
    title: "Kepler-90",
    id: "kepler",
    descriptions: {
      'b': "The innermost planet, orbits in 7 days. Earth-sized.",
      'c': "Super-Earth, orbits every 9 days.",
      'd': "Neptune, about 2.9× Earth's size.",
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

//Enhanced renderSystem function
export function renderSystem(containerId, planetData, stage = 1) {
  if (!planetData || planetData.length === 0) {
    console.warn(`No planet data provided for container: ${containerId}`);
    return;
  }

  const width = 900;  // Same for both stages
  const height = 600;  // Same for both stages
  const maxRadius = 280;  // Same for both stages

  const hostname = planetData[0].hostname;
  const systemInfo = systemNarratives[hostname] || {};
  const systemColor = systemInfo.color || "#FFFFFF";

  console.log(`Rendering system: ${hostname} with ${planetData.length} planets (Stage ${stage})`);
  
  //Store current system data
  currentSystemPlanets = planetData.slice();
  currentSelectedPlanet = 0;
  currentContainer = containerId;
  currentStage = stage;

  //Enhanced container selection (preserved your logic)
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
    // .style("background", "transparent")
    .style("width", "100%")
    .style("height", "100%")
    .style("border-radius", "10px");

  //background elements
  addSystemSpecificBackground(svg, hostname, stage);

  //central star with click functionality
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

  //Process planet data
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

  function calcRingPos(planet, segment = 64){
    const points = [];
    const ecc = planet.ecc;
    const a = planet.a;

    for (let i = 0; i <= segment; i++) {
      let M = 2 * Math.PI * (i / segment);
      let E = M;
      for (let j = 0; j < 5; j++){
        E = M + ecc * Math.sin(E);
      }

      const x = (a * (Math.cos(E) - ecc));
      const y = a * Math.sqrt(1 - ecc * ecc) * Math.sin(E);
      points.push({
        x: auToPixels(x),
        y: auToPixels(y)
      });
    }

    return points;
  }

  // Draw orbits
  svg.selectAll(".orbit")
    .remove();

  planetData.forEach(planet => {
    const orbitsPoint = calcRingPos(planet);
    const orbitLine = d3.line()
      .x(p => p.x)
      .y(p => p.y)
      .curve(d3.curveLinearClosed);

    svg.append("path")
      .attr("d", orbitLine(orbitsPoint))
      .attr("class", "orbit")
      .style("fill", "none")
      .style("stroke", hostname === "TOI-178" ? "#335577" : "#555")
      .style("stroke-width", hostname === "TOI-178" ? 1.5 : 1)
      .style("stroke-dasharray", hostname === "TOI-178" ? "5,3" : "none");
  });

  //Enhanced planets with selection support
  const planets = svg.selectAll(".orbit-planet")
    .remove()
    .data(planetData)
    .enter()
    .append("circle")
    .attr("class", "planet orbit-planet")
    .attr("id", d => d.pl_name)
    .attr("r", d => getPlanetRadius(d, hostname, radiusScale))
    .attr("data-base-radius", d => getPlanetRadius(d, hostname, radiusScale))
    .style("fill", (d, i) => getPlanetColor(d, i, hostname, tempColorScale))
    .style("stroke", (d, i) => getPlanetStroke(d, i, hostname))
    .style("stroke-width", 1.5)
    .style("cursor", "pointer")
    .style("filter", d => getPlanetFilter(d, hostname));
  
  console.log(planets);

  // Setup functionality
  setupTooltips(planets, hostname, systemInfo);
  addPlanetSelectionToSystem(planets, planetData, hostname, systemInfo);
  setupPlanetAnimation(planets, planetData, hostname, auToPixels);

  // Initialize UI based on stage
  if (stage === 1) {
    // Overview mode - setup planet profile
    setTimeout(() => {
      updatePlanetProfile(0, planetData, hostname, systemInfo);
      setupAnimationControls('animation');
      setupPlanetNavigation();
    }, 100);
  } // (fixed):
  if (stage === 2) {
    // Interactive mode - setup interactive controls and background
    addInteractiveSystemBackground(svg, hostname);
    setTimeout(() => {
      setupAnimationControls('interactive-animation');
      
      // Check if this is an extreme planet or regular orbit system
      const extremePlanets = ['KELT-9', 'WASP-76', 'Kepler-80'];
      
      if (!extremePlanets.includes(hostname)) {
      // ORBITAL SYSTEMS: Setup standard animation controls
      setupAnimationControls('interactive-animation');
      
      if (systemInfo.id) {
        showInteractiveControls(systemInfo.id);
      }
    } else {
      // EXTREME PLANETS: Let camilleExtreme.js handle their own controls
      console.log(`🌟 Extreme planet detected: ${hostname} - using specialized controls`);
    }
  }, 100);
}
  return { svg, planets, orbits: null, auToPixels };
}

//       if (!extremePlanets.includes(hostname) && systemInfo.id) {
//         showInteractiveControls(systemInfo.id);
//       }
//       // Extreme planets handle their own controls in camilleExtreme.js
//     }, 100);
//   }

//   return { svg, planets, orbits: null, auToPixels };
// }

//Enhanced system-specific background elements
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

// PHASE 1: Planet selection functionality
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

// PHASE 1: Select a specific planet and update the profile
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

//Update planet profile panel
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

//Show system information when star is clicked
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

// 
//Update 3D planet visual
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

//Setup animation controls
function setupAnimationControls(prefix = 'animation') {
  console.log(`🎮 Setting up animation controls with prefix: ${prefix}`);
  
  const playPauseBtn = document.getElementById(`${prefix}-play-pause`);
  const speedSlider = document.getElementById(`${prefix}-speed-slider`);
  const speedValue = document.getElementById(`${prefix}-speed-value`);
  
  // Initialize global state if not already set
  if (window.isAnimationPlaying === undefined) {
    window.isAnimationPlaying = true;
  }
  if (window.animationSpeed === undefined) {
    window.animationSpeed = 1;
  }
  
  if (playPauseBtn) {
    // Set initial button text based on current state
    playPauseBtn.textContent = window.isAnimationPlaying ? 'Pause' : 'Play';
    
    // Remove existing listeners
    playPauseBtn.replaceWith(playPauseBtn.cloneNode(true));
    const newBtn = document.getElementById(`${prefix}-play-pause`);
    
    newBtn.onclick = function() {
      window.isAnimationPlaying = !window.isAnimationPlaying;
      this.textContent = window.isAnimationPlaying ? 'Pause' : 'Play';
      
      // Update both animation controls if they exist
      const otherBtn = document.getElementById(prefix === 'animation' ? 'interactive-animation-play-pause' : 'animation-play-pause');
      if (otherBtn) {
        otherBtn.textContent = this.textContent;
      }
      
      // Update local state
      isAnimationPlaying = window.isAnimationPlaying;
      
      console.log(`Animation state changed to: ${window.isAnimationPlaying ? 'Playing' : 'Paused'}`);
      
      // If we're playing and there's no timer, restart it
      if (window.isAnimationPlaying && !animationTimer && currentSystemPlanets.length > 0) {
        const containerSelector = currentContainer.startsWith('#') ? currentContainer : `#${currentContainer}`;
        const planets = d3.select(containerSelector).selectAll('.orbit-planet');
        if (!planets.empty()) {
          const hostname = currentSystemPlanets[0].hostname;
          const maxOrbitalDistance = d3.max(currentSystemPlanets, d => d.a || 1);
          const auToPixels = d3.scaleLinear()
            .domain([0, maxOrbitalDistance])
            .range([0, 280 - 40]);
          setupPlanetAnimation(planets, currentSystemPlanets, hostname, auToPixels);
        }
      }
    };
  }
  
  if (speedSlider && speedValue) {
    // Set initial values based on current state
    speedSlider.value = window.animationSpeed;
    speedValue.textContent = `${window.animationSpeed}x`;
    
    speedSlider.oninput = function() {
      window.animationSpeed = parseFloat(this.value);
      animationSpeed = window.animationSpeed; // Update local state
      speedValue.textContent = `${window.animationSpeed}x`;
      
      // Update both speed controls if they exist
      const otherSlider = document.getElementById(prefix === 'animation' ? 'interactive-animation-speed-slider' : 'animation-speed-slider');
      const otherValue = document.getElementById(prefix === 'animation' ? 'interactive-animation-speed-value' : 'animation-speed-value');
      if (otherSlider && otherValue) {
        otherSlider.value = this.value;
        otherValue.textContent = speedValue.textContent;
      }
      
      console.log(`Animation speed changed to: ${window.animationSpeed}x`);
    };
  }

  // ADD: Visual indicator for orbital systems
  // Only add to the main animation controls section (not interactive)
  if (prefix === 'animation') {
    const animSection = document.querySelector('.animation-controls-section');
    if (animSection) {
      const controlGroup = animSection.querySelector('.control-group');
      if (controlGroup && !controlGroup.querySelector('.system-type-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'system-type-indicator orbital-type';
        indicator.innerHTML = '<i class="fas fa-circle-notch"></i> Orbital System';
        controlGroup.style.position = 'relative';
        controlGroup.insertBefore(indicator, controlGroup.firstChild);
      }
    }
  }
}


//Setup planet navigation
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

// ==================================================
// PHASE 2: ENHANCED INTERACTIVE CONTROLS
// ==================================================

function showInteractiveControls(systemId) {
  console.log(`Showing interactive controls for: ${systemId}`);
  
  // DON'T hide animation controls in interactive mode - they should remain visible
  // The interactive stage has its own controls in the controls-bar
  
  // Hide all system-specific control panels first
  document.querySelectorAll('.control-panel').forEach(panel => {
    panel.style.display = 'none';
  });
  
  // Show the appropriate control panel based on system
  const panelId = `${systemId}-controls`;
  const panel = document.getElementById(panelId);
  
  if (panel) {
    panel.style.display = 'block';
    
    // Update system info in interactive mode
    const systemNames = {
      'kepler': 'Kepler-90 System',
      'toi': 'TOI-178 Resonance Chain', 
      'gj': 'GJ 667C Habitable Zone'
    };
    
    const nameElement = document.getElementById('interactive-system-name');
    if (nameElement) {
      nameElement.textContent = systemNames[systemId] || 'Exoplanet System';
    }
    
    const countElement = document.getElementById('interactive-planet-count');
    if (countElement && currentSystemPlanets) {
      countElement.textContent = `${currentSystemPlanets.length} planets`;
    }
    
    // Setup the specific interactive functionality
    setupSystemInteractiveControls(systemId);
  } else {
    console.warn(`Interactive controls panel not found for: ${systemId}`);
  }
}

// ==================================================
// SYSTEM-SPECIFIC INTERACTIVE CONTROLS SETUP
// ==================================================

function setupSystemInteractiveControls(systemId) {
  console.log(`Setting up interactive controls for: ${systemId}`);
  
  if (systemId === 'kepler') {
    setupKeplerInteractiveControls();
  } else if (systemId === 'toi') {
    setupTOIInteractiveControls();
  } else if (systemId === 'gj') {
    setupGJInteractiveControls();
  }
}

// ==================================================
// KEPLER-90 INTERACTIVE CONTROLS
// ==================================================

function setupKeplerInteractiveControls() {
  console.log(" Setting up Kepler-90 interactive controls");
  
  // Resonance Lines Toggle
  const resonanceBtn = document.getElementById('kepler-resonance');
  if (resonanceBtn) {
    resonanceBtn.replaceWith(resonanceBtn.cloneNode(true));
    const newBtn = document.getElementById('kepler-resonance');
    
    newBtn.onclick = function() {
      const isShowing = this.textContent.includes('Hide');
      this.textContent = isShowing ? 'Show Resonances' : 'Hide Resonances';
      toggleResonanceLines(!isShowing);
    };
  }
  
  // Period Comparison
  const periodsBtn = document.getElementById('kepler-periods');
  if (periodsBtn) {
    periodsBtn.replaceWith(periodsBtn.cloneNode(true));
    const newBtn = document.getElementById('kepler-periods');
    
    newBtn.onclick = function() {
      const isShowing = this.textContent.includes('Hide');
      this.textContent = isShowing ? 'Compare Periods' : 'Hide Periods';
      comparePeriods(!isShowing);
    };
  }
}

// ==================================================
// TOI-178 INTERACTIVE CONTROLS
// ==================================================

function setupTOIInteractiveControls() {
  console.log("Setting up TOI-178 interactive controls");
  
  // Resonance Chain Toggle
  const chainBtn = document.getElementById('toi-chain');
  if (chainBtn) {
    chainBtn.replaceWith(chainBtn.cloneNode(true));
    const newBtn = document.getElementById('toi-chain');
    
    newBtn.onclick = function() {
      const isShowing = this.textContent.includes('Hide');
      this.textContent = isShowing ? 'Show Chain' : 'Hide Chain';
      toggleResonanceChain(!isShowing);
    };
  }
  
  // Period Ratios
  const ratiosBtn = document.getElementById('toi-ratios');
  if (ratiosBtn) {
    ratiosBtn.replaceWith(ratiosBtn.cloneNode(true));
    const newBtn = document.getElementById('toi-ratios');
    
    newBtn.onclick = function() {
      const isShowing = this.textContent.includes('Hide');
      this.textContent = isShowing ? 'Show Ratios' : 'Hide Ratios';
      showPeriodRatios(!isShowing);
    };
  }
}

// ==================================================
// GJ 667C INTERACTIVE CONTROLS
// ==================================================

function setupGJInteractiveControls() {
  console.log("Setting up GJ 667C interactive controls");
  
  // Show Habitable Zone
  const zoneBtn = document.getElementById('gj-zone');
  if (zoneBtn) {
    zoneBtn.replaceWith(zoneBtn.cloneNode(true));
    const newBtn = document.getElementById('gj-zone');
    
    newBtn.onclick = function() {
      const isShowing = this.textContent.includes('Hide');
      this.textContent = isShowing ? 'Show Zone' : 'Hide Zone';
      toggleHabitableZone(!isShowing);
    };
  }
  
  // Highlight Habitable Planets
  const highlightBtn = document.getElementById('gj-highlight');
  if (highlightBtn) {
    highlightBtn.replaceWith(highlightBtn.cloneNode(true));
    const newBtn = document.getElementById('gj-highlight');
    
    newBtn.onclick = function() {
      highlightHabitablePlanets();
    };
  }
  
  // Temperature Zones
  const tempsBtn = document.getElementById('gj-temps');
  if (tempsBtn) {
    tempsBtn.replaceWith(tempsBtn.cloneNode(true));
    const newBtn = document.getElementById('gj-temps');
    
    newBtn.onclick = function() {
      const isShowing = this.textContent.includes('Hide');
      this.textContent = isShowing ? 'Temperature Zones' : 'Hide Temps';
      showTemperatureZones(!isShowing);
    };
  }
  
  // ADD MISSING CONTROLS
  
  // Companion Stars Toggle
  const companionBtn = document.getElementById('gj-companions');
  if (companionBtn) {
    companionBtn.replaceWith(companionBtn.cloneNode(true));
    const newBtn = document.getElementById('gj-companions');
    
    newBtn.onclick = function() {
      const isShowing = this.textContent.includes('Hide');
      this.textContent = isShowing ? 'Show Companions' : 'Hide Companions';
      toggleCompanionStars(!isShowing);
    };
  }
  
  // Stellar Influence Slider
  const influenceSlider = document.getElementById('gj-influence');
  if (influenceSlider) {
    influenceSlider.oninput = function() {
      const influence = parseInt(this.value);
      updateStellarInfluence(influence);
      
      // Update display
      const display = document.getElementById('gj-influence-value');
      if (display) {
        display.textContent = `${influence}%`;
      }
    };
  }
}

// PHASE 1: Enhanced initializeEnhancedSystem (preserved your existing logic)
export function initializeEnhancedSystem(containerId, hostname, stage = 1) {
  console.log(`Initializing enhanced system for ${hostname} in container ${containerId} (Stage ${stage})`);
  
  if (stage === 2) {
    const container = document.getElementById('orbit-container-interactive');
    if (container) {
      container.style.width = '100%';
      container.style.height = '600px';
      container.style.maxWidth = 'none';
      container.style.border = 'none';
      container.style.background = 'transparent';
      container.style.padding = '0';
    }
  }
  
  
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


// Update cleanupEnhancedSystem to preserve global state
export function cleanupEnhancedSystem() {
  console.log("Cleaning up enhanced system");
  
  // Store animation state before cleanup
  const animState = window.getAnimationState ? window.getAnimationState() : { isPlaying: true, speed: 1 };
  
  // Stop and null ALL timers
  if (animationTimer) {
    animationTimer.stop();
    animationTimer = null;
    console.log("✓ Animation timer stopped");
  }
  
  // Remove ALL tooltips
  d3.selectAll(".orbit-tooltip").remove();
  d3.selectAll(".orbit-tooltip-text").remove();
  d3.selectAll("#orbit-tooltip").style("opacity", 0);
  
  // Clear ALL SVG containers
  const containers = ['orbit-container', 'orbit-container-interactive'];
  containers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = '';
    }
  });
  
  // Remove any lingering D3 selections
  d3.selectAll(".orbit-planet").remove();
  d3.selectAll(".plasma-ring").remove();
  d3.selectAll(".resonance-line").remove();
  
  // Reset state variables but preserve global animation state
  currentSystemPlanets = [];
  currentSelectedPlanet = 0;
  currentContainer = null;
  currentStage = 1;
  
  // Restore animation state
  if (window.setAnimationState) {
    window.setAnimationState(animState);
  }
  
  console.log("✓ System cleanup complete, animation state preserved");
}

// Expose functions to window for test framework
window.cleanupEnhancedSystem = cleanupEnhancedSystem;

// PHASE 1: Enhanced keyboard navigation
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


// Update renderOverviewSystem in camilleOrbit.js
function renderOverviewSystem(system) {
  console.log(`📍 Rendering overview for: ${system.hostname || system.title}`);
  
  // Store animation state before cleanup
  const animState = window.getAnimationState ? window.getAnimationState() : { isPlaying: true, speed: 1 };
  
  // Cleanup previous system
  cleanupEnhancedSystem();
  
  // IMPORTANT: Restore animation controls for orbital systems
  const extremePlanets = ['KELT-9', 'WASP-76', 'Kepler-80'];
  
  if (!extremePlanets.includes(system.hostname)) {
    // This is an ORBITAL SYSTEM - ensure animation controls are visible
    setTimeout(() => {
      if (typeof window.ensureAnimationControlsVisible === 'function') {
        window.ensureAnimationControlsVisible();
      } else {
        // Fallback method
        const animationSection = document.querySelector('.animation-controls-section');
        if (animationSection) {
          animationSection.style.display = 'block';
        }
        
        const orbitalControls = [
          'animation-play-pause',
          'animation-speed-slider',
          'animation-speed-value',
          'animation-speed-label'
        ];
        
        orbitalControls.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            element.style.display = id.includes('label') ? 'inline' : 'inline-block';
            console.log(`✓ Made visible: ${id}`);
          }
        });
      }
      
      // Restore animation state
      if (window.setAnimationState) {
        window.setAnimationState(animState);
      }
    }, 200);
  } else {
    // This is an EXTREME PLANET - hide orbital controls
    const animationSection = document.querySelector('.animation-controls-section');
    if (animationSection) {
      animationSection.style.display = 'none';
    }
  }
  
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

// Update renderInteractiveSystem in camilleOrbit.js
function renderInteractiveSystem(system) {
  console.log(`🎮 Rendering interactive mode for: ${system.hostname || system.title}`);
  
  // Store animation state
  const animState = window.getAnimationState ? window.getAnimationState() : { isPlaying: true, speed: 1 };
  
  // Don't do full cleanup - just clear the container
  const interactiveContainer = document.getElementById('orbit-container-interactive');
  if (interactiveContainer) {
    interactiveContainer.innerHTML = "";
    interactiveContainer.style.width = '100%';
    interactiveContainer.style.height = '600px';
    interactiveContainer.style.background = 'transparent';
    interactiveContainer.style.border = 'none';
    interactiveContainer.style.display = 'block';
  }
  
  // Initialize enhanced system for Stage 2 (Interactive mode)
  console.log('🚀 Initializing enhanced system for stage 2...');
  initializeEnhancedSystem('orbit-container-interactive', system.hostname, 2);
  
  // Setup interactive animation controls with proper state restoration
  setTimeout(() => {
    // Restore animation state
    if (window.setAnimationState) {
      window.setAnimationState(animState);
    }
    
    setupAnimationControls('interactive-animation');
    
    // Show interactive controls after a delay
    const systemInfo = systemNarratives[system.hostname] || {};
    if (systemInfo.id) {
      showInteractiveControls(systemInfo.id);
    }
  }, 200);
}

// PHASE 1: Enhanced helper functions (preserved your existing logic where possible)
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
  // For GJ 667C (M-dwarf star), habitable zone is closer
  const orbitalDistance = parseFloat(planet.pl_orbsmax) || 0;
  const orbitalPeriod = parseFloat(planet.pl_orbper) || 0;
  
  // GJ 667C habitable zone: approximately 0.11 - 0.23 AU
  // Or roughly 20-60 day orbital periods for this system
  if (orbitalDistance > 0) {
    return orbitalDistance >= 0.11 && orbitalDistance <= 0.23;
  }
  // Fallback to period if distance unavailable
  return orbitalPeriod >= 20 && orbitalPeriod <= 60;
}

// Container selection - ALL interactive functions should use interactive container
function getInteractiveSVG() {
  // Interactive controls are ONLY used in Stage 2, so always use interactive container
  const svg = d3.select('#orbit-container-interactive svg');
  if (svg.empty()) {
    console.warn('Interactive SVG container not found! Make sure you are in Stage 2.');
  }
  return svg;
}

function formatValue(value, unit) {
  const num = parseFloat(value);
  return isNaN(num) ? "Unknown" : `${num.toFixed(2)} ${unit}`;
}

function setupTooltips(planets, hostname, systemInfo) {
  // Remove any existing tooltip first (but check if one exists)
  let tooltip = d3.select("#orbit-tooltip");
  
  if (tooltip.empty()) {
    // Create new tooltip if it doesn't exist
    tooltip = d3.select("body").append("div")
      .attr("id", "orbit-tooltip")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("color", "#fff")
      .style("background", "rgba(0, 0, 0, 0.85)")
      .style("padding", "10px")
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("z-index", "999")
      .style("max-width", "300px")
      .style("font-size", "0.9rem")
      .style("border", "1px solid rgba(255, 255, 255, 0.2)")
      .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.5)");
    
    console.log("✓ Tooltip created");
  } else {
    // Reset existing tooltip
    tooltip.style("opacity", 0);
    console.log("✓ Tooltip reset");
  }

  let selected = null;  // Declare selected here

  planets.on("mouseover", function (event, d) {
    const planetLetter = d.pl_name?.split(" ").pop();
    // Safely access descriptions with fallback for empty systemInfo
    const descriptions = (systemInfo && systemInfo.descriptions) ? systemInfo.descriptions : {};
    const description = descriptions[planetLetter] || `A planet in the ${hostname} system.`;
    
    selected = d3.select(this);  // Now we can assign to it

    d3.select(this)
      .attr("r", 1.3 * +d3.select(this).attr("r"));

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
  }).on("mouseout", function() {
    tooltip.style("opacity", 0);
    if (selected) {
      selected.attr("r", +selected.attr("r") / 1.3);
    }
  });
}


// Update the setupPlanetAnimation function to use global state
function setupPlanetAnimation(planets, planetData, hostname, auToPixels) {
  // Always stop previous timer first
  if (animationTimer) {
    animationTimer.stop();
    animationTimer = null;
  }

  let currentTime = 0;
  let localTime = 0;
  
  // Create the animation function
  const animateFunction = function(elapsed) {
    // Use global state instead of local
    if (!window.isAnimationPlaying) {
      localTime = elapsed;
      return;
    }
    
    // System-specific speed factors
    let speedFactor = 1;
    if (hostname === "TOI-178") speedFactor = 0.7;
    else if (hostname === "GJ 667 C") speedFactor = 1.2;
    
    // Use global animation speed
    let delta = elapsed - localTime;
    currentTime += (delta / 1000) * window.animationSpeed * speedFactor;
    localTime = elapsed;

    // Planet position calculation function
    function calc(d, i) {
      const period = +d.pl_orbper || 365;
      const ecc = d.ecc;
      const a = d.a;
      
      const timeScale = currentTime;
      const M = ((timeScale % period) / period) * 2 * Math.PI;
      
      // Solve Kepler's equation
      let E = M;
      for (let j = 0; j < 10; j++) {
        E = M + ecc * Math.sin(E);
      }
      
      // Position in orbital plane
      let x_rel = a * (Math.cos(E) - ecc);
      let y_rel = a * Math.sqrt(1 - ecc * ecc) * Math.sin(E);
      
      // Convert to screen coordinates
      const x = auToPixels(x_rel);
      const y = auToPixels(y_rel);
      
      return [x, y];
    }

    // Update planet positions
    planets
      .attr("cx", d => calc(d)[0])
      .attr("cy", d => calc(d)[1]);
  };
  
  // Start the animation timer
  animationTimer = d3.timer(animateFunction);
  
  // Store the animation function for manual updates
  window.currentAnimationFunction = animateFunction;
}

// Add global state management functions
window.getAnimationState = function() {
  return {
    isPlaying: window.isAnimationPlaying,
    speed: window.animationSpeed
  };
};

window.setAnimationState = function(state) {
  if (state.isPlaying !== undefined) {
    window.isAnimationPlaying = state.isPlaying;
    isAnimationPlaying = state.isPlaying;
  }
  if (state.speed !== undefined) {
    window.animationSpeed = state.speed;
    animationSpeed = state.speed;
  }
};

// ==================================================
// PHASE 2: KEPLER-90 INTERACTIVE IMPLEMENTATIONS
// ==================================================

function toggleResonanceLines(show) {
  console.log(`${show ? 'Showing' : 'Hiding'} resonance lines for Kepler-90`);
  
  const svg = d3.select('#orbit-container-interactive svg');
  if (svg.empty()) {
    console.warn('Could not find interactive SVG container');
    return;
  }
  
  if (show) {
    // Get actual planet data and orbital information 
    const planets = svg.selectAll('.orbit-planet');
    if (planets.empty()) {
      console.warn('No planets found for resonance lines');
      return;
    }
    
    const planetData = planets.data();
    if (!planetData || planetData.length < 2) {
      console.warn('Insufficient planet data for resonance lines');
      return;
    }
    
    // Kepler-90 resonance relationships (based on actual orbital periods)
    const resonanceData = [
      {from: 0, to: 1, ratio: "8:7", desc: "Inner resonance"},
      {from: 2, to: 3, ratio: "3:1", desc: "Mid-system resonance"}, 
      {from: 4, to: 5, ratio: "5:3", desc: "Outer resonance"}
    ];
    
    // Get the auToPixels scale from the current system
    // We can reconstruct it from the planet data
    const maxOrbitalDistance = d3.max(planetData, d => d.a || 1);
    const maxRadius = 280; // Same as in renderSystem
    const minRadius = 40;
    const auToPixels = d3.scaleLinear()
      .domain([0, maxOrbitalDistance])
      .range([0, maxRadius - minRadius]);
    
    // Create resonance visualization between orbits
    resonanceData.forEach((res, i) => {
      if (res.from < planetData.length && res.to < planetData.length) {
        const fromPlanet = planetData[res.from];
        const toPlanet = planetData[res.to];
        
        // Get the orbital radii using the same scale as the visualization
        const fromRadius = auToPixels(fromPlanet.a || 0);
        const toRadius = auToPixels(toPlanet.a || 0);
        
        if (fromRadius <= 0 || toRadius <= 0) return;
        
        // Create curved resonance line between orbits
        const midRadius = (fromRadius + toRadius) / 2;
        const controlOffset = Math.abs(toRadius - fromRadius) * 0.4;
        
        const path = `M ${fromRadius} 0 Q ${midRadius} ${-controlOffset} ${toRadius} 0`;
        
        svg.append("path")
          .attr("class", "resonance-line")
          .attr("d", path)
          .attr("stroke", "#FFA500")
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "8,4")
          .attr("fill", "none")
          .attr("opacity", 0)
          .transition()
          .duration(1000)
          .delay(i * 300)
          .attr("opacity", 0.8);
          
        // Add ratio labels at the curve peak
        svg.append("text")
          .attr("class", "resonance-label")
          .attr("x", midRadius)
          .attr("y", -controlOffset - 8)
          .attr("text-anchor", "middle")
          .attr("fill", "#FFA500")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(res.ratio)
          .attr("opacity", 0)
          .transition()
          .duration(800)
          .delay(i * 300 + 500)
          .attr("opacity", 1);
          
        // Add connecting dots at orbit intersections
        [fromRadius, toRadius].forEach((radius, dotIndex) => {
          svg.append("circle")
            .attr("class", "resonance-line")
            .attr("cx", radius)
            .attr("cy", 0)
            .attr("r", 3)
            .attr("fill", "#FFA500")
            .attr("opacity", 0)
            .transition()
            .duration(600)
            .delay(i * 300 + dotIndex * 100)
            .attr("opacity", 0.9);
        });
      }
    });
    
    // Add explanatory text
    svg.append("text")
      .attr("class", "resonance-explanation")
      .attr("x", 0)
      .attr("y", -200)
      .attr("text-anchor", "middle")
      .attr("fill", "#FFA500")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Orbital Resonances")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .delay(1200)
      .attr("opacity", 1);
      
    svg.append("text")
      .attr("class", "resonance-explanation")
      .attr("x", 0)
      .attr("y", -180)
      .attr("text-anchor", "middle")
      .attr("fill", "#FFA500")
      .attr("font-size", "11px")
      .text("Gravitational relationships between planetary orbits")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .delay(1400)
      .attr("opacity", 0.9);
      
  } else {
    // Remove resonance lines with smooth transition
    svg.selectAll(".resonance-line, .resonance-label, .resonance-explanation")
      .transition()
      .duration(600)
      .attr("opacity", 0)
      .remove();
  }
}

// ==================================================
// TOI-178 INTERACTIVE IMPLEMENTATIONS
// ==================================================

function toggleResonanceChain(show) {
  console.log(`${show ? 'Showing' : 'Hiding'} resonance chain for TOI-178`);
  
  const svg = d3.select('#orbit-container-interactive svg');
  if (svg.empty()) return;
  
  if (show) {
    // Create resonance chain visualization
    const chainData = [
      {angle: 0, ratio: "18"},
      {angle: 60, ratio: "9"}, 
      {angle: 120, ratio: "6"},
      {angle: 180, ratio: "4"},
      {angle: 240, ratio: "3"}
    ];
    
    // Add resonance connections
    for (let i = 0; i < chainData.length - 1; i++) {
      const startAngle = chainData[i].angle * Math.PI / 180;
      const endAngle = chainData[i + 1].angle * Math.PI / 180;
      const radius = 150 + (i * 30);
      
      svg.append("path")
        .attr("class", "resonance-chain")
        .attr("d", `M ${Math.cos(startAngle) * radius} ${Math.sin(startAngle) * radius} 
                   Q 0 0 ${Math.cos(endAngle) * radius} ${Math.sin(endAngle) * radius}`)
        .attr("stroke", "#4682B4")
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .attr("stroke-dasharray", "10,5")
        .attr("opacity", 0)
        // .transition()
        // .duration(1500)
        .attr("opacity", 0.7);
    }
    
    // Add ratio numbers
    chainData.forEach((d, i) => {
      const angle = d.angle * Math.PI / 180;
      const radius = 180;
      
      svg.append("text")
        .attr("class", "resonance-ratio")
        .attr("x", Math.cos(angle) * radius)
        .attr("y", Math.sin(angle) * radius)
        .attr("text-anchor", "middle")
        .attr("fill", "#4682B4")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(d.ratio)
        .attr("opacity", 0)
        // .transition()
        // .duration(1500)
        .attr("opacity", 1);
    });
  } else {
    svg.selectAll(".resonance-chain, .resonance-ratio")
      // .transition()
      // .duration(800)
      .attr("opacity", 0)
      .remove();
  }
}

function playResonanceMusic(play) {
  console.log(`${play ? 'Playing' : 'Stopping'} resonance music for TOI-178`);
  
  if (play) {
    // Visual music representation
    const svg = d3.select('#orbit-container svg');
    if (svg.empty()) return;
    
    // Create musical notes animation
    const notePositions = [
      {x: -100, y: -150, delay: 0},
      {x: 50, y: -100, delay: 500},
      {x: 150, y: -50, delay: 1000},
      {x: 100, y: 100, delay: 1500},
      {x: -50, y: 150, delay: 2000}
    ];
    
    notePositions.forEach(note => {
      setTimeout(() => {
        svg.append("text")
          .attr("class", "musical-note-anim")
          .attr("x", note.x)
          .attr("y", note.y)
          .attr("text-anchor", "middle")
          .attr("fill", "#4682B4")
          .attr("font-size", "30px")
          .text("♪")
          .attr("opacity", 0)
          // .transition()
          // .duration(1000)
          .attr("opacity", 1)
          .attr("font-size", "40px")
          // .transition()
          // .duration(1000)
          .attr("opacity", 0)
          .attr("y", note.y - 50)
          .remove();
      }, note.delay);
    });
    
    // Continue animation loop
    setTimeout(() => {
      if (document.getElementById('play-resonance-music')?.textContent.includes('Stop')) {
        playResonanceMusic(true);
      }
    }, 3000);
  }
}

// ==================================================
// GJ 667C INTERACTIVE IMPLEMENTATIONS
// ==================================================

function toggleHabitableZone(show) {
  console.log(`${show ? 'Showing' : 'Hiding'} habitable zone for GJ 667C`);
  
  const svg = getInteractiveSVG(); // FIXED: Use correct container
  if (svg.empty()) {
    console.warn('No SVG container found for habitable zone toggle');
    return;
  }
  
  if (show) {
    // Enhance existing habitable zone
    svg.select(".habitable-zone")
      .transition()
      .duration(800)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 12);
      
    // Add zone labels with animation
    svg.append("text")
      .attr("class", "zone-label")
      .attr("x", 0)
      .attr("y", -90)
      .attr("text-anchor", "middle")
      .attr("fill", "#50C878")
      .attr("font-size", "14px")
      .text("Habitable Zone")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 0.9);
      
    // Add additional info
    svg.append("text")
      .attr("class", "zone-label")
      .attr("x", 0)
      .attr("y", -70)
      .attr("text-anchor", "middle")
      .attr("fill", "#50C878")
      .attr("font-size", "10px")
      .text("0.11 - 0.23 AU from star")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .delay(300)
      .attr("opacity", 0.7);
  } else {
    // Hide zone with animation
    svg.select(".habitable-zone")
      .transition()
      .duration(600)
      .attr("stroke-opacity", 0.15)
      .attr("stroke-width", 8);
      
    svg.selectAll(".zone-label")
      .transition()
      .duration(600)
      .attr("opacity", 0)
      .remove();
  }
}

function highlightHabitablePlanets() {
  console.log('Highlighting habitable planets in GJ 667C');
  
  const svg = getInteractiveSVG(); // FIXED: Use correct container
  if (svg.empty()) {
    console.warn('No SVG container found for planet highlighting');
    return;
  }
  
  // Highlight potentially habitable planets
  svg.selectAll(".orbit-planet")
    .transition()
    .duration(800)
    .style("fill", function(d) {
      return isInHabitableZone(d) ? "#50C878" : "#8B4513";
    })
    .style("stroke", function(d) {
      return isInHabitableZone(d) ? "#32CD32" : "rgba(255,255,255,0.3)";
    })
    .style("stroke-width", function(d) {
      return isInHabitableZone(d) ? 3 : 1.5;
    })
    .attr("r", function(d) {
      const baseRadius = d3.select(this).attr("data-base-radius");
      return isInHabitableZone(d) ? parseFloat(baseRadius) * 1.4 : baseRadius;
    });
    
  // Add habitability labels with improved positioning
  svg.selectAll(".orbit-planet")
    .filter(d => isInHabitableZone(d))
    .each(function(d, i) {
      const planet = d3.select(this);
      const cx = planet.attr("cx") || 0;
      const cy = planet.attr("cy") || 0;
      
      svg.append("text")
        .attr("class", "habitable-label")
        .attr("x", cx)
        .attr("y", parseFloat(cy) - 25)
        .attr("text-anchor", "middle")
        .attr("fill", "#50C878")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text("Potentially Habitable")
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .delay(500)
        .attr("opacity", 1);
        
      // Add distance info
      svg.append("text")
        .attr("class", "habitable-label")
        .attr("x", cx)
        .attr("y", parseFloat(cy) - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#50C878")
        .attr("font-size", "10px")
        .text(`${(parseFloat(d.pl_orbsmax) || 0).toFixed(2)} AU`)
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .delay(700)
        .attr("opacity", 0.8);
    });
    
  // Reset after 5 seconds
  setTimeout(() => {
    svg.selectAll(".habitable-label")
      .transition()
      .duration(1000)
      .attr("opacity", 0)
      .remove();
      
    svg.selectAll(".orbit-planet")
      .transition()
      .duration(1000)
      .style("fill", d => isInHabitableZone(d) ? "#50C878" : "#8B4513")
      .style("stroke", d => isInHabitableZone(d) ? "#32CD32" : "rgba(255,255,255,0.3)")
      .style("stroke-width", 1.5)
      .attr("r", function() { 
        return d3.select(this).attr("data-base-radius"); 
      });
  }, 5000);
}

function toggleCompanionStars(show) {
  console.log(`${show ? 'Showing' : 'Hiding'} companion stars for GJ 667C`);
  
  const svg = getInteractiveSVG();
  if (svg.empty()) return;
  
  if (show) {
    // Enhance companion stars
    svg.selectAll(".companion-star")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .attr("r", 12);
      
    // Add gravitational influence lines
    svg.append("line")
      .attr("class", "gravitational-line")
      .attr("x1", -190)
      .attr("y1", -155)
      .attr("x2", 0)
      .attr("y2", 0)
      .attr("stroke", "#FFD700")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,3")
      .attr("opacity", 0)
      .transition()
      .duration(1500)
      .attr("opacity", 0.6);
      
    // Add binary system info
    svg.append("text")
      .attr("class", "companion-info")
      .attr("x", -190)
      .attr("y", -180)
      .attr("text-anchor", "middle")
      .attr("fill", "#FFD700")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Binary Companions")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .delay(800)
      .attr("opacity", 0.9);
  } else {
    // Hide companion elements
    svg.selectAll(".companion-star")
      .transition()
      .duration(800)
      .style("opacity", 0.6)
      .attr("r", 6);
      
    svg.selectAll(".gravitational-line, .companion-info")
      .transition()
      .duration(800)
      .attr("opacity", 0)
      .remove();
  }
}

function showTemperatureZones(show) {
  console.log(`${show ? 'Showing' : 'Hiding'} temperature zones for GJ 667C`);
  
  const svg = getInteractiveSVG(); // FIXED: Use correct container
  if (svg.empty()) {
    console.warn('No SVG container found for temperature zones');
    return;
  }
  
  if (show) {
    // Create temperature gradient zones for M-dwarf star
    const zones = [
      {radius: 35, color: "#FF4500", temp: "Too Hot", desc: "> 400K"},
      {radius: 75, color: "#32CD32", temp: "Habitable", desc: "200-400K"}, 
      {radius: 115, color: "#4169E1", temp: "Too Cold", desc: "< 200K"}
    ];
    
    zones.forEach((zone, i) => {
      // Create zone circle
      svg.append("circle")
        .attr("class", "temp-zone")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 0)
        .attr("fill", "none")
        .attr("stroke", zone.color)
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 0)
        .attr("stroke-dasharray", "8,4")
        .transition()
        .delay(i * 400)
        .duration(1000)
        .attr("r", zone.radius)
        .attr("stroke-opacity", 0.6);
        
      // Add temperature labels
      svg.append("text")
        .attr("class", "temp-label")
        .attr("x", zone.radius * 0.7)
        .attr("y", zone.radius * 0.7 - 10)
        .attr("fill", zone.color)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(zone.temp)
        .attr("opacity", 0)
        .transition()
        .delay(i * 400 + 500)
        .duration(800)
        .attr("opacity", 0.9);
        
      // Add temperature description
      svg.append("text")
        .attr("class", "temp-label")
        .attr("x", zone.radius * 0.7)
        .attr("y", zone.radius * 0.7 + 5)
        .attr("fill", zone.color)
        .attr("font-size", "10px")
        .text(zone.desc)
        .attr("opacity", 0)
        .transition()
        .delay(i * 400 + 700)
        .duration(800)
        .attr("opacity", 0.7);
    });
  } else {
    // Remove zones with animation
    svg.selectAll(".temp-zone, .temp-label")
      .transition()
      .duration(800)
      .attr("opacity", 0)
      .remove();
  }
}

function updateStellarInfluence(influence) {
  console.log(`⭐ Updating stellar influence visualization: ${influence}%`);
  
  const svg = getInteractiveSVG();
  if (svg.empty()) return;
  
  // Adjust companion star prominence based on influence
  svg.selectAll(".companion-star")
    .transition()
    .duration(500)
    .style("opacity", 0.3 + (influence / 100) * 0.7)
    .attr("r", 4 + (influence / 100) * 10);
    
  // Update gravitational line intensity
  svg.selectAll(".gravitational-line")
    .transition()
    .duration(500)
    .attr("stroke-width", 1 + (influence / 100) * 3)
    .attr("opacity", 0.2 + (influence / 100) * 0.5);
    
  // Visual feedback on the habitable zone
  svg.select(".habitable-zone")
    .transition()
    .duration(500)
    .attr("stroke-width", 8 + (influence / 100) * 6);
}

// ==================================================
// MISSING INTERACTIVE FUNCTIONS IMPLEMENTATION
// ==================================================

// Kepler-90 Functions
function comparePeriods(show) {
  console.log(`${show ? ' Showing' : ' Hiding'} period comparison for Kepler-90`);
  
  const svg = d3.select('#orbit-container-interactive svg');
  if (svg.empty()) return;
  
  if (show) {
    // Add period comparison visualization
    const periods = [7.0, 8.9, 29.3, 91.9, 124.9, 210.6, 331.6, 14.4]; // Kepler-90 periods
    const maxPeriod = Math.max(...periods);
    
    periods.forEach((period, i) => {
      const barHeight = (period / maxPeriod) * 100;
      const x = -250 + (i * 60);
      
      svg.append("rect")
        .attr("class", "period-bar")
        .attr("x", x)
        .attr("y", 200)
        .attr("width", 50)
        .attr("height", 0)
        .attr("fill", "#FFA500")
        .attr("opacity", 0.7)
        // .transition()
        // .delay(i * 200)
        // .duration(1000)
        .attr("height", barHeight)
        .attr("y", 200 - barHeight);
        
      svg.append("text")
        .attr("class", "period-label")
        .attr("x", x + 25)
        .attr("y", 220)
        .attr("text-anchor", "middle")
        .attr("fill", "#FFA500")
        .attr("font-size", "10px")
        .text(`${period.toFixed(1)}d`)
        .attr("opacity", 0)
        // .transition()
        // .delay(i * 200)
        // .duration(1000)
        .attr("opacity", 1);
    });
    
    setTimeout(() => {
      svg.selectAll(".period-bar, .period-label")
        // .transition()
        // .duration(1000)
        .attr("opacity", 0)
        .remove();
    }, 5000);
  } else {
    svg.selectAll(".period-bar, .period-label").remove();
  }
}

// TOI-178 Functions
function showPeriodRatios(show) {
  console.log(`${show ? 'Showing' : 'Hiding'} period ratios for TOI-178`);
  
  const svg = d3.select('#orbit-container-interactive svg');
  if (svg.empty()) return;
  
  if (show) {
    // Show the famous 18:9:6:4:3 resonance pattern
    const ratios = ["18", "9", "6", "4", "3"];
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];
    
    ratios.forEach((ratio, i) => {
      const angle = (i * 72) * Math.PI / 180; // 360/5 = 72 degrees apart
      const radius = 200;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Create ratio circles
      svg.append("circle")
        .attr("class", "ratio-circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 0)
        .attr("fill", colors[i])
        .attr("opacity", 0.8)
        // .transition()
        // .delay(i * 300)
        // .duration(800)
        .attr("r", 25);
        
      // Add ratio text
      svg.append("text")
        .attr("class", "ratio-text")
        .attr("x", x)
        .attr("y", y + 6)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(ratio)
        .attr("opacity", 0)
        // .transition()
        // .delay(i * 300 + 400)
        // .duration(600)
        .attr("opacity", 1);
    });
    
    // Add connecting lines for resonance
    for (let i = 0; i < ratios.length - 1; i++) {
      const angle1 = (i * 72) * Math.PI / 180;
      const angle2 = ((i + 1) * 72) * Math.PI / 180;
      const radius = 200;
      
      svg.append("line")
        .attr("class", "resonance-connection")
        .attr("x1", Math.cos(angle1) * radius)
        .attr("y1", Math.sin(angle1) * radius)
        .attr("x2", Math.cos(angle2) * radius)
        .attr("y2", Math.sin(angle2) * radius)
        .attr("stroke", "#4682B4")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0)
        // .transition()
        // .delay(1500)
        // .duration(1000)
        .attr("opacity", 0.6);
    }
    
    setTimeout(() => {
      svg.selectAll(".ratio-circle, .ratio-text, .resonance-connection")
        // .transition()
        // .duration(1000)
        .attr("opacity", 0)
        .remove();
    }, 6000);
  } else {
    svg.selectAll(".ratio-circle, .ratio-text, .resonance-connection").remove();
  }
}

// Interactive animation controls
function setupInteractiveAnimationControls() {
  const playBtn = document.getElementById('interactive-play-pause');
  const speedSlider = document.getElementById('interactive-speed');
  const speedValue = document.getElementById('speed-value');
  
  if (playBtn) {
    playBtn.onclick = function() {
      isAnimationPlaying = !isAnimationPlaying;
      this.textContent = isAnimationPlaying ? 'Pause' : 'Play';
      
      if (isAnimationPlaying && animationTimer) {
        animationTimer.restart();
      } else if (animationTimer) {
        animationTimer.stop();
      }
    };
  }
  
  if (speedSlider && speedValue) {
    speedSlider.oninput = function() {
      animationSpeed = parseFloat(this.value);
      speedValue.textContent = `${animationSpeed}x`;
      
      if (animationTimer && isAnimationPlaying) {
        animationTimer.stop();
        setupPlanetAnimation(
          d3.selectAll('.orbit-planet'), 
          currentSystemPlanets, 
          currentSystemPlanets[0]?.hostname,
          d3.scaleLinear() // placeholder scale
        );
      }
    };
  }
}

// Enhanced system background for interactive mode
function addInteractiveSystemBackground(svg, hostname) {
  if (hostname === "KOI-351") {
    // Add subtle grid for Kepler-90
    const gridGroup = svg.append("g").attr("class", "interactive-grid");
    
    for (let i = -300; i <= 300; i += 50) {
      gridGroup.append("line")
        .attr("x1", i).attr("y1", -300)
        .attr("x2", i).attr("y2", 300)
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.3);
        
      gridGroup.append("line")
        .attr("x1", -300).attr("y1", i)
        .attr("x2", 300).attr("y2", i)
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.3);
    }
  }
  else if (hostname === "TOI-178") {
    // Add resonance background pattern
    const resonanceGroup = svg.append("g").attr("class", "resonance-background");
    
    for (let i = 1; i <= 5; i++) {
      resonanceGroup.append("circle")
        .attr("cx", 0).attr("cy", 0)
        .attr("r", i * 50)
        .attr("fill", "none")
        .attr("stroke", "#4682B4")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,8")
        .attr("opacity", 0.2);
    }
  }
  else if (hostname === "GJ 667 C") {
    // Add habitable zone indicator
    svg.append("circle")
      .attr("class", "habitable-background")
      .attr("cx", 0).attr("cy", 0)
      .attr("r", 100)
      .attr("fill", "rgba(50, 205, 50, 0.1)")
      .attr("stroke", "rgba(50, 205, 50, 0.3)")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
  }
}



// Add at the END of camilleOrbit.js to expose all system-specific functions

// Expose Kepler-90 functions
window.toggleResonanceLines = toggleResonanceLines;
window.comparePeriods = comparePeriods;

// Expose TOI-178 functions  
window.toggleResonanceChain = toggleResonanceChain;
window.showPeriodRatios = showPeriodRatios;

// Expose GJ 667C functions
window.toggleHabitableZone = toggleHabitableZone;
window.highlightHabitablePlanets = highlightHabitablePlanets;
window.showTemperatureZones = showTemperatureZones;
window.toggleCompanionStars = toggleCompanionStars;
window.updateStellarInfluence = updateStellarInfluence;

// Also expose these utility functions if they exist
if (typeof updateKELTVisualization !== 'undefined') {
  window.updateKELTVisualization = updateKELTVisualization;
}
if (typeof updateWASPVisualization !== 'undefined') {
  window.updateWASPVisualization = updateWASPVisualization;
}
if (typeof updateKepler80Visualization !== 'undefined') {
  window.updateKepler80Visualization = updateKepler80Visualization;
}