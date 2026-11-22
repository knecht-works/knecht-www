import {
  Camera,
  GLSL3,
  Mesh,
  NearestFilter,
  PerspectiveCamera,
  PlaneGeometry,
  RawShaderMaterial,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import type { IUniform, Material, Object3D, RenderTargetOptions } from 'three'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const DEG = Math.PI / 180

const rgb = (hex: string) => new Vector3(...[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255))
const PALETTE: Record<string, [string, string]> = {
  green: ['#B7F8A2', '#6BA96D'],
  joint: ['#B46258', '#B46258'],
  screen: ['#FA7A2C', '#FA7A2C'],
  glint: ['#FCC46E', '#FCC46E'],
  black: ['#000000', '#000000']
}
type Lighting = { light: Vector3, threshold: number }
// From the upper right, where the hero background glows.
const BODY: Lighting = { light: new Vector3(0.35, 0.8, 0.5).normalize(), threshold: 0.1 }
// The head turns with the cursor. Lit from straight above, only its underside is shaded,
// so no flat face switches tone while it moves.
const HEAD: Lighting = { light: new Vector3(0, 1, 0), threshold: -0.5 }
// Arms and legs swing and bend. Only faces that point steeply down are shaded, so a limb
// keeps its tone through the whole move.
const LIMB: Lighting = { light: new Vector3(0, 1, 0), threshold: -0.8 }
// Parts that sit in permanent shadow: they always take the shade tone of their material.
const OCCLUDED = ['head_lining', 'yoke']
const MAX_RADIUS = 20

// The canvas is larger than the artwork box so a raised arm or a turned head is not clipped.
const BLEED = { top: 0.2, right: 0.45, left: 0.3 }
const ARTWORK_ASPECT = 654 / 1199
const INNER_LINE = 5.5 / 600
const OUTER_LINE = 8 / 600

const REST_POSE: Record<string, [number, number, number]> = {
  mascot: [0, -28, 0],
  head: [0, -17, 0],
  arm_R: [0, 0, -10],
  arm_L: [0, 0, 2],
  hand_R: [0, 20, -10],
  hand_L: [0, 35, 10]
}

const partMaterial = (lit: string, shade: string, id: number, { light, threshold }: Lighting, occluded: boolean) => new RawShaderMaterial({
  glslVersion: GLSL3,
  uniforms: {
    uLit: { value: rgb(lit) },
    uShade: { value: rgb(shade) },
    uLight: { value: light },
    uThreshold: { value: threshold },
    uOccluded: { value: occluded ? 1 : 0 },
    uId: { value: id / 255 }
  },
  vertexShader: `
    in vec3 position; in vec3 normal;
    uniform mat4 modelMatrix; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
    out vec3 vNormal;
    void main() {
      vNormal = mat3(modelMatrix) * normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `
    precision highp float;
    uniform vec3 uLit; uniform vec3 uShade; uniform vec3 uLight; uniform float uThreshold; uniform float uOccluded; uniform float uId;
    in vec3 vNormal;
    layout(location = 0) out vec4 oColor;
    layout(location = 1) out vec4 oId;
    void main() {
      float d = dot(normalize(vNormal), uLight) - uThreshold;
      float w = fwidth(d) * 0.75;
      float lit = smoothstep(-w, w, d);
      oColor = vec4(mix(uShade, uLit, lit * (1.0 - uOccluded)), 1.0);
      oId = vec4(uId, 0.0, 0.0, 1.0);
    }`
})

const pass = (uniforms: Record<string, IUniform>, body: string) => new RawShaderMaterial({
  glslVersion: GLSL3,
  depthTest: false,
  depthWrite: false,
  uniforms,
  vertexShader: `in vec3 position; void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `
    precision highp float;
    uniform sampler2D uMap; uniform vec2 uTexel;
    out vec4 oColor;
    vec4 at(sampler2D map, float x, float y) { return texture(map, (gl_FragCoord.xy + vec2(x, y)) * uTexel); }
    ${body}`
})

// A bent knee exposes the thigh's cut end, which would show as a dark stripe above the seam.
const THIGH: Lighting = { light: new Vector3(0, 1, 0), threshold: -2 }

const lighting = (o: Object3D) => {
  if (o.name.startsWith('head_')) return HEAD
  if (/^leg_._upper/.test(o.name)) return THIGH
  for (let p = o.parent; p; p = p.parent) {
    if (p.name.startsWith('arm_') || p.name.startsWith('leg_')) return LIMB
  }
  return BODY
}

export async function createMascot(canvas: HTMLCanvasElement, url: string) {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url)
  const joints: Record<string, Object3D> = {}
  const ids = new Map<string, number>()
  gltf.scene.traverse((o) => {
    if (!(o instanceof Mesh)) {
      joints[o.name] = o
      return
    }
    // Meshes named `part__detail` share the part's id, so no line separates them.
    const key = o.name.split('__')[0]!
    if (!ids.has(key)) ids.set(key, ids.size + 1)
    const [lit, shade] = PALETTE[(o.material as Material).name]!
    o.material = partMaterial(lit, shade, ids.get(key)!, lighting(o), OCCLUDED.includes(key))
  })
  for (const [name, [x, y, z]] of Object.entries(REST_POSE)) {
    joints[name]!.rotation.set(x * DEG, y * DEG, z * DEG)
  }
  // Yaw first, so pitch and roll stay relative to where the head faces.
  joints.head!.rotation.order = 'YXZ'

  const scene = new Scene()
  scene.add(gltf.scene)

  const DIST = 60
  const EYE = 6.5
  const TARGET = 4.9
  const camera = new PerspectiveCamera(2 * Math.atan(10.05 / 2 / DIST) / DEG, ARTWORK_ASPECT, DIST - 20, DIST + 20)
  camera.position.set(0, EYE, Math.sqrt(DIST * DIST - (EYE - TARGET) ** 2))
  camera.lookAt(0, TARGET, 0)

  canvas.style.left = `${-BLEED.left * 100}%`
  canvas.style.width = `${(1 + BLEED.left + BLEED.right) * 100}%`
  canvas.style.height = `${(1 + BLEED.top) * 100}%`
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false })
  renderer.setClearColor(0x000000, 0)
  const target = (options?: RenderTargetOptions) => new WebGLRenderTarget(1, 1, { minFilter: NearestFilter, magFilter: NearestFilter, ...options })
  const parts = target({ count: 2 })
  const edges = target({ depthBuffer: false })
  const rows = target({ depthBuffer: false })
  const full = target({ depthBuffer: false })
  const targets = [parts, edges, rows, full]
  const supersample = { value: 1 }
  const texel = { value: new Vector2() }
  const inner = { value: 2 }
  const outer = { value: 3 }
  const radius = { value: 4 }

  // r: any part boundary, g: boundary against the background
  const edgePass = pass({ uMap: { value: parts.textures[1] }, uTexel: texel }, `
    void main() {
      float c = at(uMap, 0.0, 0.0).r;
      vec4 n = vec4(at(uMap, 1.0, 0.0).r, at(uMap, -1.0, 0.0).r, at(uMap, 0.0, 1.0).r, at(uMap, 0.0, -1.0).r);
      bvec4 differs = greaterThan(abs(n - c), vec4(0.002));
      bool silhouette = any(differs) && (c < 0.002 || any(lessThan(n, vec4(0.002))));
      oColor = vec4(any(differs) ? 1.0 : 0.0, silhouette ? 1.0 : 0.0, 0.0, 1.0);
    }`)
  const rowPass = pass({ uMap: { value: edges.texture }, uTexel: texel, uRadius: radius }, `
    uniform int uRadius;
    void main() {
      vec2 d = vec2(32.0);
      for (int i = -uRadius; i <= uRadius; i++) {
        vec2 e = at(uMap, float(i), 0.0).rg;
        d = mix(d, min(d, vec2(abs(float(i)))), step(0.5, e));
      }
      oColor = vec4(d / 32.0, 0.0, 1.0);
    }`)
  const composite = pass({ uMap: { value: rows.texture }, uColor: { value: parts.textures[0] }, uTexel: texel, uInner: inner, uOuter: outer, uRadius: radius }, `
    uniform sampler2D uColor; uniform float uInner; uniform float uOuter; uniform int uRadius;
    void main() {
      vec2 d = vec2(64.0);
      for (int j = -uRadius; j <= uRadius; j++) {
        vec2 row = at(uMap, 0.0, float(j)).rg * 32.0;
        d = min(d, sqrt(row * row + float(j * j)));
      }
      float line = max(clamp(uInner + 0.5 - d.r, 0.0, 1.0), clamp(uOuter + 0.5 - d.g, 0.0, 1.0));
      vec4 color = at(uColor, 0.0, 0.0);
      float alpha = max(color.a, line);
      oColor = vec4(color.rgb * color.a * (1.0 - line), alpha);
    }`)
  // Lines come from a binary id mask, so they are only smooth after averaging a denser render.
  const resolve = pass({ uMap: { value: full.texture }, uTexel: texel, uScale: supersample }, `
    uniform int uScale;
    void main() {
      ivec2 base = ivec2(gl_FragCoord.xy) * uScale;
      vec4 sum = vec4(0.0);
      for (int i = 0; i < uScale; i++) for (int j = 0; j < uScale; j++) {
        sum += texelFetch(uMap, base + ivec2(i, j), 0);
      }
      oColor = sum / float(uScale * uScale);
    }`)

  const quad = new Mesh(new PlaneGeometry(2, 2), edgePass)
  quad.frustumCulled = false
  const flatCamera = new Camera()
  const run = (material: RawShaderMaterial, to: WebGLRenderTarget | null) => {
    quad.material = material
    renderer.setRenderTarget(to)
    renderer.render(quad, flatCamera)
  }

  return {
    joints,
    /** `width` and `height` are the CSS size of the artwork box, without the bleed. */
    setSize(width: number, height: number) {
      const w = Math.round(width * (1 + BLEED.left + BLEED.right))
      const h = Math.round(height * (1 + BLEED.top))
      camera.setViewOffset(width, height, -BLEED.left * width, height - h, w, h)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h, false)
      const scale = dpr >= 2 ? 2 : 3
      supersample.value = scale
      for (const t of targets) t.setSize(w * dpr * scale, h * dpr * scale)
      texel.value.set(1 / (w * dpr * scale), 1 / (h * dpr * scale))
      inner.value = Math.min(MAX_RADIUS - 1, INNER_LINE * width * dpr * scale / 2)
      outer.value = Math.min(MAX_RADIUS - 1, OUTER_LINE * width * dpr * scale / 2)
      radius.value = Math.ceil(outer.value) + 1
    },
    render() {
      renderer.setRenderTarget(parts)
      renderer.render(scene, camera)
      run(edgePass, edges)
      run(rowPass, rows)
      run(composite, full)
      run(resolve, null)
    },
    dispose() {
      for (const t of targets) t.dispose()
      renderer.dispose()
    }
  }
}
