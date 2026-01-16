// Volumetric Fog Shader
// Creates atmospheric depth fog with soft falloff

// Vertex Shader
#ifdef VERTEX
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vFogDepth;

uniform vec3 uCameraPosition;
uniform float uFogNear;
uniform float uFogFar;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vNormal = normalize(normalMatrix * normal);
  
  // Calculate fog depth
  float distance = length(worldPosition.xyz - uCameraPosition);
  vFogDepth = smoothstep(uFogNear, uFogFar, distance);
  
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
#endif

// Fragment Shader
#ifdef FRAGMENT
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uTime;
uniform vec3 uLightPosition;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vFogDepth;

// Noise for organic fog variation
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise3D(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
        mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
        mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise3D(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return value;
}

void main() {
  // Animated fog variation
  vec3 animatedPos = vWorldPosition + vec3(uTime * 0.1, 0.0, uTime * 0.05);
  float fogNoise = fbm(animatedPos * 0.1);
  
  // Height-based fog
  float heightFog = smoothstep(-5.0, 15.0, vWorldPosition.y);
  
  // Combine fog factors
  float finalFog = vFogDepth * uFogDensity * (1.0 - heightFog * 0.3);
  finalFog *= 0.8 + fogNoise * 0.4;
  
  // Light scattering in fog
  vec3 lightDir = normalize(uLightPosition - vWorldPosition);
  float scatter = max(dot(vNormal, lightDir), 0.0) * 0.2;
  
  vec3 fogWithScatter = uFogColor + vec3(scatter);
  
  gl_FragColor = vec4(fogWithScatter, finalFog);
}
#endif
