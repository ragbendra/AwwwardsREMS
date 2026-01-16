'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioControllerProps {
    scrollProgress: number;
    currentScene: number;
}

// Audio configuration for different scenes
const audioConfig = {
    ambient: '/audio/ambient-architectural.mp3', // Fallback - we'll generate placeholder
    transitions: [
        { trigger: 0.2, sound: 'whoosh' },
        { trigger: 0.5, sound: 'reveal' },
        { trigger: 0.8, sound: 'complete' },
    ],
};

export default function AudioController({ scrollProgress, currentScene }: AudioControllerProps) {
    const [isMuted, setIsMuted] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    // Initialize Web Audio API for procedural ambient sounds
    const initAudio = useCallback(() => {
        if (typeof window === 'undefined' || audioContextRef.current) return;

        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            gainNodeRef.current = audioContextRef.current.createGain();
            gainNodeRef.current.connect(audioContextRef.current.destination);
            gainNodeRef.current.gain.value = 0;
            setIsAudioEnabled(true);
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }, []);

    // Create ambient drone sound
    const createAmbientDrone = useCallback(() => {
        if (!audioContextRef.current || !gainNodeRef.current) return;

        // Clean up existing oscillator
        if (oscillatorRef.current) {
            oscillatorRef.current.stop();
        }

        const ctx = audioContextRef.current;

        // Create low-frequency oscillator for ambient feel
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 60 + currentScene * 10; // Slightly higher pitch as we progress

        // Create filter for warmth
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        filter.Q.value = 1;

        // Connect nodes
        osc.connect(filter);
        filter.connect(gainNodeRef.current);

        oscillatorRef.current = osc;
        osc.start();

        return osc;
    }, [currentScene]);

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (!isAudioEnabled) {
            initAudio();
        }

        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }

        setIsMuted((prev) => {
            const newMuted = !prev;

            if (gainNodeRef.current) {
                gainNodeRef.current.gain.linearRampToValueAtTime(
                    newMuted ? 0 : 0.03,
                    audioContextRef.current!.currentTime + 0.5
                );
            }

            if (!newMuted && !oscillatorRef.current) {
                createAmbientDrone();
            }

            return newMuted;
        });
    }, [isAudioEnabled, initAudio, createAmbientDrone]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Update drone based on scene
    useEffect(() => {
        if (!isMuted && oscillatorRef.current) {
            oscillatorRef.current.frequency.linearRampToValueAtTime(
                60 + currentScene * 15,
                audioContextRef.current!.currentTime + 1
            );
        }
    }, [currentScene, isMuted]);

    return (
        <motion.div
            className="audio-controller"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 2 }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <motion.button
                className={`audio-controller__button ${!isMuted ? 'audio-controller__button--active' : ''}`}
                onClick={toggleAudio}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isMuted ? 'Enable ambient audio' : 'Mute audio'}
                aria-pressed={!isMuted}
            >
                {/* Sound Wave Icon */}
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    {!isMuted && (
                        <>
                            <motion.path
                                d="M15.54 8.46a5 5 0 0 1 0 7.07"
                                initial={{ opacity: 0, pathLength: 0 }}
                                animate={{ opacity: 1, pathLength: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                            <motion.path
                                d="M19.07 4.93a10 10 0 0 1 0 14.14"
                                initial={{ opacity: 0, pathLength: 0 }}
                                animate={{ opacity: 1, pathLength: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            />
                        </>
                    )}
                    {isMuted && (
                        <motion.path
                            d="M23 9l-6 6M17 9l6 6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        />
                    )}
                </svg>

                {/* Active Indicator Ring */}
                {!isMuted && (
                    <motion.span
                        className="audio-controller__ring"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                )}
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        className="audio-controller__tooltip"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isMuted ? 'Enable Ambient Sound' : 'Mute'}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
