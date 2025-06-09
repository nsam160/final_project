/// camilleExtreme.js - PHASE 2: EXTREME INTERACTIVE CONTROLS
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

console.log(" Enhanced camilleExtreme.js Phase 2 loaded!");

// Updated extreme planet data with enhanced properties
const extremeSystemData = [
  {
    id: "kelt",
    capsuleId: "capsule-kelt", 
    planetName: "KELT-9 b",
    hostname: "KELT-9",
    title: "KELT-9b: The Plasma Planet",
    shortDesc: "Hotter than 75% of all stars",
    fullDesc: "KELT-9b is so hot it vaporizes metals and is hotter than most stars. It's losing mass at an incredible rate due to extreme stellar radiation.",
    color: "#ff3300",
    unique: "Extreme Temperature",
    extremeType: "thermal"
  },
  {
    id: "wasp",
    capsuleId: "capsule-wasp", 
    planetName: "WASP-76 b",
    hostname: "WASP-76",
    title: "WASP-76b: The Iron Rain World",
    shortDesc: "Iron rain and metal clouds",
    fullDesc: "WASP-76b experiences extreme heat that vaporizes iron on its day side, which then condenses and rains down as liquid metal on the night side.",
    color: "#ff6b47",
    unique: "Iron Rain",
    extremeType: "atmospheric"
  },
  {
    id: "kepler80",
    capsuleId: "capsule-kepler80",
    planetName: "Kepler-80 f",
    hostname: "Kepler-80", 
    title: "Kepler-80f: The Ultra-Dense World",
    shortDesc: "Denser than diamond",
    fullDesc: "Kepler-80f has an impossibly high density that challenges our understanding of planetary formation and composition.",
    color: "#888888",
    unique: "Extreme Density",
    extremeType: "structural"
  }
];

// PHASE 2: Enhanced global variables
let currentExtremeSystem = null;
let currentExtremeStage = 1;
let extremeAnimationTimer = null;
let currentSelectedExtremePlanet = 0;
let isExtremeAnimationPlaying = true;
let extremeAnimationSpeed = 1;

// PHASE 2: Interactive control states
let extremeControlStates = {
  kelt: {
    plasmaIntensity: 50,
    stellarRadiation: 75,
    temperatureMode: 'surface'
  },
  wasp: {
    dayNightRatio: 50,
    ironRainIntensity: 30,
    windSpeed: 60,
    showTerminator: true
  },
  kepler80: {
    compressionLevel: 40,
    materialComparison: 'diamond',
    gravityMultiplier: 100
  }
};

// PHASE 2: Global function exposure for stage navigation
window.renderExtremeOverview = renderExtremeOverview;
window.renderExtremeInteractive = renderExtremeInteractive;
window.cleanupExtremeSystem = cleanupExtremeSystem;

// Export the initialization function for use in global.js
export function initializeExtremePlanets() {
  console.log(" Initializing extreme planets Phase 2...");
  
  // Setup extreme capsules
  setupExtremeCapsules();
  
  console.log(" Extreme planets Phase 2 initialized successfully.");
}

// Export the system data
export { extremeSystemData };

// PHASE 2: Manual verification function for debugging
window.testExtremeControls = function() {
  console.log('🔧 Testing extreme controls visibility...');
  
  const panels = ['kelt-controls', 'wasp-controls', 'kepler80-controls'];
  panels.forEach(panelId => {
    const panel = document.getElementById(panelId);
    if (panel) {
      console.log(`📋 ${panelId}:`, {
        exists: true,
        display: panel.style.display,
        computedDisplay: window.getComputedStyle(panel).display,
        visibility: window.getComputedStyle(panel).visibility,
        opacity: window.getComputedStyle(panel).opacity,
        position: window.getComputedStyle(panel).position,
        gridArea: window.getComputedStyle(panel).gridArea
      });
    } else {
      console.log(`❌ ${panelId}: Not found`);
    }
  });
  
  const systemControls = document.querySelector('.system-controls');
  if (systemControls) {
    console.log('🎛️ System controls container:', {
      display: window.getComputedStyle(systemControls).display,
      gridArea: window.getComputedStyle(systemControls).gridArea,
      position: window.getComputedStyle(systemControls).position
    });
  }
  
  const gridLayout = document.querySelector('.minimal-interactive-layout');
  if (gridLayout) {
    console.log('📐 Grid layout:', {
      display: window.getComputedStyle(gridLayout).display,
      gridTemplateAreas: window.getComputedStyle(gridLayout).gridTemplateAreas,
      gridTemplateColumns: window.getComputedStyle(gridLayout).gridTemplateColumns
    });
  }
};

// PHASE 2: Enhanced capsule setup
function setupExtremeCapsules() {
  console.log(" Setting up extreme capsules...");
  
  extremeSystemData.forEach(system => {
    const capsule = document.getElementById(system.capsuleId);
    if (capsule) {
      console.log(` Found capsule: ${system.capsuleId}`);
      
      // Remove existing listeners to prevent duplicates
      const newCapsule = capsule.cloneNode(true);
      capsule.parentNode.replaceChild(newCapsule, capsule);
      
      // Add visited marker if it doesn't exist
      if (!newCapsule.querySelector('.visited-marker')) {
        const marker = document.createElement("div");
        marker.className = "visited-marker";
        marker.textContent = "Visited";
        newCapsule.appendChild(marker);
      }
      
      // Add new click handler
      newCapsule.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log(` CLICKED: ${system.title}`);
        
        // Add visited state
        this.classList.add('visited');
        
        // Show the extreme planet detailed view
        showExtremeDetailedView(system);
      });
      
    } else {
      console.warn(` Capsule not found: ${system.capsuleId}`);
    }
  });
}

// PHASE 2: Enhanced detailed view with proper layout
function showExtremeDetailedView(extremeSystem) {
  console.log(`📍 Showing extreme detailed view: ${extremeSystem.title}`);
  console.log(`🔍 Extreme type: ${extremeSystem.extremeType}`);
  
  currentExtremeSystem = extremeSystem;
  currentExtremeStage = 1;
  
  // Set global reference for stage navigation compatibility
  // Make sure ALL properties are preserved
  window.currentActiveSystem = {
    ...extremeSystem,
    isExtreme: true,  // Add explicit flag
    extremeType: extremeSystem.extremeType
  };
  
  console.log(`✅ Set currentActiveSystem with extremeType: ${window.currentActiveSystem.extremeType}`);
  
  const overview = document.getElementById("overview");
  const detailedView = document.getElementById("detailed-view");
  
  if (!overview || !detailedView) {
    console.error(" Required elements not found");
    return;
  }
  
  // Update system titles for both stages
  updateSystemTitles(extremeSystem);
  
  // Hide overview section
  const section = document.getElementById("section-systems");
  if (section) section.style.display = "none";
  
  // Show detailed view with transition
  overview.style.opacity = 0;
  setTimeout(() => {
    overview.style.display = "none";
    detailedView.style.display = "block";
    detailedView.style.opacity = 1;
    
    // Reset to Stage 1 (Overview) by default
    resetStageNavigation();
    
    // Initialize the extreme planet visualization
    setTimeout(() => {
      renderExtremeOverview(extremeSystem);
    }, 200);
    
  }, 400);
}

