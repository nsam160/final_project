import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initializeExtremePlanets, extremeSystemData, renderExtremeOverview, renderExtremeInteractive, cleanupExtremeSystem } from './camilleExtreme.js';
import { renderSystem, initializeEnhancedSystem, cleanupEnhancedSystem, setupKeyboardNavigation } from './camilleOrbit.js';


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
  initializeExtremePlanets(); // Add this line
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
    
    // Execute all callbacks waiting for data
    dataLoadedCallbacks.forEach(callback => callback(allExoplanets));
    dataLoadedCallbacks = []; // Clear callbacks after execution
    
    // Initialize individual sections that depend on data
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
// COMMENT OUT OR REMOVE this problematic import line:
//import { renderSystem, initializeEnhancedSystem, cleanupEnhancedSystem, setupKeyboardNavigation } from './camilleOrbit.js';

const visitedSystems = new Set();
// let allExoplanets = [];
let showingConnections = false;

// Use safe element selection to avoid null reference errors
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
  
  // Initialize stage navigation functionality
  setupStageNavigation();
  
  // Now we can call this since we imported it
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
  
  // Store current active system for stage navigation
  window.currentActiveSystem = system;
  console.log('Set current active system to:', system.hostname);
  
  // Add null checks for DOM elements
  const systemTitleElement = document.getElementById("system-title-orbit");
  if (systemTitleElement) {
    systemTitleElement.textContent = system.title;
  }
  
  const systemTitleLegacy = document.getElementById("system-title");
  if (systemTitleLegacy) {
    systemTitleLegacy.textContent = system.title;
  }
  
  const systemDescElement = document.getElementById("system-description");
  if (systemDescElement) {
    systemDescElement.textContent = system.fullDesc;
  }
  
  // Hide all system containers first
  ["system1", "system2", "system3"].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = "none";
    }
  });

  // Show the correct system container
  const systemMap = {
    kepler: "system1",
    toi: "system2", 
    gj: "system3"
  };
  const containerId = systemMap[systemKey];
  if (containerId) {
    const element = document.getElementById(containerId);
    if (element) {
      element.style.display = "block";
    }
  }

  // Clear previous orbit container and cleanup
  cleanupEnhancedSystem();
  if (orbitContainer) {
    orbitContainer.innerHTML = "";
    
    // Create new container for enhanced system
    const container = document.createElement("div");
    container.id = `container-${system.id}`;
    container.style.width = "100%";
    container.style.height = "500px";
    orbitContainer.appendChild(container);
    
    // Initialize the enhanced system with proper timing (default to stage 1)
    setTimeout(() => {
      initializeEnhancedSystem(`container-${system.id}`, system.hostname, 1);
      
      // Ensure stage 1 is active by default
      switchToStage(1);
    }, 100);
  }
}

// Capsule click + back
function enhanceCapsules() {
  document.querySelectorAll(".capsule").forEach(el => {
    const id = el.dataset.system;
    if (id) { // Only proceed if system ID exists
      const marker = document.createElement("div");
      marker.className = "visited-marker";
      marker.textContent = "Visited";
      el.appendChild(marker);

      el.addEventListener("click", () => {
        el.classList.add("visited");
        visitedSystems.add(id);
        if (overview) overview.style.opacity = 0;
        
        //  HIDE ENTIRE CAPSULE SECTION
        const section = document.getElementById("section-systems");
        if (section) section.style.display = "none";

        setTimeout(() => {
          if (overview) overview.style.display = "none";
          showDetailedSystem(id);
          if (detailedView) {
            detailedView.style.display = "block";
            detailedView.style.opacity = 1;
          }
        }, 400);
        checkStoryProgression();
      });
    }
  });

  const backButton = document.getElementById("back-button");
  if (backButton) {
    backButton.addEventListener("click", () => {
      if (detailedView) detailedView.style.opacity = 0;
      setTimeout(() => {
        if (detailedView) detailedView.style.display = "none";
        if (orbitContainer) orbitContainer.innerHTML = "";
     
        // Comment out function from missing file:
        // cleanupEnhancedSystem();

        // Hide all system containers
        ["system1", "system2", "system3"].forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            element.style.display = "none";
          }
        });

        const section = document.getElementById("section-systems");
        if (section) section.style.display = "block";
        
        if (overview) {
          overview.style.display = "flex";
          overview.style.opacity = 1;
        }
      }, 400);
    });
  }
}

