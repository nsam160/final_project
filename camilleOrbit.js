/// camilleOrbit.js
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// planet selection and animation control variables
let currentSelectedPlanet = 0;
let animationSpeed = 1;
let isAnimationPlaying = true;
let currentSystemPlanets = [];
let animationTimer = null;

// =========================== 
// D3 ORBIT STORIES: Camille's Code  
// =========================== 

function getHostnameFromId(containerId) {
  if (containerId.includes("kepler")) return "KOI-351";
  if (containerId.includes("toi")) return "TOI-178";
  if (containerId.includes("gj")) return "GJ 667 C";
  return "";
}
// System data for narrative
const systemNarratives = {
  "KOI-351": {
    title: "Kepler-90: The Cosmic Mirror",
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
    color: "#FFA500" // Orange
  },
  "TOI-178": {
    title: "TOI-178: The Cosmic Orchestra",
    descriptions: {
      'b': "The innermost planet, orbiting every 1.9 days.",
      'c': "Second planet, with a 3.2-day orbital period.",
      'd': "Third planet in the resonance chain, 6.6-day orbit.",
      'e': "Fourth planet in the chain, 9.9-day orbit.",
      'f': "Fifth planet in the chain, 15.2-day orbit.",
      'g': "Outermost planet, completing the 18:9:6:4:3 resonance pattern."
    },
    color: "#4682B4" // Steel Blue
  },
  "GJ 667 C": {
    title: "GJ 667C: The Habitable Triad",
    descriptions: {
      'b': "Inner planet, too hot for habitability.",
      'c': "Super-Earth in the habitable zone, 28-day orbit.",
      'd': "Potential second habitable planet, 92-day orbit.",
      'e': "Outer planet, may be in the habitable zone.",
      'f': "Candidate planet, existence still debated.",
      'g': "Outermost candidate, existence still debated."
    },
    color: "#8B0000" // Dark Red
  }
};