// PHASE 2: Update system titles for integration
function updateSystemTitles(extremeSystem) {
  const elements = [
    { id: "system-title-orbit", text: extremeSystem.title },
    { id: "interactive-system-title", text: `${extremeSystem.title} - Interactive Explorer` },
    { id: "system-title", text: extremeSystem.title },
    { id: "system-description", text: extremeSystem.fullDesc }
  ];
  
  elements.forEach(({ id, text }) => {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  });
}

// PHASE 2: Stage navigation reset
function resetStageNavigation() {
  document.querySelectorAll('.stage-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.stage === '1');
  });
  
  document.querySelectorAll('.stage-panel').forEach(panel => {
    const isStage1 = panel.id.includes('stage-1');
    panel.classList.toggle('active', isStage1);
    panel.style.display = isStage1 ? 'block' : 'none';
  });
}

// PHASE 2: Enhanced Overview Mode (Stage 1) - NO ORBITAL CONTROLS
export function renderExtremeOverview(extremeSystem) {
  console.log(`📍 Rendering extreme overview: ${extremeSystem.title}`);
  
  currentExtremeStage = 1;
  
  // Use the OVERVIEW container for Stage 1
  const orbitContainer = document.getElementById('orbit-container');
  if (!orbitContainer) {
    console.error("❌ Orbit container not found");
    return;
  }
  
  // Clear container
  orbitContainer.innerHTML = "";
  orbitContainer.style.display = 'block';
  
  console.log("📦 Using container:", orbitContainer.id);
  
  // Get real planet data
  let planetData = null;
  if (window.ExoplanetData && window.ExoplanetData.isLoaded()) {
    const allPlanets = window.ExoplanetData.getAll();
    planetData = allPlanets.find(p => 
      p.pl_name === extremeSystem.planetName || 
      p.pl_name.includes(extremeSystem.planetName.split(' ')[0])
    );
  }
  
  // Render extreme planet visualization
  renderExtremePlanetVisualization(orbitContainer, planetData, extremeSystem, 1);
  updateExtremeProfile(planetData, extremeSystem);
  
  // PHASE 2: Setup extreme-specific overview controls (NO orbital controls)
  setTimeout(() => {
    setupExtremeOverviewControls(extremeSystem);
  }, 100);
  
  // Hide any standard animation controls
  hideOrbitalAnimationControls();
}

// PHASE 2: Enhanced Interactive Mode (Stage 2) - EXTREME CONTROLS
export function renderExtremeInteractive(extremeSystem) {
  console.log(`🎮 Rendering extreme interactive: ${extremeSystem.title}`);
  
  currentExtremeStage = 2;
  
  // IMPORTANT: Use the INTERACTIVE container for Stage 2!
  const container = document.getElementById('orbit-container-interactive');
  if (!container) {
    console.error("❌ Interactive container not found!");
    return;
  }
  
  // Clear container and make visible
  container.innerHTML = "";
  container.style.display = 'block';
  container.style.minHeight = '600px';
  
  console.log("📦 Using container:", container.id);
  
  // Get real planet data
  let planetData = null;
  if (window.ExoplanetData && window.ExoplanetData.isLoaded()) {
    const allPlanets = window.ExoplanetData.getAll();
    planetData = allPlanets.find(p => 
      p.pl_name === extremeSystem.planetName || 
      p.pl_name.includes(extremeSystem.planetName.split(' ')[0])
    );
  }
  
  // Render enhanced interactive visualization IN THE RIGHT CONTAINER
  renderExtremePlanetVisualization(container, planetData, extremeSystem, 2);
  
  // PHASE 2: Setup extreme-specific interactive controls
  setTimeout(() => {
    setupExtremeInteractiveControls(extremeSystem);
    showExtremeInteractiveControlPanel(extremeSystem.id);
  }, 200);
  
  // Hide standard animation controls AND controls bar
  hideOrbitalAnimationControls();
  const controlsBar = document.querySelector('.controls-bar');
  if (controlsBar) {
    controlsBar.style.display = 'none';
  }
}

// Helper function to check if content already exists
function isSystemAlreadyRendered(container, systemId) {
  // Check if the container has content and if it's for the same system
  const existingSvg = container.querySelector('svg');
  if (!existingSvg) return false;
  
  // Check for a unique identifier
  const currentSystemId = existingSvg.getAttribute('data-system-id');
  return currentSystemId === systemId;
}

// PHASE 2: Hide standard orbital animation controls for extreme planets
function hideOrbitalAnimationControls() {
  console.log("🚫 Hiding standard orbital animation controls for extreme planets");
  
  // Hide the entire animation controls section
  const animationSection = document.querySelector('.animation-controls-section');
  if (animationSection) {
    animationSection.style.display = 'none';
  }
  
  // Hide ORBITAL-SPECIFIC controls
  const orbitalControlsBar = document.querySelector('.orbital-controls-bar');
  if (orbitalControlsBar) {
    orbitalControlsBar.style.display = 'none';
  }
  
  const orbitalSystemControls = document.querySelector('.orbital-system-controls');
  if (orbitalSystemControls) {
    orbitalSystemControls.style.display = 'none';
  }
  
  // Hide planet navigation controls too
  const planetNav = document.querySelector('.planet-navigation-controls');
  if (planetNav) {
    planetNav.style.display = 'none';
  }
  
  // Hide orbital-specific elements
  const orbitalControls = [
    'animation-play-pause',
    'animation-speed-slider', 
    'interactive-animation-play-pause',
    'interactive-animation-speed-slider'
  ];
  
  orbitalControls.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none';
    }
  });
}

