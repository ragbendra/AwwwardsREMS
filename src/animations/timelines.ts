'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Motion constants - One easing per category
export const MOTION = {
    // Camera movements - slow and cinematic
    camera: {
        duration: 2.5,
        ease: 'power2.inOut',
    },
    // Scene transitions
    transition: {
        duration: 1.5,
        ease: 'power3.inOut',
    },
    // Content reveals
    reveal: {
        duration: 1.2,
        ease: 'power2.out',
    },
    // UI micro-interactions
    micro: {
        duration: 0.4,
        ease: 'power2.out',
    },
    // Shader animations
    shader: {
        duration: 2,
        ease: 'sine.inOut',
    },
};

// Preloader timeline
export function createPreloaderTimeline(
    elements: {
        container: HTMLElement;
        progress: HTMLElement;
        text: HTMLElement;
    },
    onComplete?: () => void
): gsap.core.Timeline {
    const tl = gsap.timeline({
        onComplete,
    });

    // Progress bar animation
    tl.to(elements.progress, {
        width: '100%',
        duration: 2,
        ease: 'power1.inOut',
    });

    // Fade out text
    tl.to(elements.text, {
        opacity: 0,
        y: -10,
        duration: 0.5,
        ease: MOTION.reveal.ease,
    }, '-=0.5');

    // Fade out entire preloader
    tl.to(elements.container, {
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
    });

    return tl;
}

// Hero reveal timeline
export function createHeroRevealTimeline(
    elements: {
        title?: HTMLElement | null;
        subtitle?: HTMLElement | null;
        accent?: HTMLElement | null;
    }
): gsap.core.Timeline {
    const tl = gsap.timeline({
        paused: true,
    });

    // Title reveal from depth
    if (elements.title) {
        tl.fromTo(elements.title,
            {
                opacity: 0,
                y: 60,
                filter: 'blur(10px)',
            },
            {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 1.5,
                ease: MOTION.reveal.ease,
            }
        );
    }

    // Subtitle reveal
    if (elements.subtitle) {
        tl.fromTo(elements.subtitle,
            {
                opacity: 0,
                y: 30,
            },
            {
                opacity: 0.7,
                y: 0,
                duration: 1,
                ease: MOTION.reveal.ease,
            },
            '-=0.8'
        );
    }

    // Accent decoration
    if (elements.accent) {
        tl.fromTo(elements.accent,
            {
                scaleX: 0,
                opacity: 0,
            },
            {
                scaleX: 1,
                opacity: 1,
                duration: 0.8,
                ease: MOTION.reveal.ease,
            },
            '-=0.6'
        );
    }

    return tl;
}

// Property metadata reveal
export function createPropertyMetaTimeline(
    container: HTMLElement,
    show: boolean = true
): gsap.core.Timeline {
    const tl = gsap.timeline();

    const label = container.querySelector('.property-meta__label');
    const title = container.querySelector('.property-meta__title');
    const stats = container.querySelectorAll('.property-meta__stat');

    if (show) {
        tl.set(container, { display: 'block' });

        if (label) {
            tl.fromTo(label,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.6, ease: MOTION.reveal.ease }
            );
        }

        if (title) {
            tl.fromTo(title,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: MOTION.reveal.ease },
                '-=0.4'
            );
        }

        if (stats.length) {
            tl.fromTo(stats,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: MOTION.reveal.ease },
                '-=0.5'
            );
        }
    } else {
        tl.to(container, {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: MOTION.micro.ease,
            onComplete: () => {
                gsap.set(container, { display: 'none' });
            },
        });
    }

    return tl;
}

// Scroll-triggered camera animation
export function createScrollCameraAnimation(
    camera: THREE.PerspectiveCamera,
    path: THREE.CatmullRomCurve3,
    lookAtPath: THREE.CatmullRomCurve3
): void {
    ScrollTrigger.create({
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: (self) => {
            const progress = self.progress;

            // Get position on path
            const position = path.getPointAt(progress);
            const lookAt = lookAtPath.getPointAt(progress);

            // Smooth camera update
            gsap.to(camera.position, {
                x: position.x,
                y: position.y,
                z: position.z,
                duration: 0.3,
                ease: 'none',
                onUpdate: () => {
                    camera.lookAt(lookAt);
                },
            });
        },
    });
}