export function renderSystem(containerId, planetData) {
  const width = 600;
  const height = 600;
  const maxRadius = 280;

  // Determine which system we're rendering
  const hostname = planetData.length > 0 ? planetData[0].hostname : "";
  const systemInfo = systemNarratives[hostname] || {};
  const systemColor = systemInfo.color || "#FFFFFF";

  console.log(`Rendering system: ${hostname} with ${planetData.length} planets`);

  const svg = d3.select(`#${containerId}`)
    .append("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .style("background", "#000");

  //system-specific background elements
  addSystemSpecificBackground(svg, hostname);

  const maxOrbitalDistance = d3.max(planetData, d => getOrbitValue(d));

  const auToPixels = d3.scaleLinear()
    .domain([0, maxOrbitalDistance])
    .range([0, maxRadius]);
 

  const radiusScale = d3.scaleSqrt()
    .domain([0.1, d3.max(planetData, d => d.pl_rade || 1)])
    .range([3, 12]); // Slightly larger planets: from [2,10] to [3,12]

  const tempColorScale = d3.scaleSequential(d3.interpolateRdYlBu)
    .domain([3000, 0]);

  // Draw orbits
  svg.selectAll(".orbit")
    .data(planetData)
    .enter()
    .append("ellipse")
    .attr("class", "orbit")
    .attr("cx", d => auToPixels((+d.pl_orbeccen || 0) * getOrbitValue(d)))
    .attr("cy", 0)
    .attr("rx", d => auToPixels(getOrbitValue(d)))
    .attr("ry", d => auToPixels(getOrbitValue(d) * Math.sqrt(1 - Math.pow(+d.pl_orbeccen || 0, 2))))
    .style("fill", "none")
    .style("stroke", d => hostname === "TOI-178" ? "#335577" : "#555") // Special coloring for TOI-178
    .style("stroke-width", d => hostname === "TOI-178" ? 1.5 : 1)
    .style("stroke-dasharray", hostname === "TOI-178" ? "5,3" : "none"); // Dashed for TOI-178 to suggest musical rhythm

  // Draw planets with enhanced styling
  const planets = svg.selectAll(".planet")
    .data(planetData)
    .enter()
    .append("circle")
    .attr("class", "planet")
    .attr("r", d => getPlanetRadius(d, hostname, radiusScale))
    .attr("data-base-radius", d => getPlanetRadius(d, hostname, radiusScale)) // Store original radius
    .style("fill", (d, i) => getPlanetColor(d, i, hostname, tempColorScale))
    .style("stroke", (d, i) => getPlanetStroke(d, i, hostname))
    .style("stroke-width", 1.5)
    .style("filter", d => {
      // Custom glow effects based on system and planet properties
      if (hostname === "GJ 667 C" && isInHabitableZone(d)) {
        return "drop-shadow(0 0 5px rgba(50, 205, 50, 0.8))"; // Green glow for habitable planets
      } else if (hostname === "KOI-351" && d.pl_name.includes("i")) {
        return "drop-shadow(0 0 5px rgba(255, 215, 0, 0.8))"; // Gold glow for AI-discovered planet
      } else if (hostname === "TOI-178") {
        return "drop-shadow(0 0 4px rgba(70, 130, 180, 0.7))"; // Blue glow for musical planets
      }
      return "drop-shadow(0 0 4px rgba(0, 150, 255, 0.7))";
    });

  // Enhanced tooltips with story details
  const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("color", "#fff")
    .style("background", "#111")
    .style("padding", "5px")
    .style("border-radius", "4px")
    .style("pointer-events", "none");

  planets.on("mouseover", function(event, d) {
    const planetLetter = d.pl_name.split(" ").pop();
    const descriptions = systemInfo.descriptions || {};
    const description = descriptions[planetLetter] || `A planet in the ${hostname} system.`;
    
    // Add system-specific narrative elements to tooltip
    let specialInfo = "";
    
    if (hostname === "TOI-178") {
      // Add resonance information for TOI-178
      specialInfo = `<p class="special-info">Part of the cosmic orchestra's resonance chain.</p>`;
    } else if (hostname === "GJ 667 C" && isInHabitableZone(d)) {
      // Add habitability information for GJ 667C
      specialInfo = `<p class="special-info">Located in the star's habitable zone, where liquid water could exist.</p>`;
    } else if (hostname === "KOI-351" && d.pl_name.includes("i")) {
      // Add AI discovery information for Kepler-90i
      specialInfo = `<p class="special-info">Discovered by Google's machine learning AI in 2017.</p>`;
    }
    
    // Format values safely
  const formatMass = (planet) => {
    const mass = planet.pl_masse || planet.pl_massj || planet.pl_mass;
    if (mass && !isNaN(parseFloat(mass))) {
      return `${parseFloat(mass).toFixed(2)} Earth masses`;
    }
    return 'Unknown';
  };

  const formatRadius = (planet) => {
    const radius = planet.pl_rade || planet.pl_radj || planet.pl_radius;
    if (radius && !isNaN(parseFloat(radius))) {
      return `${parseFloat(radius).toFixed(2)} Earth radii`;
    }
    return 'Unknown';
  };

  const formatPeriod = (planet) => {
    const period = planet.pl_orbper;
    if (period && !isNaN(parseFloat(period))) {
      return `${parseFloat(period).toFixed(1)} days`;
    }
    return 'Unknown';
  };

  const formatTemp = (planet) => {
    const temp = planet.pl_eqt || planet.pl_teq;
    if (temp && !isNaN(parseFloat(temp))) {
      return `${Math.round(parseFloat(temp))} K`;
    }
    return 'Unknown';
  };

  tooltip.style("opacity", 1)
    .html(`
      <strong>${d.pl_name}</strong>
      <p>${description}</p>
      ${specialInfo}
      <ul>
        <li>Mass: ${formatMass(d)}</li>
        <li>Radius: ${formatRadius(d)}</li>
        <li>Orbital period: ${formatPeriod(d)}</li>
        <li>Temperature: ${formatTemp(d)}</li>
        <li>Year discovered: ${d.disc_year || 'Unknown'}</li>
      </ul>
    `);
  })
  .on("mousemove", function(event) {
    tooltip.style("left", (event.pageX + 10) + "px")
           .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => tooltip.style("opacity", 0));

  // Animate planets orbiting
  if (animationTimer) {
    animationTimer.stop();
  }

  animationTimer = d3.timer(function(elapsed) {
    if (!isAnimationPlaying) return;
    
    planets.attr("transform", function(d) {
      const period = +d.pl_orbper || 365;
      const ecc = +d.pl_orbeccen || 0;
      const a = getOrbitValue(d);
      
      // Adjust speed based on system - TOI-178 planets move in harmonic rhythm
      let speedFactor = 1;
      if (hostname === "TOI-178") {
        // Slower movement to emphasize the resonance
        speedFactor = 0.7;
      } else if (hostname === "GJ 667 C") {
        // Slightly faster for the closer system
        speedFactor = 1.2;
      }
      
      // Apply both system speed factor AND user speed control
      const progress = (elapsed * animationSpeed / (period * 100 / speedFactor)) % 1;
      const meanAnomaly = progress * 2 * Math.PI;
      const trueAnomaly = calculateTrueAnomaly(meanAnomaly, ecc);
      const r = a * (1 - ecc * ecc) / (1 + ecc * Math.cos(trueAnomaly));
      const x = auToPixels(r * Math.cos(trueAnomaly));
      const y = auToPixels(r * Math.sin(trueAnomaly));
      
      return `translate(${x}, ${y})`;
    });
    
    // Update any resonance lines if they exist
    updateResonanceLines(svg, elapsed, hostname, planetData, auToPixels);
  });
  /*
  // Animate planets orbiting
  d3.timer(function(elapsed) {
    planets.attr("transform", function(d) {
      const period = +d.pl_orbper || 365;
      const ecc = +d.pl_orbeccen || 0;
      const a = getOrbitValue(d);
      
      // Adjust speed based on system - TOI-178 planets move in harmonic rhythm
      let speedFactor = 1;
      if (hostname === "TOI-178") {
        // Slower movement to emphasize the resonance
        speedFactor = 0.7;
      } else if (hostname === "GJ 667 C") {
        // Slightly faster for the closer system
        speedFactor = 1.2;
      }
      //const progress = (elapsed / (period * 100 / speedFactor)) % 1;
      const progress = (elapsed * animationSpeed / (period * 100 / speedFactor)) % 1;
      const meanAnomaly = progress * 2 * Math.PI;
      const trueAnomaly = calculateTrueAnomaly(meanAnomaly, ecc);
      const r = a * (1 - ecc * ecc) / (1 + ecc * Math.cos(trueAnomaly));
      const x = auToPixels(r * Math.cos(trueAnomaly));
      const y = auToPixels(r * Math.sin(trueAnomaly));
      
      return `translate(${x}, ${y})`;
    });
    
    // Update any resonance lines if they exist
    updateResonanceLines(svg, elapsed, hostname, planetData, auToPixels);
  });
  
  */ 
  // hook up system-specific interactive elements
  if (containerId === "container-kepler") {
    setupComparisonSlider(svg, planetData, auToPixels, radiusScale);
    setupResonanceToggle(svg, planetData);
    setupSonificationToggle(planetData);
  } else if (containerId === "container-toi") {
    setupResonanceVisualization(svg, planetData, auToPixels);
  } else if (containerId === "container-gj") {
    setupHabitableZoneToggle(svg, planetData);
  }
}

// Helper function to render system using global data (new addition)
export function renderSystemByHostname(containerId, hostname) {
  // Check if global data is available
  if (!window.ExoplanetData || !window.ExoplanetData.isLoaded()) {
    console.warn(`Cannot render system ${hostname}: Global data not loaded yet`);
    
    // Register callback to render when data becomes available
    if (window.ExoplanetData) {
      window.ExoplanetData.onDataLoaded(() => {
        console.log(`Retrying render for ${hostname} after data load`);
        const planetData = window.ExoplanetData.getByHostname(hostname);
        renderSystem(containerId, planetData);
      });
    }
    return;
  }
  
  // Get planet data using global data management
  const planetData = window.ExoplanetData.getByHostname(hostname);
  
  if (planetData.length === 0) {
    console.warn(`No planets found for hostname: ${hostname}`);
    return;
  }
  
  console.log(`Found ${planetData.length} planets for ${hostname}`);
  renderSystem(containerId, planetData);
}

// Helper function to get system data with additional filtering (new addition)
export function getSystemDataWithFilters(hostname, filters = {}) {
  if (!window.ExoplanetData || !window.ExoplanetData.isLoaded()) {
    console.warn('Global data not loaded yet');
    return [];
  }
  
  let planetData = window.ExoplanetData.getByHostname(hostname);
  
  // Apply additional filters if provided
  if (filters.minRadius) {
    planetData = planetData.filter(d => parseFloat(d.pl_rade || 0) >= filters.minRadius);
  }
  
  if (filters.maxRadius) {
    planetData = planetData.filter(d => parseFloat(d.pl_rade || 0) <= filters.maxRadius);
  }
  
  if (filters.minPeriod) {
    planetData = planetData.filter(d => parseFloat(d.pl_orbper || 0) >= filters.minPeriod);
  }
  
  if (filters.maxPeriod) {
    planetData = planetData.filter(d => parseFloat(d.pl_orbper || 0) <= filters.maxPeriod);
  }
  
  if (filters.habitableOnly && hostname === "GJ 667 C") {
    planetData = planetData.filter(d => isInHabitableZone(d));
  }
  
  return planetData;
}


// Add background elements specific to each system
function addSystemSpecificBackground(svg, hostname) {
  // Add central star with system-specific styling
  const starRadius = hostname === "GJ 667 C" ? 8 : 12; // Red dwarfs are smaller
  const starColor = hostname === "GJ 667 C" ? "#FF6347" : "#FFFF99"; // Red dwarf vs Sun-like
  
  svg.append("circle")
    .attr("class", "star")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", starRadius)
    .attr("fill", starColor)
    .style("filter", `drop-shadow(0 0 10px ${starColor})`);

  //system-specific background elements
  if (hostname === "GJ 667 C") {
    // Add habitable zone for GJ 667C
    svg.append("circle")
      .attr("class", "habitable-zone")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 80) // Approximate habitable zone radius
      .attr("fill", "none")
      .attr("stroke", "#3a3")
      .attr("stroke-width", 8)
      .attr("stroke-opacity", 0.15);
      
    //distant binary companion stars
    svg.append("circle")
      .attr("class", "companion-star")
      .attr("cx", -180)
      .attr("cy", -160)
      .attr("r", 6)
      .attr("fill", "#FFD700")
      .style("filter", "drop-shadow(0 0 5px gold)");
      
    svg.append("circle")
      .attr("class", "companion-star")
      .attr("cx", -195)
      .attr("cy", -150)
      .attr("r", 5)
      .attr("fill", "#FFD700")
      .style("filter", "drop-shadow(0 0 4px gold)");
      
    //text label for triple star system
    svg.append("text")
      .attr("x", -190)
      .attr("y", -185)
      .attr("text-anchor", "middle")
      .attr("fill", "#aaa")
      .style("font-size", "10px")
      .text("GJ 667 A & B");
  } 
  else if (hostname === "TOI-178") {
    // musical note decorations for the "cosmic orchestra"
    const notePositions = [
      { x: -140, y: -120, rotation: 15, opacity: 0.15, symbol: "♪" },
      { x: 120, y: 150, rotation: -20, opacity: 0.12, symbol: "♫" },
      { x: 160, y: -80, rotation: 5, opacity: 0.18, symbol: "♩" }
    ];
    
    notePositions.forEach(note => {
      svg.append("text")
        .attr("class", "musical-note")
        .attr("x", note.x)
        .attr("y", note.y)
        .attr("transform", `rotate(${note.rotation}, ${note.x}, ${note.y})`)
        .style("font-size", "40px")
        .style("opacity", note.opacity)
        .style("fill", "#4682B4")
        .text(note.symbol);
    });
    
    //resonance chain label
    svg.append("text")
      .attr("x", 0)
      .attr("y", -220)
      .attr("text-anchor", "middle")
      .attr("fill", "#89CFF0")
      .style("font-size", "12px")
      .style("opacity", 0.7)
      .text("18 : 9 : 6 : 4 : 3 Resonance Chain");
  }
  else if (hostname === "KOI-351") {
    //Solar System comparison marker
    svg.append("circle")
      .attr("class", "earth-orbit-marker")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 150) // Approximate Earth's orbit equivalent
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,4")
      .attr("stroke-opacity", 0.3);
      
    svg.append("text")
      .attr("x", 150)
      .attr("y", 10)
      .attr("fill", "#aaa")
      .style("font-size", "10px")
      .style("opacity", 0.5)
      .text("Earth's orbit");
      
    //AI discovery highlight
    svg.append("text")
      .attr("x", 0)
      .attr("y", -220)
      .attr("text-anchor", "middle")
      .attr("fill", "#FFA500")
      .style("font-size", "12px")
      .style("opacity", 0.7)
      .text("First 8-planet exosystem - discovered by AI");
  }
}

