'use client';

import * as THREE from 'three';

// Shared materials for the entire experience
export const createMaterials = () => {
    // Architectural monolith material - dark obsidian
    const monolithMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1d,
        roughness: 0.3,
        metalness: 0.8,
        envMapIntensity: 0.5,
    });

    // Glass/translucent material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x888899,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.9,
        thickness: 0.5,
        envMapIntensity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
    });

    // Accent gold material
    const accentMaterial = new THREE.MeshStandardMaterial({
        color: 0xc9a962,
        roughness: 0.2,
        metalness: 0.9,
        emissive: 0xc9a962,
        emissiveIntensity: 0.1,
    });

    // Ground plane material
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0b,
        roughness: 0.9,
        metalness: 0.1,
    });

    // Fog volume shader material
    const fogMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0x0a0a0b) },
            uDensity: { value: 0.3 },
        },
        vertexShader: `
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
        fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uDensity;
      
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      
      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }
      
      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        return mix(
          mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
          f.z
        );
      }
      
      void main() {
        vec3 animPos = vWorldPosition + vec3(uTime * 0.1, 0.0, uTime * 0.05);
        float n = noise(animPos * 0.05);
        
        float heightFade = 1.0 - smoothstep(-5.0, 20.0, vWorldPosition.y);
        float alpha = n * uDensity * heightFade;
        
        gl_FragColor = vec4(uColor, alpha * 0.3);
      }
    `,
    });

    // Particle material for revenue streams
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xc9a962,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    return {
        monolith: monolithMaterial,
        glass: glassMaterial,
        accent: accentMaterial,
        ground: groundMaterial,
        fog: fogMaterial,
        particle: particleMaterial,
    };
};

// Create a monolithic building with architectural details
export const createMonolith = (
    width: number,
    height: number,
    depth: number,
    materials: ReturnType<typeof createMaterials>
): THREE.Group => {
    const group = new THREE.Group();

    // Main tower
    const towerGeometry = new THREE.BoxGeometry(width, height, depth);
    const tower = new THREE.Mesh(towerGeometry, materials.monolith);
    tower.position.y = height / 2;
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);

    // Glass facade strips
    const stripeCount = Math.floor(height / 2);
    for (let i = 0; i < stripeCount; i++) {
        const stripeGeometry = new THREE.BoxGeometry(width + 0.02, 0.1, depth + 0.02);
        const stripe = new THREE.Mesh(stripeGeometry, materials.glass);
        stripe.position.y = i * 2 + 1;
        group.add(stripe);
    }

    // Accent crown
    const crownGeometry = new THREE.BoxGeometry(width * 0.8, 0.5, depth * 0.8);
    const crown = new THREE.Mesh(crownGeometry, materials.accent);
    crown.position.y = height + 0.25;
    group.add(crown);

    return group;
};

// Create floating data visualization particle system
export const createDataParticles = (
    count: number,
    bounds: THREE.Vector3,
    materials: ReturnType<typeof createMaterials>
): THREE.Points => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * bounds.x;
        positions[i * 3 + 1] = Math.random() * bounds.y - bounds.y / 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * bounds.z;

        velocities[i * 3] = (Math.random() - 0.5) * 0.01;
        velocities[i * 3 + 1] = Math.random() * 0.02 + 0.01;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    return new THREE.Points(geometry, materials.particle);
};

// Create ground plane with grid pattern
export const createGroundPlane = (
    size: number,
    materials: ReturnType<typeof createMaterials>
): THREE.Group => {
    const group = new THREE.Group();

    // Main ground
    const groundGeometry = new THREE.PlaneGeometry(size, size);
    groundGeometry.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(groundGeometry, materials.ground);
    ground.receiveShadow = true;
    ground.position.y = -0.01;
    group.add(ground);

    // Subtle grid lines
    const gridHelper = new THREE.GridHelper(size, 50, 0x1a1a1d, 0x1a1a1d);
    (gridHelper.material as THREE.Material).opacity = 0.15;
    (gridHelper.material as THREE.Material).transparent = true;
    group.add(gridHelper);

    return group;
};

// Create atmospheric fog volume
export const createFogVolume = (
    size: THREE.Vector3,
    materials: ReturnType<typeof createMaterials>
): THREE.Mesh => {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const fog = new THREE.Mesh(geometry, materials.fog);
    fog.position.y = size.y / 2 - 5;
    return fog;
};

