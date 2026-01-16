'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
    progress: number; // 0 to 1
    isVisible: boolean;
}

export default function ProgressBar({ progress, isVisible }: ProgressBarProps) {
    // ARIA announcements at key milestones
    const milestoneAnnouncement =
        progress >= 0.75 ? '75% through gallery' :
            progress >= 0.5 ? '50% through gallery' :
                progress >= 0.25 ? '25% through gallery' :
                    null;

    if (!isVisible) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'rgba(201, 169, 98, 0.2)',
                    zIndex: 60,
                }}
            >
                <motion.div
                    style={{
                        height: '100%',
                        background: 'var(--color-accent)',
                        opacity: 0.5,
                        width: `${progress * 100}%`,
                        transition: 'width 0.1s linear',
                    }}
                />
            </motion.div>

            {/* ARIA live region for screen readers */}
            {milestoneAnnouncement && (
                <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    style={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        padding: 0,
                        margin: '-1px',
                        overflow: 'hidden',
                        clip: 'rect(0, 0, 0, 0)',
                        whiteSpace: 'nowrap',
                        border: 0,
                    }}
                >
                    {milestoneAnnouncement}
                </div>
            )}
        </>
    );
}
