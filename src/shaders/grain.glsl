// Film Grain Shader
// Creates cinematic film grain effect

// Vertex Shader
#ifdef VERTEX
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
#endif

// Fragment Shader
#ifdef FRAGMENT
uniform float uTime;
uniform float uIntensity;
uniform vec2 uResolution;

varying vec2 vUv;

// Noise functions
float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv;
  
  // Time-varying grain
  float grain = random(uv * uResolution + mod(uTime * 1000.0, 1000.0));
  
  // Multi-octave noise for organic feel
  float n = noise(uv * 200.0 + uTime * 10.0);
  n += noise(uv * 400.0 - uTime * 5.0) * 0.5;
  n += noise(uv * 800.0 + uTime * 2.0) * 0.25;
  n /= 1.75;
  
  // Blend grain types
  float finalGrain = mix(grain, n, 0.3);
  
  // Apply intensity
  float grainAmount = (finalGrain - 0.5) * uIntensity;
  
  gl_FragColor = vec4(vec3(0.5 + grainAmount), 1.0);
}
#endif