// PHASE 2: Enhanced extreme planet visualization
function renderExtremePlanetVisualization(container, planetData, extremeSystem, stage) {
  console.log(`🎨 Rendering extreme planet: ${extremeSystem.title} (Stage ${stage})`);
  console.log(`📊 Planet data available: ${planetData ? 'YES' : 'NO'}`);
  
  const width = 600;
  const height = 600;
  
  // Make sure container is a D3 selection
  if (typeof container === 'string' || container instanceof Element) {
    container = d3.select(container);
  }
  
  // Clear any existing content
  container.selectAll("*").remove();
  
  const svg = container
    .append("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("data-system-id", extremeSystem.id)  // Add system ID for tracking
    .style("background", "radial-gradient(circle, #000428 0%, #004e92 100%)")
    .style("width", "100%")
    .style("height", "100%")
    .style("border-radius", "10px");
    
  console.log("✓ SVG created");
   
  // ADD THIS DEBUG CODE:
  console.log("🔍 Container contents:", container.node().innerHTML.substring(0, 200));
  console.log("🔍 SVG style:", svg.style("background"));
  console.log("🔍 Container ID:", container.node().id);
  
  // PHASE 2: Enhanced backgrounds per extreme type and stage
  addExtremeBackground(svg, extremeSystem, planetData, stage);
  
  // Central extreme planet with enhanced effects
  const planetRadius = stage === 2 ? 100 : 80;
  const planet = svg.append("circle")
    .attr("class", "extreme-planet")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", planetRadius)
    .style("fill", getExtremePlanetGradient(svg, extremeSystem, planetData))
    .style("stroke", extremeSystem.color)
    .style("stroke-width", stage === 2 ? 4 : 3)
    .style("filter", `drop-shadow(0 0 ${stage === 2 ? 40 : 25}px ${extremeSystem.color})`)
    .style("cursor", "pointer")
    .on("click", function(event) {
      event.stopPropagation();
      showExtremeSystemInfo(extremeSystem, planetData);
    });
  
  // PHASE 2: Add extreme effects based on planet type and stage
  addExtremeEffects(svg, extremeSystem, planetData, stage);
  
  // Add enhanced stats display
  addExtremeStats(svg, planetData, extremeSystem, stage);
  
  // PHASE 2: Start extreme-specific animation (not orbital)
  startExtremeEnvironmentalAnimation(svg, extremeSystem, stage);
  
  return { svg, planet };
}

// PHASE 2: Enhanced background effects per extreme type
function addExtremeBackground(svg, extremeSystem, planetData, stage) {
  if (extremeSystem.id === "kelt") {
    // KELT-9b: Plasma and stellar radiation effects
    addKELTBackground(svg, stage, planetData);
  } else if (extremeSystem.id === "wasp") {
    // WASP-76b: Day/night terminator and metal clouds
    addWASPBackground(svg, stage, planetData);
  } else if (extremeSystem.id === "kepler80") {
    // Kepler-80f: Ultra-dense matter structure
    addKepler80Background(svg, stage, planetData);
  }
}

// PHASE 2: KELT-9b specific background
function addKELTBackground(svg, stage, planetData) {
  const intensity = extremeControlStates.kelt.plasmaIntensity / 100;
  const radiation = extremeControlStates.kelt.stellarRadiation / 100;
  
  console.log(`🔥 Adding KELT background - Stage: ${stage}, Intensity: ${intensity}`);
  
  // Plasma rings (more intense based on controls)
  for (let i = 0; i < (stage === 2 ? 12 : 6); i++) {
    svg.append("circle")
      .attr("class", "plasma-ring")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 120 + (i * 25))
      .attr("fill", "none")
      .attr("stroke", d3.interpolateRgb("#ff3300", "#ffff00")(intensity))
      .attr("stroke-width", stage === 2 ? 3 + (intensity * 2) : 2)
      .attr("stroke-opacity", (stage === 2 ? 0.2 : 0.15) * intensity)
      .attr("stroke-dasharray", "8,12");
  }
  
  console.log(`✅ Added ${stage === 2 ? 12 : 6} plasma rings`);
  
  
  // Stellar radiation field
  if (stage === 2) {
    const radiationIntensity = radiation * 0.3;
    svg.append("circle")
      .attr("class", "radiation-field")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 300)
      .attr("fill", `radial-gradient(circle, transparent 60%, rgba(255, 51, 0, ${radiationIntensity}) 100%)`)
      .attr("opacity", radiation);
  }
  
  // Temperature indicator
  const temp = planetData?.pl_eqt || 4050;
  svg.append("text")
    .attr("x", 0).attr("y", stage === 2 ? -280 : -240)
    .attr("text-anchor", "middle")
    .attr("fill", "#ff6600")
    .style("font-size", stage === 2 ? "18px" : "14px")
    .style("font-weight", "bold")
    .text(`Surface: ${temp}K (${(temp - 273.15).toFixed(0)}°C)`);
}

// PHASE 2: WASP-76b specific background
function addWASPBackground(svg, stage, planetData) {
  const dayNight = extremeControlStates.wasp.dayNightRatio / 100;
  const rainIntensity = extremeControlStates.wasp.ironRainIntensity / 100;
  const windSpeed = extremeControlStates.wasp.windSpeed / 100;
  
  // Day/night terminator line
  const terminatorX = -300 + (dayNight * 600);
  svg.append("line")
    .attr("class", "terminator-line")
    .attr("x1", terminatorX).attr("y1", -300)
    .attr("x2", terminatorX).attr("y2", 300)
    .attr("stroke", "#ffaa00")
    .attr("stroke-width", stage === 2 ? 4 : 2)
    .attr("stroke-dasharray", "15,10")
    .attr("opacity", stage === 2 ? 0.8 : 0.5);
  
  // Day side (hot, metal vaporization)
  svg.append("rect")
    .attr("class", "day-side")
    .attr("x", -300)
    .attr("y", -300)
    .attr("width", terminatorX + 300)
    .attr("height", 600)
    .attr("fill", `linear-gradient(to right, rgba(255, 100, 0, 0.3), rgba(255, 200, 0, 0.1))`)
    .attr("opacity", dayNight);
  
  // Night side (cooler, iron rain)
  svg.append("rect")
    .attr("class", "night-side")
    .attr("x", terminatorX)
    .attr("y", -300)
    .attr("width", 300 - terminatorX)
    .attr("height", 600)
    .attr("fill", `linear-gradient(to left, rgba(100, 150, 255, 0.2), rgba(50, 100, 200, 0.1))`)
    .attr("opacity", 1 - dayNight);
  
  // Metal clouds
  const cloudCount = stage === 2 ? Math.floor(8 * rainIntensity) : 3;
  for (let i = 0; i < cloudCount; i++) {
    svg.append("ellipse")
      .attr("class", "metal-cloud")
      .attr("cx", -200 + (Math.random() * 400))
      .attr("cy", -200 + (Math.random() * 400))
      .attr("rx", 20 + (Math.random() * 30))
      .attr("ry", 10 + (Math.random() * 15))
      .attr("fill", "#ff6b47")
      .attr("opacity", 0.3 * rainIntensity);
  }
  
  // Temperature labels
  if (stage === 2) {
    svg.append("text")
      .attr("x", -150).attr("y", -260)
      .attr("text-anchor", "middle")
      .attr("fill", "#ff6b47")
      .style("font-size", "14px")
      .text("Day: 2500K");
      
    svg.append("text")
      .attr("x", 150).attr("y", -260)
      .attr("text-anchor", "middle")
      .attr("fill", "#6699ff")
      .style("font-size", "14px")
      .text("Night: 1500K");
  }
}

