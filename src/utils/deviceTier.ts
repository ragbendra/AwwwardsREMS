'use client';

/**
 * Device Tier Detection Utility
 * Analyzes device capabilities to determine appropriate feature levels.
 * Used to disable heavy features on low-end devices for 60fps target.
 */

export type DeviceTier = 'HIGH' | 'MEDIUM' | 'LOW';

interface DeviceCapabilities {
    tier: DeviceTier;
    gpu: string;
    cores: number;
    memory: number | null;
    supportsWebGL2: boolean;
    maxTextureSize: number;
}

// Cache the result (won't change during page lifecycle)
let cachedCapabilities: DeviceCapabilities | null = null;

/**
 * Detect device tier based on GPU, CPU cores, and WebGL capabilities.
 */
export function detectDeviceTier(): DeviceCapabilities {
    // Return cached result if available
    if (cachedCapabilities) return cachedCapabilities;

    // SSR safety
    if (typeof window === 'undefined') {
        return {
            tier: 'HIGH',
            gpu: 'unknown',
            cores: 4,
            memory: null,
            supportsWebGL2: true,
            maxTextureSize: 4096,
        };
    }

    // Get CPU info
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || null;

    // Get WebGL info
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    let gpu = 'unknown';
    let maxTextureSize = 4096;
    const supportsWebGL2 = !!canvas.getContext('webgl2');

    if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
        }
        maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    }

    // Determine tier based on indicators
    let tier: DeviceTier = 'HIGH';

    // Low tier indicators
    const isLowEnd =
        cores <= 2 ||
        (memory !== null && memory <= 2) ||
        /Mali-4|Mali-T[678]|Adreno [23][0-3]|Intel HD [456]|PowerVR|Apple A[5-7]/i.test(gpu) ||
        maxTextureSize <= 2048;

    // Medium tier indicators
    const isMedium =
        cores <= 4 ||
        (memory !== null && memory <= 4) ||
        /Intel UHD|Intel Iris|Adreno 5|Mali-G[56]|Apple A[89]|Apple A1[012]/i.test(gpu);

    // High tier indicators
    const isHighEnd =
        cores >= 8 &&
        (memory === null || memory >= 8) &&
        supportsWebGL2 &&
        /NVIDIA|Radeon|Apple M[1-9]|Apple A1[4-9]/i.test(gpu);

    if (isLowEnd) {
        tier = 'LOW';
    } else if (isHighEnd) {
        tier = 'HIGH';
    } else if (isMedium) {
        tier = 'MEDIUM';
    }

    cachedCapabilities = {
        tier,
        gpu,
        cores,
        memory,
        supportsWebGL2,
        maxTextureSize,
    };

    return cachedCapabilities;
}

/**
 * Check if a specific feature should be enabled based on device tier.
 */
export function shouldEnableFeature(
    feature: 'postProcessing' | 'motionBlur' | 'particles' | 'volumetricLighting' | 'shadows'
): boolean {
    const { tier } = detectDeviceTier();

    switch (feature) {
        case 'postProcessing':
            return tier === 'HIGH';
        case 'motionBlur':
            return tier === 'HIGH';
        case 'particles':
            return tier !== 'LOW'; // MEDIUM and HIGH
        case 'volumetricLighting':
            return tier !== 'LOW';
        case 'shadows':
            return tier !== 'LOW';
        default:
            return true;
    }
}

/**
 * Get recommended particle count based on device tier.
 */
export function getRecommendedParticleCount(baseCount: number): number {
    const { tier } = detectDeviceTier();

    switch (tier) {
        case 'HIGH':
            return baseCount;
        case 'MEDIUM':
            return Math.floor(baseCount * 0.6);
        case 'LOW':
            return Math.floor(baseCount * 0.3);
        default:
            return baseCount;
    }
}

export default { detectDeviceTier, shouldEnableFeature, getRecommendedParticleCount };
