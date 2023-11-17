import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Objects
const torusGeometry = new THREE.TorusKnotGeometry(0.5, 0.2, 100, 50);
const particlesGeometry = new THREE.BufferGeometry();
const particlesCnt = 0;

const posArray = new Float32Array(particlesCnt * 3);

// xyz
for (let i = 0; i < particlesCnt * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 5;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const material = new THREE.PointsMaterial({
  size: 0.005,
  vertexColors: true, // Enable vertex colors
});

// Set up a color gradient from bright purple to dark purple
const colorStart = new THREE.Color('#FF00FF');
const colorEnd = new THREE.Color('#D013F4'); 

const colors = [];

for (let i = 0; i < torusGeometry.attributes.position.count; i++) {
  // Calculate the progress of the loop as a percentage
  const progress = i / torusGeometry.attributes.position.count;

  // Interpolate the color between colorStart and colorEnd based on the progress
  const color = new THREE.Color().copy(colorStart).lerp(colorEnd, progress);

  // Push the color for each vertex
  colors.push(color.r, color.g, color.b);
}

torusGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

// Mesh
const torus = new THREE.Points(torusGeometry, material);
const particleMesh = new THREE.Points(particlesGeometry, material);
scene.add(torus, particleMesh);

// Lights
const pointLight = new THREE.PointLight(0xffffff, 0.1);
pointLight.position.x = 300;
pointLight.position.y = 600;
pointLight.position.z = 100;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Mouse move event listener
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / sizes.width) * 2 - 1;
  mouseY = -(event.clientY / sizes.height) * 2 + 1;
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 1000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 5));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  torus.rotation.z = 0* elapsedTime;

  // Distort torus geometry and sphere based on mouse position
  distortGeometry();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

/**
 * Distort torus geometry based on mouse position
 */
function distortGeometry() {
  const time = performance.now() * 0.005;
  const positionAttribute = torusGeometry.getAttribute('position');

  for (let i = 0; i < positionAttribute.count; i++) {
    const vertex = new THREE.Vector3(); // Create a temporary vertex
    vertex.fromBufferAttribute(positionAttribute, i);

    const distance = new THREE.Vector2(vertex.x, vertex.y).distanceTo(new THREE.Vector2(mouseX, mouseY));
    const amplitude = 0.4; // Adjust this value to control the distortion strength

    // Distort only when mouse is over
    const displacement = Math.sin(5 * distance - time) * amplitude;
    vertex.z = displacement;

    // Update the buffer attribute with the modified vertex
    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  // Ensure the attribute is updated
  positionAttribute.needsUpdate = true;
}

// Reset geometry function
function resetGeometry() {
  const positionAttribute = torusGeometry.getAttribute('position');

  for (let i = 0; i < positionAttribute.count; i++) {
    const vertex = new THREE.Vector3(); // Create a temporary vertex
    vertex.fromBufferAttribute(positionAttribute, i);

    // Reset the z-coordinate to 0
    vertex.z = 0;

    // Update the buffer attribute with the modified vertex
    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  // Ensure the attribute is updated
  positionAttribute.needsUpdate = true;
}

// Event listener for mouse leave to reset geometry
canvas.addEventListener('mouseleave', () => {
  resetGeometry();
});