// Scene progress indicators
export function createSceneProgressAnimation(
    dots: HTMLElement[],
    currentScene: number
): void {
    dots.forEach((dot, index) => {
        const isActive = index === currentScene;

        gsap.to(dot, {
            scale: isActive ? 1.5 : 1,
            backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-slate)',
            duration: MOTION.micro.duration,
            ease: MOTION.micro.ease,
        });
    });
}

// Floating text reveal based on camera proximity
export function createFloatingTextAnimation(
    element: HTMLElement,
    distance: number,
    threshold: number = 10
): void {
    const visibility = 1 - Math.min(distance / threshold, 1);

    gsap.to(element, {
        opacity: visibility * 0.9,
        y: (1 - visibility) * 20,
        filter: `blur(${(1 - visibility) * 5}px)`,
        duration: 0.3,
        ease: 'none',
    });
}

// God view pullback animation
export function createGodViewAnimation(
    camera: THREE.PerspectiveCamera,
    targetPosition: THREE.Vector3,
    targetLookAt: THREE.Vector3,
    duration: number = 3
): gsap.core.Timeline {
    const tl = gsap.timeline();

    const startPosition = camera.position.clone();
    const startLookAt = new THREE.Vector3(0, 0, -50);

    tl.to({ t: 0 }, {
        t: 1,
        duration,
        ease: 'power2.inOut',
        onUpdate: function (this: { targets: () => { t: number }[] }) {
            const t = this.targets()[0].t;

            camera.position.lerpVectors(startPosition, targetPosition, t);

            const currentLookAt = new THREE.Vector3().lerpVectors(startLookAt, targetLookAt, t);
            camera.lookAt(currentLookAt);
        },
    });

    return tl;
}

// Shader uniform animation
export function animateShaderUniform(
    material: THREE.ShaderMaterial,
    uniformName: string,
    targetValue: number,
    duration: number = MOTION.shader.duration
): gsap.core.Tween {
    const uniforms = material.uniforms;

    if (!uniforms[uniformName]) {
        console.warn(`Uniform ${uniformName} not found`);
        return gsap.to({}, { duration: 0 });
    }

    return gsap.to(uniforms[uniformName], {
        value: targetValue,
        duration,
        ease: MOTION.shader.ease,
    });
}

// Building entrance animation
export function createBuildingEntranceTimeline(
    meshes: THREE.Mesh[],
    staggerDelay: number = 0.15
): gsap.core.Timeline {
    const tl = gsap.timeline();

    meshes.forEach((mesh, index) => {
        const originalY = mesh.position.y;
        mesh.position.y = -20;
        mesh.scale.set(0.01, 0.01, 0.01);

        tl.to(mesh.position, {
            y: originalY,
            duration: 1.5,
            ease: 'power2.out',
        }, index * staggerDelay);

        tl.to(mesh.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1.2,
            ease: 'power2.out',
        }, index * staggerDelay);
    });

    return tl;
}

// Revenue stream animation (flowing lights)
export function createRevenueStreamAnimation(
    particles: THREE.Points,
    speed: number = 0.5
): () => void {
    let animationId: number;

    const animate = () => {
        const positions = particles.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += speed * 0.01; // Move up

            // Reset if too high
            if (positions[i + 1] > 50) {
                positions[i + 1] = -20;
            }
        }

        particles.geometry.attributes.position.needsUpdate = true;
        animationId = requestAnimationFrame(animate);
    };

    animate();

    // Return cleanup function
    return () => {
        cancelAnimationFrame(animationId);
    };
}

const timelines = {
    MOTION,
    createPreloaderTimeline,
    createHeroRevealTimeline,
    createPropertyMetaTimeline,
    createScrollCameraAnimation,
    createSceneProgressAnimation,
    createFloatingTextAnimation,
    createGodViewAnimation,
    animateShaderUniform,
    createBuildingEntranceTimeline,
    createRevenueStreamAnimation,
};

export default timelines;