// Determine planet radius based on system and planet properties
function getPlanetRadius(planet, hostname, radiusScale) {
  const baseSize = radiusScale(planet.pl_rade || 1);
  
  if (hostname === "KOI-351") {
    // Slightly larger for Kepler-90 planets to emphasize this system
    return baseSize * 1.2;
  } 
  else if (hostname === "GJ 667 C" && isInHabitableZone(planet)) {
    // Emphasize habitable zone planets
    return baseSize * 1.3;
  }
  else if (hostname === "TOI-178") {
    // Slightly enhanced size based on resonance position
    const planetLetter = planet.pl_name.split(" ").pop();
    const letterIndex = planetLetter.charCodeAt(0) - 'b'.charCodeAt(0);
    return baseSize * (1 + (letterIndex * 0.05));
  }
  
  return baseSize;
}

// Determine planet color based on system and planet properties
function getPlanetColor(planet, index, hostname, tempColorScale) {
  if (hostname === "KOI-351") {
    // First 4 planets are rocky, others are gas giants
    return index < 4 ? "#B8A89A" : tempColorScale(planet.pl_eqt || 0);
  } 
  else if (hostname === "TOI-178") {
    // TOI-178's planets have varying densities despite being in resonance
    const densities = [0.5, 1.0, 1.5, 0.8, 2.0, 1.2]; // Placeholder density values
    const densityIndex = Math.min(index, densities.length - 1);
    const brightness = 40 + (densities[densityIndex] * 30);
    return `hsl(210, 80%, ${brightness}%)`;
  } 
  else if (hostname === "GJ 667 C") {
    return isInHabitableZone(planet) ? "#50C878" : "#8B4513"; // Emerald green for habitable, brown for others
  }
  
  return tempColorScale(planet.pl_eqt || 0);
}

