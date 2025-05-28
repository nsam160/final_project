/// camilleExtreme.js
// ===========================
// Handles WASP-76b, KELT-9b, and Kepler-80f Effects
// ===========================

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

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
    orbitContainer.appendChild(newDiv);
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

  // WASP-76b Interaction
  setupExtremeCapsule("capsule-wasp", "WASP-76b: Iron Rain", "extreme-visual");

  // KELT-9b Interaction
  setupExtremeCapsule("capsule-kelt", "KELT-9b: Plasma Hell", "kelt-visual");

  // Kepler-80f Interaction
  setupExtremeCapsule("capsule-kepler80", "Kepler-80f: Ultra-Dense", "kepler-visual");

  // Back button restores view
  backButton.addEventListener("click", () => {
    detailedView.style.opacity = 0;
    setTimeout(() => {
      detailedView.style.display = "none";
      orbitContainer.innerHTML = "";
      // Restore capsule section
      const section = document.getElementById("section-systems");
      if (section) section.style.display = "block";
      overview.style.display = "flex";
      overview.style.opacity = 1;
    }, 400);

  });

  // ========= WASP-76b ========= //
  const planetWaspId = 'WASP-76 b';
  ExoplanetData.onDataLoaded((data) => {
    const wasp = data.find(p => p.pl_name === planetWaspId);
    if (!wasp) return;

    const svg = d3.select("#extreme-visual").append("svg")
      .attr("width", "100%")
      .attr("height", 500)
      .attr("viewBox", "0 0 800 500");

    const layer = svg.append("g").attr("class", "wasp-76-layer");

    let isDay = true;
    d3.select("#toggle-daynight").on("click", () => {
      isDay = !isDay;
      renderWasp();
    });

    function renderWasp() {
      layer.selectAll("*").remove();

      if (isDay) {
        layer.append("circle")
          .attr("cx", 400)
          .attr("cy", 250)
          .attr("r", 100)
          .style("fill", "orange")
          .style("filter", "url(#glow)");

        layer.append("text")
          .attr("x", 400)
          .attr("y", 470)
          .attr("text-anchor", "middle")
          .text("Day Side: Vaporized Iron")
          .style("fill", "#fff")
          .style("font-size", "18px");
      } else {
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
          .text("Night Side: Iron Rain")
          .style("fill", "#fff")
          .style("font-size", "18px");
      }
    }

    renderWasp();
  });

  // ========= KELT-9b ========= //
  const planetKeltId = 'KELT-9 b';
  ExoplanetData.onDataLoaded((data) => {
    const kelt = data.find(p => p.pl_name === planetKeltId);
    if (!kelt) return;

    const keltViz = d3.select("#kelt-visual").append("svg")
      .attr("width", 300)
      .attr("height", 300);

    keltViz.append("circle")
      .attr("cx", 150)
      .attr("cy", 150)
      .attr("r", 80)
      .style("fill", "#ff6600")
      .style("filter", "blur(5px)")
      .style("opacity", 0.9);

    keltViz.append("text")
      .attr("x", 150)
      .attr("y", 290)
      .attr("text-anchor", "middle")
      .text("KELT-9b: 4,600K Plasma Hell")
      .style("fill", "white");
  });

  // ========= Kepler-80f ========= //
  const planetKeplerId = 'Kepler-80 f';
  ExoplanetData.onDataLoaded((data) => {
    const kepler = data.find(p => p.pl_name === planetKeplerId);
    if (!kepler) return;

    const keplerViz = d3.select("#kepler-visual").append("svg")
      .attr("width", 300)
      .attr("height", 300);

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        keplerViz.append("rect")
          .attr("x", x * 30)
          .attr("y", y * 30)
          .attr("width", 28)
          .attr("height", 28)
          .style("fill", "#aaa")
          .style("stroke", "#333")
          .style("stroke-width", 1);
      }
    }

    keplerViz.append("text")
      .attr("x", 150)
      .attr("y", 290)
      .attr("text-anchor", "middle")
      .text("Kepler-80f: Compressed Density")
      .style("fill", "white");
  });
})();
