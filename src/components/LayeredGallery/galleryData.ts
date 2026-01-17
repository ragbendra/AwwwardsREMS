// Gallery image data with layer assignments and positioning
// 18 curated images distributed across 5 depth layers

export interface PropertyStats {
    value: string;
    units: number;
    occupancy: number;
    yearAcquired: number;
    appreciation: string;
}

export interface GalleryImageData {
    id: string;
    src: string;
    alt: string;
    title: string;
    location: string;
    detail: string;
    layer: 1 | 2 | 3 | 4 | 5;
    position: { x: number; y: number };
    rotation: number;
    scale: number;
    // Extended fields for detail page
    narrative: string;
    architect: string;
    awards: string[];
    stats: PropertyStats;
    additionalImages: string[];
    // New fields for modal enhancement
    architecturalIntent: string; // 8-10 word design logic statement
    investmentThesis: string; // One-sentence strategic explanation
}

// Layer speed multipliers for parallax effect
export const LAYER_CONFIG = {
    1: { speed: 0.3, blur: 4, opacity: 0.4, scale: 0.7, name: 'Far Background' },
    2: { speed: 0.5, blur: 2, opacity: 0.6, scale: 0.85, name: 'Mid-Background' },
    3: { speed: 0.7, blur: 0, opacity: 0.8, scale: 0.95, name: 'Mid-Foreground' },
    4: { speed: 1.0, blur: 0, opacity: 1.0, scale: 1.0, name: 'Near Foreground' },
    5: { speed: 1.2, blur: 0, opacity: 0.9, scale: 1.1, name: 'Ultra-Foreground' },
} as const;

// Generate random position within bounds
const randomPosition = (xRange: [number, number], yRange: [number, number]) => ({
    x: xRange[0] + Math.random() * (xRange[1] - xRange[0]),
    y: yRange[0] + Math.random() * (yRange[1] - yRange[0]),
});

// Generate random rotation between -2 and 2 degrees
const randomRotation = () => (Math.random() - 0.5) * 4;

// Generate random scale variation
const randomScale = (base: number) => base + (Math.random() - 0.5) * 0.1;

// Default stats generator for realistic property data
const createStats = (value: string, units: number, occupancy: number, year: number, appreciation: string): PropertyStats => ({
    value,
    units,
    occupancy,
    yearAcquired: year,
    appreciation,
});