// Determine planet stroke color based on system and planet properties
function getPlanetStroke(planet, index, hostname) {
  if (hostname === "GJ 667 C" && isInHabitableZone(planet)) {
    return "#32CD32"; // Green outline for habitable planets
  } 
  else if (hostname === "KOI-351" && planet.pl_name.includes("i")) {
    return "#FFC107"; // Highlight the AI-discovered planet
  }
  else if (hostname === "TOI-178") {
    // Planets in resonance with subtle color differences
    const planetLetter = planet.pl_name.split(" ").pop();
    const letterIndex = planetLetter.charCodeAt(0) - 'b'.charCodeAt(0);
    const hue = 210 + (letterIndex * 20);
    return `hsl(${hue}, 70%, 60%)`;
  }
  
  return "rgba(255,255,255,0.3)";
}

// Check if a planet is in the habitable zone (simplified for GJ 667C)
function isInHabitableZone(planet) {
  const orbitalPeriod = +planet.pl_orbper || 0;
  // For GJ 667C, roughly planets with periods between 20-60 days
  return orbitalPeriod >= 20 && orbitalPeriod <= 60;
}

// Update resonance lines for TOI-178 visualization
function updateResonanceLines(svg, elapsed, hostname, planetData, auToPixels) {
  if (hostname !== "TOI-178" || !svg.select(".resonance-lines").size()) {
    return;
  }

  const lines = svg.select(".resonance-lines").selectAll("line");
  
  lines.attr("x1", function(d) {
    const [i, j] = d;
    const planetI = d3.select(svg.selectAll(".planet").nodes()[i]);
    const transform = planetI.attr("transform");
    const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
    return match ? parseFloat(match[1]) : 0;
  })
  .attr("y1", function(d) {
    const [i, j] = d;
    const planetI = d3.select(svg.selectAll(".planet").nodes()[i]);
    const transform = planetI.attr("transform");
    const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
    return match ? parseFloat(match[2]) : 0;
  })
  .attr("x2", function(d) {
    const [i, j] = d;
    const planetJ = d3.select(svg.selectAll(".planet").nodes()[j]);
    const transform = planetJ.attr("transform");
    const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
    return match ? parseFloat(match[1]) : 0;
  })
  .attr("y2", function(d) {
    const [i, j] = d;
    const planetJ = d3.select(svg.selectAll(".planet").nodes()[j]);
    const transform = planetJ.attr("transform");
    const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
    return match ? parseFloat(match[2]) : 0;
  });
}

