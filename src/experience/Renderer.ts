'use client';

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Custom film grain shader
const FilmGrainShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uIntensity: { value: 0.08 },
        uResolution: { value: new THREE.Vector2(1920, 1080) },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uResolution;
    varying vec2 vUv;
    
    float random(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      vec4 texColor = texture2D(tDiffuse, vUv);
      
      // Animated grain
      float grain = random(vUv * uResolution + mod(uTime * 1000.0, 1000.0));
      grain = (grain - 0.5) * uIntensity;
      
      // Subtle vignette
      vec2 center = vUv - 0.5;
      float vignette = 1.0 - dot(center, center) * 0.5;
      
      vec3 color = texColor.rgb + vec3(grain);
      color *= vignette;
      
      gl_FragColor = vec4(color, texColor.a);
    }
  `,
};

// Chromatic aberration shader
const ChromaticAberrationShader = {
    uniforms: {
        tDiffuse: { value: null },
        uOffset: { value: 0.002 },
        uIntensity: { value: 0.5 },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uOffset;
    uniform float uIntensity;
    varying vec2 vUv;
    
    void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float offsetAmount = uOffset * dist * uIntensity;
      
      vec4 cr = texture2D(tDiffuse, vUv + vec2(offsetAmount, 0.0));
      vec4 cg = texture2D(tDiffuse, vUv);
      vec4 cb = texture2D(tDiffuse, vUv - vec2(offsetAmount, 0.0));
      
      gl_FragColor = vec4(cr.r, cg.g, cb.b, cg.a);
    }
  `,
};

export interface RendererConfig {
    antialias?: boolean;
    alpha?: boolean;
    powerPreference?: 'high-performance' | 'low-power' | 'default';
    enableBloom?: boolean;
    enableGrain?: boolean;
    enableChromaticAberration?: boolean;
}

const defaultConfig: RendererConfig = {
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    enableBloom: true,
    enableGrain: true,
    enableChromaticAberration: true,
};

export class Renderer {
    renderer: THREE.WebGLRenderer;
    composer: EffectComposer;

    private config: RendererConfig;
    private grainPass: ShaderPass | null = null;
    private chromaticPass: ShaderPass | null = null;
    private bloomPass: UnrealBloomPass | null = null;
    private startTime: number = Date.now();
    private lastTime: number = Date.now();
    private deltaTime: number = 0;

    constructor(
        canvas: HTMLCanvasElement,
        scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        config: Partial<RendererConfig> = {}
    ) {
        this.config = { ...defaultConfig, ...config };

        // Create WebGL renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: this.config.antialias,
            alpha: this.config.alpha,
            powerPreference: this.config.powerPreference,
        });

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        // Shadow settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Effect composer
        this.composer = new EffectComposer(this.renderer);

        // Render pass
        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);

        // Bloom pass
        if (this.config.enableBloom) {
            this.bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.4,   // strength
                0.3,   // radius
                0.85   // threshold
            );
            this.composer.addPass(this.bloomPass);
        }

        // Chromatic aberration
        if (this.config.enableChromaticAberration) {
            this.chromaticPass = new ShaderPass(ChromaticAberrationShader);
            this.composer.addPass(this.chromaticPass);
        }

        // Film grain (last pass)
        if (this.config.enableGrain) {
            this.grainPass = new ShaderPass(FilmGrainShader);
            this.grainPass.uniforms.uResolution.value.set(
                window.innerWidth * this.renderer.getPixelRatio(),
                window.innerHeight * this.renderer.getPixelRatio()
            );
            this.composer.addPass(this.grainPass);
        }
    }

    resize(width: number, height: number): void {
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);

        if (this.grainPass) {
            this.grainPass.uniforms.uResolution.value.set(
                width * this.renderer.getPixelRatio(),
                height * this.renderer.getPixelRatio()
            );
        }

        if (this.bloomPass) {
            this.bloomPass.resolution.set(width, height);
        }
    }

    render(): void {
        const currentTime = Date.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        const elapsedTime = (currentTime - this.startTime) / 1000;

        // Update time-based uniforms
        if (this.grainPass) {
            this.grainPass.uniforms.uTime.value = elapsedTime;
        }

        // Render with post-processing
        this.composer.render();
    }

    setBloomIntensity(intensity: number): void {
        if (this.bloomPass) {
            this.bloomPass.strength = intensity;
        }
    }

    setGrainIntensity(intensity: number): void {
        if (this.grainPass) {
            this.grainPass.uniforms.uIntensity.value = intensity;
        }
    }

    setChromaticAberration(intensity: number): void {
        if (this.chromaticPass) {
            this.chromaticPass.uniforms.uIntensity.value = intensity;
        }
    }

    getDeltaTime(): number {
        return this.deltaTime;
    }

    getElapsedTime(): number {
        return (Date.now() - this.startTime) / 1000;
    }

    dispose(): void {
        this.renderer.dispose();
        this.composer.dispose();
    }
}

export default Renderer;
