/**
 * generate-icons.mjs
 * Generates public/icons/icon-192.png and icon-512.png for the FanRush PWA.
 * Uses sharp (already a Next.js dependency) to render SVG → PNG.
 *
 * Run: node scripts/generate-icons.mjs
 */

import sharp from "sharp"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, "../public/icons")

/**
 * Build the SVG markup for the icon at a given size.
 * Design: dark rounded-square background, orange circle glow,
 * white ⚡ lightning bolt centred, "FanRush" wordmark below (only on 512).
 */
function buildSvg(size) {
  const half = size / 2
  const radius = size * 0.22          // rounded corner radius
  const glowR = size * 0.36           // orange glow circle radius

  // Lightning bolt path — coordinates expressed as fractions of `size`
  // Shape: classic downward-right bolt drawn as a filled polygon
  const boltPoints = [
    [0.52, 0.12],  // top-right of upper arm
    [0.34, 0.47],  // mid-left notch (upper)
    [0.46, 0.47],  // mid notch inner
    [0.30, 0.88],  // bottom tip
    [0.52, 0.52],  // mid-right notch (lower)
    [0.40, 0.52],  // mid inner lower
    [0.62, 0.12],  // top-left of upper arm
  ].map(([x, y]) => `${(x * size).toFixed(1)},${(y * size).toFixed(1)}`).join(" ")

  const showWordmark = size >= 512

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="44%" r="50%">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
    </radialGradient>
    <filter id="boltShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${size * 0.01}" stdDeviation="${size * 0.025}" flood-color="#f97316" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Background rounded square -->
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#bg)"/>

  <!-- Subtle orange border -->
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}"
        fill="none" stroke="#f97316" stroke-width="${size * 0.012}" stroke-opacity="0.4"/>

  <!-- Radial glow behind bolt -->
  <circle cx="${half}" cy="${size * 0.44}" r="${glowR}" fill="url(#glow)"/>

  <!-- Lightning bolt -->
  <polygon
    points="${boltPoints}"
    fill="#f97316"
    filter="url(#boltShadow)"
  />

  ${showWordmark ? `
  <!-- "FanRush" wordmark below bolt -->
  <text
    x="${half}"
    y="${size * 0.93}"
    font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
    font-weight="900"
    font-size="${size * 0.085}"
    fill="white"
    text-anchor="middle"
    letter-spacing="${size * 0.005}"
  >Fan<tspan fill="#f97316">Rush</tspan></text>
  ` : ""}
</svg>`
}

async function generateIcon(size) {
  const svg = buildSvg(size)
  const svgBuffer = Buffer.from(svg, "utf-8")
  const outPath = join(outDir, `icon-${size}.png`)

  await sharp(svgBuffer)
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outPath)

  console.log(`✅  icon-${size}.png  →  ${outPath}`)
}

await generateIcon(192)
await generateIcon(512)
console.log("🎉  Icons generated successfully.")