// Utilities
function getOrbitValue(planet) {
  if (planet.pl_orbsmax) return +planet.pl_orbsmax;
  if (planet.pl_orbper && planet.st_mass) {
    const P = +planet.pl_orbper / 365.25;
    return Math.cbrt(P * P * +planet.st_mass);
  }
  return 1.0;
}

function calculateTrueAnomaly(M, e) {
  let E = M;
  for (let i = 0; i < 5; i++) {
    E = M + e * Math.sin(E);
  }
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}

// Interactive elements for Kepler-90
function setupComparisonSlider(svg, data, auToPixels, radiusScale) {
  const slider = document.getElementById("comparison-slider");
  const label = document.getElementById("comparison-label");
  const solarAU = [0.39, 0.72, 1.0, 1.52, 5.2, 9.58, 19.2, 30.05];

  if (!slider) return;

  slider.addEventListener("input", function () {
    const percentSolar = +this.value / 100;
    const percentKepler = 1 - percentSolar;

    if (label) {
      label.textContent = percentSolar > 0.7
        ? "Solar System"
        : percentSolar > 0.3
        ? "Blended View"
        : "Kepler-90";
    }

    svg.selectAll(".orbit")
      .attr("rx", (d, i) => {
        const k = auToPixels(getOrbitValue(d));
        const s = auToPixels(solarAU[i] || 1.0);
        return k * percentKepler + s * percentSolar;
      })
      .attr("ry", (d, i) => {
        const e = +d.pl_orbeccen || 0;
        const k = auToPixels(getOrbitValue(d) * Math.sqrt(1 - e * e));
        const s = auToPixels((solarAU[i] || 1.0) * 0.98);
        return k * percentKepler + s * percentSolar;
      });
    
    // Also update earth orbit marker visibility
    svg.select(".earth-orbit-marker")
      .style("opacity", percentSolar);
  });
}