// PHASE 2: Kepler-80f specific background
function addKepler80Background(svg, stage, planetData) {
  const compression = extremeControlStates.kepler80.compressionLevel / 100;
  const gravity = extremeControlStates.kepler80.gravityMultiplier / 100;
  
  // Ultra-dense matter grid
  const gridSize = stage === 2 ? 16 : 12;
  const spacing = 30 * (1 - compression * 0.3); // Grid compresses based on control
  const cellSize = 3 + (compression * 2);
  
  for (let i = -gridSize/2; i < gridSize/2; i++) {
    for (let j = -gridSize/2; j < gridSize/2; j++) {
      const distance = Math.sqrt(i*i + j*j);
      if (distance < gridSize/2) {
        const x = i * spacing;
        const y = j * spacing;
        
        // Gravitational compression effect
        const compressionFactor = 1 - (distance / (gridSize/2)) * compression * 0.5;
        const adjustedX = x * compressionFactor;
        const adjustedY = y * compressionFactor;
        
        svg.append("rect")
          .attr("class", "density-cell")
          .attr("x", adjustedX - cellSize/2)
          .attr("y", adjustedY - cellSize/2)
          .attr("width", cellSize)
          .attr("height", cellSize)
          .attr("fill", d3.interpolateRgb("#888888", "#ffffff")(compression))
          .attr("opacity", 0.4 + (compression * 0.4));
      }
    }
  }
  
  // Density information
  const density = planetData?.pl_dens || 23.31;
  svg.append("text")
    .attr("x", 0).attr("y", stage === 2 ? -280 : -240)
    .attr("text-anchor", "middle")
    .attr("fill", "#cccccc")
    .style("font-size", stage === 2 ? "16px" : "14px")
    .style("font-weight", "bold")
    .text(`Density: ${parseFloat(density).toFixed(1)} g/cm³`);
    
  if (stage === 2) {
    svg.append("text")
      .attr("x", 0).attr("y", -260)
      .attr("text-anchor", "middle")
      .attr("fill", "#aaaaaa")
      .style("font-size", "12px")
      .text(`Surface Gravity: ${(gravity * 100).toFixed(1)}× Earth`);
  }
}

// PHASE 2: Enhanced gradient creation
function getExtremePlanetGradient(svg, extremeSystem, planetData) {
  const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
  const gradient = defs.append("radialGradient")
    .attr("id", `extreme-gradient-${extremeSystem.id}`)
    .attr("cx", "30%")
    .attr("cy", "30%");
  
  if (extremeSystem.id === "kelt") {
    const intensity = extremeControlStates.kelt.plasmaIntensity / 100;
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff");
    gradient.append("stop").attr("offset", "30%").attr("stop-color", d3.interpolateRgb("#ffff00", "#ffffff")(intensity));
    gradient.append("stop").attr("offset", "70%").attr("stop-color", "#ff6600");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#ff3300");
  } else if (extremeSystem.id === "wasp") {
    const dayNight = extremeControlStates.wasp.dayNightRatio / 100;
    gradient.append("stop").attr("offset", "0%").attr("stop-color", d3.interpolateRgb("#6699ff", "#ffdd88")(dayNight));
    gradient.append("stop").attr("offset", "50%").attr("stop-color", "#ff6b47");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", d3.interpolateRgb("#cc3300", "#4466aa")(1 - dayNight));
  } else if (extremeSystem.id === "kepler80") {
    const compression = extremeControlStates.kepler80.compressionLevel / 100;
    gradient.append("stop").attr("offset", "0%").attr("stop-color", d3.interpolateRgb("#dddddd", "#ffffff")(compression));
    gradient.append("stop").attr("offset", "50%").attr("stop-color", "#888888");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", d3.interpolateRgb("#444444", "#000000")(compression));
  }
  
  return `url(#extreme-gradient-${extremeSystem.id})`;
}

// PHASE 2: Enhanced effects with interactive controls
function addExtremeEffects(svg, extremeSystem, planetData, stage) {
  if (extremeSystem.id === "kelt") {
    addKELTEffects(svg, stage);
  } else if (extremeSystem.id === "wasp") {
    addWASPEffects(svg, stage);
  } else if (extremeSystem.id === "kepler80") {
    addKepler80Effects(svg, stage);
  }
}

// PHASE 2: KELT-9b plasma effects
function addKELTEffects(svg, stage) {
  const intensity = extremeControlStates.kelt.plasmaIntensity / 100;
  const flareInterval = stage === 2 ? (1000 * (1 - intensity)) : 2000;
  
  setInterval(() => {
    if (Math.random() < 0.3 * intensity) {
      const flare = svg.append("circle")
        .attr("class", "plasma-flare")
        .attr("cx", (Math.random() - 0.5) * 160)
        .attr("cy", (Math.random() - 0.5) * 160)
        .attr("r", 2)
        .attr("fill", "#ffffff")
        .attr("opacity", 0);
      
      flare.transition()
        .duration(600)
        .attr("r", 10 + (intensity * 10))
        .attr("opacity", intensity)
        .transition()
        .duration(800)
        .attr("r", 25 + (intensity * 15))
        .attr("opacity", 0)
        .remove();
    }
  }, flareInterval);
}

// PHASE 2: WASP-76b iron rain effects
function addWASPEffects(svg, stage) {
  const rainIntensity = extremeControlStates.wasp.ironRainIntensity / 100;
  const windSpeed = extremeControlStates.wasp.windSpeed / 100;
  const rainInterval = stage === 2 ? (200 * (1 - rainIntensity)) : 800;
  
  setInterval(() => {
    if (Math.random() < 0.4 * rainIntensity) {
      const startX = (Math.random() - 0.5) * 300;
      const endX = startX + (windSpeed * 50 * (Math.random() - 0.5));
      
      const drop = svg.append("line")
        .attr("class", "iron-rain")
        .attr("x1", startX)
        .attr("y1", -300)
        .attr("x2", startX)
        .attr("y2", -280)
        .attr("stroke", "#ff6b47")
        .attr("stroke-width", 2 + (rainIntensity * 2))
        .attr("opacity", 0.8);
      
      drop.transition()
        .duration(2000 * (1 - windSpeed * 0.5))
        .attr("x1", endX)
        .attr("x2", endX)
        .attr("y1", 300)
        .attr("y2", 320)
        .remove();
    }
  }, rainInterval);
}

