<template>
  <div class="app">
    <header class="app-header">
      <h1>🎨 色彩选择器</h1>
      <p class="subtitle">在色轮上选择完美的渐变配色方案</p>
    </header>

    <main class="app-main">
      <div class="gradient-preview" :style="gradientStyle">
        <div class="gradient-info">
          <h2>渐变预览</h2>
          <code>{{ gradientCss }}</code>
        </div>
      </div>

      <div class="mode-selector">
        <button
          v-for="mode in modes"
          :key="mode.value"
          class="mode-btn"
          :class="{ active: currentMode === mode.value }"
          @click="currentMode = mode.value"
        >
          {{ mode.label }}
        </button>
      </div>

      <div class="controls-section">
        <div class="color-wheel-section">
          <h3>色轮选择</h3>
          <ColorWheel v-model="selectedColors" :size="320" />
        </div>

        <div v-if="currentMode === 'recommended'" class="recommendations-section">
          <h3>推荐配色方案</h3>
          <p class="tip">选择颜色 1，系统将为您推荐最佳配色</p>
          
          <div class="recommendation-list">
            <div
              v-for="(scheme, name) in recommendedSchemes"
              :key="name"
              class="recommendation-item"
              @click="applyRecommendation(name)"
            >
              <div class="scheme-colors">
                <div class="scheme-color" :style="{ background: selectedColors[0] }"></div>
                <div class="scheme-color" :style="{ background: scheme }"></div>
              </div>
              <span class="scheme-name">{{ schemeNames[name] }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn secondary" @click="randomizeColors">
          🎲 随机配色
        </button>
        <button class="action-btn primary" @click="copyGradient">
          📋 复制渐变
        </button>
      </div>
    </main>

    <div v-if="showCopied" class="copied-toast">
      ✓ 已复制到剪贴板！
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ColorWheel from './components/ColorWheel.vue'
import { getRecommendedColors, getRandomColor } from './utils/colorUtils'

const modes = [
  { label: '自由选择模式', value: 'free' },
  { label: '推荐选择模式', value: 'recommended' }
]

const schemeNames = {
  complementary: '补色',
  analogous: '类似色',
  splitComplementary: '分裂补色',
  triadic: '三角色',
  tetradic: '四角色'
}

const currentMode = ref('free')
const selectedColors = ref(['#ff6b6b', '#4ecdc4'])
const showCopied = ref(false)

const recommendedSchemes = computed(() => {
  const recs = getRecommendedColors(selectedColors[0])
  return {
    complementary: recs.complementary,
    analogous: recs.analogous[0],
    splitComplementary: recs.splitComplementary[0],
    triadic: recs.triadic[0],
    tetradic: recs.tetradic[0]
  }
})

const gradientStyle = computed(() => ({
  background: `linear-gradient(135deg, ${selectedColors[0]}, ${selectedColors[1]})`
}))

const gradientCss = computed(() => 
  `linear-gradient(135deg, ${selectedColors[0]}, ${selectedColors[1]})`
)

const applyRecommendation = (schemeName) => {
  selectedColors.value[1] = recommendedSchemes.value[schemeName]
}

const randomizeColors = () => {
  selectedColors.value = [getRandomColor(), getRandomColor()]
}

const copyGradient = async () => {
  try {
    await navigator.clipboard.writeText(gradientCss.value)
    showCopied.value = true
    setTimeout(() => {
      showCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f8f9fa;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
}

.app-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.app-main {
  max-width: 900px;
  margin: 0 auto;
}

.gradient-preview {
  border-radius: 20px;
  padding: 60px 40px;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gradient-info {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.gradient-info h2 {
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 10px;
}

.gradient-info code {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 0.9rem;
  color: #555;
  background: #f0f0f0;
  padding: 8px 16px;
  border-radius: 6px;
  display: inline-block;
}

.mode-selector {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
}

.mode-btn {
  padding: 12px 28px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: #999;
}

.mode-btn.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

.controls-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .controls-section {
    grid-template-columns: 1fr;
  }
}

.color-wheel-section,
.recommendations-section {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.color-wheel-section h3,
.recommendations-section h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.tip {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-radius: 10px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s;
}

.recommendation-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.scheme-colors {
  display: flex;
  gap: 4px;
  border-radius: 8px;
  overflow: hidden;
}

.scheme-color {
  width: 40px;
  height: 40px;
}

.scheme-name {
  font-weight: 500;
  color: #444;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  padding: 14px 32px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.secondary {
  background: white;
  color: #6366f1;
  border: 2px solid #6366f1;
}

.action-btn.secondary:hover {
  background: #f0f4ff;
}

.action-btn.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.copied-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
