'use client';

import ExperienceProvider from '@/components/ExperienceProvider';

export default function Home() {
    return (
        <main>
            {/* The 3D Experience with all UI overlays */}
            <ExperienceProvider />

            {/* Scroll Spacer - provides scroll height for the experience */}
            <div className="scroll-content" aria-hidden="true">
                {/* Section 0: Preload / Entry */}
                <section className="scroll-section" data-section="0" aria-label="Introduction">
                    <div className="scroll-section__inner" />
                </section>

                {/* Section 1: Hero / Brand */}
                <section className="scroll-section" data-section="1" aria-label="Meridian Capital">
                    <div className="scroll-section__inner" />
                </section>

                {/* Section 2: Portfolio Overview */}
                <section className="scroll-section" data-section="2" aria-label="Portfolio Overview">
                    <div className="scroll-section__inner" />
                </section>

                {/* Section 3: Property Focus */}
                <section className="scroll-section" data-section="3" aria-label="Property Details">
                    <div className="scroll-section__inner" />
                </section>

                {/* Section 4: Analytics */}
                <section className="scroll-section" data-section="4" aria-label="Analytics Dashboard">
                    <div className="scroll-section__inner" />
                </section>

                {/* Section 5: Gallery & Footer */}
                <section className="scroll-section" data-section="5" aria-label="Gallery">
                    <div className="scroll-section__inner" />
                </section>

                {/* Extra scroll space for footer reveal */}
                <section className="scroll-section scroll-section--footer" data-section="6" aria-label="Contact">
                    <div className="scroll-section__inner" />
                </section>
            </div>
        </main>
    );
}