// PHASE 2: Kepler-80f density compression effects
function addKepler80Effects(svg, stage) {
  const compression = extremeControlStates.kepler80.compressionLevel / 100;
  
  // Compression wave effect
  if (stage === 2) {
    setInterval(() => {
      if (Math.random() < 0.2) {
        const wave = svg.append("circle")
          .attr("class", "compression-wave")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 120)
          .attr("fill", "none")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 3)
          .attr("opacity", compression);
        
        wave.transition()
          .duration(2000)
          .attr("r", 20)
          .attr("stroke-width", 1)
          .attr("opacity", 0)
          .remove();
      }
    }, 3000);
  }
}

// PHASE 2: Enhanced stats with interactive data
function addExtremeStats(svg, planetData, extremeSystem, stage) {
  const stats = getExtremeStats(extremeSystem, planetData);
  
  // Main extreme stat
  svg.append("text")
    .attr("class", "extreme-main-stat")
    .attr("x", 0)
    .attr("y", stage === 2 ? 200 : 180)
    .attr("text-anchor", "middle")
    .attr("fill", extremeSystem.color)
    .attr("font-size", stage === 2 ? "36px" : "28px")
    .attr("font-weight", "bold")
    .text(stats.mainStat);
  
  // Subtitle
  svg.append("text")
    .attr("class", "extreme-subtitle")
    .attr("x", 0)
    .attr("y", stage === 2 ? 230 : 210)
    .attr("text-anchor", "middle")
    .attr("fill", "#cccccc")
    .attr("font-size", "16px")
    .text(extremeSystem.unique);
    
  if (stage === 2) {
    // Interactive stats display
    stats.detailStats.forEach((stat, i) => {
      svg.append("text")
        .attr("class", "extreme-detail-stat")
        .attr("x", -280)
        .attr("y", -220 + (i * 30))
        .attr("fill", "#cccccc")
        .attr("font-size", "14px")
        .text(stat);
    });
  }
}

// PHASE 2: Get extreme stats based on current control states
function getExtremeStats(extremeSystem, planetData) {
  if (extremeSystem.id === "kelt") {
    const temp = planetData?.pl_eqt || 4050;
    const plasmaTemp = temp + (extremeControlStates.kelt.plasmaIntensity * 10);
    return {
      mainStat: `${plasmaTemp}K`,
      detailStats: [
        `Plasma Intensity: ${extremeControlStates.kelt.plasmaIntensity}%`,
        `Stellar Radiation: ${extremeControlStates.kelt.stellarRadiation}%`,
        `Mass Loss Rate: ${(extremeControlStates.kelt.stellarRadiation * 0.01).toFixed(2)} M⊕/Gyr`,
        `Atmosphere: Completely Stripped`
      ]
    };
  } else if (extremeSystem.id === "wasp") {
    const baseTemp = planetData?.pl_eqt || 2500;
    const dayTemp = baseTemp + 200;
    const nightTemp = baseTemp - 1000;
    return {
      mainStat: `${dayTemp}K/${nightTemp}K`,
      detailStats: [
        `Day/Night Ratio: ${extremeControlStates.wasp.dayNightRatio}%`,
        `Iron Rain Rate: ${extremeControlStates.wasp.ironRainIntensity}%`,
        `Wind Speed: ${(extremeControlStates.wasp.windSpeed * 50).toFixed(0)} km/h`,
        `Tidal Locking: Synchronous`
      ]
    };
  } else if (extremeSystem.id === "kepler80") {
    const density = planetData?.pl_dens || 23.31;
    const compressedDensity = density * (1 + extremeControlStates.kepler80.compressionLevel / 100);
    return {
      mainStat: `${compressedDensity.toFixed(1)} g/cm³`,
      detailStats: [
        `Compression Level: ${extremeControlStates.kepler80.compressionLevel}%`,
        `Surface Gravity: ${(extremeControlStates.kepler80.gravityMultiplier).toFixed(1)}× Earth`,
        `Core Pressure: ${(compressedDensity * 100).toFixed(0)} GPa`,
        `Material: Ultra-Dense Rock/Metal`
      ]
    };
  }
  return { mainStat: "EXTREME", detailStats: [] };
}

// PHASE 2: Environmental animation (not orbital)
function startExtremeEnvironmentalAnimation(svg, extremeSystem, stage) {
  // Always stop previous timer first
  if (extremeAnimationTimer) {
    extremeAnimationTimer.stop();
    extremeAnimationTimer = null;
  }
  
  console.log(`🎬 Starting environmental animation for ${extremeSystem.title}`);
  
  let elapsed = 0;
  extremeAnimationTimer = d3.timer((time) => {
    if (!isExtremeAnimationPlaying) return;
    
    elapsed = time;
    
    // Gentle planet rotation
    svg.select(".extreme-planet")
      .attr("transform", `rotate(${elapsed * 0.01})`);
    
    // System-specific environmental animations
    if (extremeSystem.id === "kelt") {
      // Pulse plasma rings based on intensity
      const intensity = extremeControlStates.kelt.plasmaIntensity / 100;
      svg.selectAll(".plasma-ring")
        .attr("stroke-opacity", (stage === 2 ? 0.15 : 0.1) * intensity + 
          (stage === 2 ? 0.1 : 0.05) * intensity * Math.sin(elapsed * 0.003));
    } else if (extremeSystem.id === "wasp") {
      // Terminator line shifting
      const shift = 5 * Math.sin(elapsed * 0.001);
      svg.select(".terminator-line")
        .attr("transform", `translate(${shift}, 0)`);
    } else if (extremeSystem.id === "kepler80") {
      // Compression pulse effect
      const compression = extremeControlStates.kepler80.compressionLevel / 100;
      const scale = 0.95 + 0.05 * compression * Math.sin(elapsed * 0.004);
      svg.selectAll(".density-cell")
        .attr("transform", `scale(${scale})`);
    }
  });
}

// PHASE 2: Setup extreme-specific overview controls (replace orbital controls)
// PHASE 2: Setup extreme-specific overview controls (replace orbital controls)
function setupExtremeOverviewControls(extremeSystem) {
  console.log(`🎮 Setting up overview controls for: ${extremeSystem.title}`);
  
  // DON'T replace innerHTML! Just hide the animation controls
  const animationSection = document.querySelector('.animation-controls-section');
  if (animationSection) {
    animationSection.style.display = 'none';  // Hide, don't destroy
  }
  
  // Create a separate container for extreme controls
  let extremeSection = document.querySelector('.extreme-overview-section');
  if (!extremeSection) {
    extremeSection = document.createElement('div');
    extremeSection.className = 'extreme-overview-section animation-controls-section';
    // Insert it after the hidden animation controls
    if (animationSection && animationSection.parentNode) {
      animationSection.parentNode.insertBefore(extremeSection, animationSection.nextSibling);
    }
  }
  
  // Put extreme controls in the new section
  extremeSection.innerHTML = `
    <div class="control-group">
      <h3>🌟 Extreme Conditions</h3>
      <div class="extreme-overview-stats" id="extreme-overview-stats">
        <div class="stat-item">
          <span class="stat-label">Type:</span>
          <span class="stat-value">${extremeSystem.unique}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Extremeness:</span>
          <span class="stat-value">Beyond Earth Limits</span>
        </div>
      </div>
      <button class="control-button" onclick="showExtremeComparison('${extremeSystem.id}')">
        Compare to Earth
      </button>
    </div>
  `;
  extremeSection.style.display = 'block';
  
  // ADD: Visual indicator AFTER setting innerHTML
  const controlGroup = extremeSection.querySelector('.control-group');
  if (controlGroup && !controlGroup.querySelector('.system-type-indicator')) {
    const indicator = document.createElement('div');
    indicator.className = 'system-type-indicator extreme-type';
    indicator.innerHTML = '<i class="fas fa-fire"></i> Extreme Planet';
    controlGroup.insertBefore(indicator, controlGroup.firstChild);
  }
}

