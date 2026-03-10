<template>
  <div class="color-wheel-container">
    <div class="color-wheel-wrapper">
      <canvas
        ref="wheelCanvas"
        :width="size"
        :height="size"
        class="color-wheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      ></canvas>
      <div
        v-for="(color, index) in colors"
        :key="index"
        class="color-marker"
        :class="{ active: activeMarker === index }"
        :style="markerStyle(color)"
      ></div>
    </div>
    <div class="color-info">
      <div class="color-display" v-for="(color, index) in colors" :key="index">
        <div class="color-swatch" :style="{ background: color }"></div>
        <div class="color-details">
          <span class="color-label">{{ index === 0 ? '颜色 1' : '颜色 2' }}</span>
          <span class="color-value">{{ color }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { hslToHex, hexToHsl } from '../utils/colorUtils'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ['#ff6b6b', '#4ecdc4']
  },
  size: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue'])

const wheelCanvas = ref(null)
const colors = ref([...props.modelValue])
const activeMarker = ref(null)
const isDragging = ref(false)

const markerStyle = (color) => {
  const hsl = hexToHsl(color)
  const angle = (hsl.h * Math.PI) / 180
  const radius = (props.size / 2) * (hsl.s / 100)
  const x = props.size / 2 + Math.cos(angle) * radius
  const y = props.size / 2 - Math.sin(angle) * radius
  return {
    left: `${x}px`,
    top: `${y}px`,
    borderColor: color,
    boxShadow: `0 0 10px ${color}`
  }
}

const drawColorWheel = () => {
  const canvas = wheelCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = canvas.width / 2 - 10

  for (let angle = 0; angle < 360; angle++) {
    const startAngle = ((angle - 1) * Math.PI) / 180
    const endAngle = ((angle + 1) * Math.PI) / 180

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, hslToHex(angle, 0, 100))
    gradient.addColorStop(1, hslToHex(angle, 100, 50))

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
  }

  const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
  centerGradient.addColorStop(0, 'white')
  centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = centerGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
  ctx.fill()
}

const getColorFromPosition = (x, y) => {
  const centerX = wheelCanvas.value.width / 2
  const centerY = wheelCanvas.value.height / 2
  const dx = x - centerX
  const dy = centerY - y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const maxDistance = wheelCanvas.value.width / 2 - 10

  let angle = Math.atan2(dy, dx) * (180 / Math.PI)
  if (angle < 0) angle += 360

  const saturation = Math.min(100, (distance / maxDistance) * 100)
  const lightness = 50 - (saturation * 0.2)

  return hslToHex(angle, saturation, Math.max(30, lightness))
}

const getPositionFromEvent = (e) => {
  const rect = wheelCanvas.value.getBoundingClientRect()
  let clientX, clientY

  if (e.touches) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

const findNearestMarker = (x, y) => {
  let minDist = Infinity
  let nearestIndex = 0

  colors.value.forEach((color, index) => {
    const hsl = hexToHsl(color)
    const angle = (hsl.h * Math.PI) / 180
    const radius = (props.size / 2) * (hsl.s / 100)
    const markerX = props.size / 2 + Math.cos(angle) * radius
    const markerY = props.size / 2 - Math.sin(angle) * radius
    const dist = Math.sqrt((x - markerX) ** 2 + (y - markerY) ** 2)
    if (dist < minDist) {
      minDist = dist
      nearestIndex = index
    }
  })

  return minDist < 30 ? nearestIndex : null
}

const handleMouseDown = (e) => {
  const pos = getPositionFromEvent(e)
  const nearestIndex = findNearestMarker(pos.x, pos.y)
  
  if (nearestIndex !== null) {
    activeMarker.value = nearestIndex
  } else {
    const newIndex = colors.value.length < 2 ? colors.value.length : 0
    activeMarker.value = newIndex
    colors.value[newIndex] = getColorFromPosition(pos.x, pos.y)
  }
  
  isDragging.value = true
  emit('update:modelValue', [...colors.value])
}

const handleMouseMove = (e) => {
  if (!isDragging.value || activeMarker.value === null) return
  
  const pos = getPositionFromEvent(e)
  colors.value[activeMarker.value] = getColorFromPosition(pos.x, pos.y)
  emit('update:modelValue', [...colors.value])
}

const handleMouseUp = () => {
  isDragging.value = false
  activeMarker.value = null
}

const handleTouchStart = (e) => {
  e.preventDefault()
  handleMouseDown(e)
}

const handleTouchMove = (e) => {
  e.preventDefault()
  handleMouseMove(e)
}

const handleTouchEnd = () => {
  handleMouseUp()
}

watch(() => props.modelValue, (newVal) => {
  colors.value = [...newVal]
}, { deep: true })

onMounted(() => {
  drawColorWheel()
})
</script>

<style scoped>
.color-wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.color-wheel-wrapper {
  position: relative;
  width: fit-content;
}

.color-wheel {
  border-radius: 50%;
  cursor: crosshair;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.color-marker {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 3px solid;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  transition: transform 0.1s, box-shadow 0.1s;
  background: white;
  z-index: 10;
}

.color-marker:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.color-marker.active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.3);
}

.color-info {
  display: flex;
  gap: 30px;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #f5f5f5;
  border-radius: 10px;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.color-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.color-value {
  font-size: 14px;
  font-family: monospace;
  color: #333;
  font-weight: 600;
}
</style>
