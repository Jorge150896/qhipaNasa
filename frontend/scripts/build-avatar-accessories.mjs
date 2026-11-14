import { writeFile } from 'node:fs/promises';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    void blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend();
    });
  }
};

const materials = Object.fromEntries(
  Object.entries({ dark: '#212529', light: '#E9ECEF', purple: '#8338EC', orange: '#FB5607' }).map(
    ([name, color]) => [name, new THREE.MeshStandardMaterial({ name, color, roughness: 0.7 })],
  ),
);
materials.signal = new THREE.MeshStandardMaterial({
  name: 'Señal naranja',
  color: '#FB5607',
  emissive: '#FB5607',
  emissiveIntensity: 0.36,
  roughness: 0.45,
});

function add(parent, geometry, color, position, scale = [1, 1, 1], zRotation = 0) {
  const mesh = new THREE.Mesh(geometry, materials[color]);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.z = zRotation;
  parent.add(mesh);
  return mesh;
}
const sphere = new THREE.SphereGeometry(1, 24, 16);
const cylinder = (radius, height) => new THREE.CylinderGeometry(radius, radius, height, 32);
const panel = (width, height, depth) => new RoundedBoxGeometry(width, height, depth, 2, 0.012);
const cone = (top, bottom, height) => new THREE.CylinderGeometry(top, bottom, height, 24);
const torus = (radius, tube) => new THREE.TorusGeometry(radius, tube, 10, 32);

const beacon = new THREE.Group();
add(beacon, cylinder(0.065, 0.18), 'dark', [0, 0, 0]);
add(beacon, cylinder(0.071, 0.053), 'signal', [0, 0.018, 0]);
add(beacon, cone(0.028, 0.071, 0.055), 'light', [0, 0.098, 0]);
add(beacon, cylinder(0.007, 0.068), 'light', [0, 0.15, 0]);
add(beacon, sphere, 'signal', [0, 0.19, 0], [0.013, 0.013, 0.013]);
add(beacon, torus(0.105, 0.012), 'purple', [0, -0.073, 0]).rotation.x = Math.PI / 2;
for (const side of [-1, 1]) {
  add(beacon, panel(0.056, 0.025, 0.065), 'light', [side * 0.088, -0.074, 0]);
}

const pack = new THREE.Group();
add(pack, panel(0.29, 0.33, 0.16), 'dark', [0, 0, 0.13]);
add(pack, panel(0.216, 0.11, 0.038), 'purple', [0, 0.087, 0.217]);
for (const y of [-0.024, -0.055, -0.086]) {
  add(pack, panel(0.145, 0.012, 0.02), 'light', [0, y, 0.218]);
}
for (const side of [-1, 1]) {
  add(pack, cylinder(0.057, 0.248), 'light', [side * 0.173, 0.003, 0.135]);
  add(pack, cylinder(0.059, 0.038), 'purple', [side * 0.173, 0.067, 0.135]);
  add(pack, cone(0.042, 0.067, 0.06), 'dark', [side * 0.173, -0.138, 0.135]);
  add(pack, cylinder(0.045, 0.009), 'signal', [side * 0.173, -0.171, 0.135]);
}
add(pack, panel(0.064, 0.014, 0.014), 'signal', [0, 0.086, 0.244]);

const probe = new THREE.Group();
add(probe, sphere, 'light', [0, 0, 0], [0.132, 0.099, 0.122]);
add(probe, sphere, 'dark', [0, 0.015, 0.111], [0.075, 0.055, 0.034]);
add(probe, torus(0.037, 0.008), 'purple', [0, 0.018, 0.143]);
add(probe, sphere, 'light', [0, 0.018, 0.149], [0.024, 0.024, 0.013]);
for (const side of [-1, 1]) {
  add(probe, panel(0.069, 0.027, 0.052), 'purple', [side * 0.138, 0, 0]);
  add(probe, cylinder(0.037, 0.066), 'dark', [side * 0.176, -0.008, 0]);
  add(probe, cylinder(0.031, 0.011), 'signal', [side * 0.176, -0.046, 0]);
}
add(probe, cone(0.007, 0.012, 0.083), 'dark', [0.023, 0.11, -0.046], [1, 1, 1], -0.21);

const badge = new THREE.Group();
add(badge, sphere, 'orange', [0, 0, 0], [0.071, 0.071, 0.02]);
add(badge, torus(0.049, 0.008), 'light', [0, 0, 0.018]);
add(badge, sphere, 'purple', [0, 0, 0.027], [0.028, 0.028, 0.012]);

const torch = new THREE.Group();
add(torch, cylinder(0.057, 0.153), 'dark', [0, -0.025, 0]);
add(torch, cylinder(0.072, 0.064), 'purple', [0, -0.123, 0]);
add(torch, cylinder(0.062, 0.012), 'light', [0, -0.161, 0]);
add(torch, cylinder(0.059, 0.017), 'orange', [0, -0.081, 0]);
add(torch, new THREE.BoxGeometry(0.034, 0.042, 0.035), 'orange', [0, 0.005, 0.05]);

const scanner = new THREE.Group();
add(scanner, cylinder(0.036, 0.14), 'dark', [0, -0.03, 0]);
add(scanner, panel(0.137, 0.105, 0.058), 'purple', [0, -0.126, 0]);
add(scanner, panel(0.088, 0.049, 0.016), 'dark', [0, -0.129, 0.034]);
add(scanner, sphere, 'signal', [0.046, -0.094, 0.035], [0.009, 0.009, 0.009]);

for (const x of [-0.026, -0.009, 0.008]) {
  add(scanner, panel(0.008, 0.025, 0.007), 'light', [x, -0.13, 0.044]);
}

const exporter = new GLTFExporter();
for (const [name, model] of Object.entries({ probe, badge, beacon, pack, torch, scanner })) {
  const buffer = await exporter.parseAsync(model, { binary: true });
  await writeFile(
    new URL(`../public/models/avatar/${name}.glb`, import.meta.url),
    new Uint8Array(buffer),
  );
}
