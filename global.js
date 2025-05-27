import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// =========================================
// GLOBAL DATA USAGE loading main csv file 
// ==========================================
let allExoplanets = [];
let dataLoadedCallbacks = [];
let isDataLoaded = false;

// Global data management object for everyone to use
window.ExoplanetData = {
  // Get all exoplanet data
  getAll: () => allExoplanets,
  // Filter by hostname (star system)
  getByHostname: (hostname) => allExoplanets.filter(d => d.hostname === hostname),
  // Filter by multiple hostnames
  getByHostnames: (hostnames) => allExoplanets.filter(d => hostnames.includes(d.hostname)),
  // Filter by discovery year
  getByDiscoveryYear: (year) => allExoplanets.filter(d => d.disc_year == year),
  // Filter by discovery year range
  getByYearRange: (startYear, endYear) => allExoplanets.filter(d => {
    const year = parseInt(d.disc_year);
    return year >= startYear && year <= endYear;
  }),
  // Filter by planet radius range
  getByRadiusRange: (minRadius, maxRadius) => allExoplanets.filter(d => {
    const radius = parseFloat(d.pl_rade);
    return radius >= minRadius && radius <= maxRadius;
  }),
  // Filter by orbital period range
  getByPeriodRange: (minPeriod, maxPeriod) => allExoplanets.filter(d => {
    const period = parseFloat(d.pl_orbper);
    return period >= minPeriod && period <= maxPeriod;
  }),
  // Filter by discovery method
  getByDiscoveryMethod: (method) => allExoplanets.filter(d => d.discoverymethod === method),
  // Get unique values for a specific column
  getUniqueValues: (column) => [...new Set(allExoplanets.map(d => d[column]).filter(v => v))],
  // Custom filter function - pass your own filter function
  getFiltered: (filterFunction) => allExoplanets.filter(filterFunction),
  // Get summary statistics
  getStats: () => ({
    total: allExoplanets.length,
    uniqueStars: new Set(allExoplanets.map(d => d.hostname)).size,
    discoveryMethods: [...new Set(allExoplanets.map(d => d.discoverymethod))],
    yearRange: {
      min: Math.min(...allExoplanets.map(d => parseInt(d.disc_year)).filter(y => !isNaN(y))),
      max: Math.max(...allExoplanets.map(d => parseInt(d.disc_year)).filter(y => !isNaN(y)))
    }
  }),
  
  // Check if data is loaded
  isLoaded: () => isDataLoaded,
  
  // Register callback for when data is loaded
  onDataLoaded: (callback) => {
    if (isDataLoaded) {
      callback(allExoplanets);
    } else {
      dataLoadedCallbacks.push(callback);
    }
  }
};
// functions for all sections
function initAllSections() {
  initializeCamilleSection();
  //initJackieSection();
  //initRoyceSection();
  //initNghiSection();
}


// Load exoplanet data globally
function loadExoplanetData() {
  console.log('Loading exoplanet data...');
  
  d3.csv("exoplanet.csv").then(data => {
    allExoplanets = data;
    isDataLoaded = true;
    
    console.log(`Loaded ${data.length} exoplanets`);
    console.log('Sample data:', data[0]);
    
    // Execute all callbacks waiting for data
    dataLoadedCallbacks.forEach(callback => callback(allExoplanets));
    dataLoadedCallbacks = []; // Clear callbacks after execution
    
    // Initialize indvidual sections that depend on data
    initAllSections();

  }).catch(error => {
    console.error('Error loading exoplanet data:', error);
  });
}