// Create ambient lighting setup
export const createLighting = (): THREE.Group => {
    const group = new THREE.Group();

    // Ambient light - very subtle
    const ambient = new THREE.AmbientLight(0x222228, 0.3);
    group.add(ambient);

    // Main directional light - moonlight feel
    const directional = new THREE.DirectionalLight(0xaabbcc, 0.8);
    directional.position.set(10, 30, 10);
    directional.castShadow = true;
    directional.shadow.mapSize.width = 2048;
    directional.shadow.mapSize.height = 2048;
    directional.shadow.camera.near = 0.5;
    directional.shadow.camera.far = 100;
    directional.shadow.camera.left = -50;
    directional.shadow.camera.right = 50;
    directional.shadow.camera.top = 50;
    directional.shadow.camera.bottom = -50;
    directional.shadow.bias = -0.0001;
    group.add(directional);

    // Accent light from below - subtle gold uplight
    const accentLight = new THREE.PointLight(0xc9a962, 0.3, 50);
    accentLight.position.set(0, -5, 0);
    group.add(accentLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x334455, 0.4);
    rimLight.position.set(-10, 10, -10);
    group.add(rimLight);

    return group;
};

/**
 * Far Depth Grid — Hero spatial depth layer A
 * Horizontal lines only, very subtle, for parallax depth illusion
 * Position: z = -200, Opacity: 0.03, Color: desaturated gold
 */
export const createFarDepthGrid = (): THREE.Group => {
    const group = new THREE.Group();

    // Desaturated gold color
    const lineColor = 0x8a7a52;

    // Create horizontal lines only (no verticals per spec)
    const lineCount = 20;
    const spacing = 10;
    const width = 400;

    for (let i = -lineCount / 2; i <= lineCount / 2; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            -width / 2, i * spacing, 0,
            width / 2, i * spacing, 0
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.LineBasicMaterial({
            color: lineColor,
            transparent: true,
            opacity: 0.03,
            depthWrite: false,
        });

        const line = new THREE.Line(geometry, material);
        group.add(line);
    }

    // Position at far depth
    group.position.z = -200;

    return group;
};

/**
 * Mid Fog Plane — Hero spatial depth layer B
 * Uses fog shader with slow lateral drift
 * Position: z = -50
 */
export const createMidFogPlane = (
    materials: ReturnType<typeof createMaterials>
): THREE.Mesh => {
    const geometry = new THREE.PlaneGeometry(300, 100);
    const mesh = new THREE.Mesh(geometry, materials.fog.clone());

    // Lower opacity for subtle atmospheric presence
    if (mesh.material instanceof THREE.ShaderMaterial) {
        mesh.material.uniforms.uDensity.value = 0.15;
    }

    mesh.position.z = -50;
    mesh.position.y = 10;

    return mesh;
};

// Create hero text plane (3D text in space)
export const createTextPlane = (
    text: string,
    fontSize: number = 2
): THREE.Mesh => {
    // Create canvas texture for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    canvas.width = 1024;
    canvas.height = 512;

    context.fillStyle = 'transparent';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = `100 ${fontSize * 50}px Outfit, sans-serif`;
    context.fillStyle = '#f0f0f5';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.letterSpacing = '-0.05em';

    // Split text into lines if needed
    const lines = text.split('\n');
    const lineHeight = fontSize * 60;
    const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
        context.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(20, 10);
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
};

/**
 * Volumetric Light Cone — Soft moonlight glow for property focus
 * Radial gradient shader, subtle opacity, no sharp beams
 */
export const createVolumetricCone = (): THREE.Mesh => {
    const geometry = new THREE.ConeGeometry(8, 25, 32, 1, true);

    const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
            uOpacity: { value: 0 },
            uColor: { value: new THREE.Color(0xc9a962) },
        },
        vertexShader: `
            varying vec2 vUv;
            varying float vHeight;
            
            void main() {
                vUv = uv;
                vHeight = position.y / 25.0 + 0.5;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uOpacity;
            uniform vec3 uColor;
            varying vec2 vUv;
            varying float vHeight;
            
            void main() {
                vec2 center = vec2(0.5, 0.5);
                float dist = distance(vUv, center) * 2.0;
                float radialFade = 1.0 - smoothstep(0.0, 1.0, dist);
                float heightFade = pow(vHeight, 0.5);
                float alpha = radialFade * heightFade * uOpacity * 0.15;
                gl_FragColor = vec4(uColor, alpha);
            }
        `,
    });

    const cone = new THREE.Mesh(geometry, material);
    cone.rotation.x = Math.PI;
    cone.visible = false;

    return cone;
};

export default {
    createMaterials,
    createMonolith,
    createDataParticles,
    createGroundPlane,
    createFogVolume,
    createLighting,
    createTextPlane,
    createFarDepthGrid,
    createMidFogPlane,
    createVolumetricCone,
};
