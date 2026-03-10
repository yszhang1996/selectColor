import { describe, it, expect } from 'vitest'
import {
  hexToHsl,
  hslToHex,
  getComplementaryColor,
  getAnalogousColors,
  getSplitComplementaryColors,
  getTriadicColors,
  getTetradicColors,
  getRecommendedColors,
  getRandomColor
} from './colorUtils'

describe('颜色转换功能', () => {
  it('应该正确将红色 HEX 转换为 HSL', () => {
    const hsl = hexToHsl('#ff0000')
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })

  it('应该正确将蓝色 HEX 转换为 HSL', () => {
    const hsl = hexToHsl('#0000ff')
    expect(hsl.h).toBe(240)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })

  it('应该正确将 HSL 转换回 HEX', () => {
    const hex = hslToHex(0, 100, 50)
    expect(hex).toBe('#ff0000')
  })

  it('应该能正确进行往返转换', () => {
    const originalHex = '#3366cc'
    const hsl = hexToHsl(originalHex)
    const convertedHex = hslToHex(hsl.h, hsl.s, hsl.l)
    expect(convertedHex).toBe(originalHex)
  })
})

describe('色彩推荐算法', () => {
  it('应该返回正确的补色', () => {
    const complementary = getComplementaryColor('#ff0000')
    expect(complementary).toBe('#00ffff')
  })

  it('应该返回2个类似色', () => {
    const analogous = getAnalogousColors('#ff0000', 2)
    expect(analogous.length).toBe(2)
    expect(typeof analogous[0]).toBe('string')
    expect(analogous[0].startsWith('#')).toBe(true)
  })

  it('应该返回分裂补色', () => {
    const split = getSplitComplementaryColors('#ff0000')
    expect(split.length).toBe(2)
  })

  it('应该返回三角色', () => {
    const triadic = getTriadicColors('#ff0000')
    expect(triadic.length).toBe(2)
  })

  it('应该返回四角色', () => {
    const tetradic = getTetradicColors('#ff0000')
    expect(tetradic.length).toBe(3)
  })

  it('getRecommendedColors 应该返回所有推荐方案', () => {
    const recommendations = getRecommendedColors('#ff0000')
    expect(recommendations).toHaveProperty('complementary')
    expect(recommendations).toHaveProperty('analogous')
    expect(recommendations).toHaveProperty('splitComplementary')
    expect(recommendations).toHaveProperty('triadic')
    expect(recommendations).toHaveProperty('tetradic')
  })
})

describe('随机颜色生成', () => {
  it('应该生成有效的 HEX 颜色', () => {
    const color = getRandomColor()
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('每次应该生成不同的颜色', () => {
    const color1 = getRandomColor()
    const color2 = getRandomColor()
    const color3 = getRandomColor()
    expect(color1).not.toBe(color2)
    expect(color2).not.toBe(color3)
  })
})

describe('边界情况', () => {
  it('应该处理白色', () => {
    const hsl = hexToHsl('#ffffff')
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(100)
  })

  it('应该处理黑色', () => {
    const hsl = hexToHsl('#000000')
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(0)
  })

  it('应该处理灰色', () => {
    const hsl = hexToHsl('#808080')
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(50)
  })
})