// ===========================
// PROGRESS BAR SYSTEM: Line 128 END
// ===========================
// Initialize enhanced progress bar functionality
function initEnhancedProgressBar() {
  const progressBar = d3.select('#progress-bar');
  const progressPercentage = d3.select('#progress-percentage');
  const header = d3.select('#main-header');
  const progressLabels = d3.selectAll('.progress-labels span');
  const navLinks = d3.selectAll('.nav-link');
  
  // Calculate scroll progress with enhanced features
  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calculate progress percentage
    const scrollableHeight = documentHeight - windowHeight;
    const progress = Math.min(Math.max(scrollTop / scrollableHeight, 0), 1);
    const percentage = Math.round(progress * 100);
    
    // Update progress bar with smooth D3 transition
    progressBar
      .transition()
      .duration(50)
      .style('width', `${percentage}%`);
    
    // Update percentage display
    progressPercentage.text(`${percentage}%`);

    // Enhanced header background opacity based on scroll
    const headerOpacity = Math.min(0.95, 0.7 + (progress * 0.25));
    header
      .transition()
      .duration(100)
      .style('background', `rgba(0, 0, 0, ${headerOpacity})`);
    
    // Update active section highlighting
    updateActiveSections();
  }
  
  // Update active sections and navigation
  function updateActiveSections() {
  const sections = document.querySelectorAll('.scroll-section');
  const scrollPosition = window.pageYOffset + window.innerHeight * 0.3;

  let activeSectionId = null;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      activeSectionId = section.id;
    }
  });

  document.querySelectorAll('.progress-labels a').forEach((link) => {
    if (link.getAttribute('href') === `#${activeSectionId}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
window.addEventListener('scroll', () => {
  requestAnimationFrame(updateActiveSections);
});
  // Enhanced smooth scroll navigation
  function setupSmoothNavigation() {
    navLinks.on('click', function(event) {
      event.preventDefault();
      
      const target = d3.select(this).attr('href');
      const targetElement = document.querySelector(target);
      
      if (targetElement) {
        // Add click animation
        d3.select(this)
          .transition()
          .duration(150)
          .style('transform', 'scale(0.95)')
          .transition()
          .duration(150)
          .style('transform', 'scale(1)');
        
        // Smooth scroll with custom easing
        const targetPosition = targetElement.offsetTop - 120; // Account for fixed header
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800;
        let startTime = null;
        
        function animation(currentTime) {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          
          // Easing function (ease-in-out-cubic)
          const ease = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          window.scrollTo(0, startPosition + distance * ease);
          
          if (timeElapsed < duration) {
            requestAnimationFrame(animation);
          }
        }
        
        requestAnimationFrame(animation);
      }
    });
  }
  // Setup navigation
  setupSmoothNavigation();
  
  // Initial progress calculation
  updateProgress();
  
  console.log('Progress Bar System Initialized');
}

// ==================================================
// D3 ORBIT STORIES Global Code: Camille's Code START
// END at line:279
// ==================================================
import { renderSystem, initializeEnhancedSystem, cleanupEnhancedSystem, setupKeyboardNavigation } from './camilleOrbit.js';

const visitedSystems = new Set();
// let allExoplanets = [];
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
function initializeCamilleSection() {
  systemData.forEach(system => {
    const planetData = ExoplanetData.getByHostname(system.hostname);
    drawMiniSystem(`#mini-${system.id}`, planetData);
  });
  setupConnectionLines();
  enhanceCapsules();
  
  // ADD THIS LINE:
  setupKeyboardNavigation();
}

/*
d3.csv("exoplanet.csv").then(data => {
  allExoplanets = data;
  systemData.forEach(system => {
    const planetData = data.filter(d => d.hostname === system.hostname);
    drawMiniSystem(`#mini-${system.id}`, planetData);
  });
  setupConnectionLines();
  enhanceCapsules();
});*/

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
  
  // Update the orbit section title
  document.getElementById("system-title-orbit").textContent = system.title;
  
  // Keep existing system info for compatibility
  document.getElementById("system-title").textContent = system.title;
  document.getElementById("system-description").textContent = system.fullDesc;
  
  // Hide all system containers first
  ["system1", "system2", "system3"].forEach(id => {
    document.getElementById(id).style.display = "none";
  });

  // Show the correct system container
  const systemMap = {
    kepler: "system1",
    toi: "system2", 
    gj: "system3"
  };
  const containerId = systemMap[systemKey];
  if (containerId) {
    document.getElementById(containerId).style.display = "block";
  }

  // Clear previous orbit container and cleanup
  cleanupEnhancedSystem();
  orbitContainer.innerHTML = "";
  
  // Create new container for enhanced system
  const container = document.createElement("div");
  container.id = `container-${system.id}`;
  orbitContainer.appendChild(container);
  
  // Initialize enhanced system with planet selection
  //initializeEnhancedSystem(`container-${containerId.replace("system", "")}`, system.hostname);
  initializeEnhancedSystem(`container-${system.id}`, system.hostname);
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
      
      //  HIDE ENTIRE CAPSULE SECTION
      const section = document.getElementById("section-systems");
      if (section) section.style.display = "none";

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
   
      // ADD THIS LINE:
       cleanupEnhancedSystem();

    // Hide all system containers
    ["system1", "system2", "system3"].forEach(id => {
      document.getElementById(id).style.display = "none";
    });

    const section = document.getElementById("section-systems");
    if (section) section.style.display = "block";
    
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
// Jacquelyn's Code: SOLAR TIMELINE
// ==================================================