// PHASE 2: Setup extreme-specific interactive controls
function setupExtremeInteractiveControls(extremeSystem) {
  console.log(`🎮 Setting up interactive controls for: ${extremeSystem.title}`);
  
  // Show the appropriate extreme control panel
  showExtremeInteractiveControlPanel(extremeSystem.id);
}

// PHASE 2: Get HTML for extreme-specific controls
function getExtremeControlsHTML(extremeSystem) {
  if (extremeSystem.id === "kelt") {
    return `
      <div class="extreme-controls-container">
        <div class="control-item">
          <label>Plasma Intensity: <span id="plasma-intensity-value">${extremeControlStates.kelt.plasmaIntensity}%</span></label>
          <input type="range" id="plasma-intensity" min="0" max="100" value="${extremeControlStates.kelt.plasmaIntensity}" class="extreme-slider">
        </div>
        <div class="control-item">
          <label>Stellar Radiation: <span id="stellar-radiation-value">${extremeControlStates.kelt.stellarRadiation}%</span></label>
          <input type="range" id="stellar-radiation" min="0" max="100" value="${extremeControlStates.kelt.stellarRadiation}" class="extreme-slider">
        </div>
        <div class="control-item">
          <label>Temperature Mode:</label>
          <select id="temperature-mode" class="extreme-select">
            <option value="surface" ${extremeControlStates.kelt.temperatureMode === 'surface' ? 'selected' : ''}>Surface</option>
            <option value="atmosphere" ${extremeControlStates.kelt.temperatureMode === 'atmosphere' ? 'selected' : ''}>Atmosphere</option>
            <option value="plasma" ${extremeControlStates.kelt.temperatureMode === 'plasma' ? 'selected' : ''}>Plasma Layer</option>
          </select>
        </div>
      </div>
    `;
  } else if (extremeSystem.id === "wasp") {
    return `
      <div class="extreme-controls-container">
        <div class="control-item">
          <label>Day/Night Balance: <span id="day-night-value">${extremeControlStates.wasp.dayNightRatio}%</span></label>
          <input type="range" id="day-night-ratio" min="0" max="100" value="${extremeControlStates.wasp.dayNightRatio}" class="extreme-slider">
        </div>
        <div class="control-item">
          <label>Iron Rain Intensity: <span id="iron-rain-value">${extremeControlStates.wasp.ironRainIntensity}%</span></label>
          <input type="range" id="iron-rain-intensity" min="0" max="100" value="${extremeControlStates.wasp.ironRainIntensity}" class="extreme-slider">
        </div>
        <div class="control-item">
          <label>Wind Speed: <span id="wind-speed-value">${extremeControlStates.wasp.windSpeed}%</span></label>
          <input type="range" id="wind-speed" min="0" max="100" value="${extremeControlStates.wasp.windSpeed}" class="extreme-slider">
        </div>
        <div class="control-item">
          <button id="toggle-terminator" class="control-button">
            ${extremeControlStates.wasp.showTerminator ? 'Hide' : 'Show'} Terminator
          </button>
        </div>
      </div>
    `;
  } else if (extremeSystem.id === "kepler80") {
    return `
      <div class="extreme-controls-container">
        <div class="control-item">
          <label>Compression Level: <span id="compression-value">${extremeControlStates.kepler80.compressionLevel}%</span></label>
          <input type="range" id="compression-level" min="0" max="100" value="${extremeControlStates.kepler80.compressionLevel}" class="extreme-slider">
        </div>
        <div class="control-item">
          <label>Gravity Multiplier: <span id="gravity-value">${extremeControlStates.kepler80.gravityMultiplier}%</span></label>
          <input type="range" id="gravity-multiplier" min="10" max="200" value="${extremeControlStates.kepler80.gravityMultiplier}" class="extreme-slider">
        </div>
        <div class="control-item">
          <label>Compare Material:</label>
          <select id="material-comparison" class="extreme-select">
            <option value="diamond" ${extremeControlStates.kepler80.materialComparison === 'diamond' ? 'selected' : ''}>Diamond (3.5 g/cm³)</option>
            <option value="iron" ${extremeControlStates.kepler80.materialComparison === 'iron' ? 'selected' : ''}>Iron (7.9 g/cm³)</option>
            <option value="lead" ${extremeControlStates.kepler80.materialComparison === 'lead' ? 'selected' : ''}>Lead (11.3 g/cm³)</option>
            <option value="osmium" ${extremeControlStates.kepler80.materialComparison === 'osmium' ? 'selected' : ''}>Osmium (22.6 g/cm³)</option>
          </select>
        </div>
      </div>
    `;
  }
  return '';
}

// PHASE 2: Setup extreme control listeners
function setupExtremeControlListeners(extremeSystem) {
  if (extremeSystem.id === "kelt") {
    setupKELTControlListeners();
  } else if (extremeSystem.id === "wasp") {
    setupWASPControlListeners();
  } else if (extremeSystem.id === "kepler80") {
    setupKepler80ControlListeners();
  }
}

// PHASE 2: KELT-9b control listeners
function setupKELTControlListeners() {
  const plasmaSlider = document.getElementById('plasma-intensity');
  const radiationSlider = document.getElementById('stellar-radiation');
  const tempMode = document.getElementById('temperature-mode');
  
  if (plasmaSlider) {
    plasmaSlider.oninput = function() {
      extremeControlStates.kelt.plasmaIntensity = parseInt(this.value);
      document.getElementById('plasma-intensity-value').textContent = `${this.value}%`;
      updateKELTVisualization();
    };
  }
  
  if (radiationSlider) {
    radiationSlider.oninput = function() {
      extremeControlStates.kelt.stellarRadiation = parseInt(this.value);
      document.getElementById('stellar-radiation-value').textContent = `${this.value}%`;
      updateKELTVisualization();
    };
  }
  
  if (tempMode) {
    tempMode.onchange = function() {
      extremeControlStates.kelt.temperatureMode = this.value;
      updateKELTVisualization();
    };
  }
}

