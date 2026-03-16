import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

// 颜色推荐算法
const generateRecommendedColor = (baseColor: string): string => {
  // 解析颜色为RGB
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 转换为HSL
  const hsl = rgbToHsl(r, g, b);
  
  // 生成互补色
  const complementaryHue = (hsl.h + 180) % 360;
  const complementaryColor = hslToHex(complementaryHue, hsl.s, hsl.l);
  
  return complementaryColor;
};

// 生成类似色
const generateAnalogousColors = (baseColor: string): string[] => {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const hsl = rgbToHsl(r, g, b);
  const colors = [];
  
  // 生成类似色（色相相差30度）
  for (let i = -30; i <= 30; i += 30) {
    if (i === 0) continue; // 跳过基础色
    const analogousHue = (hsl.h + i) % 360;
    colors.push(hslToHex(analogousHue, hsl.s, hsl.l));
  }
  
  return colors;
};

// RGB转HSL
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
};

// HSL转HEX
const hslToHex = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${Math.round(f(0) * 255).toString(16).padStart(2, '0')}${Math.round(f(8) * 255).toString(16).padStart(2, '0')}${Math.round(f(4) * 255).toString(16).padStart(2, '0')}`;
};

// 调节亮度
const adjustBrightness = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const hsl = rgbToHsl(r, g, b);
  const newL = Math.max(0, Math.min(100, hsl.l + amount));
  
  return hslToHex(hsl.h, hsl.s, newL);
};

const Home: React.FC = () => {
  const [mode, setMode] = useState<'free' | 'recommended'>('recommended');
  const [color1, setColor1] = useState('#ff5722');
  const [color2, setColor2] = useState('#22caff');
  const [activeColor, setActiveColor] = useState<1 | 2>(1);

  // 处理颜色变化
  const handleColorChange = (color: any) => {
    if (activeColor === 1) {
      setColor1(color.hex);
      if (mode === 'recommended') {
        const recommendedColor = generateRecommendedColor(color.hex);
        setColor2(recommendedColor);
      }
    } else {
      if (mode === 'free') {
        setColor2(color.hex);
      }
    }
  };

  // 切换模式
  const handleModeChange = (newMode: 'free' | 'recommended') => {
    setMode(newMode);
    if (newMode === 'recommended') {
      const recommendedColor = generateRecommendedColor(color1);
      setColor2(recommendedColor);
    }
  };

  // 调节亮度
  const handleBrightnessAdjust = (amount: number) => {
    if (activeColor === 1) {
      setColor1(adjustBrightness(color1, amount));
      if (mode === 'recommended') {
        const recommendedColor = generateRecommendedColor(adjustBrightness(color1, amount));
        setColor2(recommendedColor);
      }
    } else if (mode === 'free') {
      setColor2(adjustBrightness(color2, amount));
    }
  };

  // 生成类似色
  const analogousColors = generateAnalogousColors(color1);

  // 预设颜色数组
  const presetColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#AED6F1', '#FADBD8'
  ];

  // 内联样式
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      marginBottom: '32px',
      marginTop: '16px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '16px'
    },
    modeSelector: {
      display: 'flex',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    modeButton: {
      padding: '10px 20px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    modeButtonActive: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    modeButtonInactive: {
      backgroundColor: 'white',
      color: '#333',
      border: '1px solid #e5e7eb'
    },
    subtitle: {
      fontSize: '18px',
      color: '#666',
      marginBottom: '32px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '32px'
    },
    colorSelection: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '16px'
    },
    colorPickerContainer: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    },
    presetColorsContainer: {
      marginBottom: '24px'
    },
    presetColorsTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#555',
      marginBottom: '8px'
    },
    presetColorsGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    presetColorButton: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      border: '2px solid white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'transform 0.2s ease'
    },
    colorToggleContainer: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px'
    },
    colorToggleButton: {
      flex: 1,
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    brightnessControl: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px'
    },
    brightnessButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor: 'white',
      color: '#333',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    brightnessSlider: {
      flex: 1,
      height: '4px',
      backgroundColor: '#e5e7eb',
      borderRadius: '2px',
      overflow: 'hidden'
    },
    brightnessSliderFill: {
      height: '100%',
      background: 'linear-gradient(to right, #1f2937, #6b7280, #fbbf24)'
    },
    modeInfo: {
      fontSize: '14px',
      color: '#666'
    },
    colorInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    colorCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    },
    colorCardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '16px'
    },
    colorPair: {
      display: 'flex',
      gap: '16px',
      marginBottom: '16px'
    },
    colorItem: {
      flex: 1
    },
    colorBlock: {
      height: '96px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '12px'
    },
    colorLabel: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '4px'
    },
    colorCode: {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#666',
      backgroundColor: '#f9fafb',
      padding: '4px 8px',
      borderRadius: '4px'
    },
    gradientPreview: {
      height: '128px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '12px'
    },
    colorScheme: {
      marginBottom: '24px'
    },
    colorSchemeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    colorSchemeTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#555'
    },
    colorSchemeCount: {
      fontSize: '12px',
      color: '#888'
    },
    colorSchemeColors: {
      display: 'flex',
      gap: '12px',
      marginBottom: '8px'
    },
    colorSchemeColor: {
      flex: 1,
      height: '64px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    colorSchemeDescription: {
      fontSize: '12px',
      color: '#888'
    },

  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* 顶部标题和模式选择 */}
        <div style={styles.header}>
          <h1 style={styles.title}>色彩选择器</h1>
          <div style={styles.modeSelector}>
            <button
              style={{
                ...styles.modeButton,
                ...(mode === 'free' ? styles.modeButtonActive : styles.modeButtonInactive),
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px'
              }}
              onClick={() => handleModeChange('free')}
            >
              自由选择
            </button>
            <button
              style={{
                ...styles.modeButton,
                ...(mode === 'recommended' ? styles.modeButtonActive : styles.modeButtonInactive),
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px'
              }}
              onClick={() => handleModeChange('recommended')}
            >
              推荐选择
            </button>
          </div>
        </div>

        <p style={styles.subtitle}>选择主颜色，系统自动推荐配色方案</p>

        <div style={styles.grid}>
          {/* 左侧：颜色选择区域 */}
          <div style={styles.colorSelection}>
            {/* 颜色选择器标题 */}
            <h2 style={styles.sectionTitle}>颜色选择</h2>
            
            {/* 色轮选择器 */}
            <div style={styles.colorPickerContainer}>
              <SketchPicker 
                color={activeColor === 1 ? color1 : color2} 
                onChange={handleColorChange} 
              />
            </div>
            
            {/* 预设颜色选择 */}
            <div style={styles.presetColorsContainer}>
              <h3 style={styles.presetColorsTitle}>快速选择颜色</h3>
              <div style={styles.presetColorsGrid}>
                {presetColors.map((color, index) => (
                  <button
                    key={index}
                    style={{
                      ...styles.presetColorButton,
                      backgroundColor: color
                    }}
                    onClick={() => {
                      if (activeColor === 1) {
                        setColor1(color);
                        if (mode === 'recommended') {
                          const recommendedColor = generateRecommendedColor(color);
                          setColor2(recommendedColor);
                        }
                      } else if (mode === 'free') {
                        setColor2(color);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* 颜色选择切换 */}
            <div style={styles.colorToggleContainer}>
              <button
                style={{
                  ...styles.colorToggleButton,
                  backgroundColor: activeColor === 1 ? '#3b82f6' : '#f3f4f6',
                  color: activeColor === 1 ? 'white' : '#333'
                }}
                onClick={() => setActiveColor(1)}
              >
                选择主颜色
              </button>
              <button
                style={{
                  ...styles.colorToggleButton,
                  backgroundColor: activeColor === 2 ? '#3b82f6' : '#f3f4f6',
                  color: activeColor === 2 ? 'white' : '#333',
                  opacity: mode === 'recommended' ? 0.5 : 1
                }}
                onClick={() => setActiveColor(2)}
                disabled={mode === 'recommended'}
              >
                选择辅助颜色
              </button>
            </div>
            
            {/* 亮度调节 */}
            <div style={styles.brightnessControl}>
              <button
                style={styles.brightnessButton}
                onClick={() => handleBrightnessAdjust(-10)}
              >
                变暗
              </button>
              <div style={styles.brightnessSlider}>
                <div style={styles.brightnessSliderFill}></div>
              </div>
              <button
                style={styles.brightnessButton}
                onClick={() => handleBrightnessAdjust(10)}
              >
                变亮
              </button>
            </div>
            
            <p style={styles.modeInfo}>
              {mode === 'recommended' ? '推荐模式: 选择主颜色，系统自动推荐配色' : '自由模式: 可手动选择两种颜色'}
            </p>
          </div>
          
          {/* 右侧：配色信息 */}
          <div style={styles.colorInfo}>
            {/* 当前配色 */}
            <div style={styles.colorCard}>
              <h3 style={styles.colorCardTitle}>当前配色</h3>
              <div style={styles.colorPair}>
                <div style={styles.colorItem}>
                  <div 
                    style={{
                      ...styles.colorBlock,
                      backgroundColor: color1
                    }}
                  ></div>
                  <p style={styles.colorLabel}>主颜色</p>
                  <p style={styles.colorCode}>{color1}</p>
                </div>
                <div style={styles.colorItem}>
                  <div 
                    style={{
                      ...styles.colorBlock,
                      backgroundColor: color2
                    }}
                  ></div>
                  <p style={styles.colorLabel}>{mode === 'recommended' ? '推荐颜色' : '辅助颜色'}</p>
                  <p style={styles.colorCode}>{color2}</p>
                </div>
              </div>
            </div>
            
            {/* 渐变预览 */}
            <div style={styles.colorCard}>
              <h3 style={styles.colorCardTitle}>渐变预览</h3>
              <div 
                style={{
                  ...styles.gradientPreview,
                  background: `linear-gradient(135deg, ${color1}, ${color2})`
                }}
              ></div>
              <p style={styles.colorLabel}>渐变色效果预览</p>
            </div>
            
            {/* 色彩和谐方案 */}
            <div style={styles.colorCard}>
              <h3 style={styles.colorCardTitle}>色彩和谐方案</h3>
              
              {/* 互补色 */}
              <div style={styles.colorScheme}>
                <div style={styles.colorSchemeHeader}>
                  <p style={styles.colorSchemeTitle}>互补色</p>
                  <p style={styles.colorSchemeCount}>2色</p>
                </div>
                <div style={styles.colorSchemeColors}>
                  <div 
                    style={{
                      ...styles.colorSchemeColor,
                      backgroundColor: color1
                    }}
                  ></div>
                  <div 
                    style={{
                      ...styles.colorSchemeColor,
                      backgroundColor: color2
                    }}
                  ></div>
                </div>
                <p style={styles.colorSchemeDescription}>互补色方案，对比强烈，适合强调重点</p>
              </div>
              
              {/* 类似色 */}
              <div style={styles.colorScheme}>
                <div style={styles.colorSchemeHeader}>
                  <p style={styles.colorSchemeTitle}>类似色</p>
                  <p style={styles.colorSchemeCount}>3色</p>
                </div>
                <div style={styles.colorSchemeColors}>
                  <div 
                    style={{
                      ...styles.colorSchemeColor,
                      backgroundColor: color1
                    }}
                  ></div>
                  {analogousColors.map((color, index) => (
                    <div 
                      key={index}
                      style={{
                        ...styles.colorSchemeColor,
                        backgroundColor: color
                      }}
                    ></div>
                  ))}
                </div>
                <p style={styles.colorSchemeDescription}>类似色方案，和谐统一，适合营造氛围</p>
              </div>
            </div>
          </div>
        </div>
        

      </div>
    </div>
  );
};

export default Home;