// Load exoplanet data 
//ExoplanetData.onDataLoaded((data) => {
  // use data
//});

// Current spacing value per planet
const verticalSpacing = 200;

// Load planet and respective pictures
const planets = [
  { name: "Mercury", discovered: "Prehistoric", color: "#b1b1b1", radius: 45, imageUrl: "images/mercury.png" },
  { name: "Venus", discovered: "Prehistoric", color: "#f5deb3", radius: 50, imageUrl: "images/venus.jpeg" },
  { name: "Earth", discovered: "Prehistoric", color: "#2e8b57", radius: 55, imageUrl: "images/earth.png" },
  { name: "Mars", discovered: "Prehistoric", color: "#b22222", radius: 55, imageUrl: "images/mars.png" },
  { name: "Jupiter", discovered: "Prehistoric", color: "#d2b48c", radius: 80, imageUrl: "images/jupiter.png" },
  { name: "Saturn", discovered: "Prehistoric", color: "#deb887", radius: 80, imageUrl: "images/saturn.jpg" },
  { name: "Uranus", discovered: "1781", color: "#afeeee", radius: 60, imageUrl: "images/uranus.jpg" },
  { name: "Neptune", discovered: "1846", color: "#4169e1", radius: 60, imageUrl: "images/neptune.jpg" }
];

// SVG Container
const svg = d3.select("#timeline")
  .append("svg")
  .attr("width", "100%")
  .attr("height", planets.length * verticalSpacing)

// Create a group for each planet
const g = svg.selectAll("g")
  .data(planets)
  .enter()
  .append("g")
  .attr("transform", (d, i) => `translate(200, ${i * verticalSpacing + (verticalSpacing / 2)})`);

// Append image for each planet
g.append("image")
  .attr("xlink:href", d => d.imageUrl)
  .attr("width", d => d.radius * 2)
  .attr("height", d => d.radius * 2)
  .attr("x", d => -d.radius)
  .attr("y", d => -d.radius);

// Subtle circle/glow behind the image for effect
g.append("circle")
  .attr("r", d => d.radius + 5)
  .attr("fill", "none")
  .attr("stroke", d => d.color)
  .attr("stroke-width", 2)
  .style("filter", "url(#glow)")
  .lower();

// Subtle glow filter to SVG
svg.append("defs")
  .append("filter")
  .attr("id", "glow")
  .append("feGaussianBlur")
  .attr("stdDeviation", 3)
  .attr("result", "coloredBlur")
  .select(function() { return this.parentNode; })
  .append("feMerge")
  .append("feMergeNode")
  .attr("in", "coloredBlur")
  .select(function() { return this.parentNode; })
  .append("feMergeNode")
  .attr("in", "SourceGraphic");

// Adding labels
g.append("text")
  .text(d => `${d.name} — Discovered: ${d.discovered}`)
  .attr("x", d => d.radius + 20)
  .attr("y", 5)
  .attr("fill", "#fff")
  .attr("font-size", "18px");

// ==================================================
// Jacquelyn's Code: SOLAR TIMELINE END
// ==================================================

// ==================================================
// Jacquelyn's Code: EXOPLANETS DISCOVERIES
// ==================================================

