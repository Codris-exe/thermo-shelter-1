"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";

export default function Hero3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.2, 7.5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Group to hold all rotating elements
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Passive Solar Shelter Module (Custom Geometry)
    const shelterGroup = new THREE.Group();
    mainGroup.add(shelterGroup);

    // Main wedge envelope body
    const bodyShape = new THREE.Shape();
    // Profile of high-altitude sloped passive shelter
    bodyShape.moveTo(-1.6, -0.7);
    bodyShape.lineTo(1.6, -0.7);
    bodyShape.lineTo(1.4, 0.2);
    bodyShape.lineTo(-0.8, 1.1);
    bodyShape.lineTo(-1.6, 0.4);
    bodyShape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 2.2,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 3,
    };

    const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    bodyGeometry.center();

    // Semi-transparent frosted aerodynamic shell
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x0f1b2e : 0xe2e8f0,
      metalness: 0.2,
      roughness: 0.35,
      transmission: 0.4,
      transparent: true,
      opacity: isDark ? 0.75 : 0.85,
      wireframe: false,
    });
    const shelterMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    shelterGroup.add(shelterMesh);

    // Crisp high-tech wireframe edges
    const edgesGeometry = new THREE.EdgesGeometry(bodyGeometry, 22);
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: isDark ? 0x38bdf8 : 0x0284c7,
      transparent: true,
      opacity: isDark ? 0.85 : 0.7,
      linewidth: 1.5,
    });
    const wireframe = new THREE.LineSegments(edgesGeometry, wireframeMaterial);
    shelterGroup.add(wireframe);

    // 2. Solar Glazed Aperture (Facing South)
    const solarGlassGeo = new THREE.PlaneGeometry(2.4, 1.1);
    const solarGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: isDark ? 0.45 : 0.25,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      side: THREE.DoubleSide,
    });
    const solarGlass = new THREE.Mesh(solarGlassGeo, solarGlassMat);
    solarGlass.position.set(0.1, -0.05, 1.16);
    solarGlass.rotation.x = -0.15;
    shelterGroup.add(solarGlass);

    // Inner Glowing Thermal Storage Core (PPCM matrix)
    const coreGeo = new THREE.BoxGeometry(1.2, 0.7, 1.4);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      transparent: true,
      opacity: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, -0.15, 0);
    shelterGroup.add(coreMesh);

    // Core wireframe cage
    const coreEdges = new THREE.EdgesGeometry(coreGeo);
    const coreEdgesMat = new THREE.LineBasicMaterial({
      color: 0xffedd5,
      transparent: true,
      opacity: 0.9,
    });
    const coreWireframe = new THREE.LineSegments(coreEdges, coreEdgesMat);
    coreMesh.add(coreWireframe);

    // 3. Gyroscopic CAD / Altitude Coordinate Rings
    const ringMat1 = new THREE.LineBasicMaterial({
      color: isDark ? 0x0ea5e9 : 0x0284c7,
      transparent: true,
      opacity: isDark ? 0.4 : 0.35,
    });
    const ringMat2 = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: isDark ? 0.35 : 0.3,
    });

    const createDashedRing = (radius: number) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(80);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      return geom;
    };

    const ring1 = new THREE.LineLoop(createDashedRing(2.8), ringMat1);
    ring1.rotation.x = Math.PI / 2.5;
    mainGroup.add(ring1);

    const ring2 = new THREE.LineLoop(createDashedRing(3.2), ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    mainGroup.add(ring2);

    // 4. Floating Atmospheric & Solar Energy Particles
    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);

    const colorCold = new THREE.Color(isDark ? 0x7dd3fc : 0x0284c7);
    const colorWarm = new THREE.Color(0xf59e0b);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Distribute in a spherical cloud around the shelter
      const r = 1.8 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[idx] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[idx + 2] = r * Math.cos(phi);

      particleSpeeds[i] = 0.2 + Math.random() * 0.8;

      const isSolar = Math.random() > 0.45;
      const c = isSolar ? colorWarm : colorCold;
      particleColors[idx] = c.r;
      particleColors[idx + 1] = c.g;
      particleColors[idx + 2] = c.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.75 : 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particleSystem);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.8 : 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, isDark ? 2.2 : 2.6);
    sunLight.position.set(5, 6, 4);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, isDark ? 1.5 : 1.0);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    // Interactive mouse tracking with smooth lerp
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = x;
      mouse.targetY = y;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Initial orientation for cinematic perspective
    shelterGroup.rotation.y = -0.45;
    shelterGroup.rotation.x = 0.2;

    let clock = new THREE.Clock();

    // Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Rotate group with mouse parallax and continuous ambient rotation
      mainGroup.rotation.y = elapsedTime * 0.12 + mouse.x * 0.55;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.08 - mouse.y * 0.35;

      // Gyro rings counter-rotation
      ring1.rotation.z = elapsedTime * 0.15;
      ring2.rotation.z = -elapsedTime * 0.18;

      // Floating bobbing motion
      shelterGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.09;

      // Thermal core pulse
      const pulse = 0.6 + Math.sin(elapsedTime * 2.5) * 0.3;
      coreMat.emissiveIntensity = pulse;

      // Slowly swirl particles
      const positions = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        positions[idx + 1] += Math.sin(elapsedTime + i) * 0.002;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      bodyGeometry.dispose();
      bodyMaterial.dispose();
      edgesGeometry.dispose();
      wireframeMaterial.dispose();
      solarGlassGeo.dispose();
      solarGlassMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      coreEdges.dispose();
      coreEdgesMat.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 pointer-events-none w-full h-full"
      style={{ overflow: "hidden" }}
      aria-hidden="true"
    />
  );
}
