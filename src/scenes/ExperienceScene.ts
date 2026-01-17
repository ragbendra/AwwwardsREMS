'use client';

import * as THREE from 'three';
import portfolioData from '@/data/mockPortfolio.json';
import {
    createMaterials,
    createMonolith,
    createGroundPlane,
    createFogVolume,
    createLighting,
    createDataParticles,
    createTextPlane,
    createFarDepthGrid,
    createMidFogPlane,
    createVolumetricCone,
} from './ScenePrimitives';

export interface PropertyMesh extends THREE.Group {
    userData: {
        propertyId: string;
        propertyName: string;
        propertyData: typeof portfolioData.properties[0];
        baseY: number;
        targetY: number;
        riseProgress: number;
    };
}

// Temporal atmosphere colors (Dawn → Morning → Afternoon → Dusk)
const atmosphereColors = {
    dawn: { fog: 0x1a2a4a, ambient: 0x4a6fa5, intensity: 0.3 },
    morning: { fog: 0x2a2a2f, ambient: 0xd4a574, intensity: 0.5 },
    afternoon: { fog: 0x0a0a0b, ambient: 0xf0f0f5, intensity: 0.7 },
    dusk: { fog: 0x1a1520, ambient: 0xd4764a, intensity: 0.4 },
};

export class ExperienceScene {
    scene: THREE.Scene;
    materials: ReturnType<typeof createMaterials>;
    propertyMeshes: Map<string, PropertyMesh> = new Map();

    private fogVolume: THREE.Mesh | null = null;
    private dataParticles: THREE.Points | null = null;
    // All 3D hero text removed per cinematic audit (2D headlines provide brand authority)
    private lighting: THREE.Group | null = null;
    private ambientLight: THREE.AmbientLight | null = null;
    private directionalLight: THREE.DirectionalLight | null = null;
    private groundPlane: THREE.Group | null = null;
    private farDepthGrid: THREE.Group | null = null;
    private midFogPlane: THREE.Mesh | null = null;
    private lastScrollProgress: number = 0;
    private lastScrollVelocity: number = 0;

    // Property focus system
    private volumetricCone: THREE.Mesh | null = null;
    private currentFocusedProperty: PropertyMesh | null = null;
    private focusTransitionProgress: number = 0;
    private targetFocusProperty: PropertyMesh | null = null;
    private focusTransitionStartTime: number = 0;
    private readonly FOCUS_TRANSITION_DURATION = 1.5; // 1.5 second crossfade

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.FogExp2(0x0a0a0b, 0.012);

        this.materials = createMaterials();