// Function to create the Plotly map
function createExoplanetMap() {
  const containerElement = d3.select("#exoplanet-map-container").node();
  if (!containerElement) {
      console.error("Error: #exoplanet-map-container not found in the DOM.");
      return;
  }

  const containerWidth = containerElement.getBoundingClientRect().width;
  const containerHeight = containerElement.getBoundingClientRect().height;


  const mapMargin = { top: 40, right: 100, bottom: 60, left: 80 };
  const mapWidth = containerWidth - mapMargin.left - mapMargin.right;
  const mapHeight = containerHeight - mapMargin.top - mapMargin.bottom;

  const mapSvg = d3.select("#exoplanet-map-container")
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${mapMargin.left}, ${mapMargin.top})`);

  // Create a group for the main chart content
  const mapChartGroup = mapSvg.append("g");

  // Load the data for the map
  d3.json("earth_like.json").then(data => {
      // --- Debugging step: Log data to console ---
      console.log("Exoplanet map data loaded:", data);
      if (!data || !Array.isArray(data) || data.length === 0) {
          console.warn("Exoplanet map data is empty, not an array, or not loaded correctly. No map will be rendered.");
          return; // Stop execution if data is empty or not an array
      }
      // --- End Debugging step ---

      // Scales
      const xScale = d3.scaleLinear()
          .domain([360, 0])
          .range([0, mapWidth]);

      const yScale = d3.scaleLinear()
          .domain([-90, 90])
          .range([mapHeight, 0]);

      // Size scale
      const sizeScale = d3.scaleSqrt()
          .domain([0, d3.max(data, d => d.temp_diff)])
          .range([20, 5]);

      // Color scale
      const colorScale = d3.scaleSequential(d3.interpolateCool)
          .domain(d3.extent(data, d => d.pl_eqt));

      // Axes
      const xAxis = d3.axisBottom(xScale)
          .tickValues(d3.range(0, 361, 30))
          .tickFormat(d => `${d}°`);
      const yAxis = d3.axisLeft(yScale)
          .tickValues(d3.range(-90, 91, 30))
          .tickFormat(d => `${d}°`);

      mapChartGroup.append("g")
          .attr("class", "x axis")
          .attr("transform", `translate(0, ${mapHeight})`)
          .call(xAxis)
          .append("text")
          .attr("fill", "#fff")
          .attr("x", mapWidth / 2)
          .attr("y", 35)
          .attr("text-anchor", "middle")
          .text("Right Ascension (°)");

      mapChartGroup.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
          .attr("fill", "#fff")
          .attr("transform", "rotate(-90)")
          .attr("y", -60)
          .attr("x", -mapHeight / 2)
          .attr("text-anchor", "middle")
          .text("Declination (°)");

      // Gridlines
      mapChartGroup.append("g")
          .attr("class", "grid")
          .attr("transform", `translate(0, ${mapHeight})`)
          .call(xAxis.tickSize(-mapHeight).tickFormat(""));

      mapChartGroup.append("g")
          .attr("class", "grid")
          .call(yAxis.tickSize(-mapWidth).tickFormat(""));

      // Scatter Plot Points
      mapChartGroup.selectAll(".exoplanet-point")
          .data(data)
          .enter()
          .append("circle")
          .attr("class", "exoplanet-point")
          .attr("cx", d => xScale(d.ra))
          .attr("cy", d => yScale(d.dec))
          .attr("r", d => sizeScale(d.temp_diff))
          .attr("fill", d => colorScale(d.pl_eqt))
          .attr("opacity", 0.8)
          .attr("stroke", "white")
          .attr("stroke-width", 0.4);

      // Highlight Top 5 and Add Annotations
      mapChartGroup.selectAll(".top5-highlight")
          .data(data.filter(d => d.is_top5))
          .enter()
          .append("circle")
          .attr("class", "top5-highlight")
          .attr("cx", d => xScale(d.ra))
          .attr("cy", d => yScale(d.dec))
          .attr("r", d => sizeScale(d.temp_diff) + 2)
          .attr("class", "highlight-border");

      mapChartGroup.selectAll(".top5-label")
          .data(data.filter(d => d.is_top5))
          .enter()
          .append("text")
          .attr("class", "exoplanet-label")
          .attr("x", d => xScale(d.ra) + sizeScale(d.temp_diff) + 5)
          .attr("y", d => yScale(d.dec) + 3)
          .text(d => d.pl_name);

      // COLOR BAR (D3.js implementation)
      const colorbarWidth = 20;
      const colorbarHeight = mapHeight;

      const mapDefs = mapSvg.append("defs");

      const linearGradient = mapDefs.append("linearGradient")
          .attr("id", "colorbarGradientMap")
          .attr("x1", "0%")
          .attr("y1", "100%")
          .attr("x2", "0%")
          .attr("y2", "0%");

      linearGradient.selectAll("stop")
          .data(colorScale.ticks(5).map(t => ({
              offset: (t - colorScale.domain()[0]) / (colorScale.domain()[1] - colorScale.domain()[0]),
              color: colorScale(t)
          })))
          .enter().append("stop")
          .attr("offset", d => d.offset)
          .attr("stop-color", d => d.color);


      const colorbarScale = d3.scaleLinear()
          .domain(colorScale.domain())
          .range([colorbarHeight, 0]);

      const colorbarAxis = d3.axisRight(colorbarScale)
          .ticks(5)
          .tickFormat(d3.format(".0f"));

      const colorbar = mapSvg.append("g")
          .attr("transform", `translate(${mapWidth + mapMargin.left + 20}, ${mapMargin.top})`);

      colorbar.append("rect")
          .attr("width", colorbarWidth)
          .attr("height", colorbarHeight)
          .attr("fill", "url(#colorbarGradientMap)");

      colorbar.append("g")
          .attr("class", "colorbar-axis")
          .attr("transform", `translate(${colorbarWidth}, 0)`)
          .call(colorbarAxis);

      colorbar.append("text")
          .attr("class", "colorbar-label")
          .attr("transform", "rotate(-90)")
          .attr("y", -mapMargin.left + 5)
          .attr("x", -(colorbarHeight / 2))
          .attr("text-anchor", "middle")
          .text("Equilibrium Temperature (K)");

  }).catch(error => {
      console.error("Error loading or parsing exoplanet map data:", error);
  });
}

document.addEventListener('DOMContentLoaded', createExoplanetMap);

// ==================================================
// Jacquelyn's Code: EXOPLANETS DISCOVERIES END
// ==================================================

// ===========================
// Nghi's Code 
// ===========================

//function initNghiSection() {
  //console.log(" Nghi section initialized");
  //let validSystemToDraw = Array.from(d3.group(
ExoplanetData.onDataLoaded((data) => {
  let validSystemToDraw = Array.from(d3.group(
    data,
    d => d.system_id
  )).filter(([_, planets]) => {
    return planets.every(planet =>
          planet.pl_eqt !== '' && // planet temperature
          planet.pl_orbper !== '' && // planet orbital period
          planet.pl_rade !== '' && // planet radius in earth            (planet.pl_bmasse !== '' || planet.pl_dens !== '') && // planet mass in earth
          planet.st_rad !== '' && // star radius
          planet.pl_orbsmax !== '' && // planet distance from star in au
          (planet.st_spectype !== '' || planet.st_teff !== '') // star color
    );
  });

  validSystemToDraw = validSystemToDraw.map(([systemId, planets]) => ({
      systemId,
      starRadius: planets[0].st_rad, // assuming all same star
      starType: planets[0].st_spectype,
      starTemp: planets[0].st_teff,
      planets: planets.sort((a, b) => a.pl_orbsmax - b.pl_orbsmax).map(p => ({
          name: p.pl_name,
          temp: p.pl_eqt,
          radius: p.pl_rade,
          mass: p.pl_bmasse,
          orbitDays: p.pl_orbper,
          eccentricity: p.pl_orbeccen,
          distanceAU: p.pl_orbsmax,
          density: p.pl_dens,
          inclination: p.pl_orbincl
      }))
  })).sort((a, b) => a.systemId.localeCompare(b.systemId));

  const dropdownSolar = document.getElementById('solarDropdown');
  const searchBar = document.querySelector('.searchSolar');
  function createDropdown(filters = '', currentValue = ''){
    dropdownSolar.innerHTML = '';

    validSystemToDraw.forEach(system => {
      if (system.systemId.toLowerCase().startsWith(filters)){
        const option = document.createElement("option");
        option.value = system.systemId;
        option.textContent = system.systemId;
        dropdownSolar.appendChild(option);
      }
      if ((currentValue !== '') & (system.systemId === currentValue)){
        dropdownSolar.value = currentValue;
      }
    });
  }

  createDropdown();
  let currentValue = dropdownSolar.value;
  // First letter in st_spectype
  const starColorMap = {'O':'rgb(86, 104, 203)', 'B':'rgb(129, 163, 252)', 'A':'rgb(151, 177, 236)', 'F':'rgb(255, 244, 243)', 'G':'rgb(255, 229, 207)', 'K':'rgb(255, 199, 142)', 'M':'rgb(255, 166, 81)'}
  // Planet color from planet density
  const customPlanetColor = d3.scaleLinear()
                              .domain([0, 1.5, 2.5, 3.5, 5, 15000]) 
                              .range(["tan", "lightblue", "#90D5FF", "lightblue", "tan", "tan"])
                              .interpolate(d3.interpolateRgb);
  // The number of segment the spheres should be cut into
  const longLatCut = 32;

  // All of the parameters below should have the same length matching number of canvas on the webpage
  const container = document.getElementById('lastCanvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientWidth, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({alpha: true});
  renderer.setSize(container.clientWidth, container.clientWidth);
  container.appendChild(renderer.domElement);

  const control = new OrbitControls(camera, renderer.domElement);
  control.enableDamping = true;
  let starsSystem = new THREE.Mesh(
      new THREE.SphereGeometry(0, longLatCut, longLatCut),
      new THREE.MeshBasicMaterial({color: 'yellow'})
  );
  let planetsSystem = [];
  let planetOrbitRing = [];

  function drawThreeDimension(speed = 1){
      function updateSystemDrawing(starRadius, starFeature, planetsRadius, planetsFeature, planetDistance, planetIncline, planetEcc){
          scene.remove(starsSystem);
          if (starsSystem.geometry){
              starsSystem.geometry.dispose();
          }
          if (starsSystem.material){
              starsSystem.material.dispose();
          }
          for (let planet_i = 0; planet_i < planetsSystem.length; planet_i++){
              scene.remove(planetsSystem[planet_i]);
              if (planetsSystem[planet_i].geometry){
                  planetsSystem[planet_i].geometry.dispose();
              }
              if (planetsSystem[planet_i].material){
                  planetsSystem[planet_i].material.dispose();
              }
              scene.remove(planetOrbitRing[planet_i]);
              if (planetOrbitRing[planet_i].geometry){
                  planetOrbitRing[planet_i].geometry.dispose();
              }
              if (planetOrbitRing[planet_i].material){
                  planetOrbitRing[planet_i].material.dispose();
              }
          }
          planetsSystem.length = 0;
          planetOrbitRing.length = 0;

          starsSystem = new THREE.Mesh(
              new THREE.SphereGeometry(starRadius, longLatCut, longLatCut),
              new THREE.MeshBasicMaterial(starFeature)
          );
          scene.add(starsSystem);

          for (let i = 0; i < planetsRadius.length; i++){
              planetsSystem.push(new THREE.Mesh(
                  new THREE.SphereGeometry(planetsRadius[i], longLatCut, longLatCut),
                  new THREE.MeshBasicMaterial(planetsFeature[i])
              ));
              scene.add(planetsSystem.at(-1));

              planetOrbitRing.push(createEllipticalOrbit(planetDistance[i], planetEcc[i], planetIncline[i]));
              scene.add(planetOrbitRing.at(-1));
          }

          camera.position.z = planetDistance.at(-1) + (planetsRadius.at(-1) * 10);
      }

      function createEllipticalOrbit(radius, ecc, incline, segments = 256) {
        const geometry = new THREE.BufferGeometry();
        const points = [];
        const b = radius * Math.sqrt(1 - ecc * ecc); // semi-minor axis

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * 2 * Math.PI;
            const x = radius * Math.cos(theta) - radius * ecc;  // center ellipse at focus
            const y = b * Math.sin(theta);
            const z = y * Math.sin(incline);
            const yInclined = y * Math.cos(incline);
            points.push(new THREE.Vector3(x, yInclined, z));
        }

        geometry.setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        return new THREE.LineLoop(geometry, material);
      }

      function createAnimator(orbitalPeriod, planetDistance, planetIncline, planetEcc, speedUpTimes = 1){
          function animate(time) {
              requestAnimationFrame(animate);
              control.update();
              const t = time / (1000) * speedUpTimes; // time in days * speed, 1 sec = 1 day
              for (let i = 0; i < planetsSystem.length; i++){
                let a = planetDistance[i]; 
                let e = planetEcc[i];
                let iRad = planetIncline[i];

                let M = 2 * Math.PI * ((t % orbitalPeriod[i]) / orbitalPeriod[i]);
                let E = M;
                for (let j = 0; j < 5; j++) {
                    E = M + e * Math.sin(E);
                }

                let x_orb = a * (Math.cos(E) - e);
                let y_orb = a * Math.sqrt(1 - e * e) * Math.sin(E);

                let x = x_orb;
                let y = y_orb * Math.cos(iRad);
                let z = y_orb * Math.sin(iRad);

                planetsSystem[i].position.set(x, y, z);
              }
              renderer.render(scene, camera);
          }
          animate();
      }

      function calculateParameters(){
          currentValue = dropdownSolar.value;
          const system = validSystemToDraw.find(system => system.systemId === currentValue);
          const planets = system.planets;
          let starColor = null;
          if (system.systType !== null){
              starColor = starColorMap[system.starType[0]];
          }
          else {
              if (system.starTemp > 30000 + 273.15){
                  starColor = starColorMap['O']
              }
              else if (system.starTemp > 9700 + 273.15){
                  starColor = starColorMap['B']
              }
              else if (system.starTemp > 7200 + 273.15){
                  starColor = starColorMap['A']
              }
              else if (system.starTemp > 5700 + 273.15){
                  starColor = starColorMap['F']
              }
              else if (system.starTemp > 4900 + 273.15){
                  starColor = starColorMap['G']
              }
              else if (system.starTemp > 3400 + 273.15){
                  starColor = starColorMap['K']
              }
              else {
                  starColor = starColorMap['M']
              }
          }
          starColor = new THREE.Color(starColor);
          let starRadius = (Math.log10(+system.starRadius * 109 * 6378))  // In earth radius
          let starTexture = new THREE.TextureLoader().load('basic_texture/sun.jpg');
          let starMaterial = {map: starTexture, color: starColor};

          let planetRadius = [];
          let planetMaterial = [];
          let planetOrbit = [];
          let planetDistance = [];
          let planetIncline = [];
          let planetEcc = [];
          planets.forEach(p => {
              let pColor = starColor.clone().multiply(rockyOrGas(+p.mass, +p.radius, p.density)[1]);
              let pTexture = new THREE.TextureLoader().load(rockyOrGas(+p.mass, +p.radius, p.density)[0]);
              planetMaterial.push({map: pTexture, color: pColor});
              planetRadius.push(Math.log10(+p.radius * 6378));
              planetOrbit.push(+p.orbitDays);
              if (planetDistance.length === 0)
                  planetDistance.push(Math.log(+p.distanceAU * 149680000));
              else
                  planetDistance.push(planetDistance.at(-1) + Math.log(+p.distanceAU * 149680000));
              
              if (p.inclination === '')
                  planetIncline.push(0);
              else 
                  planetIncline.push(+p.inclination);
              
              if (p.eccentricity === '')
                  planetEcc.push(0);
              else 
                  planetEcc.push(+p.eccentricity);
          });

          return [starRadius, starMaterial, planetRadius, planetMaterial, planetOrbit, planetDistance, planetIncline, planetEcc];
      }

      function rockyOrGas(massEarth, radiusEarth, density){
          if (density === '')
            density = (massEarth / (radiusEarth ** 3)) * 5.51;
          else
            density = +density;

          if (density >= 3.5){
            return [`basic_texture/rocky_${(Math.floor(density) % 7) + 1}.jpg`, new THREE.Color(customPlanetColor(density))];
          }
          else if (density >= 1.5){
            return [`basic_texture/gas_${(Math.floor(density) % 4) + 1}.jpg`, new THREE.Color(customPlanetColor(density))];
          }
          else {
            return [`basic_texture/gas_${(Math.floor(density) % 4) + 1}.jpg`, new THREE.Color(customPlanetColor(density))];
          }
      }

      let canvasSystem = calculateParameters();
      updateSystemDrawing(canvasSystem[0], canvasSystem[1], canvasSystem[2], canvasSystem[3], canvasSystem[5], canvasSystem[6], canvasSystem[7]);
      createAnimator(canvasSystem[4], canvasSystem[5], canvasSystem[6], canvasSystem[7], speed);
  }

  drawThreeDimension();

  // SET WIDTH OF CANVAS
  container.style.height = `${container.clientWidth}px`;
  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientWidth;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    container.style.height = `${container.clientWidth}px`;
  });

  dropdownSolar.addEventListener('change', (event) => {
    drawThreeDimension();
  });

  searchBar.addEventListener('input', (event) => {
    createDropdown(event.target.value.toLowerCase(), currentValue.toLowerCase());
  });

  searchBar.addEventListener('change', (event) => {
    drawThreeDimension();
  });
});
//}
// ===========================
// Nghi's Code 
// ===========================

// ===========================
// Royce's Code 
// ===========================

// Load exoplanet data 
const numericCols = [
  { key: "pl_rade",   label: "Radius [R⊕]"           },
  { key: "pl_bmasse", label: "Mass [M⊕]"             },
  { key: "pl_insol",  label: "Insolation [S⊕]"       },
  { key: "pl_eqt",    label: "Equilibrium Temp [K]"  },
  { key: "pl_orbeccen", label: "Eccentricity"        },
  { key: "st_teff",   label: "Stellar T_eff [K]"     },
];

numericCols.forEach(c => {
  d3.select("#xMetric").append("option")
    .attr("value", c.key).text(c.label);
  d3.select("#yMetric").append("option")
    .attr("value", c.key).text(c.label);
});
d3.select("#xMetric").property("value", "pl_rade");
d3.select("#yMetric").property("value", "pl_insol");


ExoplanetData.onDataLoaded((raw) => {
  // Inject Earth
  raw = raw.concat([{
    pl_name: "Earth", hostname: "Sun", habitable: true,
    pl_rade: 1, pl_bmasse: 1, pl_insol: 1,
    pl_eqt: 255, pl_orbeccen: 0.0167, st_teff: 5772
  }]);

  // ------------- build the scatter SVG once ----------------
  const svg    = d3.select("#scatter");
  const margin = { top: 20, right: 18, bottom: 46, left: 60 };
  const width  = +svg.attr("width")  - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top  - margin.bottom;
  const g      = svg.append("g").attr("transform",
                                      `translate(${margin.left},${margin.top})`);

  g.append("g").attr("class","x-axis")
    .attr("transform",`translate(0,${height})`);
  g.append("g").attr("class","y-axis");
  g.append("text").attr("class","x-label")
    .attr("x",width/2).attr("y",height+36).attr("text-anchor","middle");
  g.append("text").attr("class","y-label")
    .attr("x",-height/2).attr("y",-44)
    .attr("transform","rotate(-90)").attr("text-anchor","middle");

  const circles = g.selectAll("circle")
      .data(raw).enter().append("circle")
      .attr("r", d => d.pl_name==="Earth" ? 6 : 4)
      .attr("stroke-width", d => d.pl_name==="Earth" ? 1.4 : 0.6)
      .attr("stroke", d => d.pl_name==="Earth" ? "#000" : "#ccc")
      .attr("opacity", 0.9);

  // ------------- update function ---------------------------
  function updatePlot() {
    const xKey = d3.select("#xMetric").property("value");
    const yKey = d3.select("#yMetric").property("value");

    const x = d3.scaleLinear()
      .domain(d3.extent(raw, d => +d[xKey])).nice()
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(d3.extent(raw, d => +d[yKey])).nice()
      .range([height, 0]);

    const ex = (xKey === "pl_eqt") ? 255 : 1;   // Earth reference
    const ey = (yKey === "pl_eqt") ? 255 : 1;

    circles
      .attr("cx", d => x(+d[xKey]))
      .attr("cy", d => y(+d[yKey]))
      .attr("fill", d => {
        if (d.pl_name === "Earth") return "#ff7f0e";
        const near = Math.abs(+d[xKey]-ex)/ex < 0.10 &&
                     Math.abs(+d[yKey]-ey)/ey < 0.10;
        return near ? "#0ea5e9" : "#cbd5e1";
      });

    g.select(".x-axis").call(d3.axisBottom(x));
    g.select(".y-axis").call(d3.axisLeft(y));
    g.select(".x-label").text(numericCols.find(c=>c.key===xKey).label);
    g.select(".y-label").text(numericCols.find(c=>c.key===yKey).label);
  }

  updatePlot();                              // first draw
  d3.select("#xMetric").on("change", updatePlot);
  d3.select("#yMetric").on("change", updatePlot);
});

// ===========================
// Royce's Code 
// ===========================

// ================================
// Global code
// ================================
// Scroll-Based Progress Bar
// Initialize everything when DOM is ready
function initializeApp() {
  // Load exoplanet data first (this is now global)
  loadExoplanetData();
  // Initialize enhanced progress bar
  initEnhancedProgressBar();
  
  // Add resize listener to recalculate progress
  window.addEventListener('resize', () => {
    setTimeout(() => {
      const event = new Event('scroll');
      window.dispatchEvent(event);
    }, 100);
  });
  
  // Add section intersection observer for better performance
  initSectionObserver();
  console.log('Exoplanet Explorer App Initialized');
}

// Enhanced section observer for better scroll performance
function initSectionObserver() {
  const observerOptions = {
    threshold: [0.1, 0.25, 0.5, 0.75],
    rootMargin: '-120px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const section = entry.target;
      const sectionId = section.id;
      
      // Add fade-in animation for sections
      if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
        section.classList.add('section-visible');
        
        // Trigger any section-specific animations
        if (sectionId === 'section-systems') {
          animateSystemCapsules();
        }
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.scroll-section').forEach(section => {
    observer.observe(section);
  }); 
}

// Animate system capsules when they come into view
function animateSystemCapsules() {
  const capsules = document.querySelectorAll('.capsule');
  capsules.forEach((capsule, index) => {
    setTimeout(() => {
      capsule.style.transform = 'translateY(0) scale(1)';
      capsule.style.opacity = '1';
    }, index * 200);
  });
}
// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
