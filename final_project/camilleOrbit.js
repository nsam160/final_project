// camilleOrbit.js
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

/**
 * Renders an orbit system visualization in a given container
 * @param {string} containerId - ID of the DOM element (no # needed)
 * @param {Array} planetData - Array of planet objects from CSV
 */
export function renderSystem(containerId, planetData) {
  const width = 500;
  const height = 500;
  const maxRadius = 200;

  const svg = d3.select(`#${containerId}`)
    .append("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .style("background", "#000");

  const maxOrbitalDistance = d3.max(planetData, d => getOrbitValue(d));

  // Scales
  const auToPixels = d3.scaleLinear()
    .domain([0, maxOrbitalDistance])
    .range([0, maxRadius]);

  const radiusScale = d3.scaleSqrt()
    .domain([0.1, d3.max(planetData, d => d.pl_rade || 1)])
    .range([2, 10]);

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
    .style("stroke", "#555");

  // Draw planets
  const planets = svg.selectAll(".planet")
    .data(planetData)
    .enter()
    .append("circle")
    .attr("class", "planet")
    .attr("r", d => radiusScale(d.pl_rade || 1))
    .style("fill", d => tempColorScale(d.pl_eqt || 0));

  // Tooltip
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
    tooltip.style("opacity", 1)
      .html(`
        <strong>${d.pl_name}</strong><br>
        Mass: ${d.pl_masse || 'Unknown'} Earth masses<br>
        Radius: ${d.pl_rade || 'Unknown'} Earth radii<br>
        Period: ${d.pl_orbper || 'Unknown'} days<br>
        Temp: ${d.pl_eqt || 'Unknown'} K<br>
        Year: ${d.disc_year || 'Unknown'}
      `);
  })
  .on("mousemove", function(event) {
    tooltip.style("left", (event.pageX + 10) + "px")
           .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => tooltip.style("opacity", 0));

  // Animate orbiting planets
  d3.timer(function(elapsed) {
    planets.attr("transform", function(d) {
      const period = +d.pl_orbper || 365;
      const ecc = +d.pl_orbeccen || 0;
      const a = getOrbitValue(d);
      const progress = (elapsed / (period * 100)) % 1;

      const meanAnomaly = progress * 2 * Math.PI;
      const trueAnomaly = calculateTrueAnomaly(meanAnomaly, ecc);

      const r = a * (1 - ecc * ecc) / (1 + ecc * Math.cos(trueAnomaly));
      const x = auToPixels(r * Math.cos(trueAnomaly));
      const y = auToPixels(r * Math.sin(trueAnomaly));

      return `translate(${x}, ${y})`;
    });
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