// PHASE 2: WASP-76b control listeners
function setupWASPControlListeners() {
  const dayNightSlider = document.getElementById('day-night-ratio');
  const rainSlider = document.getElementById('iron-rain-intensity');
  const windSlider = document.getElementById('wind-speed');
  const terminatorBtn = document.getElementById('toggle-terminator');
  
  if (dayNightSlider) {
    dayNightSlider.oninput = function() {
      extremeControlStates.wasp.dayNightRatio = parseInt(this.value);
      document.getElementById('day-night-value').textContent = `${this.value}%`;
      updateWASPVisualization();
    };
  }
  
  if (rainSlider) {
    rainSlider.oninput = function() {
      extremeControlStates.wasp.ironRainIntensity = parseInt(this.value);
      document.getElementById('iron-rain-value').textContent = `${this.value}%`;
      updateWASPVisualization();
    };
  }
  
  if (windSlider) {
    windSlider.oninput = function() {
      extremeControlStates.wasp.windSpeed = parseInt(this.value);
      document.getElementById('wind-speed-value').textContent = `${this.value}%`;
      updateWASPVisualization();
    };
  }
  
  if (terminatorBtn) {
    terminatorBtn.onclick = function() {
      extremeControlStates.wasp.showTerminator = !extremeControlStates.wasp.showTerminator;
      this.textContent = extremeControlStates.wasp.showTerminator ? 'Hide Terminator' : 'Show Terminator';
      updateWASPVisualization();
    };
  }
}

// PHASE 2: Kepler-80f control listeners
function setupKepler80ControlListeners() {
  const compressionSlider = document.getElementById('compression-level');
  const gravitySlider = document.getElementById('gravity-multiplier');
  const materialSelect = document.getElementById('material-comparison');
  
  if (compressionSlider) {
    compressionSlider.oninput = function() {
      extremeControlStates.kepler80.compressionLevel = parseInt(this.value);
      document.getElementById('compression-value').textContent = `${this.value}%`;
      updateKepler80Visualization();
    };
  }
  
  if (gravitySlider) {
    gravitySlider.oninput = function() {
      extremeControlStates.kepler80.gravityMultiplier = parseInt(this.value);
      document.getElementById('gravity-value').textContent = `${this.value}%`;
      updateKepler80Visualization();
    };
  }
  
  if (materialSelect) {
    materialSelect.onchange = function() {
      extremeControlStates.kepler80.materialComparison = this.value;
      updateKepler80Visualization();
    };
  }
}

// PHASE 2: Update visualization functions
function updateKELTVisualization() {
  console.log('Updating KELT-9b visualization');
  if (currentExtremeSystem?.id === "kelt" && currentExtremeStage === 2) {
    // Don't re-render, just update the visual elements
    const svg = d3.select('#orbit-container-interactive svg');
    if (!svg.empty()) {
      const intensity = extremeControlStates.kelt.plasmaIntensity / 100;
      const radiation = extremeControlStates.kelt.stellarRadiation / 100;
      
      // Update plasma rings
      svg.selectAll(".plasma-ring")
        .attr("stroke", d3.interpolateRgb("#ff3300", "#ffff00")(intensity))
        .attr("stroke-width", 3 + (intensity * 2))
        .attr("stroke-opacity", 0.2 * intensity);
        
      // Update planet gradient
      svg.select(".extreme-planet")
        .style("filter", `drop-shadow(0 0 ${40 + intensity * 20}px ${currentExtremeSystem.color})`);
    }
  }
}

function updateWASPVisualization() {
  console.log('Updating WASP-76b visualization');
  if (currentExtremeSystem?.id === "wasp" && currentExtremeStage === 2) {
    const svg = d3.select('#orbit-container-interactive svg');
    if (!svg.empty()) {
      const dayNight = extremeControlStates.wasp.dayNightRatio / 100;
      const rainIntensity = extremeControlStates.wasp.ironRainIntensity / 100;
      
      // Update terminator line position
      const terminatorX = -300 + (dayNight * 600);
      svg.select(".terminator-line")
        .attr("x1", terminatorX)
        .attr("x2", terminatorX);
        
      // Update day/night sides
      svg.select(".day-side")
        .attr("width", terminatorX + 300)
        .attr("opacity", dayNight);
        
      svg.select(".night-side")
        .attr("x", terminatorX)
        .attr("width", 300 - terminatorX)
        .attr("opacity", 1 - dayNight);
    }
  }
}

function updateKepler80Visualization() {
  console.log('Updating Kepler-80f visualization');
  if (currentExtremeSystem?.id === "kepler80" && currentExtremeStage === 2) {
    const svg = d3.select('#orbit-container-interactive svg');
    if (!svg.empty()) {
      const compression = extremeControlStates.kepler80.compressionLevel / 100;
      const gravity = extremeControlStates.kepler80.gravityMultiplier / 100;
      
      // Update density cells
      svg.selectAll(".density-cell")
        .attr("fill", d3.interpolateRgb("#888888", "#ffffff")(compression))
        .attr("opacity", 0.4 + (compression * 0.4));
        
      // Update planet size based on compression
      svg.select(".extreme-planet")
        .attr("r", 100 * (1 - compression * 0.1));
    }
  }
}

// PHASE 2: Show extreme interactive control panel
function showExtremeInteractiveControlPanel(systemId) {
  console.log(`🎮 Showing extreme interactive control panel for: ${systemId}`);
  
  // Debug: Check if the grid container exists
  const gridContainer = document.querySelector('.minimal-interactive-layout');
  console.log(`🔍 Grid container found:`, !!gridContainer);
  
  // Hide all system control panels first
  document.querySelectorAll('.control-panel').forEach(panel => {
    panel.style.display = 'none';
  });
  
  // Show the appropriate extreme control panel
  const panelId = `${systemId}-controls`;
  const panel = document.getElementById(panelId);
  
  if (panel) {
    panel.style.display = 'block';
    console.log(`✅ Showing control panel: ${panelId}`);
    console.log(`🔍 Panel computed style:`, window.getComputedStyle(panel));
    console.log(`🔍 Panel parent:`, panel.parentElement);
    
    // Insert the controls HTML into the control grid
    const controlGrid = document.getElementById(`${systemId}-interactive-controls`);
    if (controlGrid) {
      const extremeSystem = extremeSystemData.find(s => s.id === systemId);
      controlGrid.innerHTML = getExtremeControlsHTML(extremeSystem);
      console.log(`✅ Inserted controls HTML for ${systemId}`);
      
      // Setup the control listeners
      setupExtremeControlListeners(extremeSystem);
      console.log(`✅ Setup control listeners for ${systemId}`);
    } else {
      console.error(`❌ Control grid not found: ${systemId}-interactive-controls`);
    }
  } else {
    console.error(`❌ Control panel not found: ${panelId}`);
  }
  
  // Update interactive controls title
  const titleElement = document.getElementById('interactive-controls-title');
  if (titleElement) {
    const titles = {
      'kelt': 'KELT-9b Plasma Controls',
      'wasp': 'WASP-76b Iron Rain Controls', 
      'kepler80': 'Kepler-80f Density Controls'
    };
    titleElement.textContent = titles[systemId] || 'Extreme Planet Controls';
  }
}

