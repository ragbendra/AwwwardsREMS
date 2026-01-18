'use client';

import React, { Component, ReactNode } from 'react';

interface ThreeErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ThreeErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary for Three.js Components
 * Catches WebGL and Three.js initialization errors gracefully.
 */
export default class ThreeErrorBoundary extends Component<
    ThreeErrorBoundaryProps,
    ThreeErrorBoundaryState
> {
    constructor(props: ThreeErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ThreeErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log to console for debugging
        console.error('Three.js Error:', error);
        console.error('Error Info:', errorInfo.componentStack);

        // Could send to error tracking service here
    }

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div
                    role="alert"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000',
                        color: '#f0f0f5',
                        padding: '2rem',
                        textAlign: 'center',
                    }}
                >
                    <h2
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 300,
                            marginBottom: '1rem',
                        }}
                    >
                        Something went wrong
                    </h2>
                    <p
                        style={{
                            color: '#8a8a95',
                            marginBottom: '1.5rem',
                            maxWidth: '400px',
                        }}
                    >
                        The 3D experience could not be loaded. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: '#c9a962',
                            color: '#000',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                        }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
