import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ResumeCanvas({ isAnalyzing = false, score = null }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const requestRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;

    // Create Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050507, 0.08);

    // Create Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 11;

    // Create Renderer with transparency & antialias
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Group to hold all 3D objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // -- Create floating document model --
    const docWidth = 4;
    const docHeight = 5.5;

    // 1. Outer Border Wireframe
    const borderGeometry = new THREE.BoxGeometry(docWidth, docHeight, 0.1);
    const borderEdges = new THREE.EdgesGeometry(borderGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0x0071e3,
      transparent: true,
      opacity: 0.7,
      linewidth: 2
    });
    const docBorder = new THREE.LineSegments(borderEdges, borderMaterial);
    mainGroup.add(docBorder);

    // 2. Data Text Lines
    const lineGroup = new THREE.Group();
    const lineCount = 18;
    const lineMaterials = [];
    const lineMeshes = [];

    for (let i = 0; i < lineCount; i++) {
      const lineWidth = (Math.random() * 1.5 + 1.2);
      const lineY = docHeight / 2 - 0.5 - (i * 0.28);
      const startX = -docWidth / 2 + 0.4;

      const points = [];
      points.push(new THREE.Vector3(startX, lineY, 0));
      points.push(new THREE.Vector3(startX + lineWidth, lineY, 0));

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const colorVal = i % 3 === 0 ? 0x2997ff : (i % 3 === 1 ? 0xa100ff : 0x06b6d4);
      const lineMat = new THREE.LineBasicMaterial({
        color: colorVal,
        transparent: true,
        opacity: 0.8,
        linewidth: 3
      });

      const lineMesh = new THREE.Line(lineGeo, lineMat);
      lineGroup.add(lineMesh);
      lineMaterials.push(lineMat);
      lineMeshes.push(lineMesh);
    }
    mainGroup.add(lineGroup);

    // 3. Document Content Particles
    const particleCount = 300;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const px = (Math.random() - 0.5) * (docWidth - 0.2);
      const py = (Math.random() - 0.5) * (docHeight - 0.2);
      const pz = (Math.random() - 0.5) * 0.08;

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      originalPositions[i * 3] = px;
      originalPositions[i * 3 + 1] = py;
      originalPositions[i * 3 + 2] = pz;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.22,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particles);

    // 4. Background Space Dust / Starfield
    const starCount = 600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 50;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 15;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.25,
      map: particleTexture,
      blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 5. Tech Stack Constellation Nodes (Orbital spheres)
    const nodeCount = 5;
    const nodeGroup = new THREE.Group();
    const nodeGeos = [];
    const nodeMats = [];
    const nodeMeshes = [];
    const nodeSpeeds = [0.4, -0.6, 0.5, -0.3, 0.7];
    const nodeRadii = [3.2, 3.8, 4.2, 3.5, 4.5];
    const nodeColors = [0x2997ff, 0xa100ff, 0x06b6d4, 0xf43f5e, 0x10b981];

    for (let i = 0; i < nodeCount; i++) {
      const geo = new THREE.SphereGeometry(0.18, 16, 16);
      const mat = new THREE.MeshPhongMaterial({
        color: nodeColors[i],
        emissive: nodeColors[i],
        emissiveIntensity: 0.8,
        shininess: 100
      });
      const mesh = new THREE.Mesh(geo, mat);
      nodeGroup.add(mesh);
      nodeGeos.push(geo);
      nodeMats.push(mat);
      nodeMeshes.push(mesh);
    }
    mainGroup.add(nodeGroup);

    // 6. Laser Scanner Plane
    const scanPlaneGeo = new THREE.BoxGeometry(docWidth + 0.8, 0.1, 0.6);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.visible = false;
    mainGroup.add(scanPlane);

    // -- Lights --
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x0071e3, 1.8);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa100ff, 1.5);
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    // -- Mouse Event Handling --
    const handleMouseMove = (event) => {
      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      mouseRef.current.targetX = ((x / width) - 0.5) * 0.9;
      mouseRef.current.targetY = ((y / height) - 0.5) * 0.9;
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);

    // -- Scroll Event Handling (Scroll-driven interpolation) --
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      scrollRef.current = window.scrollY / scrollHeight;
    };

    window.addEventListener('scroll', handleScroll);

    // Window Resize Handling
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // -- Animation Loop Variables --
    let scanDirection = 1;
    let scanY = 0;
    let globalTime = 0;

    // -- Animation Loop --
    const animate = () => {
      globalTime += 0.01;

      // Mouse Lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // Rotate star dust
      stars.rotation.y = globalTime * 0.015;
      stars.rotation.x = globalTime * 0.005;

      // Scroll-driven transforms
      const t = scrollRef.current; // Scroll progress (0 to 1)
      
      // Interpolated values for position, scale, and rotations
      // Scroll = 0: Center stage (0, 0, 0), Scale 1.0, perspective camera z=11
      // Scroll = 1: Flies out to the background, scales down, shifts right/left
      const targetPosX = THREE.MathUtils.lerp(0, 2.5, Math.min(t * 2, 1));
      const targetPosY = THREE.MathUtils.lerp(0, -1.2, Math.min(t * 2, 1));
      const targetPosZ = THREE.MathUtils.lerp(0, -3.5, Math.min(t * 2, 1));
      const targetScale = THREE.MathUtils.lerp(1.1, 0.65, Math.min(t * 2, 1));
      const targetRotX = THREE.MathUtils.lerp(0, 0.4, Math.min(t * 2, 1));
      
      mainGroup.position.x += (targetPosX - mainGroup.position.x) * 0.06;
      mainGroup.position.y += (targetPosY - mainGroup.position.y) * 0.06;
      mainGroup.position.z += (targetPosZ - mainGroup.position.z) * 0.06;
      
      const nextScale = mainGroup.scale.x + (targetScale - mainGroup.scale.x) * 0.06;
      mainGroup.scale.set(nextScale, nextScale, nextScale);

      // Rotate nodes around resume
      for (let i = 0; i < nodeCount; i++) {
        const orbitAngle = globalTime * nodeSpeeds[i] + i;
        const radius = nodeRadii[i];
        nodeMeshes[i].position.x = Math.sin(orbitAngle) * radius;
        nodeMeshes[i].position.y = Math.cos(orbitAngle * 0.8) * (radius * 0.4);
        nodeMeshes[i].position.z = Math.cos(orbitAngle) * radius;
      }

      // Rotate main document based on time + mouse
      mainGroup.rotation.y = mouseRef.current.x + globalTime * 0.12;
      mainGroup.rotation.x = mouseRef.current.y + targetRotX + Math.sin(globalTime * 0.3) * 0.04;

      // Scanning Logic
      if (isAnalyzing) {
        scanPlane.visible = true;
        scanY += 0.055 * scanDirection;
        if (Math.abs(scanY) > docHeight / 2) {
          scanDirection *= -1;
        }
        scanPlane.position.y = scanY;

        scanPlaneMat.color.setHex(Math.sin(globalTime * 12) > 0 ? 0xf43f5e : 0x06b6d4);
        scanPlaneMat.opacity = 0.6 + Math.sin(globalTime * 24) * 0.2;

        // Animate particles during scanning
        const posArr = particleGeometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          const distToLaser = Math.abs(posArr[idx + 1] - scanY);
          if (distToLaser < 0.5) {
            posArr[idx + 2] = originalPositions[idx + 2] + (Math.random() - 0.5) * 1.0;
          } else {
            posArr[idx + 2] += (originalPositions[idx + 2] - posArr[idx + 2]) * 0.08;
          }
        }
        particleGeometry.attributes.position.needsUpdate = true;
        
        mainGroup.rotation.y += globalTime * 0.35;
        borderMaterial.color.setHex(0xf43f5e); // Neon Red/Magenta scan mode
      } else {
        scanPlane.visible = false;
        
        // Float particles naturally
        const posArr = particleGeometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          posArr[idx] = originalPositions[idx] + Math.sin(globalTime * 0.6 + i) * 0.08;
          posArr[idx + 1] = originalPositions[idx + 1] + Math.cos(globalTime * 0.4 + i) * 0.08;
          posArr[idx + 2] = originalPositions[idx + 2] + Math.sin(globalTime * 1.2 + i) * 0.03;
        }
        particleGeometry.attributes.position.needsUpdate = true;
        
        // Color feedback based on score
        if (score && score >= 80) {
          borderMaterial.color.setHex(0x10b981); // Emerald green success
          particleMaterial.color.setHex(0x10b981);
        } else if (score && score < 80) {
          borderMaterial.color.setHex(0xf59e0b); // Amber medium
          particleMaterial.color.setHex(0xf59e0b);
        } else {
          borderMaterial.color.setHex(0x0071e3); // Apple blue
          particleMaterial.color.setHex(0x06b6d4);
        }
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      borderGeometry.dispose();
      borderEdges.dispose();
      borderMaterial.dispose();
      scanPlaneGeo.dispose();
      scanPlaneMat.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      
      nodeGeos.forEach(g => g.dispose());
      nodeMats.forEach(m => m.dispose());
      lineMaterials.forEach(m => m.dispose());
      lineMeshes.forEach(l => l.geometry.dispose());
      
      renderer.dispose();
    };
  }, [isAnalyzing, score]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        cursor: 'grab' 
      }} 
    />
  );
}
