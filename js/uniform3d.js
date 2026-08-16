import * as THREE from "three";
import { OrbitControls } from "./vendor/three/examples/jsm/controls/OrbitControls.js";

/**
 * Renders a lightweight rotatable "3D jersey" — two curved panels (front/back)
 * built from real ACAP artwork, plus simple sleeve/collar geometry.
 * Not a tailored garment mesh (no paid/scanned 3D asset used) — a free,
 * self-built approximation good enough for an interactive product preview.
 */
export function initUniform3D(container, { front, back, trimColor = 0x0c0c0c }) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
  camera.position.set(0, 0.05, 4.6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2.4;
  controls.minPolarAngle = Math.PI / 2 - 0.35;
  controls.maxPolarAngle = Math.PI / 2 + 0.35;
  controls.addEventListener("start", () => (controls.autoRotate = false));

  const group = new THREE.Group();
  scene.add(group);

  const loader = new THREE.TextureLoader();
  const frontTex = loader.load(front);
  const backTex = loader.load(back);
  frontTex.colorSpace = THREE.SRGBColorSpace;
  backTex.colorSpace = THREE.SRGBColorSpace;

  const radius = 1.05;
  const torsoHeight = 2.5;
  const arc = Math.PI * 0.72;

  const frontGeo = new THREE.CylinderGeometry(radius, radius, torsoHeight, 48, 1, true, -arc / 2, arc);
  const frontMat = new THREE.MeshBasicMaterial({ map: frontTex, transparent: true, side: THREE.FrontSide });
  group.add(new THREE.Mesh(frontGeo, frontMat));

  const backGeo = new THREE.CylinderGeometry(radius, radius, torsoHeight, 48, 1, true, Math.PI - arc / 2, arc);
  const backMat = new THREE.MeshBasicMaterial({ map: backTex, transparent: true, side: THREE.FrontSide });
  group.add(new THREE.Mesh(backGeo, backMat));

  // side "seams" — plain curved strips that continue the torso surface through
  // the gap between front/back photos, no caps/discs so nothing juts out at 90°/270°
  const trimMat = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.8, side: THREE.DoubleSide });
  const gapLength = Math.PI - arc;

  [arc / 2, Math.PI + arc / 2].forEach((thetaStart) => {
    const seam = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, torsoHeight, 16, 1, true, thetaStart, gapLength),
      trimMat
    );
    group.add(seam);
  });

  // small collar ring at the neckline
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.045, 10, 32), trimMat);
  collar.position.set(0, torsoHeight / 2 - 0.02, 0);
  collar.rotation.x = Math.PI / 2;
  group.add(collar);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 0.7);
  key.position.set(2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x00b34d, 0.6);
  rim.position.set(-3, 1, -3);
  scene.add(rim);

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);

  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();

  return { scene, renderer, camera, group, controls };
}

document.querySelectorAll("[data-uniform3d]").forEach((el) => {
  el.__uniform3d = initUniform3D(el, {
    front: el.dataset.front,
    back: el.dataset.back,
    trimColor: el.dataset.trim ? parseInt(el.dataset.trim, 16) : 0x0c0c0c,
  });
});