function setupResonanceToggle(svg, data) {
  const button = document.getElementById("toggle-resonance");
  if (!button) return;

  const lines = svg.append("g").attr("class", "resonance-lines").style("opacity", 0);
  const pairs = [];

  for (let i = 0; i < data.length - 1; i++) {
    const p1 = +data[i].pl_orbper || 0;
    const p2 = +data[i + 1].pl_orbper || 0;
    if (p1 && p2 && Math.abs(p2 / p1 - 2) < 0.5) {
      pairs.push([i, i + 1]);
    }
  }

  lines.selectAll("line")
    .data(pairs)
    .enter()
    .append("line")
    .attr("stroke", "#88ccff")
    .attr("stroke-dasharray", "4,2")
    .attr("stroke-width", 1);

  button.addEventListener("click", () => {
    const show = lines.style("opacity") === "0";
    lines.transition().duration(400).style("opacity", show ? 1 : 0);
    button.textContent = show ? "Hide Resonance" : "Show Resonance";
  });
}

function setupSonificationToggle(data) {
  const button = document.getElementById("toggle-sound");
  if (!button) return;

  button.addEventListener("click", () => {
    console.log("Sonification toggle clicked. Add Tone.js here.");
    button.textContent =
      button.textContent === "Enable Sonification"
        ? "Disable Sonification"
        : "Enable Sonification";
  });
}

// Interactive elements for TOI-178
function setupResonanceVisualization(svg, data, auToPixels) {
  // Create resonance lines
  const lines = svg.append("g").attr("class", "resonance-lines").style("opacity", 0.5);
  
  // Define resonance pairs based on the 18:9:6:4:3 pattern
  const pairs = [];
  for (let i = 0; i < data.length - 1; i++) {
    pairs.push([i, i + 1]);
  }
  
  // Draw resonance lines
  lines.selectAll("line")
    .data(pairs)
    .enter()
    .append("line")
    .attr("stroke", "#4682B4")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "4,3")
    .attr("opacity", 0.6);
}

