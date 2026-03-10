export function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

export function hslToHex(h, s, l) {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function getComplementaryColor(hex) {
  const hsl = hexToHsl(hex)
  let newH = (hsl.h + 180) % 360
  return hslToHex(newH, hsl.s, hsl.l)
}

export function getAnalogousColors(hex, count = 2) {
  const hsl = hexToHsl(hex)
  const colors = []
  const step = 30
  for (let i = 1; i <= Math.floor(count / 2); i++) {
    colors.push(hslToHex((hsl.h - i * step + 360) % 360, hsl.s, hsl.l))
  }
  for (let i = 1; i <= Math.ceil(count / 2); i++) {
    colors.push(hslToHex((hsl.h + i * step) % 360, hsl.s, hsl.l))
  }
  return colors
}

export function getSplitComplementaryColors(hex) {
  const hsl = hexToHsl(hex)
  return [
    hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l)
  ]
}

export function getTriadicColors(hex) {
  const hsl = hexToHsl(hex)
  return [
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
  ]
}

export function getTetradicColors(hex) {
  const hsl = hexToHsl(hex)
  return [
    hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l)
  ]
}

export function getRecommendedColors(hex) {
  return {
    complementary: getComplementaryColor(hex),
    analogous: getAnalogousColors(hex, 2),
    splitComplementary: getSplitComplementaryColors(hex),
    triadic: getTriadicColors(hex),
    tetradic: getTetradicColors(hex)
  }
}

export function getRandomColor() {
  const h = Math.floor(Math.random() * 360)
  const s = 50 + Math.floor(Math.random() * 50)
  const l = 40 + Math.floor(Math.random() * 40)
  return hslToHex(h, s, l)
}