// Connections
function setupConnectionLines() {
  if (document.getElementById("capsule-connections") || !overview) return;
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
      setTimeout(() => {
        if (synthesis) synthesis.style.display = "block";
      }, 2000);
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

const planets = [
  { name: "Mercury", discovered: "Prehistoric", color: "#b1b1b1", radius: 20, imageUrl: "../images/mercury.png" },
  { name: "Venus", discovered: "Prehistoric", color: "#f5deb3", radius: 28, imageUrl: "../images/venus.png" },
  { name: "Earth", discovered: "Prehistoric", color: "#2e8b57", radius: 29, imageUrl: "../images/earth.png" },
  { name: "Mars", discovered: "Prehistoric", color: "#b22222", radius: 23, imageUrl: "../images/mars.png" },
  { name: "Jupiter", discovered: "Prehistoric", color: "#d2b48c", radius: 55, imageUrl: "../images/jupiter.png" },
  { name: "Saturn", discovered: "Prehistoric", color: "#deb887", radius: 50, imageUrl: "../images/saturn.png" },
  { name: "Uranus", discovered: "1781", color: "#afeeee", radius: 35, imageUrl: "../images/uranus.png" },
  { name: "Neptune", discovered: "1846", color: "#4169e1", radius: 35, imageUrl: "../images/neptune.png" }
];

const svgHeight = 150;
const padding = 30;
let currentX = 100;
const positions = planets.map((planet, i) => {
  if (i === 0) return currentX;
  currentX += planets[i - 1].radius + planet.radius + padding;
  return currentX;
});

const timelineY = svgHeight / 2;

const svgWidth = positions[positions.length - 1] + 100;

const svg = d3.select("#timeline")
  .append("svg")
  .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
  .style('overflow', 'visible');

// Horizontal line
svg.append("line")
  .attr("x1", 50)
  .attr("y1", svgHeight / 2)
  .attr("x2", svgWidth - 50)
  .attr("y2", svgHeight / 2)
  .attr("stroke", "#ccc")
  .attr("stroke-width", 2);

const g = svg.selectAll("g")
  .data(planets)
  .enter()
  .append("g")
  .attr("transform", (d, i) => `translate(${positions[i]}, ${svgHeight / 2})`);

// Appending the planet images
g.append("image")
  .attr("xlink:href", d => d.imageUrl)
  .attr("width", d => d.radius * 2)
  .attr("height", d => d.radius * 2)
  .attr("x", d => -d.radius)
  .attr("y", d => -d.radius)
  .style("cursor", "pointer");


// Tooltip
const tooltip = d3.select("#tooltip");

g.on("mouseover", (event, d) => {
    tooltip.style("opacity", 1)
      .style("text-align", 'center')
      .html(`<strong>${d.name}</strong>Discovered:<br>${d.discovered}`);

    const text = document.querySelector('#timeline-text');

    if (d.name === 'Mercury' || d.name === 'Venus'){
      text.innerHTML = `
                        <p><strong>Let's start off with the planets we know and their history.</strong></p>
                        <p>Since Earth, Mercury, Mars, Venus, Jupiter, and Saturn were all visible to the human eye, we have always known since the beginning of time that they exist, even when we did not understand the concept of planets. None of these planets have a specific discovery date, but the first recorded observation of them was made around 1000 BCE by the ancient Babylonians.</p>
                       `;
    }
    else if (d.name === 'Earth' || d.name === 'Mars'){
      text.innerHTML = `
                        <p>Though records were made, it was not until Ancient Greece that civilization began to wonder what stars and planets were. Originally, we thought all planets and the sun itself revolved around Earth, but some Greeks made doubtful claims that it was the sun that was at the center and Earth along with the rest of the planets revolved around the sun. This claim was not accepted until the Renaissance period.</p>
                       `;
    }
    else if (d.name === 'Jupiter' || d.name === 'Saturn'){
      text.innerHTML = `
                        <p>We have already been able to discover so much with our eyes alone, with the addition of the telescope later invented in the 1600s, imagine the new possibilities astronomers have now with new discoveries. Galileo Galilei in 1610 discovered that Jupiter is orbited by four moons, which is proof of the heliocentric models, but this discovery was rejected initially. People thought he was crazy and arrested him, until humanity awakened to the fact we live in a far grander universe than we initially thought.</p>
                       `;
    }
    else if (d.name === 'Uranus'){
      text.innerHTML = `
                        <p>The first planet to be truly discovered after the initial six was Uranus in 1781 by William Herschel. However, when he first discovered it, he thought he discovered a comet, but in 1783, he realized this object was a planet, making it the first planet to be discovered by a telescope. Interestingly though, people in Ancient Greece were able to see Uranus visible with their eyes alone, but they thought of it as a star.</p>
                       `;
    }
    else if (d.name === 'Neptune'){
      text.innerHTML = `
                        <p>The discovery of Uranus ultimately led to the direct discovery of Neptune in 1845. Astronomers noticed the weird deviation of Uranus from its orbit and predicted that there must be a planet that orbits the sun beyond Uranus. Through mathematics, rather than observation, Neptune was discovered by Urbain Le Verrier.</p>
                       `;
    }
})
.on("mousemove", function(event, d) {
    const tooltipX = event.clientX - tooltip.node().offsetWidth / 2;
    const tooltipY = timelineY;

    tooltip
      .style("left", `${tooltipX}px`)
      .style("top", `${tooltipY}px`);
})
.on("mouseout", () => {
    tooltip.style("opacity", 0);
});

// ==================================================
// Jacquelyn's Code: SOLAR TIMELINE END
// ==================================================

// ==================================================
// Nghi's Code: EXOPLANETS DISCOVERIES
// ==================================================

// Function to create the Plotly map
ExoplanetData.onDataLoaded((data) => {
  const width = 500;
  const height = 400;
  const mapMargin = { top: 60, right: 20, bottom: 40, left: 40 };
  const usableArea = {
      top: mapMargin.top,
      right: width - mapMargin.right,
      bottom: height - mapMargin.bottom,
      left: mapMargin.left,
      width: width - mapMargin.left - mapMargin.right,
      height: height - mapMargin.top - mapMargin.bottom
  };

  let validData = data.filter(p => 
    p.ra !== '' &&
    p.dec !== '' &&
    p.disc_facility !== '' && 
    (p.disc_facility === 'Kepler' || p.disc_facility === 'K2' || p.disc_facility === 'Transiting Exoplanet Survey Satellite (TESS)')
  ).sort((a, b) => b.disc_facility.localeCompare(a.disc_facility));

  let mapColor = {
    'TESS': 'gray',
    'Kepler': 'rgb(214, 172, 80)',
    'K2': 'rgb(61, 83, 157)'
  }

  const mapSvg = d3.select(".left-side")
    .append("svg")
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible')

  // Create a group for the main chart content
  const mapChartGroup = mapSvg.append("g");

  // Scales
  const xScale = d3.scaleLinear()
    .domain([0, 360])
    .range([usableArea.left, usableArea.right]);

  const yScale = d3.scaleLinear()
    .domain([-90, 90])
    .range([usableArea.bottom, usableArea.top]);

  const xAxis = d3.axisBottom(xScale)
    .tickValues(d3.range(0, 361, 30))
    .tickFormat(d => `${d}°`);
  const yAxis = d3.axisLeft(yScale)
    .tickValues(d3.range(-90, 91, 30))
    .tickFormat(d => `${d}°`);

  mapChartGroup.append("g")
    .attr("transform", `translate(0, ${usableArea.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("fill", "#fff")
    .attr("x", usableArea.left + usableArea.width / 2)
    .attr("y", 35)
    .attr("text-anchor", "middle")
    .text("Right Ascension (°)");

  mapChartGroup.append("g")
    .attr("transform", `translate(${usableArea.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("fill", "#fff")
    .attr("transform", "rotate(-90)")
    .attr("x", -height/2)
    .attr("y", -27) 
    .attr("text-anchor", "middle")
    .text("Declination (°)");
        
  mapChartGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("x", usableArea.left + usableArea.width / 2)
    .attr("y", usableArea.top / 2)
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("fill", 'white')
    .text("Where NASA Found New Worlds"); // Change title

  // Gridlines
  mapChartGroup.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0, ${usableArea.bottom})`)
    .call(xAxis.tickSize(-usableArea.height).tickFormat(""));

  mapChartGroup.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${usableArea.left},0)`)
    .call(yAxis.tickSize(-usableArea.width).tickFormat(""));

  mapChartGroup.selectAll(".exoplanet-point")
    .data(validData)
    .enter()
    .append("circle")
    .attr("class", "exoplanet-point")
    .attr("cx", d => xScale(d.ra))
    .attr("cy", d => yScale(d.dec))
    .attr("r", 5)
    .attr("fill", d => {
      if (d.disc_facility === 'Kepler'){
        return mapColor['Kepler'];
      }
      else if (d.disc_facility === 'K2'){
        return mapColor['K2'];
      }
      else if (d.disc_facility === 'Transiting Exoplanet Survey Satellite (TESS)'){
        return mapColor['TESS'];
      }
    })
    .attr("opacity", 0.8)
    .attr("stroke", "white")
    .attr("stroke-width", 0.4)
    .on("mouseover", (event, d) => {
      const text = document.querySelector('.right-side');

      if (d.disc_facility === 'Kepler'){
        text.innerHTML = `
                          <p><b>Kepler (2009 - 2013)</b></p>
                          <p>
                            The original Kepler mission only stared at a single 
                            patch of sky, known as the constellation Cygnus, 
                            for 4 straight years. Its strategy was to fixed its stare 
                            at one location to detect tiny light dips over time, so a wide
                            sweep of the sky was not feasible for such precision. This is
                            why most of Kepler's discovered planet are within a small patch around
                            (290°, 45°).
                          </p>
                        `;
      }
      else if (d.disc_facility === 'K2'){
        text.innerHTML = `
                          <p><b>K2 (2014 - 2018)</b></p>
                          <p>
                            This repurposed version of Kepler, after a hardware 
                            failure occured, observed along the ecliptic plane. This
                            is why we see that most of the Exoplanets discovered by
                            K2, is a wave-like sine graph around the declination 
                            degree 0.
                          </p>
                        `;
      }
      else if (d.disc_facility === 'Transiting Exoplanet Survey Satellite (TESS)'){
        text.innerHTML = `
                          <p><b>Transiting Exoplanet Survey Satellite - TESS (2018 - Present)</b></p>
                          <p>
                            TESS scans the entire sky for any new Exoplanets, which 
                            is why we see most of the plot covered in gray dots. 
                            Its goal is to find Exoplanets in bright nearby stars that are
                            easy to follow up with on the ground with a telescope. Like Kepler, it is a 
                            transit method, but what makes it different from the Kepler's
                            mission is that is viewpoint is not restricted. It is constantly
                            rotating each sector in the sky every 27 days and it is
                            ongoing even now.
                          </p>
                        `;
      }
    })
    .on("mouseout", () => {
        const text = document.querySelector('.right-side');
        text.innerHTML = `<p>
                          Three of NASA's biggest Exoplanet's Mission are Kepler, 
                          K2, and TESS. To interpret this graph, each colors 
                          are of a different NASA mission. The 'Right Ascension' 
                          degree is the horizontal location of the Exoplanet in 
                          the sky, while the 'Declination' degree is the vertical 
                          location of the Exoplanet in the sky.
                        </p>`;
    }); 
});

// ==================================================
// Nghi's Code: EXOPLANETS DISCOVERIES END
// ==================================================

// ===========================
// Nghi's Code 
// ===========================

ExoplanetData.onDataLoaded((data) => {
  const top3Overall = document.querySelector('#top3Overall');
  const width = 600;
  const height = 400;
  const margin = { top: 25, right: 57, bottom: 50, left: 50 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const earthData = {
    radiusE: 1,
    massE: 1,
    tempK: 255,
    eccentricityE: 0.0167,
    semiAxisDistAU: 1.0167,
    orbitalDay: 365.26
  };

  let validData = data.filter(p => 
    p.pl_rade !== '' &&
    p.pl_bmasse !== '' &&
    p.pl_eqt !== '' &&
    p.pl_orbeccen !== '' &&
    p.pl_orbsmax !== '' &&
    p.pl_orbper !== ''
  );

  const [minR, maxR] = d3.extent(validData, p => Math.abs(p.pl_rade - earthData.radiusE));
  const [minM, maxM] = d3.extent(validData, p => Math.abs(p.pl_bmasse - earthData.massE));
  const [minT, maxT] = d3.extent(validData, p => Math.abs(p.pl_eqt - earthData.tempK));
  const [minE, maxE] = d3.extent(validData, p => Math.abs(p.pl_orbeccen - earthData.eccentricityE));
  const [minD, maxD] = d3.extent(validData, p => Math.abs(p.pl_orbsmax - earthData.semiAxisDistAU));
  const [minO, maxO] = d3.extent(validData, p => Math.abs(p.pl_orbper - earthData.orbitalDay));

  let mapped = validData.map(p => {
    const rad = (Math.abs(p.pl_rade - earthData.radiusE) - minR) / (maxR - minR);
    const mass = (Math.abs(p.pl_bmasse - earthData.massE) - minM) / (maxM - minM);
    const temp = (Math.abs(p.pl_eqt - earthData.tempK) - minT) / (maxT - minT);
    const ecc = (Math.abs(p.pl_orbeccen - earthData.eccentricityE) - minE) / (maxE - minE);
    const dist = (Math.abs(p.pl_orbsmax - earthData.semiAxisDistAU) - minD) / (maxD - minD);
    const orb = (Math.abs(p.pl_orbper - earthData.orbitalDay) - minO) / (maxO - minO);

    return {
      name: p.pl_name,
      rad_m: Math.sign(p.pl_rade - earthData.radiusE) * rad,
      mass_m: Math.sign(p.pl_bmasse - earthData.massE) * mass,
      temp_m: Math.sign(p.pl_eqt - earthData.tempK) * temp,
      ecc_m: Math.sign(p.pl_orbeccen - earthData.eccentricityE) * ecc,
      dist_m: Math.sign(p.pl_orbsmax - earthData.semiAxisDistAU) * dist,
      orb_m: Math.sign(p.pl_orbper - earthData.orbitalDay) * orb,
      rad_mOri: p.pl_rade,
      mass_mOri: p.pl_bmasse,
      temp_mOri: p.pl_eqt,
      ecc_mOri: p.pl_orbeccen,
      dist_mOri: p.pl_orbsmax,
      orb_mOri: p.pl_orbper,
      avg: (rad + mass + temp + ecc + dist + orb) / 6
    };
  }).sort((a, b) => d3.ascending(a.avg, b.avg));

  const xLabels = {
    rad_m: 'Radius',
    mass_m: 'Mass',
    temp_m: 'Temperature',
    ecc_m: 'Eccentricity',
    dist_m: 'Distance',
    orb_m: 'Orbital Period'
  };
  const yLabels = [];
  const top3OverallData = [];
  mapped.slice(0, 10).forEach(row => {
    yLabels.push(row.name);
    for (let key in xLabels){
      top3OverallData.push({x: xLabels[key], y: row.name, value: row[key], trueValue: row[`${key}Ori`]});
    }
  });

  const svg = d3.select("#top3Overall")
    .append("svg")
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');
  const g = svg.append("g")
    .attr("transform", `translate(${usableArea.left},${usableArea.top})`)

  const xBand = d3.scaleBand()
    .domain(Object.values(xLabels))
    .range([usableArea.left, usableArea.right])
    .padding(0.05);

  const yBand = d3.scaleBand()
    .domain(yLabels)
    .range([usableArea.top, usableArea.bottom])
    .padding(0.05);

  const colorScale = d3.scaleDiverging()
    .domain([-0.03, 0, 0.03])
    .interpolator(d3.interpolateRdBu);

  g.selectAll("rect")
    .data(top3OverallData)
    .enter()
    .append("rect")
    .attr("x", d => xBand(d.x))
    .attr("y", d => yBand(d.y))
    .attr("width", xBand.bandwidth())
    .attr("height", yBand.bandwidth())
    .attr("fill", d => colorScale(d.value))
    .attr("class", "cell");

    // Add text labels
  g.selectAll("text.label")
    .data(top3OverallData)
    .enter()
    .append("text")
    .attr("x", d => xBand(d.x) + xBand.bandwidth() / 2)
    .attr("y", d => yBand(d.y) + yBand.bandwidth() / 2 + 4)
    .attr("text-anchor", "middle")
    .text(d => (+d.trueValue).toFixed(3))
    .attr("fill", "black");

    // Axes
  g.append("g")
    .attr("transform", `translate(0,${usableArea.bottom})`)
    .call(d3.axisBottom(xBand));

  g.append("g")
    .attr("transform", `translate(${usableArea.left},0)`)
    .call(d3.axisLeft(yBand));

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("x", usableArea.left + usableArea.width / 2)
    .attr("y", usableArea.top / 2)
    .style("font-size", "25px")
    .style("font-weight", "bold")
    .style("fill", 'white')
    .text("Top 10 Planets Similar to Earth");
});

ExoplanetData.onDataLoaded((data) => {
  let countPlanet = d3.rollups(
    data,
    (v) => v.length,
    (d) => +d.disc_year
  ).sort((a, b) => a[0] - b[0]);
  
  function renderLinePlot(){
    const width = 500;
    const height = 500;
    const margin = { top: 75, right: 25, bottom: 50, left: 65 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };
    
    let svg = d3
        .select('#increaseExoplanet')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    let xScale = d3
      .scaleLinear()
      .domain(d3.extent(countPlanet, d => d[0]))
      .range([usableArea.left, usableArea.right]);
    let yScale = d3
      .scaleLinear()
      .domain([0, d3.max(countPlanet, d => d[1])])
      .range([usableArea.bottom, usableArea.top]);

    const line = d3.line()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]));

    svg.append("path")
        .datum(countPlanet)
        .attr("fill", "none")
        .attr("stroke", 'rgb(214, 172, 80)')
        .attr("opacity", '0.7')
        .attr("stroke-width", 2)
        .attr("d", line);
    svg.append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xScale);
    svg.append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yScale);
    svg.append("g")
        .attr("class", "Exogrid")
        .attr("transform", `translate(0, ${usableArea.bottom})`)
        .attr("stroke", "rgba(0, 0, 0, 0.1)")
        .attr("stroke-width", 1)
        .call(d3.axisBottom(xScale)
          .tickSize(-(usableArea.bottom - usableArea.top))  // vertical size
          .tickFormat(''));
    svg.append("g")
        .attr("class", "Exogrid")
        .attr("transform", `translate(${usableArea.left}, 0)`)
        .attr("stroke", "rgba(0, 0, 0, 0.1)")
        .attr("stroke-width", 1)
        .call(d3.axisLeft(yScale)
        .tickSize(-(usableArea.right - usableArea.left))  // horizontal size
        .tickFormat(''));
    svg.append("g")
       .attr("transform", `translate(0,${usableArea.bottom})`)
       .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    svg.append("g")
       .attr("transform", `translate(${usableArea.left},0)`)
       .call(d3.axisLeft(yScale));
    const hoverLine = svg.append("line")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("y1", usableArea.top)
        .attr("y2", usableArea.bottom)
        .style("display", "none");
    const tooltip = svg.append("text")
        .attr("fill", "white")
        .style("font-size", "12px")
        .style("display", "none");
    svg.append("rect")
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .attr("x", usableArea.left)
        .attr("y", usableArea.top)
        .attr("width", usableArea.width)
        .attr("height", usableArea.bottom - usableArea.top)
        .on("mousemove", onMouseMove)
        .on("mouseenter", () => {
          hoverLine.style("display", null);
          tooltip.style("display", null);
        })
        .on("mouseleave", () => {
          hoverLine.style("display", "none");
          tooltip.style("display", "none");
        });
    svg.append("text")
       .attr("text-anchor", "middle")
       .attr("x", usableArea.left + usableArea.width / 2)
       .attr("y", height - 13)
       .style("fill", 'white')
       .text("Discovery Year");
    svg.append("text")
       .attr("text-anchor", "middle")
       .attr("transform", `rotate(-90)`)
       .attr("x", -height/2)
       .attr("y", 25) 
       .style("fill", 'white')
       .text("Number of New Exoplanet Discovered");
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", usableArea.left + usableArea.width / 2)
        .attr("y", usableArea.top / 2)
        .style("font-size", "25px")
        .style("font-weight", "bold")
        .style("fill", 'white')
        .text("New Exoplanet Discovered by Year");

    function onMouseMove(event) {
      const [mouseX] = d3.pointer(event);
      const x0 = xScale.invert(mouseX); // get x value
      const bisect = d3.bisector(d => d[0]).left;
      const i = bisect(countPlanet, x0);
      const d = countPlanet[i];

      const x = xScale(d[0]);
      const y = yScale(d[1]); // adjust if you want tooltip closer to line

      hoverLine
        .attr("x1", x)
        .attr("x2", x);

      tooltip
        .attr("x", x + 10)
        .attr("y", y)
        .text(`${d[1]} Found In ${d[0]}`);

      let text = document.querySelector('#increaseExoplanetText')
      if (d[0] >= 2014 && d[0] < 2016){
        text.innerHTML = `<p>
                            In 2013, due to a failure in the reaction wheel of the spacecraft 
                            NASA used in their Kepler mission (2009 - 2013), they repurposed the mission and 
                            launched the K2 mission (2014 - 2018) in 2014. With a better spacecraft that is 
                            more resistance against solar radiation pressure, along with a new 
                            automated planet validation technique called the 'multiplicity 
                            validation' that they created by processing backlog data of planet 
                            candidates, we were able to see the initial surge of 870 newly 
                            discovered planets.
                          </p>`
      }
      else if (d[0] >= 2016 && d[0] < 2018){
        text.innerHTML = `<p>
                            In 2016, a new algorithm called 'Validation of Exoplanet Signals 
                            using a Probabilistic Algorithm (VESPA)' was used by NASA to comfirm
                            a record breaking amount of 1496 Exoplanets in one year. This algorithm
                            is calculates the statistical significant probability that a detected 
                            signal is caused by a true planet rather than a false positive, but it
                            requires complete and clean dataset on Exoplanets, so while this was written
                            before 2016, it was not until 2016 were they able to successfully confirm planets.
                          </p>`
      }
      else if (d[0] >= 2018 && d[0] < 2021){
        text.innerHTML = `<p>
                            Succeeding Kepler, the Transiting Exoplanet Survey Satellite (TESS) was launched for the
                            first time in 2018. It was designed to scan nearly the entire sky for
                            exoplanets around the brightest and nearest stars. Unlike Kelper, which
                            focuses on one small patch, TESS divides the sky into sectors and rotates its gaze 
                            every 27 days, which is how it was able to discover 312 more planets,
                            the ones Kepler missed.
                          </p>`
      }
      else if (d[0] >= 2021){
        text.innerHTML = `<p>
                            Though the peak in 2021 was not as significant as 2016 and 2014, 
                            this peak here came from many missions working in parallel. A combination of 
                            COVID maturity across missions and method, along with the resolved in 
                            confirmation of Exoplanets due to the pandemic in 2019, allowed for 555 new
                            planet discoveries.
                          </p>`
      }
      else {
        text.innerHTML = `<p>
                            After the discovery of Uranus, Pluto was discovered in 1930 as a planet, 
                            but it was later reclassified as a Dwarf planet later on. However, our 
                            solar system of 8 planets is not the only solar system that exists in 
                            the Universe. Learning from history, our universe is always larger than 
                            we might expect it to be. That’s when we discovered the first planet, 
                            that rotates around another star besides the sun in 1992, to which are
                            called ‘exoplanets’.
                          </p>`
      }
    }
  }

  renderLinePlot();
});