// Interactive elements for GJ 667C
function setupHabitableZoneToggle(svg, data) {
  // Check if we can find a habitable zone toggle button
  const button = document.getElementById("toggle-habitable-zone");
  if (!button) return;
  
  // Add highlight for habitable planets
  button.addEventListener("click", () => {
    const habitableZone = svg.select(".habitable-zone");
    const isVisible = habitableZone.style("opacity") !== "0";
    
    habitableZone.transition()
      .duration(400)
      .style("opacity", isVisible ? 0 : 0.3);
      
    // Also highlight planets in the habitable zone
    svg.selectAll(".planet")
      .transition()
      .duration(400)
      .style("filter", (d, i) => {
        if (isInHabitableZone(d)) {
          return isVisible 
            ? "drop-shadow(0 0 4px rgba(0, 150, 255, 0.7))" 
            : "drop-shadow(0 0 8px rgba(50, 205, 50, 0.9))";
        }
        return "drop-shadow(0 0 4px rgba(0, 150, 255, 0.7))";
      });
      
    button.textContent = isVisible ? "Show Habitable Zone" : "Hide Habitable Zone";
  });
}

// Enhanced renderSystem function with planet selection support
export function renderSystemEnhanced(containerId, planetData) {
  currentSystemPlanets = planetData;
  currentSelectedPlanet = 0;
  
  // Render the original system
  renderSystem(containerId, planetData);
  
  // Add planet selection functionality
  addPlanetSelectionToSystem(containerId, planetData);
  
  // Initialize planet profile
  updatePlanetProfile(0);
  
  // Setup animation controls
  setupAnimationControls();
  
  // Setup planet navigation
  setupPlanetNavigation();
}

// Add clickable functionality to planets in the orbit animation
function addPlanetSelectionToSystem(containerId, planetData) {
  const container = d3.select(`#${containerId}`);
  
  // Add click handlers to planets
  container.selectAll(".planet")
    .classed("orbit-planet", true)
    .on("click", function(event, d) {
      const planetIndex = planetData.indexOf(d);
      selectPlanetInSystem(planetIndex);
    });
    
  // Highlight the first planet by default
  if (planetData.length > 0) {
    container.selectAll(".planet")
      .classed("selected", (d, i) => i === 0);
  }
}

// Select a specific planet and update the profile
function selectPlanetInSystem(planetIndex) {
  if (planetIndex < 0 || planetIndex >= currentSystemPlanets.length) return;
  
  currentSelectedPlanet = planetIndex;
  
  // Update visual selection in orbit animation
  d3.selectAll(".orbit-planet")
    .classed("selected", (d, i) => i === planetIndex)
    .attr("r", function(d, i) {
      // Scale the radius instead of using CSS transform
      const baseRadius = d3.select(this).attr("data-base-radius") || d3.select(this).attr("r");
      return i === planetIndex ? parseFloat(baseRadius) * 1.3 : baseRadius;
    });
  
  // Update planet profile panel
  updatePlanetProfile(planetIndex);
}

// Update the planet profile panel with selected planet data
function updatePlanetProfile(planetIndex) {
  if (planetIndex >= currentSystemPlanets.length) return;
  
  const planet = currentSystemPlanets[planetIndex];
  const hostname = planet.hostname;
  const systemInfo = systemNarratives[hostname] || {};
  
  // Get planet letter for description lookup
  const planetLetter = planet.pl_name.split(" ").pop();
  const descriptions = systemInfo.descriptions || {};
  const description = descriptions[planetLetter] || 
    `A fascinating planet in the ${hostname} system. This ${planet.pl_name} offers unique characteristics that add to our understanding of planetary formation and evolution.`;
  
  const safeText = (val, unit = "") => {
    const num = parseFloat(val);
    return isNaN(num) ? "Unknown" : `${num.toFixed(2)}${unit}`;
  };
  
// Update planet info
  document.getElementById('profile-planet-name').textContent = planet.pl_name || 'Unknown';
  document.getElementById('profile-planet-mass').textContent = safeText(planet.pl_bmasse, " Earth masses");
  document.getElementById('profile-planet-radius').textContent = safeText(planet.pl_rade, " Earth radii");
  document.getElementById('profile-planet-period').textContent = safeText(planet.pl_orbper, " days");
  document.getElementById('profile-planet-temp').textContent = safeText(planet.pl_eqt, " K");

  const distanceAU = parseFloat(planet.pl_orbsmax) || getOrbitValue(planet);
  document.getElementById('profile-planet-distance').textContent = isNaN(distanceAU) ? 'Unknown' : `${distanceAU.toFixed(3)} AU`;

  // Update description
  document.getElementById('profile-planet-description').textContent = description;

  // Update visual representation
  updatePlanetVisual(planet, hostname);
}

