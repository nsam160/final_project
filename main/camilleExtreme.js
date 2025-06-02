/// camilleExtreme.js
// ===========================
// Handles WASP-76b, KELT-9b, and Kepler-80f Effects
// ===========================

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Export the initialization function for use in global.js
export function initializeExtremePlanets() {
  console.log("Initializing extreme planets...");
  
  const data = window.ExoplanetData?.getAll?.();
  if (!data || !Array.isArray(data)) {
    console.error("Exoplanet data not available yet for extreme planets.");
    return;
  }

  // Initialize extreme planet visualizations
  initializeWASP76b(data);
  initializeKELT9b(data);
  initializeKepler80f(data);
  
  console.log("Extreme planets initialized successfully.");
}

// WASP-76b initialization
function initializeWASP76b(data) {
  const planetWaspId = 'WASP-76 b';
  const wasp = data.find(p => p.pl_name === planetWaspId);
  
  if (!wasp) {
    console.warn(`Planet ${planetWaspId} not found in data`);
    return;
  }

  // Wait for the extreme-visual container to be ready
  const checkContainer = () => {
    const container = document.getElementById('extreme-visual');
    if (container) {
      renderWASP76bVisualization(container, wasp);
    } else {
      // Container not ready, will be created when capsule is clicked
      console.log("WASP-76b container not ready, will initialize on demand");
    }
  };
  
  checkContainer();
}

// KELT-9b initialization
function initializeKELT9b(data) {
  const planetKeltId = 'KELT-9 b';
  const kelt = data.find(p => p.pl_name === planetKeltId);
  
  if (!kelt) {
    console.warn(`Planet ${planetKeltId} not found in data`);
    return;
  }

  // Similar pattern for KELT-9b
  const checkContainer = () => {
    const container = document.getElementById('kelt-visual');
    if (container) {
      renderKELT9bVisualization(container, kelt);
    } else {
      console.log("KELT-9b container not ready, will initialize on demand");
    }
  };
  
  checkContainer();
}

// Kepler-80f initialization
function initializeKepler80f(data) {
  const planetKeplerId = 'Kepler-80 f';
  const kepler = data.find(p => p.pl_name === planetKeplerId);
  
  if (!kepler) {
    console.warn(`Planet ${planetKeplerId} not found in data`);
    return;
  }

  const checkContainer = () => {
    const container = document.getElementById('kepler-visual');
    if (container) {
      renderKepler80fVisualization(container, kepler);
    } else {
      console.log("Kepler-80f container not ready, will initialize on demand");
    }
  };
  
  checkContainer();
}

