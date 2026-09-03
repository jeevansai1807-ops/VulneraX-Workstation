import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 3D Cyber Sentinel Orb Mascot Component
 * Inspired by the luminous, iridescent gradient orb with glowing chevron eyes.
 * Size presets: 'hero' (large 3D canvas), 'large', 'medium' (dashboard widget), 
 *               'compact' (card size), 'avatar' (mini icon).
 */
export default function CyberOrb3D({
  size = 'hero',
  isScanning = false,
  status = 'idle',
  interactive = true,
  className = '',
  showRings = true,
  onClick = null,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    isScanning,
    status,
    mouseX: 0,
    mouseY: 0,
    targetRotX: 0,
    targetRotY: 0,
    isHovered: false,
    blinkProgress: 0,
    isBlinking: false,
    nextBlinkTime: Date.now() + 2500,
  });

  // Keep stateRef in sync with props
  useEffect(() => {
    stateRef.current.isScanning = isScanning;
    stateRef.current.status = status;
  }, [isScanning, status]);

  // Dimension settings based on size preset with generous camera bounds
  const dimensions = {
    hero: { width: 400, height: 400, sphereRadius: 1.25, cameraZ: 4.3 },
    large: { width: 320, height: 320, sphereRadius: 1.1, cameraZ: 4.1 },
    medium: { width: 200, height: 200, sphereRadius: 1.05, cameraZ: 3.9 },
    compact: { width: 130, height: 130, sphereRadius: 1.0, cameraZ: 3.8 },
    avatar: { width: 44, height: 44, sphereRadius: 1.0, cameraZ: 3.6 },
  }[size] || { width: 220, height: 220, sphereRadius: 1.1, cameraZ: 4.0 };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      dimensions.width / dimensions.height,
      0.1,
      1000
    );
    camera.position.z = dimensions.cameraZ;

    // 2. WebGL Renderer with alpha and antialiasing
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(dimensions.width, dimensions.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      mount.appendChild(renderer.domElement);
    } catch (e) {
      // Fallback for headless environments without WebGL
      return;
    }

    // 3. Texture for the Chevron / Triangle Glowing Eyes
    const createEyeTexture = (blinkRatio = 0) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 512, 512);

      const scaleY = Math.max(0.08, 1 - blinkRatio * 0.92);

      const drawChevron = (cx, cy) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, scaleY);

        ctx.shadowColor = 'rgba(255, 120, 220, 0.95)';
        ctx.shadowBlur = 30;

        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.quadraticCurveTo(24, 0, 28, 22);
        ctx.quadraticCurveTo(0, 10, -28, 22);
        ctx.quadraticCurveTo(-24, 0, 0, -32);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, -32, 0, 24);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.7, '#ffffff');
        grad.addColorStop(1, '#ffe4f3');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
      };

      drawChevron(185, 230);
      drawChevron(327, 230);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    let eyeTexture = createEyeTexture(0);

    // 4. Custom Gradient Sphere Shader Material
    const customOrbShader = {
      uniforms: {
        time: { value: 0.0 },
        isScanning: { value: 0.0 },
        colorTop: { value: new THREE.Color(0xf43f5e) },
        colorMagenta: { value: new THREE.Color(0xd946ef) },
        colorPurple: { value: new THREE.Color(0x8b5cf6) },
        colorIndigo: { value: new THREE.Color(0x6366f1) },
        colorCoral: { value: new THREE.Color(0xfb923c) },
        colorWhiteRim: { value: new THREE.Color(0xffffff) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        uniform float time;
        uniform float isScanning;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          
          vec3 pos = position;
          float breath = sin(time * 2.0 + position.y * 2.0) * 0.02;
          if (isScanning > 0.5) {
            breath += sin(time * 8.0 + position.x * 5.0) * 0.035;
          }
          pos += normal * breath;
          
          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float isScanning;
        uniform vec3 colorTop;
        uniform vec3 colorMagenta;
        uniform vec3 colorPurple;
        uniform vec3 colorIndigo;
        uniform vec3 colorCoral;
        uniform vec3 colorWhiteRim;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(-vPosition);

          float yGrad = vUv.y;
          float xGrad = vUv.x;

          vec3 baseColor = mix(colorCoral, colorMagenta, smoothstep(0.1, 0.65, yGrad + xGrad * 0.3));
          baseColor = mix(baseColor, colorPurple, smoothstep(0.4, 0.9, xGrad - yGrad * 0.2 + 0.4));
          baseColor = mix(baseColor, colorTop, smoothstep(0.55, 1.0, yGrad));

          vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
          float diff = max(dot(normal, lightDir), 0.0);
          vec3 halfVector = normalize(lightDir + viewDir);
          float spec = pow(max(dot(normal, halfVector), 0.0), 32.0);

          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.2);
          vec3 rimColor = mix(colorWhiteRim, colorMagenta, 0.35);

          vec3 finalColor = baseColor * (0.85 + diff * 0.35) + (rimColor * fresnel * 1.3) + (vec3(1.0) * spec * 0.4);

          if (isScanning > 0.5) {
            float scanWave = sin(vUv.y * 20.0 - time * 10.0) * 0.5 + 0.5;
            finalColor += vec3(0.3, 0.1, 0.4) * scanWave;
          }

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    };

    const orbGeo = new THREE.SphereGeometry(dimensions.sphereRadius, 64, 64);
    const orbMat = new THREE.ShaderMaterial({
      ...customOrbShader,
      transparent: false,
    });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orbMesh);

    // 5. Eye Mesh Layer
    const eyeGeo = new THREE.SphereGeometry(dimensions.sphereRadius * 1.008, 64, 64);
    const eyeMat = new THREE.MeshBasicMaterial({
      map: eyeTexture,
      transparent: true,
      opacity: 0.98,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    scene.add(eyeMesh);

    // 6. Holographic Orbital Scanning Rings
    let ringMesh1, ringMesh2;
    if (showRings && size !== 'avatar') {
      const ringGeo1 = new THREE.TorusGeometry(dimensions.sphereRadius * 1.42, 0.02, 16, 100);
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
      });
      ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
      ringMesh1.rotation.x = Math.PI / 3;
      scene.add(ringMesh1);

      const ringGeo2 = new THREE.TorusGeometry(dimensions.sphereRadius * 1.55, 0.015, 16, 100);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      });
      ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
      ringMesh2.rotation.x = -Math.PI / 4;
      ringMesh2.rotation.y = Math.PI / 6;
      scene.add(ringMesh2);
    }

    // 7. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pinkLight = new THREE.PointLight(0xf43f5e, 2, 10);
    pinkLight.position.set(3, 3, 4);
    scene.add(pinkLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 2, 10);
    violetLight.position.set(-3, -2, 3);
    scene.add(violetLight);

    // 8. Pointer / Mouse Interaction
    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.mouseX = x;
      stateRef.current.mouseY = y;
      stateRef.current.targetRotY = x * 0.45;
      stateRef.current.targetRotX = -y * 0.35;
    };

    const handleMouseEnter = () => {
      stateRef.current.isHovered = true;
    };

    const handleMouseLeave = () => {
      stateRef.current.isHovered = false;
      stateRef.current.targetRotX = 0;
      stateRef.current.targetRotY = 0;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      mount.addEventListener('mouseenter', handleMouseEnter);
      mount.addEventListener('mouseleave', handleMouseLeave);
    }

    // 9. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const st = stateRef.current;

      orbMat.uniforms.time.value = elapsedTime;
      orbMat.uniforms.isScanning.value = st.isScanning ? 1.0 : 0.0;

      // Eye Blinking Animation Controller
      const now = Date.now();
      if (!st.isBlinking && now > st.nextBlinkTime) {
        st.isBlinking = true;
        st.blinkProgress = 0;
      }

      if (st.isBlinking) {
        st.blinkProgress += 0.12;
        if (st.blinkProgress >= Math.PI) {
          st.isBlinking = false;
          st.blinkProgress = 0;
          st.nextBlinkTime = now + 2500 + Math.random() * 3500;
          eyeTexture.dispose();
          eyeTexture = createEyeTexture(0);
          eyeMat.map = eyeTexture;
        } else {
          const blinkRatio = Math.sin(st.blinkProgress);
          eyeTexture.dispose();
          eyeTexture = createEyeTexture(blinkRatio);
          eyeMat.map = eyeTexture;
        }
      }

      // Smooth Orb Rotation & Pointer Tracking
      const rotSpeed = st.isScanning ? 0.08 : 0.05;
      orbMesh.rotation.y += (st.targetRotY - orbMesh.rotation.y) * rotSpeed;
      orbMesh.rotation.x += (st.targetRotX - orbMesh.rotation.x) * rotSpeed;

      eyeMesh.rotation.copy(orbMesh.rotation);

      // Smooth floating bobbing movement
      const bobFreq = st.isScanning ? 3.5 : 1.8;
      const bobAmp = st.isScanning ? 0.12 : 0.06;
      orbMesh.position.y = Math.sin(elapsedTime * bobFreq) * bobAmp;
      eyeMesh.position.y = orbMesh.position.y;

      // Rotate orbital rings
      if (ringMesh1) {
        const ringSpeed1 = st.isScanning ? 2.5 : 0.5;
        ringMesh1.rotation.z += 0.01 * ringSpeed1;
        ringMesh1.rotation.y += 0.005 * ringSpeed1;
        ringMesh1.position.y = orbMesh.position.y;
        ringMesh1.material.opacity = st.isScanning ? 0.8 : (st.isHovered ? 0.6 : 0.35);
      }

      if (ringMesh2) {
        const ringSpeed2 = st.isScanning ? -2.0 : -0.4;
        ringMesh2.rotation.z += 0.008 * ringSpeed2;
        ringMesh2.rotation.x += 0.006 * ringSpeed2;
        ringMesh2.position.y = orbMesh.position.y;
        ringMesh2.material.opacity = st.isScanning ? 0.7 : (st.isHovered ? 0.5 : 0.25);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        mount.removeEventListener('mouseenter', handleMouseEnter);
        mount.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      orbGeo.dispose();
      orbMat.dispose();
      eyeGeo.dispose();
      eyeMat.dispose();
      eyeTexture.dispose();
    };
  }, [size, dimensions.width, dimensions.height, dimensions.sphereRadius, dimensions.cameraZ, interactive, showRings]);

  return (
    <div
      ref={mountRef}
      onClick={onClick}
      className={`relative flex items-center justify-center select-none cursor-pointer transition-transform duration-300 ${
        isScanning ? 'scale-105 filter drop-shadow-[0_0_35px_rgba(244,63,94,0.6)]' : 'hover:scale-105 filter drop-shadow-[0_0_25px_rgba(236,72,153,0.35)]'
      } ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    />
  );
}