// Update the 3D planet visual based on selected planet
function updatePlanetVisual(planet, hostname) {
  const visual = document.getElementById('planet-visual-display');
  if (!visual) return;
  
  // Get planet color based on system and properties
  let planetColor = getPlanetDisplayColor(planet, hostname);
  
  // Update visual styling
  visual.style.background = `radial-gradient(circle at 30% 30%, ${planetColor}, ${planetColor}88)`;
  visual.style.boxShadow = `0 0 30px ${planetColor}66, inset -10px -10px 20px rgba(0, 0, 0, 0.3)`;
  
  // Add special effects for notable planets
  if (hostname === "GJ 667 C" && isInHabitableZone(planet)) {
    visual.style.boxShadow += `, 0 0 40px rgba(50, 205, 50, 0.4)`;
  } else if (hostname === "KOI-351" && planet.pl_name.includes("i")) {
    visual.style.boxShadow += `, 0 0 40px rgba(255, 215, 0, 0.4)`;
  }
}

// Get display color for planet visual
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

// Setup animation controls
function setupAnimationControls() {
  const playPauseBtn = document.getElementById('animation-play-pause');
  const speedSlider = document.getElementById('animation-speed-slider');
  const speedValue = document.getElementById('animation-speed-value');
  
  // Play/Pause button
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', function() {
      isAnimationPlaying = !isAnimationPlaying;
      this.textContent = isAnimationPlaying ? '⏸️ Pause' : '▶️ Play';
      console.log(`Animation ${isAnimationPlaying ? 'resumed' : 'paused'}`);
    });
  }
  
  // Speed control
  if (speedSlider && speedValue) {
    speedSlider.addEventListener('input', function() {
      animationSpeed = parseFloat(this.value);
      speedValue.textContent = `${animationSpeed}x`;

      console.log(`Animation speed set to: ${animationSpeed}x`);
    });
  }
  console.log('Animation controls setup completed');
}

// Setup planet navigation controls
function setupPlanetNavigation() {
  const nextPlanetBtn = document.getElementById('next-planet-btn');
  
  if (nextPlanetBtn) {
    nextPlanetBtn.addEventListener('click', function() {
      if (currentSystemPlanets.length === 0) return;
      
      currentSelectedPlanet = (currentSelectedPlanet + 1) % currentSystemPlanets.length;
      selectPlanetInSystem(currentSelectedPlanet);
      
      // Add visual feedback
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
    });
  }
}

// Initialize enhanced system when called from global.js
export function initializeEnhancedSystem(containerId, hostname) {
  if (!window.ExoplanetData || !window.ExoplanetData.isLoaded()) {
    console.warn(`Cannot initialize enhanced system ${hostname}: Global data not loaded yet`);
    
    if (window.ExoplanetData) {
      window.ExoplanetData.onDataLoaded(() => {
        const planetData = window.ExoplanetData.getByHostname(hostname);
        renderSystemEnhanced(containerId, planetData);
      });
    }
    return;
  }
  
  const planetData = window.ExoplanetData.getByHostname(hostname);
  if (planetData.length === 0) {
    console.warn(`No planets found for hostname: ${hostname}`);
    return;
  }
  
  renderSystemEnhanced(containerId, planetData);
}

// Cleanup function for when switching between systems
export function cleanupEnhancedSystem() {
  if (animationTimer) {
    animationTimer.stop();
    animationTimer = null;
  }
  
  currentSystemPlanets = [];
  currentSelectedPlanet = 0;
  isAnimationPlaying = true;
  animationSpeed = 1;
}

// Keyboard navigation support
export function setupKeyboardNavigation() {
  document.addEventListener('keydown', function(event) {
    if (!currentSystemPlanets.length) return;
    
    switch(event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        currentSelectedPlanet = currentSelectedPlanet > 0 ? currentSelectedPlanet - 1 : currentSystemPlanets.length - 1;
        selectPlanetInSystem(currentSelectedPlanet);
        break;
      case 'ArrowRight':
        event.preventDefault();
        currentSelectedPlanet = (currentSelectedPlanet + 1) % currentSystemPlanets.length;
        selectPlanetInSystem(currentSelectedPlanet);
        break;
      case ' ':
        event.preventDefault();
        document.getElementById('animation-play-pause')?.click();
        break;
    }
  });
}