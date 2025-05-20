import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { renderSystem } from './camilleOrbit.js'; // Import Camille's function for camilleOrbit.js


// ===========================
// Nghi's Code 
// ===========================

const scenes = []
const cameras = []
const renderers = []
const controls = []

function createSystem(starRadius, planetsRadius){
    scenes.append(new THREE.Scene());
    cameras.append(new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000));
    renderers.append(new THREE.WebGLRenderer());

    const current_scene = scenes.at(-1);
    const current_camera = cameras.at(-1);
    const current_renderer = renderers.at(-1);

    current_renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(current_renderer.domElement);

    controls.append(new OrbitControls(current_camera, current_renderer.domElement));
    controls[controls.length - 1].enableDamping = true;

    
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const control = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Star
const star = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
scene.add(star);

// Planet
const planet = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x00aaff })
);
scene.add(planet);

// Light
scene.add(new THREE.AmbientLight(0xffffff));

// Position camera
camera.position.z = 3;

function animate(time) {
  requestAnimationFrame(animate);
  control.update();
  const t = time / 1000; // time in seconds
  const radius = 1.5;
  planet.position.x = radius * Math.cos(t);
  planet.position.z = radius * Math.sin(t); // circular orbit in XZ plane
  renderer.render(scene, camera);
}
animate();

// ===========================
// D3 ORBIT STORIES: Camille's Code 
// ===========================

// Load the exoplanet CSV and render 3 story-based systems
d3.csv("exoplanet.csv").then(data => {
  // Story 1: KOI-351 (First large multi-planet system)
  const koi351 = data.filter(d => d.hostname === "KOI-351");
  renderSystem("container-system1", koi351);

 // System 2: TBD (e.g. most eccentric planet system)
  const system2 = data.filter(d => d.hostname === "TOI-178");  // just a placeholder
  renderSystem("container-system2", system2);

  // System 3: TBD (e.g. closest match to Earth)
  const system3 = data.filter(d => d.hostname === "GJ 667 C");  // placeholder
  renderSystem("container-system3", system3)});