        this.setupScene();
    }

    private setupScene(): void {
        // Add ambient light (will be modulated by time of day)
        this.ambientLight = new THREE.AmbientLight(0x404050, 0.4);
        this.scene.add(this.ambientLight);

        // Add directional light (sun position changes with scroll)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.directionalLight.position.set(10, 20, 10);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);

        // Add lighting group
        this.lighting = createLighting();
        this.scene.add(this.lighting);

        // Add ground plane
        this.groundPlane = createGroundPlane(200, this.materials);
        this.scene.add(this.groundPlane);

        // Add fog volume
        this.fogVolume = createFogVolume(
            new THREE.Vector3(200, 50, 200),
            this.materials
        );
        this.scene.add(this.fogVolume);

        // All 3D hero text removed per cinematic audit (2D headlines provide brand authority)

        // Hero spatial depth layers
        this.farDepthGrid = createFarDepthGrid();
        this.scene.add(this.farDepthGrid);

        this.midFogPlane = createMidFogPlane(this.materials);
        this.scene.add(this.midFogPlane);

        // Create property monoliths (initially below ground)
        this.createPropertyMonoliths();

        // Add data visualization particles
        this.dataParticles = createDataParticles(
            800, // More particles
            new THREE.Vector3(120, 80, 120),
            this.materials
        );
        this.dataParticles.position.set(0, 0, -50);
        this.scene.add(this.dataParticles);

        // Volumetric light cone for property focus
        this.volumetricCone = createVolumetricCone();
        this.scene.add(this.volumetricCone);
    }

    private createPropertyMonoliths(): void {
        portfolioData.properties.forEach((property, index) => {
            const monolith = createMonolith(
                property.scale.x,
                property.scale.y * 5,
                property.scale.z,
                this.materials
            ) as PropertyMesh;

            // Start below ground for rise animation
            const baseY = property.position.y;
            const targetY = property.scale.y * 2.5; // Final height

            monolith.position.set(
                property.position.x,
                baseY - 10, // Start below
                property.position.z
            );

            // Store animation data
            monolith.userData = {
                propertyId: property.id,
                propertyName: property.name,
                propertyData: property,
                baseY: baseY - 10,
                targetY: targetY,
                riseProgress: 0,
            };

            this.propertyMeshes.set(property.id, monolith);
            this.scene.add(monolith);
        });
    }

    update(time: number, scrollProgress: number): void {
        // Calculate clamped scroll velocity (delta-based, no spikes/jitter)
        const scrollDelta = scrollProgress - this.lastScrollProgress;
        // Clamp velocity to safe bounds: [-0.01, 0.01] per frame
        this.lastScrollVelocity = Math.max(-0.01, Math.min(0.01, scrollDelta));

        // Update temporal atmosphere based on scroll
        this.updateAtmosphere(scrollProgress);

        // Update fog shader
        if (this.fogVolume && this.fogVolume.material instanceof THREE.ShaderMaterial) {
            this.fogVolume.material.uniforms.uTime.value = time;
        }

        // Update particles with enhanced motion
        this.updateParticles(time, scrollProgress);

        // Update hero depth layers with parallax velocity mapping
        this.updateDepthLayers(time);

        // Animate buildings rising based on scroll
        this.updateBuildingAnimations(time, scrollProgress);

        // Update property focus (emissive + volumetric light)
        this.updatePropertyFocus(time, scrollProgress);

        // Store for delta calculations
        this.lastScrollProgress = scrollProgress;
    }

    /**
     * Update hero depth layers with scroll parallax
     * Far grid: 0.3x, Mid fog: 0.6x scroll velocity
     */
    private updateDepthLayers(time: number): void {
        const velocity = this.lastScrollVelocity;

        // Far depth grid — 0.3x scroll velocity parallax
        if (this.farDepthGrid) {
            this.farDepthGrid.position.y += velocity * 0.3 * 100;
            // Keep within bounds
            if (Math.abs(this.farDepthGrid.position.y) > 50) {
                this.farDepthGrid.position.y *= 0.95;
            }
        }

        // Mid fog plane — 0.6x scroll velocity parallax + slow lateral drift
        if (this.midFogPlane) {
            this.midFogPlane.position.y += velocity * 0.6 * 100;
            // Slow lateral drift (not tied to scroll)
            this.midFogPlane.position.x = Math.sin(time * 0.1) * 5;

            // Update fog shader time uniform
            if (this.midFogPlane.material instanceof THREE.ShaderMaterial) {
                this.midFogPlane.material.uniforms.uTime.value = time;
            }

            // Keep within bounds
            if (Math.abs(this.midFogPlane.position.y - 10) > 30) {
                this.midFogPlane.position.y = 10 + (this.midFogPlane.position.y - 10) * 0.95;
            }
        }
    }

    /**
     * Update property focus system
     * - Detects hero property based on scroll position
     * - Modulates emissive intensity (1.4x hero, 0.7x others)
     * - Positions volumetric light cone above focused property
     * - Smooth 1.5s crossfade transitions
     */
    private updatePropertyFocus(time: number, scrollProgress: number): void {
        // Only active during portfolio section (0.25 - 0.5)
        if (scrollProgress < 0.25 || scrollProgress > 0.5) {
            if (this.volumetricCone) {
                this.volumetricCone.visible = false;
                if (this.volumetricCone.material instanceof THREE.ShaderMaterial) {
                    this.volumetricCone.material.uniforms.uOpacity.value = 0;
                }
            }
            this.currentFocusedProperty = null;
            return;
        }

        // Map scroll 0.25-0.5 to property indices
        const portfolioProgress = (scrollProgress - 0.25) / 0.25;
        const propertyCount = this.propertyMeshes.size;
        const targetIndex = Math.min(
            Math.floor(portfolioProgress * propertyCount),
            propertyCount - 1
        );

        const properties = Array.from(this.propertyMeshes.values());
        const newFocusProperty = properties[targetIndex] || null;

        // Check if focus has changed
        if (newFocusProperty !== this.targetFocusProperty) {
            this.targetFocusProperty = newFocusProperty;
            this.focusTransitionStartTime = time;
        }

        // Calculate transition progress with ease-in-out cubic
        const elapsed = time - this.focusTransitionStartTime;
        const t = Math.min(elapsed / this.FOCUS_TRANSITION_DURATION, 1);
        this.focusTransitionProgress = t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;

        // Update emissive intensities
        this.propertyMeshes.forEach((mesh) => {
            const isFocused = mesh === this.targetFocusProperty;
            mesh.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                    const mat = child.material as THREE.MeshStandardMaterial;
                    if (mat.emissive && mat.emissiveIntensity !== undefined) {
                        const baseline = 0.1;
                        const targetIntensity = isFocused ? baseline * 1.4 : baseline * 0.7;
                        mat.emissiveIntensity += (targetIntensity - mat.emissiveIntensity) * 0.05;
                    }
                }
            });
        });

        // Update volumetric cone
        if (this.volumetricCone && this.targetFocusProperty) {
            this.volumetricCone.visible = true;
            const targetPos = this.targetFocusProperty.position;
            const targetHeight = this.targetFocusProperty.userData.targetY || 20;

            this.volumetricCone.position.x += (targetPos.x - this.volumetricCone.position.x) * 0.05;
            this.volumetricCone.position.z += (targetPos.z - this.volumetricCone.position.z) * 0.05;
            this.volumetricCone.position.y = targetHeight + 15;

            if (this.volumetricCone.material instanceof THREE.ShaderMaterial) {
                const targetOpacity = this.focusTransitionProgress;
                const currentOpacity = this.volumetricCone.material.uniforms.uOpacity.value;
                this.volumetricCone.material.uniforms.uOpacity.value +=
                    (targetOpacity - currentOpacity) * 0.05;
            }
        }

        if (this.focusTransitionProgress >= 1) {
            this.currentFocusedProperty = this.targetFocusProperty;
        }
    }

    private updateAtmosphere(scrollProgress: number): void {
        // Determine time of day based on scroll
        let fogColor: THREE.Color;
        let ambientColor: THREE.Color;
        let lightIntensity: number;

        if (scrollProgress < 0.2) {
            // Dawn
            const t = scrollProgress / 0.2;
            fogColor = new THREE.Color(atmosphereColors.dawn.fog).lerp(
                new THREE.Color(atmosphereColors.morning.fog), t
            );
            ambientColor = new THREE.Color(atmosphereColors.dawn.ambient).lerp(
                new THREE.Color(atmosphereColors.morning.ambient), t
            );
            lightIntensity = THREE.MathUtils.lerp(atmosphereColors.dawn.intensity, atmosphereColors.morning.intensity, t);
        } else if (scrollProgress < 0.5) {
            // Morning to Afternoon
            const t = (scrollProgress - 0.2) / 0.3;
            fogColor = new THREE.Color(atmosphereColors.morning.fog).lerp(
                new THREE.Color(atmosphereColors.afternoon.fog), t
            );
            ambientColor = new THREE.Color(atmosphereColors.morning.ambient).lerp(
                new THREE.Color(atmosphereColors.afternoon.ambient), t
            );
            lightIntensity = THREE.MathUtils.lerp(atmosphereColors.morning.intensity, atmosphereColors.afternoon.intensity, t);
        } else if (scrollProgress < 0.8) {
            // Afternoon
            fogColor = new THREE.Color(atmosphereColors.afternoon.fog);
            ambientColor = new THREE.Color(atmosphereColors.afternoon.ambient);
            lightIntensity = atmosphereColors.afternoon.intensity;
        } else {
            // Dusk
            const t = (scrollProgress - 0.8) / 0.2;
            fogColor = new THREE.Color(atmosphereColors.afternoon.fog).lerp(
                new THREE.Color(atmosphereColors.dusk.fog), t
            );
            ambientColor = new THREE.Color(atmosphereColors.afternoon.ambient).lerp(
                new THREE.Color(atmosphereColors.dusk.ambient), t
            );
            lightIntensity = THREE.MathUtils.lerp(atmosphereColors.afternoon.intensity, atmosphereColors.dusk.intensity, t);
        }

        // Apply atmosphere changes
        if (this.scene.fog instanceof THREE.FogExp2) {
            this.scene.fog.color.copy(fogColor);
        }
        if (this.ambientLight) {
            this.ambientLight.color.copy(ambientColor);
            this.ambientLight.intensity = lightIntensity;
        }

        // Move directional light (sun position)
        if (this.directionalLight) {
            const sunAngle = scrollProgress * Math.PI; // 0 to PI (sunrise to sunset)
            this.directionalLight.position.set(
                Math.cos(sunAngle) * 30,
                20 + Math.sin(sunAngle) * 30,
                10
            );
            this.directionalLight.intensity = 0.4 + Math.sin(sunAngle) * 0.4;
        }
    }

    private updateParticles(time: number, scrollProgress: number): void {
        if (!this.dataParticles) return;

        const positions = this.dataParticles.geometry.attributes.position.array as Float32Array;
        const velocities = this.dataParticles.geometry.attributes.velocity?.array as Float32Array;

        if (velocities) {
            for (let i = 0; i < positions.length; i += 3) {
                // Enhanced particle motion
                positions[i] += velocities[i] * (1 + scrollProgress);
                positions[i + 1] += velocities[i + 1] * (1.5 + Math.sin(time * 0.5) * 0.5);
                positions[i + 2] += velocities[i + 2];

                // Reset particles that go too high
                if (positions[i + 1] > 50) {
                    positions[i + 1] = -30;
                }
            }

            this.dataParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Enhanced rotation based on scroll
        this.dataParticles.rotation.y = time * 0.015 + scrollProgress * Math.PI * 0.5;
    }

    // updateHeroText removed — all 3D hero text eliminated per audit

    private updateBuildingAnimations(time: number, scrollProgress: number): void {
        // Properties rise from ground during scene 2 (0.2 - 0.5)
        const riseStart = 0.2;
        const riseEnd = 0.45;

        this.propertyMeshes.forEach((mesh, index) => {
            const property = mesh.userData.propertyData;
            const propertyIndex = Array.from(this.propertyMeshes.keys()).indexOf(mesh.userData.propertyId);

            // Staggered rise based on property value (higher value = rises first)
            const valueRank = property.value / 285000000; // Normalize to max value
            const staggerDelay = (1 - valueRank) * 0.1;
            const adjustedProgress = Math.max(0, Math.min(1,
                (scrollProgress - riseStart - staggerDelay) / (riseEnd - riseStart)
            ));

            // Smooth easing for rise
            const eased = 1 - Math.pow(1 - adjustedProgress, 4);
            mesh.userData.riseProgress = eased;

            // Calculate Y position
            const targetY = mesh.userData.targetY;
            const baseY = mesh.userData.baseY;
            mesh.position.y = baseY + (targetY - baseY) * eased;

            // Add subtle hover animation when close to camera
            const distanceFromCamera = Math.abs(scrollProgress * 100 - Math.abs(property.position.z));
            if (distanceFromCamera < 25 && eased > 0.9) {
                const hoverIntensity = 1 - distanceFromCamera / 25;
                mesh.position.y += Math.sin(time * 2) * 0.08 * hoverIntensity;
            }

            // Subtle rotation for organic feel
            mesh.rotation.y = Math.sin(time * 0.5 + propertyIndex) * 0.02;
        });
    }

    getPropertyAtDistance(cameraZ: number, threshold: number = 15): PropertyMesh | null {
        let closest: PropertyMesh | null = null;
        let minDistance = Infinity;

        this.propertyMeshes.forEach((mesh) => {
            const distance = Math.abs(mesh.position.z - cameraZ);
            if (distance < threshold && distance < minDistance) {
                minDistance = distance;
                closest = mesh;
            }
        });

        return closest;
    }

    dispose(): void {
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        this.propertyMeshes.clear();
    }
}

export default ExperienceScene;
