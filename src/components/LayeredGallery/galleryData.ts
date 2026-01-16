// Gallery image data with layer assignments and positioning
// 18 curated images distributed across 5 depth layers

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
    },
];

// Get images by layer
export const getImagesByLayer = (layer: 1 | 2 | 3 | 4 | 5) =>
    galleryImages.filter(img => img.layer === layer);

// Responsive layer configurations
export const RESPONSIVE_LAYERS = {
    desktop: [1, 2, 3, 4, 5] as const,
    tablet: [1, 3, 4] as const,
    mobile: [3, 4] as const,
};