export const galleryImages: GalleryImageData[] = [
    // Layer 1 - Far Background (atmospheric, small)
    {
        id: 'img-1',
        src: '/images/modern_building_glass_facade.png',
        alt: 'Modern glass tower at dusk',
        title: 'The Obsidian Tower',
        location: 'Tribeca, Manhattan',
        detail: 'Floor-to-ceiling glass by Foster + Partners',
        layer: 1,
        position: randomPosition([5, 25], [10, 30]),
        rotation: randomRotation(),
        scale: randomScale(0.7),
        narrative: 'Rising 58 stories above the Tribeca waterfront, The Obsidian Tower represents the pinnacle of contemporary architectural achievement. Its distinctive dark glass facade, engineered by Foster + Partners, creates an ever-changing canvas that reflects the Manhattan skyline while maintaining thermal efficiency. The building has redefined luxury living in Lower Manhattan, attracting discerning residents who appreciate the marriage of form and function.',
        architect: 'Foster + Partners',
        awards: ['AIA Design Excellence 2021', 'CTBUH Best Tall Building Americas'],
        stats: createStats('$485M', 127, 98, 2019, '+34%'),
        additionalImages: ['/images/penthouse_interior.png', '/images/rooftop_terrace.png'],
        architecturalIntent: 'Dark glass maximizes thermal efficiency while reflecting sky.',
        investmentThesis: 'Prime waterfront location with constrained luxury supply.',
    },
    {
        id: 'img-2',
        src: '/images/architectural_detail.png',
        alt: 'Abstract architectural lines',
        title: 'Structural Poetry',
        location: 'SoHo Historic',
        detail: 'Award-winning facade design',
        layer: 1,
        position: randomPosition([65, 85], [40, 60]),
        rotation: randomRotation(),
        scale: randomScale(0.7),
        narrative: 'This SoHo landmark seamlessly bridges the historic cast-iron district with contemporary design language. The facade preserves original 19th-century ironwork while introducing modern interventions that respect the neighborhood\'s artistic heritage. Each structural element tells a story of New York\'s evolution from industrial hub to global creative capital.',
        architect: 'OMA / Rem Koolhaas',
        awards: ['Landmarks Preservation Award', 'NYT Best New Architecture 2020'],
        stats: createStats('$178M', 42, 100, 2018, '+52%'),
        additionalImages: ['/images/modern_office_lobby.png', '/images/luxury_apartment_interior.png'],
        architecturalIntent: 'Historic ironwork preserved, modern systems integrated within.',
        investmentThesis: 'Landmarked asset with premium tenant demand.',
    },
    {
        id: 'img-3',
        src: '/images/penthouse_interior.png',
        alt: 'Penthouse living space',
        title: 'Sky Residence',
        location: 'Upper East Side',
        detail: 'Italian marble, hand-cut details',
        layer: 1,
        position: randomPosition([35, 55], [70, 90]),
        rotation: randomRotation(),
        scale: randomScale(0.7),
        narrative: 'Perched atop one of the Upper East Side\'s most prestigious addresses, this penthouse exemplifies understated luxury. Every surface features hand-selected Calacatta marble from the Italian quarries of Carrara. The space flows effortlessly between formal entertaining areas and intimate family spaces, all bathed in natural light from floor-to-ceiling windows overlooking Central Park.',
        architect: 'Robert A.M. Stern Architects',
        awards: ['Interior Design Hall of Fame', 'AD100 Designer Residence'],
        stats: createStats('$89M', 1, 100, 2017, '+67%'),
        additionalImages: ['/images/rooftop_terrace.png', '/images/architectural_detail.png'],
        architecturalIntent: 'Natural light optimization through double-height fenestration.',
        investmentThesis: 'Ultra-luxury single-asset with irreplaceable views.',
    },

    // Layer 2 - Mid-Background
    {
        id: 'img-4',
        src: '/images/rooftop_terrace.png',
        alt: 'Rooftop terrace at sunset',
        title: 'Sky Lounge',
        location: 'Hudson Yards',
        detail: 'Private marina access',
        layer: 2,
        position: randomPosition([10, 35], [15, 35]),
        rotation: randomRotation(),
        scale: randomScale(0.85),
        narrative: 'The Sky Lounge defines a new paradigm for urban outdoor living. Spanning 15,000 square feet across Hudson Yards\' most elevated private terrace, it features curated botanical gardens, a temperature-controlled infinity pool, and unobstructed 360-degree views of the Hudson River and Manhattan skyline. The space transforms from serene morning yoga sanctuary to sophisticated evening entertainment venue.',
        architect: 'Diller Scofidio + Renfro',
        awards: ['Urban Land Institute Excellence', 'ASLA Honor Award'],
        stats: createStats('$312M', 89, 97, 2020, '+28%'),
        additionalImages: ['/images/modern_building_glass_facade.png', '/images/luxury_apartment_interior.png'],
        architecturalIntent: 'Elevated terraces create layered outdoor living zones.',
        investmentThesis: 'Amenity-rich development in emerging commercial corridor.',
    },
    {
        id: 'img-5',
        src: '/images/luxury_apartment_interior.png',
        alt: 'Designer apartment interior',
        title: 'Designer Living',
        location: 'Williamsburg',
        detail: 'LEED Platinum certified',
        layer: 2,
        position: randomPosition([55, 80], [25, 45]),
        rotation: randomRotation(),
        scale: randomScale(0.85),
        narrative: 'This Williamsburg development reimagines sustainable luxury for the environmentally conscious urbanite. Every unit achieves LEED Platinum certification without compromising on aesthetics or comfort. Reclaimed Brooklyn warehouse timbers meet cutting-edge German engineering in kitchens designed for both professional chefs and weekend entertainers.',
        architect: 'Bjarke Ingels Group (BIG)',
        awards: ['LEED Platinum', 'Green Building Council Innovation Award'],
        stats: createStats('$156M', 64, 99, 2021, '+19%'),
        additionalImages: ['/images/architectural_detail.png', '/images/modern_office_lobby.png'],
        architecturalIntent: 'Passive systems reduce operating costs by forty percent.',
        investmentThesis: 'ESG-compliant asset attracting institutional capital.',
    },
    {
        id: 'img-6',
        src: '/images/modern_office_lobby.png',
        alt: 'Executive lobby entrance',
        title: 'The Grand Lobby',
        location: 'Midtown Manhattan',
        detail: '38-floor tower by SOM',
        layer: 2,
        position: randomPosition([20, 45], [55, 75]),
        rotation: randomRotation(),
        scale: randomScale(0.85),
        narrative: 'The Grand Lobby serves as the ceremonial threshold between the energy of Midtown Manhattan and the serene sophistication within. Triple-height ceilings soar above a curated collection of contemporary art, while bespoke stone flooring guides visitors through the space. This is not merely an entrance—it is an experience that announces arrival.',
        architect: 'Skidmore, Owings & Merrill',
        awards: ['BOMA Earth Award', 'CoreNet Global Innovator'],
        stats: createStats('$892M', 245, 94, 2016, '+41%'),
        additionalImages: ['/images/modern_building_glass_facade.png', '/images/penthouse_interior.png'],
        architecturalIntent: 'Triple-height atrium establishes ceremonial arrival sequence.',
        investmentThesis: 'Class A office in supply-constrained Midtown submarket.',
    },
    {
        id: 'img-7',
        src: '/images/modern_building_glass_facade.png',
        alt: 'Glass tower reflection',
        title: 'Morning Light',
        location: 'Chelsea',
        detail: 'Sunrise east exposure',
        layer: 2,
        position: randomPosition([60, 85], [65, 85]),
        rotation: randomRotation(),
        scale: randomScale(0.85),
        narrative: 'Morning Light captures its namesake phenomenon through a facade engineered specifically for the golden hour. East-facing units awaken to unfiltered sunrise views over the East River, while specialized low-iron glass ensures color-true natural light floods every corner. This Chelsea landmark has become synonymous with the neighborhood\'s gallery district aesthetic.',
        architect: 'Jean Nouvel Ateliers',
        awards: ['NYC Green Building Award', 'AIA NY Design Award'],
        stats: createStats('$267M', 78, 96, 2019, '+31%'),
        additionalImages: ['/images/luxury_apartment_interior.png', '/images/rooftop_terrace.png'],
        architecturalIntent: 'East orientation engineered for optimal morning light.',
        investmentThesis: 'Gallery district location with creative professional demand.',
    },

    // Layer 3 - Mid-Foreground (primary shots)
    {
        id: 'img-8',
        src: '/images/rooftop_terrace.png',
        alt: 'Waterfront terrace',
        title: 'Horizon Gardens',
        location: 'Brooklyn Heights',
        detail: 'Sustainable design by BIG',
        layer: 3,
        position: randomPosition([5, 30], [20, 40]),
        rotation: randomRotation(),
        scale: randomScale(0.95),
        narrative: 'Horizon Gardens reimagines the relationship between urban density and natural environment. BIG\'s signature cascading terraces create private garden spaces for each unit while contributing to a larger ecosystem of green roofs and vertical gardens. The development has become a case study in biophilic design, demonstrating that sustainable architecture can enhance both property values and quality of life.',
        architect: 'Bjarke Ingels Group (BIG)',
        awards: ['AIA COTE Top Ten', 'World Architecture Festival Winner'],
        stats: createStats('$423M', 112, 98, 2020, '+25%'),
        additionalImages: ['/images/architectural_detail.png', '/images/modern_building_glass_facade.png'],
        architecturalIntent: 'Cascading terraces maximize private outdoor space.',
        investmentThesis: 'Biophilic design commands premium in post-pandemic market.',
    },
    {
        id: 'img-9',
        src: '/images/penthouse_interior.png',
        alt: 'Luxury bedroom suite',
        title: 'Master Suite',
        location: 'Tribeca Landmark',
        detail: 'Carrara marble throughout',
        layer: 3,
        position: randomPosition([40, 65], [10, 30]),
        rotation: randomRotation(),
        scale: randomScale(0.95),
        narrative: 'The Master Suite at Tribeca Landmark sets a new standard for bedroom design. Walls of Carrara marble create a serene backdrop, while automated glass panels can transform the space from an open loft to an intimate sanctuary. The adjacent spa bathroom features a soaking tub carved from a single block of stone, positioned to capture the sunset over the Hudson.',
        architect: 'Peter Marino Architect',
        awards: ['Elle Decor A-List', 'Robb Report Best of the Best'],
        stats: createStats('$52M', 1, 100, 2018, '+48%'),
        additionalImages: ['/images/luxury_apartment_interior.png', '/images/rooftop_terrace.png'],
        architecturalIntent: 'Marble walls create serene spatial continuity throughout.',
        investmentThesis: 'Trophy penthouse with irreplaceable Hudson River views.',
    },
    {
        id: 'img-10',
        src: '/images/architectural_detail.png',
        alt: 'Gold accent detail',
        title: 'Glass & Gold',
        location: 'Financial District',
        detail: '46% appreciation since acquisition',
        layer: 3,
        position: randomPosition([65, 90], [35, 55]),
        rotation: randomRotation(),
        scale: randomScale(0.95),
        narrative: 'Glass & Gold represents our most successful value-creation story. Acquired in 2018, this Financial District tower has undergone a complete repositioning that honors its Art Deco heritage while introducing contemporary luxury finishes. The original brass elevator doors and lobby details have been restored to their 1930s splendor, now complemented by modern amenities that today\'s discerning tenants demand.',
        architect: 'Beyer Blinder Belle',
        awards: ['NY Landmarks Conservancy Award', 'REBNY Deal of the Year'],
        stats: createStats('$634M', 189, 97, 2018, '+46%'),
        additionalImages: ['/images/modern_office_lobby.png', '/images/modern_building_glass_facade.png'],
        architecturalIntent: 'Art Deco restoration meets contemporary building systems.',
        investmentThesis: 'Value-add repositioning in transit-rich location.',
    },
    {
        id: 'img-11',
        src: '/images/luxury_apartment_interior.png',
        alt: 'Open concept living',
        title: 'Urban Oasis',
        location: 'Dumbo',
        detail: 'Zero vacancy since launch',
        layer: 3,
        position: randomPosition([15, 40], [55, 75]),
        rotation: randomRotation(),
        scale: randomScale(0.95),
        narrative: 'Urban Oasis has maintained perfect occupancy since its debut—a testament to its thoughtful design and unparalleled location. Each residence balances the raw industrial character of Dumbo\'s waterfront with refined modern finishes. Exposed concrete columns and original timber beams provide authentic texture, while curated views of the Manhattan Bridge create living art in every unit.',
        architect: 'Alloy Development',
        awards: ['Brooklyn Chamber of Commerce Excellence', 'Curbed Building of the Year'],
        stats: createStats('$287M', 94, 100, 2019, '+38%'),
        additionalImages: ['/images/rooftop_terrace.png', '/images/architectural_detail.png'],
        architecturalIntent: 'Industrial character preserved with refined modern finishes.',
        investmentThesis: 'Zero vacancy since launch validates location thesis.',
    },

    // Layer 4 - Near Foreground (hero images)
    {
        id: 'img-12',
        src: '/images/modern_building_glass_facade.png',
        alt: 'Tower at golden hour',
        title: 'Obsidian at Dusk',
        location: 'Tribeca',
        detail: 'Featured in Architectural Digest 2022',
        layer: 4,
        position: randomPosition([8, 35], [15, 35]),
        rotation: randomRotation(),
        scale: randomScale(1.0),
        narrative: 'This evening photograph captures the Obsidian Tower at its most transcendent moment. As the sun sets behind Jersey City, the building\'s dark glass facade transforms into a mirror reflecting the entire Manhattan skyline. Architectural Digest featured this image in their 2022 special edition on New York\'s new generation of luxury towers, calling it "a building that belongs to the city and the sky equally."',
        architect: 'Foster + Partners',
        awards: ['AD Photo of the Year', 'International Photography Awards'],
        stats: createStats('$485M', 127, 98, 2019, '+34%'),
        additionalImages: ['/images/penthouse_interior.png', '/images/rooftop_terrace.png'],
        architecturalIntent: 'Facade transforms into skyline mirror at dusk.',
        investmentThesis: 'Iconic silhouette generates sustained media value.',
    },
    {
        id: 'img-13',
        src: '/images/rooftop_terrace.png',
        alt: 'Panoramic city view',
        title: 'City Canvas',
        location: 'NoMad',
        detail: '360° Manhattan views',
        layer: 4,
        position: randomPosition([50, 75], [20, 40]),
        rotation: randomRotation(),
        scale: randomScale(1.0),
        narrative: 'City Canvas offers what few buildings in Manhattan can claim: unobstructed 360-degree views from the Statue of Liberty to the George Washington Bridge. The rooftop observatory has become a landmark in its own right, hosting exclusive events for Fortune 500 companies and private celebrations. On clear nights, residents gather to watch the city lights emerge as the sun descends.',
        architect: 'KPF (Kohn Pedersen Fox)',
        awards: ['Emporis Skyscraper Award', 'MIPIM Best Urban Regeneration'],
        stats: createStats('$567M', 156, 95, 2017, '+43%'),
        additionalImages: ['/images/modern_building_glass_facade.png', '/images/luxury_apartment_interior.png'],
        architecturalIntent: 'Unobstructed 360-degree views from every floor.',
        investmentThesis: 'Rooftop observatory generates ancillary revenue streams.',
    },
    {
        id: 'img-14',
        src: '/images/modern_office_lobby.png',
        alt: 'Atrium with natural light',
        title: 'Light Well',
        location: 'Hudson Square',
        detail: 'Premium corporate tenants',
        layer: 4,
        position: randomPosition([20, 45], [50, 70]),
        rotation: randomRotation(),
        scale: randomScale(1.0),
        narrative: 'Light Well transformed an underperforming 1970s office building into Hudson Square\'s most sought-after corporate address. The signature intervention: a dramatic skylit atrium carved through the building\'s center, bringing natural light to every floor. This single gesture increased rentable rates by 40% and attracted a roster of creative industry tenants including major tech firms and design studios.',
        architect: 'REX Architecture',
        awards: ['AIANY Merit Award', 'Commercial Observer Game Changer'],
        stats: createStats('$412M', 198, 94, 2016, '+58%'),
        additionalImages: ['/images/architectural_detail.png', '/images/penthouse_interior.png'],
        architecturalIntent: 'Central atrium brings daylight to every floor.',
        investmentThesis: 'Repositioning increased rents by forty percent.',
    },
    {
        id: 'img-15',
        src: '/images/penthouse_interior.png',
        alt: 'Minimalist luxury',
        title: 'Pure Form',
        location: 'Soho',
        detail: 'Bespoke millwork throughout',
        layer: 4,
        position: randomPosition([55, 80], [55, 75]),
        rotation: randomRotation(),
        scale: randomScale(1.0),
        narrative: 'Pure Form represents the marriage of Japanese minimalism and European craftsmanship. Every cabinet, every door, every surface was designed specifically for this space by master woodworkers from Milan. The result is an environment of profound serenity in the heart of SoHo\'s bustle—a refuge where the discipline of design creates space for life\'s meaningful moments.',
        architect: 'Tadao Ando Architect & Associates',
        awards: ['Pritzker Prize Residence', 'Wallpaper* Design Award'],
        stats: createStats('$78M', 1, 100, 2020, '+22%'),
        additionalImages: ['/images/architectural_detail.png', '/images/rooftop_terrace.png'],
        architecturalIntent: 'Japanese minimalism creates profound spatial serenity.',
        investmentThesis: 'Pritzker architect signature commands collector premium.',
    },

    // Layer 5 - Ultra-Foreground (detail close-ups)
    {
        id: 'img-16',
        src: '/images/architectural_detail.png',
        alt: 'Material texture close-up',
        title: 'Tactile Luxury',
        location: 'Various',
        detail: 'Materials sourced globally',
        layer: 5,
        position: randomPosition([5, 25], [25, 45]),
        rotation: randomRotation(),
        scale: randomScale(1.1),
        narrative: 'Our commitment to material excellence defines every Meridian property. This close study reveals the attention we bring to every surface: hand-selected marbles from Tuscany, brass fittings aged to a perfect patina, timber dried for decades before milling. These materials are not merely specified—they are curated with the same care a museum brings to its permanent collection.',
        architect: 'Various Studios',
        awards: ['Material ConneXion Innovation', 'Surface Magazine Best Surface'],
        stats: createStats('—', 0, 100, 2015, '+35%'),
        additionalImages: ['/images/penthouse_interior.png', '/images/modern_office_lobby.png'],
        architecturalIntent: 'Material selection curated with museum-level precision.',
        investmentThesis: 'Portfolio-wide specification ensures brand consistency.',
    },
    {
        id: 'img-17',
        src: '/images/luxury_apartment_interior.png',
        alt: 'Crafted detail',
        title: 'Artisan Touch',
        location: 'Gramercy',
        detail: 'Hand-finished every detail',
        layer: 5,
        position: randomPosition([60, 85], [30, 50]),
        rotation: randomRotation(),
        scale: randomScale(1.1),
        narrative: 'Artisan Touch celebrates the human hand in an age of mass production. This Gramercy residence features wood-burning techniques passed down through generations of Japanese craftsmen, metalwork by Brooklyn artisans trained in traditional European methods, and textiles woven on looms that predate the industrial revolution. Every imperfection is intentional—evidence of the maker\'s presence.',
        architect: 'Snøhetta',
        awards: ['Craftsmanship Guild Master Award', 'Dezeen Interiors Longlist'],
        stats: createStats('$34M', 1, 100, 2021, '+15%'),
        additionalImages: ['/images/rooftop_terrace.png', '/images/modern_building_glass_facade.png'],
        architecturalIntent: 'Handcraft techniques create intentional tactile imperfection.',
        investmentThesis: 'Artisan differentiation in commoditized luxury market.',
    },
    {
        id: 'img-18',
        src: '/images/modern_building_glass_facade.png',
        alt: 'Facade pattern',
        title: 'Rhythm in Glass',
        location: 'Flatiron',
        detail: 'Engineered perfection',
        layer: 5,
        position: randomPosition([30, 55], [60, 80]),
        rotation: randomRotation(),
        scale: randomScale(1.1),
        narrative: 'Rhythm in Glass achieves what few curtain walls can: genuine visual interest at every scale. From the street, the subtle variations in glass tinting create a moire pattern that shifts with the viewer\'s perspective. Up close, the mullion system reveals an intricate geometry inspired by the Flatiron Building\'s original ironwork. This is facade design as urban contribution.',
        architect: 'Herzog & de Meuron',
        awards: ['Facade Tectonics Award', 'Glass Performance Days Innovation'],
        stats: createStats('$345M', 86, 96, 2018, '+29%'),
        additionalImages: ['/images/luxury_apartment_interior.png', '/images/architectural_detail.png'],
        architecturalIntent: 'Glass tinting variations create dynamic moire patterns.',
        investmentThesis: 'Landmark facade generates street-level recognition value.',
    },
];

// Get images by layer
export const getImagesByLayer = (layer: 1 | 2 | 3 | 4 | 5) =>
    galleryImages.filter(img => img.layer === layer);

// Get image by ID
export const getImageById = (id: string) =>
    galleryImages.find(img => img.id === id);

// Responsive layer configurations
export const RESPONSIVE_LAYERS = {
    desktop: [1, 2, 3, 4, 5] as const,
    tablet: [1, 3, 4] as const,
    mobile: [3, 4] as const,
};
