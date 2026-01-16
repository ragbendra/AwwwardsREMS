// GLSL Shader declarations
declare module '*.glsl' {
    const content: string;
    export default content;
}

declare module '*.vert' {
    const content: string;
    export default content;
}

declare module '*.frag' {
    const content: string;
    export default content;
}

// JSON module declarations
declare module '*.json' {
    const content: unknown;
    export default content;
}