// WASP-76b visualization function
function renderWASP76bVisualization(container, planetData) {
  const svg = d3.select(container).append("svg")
    .attr("width", "100%")
    .attr("height", 500)
    .attr("viewBox", "0 0 800 500");

  const layer = svg.append("g").attr("class", "wasp-76-layer");
  let isDay = true;
  
  // Add toggle button if it doesn't exist
  let toggleButton = document.getElementById("toggle-daynight");
  if (!toggleButton) {
    toggleButton = document.createElement("button");
    toggleButton.id = "toggle-daynight";
    toggleButton.textContent = "Toggle Day/Night";
    toggleButton.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: #4682B4;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
    `;
    container.style.position = "relative";
    container.appendChild(toggleButton);
  }

  function renderWasp() {
    layer.selectAll("*").remove();

    if (isDay) {
      // Day side visualization
      layer.append("circle")
        .attr("cx", 400)
        .attr("cy", 250)
        .attr("r", 100)
        .style("fill", "orange")
        .style("filter", "drop-shadow(0 0 20px rgba(255, 165, 0, 0.8))");

      layer.append("text")
        .attr("x", 400)
        .attr("y", 470)
        .attr("text-anchor", "middle")
        .text("Day Side: Vaporized Iron (4000K+)")
        .style("fill", "#fff")
        .style("font-size", "18px")
        .style("font-weight", "bold");
    } else {
      // Night side - iron rain animation
      for (let i = 0; i < 100; i++) {
        layer.append("circle")
          .attr("cx", Math.random() * 800)
          .attr("cy", Math.random() * 200)
          .attr("r", 2 + Math.random() * 2)
          .style("fill", "#c44")
          .style("opacity", 0.7)
          .transition()
          .duration(3000)
          .ease(d3.easeLinear)
          .attr("cy", 500)
          .on("end", function () { d3.select(this).remove(); });
      }

      layer.append("text")
        .attr("x", 400)
        .attr("y", 470)
        .attr("text-anchor", "middle")
        .text("Night Side: Iron Rain (2000K)")
        .style("fill", "#fff")
        .style("font-size", "18px")
        .style("font-weight", "bold");
    }
  }

  // Set up toggle functionality
  d3.select(toggleButton).on("click", () => {
    isDay = !isDay;
    renderWasp();
  });

  renderWasp();
}

// KELT-9b visualization function
function renderKELT9bVisualization(container, planetData) {
  const svg = d3.select(container).append("svg")
    .attr("width", "100%")
    .attr("height", 400)
    .attr("viewBox", "0 0 400 400");

  // Create plasma effect
  const defs = svg.append("defs");
  const gradient = defs.append("radialGradient")
    .attr("id", "plasma-gradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%");

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#ffffff")
    .attr("stop-opacity", 1);

  gradient.append("stop")
    .attr("offset", "30%")
    .attr("stop-color", "#ffff00")
    .attr("stop-opacity", 0.8);

  gradient.append("stop")
    .attr("offset", "70%")
    .attr("stop-color", "#ff6600")
    .attr("stop-opacity", 0.6);

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#ff0000")
    .attr("stop-opacity", 0.4);

  // Main planet
  svg.append("circle")
    .attr("cx", 200)
    .attr("cy", 200)
    .attr("r", 80)
    .style("fill", "url(#plasma-gradient)")
    .style("filter", "drop-shadow(0 0 30px #ff6600)");

  // Pulsing animation
  svg.append("circle")
    .attr("cx", 200)
    .attr("cy", 200)
    .attr("r", 80)
    .style("fill", "none")
    .style("stroke", "#ffffff")
    .style("stroke-width", 2)
    .style("opacity", 0.5)
    .transition()
    .duration(2000)
    .ease(d3.easeSinInOut)
    .attr("r", 100)
    .style("opacity", 0)
    .on("end", function() {
      d3.select(this).attr("r", 80).style("opacity", 0.5);
    });

  svg.append("text")
    .attr("x", 200)
    .attr("y", 350)
    .attr("text-anchor", "middle")
    .text("KELT-9b: Hotter than most stars (4600K)")
    .style("fill", "white")
    .style("font-size", "16px")
    .style("font-weight", "bold");
}

// Kepler-80f visualization function
function renderKepler80fVisualization(container, planetData) {
  const svg = d3.select(container).append("svg")
    .attr("width", "100%")
    .attr("height", 400)
    .attr("viewBox", "0 0 400 400");

  // Create dense grid pattern
  const gridSize = 20;
  const gridPattern = svg.append("g").attr("class", "density-grid");

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      gridPattern.append("rect")
        .attr("x", x * gridSize + 100)
        .attr("y", y * gridSize + 100)
        .attr("width", gridSize - 2)
        .attr("height", gridSize - 2)
        .style("fill", "#aaa")
        .style("stroke", "#333")
        .style("stroke-width", 1)
        .transition()
        .delay(Math.random() * 2000)
        .duration(1000)
        .style("fill", "#666")
        .transition()
        .duration(1000)
        .style("fill", "#aaa");
    }
  }

  svg.append("text")
    .attr("x", 200)
    .attr("y", 350)
    .attr("text-anchor", "middle")
    .text("Kepler-80f: Ultra-Dense (2331 g/cm³)")
    .style("fill", "white")
    .style("font-size", "16px")
    .style("font-weight", "bold");

  svg.append("text")
    .attr("x", 200)
    .attr("y", 370)
    .attr("text-anchor", "middle")
    .text("50% denser than Earth!")
    .style("fill", "#feca57")
    .style("font-size", "14px");
}

// Initialize the extreme capsule interactions (existing code remains)
(function () {
  const overview = document.getElementById("overview");
  const detailedView = document.getElementById("detailed-view");
  const orbitContainer = document.getElementById("orbit-container");
  const systemTitle = document.getElementById("system-title-orbit");
  const backButton = document.getElementById("back-button");

  function showExtremeView(title, containerId) {
    overview.style.opacity = 0;

    // Also hide the entire capsules section
    const section = document.getElementById("section-systems");
    if (section) section.style.display = "none";

    setTimeout(() => {
      overview.style.display = "none";
      detailedView.style.display = "block";
      detailedView.style.opacity = 1;
      systemTitle.textContent = title;
      orbitContainer.innerHTML = "";

      const newDiv = document.createElement("div");
      newDiv.id = containerId;
      newDiv.style.width = "100%";
      newDiv.style.height = "500px";
      newDiv.style.position = "relative";
      orbitContainer.appendChild(newDiv);

      // Render the appropriate visualization
      setTimeout(() => {
        if (containerId === "extreme-visual") {
          const data = window.ExoplanetData?.getAll?.();
          if (data) {
            const wasp = data.find(p => p.pl_name === 'WASP-76 b');
            if (wasp) renderWASP76bVisualization(newDiv, wasp);
          }
        } else if (containerId === "kelt-visual") {
          const data = window.ExoplanetData?.getAll?.();
          if (data) {
            const kelt = data.find(p => p.pl_name === 'KELT-9 b');
            if (kelt) renderKELT9bVisualization(newDiv, kelt);
          }
        } else if (containerId === "kepler-visual") {
          const data = window.ExoplanetData?.getAll?.();
          if (data) {
            const kepler = data.find(p => p.pl_name === 'Kepler-80 f');
            if (kepler) renderKepler80fVisualization(newDiv, kepler);
          }
        }
      }, 100);
    }, 400);
  }

  function setupExtremeCapsule(id, title, containerId) {
    const capsule = document.getElementById(id);
    if (capsule) {
      capsule.addEventListener("click", () => {
        capsule.classList.add("visited");
        showExtremeView(title, containerId);
      });
    }
  }

  // Setup extreme capsule interactions
  setupExtremeCapsule("capsule-wasp", "WASP-76b: Iron Rain", "extreme-visual");
  setupExtremeCapsule("capsule-kelt", "KELT-9b: Plasma Hell", "kelt-visual");
  setupExtremeCapsule("capsule-kepler80", "Kepler-80f: Ultra-Dense", "kepler-visual");

  // Back button functionality
  if (backButton) {
    backButton.addEventListener("click", () => {
      detailedView.style.opacity = 0;
      setTimeout(() => {
        detailedView.style.display = "none";
        orbitContainer.innerHTML = "";
        const section = document.getElementById("section-systems");
        if (section) section.style.display = "block";
        overview.style.display = "flex";
        overview.style.opacity = 1;
      }, 400);
    });
  }
})();
