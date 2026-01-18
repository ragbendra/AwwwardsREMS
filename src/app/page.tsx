'use client';

import ExperienceProvider from '@/components/ExperienceProvider';

export default function Home() {
    return (
        <main>
            <ExperienceProvider />

            {/* Scroll Spacer - 6 sections aligned to 6 scenes (0-5) */}
            <div className="scroll-content" aria-hidden="true">
                {/* Section 0: Preload (instant) */}
                <section className="scroll-section" data-section="0" aria-label="Entry">
                    <div className="scroll-section__inner" />
                </section>

                {/* Section 1: Hero (0.00-0.15) */}
                <section className="scroll-section" data-section="1" aria-label="Meridian Capital">
                    <div className="scroll-section__inner" />
                </section>

                {/* Section 2: Portfolio (0.15-0.50) */}
                <section className="scroll-section" data-section="2" aria-label="Portfolio Overview">
                    <div className="scroll-section__inner" />
                </section>

                {/* Section 3: Gallery (0.50-0.75) */}
                <section className="scroll-section" data-section="3" aria-label="Property Gallery">
                    <div className="scroll-section__inner" />
                </section>

                {/* Section 4: Analytics (0.75-0.90) */}
                <section className="scroll-section" data-section="4" aria-label="Analytics Dashboard">
                    <div className="scroll-section__inner" />
                </section>

                {/* Section 5: God View & Footer (0.90-1.00) */}
                <section className="scroll-section scroll-section--footer" data-section="5" aria-label="Overview & Contact">
                    <div className="scroll-section__inner" />
                </section>
            </div>
        </main>
    );
}