ExoplanetData.onDataLoaded((data) => {
  // Load and filter data by missingness according to some column conditions
  let validSystemToDraw = Array.from(d3.group(
    data,
    d => d.hostname
  )).filter(([_, planets]) => {
    return planets.every(planet =>
          planet.pl_orbper !== '' && // planet orbital period
          planet.pl_rade !== '' && // planet radius in earth            
          (planet.pl_bmasse !== '' || planet.pl_dens !== '') && // planet mass in earth
          planet.pl_orbsmax !== '' && // planet distance from star in au
          (planet.st_spectype !== '' || planet.st_teff !== '') // star color
    );
  });

  // map out data to variable names that are necessary for plotting and tooltip info
  validSystemToDraw = validSystemToDraw.map(([star, planets]) => ({
      star,
      starNum: +planets[0].sy_snum,
      planetNum: +planets[0].sy_pnum,
      systemId: planets[0].system_id,
      rightAscension: planets[0].ra,
      decline: planets[0].dec,
      distance: planets[0].sy_dist,
      starRadius: planets[0].st_rad, // assuming all same star
      starType: planets[0].st_spectype,
      starTemp: planets[0].st_teff,
      starAge: planets[0].st_age,
      planets: planets.sort((a, b) => a.pl_orbsmax - b.pl_orbsmax).map(p => ({
          name: p.pl_name,
          host: p.hostname,
          temp: p.pl_eqt,
          radius: p.pl_rade,
          mass: p.pl_bmasse,
          orbitDays: p.pl_orbper,
          eccentricity: p.pl_orbeccen,
          distanceAU: p.pl_orbsmax,
          density: p.pl_dens,
          inclination: p.pl_orbincl,
          year: p.disc_year,
          method: p.discoverymethod, 
          facility: p.disc_facility
      }))
  })).sort((a, b) => a.star.localeCompare(b.star));

  const dropdownSolar = document.getElementById('solarDropdown');
  const searchBar = document.querySelector('#searchSolar');
  const speedSelector = document.querySelector('#speedSelector');
  const icon = document.querySelector('#playPauseIcon');
  const playButton = document.querySelector('#pausePlayButton');
  const tooltip = document.getElementById('nghi-tooltip');
  let isPlaying = true;
  let isClick = false;

  // Create dropdown based on search bar input
  function createDropdown(filters = '', currentValue = ''){
    dropdownSolar.innerHTML = '';

    validSystemToDraw.forEach(system => {
      if (system.star.toLowerCase().startsWith(filters)){
        const option = document.createElement("option");
        option.value = system.star;
        option.textContent = system.star;
        dropdownSolar.appendChild(option);
      }
      if ((currentValue !== '') & (system.star === currentValue)){
        dropdownSolar.value = currentValue;
      }
    });
  }
  createDropdown();

  let currentValue = dropdownSolar.value;
  // First letter in st_spectype
  const starColorMap = {'O':'rgb(86, 104, 203)', 'B':'rgb(129, 163, 252)', 'A':'rgb(151, 177, 236)', 'F':'rgb(255, 244, 243)', 'G':'rgb(255, 229, 207)', 'K':'rgb(255, 199, 142)', 'M':'rgb(255, 166, 81)', 'W': 'rgb(255, 255, 255)'}
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
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const textures = {
    'gas_1': new THREE.TextureLoader().load('../basic_texture/gas_1.jpg'),
    'gas_2': new THREE.TextureLoader().load('../basic_texture/gas_2.jpg'),
    'gas_3': new THREE.TextureLoader().load('../basic_texture/gas_3.jpg'),
    'gas_4': new THREE.TextureLoader().load('../basic_texture/gas_4.jpg'),
    'sun': new THREE.TextureLoader().load('../basic_texture/sun.jpg'),
    'rocky_1': new THREE.TextureLoader().load('../basic_texture/rocky_1.jpg'),
    'rocky_2': new THREE.TextureLoader().load('../basic_texture/rocky_2.jpg'),
    'rocky_3': new THREE.TextureLoader().load('../basic_texture/rocky_3.jpg'),
    'rocky_4': new THREE.TextureLoader().load('../basic_texture/rocky_4.jpg'),
    'rocky_5': new THREE.TextureLoader().load('../basic_texture/rocky_5.jpg'),
    'rocky_6': new THREE.TextureLoader().load('../basic_texture/rocky_6.jpg'),
    'rocky_7': new THREE.TextureLoader().load('../basic_texture/rocky_7.jpg')
  }
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

  window.addEventListener('click', getMousePosition, false);

  function getMousePosition(event) {
    isClick = true;
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  // Draws the solar system based on all the conditions in filtering and searching, automated, just call drawThreeDimension()
  function drawThreeDimension(){
      // Change planets and stars
      function updateSystemDrawing(starRadius, starFeature, planetsRadius, planetsFeature, planetDistance, planetIncline, planetEcc, systemInfo){
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
          starsSystem.userData = {
            type: 'star',
            system_name: systemInfo.systemId,
            star_name: systemInfo.star,
            star_type: systemInfo.starType,
            star_temp: systemInfo.starTemp,
            star_age: systemInfo.starAge,
            star_radius: systemInfo.starRadius,
            total_planets: systemInfo.planetNum,
            total_star: systemInfo.starNum,
            planet_num: planetsRadius.length,
            system_decline: systemInfo.decline,
            system_ascend: systemInfo.rightAscension,
            system_distance: systemInfo.distance,
          };

          if (starsSystem.userData.total_star === 1)
            tooltip.innerHTML = `This planetary system is a singular star system named, <b> ${starsSystem.userData.system_name}</b>, containing a total of <b> ${starsSystem.userData.planet_num}</b> planet(s). `;
          else {
            tooltip.innerHTML = `This planetary system is apart of a ${starsSystem.userData.total_star === 2 ? 'binary' : 'multiple'} star system named, <b> ${starsSystem.userData.system_name}</b>, with a total of ${starsSystem.userData.total_planets} planet(s) across the ${starsSystem.userData.total_star} stars. `
            if (starsSystem.userData.total_planets !== starsSystem.userData.planet_num){
              tooltip.innerHTML += `Make sure to check out the remaining ${starsSystem.userData.total_planets - starsSystem.userData.planet_num} planet(s) in the other host star.`
            }
          }
          tooltip.innerHTML += `
                                <br>
                                <b class='sep'>Right Ascension: </b> ${`${starsSystem.userData.system_ascend}°` || 'Unknown'}<br>
                                <b class='sep'>Declination: </b> ${`${starsSystem.userData.system_decline}°` || 'Unknown'}<br>
                                <b class='sep'>Distance (in parsecs): </b> ${`${starsSystem.userData.system_distance}` || 'Unknown'}<br>
                                <b class='sep'>Stellar Type: </b> ${`${starsSystem.userData.star_type}` || 'Unknown'}<br>
                                <b class='sep'>Stellar Age (Giga-Year): </b> ${`${starsSystem.userData.star_age}` || 'Unknown'}<br>
                                <b class='sep'>Stellar Radius (in Solar Redius): </b> ${`${starsSystem.userData.star_radius}` || 'Unknown'}<br>
                                <b class='sep'>Stellar Temperature (in Kelvin): </b> ${`${starsSystem.userData.star_temp}°` || 'Unknown'}
                              `
          scene.add(starsSystem);

          for (let i = 0; i < planetsRadius.length; i++){
              let planet = new THREE.Mesh(
                  new THREE.SphereGeometry(planetsRadius[i], longLatCut, longLatCut),
                  new THREE.MeshBasicMaterial(planetsFeature[i])
              );
              planet.userData = {
                type: 'planet',
                name: systemInfo.planets[i].name,
                radius: systemInfo.planets[i].radius,
                mass: systemInfo.planets[i].mass,
                temperature: systemInfo.planets[i].temp,
                orbit: systemInfo.planets[i].orbitDays,
                ecc: systemInfo.planets[i].eccentricity,
                distance: systemInfo.planets[i].distanceAU,
                density: systemInfo.planets[i].density,
                inclination: systemInfo.planets[i].inclination,
                year: systemInfo.planets[i].year,
                method: systemInfo.planets[i].discoverymethod, 
                facility: systemInfo.planets[i].disc_facility
              }
              planetsSystem.push(planet);
              scene.add(planetsSystem.at(-1));

              let ring = createEllipticalOrbit(planetDistance[i], planetEcc[i], planetIncline[i])
              ring.userData = {
                type: 'planet',
                name: systemInfo.planets[i].name,
                radius: systemInfo.planets[i].radius,
                mass: systemInfo.planets[i].mass,
                temperature: systemInfo.planets[i].temp,
                orbit: systemInfo.planets[i].orbitDays,
                ecc: systemInfo.planets[i].eccentricity,
                distance: systemInfo.planets[i].distanceAU,
                density: systemInfo.planets[i].density,
                inclination: systemInfo.planets[i].inclination,
                year: systemInfo.planets[i].year,
                method: systemInfo.planets[i].discoverymethod, 
                facility: systemInfo.planets[i].disc_facility
              }
              planetOrbitRing.push(ring);
              scene.add(planetOrbitRing.at(-1));
          }

          camera.position.z = planetDistance.at(-1) + (planetsRadius.at(-1) * 10);
      }

      // Create the orbital ring
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

      // Calculate information needed for drawing the stars and planets
      function calculateParameters(){
          currentValue = dropdownSolar.value;
          const system = validSystemToDraw.find(system => system.star === currentValue);
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
          let starTexture = textures['sun'];
          let starMaterial = {map: starTexture, color: starColor};

          let planetRadius = [];
          let planetMaterial = [];
          let planetOrbit = [];
          let planetDistance = [];
          let planetIncline = [];
          let planetEcc = [];
          planets.forEach(p => {
              let pColor = starColor.clone().multiply(rockyOrGas(+p.mass, +p.radius, p.density)[1]);
              let pTexture = rockyOrGas(+p.mass, +p.radius, p.density)[0];
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
          let starRadius = null;
          if (system.starRadius === '')
            starRadius = d3.min([d3.max(planetRadius), planetDistance.at(0)]);
          else
            starRadius = (Math.log10(+system.starRadius * 109 * 6378))  // In earth radius

          return [starRadius, starMaterial, planetRadius, planetMaterial, planetOrbit, planetDistance, planetIncline, planetEcc, system];
      }

      // Calculate the speedup in terms of day
      function calculateDisplaySpeed(){
        if (speedSelector.value === '1-Second')
          return 1/86400
        else if (speedSelector.value === '1-Minute')
          return 1/1440
        else if (speedSelector.value === '1-Hour')
          return 1/24
        else if (speedSelector.value === '1-Day')
          return 1
        else if (speedSelector.value === '1-Week')
          return 7
        else if (speedSelector.value === '1-Month')
          return 30.417
        else
          return 365
      }

      // Determine of the planet should be rocky or gas or neptune-like base on its density or mass/rad^3
      function rockyOrGas(massEarth, radiusEarth, density){
          if (density === '')
            density = (massEarth / (radiusEarth ** 3)) * 5.51;
          else
            density = +density;

          if (density >= 3.5){
            return [textures[`rocky_${(Math.floor(density) % 7) + 1}`], new THREE.Color(customPlanetColor(density))];
          }
          else if (density >= 1.5){
            return [textures[`gas_${(Math.floor(density) % 4) + 1}`], new THREE.Color(customPlanetColor(density))];
          }
          else {
            return [textures[`gas_${(Math.floor(density) % 4) + 1}`], new THREE.Color(customPlanetColor(density))];
          }
      }

      let currentTime = 0;
      let localTime = 0;
      let speedUpTimes = calculateDisplaySpeed();

      // Animate the whole solar system
      function createAnimator(orbitalPeriod, planetDistance, planetIncline, planetEcc){
          function animate(time) {
              requestAnimationFrame(animate);

              raycaster.setFromCamera(mouse, camera);
              const intersects = raycaster.intersectObjects(scene.children, true);

              if ((isClick) && (intersects.length > 0)) {
                const intersected = intersects[0].object;
                if (intersected.userData.type === 'star'){
                  if (intersected.userData.total_star === 1)
                    tooltip.innerHTML = `This planetary system is a singular star system named, <b> ${intersected.userData.system_name}</b>, containing a total of <b> ${intersected.userData.planet_num}</b> planet(s). `;
                  else {
                    tooltip.innerHTML = `This planetary system is apart of a ${intersected.userData.total_star === 2 ? 'binary' : 'multiple'} star system named, <b> ${intersected.userData.system_name}</b>, with a total of ${intersected.userData.total_planets} planet(s) across the ${intersected.userData.total_star} stars. `
                    if (intersected.userData.total_planets !== intersected.userData.planet_num){
                      tooltip.innerHTML += `Make sure to check out the remaining ${intersected.userData.total_planets - intersected.userData.planet_num} planet(s) in the other host star.`
                    }
                  }
                  tooltip.innerHTML += `
                                        <br>
                                        <b class='sep'>Right Ascension: </b> ${`${intersected.userData.system_ascend}°` || 'Unknown'}<br>
                                        <b class='sep'>Declination: </b> ${`${intersected.userData.system_decline}°` || 'Unknown'}<br>
                                        <b class='sep'>Distance (in parsecs): </b> ${`${intersected.userData.system_distance}` || 'Unknown'}<br>
                                        <b class='sep'>Stellar Type: </b> ${`${intersected.userData.star_type}` || 'Unknown'}<br>
                                        <b class='sep'>Stellar Age (Giga-Year): </b> ${`${intersected.userData.star_age}` || 'Unknown'}<br>
                                        <b class='sep'>Stellar Radius (in Solar Redius): </b> ${`${intersected.userData.star_radius}` || 'Unknown'}<br>
                                        <b class='sep'>Stellar Temperature (in Kelvin): </b> ${`${intersected.userData.star_temp}°` || 'Unknown'}
                                      `
                }
                else if (intersected.userData.type === 'planet'){
                  tooltip.innerHTML = `
                                        <b class='sep'>Planet Name: </b> ${intersected.userData.name}<br>
                                        <b class='sep'>Discovery Year: </b> ${intersected.userData.discoveryYear || 'Unknown'}<br>
                                        <b class='sep'>Discovery Method: </b> ${intersected.userData.discoveryMethod || 'Unknown'}<br>
                                        <b class='sep'>Discovery Facility: </b> ${intersected.userData.discoverFac || 'Unknown'}<br>
                                        <b class='sep'>Radius (in Earth Radius): </b> ${intersected.userData.radius || 'Unknown'}<br>
                                        <b class='sep'>Mass (in Earth Mass): </b> ${intersected.userData.mass || 'Unknown'}<br>
                                        <b class='sep'>Temperature (in Kelvin): </b> ${intersected.userData.temperature || 'Unknown'}<br>
                                        <b class='sep'>Orbital Days: </b> ${intersected.userData.orbit || 'Unknown'}<br>
                                        <b class='sep'>Eccentricity: </b> ${intersected.userData.ecc || 'Unknown'}<br>
                                        <b class='sep'>Density (in g/cm³): </b> ${intersected.userData.density || 'Unknown'}<br>
                                        <b class='sep'>Inclination: </b> ${intersected.userData.inclination || 'Unknown'}<br>
                                        <b class='sep'>Longest Distance From Star (in AU): </b> ${intersected.userData.distance || 'Unknown'}
                                      `;
                }
                isClick = false;
              }

              control.update();
              const delta = time - localTime;
              if (isPlaying){
                currentTime += (delta / 1000) * speedUpTimes // time in days * speed, 1 sec = 1 day
              }

              for (let i = 0; i < planetsSystem.length; i++){
                let a = planetDistance[i]; 
                let e = planetEcc[i];
                let iRad = planetIncline[i];

                let M = 2 * Math.PI * ((currentTime % orbitalPeriod[i]) / orbitalPeriod[i]);
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
              localTime = time;
          }
          
          requestAnimationFrame(animate);
      }

      let canvasSystem = calculateParameters();
      updateSystemDrawing(canvasSystem[0], canvasSystem[1], canvasSystem[2], canvasSystem[3], canvasSystem[5], canvasSystem[6], canvasSystem[7], canvasSystem[8]);
      createAnimator(canvasSystem[4], canvasSystem[5], canvasSystem[6], canvasSystem[7]);

      speedSelector.addEventListener('input', () => {
        speedUpTimes = calculateDisplaySpeed();
      });
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
    isPlaying = true;
    icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    drawThreeDimension();
  });

  searchBar.addEventListener('input', (event) => {
    createDropdown(event.target.value.toLowerCase(), currentValue.toLowerCase());
  });

  searchBar.addEventListener('change', (event) => {
    isPlaying = true;
    icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    drawThreeDimension();
  });

  playButton.addEventListener('click', (event) => {
    isPlaying = !isPlaying;
    icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
  });
});

// ===========================
// Nghi's Code 
// ===========================

// ===========================
// Royce's Code 
// ===========================


const FEATURES = [
  { key: "pl_rade",    label: "Radius",         unit: "Earth Radius", factor: 1, earth: 1     },
  { key: "pl_bmasse",  label: "Mass",           unit: "Earth Mass",   factor: 1, earth: 1     },
  { key: "pl_eqt",     label: "Temperature",     unit: "Kelvin",       factor: 1, earth: 255   },
  { key: "pl_orbeccen",label: "Eccentricity",   unit: "",             factor: 1, earth: 0.0167 },
  { key: "pl_orbsmax", label: "Distance",       unit: "AU",           factor: 1, earth: 1.0167 },
  { key: "pl_orbper",  label: "Orbital Period", unit: "Days",         factor: 1, earth: 365.26 }
];

/* ── 2.  Dropdown population ───────────────────────────────────── */
const dropdown = d3.select("#features");
FEATURES.forEach(f =>
  dropdown.append("option")
    .attr("value", f.key)
    .text(`${f.label} [${f.unit || "raw"}]`)
);
dropdown.property("value", "pl_rade");


/* ── 3.  SVG scaffold (unique names) ───────────────────────────── */
// const margin = { top: 20, right: 110, bottom: 44, left: 220 };
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const WIDTH  = 960;
const ROW_H  = 20;                      // per-planet vertical space
const HEIGHT = ROW_H * 50;

const top50UsableArea = {
  top: margin.top,
  right: WIDTH - margin.right,
  bottom: HEIGHT - margin.bottom,
  left: margin.left,
  width: WIDTH - margin.left - margin.right,
  height: HEIGHT - margin.top - margin.bottom,
}

// const chartSvg = d3.select(".bar-chart")
const chartSvg = d3.select(".bar-chart")
  .append("svg")
  // .attr("id", "exoCompareSvg")
  .attr('viewBox', `0  0 ${WIDTH} ${HEIGHT}`)
  .style('overflow', 'visible');
  // .attr("width", WIDTH);

const chartGroup = chartSvg.append("g")
    .attr("transform", `translate(${top50UsableArea.left},${top50UsableArea.top})`);

// ── LEGEND: “Earth’s metric” dashed red line ──────────────────────
const legend = chartGroup.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(0,-20)");  // move up above the bars

// draw a short horizontal red dashed line
legend.append("line")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", 24)                   // 24px long
  .attr("y2", 0)
  .attr("stroke", "#e11d48")        // same red as earth-line
  .attr("stroke-width", 2)
  .attr("stroke-dasharray", "4 4");

// add the text label to the right of that line
legend.append("text")
  .attr("x", 30)                    // 6px gap after the line
  .attr("y", 4)                     // vertically centered on the line
  .attr("fill", "#fff")
  .attr("font-size", 12)
  .text("Earth’s metric");

  // .attr("id", "exoCompareGroup")
  // .attr("transform", `translate(${margin.left},${margin.top})`);

chartGroup.append("g").attr("class", "axis-x");
chartGroup.append("g").attr("class", "axis-y");

chartGroup.append("line")
  .attr("class", "earth-line")
  .attr("stroke", "#e11d48")
  .attr("stroke-width", 2)
  .attr("stroke-dasharray", "4 4");

chartGroup.append("text")
  .attr("class", "axis-x-title")
  .attr("fill", "#fff")
  .attr("font-size", 14)
  .attr("text-anchor", "middle")
  .attr("x", top50UsableArea.left + top50UsableArea.width / 2)
  .attr("y", HEIGHT + 15);

chartGroup.append("text")
  .attr("class", "axis-y-title")
  .attr("fill", "#fff")
  .attr("font-size", 14)
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .attr("x", -HEIGHT/2)
  .attr("y", 0);

const habDD = d3.select("#habitable");



/* ── 4.  Main redraw routine ──────────────────────────────────── */
ExoplanetData.onDataLoaded(rows => {

  function draw(colKey, habFilter = "all") {
    const cfg = FEATURES.find(f => f.key === colKey);
    const raw = d => +d[colKey] * cfg.factor;
    
    const candidates = rows.filter(d => {
      if (!Number.isFinite(raw(d))) return false;            // skip NaN
      if (habFilter === "yes") return +d.is_habitable === 1;
      if (habFilter === "no")  return +d.is_habitable === 0;
      return true;                                           // 'all'
    });
    
    const roytooltip = d3.select("#roytooltip");

    const planets = candidates
      .map(d => ({ ...d, delta: Math.abs(raw(d) - cfg.earth) }))
      .sort((a,b)=>d3.ascending(a.delta,b.delta))
      .slice(0,50)
      .sort((a,b)=>d3.descending(raw(a),raw(b)));

    const metrics = FEATURES;                        // 6 columns

    const top3 = [...planets]                /* top three */
      .sort((a, b) => d3.ascending(a.delta, b.delta))
      .slice(0, 3); 
    d3.select("#top3-list")
      .selectAll("li")
      .data(top3, d => d.pl_name)
      .join(
        enter => enter.append("li"),
        update => update
      )
      .text((d,i) => `${d.pl_name}  —  ${d3.format(".3~g")(raw(d))} ${cfg.unit}`);

      d3.select("#top3-title")
        .text(`Top 3 Most Similar to Earth in ${cfg.label}`);
      // const innerH = planets.length * ROW_H;
      // chartSvg.attr("height", innerH + margin.top + margin.bottom);

      const y = d3.scaleBand()
        .domain(planets.map(d => d.pl_name))
        // .range([0, innerH])
        .range([top50UsableArea.top, top50UsableArea.bottom])
        .paddingInner(0.2);

      const values = planets.map(raw).concat(cfg.earth);
      const [lo, hi] = d3.extent(values);
      const pad = (hi - lo || 1) * 0.10;
      const x = d3.scaleLinear()
        .domain([lo - pad, hi + pad]).nice()
        .range([top50UsableArea.left, top50UsableArea.right])
        // .range([0, WIDTH - margin.left - margin.right]);

      /* ---- Earth guide ---- */
      chartGroup.select(".earth-line")
        .attr("x1", x(cfg.earth)).attr("x2", x(cfg.earth))
        .attr("y1", top50UsableArea.bottom).attr("y2", top50UsableArea.top);
        // .attr("y1", 0).attr("y2", innerH);

      /* ---- dots ---- */
    chartGroup.selectAll("circle.dot")
  .data(planets, d => d.pl_name)
  .join(
    enter => enter.append("circle")
      .attr("class", "dot")
      .attr("r", 6)
      .attr("fill", "transparent")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("cx", d => x(raw(d)))
      .attr("cy", d => y(d.pl_name) + y.bandwidth()/2)
      // Updated tooltip event handlers
      .on("mouseover", function(event, d) {
        // Use function syntax to ensure 'this' context
        const val = raw(d);
        const unit = cfg.unit || "";
        
        // Debug log
        console.log('Tooltip mouseover:', d.pl_name, 'at', event.pageX, event.pageY);
        
        // Make tooltip visible
        roytooltip
          .style("display", "block")
          .style("opacity", "1")
          .html(`
            <strong style="color: #4ecdc4; display: block; margin-bottom: 4px;">${d.pl_name}</strong>
            ${cfg.label}: ${d3.format(".3~g")(val)} ${unit}
          `);
        
        // Position tooltip
        const tooltipWidth = roytooltip.node().offsetWidth;
        const tooltipHeight = roytooltip.node().offsetHeight;
        
        // Ensure tooltip stays within viewport
        let left = event.pageX + 10;
        let top = event.pageY - tooltipHeight - 10;
        
        // Adjust if tooltip would go off-screen
        if (left + tooltipWidth > window.innerWidth) {
          left = event.pageX - tooltipWidth - 10;
        }
        if (top < 0) {
          top = event.pageY + 10;
        }
        
        roytooltip
          .style("left", left + "px")
          .style("top", top + "px");
          
        // Highlight the dot
        d3.select(this)
          .attr("fill", "#10b981")
          .attr("fill-opacity", 0.3);
      })
      .on("mousemove", function(event) {
        // Update position on move
        const tooltipWidth = roytooltip.node().offsetWidth;
        const tooltipHeight = roytooltip.node().offsetHeight;
        
        let left = event.pageX + 10;
        let top = event.pageY - tooltipHeight - 10;
        
        if (left + tooltipWidth > window.innerWidth) {
          left = event.pageX - tooltipWidth - 10;
        }
        if (top < 0) {
          top = event.pageY + 10;
        }
        
        roytooltip
          .style("left", left + "px")
          .style("top", top + "px");
      })
      .on("mouseout", function() {
        // Hide tooltip
        roytooltip
          .style("display", "none")
          .style("opacity", "0");
          
        // Remove highlight
        d3.select(this)
          .attr("fill", "transparent");
      }),
    
    update => update
      .transition().duration(400)
      .attr("cx", d => x(raw(d)))
      .attr("cy", d => y(d.pl_name) + y.bandwidth()/2)
  );

    /* ---- labels (flip side if needed) ---- */
    chartGroup.selectAll("text.pl-label")
      .data(planets, d => d.pl_name)
      .join(
        enter => enter.append("text")
          .attr("class", "pl-label")
          .attr("fill", "#fff")
          .attr("font-size", 11)
          .attr("y", d => y(d.pl_name) + y.bandwidth()/2 + 4)
          .text(d => d.pl_name),
        update => update
          .attr("y", d => y(d.pl_name) + y.bandwidth()/2 + 4)
          .text(d => d.pl_name)
      )
      .attr("text-anchor", d => x(raw(d)) < x(cfg.earth) ? "end" : "start")
      .attr("x", d => x(raw(d)) + (x(raw(d)) < x(cfg.earth) ? -8 : 8));

    /* ---- axes ---- */
    chartGroup.select(".axis-y")
      .attr("transform", `translate(${top50UsableArea.left},0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text").remove();             // we draw custom labels

    const formatMass = d => (d / 1e24).toFixed(2) + " ×10²⁴";

    chartGroup.select(".axis-x")
      .attr("transform", `translate(0,${top50UsableArea.bottom})`)
      // .attr("transform", `translate(0,${innerH})`)
      .call(
        d3.axisBottom(x)
          .ticks(6)
          .tickFormat(cfg.unit === "kg" ? formatMass : d3.format("~g"))
      )
      .selectAll("text").style("font-size", "11px").style("fill", "#fff");

    /* ---- titles ---- */
    chartGroup.select(".axis-x-title")
      // .attr("x", WIDTH - margin.left - margin.right)
      // .attr("y", innerH + 32)
      .text(`${cfg.label} (${cfg.unit || "raw"})`);

    chartGroup.select(".axis-y-title")
      // .attr("x", -innerH / 2)
      // .attr("y", -margin.left + 70)
      .text("Top 50 Earth-Similar Exoplanets");

    /* ──  HEAT-MAP  (rows = top-3, cols = 6 metrics)  ────────────────── */

    const hmCell = 60;        // square size     – tweak as you like
    const hmGap  = 15;         // gap between cells
    // const hmW    = FEATURES.length * (hmCell + hmGap);
    // const hmH    = top3.length   * (hmCell + hmGap);
    // const hmOffsetY = innerH + 50;   // 50-px breathing room under bars
    const WIDTH2 = FEATURES.length * (hmCell + hmGap) + 50;
    const HEIGHT2 = top3.length   * (hmCell + hmGap);
    const margin2 = { top: 20, right: 20, bottom: 20, left: 70 };
    const top3UsableArea = {
      top: margin2.top,
      right: WIDTH2 - margin2.right,
      bottom: HEIGHT2 - margin2.bottom,
      left: margin2.left,
      width: WIDTH2 - margin2.left - margin2.right,
      height: HEIGHT2 - margin2.top - margin2.bottom,
    }

    // resize overall SVG so there’s room for the heat-map
    d3.select(".top3chart").html('');
    const top3svg = d3.select(".top3chart")
      .append("svg")
      .attr('viewBox', `0 0 ${WIDTH2} ${HEIGHT2}`)
      .style('overflow', 'visible');

    // parent <g> – one per redraw
    const hmGroup = top3svg.selectAll("g.heatmap")
      .data([null])
      .join("g")
      .attr("class", "heatmap")
      .attr("transform", `translate(${top3UsableArea.left},${top3UsableArea.top})`);
    const limePalette = [
      "#fcffe6", "#f4ffb8", "#eaff8f", "#d3f261",
      "#bae637", "#a0d911", "#7cb305", "#5b8c00",
      "#3f6600", "#254000"
    ];

    // reverse the array so index 0 is darkest (best match)
    const reversedLime = limePalette.slice().reverse();

    const hmColor = d3.scaleQuantize()
      .domain([0, 0.15])       // 0 → perfect, 0.15+ → worst
      .range(reversedLime);

    // flatten planet × metric grid, flag missing values
    const hmData = top3.flatMap((p, row) =>
  FEATURES.map((f, col) => {
    const rawVal = +p[f.key] * f.factor;
    const diff = Number.isFinite(rawVal)
      ? Math.abs((rawVal - f.earth) / f.earth)
      : null;                       // missing
    return {
      row,
      col,
      diff,
      pname: p.pl_name,
      feature: f.label,
      rawValue: Number.isFinite(rawVal)
        ? d3.format(".3~g")(rawVal)
        : "N/A",
      unit: f.unit
    };
  })
);

    // === cells ========================================================
    hmGroup.selectAll("rect")
  .data(hmData)
  .join("rect")
    .attr("x", d => d.col * (hmCell + hmGap))
    .attr("y", d => d.row * (hmCell + hmGap))
    .attr("width",  hmCell)
    .attr("height", hmCell)
    .attr("fill", d => d.diff === null ? "#666" : hmColor(d.diff))
    // ── ADD TOOLTIP LISTENERS ON HEAT‐MAP CELLS ───────────────────────────
    .on("mouseover", (event, d) => {
      roytooltip
        .style("visibility", "visible")
        .html(`
          <strong>${d.pname}</strong><br/>
          ${d.feature}: ${d.rawValue} ${d.unit}<br/>
          ${d.diff !== null
            ? "Δ = " + d3.format(".1%")(d.diff)
            : ""}
        `);
        console.log('showing tooltip at', event.pageX, event.pageY);

    })
    .on("mousemove", event => {
      roytooltip
        .style("top",  (event.pageY + 12) + "px")
        .style("left", (event.pageX + 12) + "px");
    })
    .on("mouseout", () => {
      roytooltip.style("visibility", "hidden");
    });
    // === column labels (metrics) ======================================
    hmGroup.selectAll("text.colLab")
      .data(FEATURES)
      .join("text")
        .attr("class", "colLab")
        .attr("x", (_, i) => i * (hmCell + hmGap) + hmCell / 2)
        .attr("y", -6)
        .attr("text-anchor", "middle")
        .attr("font-size", 9)
        .attr("fill", "#fff")
        .text(d => d.label.split(/\s/)[0]);   // first word

    // === row labels (planet names) ====================================
    hmGroup.selectAll("text.rowLab")
      .data(top3)
      .join("text")
        .attr("class", "rowLab")
        .attr("x", -4)
        .attr("y", (_, i) => i * (hmCell + hmGap) + hmCell / 2 + 4)
        .attr("text-anchor", "end")
        .attr("font-size", 9)
        .attr("fill", "#fff")
        .text(d => d.pl_name);

      // (legend, if you want)
      /*
      legend:
        green  → 0-5 % diff
        pale   → 5-15 %
        dark   → >15 %
        gray   → no data
      */

          /* SPIDER  */
          

  }

  /* first draw + listener */
  draw(dropdown.property("value"), habDD.property("value"));
  habDD.on("change", () => draw(dropdown.property("value"), habDD.property("value")));
  dropdown.on("change", () => draw(dropdown.property("value"), habDD.property("value")));
});

document.addEventListener("DOMContentLoaded", () => {
  const detailsPanel = document.getElementById("details-panel");
  const toggleBtn    = document.getElementById("toggle-details");
  const closeBtn     = document.getElementById("close-details");

  // Show the panel when “Show More Details” is clicked
  toggleBtn.addEventListener("click", () => {
    detailsPanel.classList.add("open");
  });

  // Hide the panel when “✕” is clicked
  closeBtn.addEventListener("click", () => {
    detailsPanel.classList.remove("open");
  });

  // Optionally, if you click outside the panel it closes
  document.body.addEventListener("click", (e) => {
    // If click was not inside the panel or the toggle button, close
    if (
      detailsPanel.classList.contains("open") &&
      !detailsPanel.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      detailsPanel.classList.remove("open");
    }
  });
});


// ===========================
// Royce's Code END
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

// for scroll bar
window.addEventListener('scroll', () => {
  const labels = document.querySelector('.progress-labels');
  if (window.scrollY > 50) {
    labels.classList.add('scrolled');
  } else {
    labels.classList.remove('scrolled');
  }
});

// Stage Navigation System Functions
function setupStageNavigation() {
  console.log('Setting up stage navigation...');
  
  const stageButtons = document.querySelectorAll('.stage-btn');
  
  stageButtons.forEach(button => {
    button.addEventListener('click', function() {
      const stageNumber = parseInt(this.getAttribute('data-stage'));
      switchToStage(stageNumber);
    });
  });
  
  console.log('Stage navigation setup complete');
}

function switchToStage(stageNumber) {
  console.log(`Switching to stage ${stageNumber}`);
  
  // Update button states
  document.querySelectorAll('.stage-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeButton = document.querySelector(`.stage-btn[data-stage="${stageNumber}"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }
  
  // Update panel visibility with fade transition
  document.querySelectorAll('.stage-panel').forEach(panel => {
    panel.classList.remove('active');
    panel.style.opacity = '0';
  });
  
  const activePanel = document.getElementById(`system-stage-${stageNumber}`);
  if (activePanel) {
    setTimeout(() => {
      activePanel.classList.add('active');
      activePanel.style.opacity = '1';
    }, 100);
  }
  
  // Call appropriate render function based on stage
  if (window.currentActiveSystem) {
    const system = window.currentActiveSystem;
    
    setTimeout(() => {
      if (stageNumber === 1) {
        console.log('Calling renderOverviewSystem...');
        if (typeof window.renderOverviewSystem === 'function') {
          window.renderOverviewSystem(system);
        } else {
          console.error('renderOverviewSystem function not available');
        }
      } else if (stageNumber === 2) {
        console.log('Calling renderInteractiveSystem...');
        if (typeof window.renderInteractiveSystem === 'function') {
          window.renderInteractiveSystem(system);
        } else {
          console.error('renderInteractiveSystem function not available');
        }
      }
    }, 450); // Allow time for panel transition
  } else {
    console.warn('No current active system for stage switching');
  }
}

// scroll section
const sections = document.querySelectorAll('.scroll-section');

const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('visible');
} else {
entry.target.classList.remove('visible');
}
});
}, { threshold: 0.1 });

sections.forEach(section => observer.observe(section));