// PHASE 2: Show extreme comparison (for overview mode)
window.showExtremeComparison = function(systemId) {
  console.log(`Showing Earth comparison for: ${systemId}`);
  
  const system = extremeSystemData.find(s => s.id === systemId);
  if (!system) return;
  
  let comparisonText = '';
  if (systemId === 'kelt') {
    comparisonText = 'KELT-9b is 4,050K vs Earth\'s 255K average - hot enough to vaporize most metals!';
  } else if (systemId === 'wasp') {
    comparisonText = 'WASP-76b has iron rain vs Earth\'s water rain - temperatures exceed 2,500K!';
  } else if (systemId === 'kepler80') {
    comparisonText = 'Kepler-80f density: 23+ g/cm³ vs Earth\'s 5.5 g/cm³ - denser than any Earth material!';
  }
  
  alert(comparisonText); // Simple implementation - could be enhanced with modal
};

// PHASE 2: Enhanced profile updates with interactive data
function updateExtremeProfile(planetData, extremeSystem) {
  const stats = getExtremeStats(extremeSystem, planetData);
  
  const updates = [
    { id: 'profile-planet-name', text: planetData?.pl_name || extremeSystem.title },
    { id: 'profile-planet-mass', text: `${planetData ? parseFloat(planetData.pl_bmasse || 1).toFixed(2) : '1.00'} Earth masses` },
    { id: 'profile-planet-radius', text: `${planetData ? parseFloat(planetData.pl_rade || 1).toFixed(2) : '1.00'} Earth radii` },
    { id: 'profile-planet-period', text: `${planetData ? parseFloat(planetData.pl_orbper || 1).toFixed(2) : '1.00'} days` },
    { id: 'profile-planet-distance', text: `${planetData ? parseFloat(planetData.pl_orbsmax || 0).toFixed(3) : '0.000'} AU` },
    { id: 'profile-planet-temp', text: stats.mainStat },
    { id: 'profile-planet-description', text: `${extremeSystem.fullDesc}\n\nThis extreme world pushes the boundaries of planetary science with conditions impossible on Earth.` }
  ];

  updates.forEach(({ id, text }) => {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  });
  
  updateExtremePlanetVisual(extremeSystem);
}

// PHASE 2: Show system info for extreme planets
function showExtremeSystemInfo(extremeSystem, planetData) {
  if (!extremeSystem) return;
  
  const stats = getExtremeStats(extremeSystem, planetData);
  
  const updates = [
    { id: 'profile-planet-name', text: extremeSystem.title },
    { id: 'profile-planet-mass', text: planetData ? `${parseFloat(planetData.pl_bmasse || 1).toFixed(2)} Earth masses` : 'Unknown' },
    { id: 'profile-planet-radius', text: planetData ? `${parseFloat(planetData.pl_rade || 1).toFixed(2)} Earth radii` : 'Unknown' },
    { id: 'profile-planet-period', text: planetData ? `${parseFloat(planetData.pl_orbper || 1).toFixed(2)} days` : 'Unknown' },
    { id: 'profile-planet-temp', text: stats.mainStat },
    { id: 'profile-planet-distance', text: planetData ? `${parseFloat(planetData.pl_orbsmax || 0).toFixed(3)} AU` : 'Unknown' },
    { id: 'profile-planet-description', text: `${extremeSystem.fullDesc}\n\nCurrent conditions: ${stats.detailStats.join(' • ')}` }
  ];
  
  updates.forEach(({ id, text }) => {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  });
  
  updateExtremePlanetVisual(extremeSystem);
}

// PHASE 2: Enhanced planet visual updates
function updateExtremePlanetVisual(extremeSystem) {
  const visual = document.getElementById('planet-visual-display');
  if (visual) {
    let gradientColor = extremeSystem.color;
    
    // Adjust color based on current control states
    if (extremeSystem.id === "kelt") {
      const intensity = extremeControlStates.kelt.plasmaIntensity / 100;
      gradientColor = d3.interpolateRgb("#ff3300", "#ffffff")(intensity);
    } else if (extremeSystem.id === "wasp") {
      const dayNight = extremeControlStates.wasp.dayNightRatio / 100;
      gradientColor = d3.interpolateRgb("#6699ff", "#ff6b47")(dayNight);
    } else if (extremeSystem.id === "kepler80") {
      const compression = extremeControlStates.kepler80.compressionLevel / 100;
      gradientColor = d3.interpolateRgb("#888888", "#ffffff")(compression);
    }
    
    visual.style.background = `radial-gradient(circle at 30% 30%, ${gradientColor}, ${gradientColor}88)`;
    visual.style.boxShadow = `0 0 30px ${gradientColor}66, inset -10px -10px 20px rgba(0, 0, 0, 0.3)`;
    
    // Add extreme-specific effects
    visual.style.boxShadow += `, 0 0 40px ${extremeSystem.color}44`;
  }
}

// PHASE 2: Enhanced cleanup function
export function cleanupExtremeSystem() {
  if (extremeAnimationTimer) {
    extremeAnimationTimer.stop();
    extremeAnimationTimer = null;
  }
  
  // Reset state variables
  currentExtremeSystem = null;
  currentExtremeStage = 1;
  currentSelectedExtremePlanet = 0;
  isExtremeAnimationPlaying = true;
  extremeAnimationSpeed = 1;
  
  // Remove any global tooltips
  d3.select("#tooltip").remove();

  // Remove extreme overview section
  const extremeSection = document.querySelector('.extreme-overview-section');
  if (extremeSection) {
    extremeSection.remove();
  }
  
  // Show standard animation controls again
  const animationSection = document.querySelector('.animation-controls-section');
  if (animationSection) {
    animationSection.style.display = 'block';
  }
  
  // Show controls bar again
  const controlsBar = document.querySelector('.controls-bar');
  if (controlsBar) {
    controlsBar.style.display = 'flex';
  }
  
  const orbitalControls = [
    'animation-play-pause',
    'animation-speed-slider', 
    'interactive-animation-play-pause',
    'interactive-animation-speed-slider'
  ];
  
  orbitalControls.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'block';
    }
  });
}