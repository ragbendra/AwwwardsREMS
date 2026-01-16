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
} from './ScenePrimitives';

export interface PropertyMesh extends THREE.Group {
    userData: {
        propertyId: string;
        propertyName: string;
        propertyData: typeof portfolioData.properties[0];
    };
}

export class ExperienceScene {
    scene: THREE.Scene;
    materials: ReturnType<typeof createMaterials>;
    propertyMeshes: Map<string, PropertyMesh> = new Map();

    private fogVolume: THREE.Mesh | null = null;
    private dataParticles: THREE.Points | null = null;
    private heroText: THREE.Mesh | null = null;
    private subtitleText: THREE.Mesh | null = null;
    private lighting: THREE.Group | null = null;

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.FogExp2(0x0a0a0b, 0.015);

        this.materials = createMaterials();

        this.setupScene();
    }

    private setupScene(): void {
        // Add lighting
        this.lighting = createLighting();
        this.scene.add(this.lighting);

        // Add ground plane
        const ground = createGroundPlane(200, this.materials);
        this.scene.add(ground);

        // Add fog volume
        this.fogVolume = createFogVolume(
            new THREE.Vector3(200, 50, 200),
            this.materials
        );
        this.scene.add(this.fogVolume);

        // Add hero text planes
        this.heroText = createTextPlane('MERIDIAN', 3);
        this.heroText.position.set(0, 4, -5);
        this.scene.add(this.heroText);

        this.subtitleText = createTextPlane('CAPITAL PORTFOLIO', 1.5);
        this.subtitleText.position.set(0, 1.5, -5);
        this.scene.add(this.subtitleText);

        // Create property monoliths
        this.createPropertyMonoliths();

        // Add data visualization particles
        this.dataParticles = createDataParticles(
            500,
            new THREE.Vector3(100, 80, 100),
            this.materials
        );
        this.dataParticles.position.set(0, 0, -50);
        this.scene.add(this.dataParticles);
    }

    private createPropertyMonoliths(): void {
        portfolioData.properties.forEach((property) => {
            const monolith = createMonolith(
                property.scale.x,
                property.scale.y * 5, // Scale up for visual impact
                property.scale.z,
                this.materials
            ) as PropertyMesh;

            monolith.position.set(
                property.position.x,
                property.position.y,
                property.position.z
            );

            // Store property data
            monolith.userData = {
                propertyId: property.id,
                propertyName: property.name,
                propertyData: property,
            };

            this.propertyMeshes.set(property.id, monolith);
            this.scene.add(monolith);
        });
    }

    update(time: number, scrollProgress: number): void {
        // Update fog shader
        if (this.fogVolume && this.fogVolume.material instanceof THREE.ShaderMaterial) {
            this.fogVolume.material.uniforms.uTime.value = time;
        }

        // Update particles
        if (this.dataParticles) {
            const positions = this.dataParticles.geometry.attributes.position.array as Float32Array;
            const velocities = this.dataParticles.geometry.attributes.velocity?.array as Float32Array;

            if (velocities) {
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += velocities[i];
                    positions[i + 1] += velocities[i + 1];
                    positions[i + 2] += velocities[i + 2];

                    // Reset particles that go too high
                    if (positions[i + 1] > 40) {
                        positions[i + 1] = -20;
                    }
                }

                this.dataParticles.geometry.attributes.position.needsUpdate = true;
            }

            // Subtle rotation
            this.dataParticles.rotation.y = time * 0.02;
        }

        // Hero text reveal based on scroll
        if (this.heroText && this.heroText.material instanceof THREE.MeshBasicMaterial) {
            // Fade in during scene 1, fade out after
            const heroOpacity = scrollProgress < 0.05
                ? 0
                : scrollProgress < 0.15
                    ? (scrollProgress - 0.05) * 10
                    : scrollProgress < 0.25
                        ? 1 - (scrollProgress - 0.15) * 10
                        : 0;

            this.heroText.material.opacity = Math.max(0, Math.min(1, heroOpacity));
        }

        if (this.subtitleText && this.subtitleText.material instanceof THREE.MeshBasicMaterial) {
            const subtitleOpacity = scrollProgress < 0.08
                ? 0
                : scrollProgress < 0.18
                    ? (scrollProgress - 0.08) * 10
                    : scrollProgress < 0.28
                        ? 1 - (scrollProgress - 0.18) * 10
                        : 0;

            this.subtitleText.material.opacity = Math.max(0, Math.min(1, subtitleOpacity * 0.7));
        }

        // Animate buildings based on visibility
        this.propertyMeshes.forEach((mesh, id) => {
            const property = mesh.userData.propertyData;
            const distanceFromCamera = Math.abs(scrollProgress * 100 - Math.abs(property.position.z));

            // Subtle hover animation when close
            if (distanceFromCamera < 20) {
                const intensity = 1 - distanceFromCamera / 20;
                mesh.position.y = property.position.y + Math.sin(time * 2) * 0.05 * intensity;
            }
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
        // Cleanup geometries and materials
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

        // Clear references
        this.propertyMeshes.clear();
    }
}

export default ExperienceScene;
