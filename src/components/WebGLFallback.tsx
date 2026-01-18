'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect WebGL support.
 * Returns true if WebGL is supported, false otherwise.
 */
export function useWebGLSupport(): boolean | null {
    const [isSupported, setIsSupported] = useState<boolean | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const canvas = document.createElement('canvas');
            const gl =
                canvas.getContext('webgl2') ||
                canvas.getContext('webgl') ||
                canvas.getContext('experimental-webgl');
            setIsSupported(!!gl);
        } catch {
            setIsSupported(false);
        }
    }, []);

    return isSupported;
}

interface WebGLFallbackProps {
    isWebGLSupported: boolean | null;
}

/**
 * WebGL Fallback UI
 * Displays a static, graceful fallback when WebGL is not available.
 */
export default function WebGLFallback({ isWebGLSupported }: WebGLFallbackProps): React.ReactNode {
    // Still detecting or WebGL is present
    if (isWebGLSupported === null || isWebGLSupported) {
        return null;
    }

    return (
        <div
            className="webgl-fallback"
            role="alert"
            aria-live="polite"
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-void, #000)',
                color: 'var(--color-ivory, #f0f0f5)',
                zIndex: 9999,
                padding: '2rem',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    maxWidth: '600px',
                }}
            >
                <h1
                    style={{
                        fontFamily: 'var(--font-display, sans-serif)',
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 200,
                        marginBottom: '1rem',
                        letterSpacing: '-0.02em',
                    }}
                >
                    MERIDIAN CAPITAL
                </h1>

                <p
                    style={{
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                        color: 'var(--color-silver, #8a8a95)',
                        marginBottom: '2rem',
                        lineHeight: 1.6,
                    }}
                >
                    This experience requires WebGL for the immersive 3D portfolio visualization.
                    Your browser or device does not currently support WebGL.
                </p>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        alignItems: 'center',
                    }}
                >
                    <p
                        style={{
                            fontSize: '0.9rem',
                            color: 'var(--color-ash, #4a4a52)',
                        }}
                    >
                        Try one of the following:
                    </p>

                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            fontSize: '0.9rem',
                            color: 'var(--color-pearl, #cacad3)',
                        }}
                    >
                        <li style={{ marginBottom: '0.5rem' }}>• Update to the latest version of Chrome, Firefox, or Safari</li>
                        <li style={{ marginBottom: '0.5rem' }}>• Enable hardware acceleration in your browser settings</li>
                        <li style={{ marginBottom: '0.5rem' }}>• Try a different device or browser</li>
                    </ul>

                    <a
                        href="mailto:contact@meridian.capital"
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem 2rem',
                            backgroundColor: 'var(--color-accent, #c9a962)',
                            color: 'var(--color-void, #000)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            letterSpacing: '0.05em',
                        }}
                    >
                        CONTACT US
                    </a>
                </div>
            </div>
        </div>
    );
}
