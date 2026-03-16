"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import chroma from 'chroma-js';

export type ColorHarmonyType = 
  | 'complementary' 
  | 'analogous' 
  | 'triadic' 
  | 'splitComplementary' 
  | 'tetradic'
  | 'monochromatic';

interface ColorWheelProps {
  onColorChange: (colors: string[]) => void;
}

interface ColorPoint {
  color: string;
  angle: number;
  distance: number;
  isPrimary: boolean;
}

// 色彩和谐算法
export const colorHarmonyAlgorithms: Record<ColorHarmonyType, (baseHue: number) => number[]> = {
  // 互补色：色轮上相对的颜色 (180°)
  complementary: (baseHue: number) => {
    return [(baseHue + 180) % 360];
  },
  
  // 类似色：相邻的颜色 (±30°)
  analogous: (baseHue: number) => {
    return [
      (baseHue + 30) % 360,
      (baseHue - 30 + 360) % 360
    ];
  },
  
  // 三角色：等边三角形的三个颜色 (±120°)
  triadic: (baseHue: number) => {
    return [
      (baseHue + 120) % 360,
      (baseHue + 240) % 360
    ];
  },
  
  // 分裂互补色：主色 + 互补色两侧的颜色 (150°, 210°)
  splitComplementary: (baseHue: number) => {
    return [
      (baseHue + 150) % 360,
      (baseHue + 210) % 360
    ];
  },
  
  // 四角色：矩形配色方案 (±60°, ±180°)
  tetradic: (baseHue: number) => {
    return [
      (baseHue + 60) % 360,
      (baseHue + 180) % 360,
      (baseHue + 240) % 360
    ];
  },
  
  // 单色系：相同色相，不同明度
  monochromatic: (baseHue: number) => {
    return [baseHue]; // 特殊处理，在函数中会调整明度
  }
};

// 获取推荐的颜色组合
export const getRecommendedColors = (
  baseColor: string, 
  harmonyType: ColorHarmonyType,
  count: number = 2
): string[] => {
  const hsl = chroma(baseColor).hsl();
  const baseHue = hsl[0] || 0;
  const saturation = hsl[1];
  const lightness = hsl[2];
  
  if (harmonyType === 'monochromatic') {
    // 单色系：生成不同明度的颜色
    const colors: string[] = [];
    const lightnessSteps = [0.3, 0.5, 0.7, 0.85];
    for (let i = 0; i < Math.min(count, lightnessSteps.length); i++) {
      colors.push(chroma.hsl(baseHue, saturation * 0.8, lightnessSteps[i]).hex());
    }
    return colors;
  }
  
  const algorithm = colorHarmonyAlgorithms[harmonyType];
  const hues = algorithm(baseHue);
  
  return hues.slice(0, count).map(hue => 
    chroma.hsl(hue, saturation, lightness).hex()
  );
};

// 获取色彩和谐类型的中文名称
export const getHarmonyTypeName = (type: ColorHarmonyType): string => {
  const names: Record<ColorHarmonyType, string> = {
    complementary: '互补色',
    analogous: '类似色',
    triadic: '三角色',
    splitComplementary: '分裂互补色',
    tetradic: '四角色',
    monochromatic: '单色系'
  };
  return names[type];
};

// 获取色彩和谐类型的描述
export const getHarmonyTypeDescription = (type: ColorHarmonyType): string => {
  const descriptions: Record<ColorHarmonyType, string> = {
    complementary: '色轮上相对的颜色，对比强烈，视觉冲击力大',
    analogous: '相邻的颜色，和谐统一，适合营造柔和氛围',
    triadic: '等边三角形的三个颜色，平衡且富有活力',
    splitComplementary: '主色加互补色两侧的颜色，对比强烈但更加柔和',
    tetradic: '矩形配色方案，色彩丰富，需要平衡使用',
    monochromatic: '相同色相不同明度，简洁优雅，层次分明'
  };
  return descriptions[type];
};

export const ColorWheel: React.FC<ColorWheelProps> = ({ onColorChange }) => {
  const [mode, setMode] = useState<'free' | 'recommended'>('free');
  const [harmonyType, setHarmonyType] = useState<ColorHarmonyType>('complementary');
  const [primaryColor, setPrimaryColor] = useState('#ff0000');
  const [secondaryColor, setSecondaryColor] = useState('#00ffff');
  const [wheelSize, setWheelSize] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const [activeSelector, setActiveSelector] = useState<'primary' | 'secondary'>('primary');
  const [recommendedColors, setRecommendedColors] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 生成色轮
  const generateColorWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;
    const radius = wheelSize / 2 - 10;

    // 清空画布
    ctx.clearRect(0, 0, wheelSize, wheelSize);

    // 绘制色轮背景
    ctx.fillStyle = '#f3f4f6';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
    ctx.fill();

    // 绘制色轮
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = ((angle - 90) * Math.PI) / 180;
      const endAngle = ((angle - 89) * Math.PI) / 180;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      const color = chroma.hsl(angle, 1, 0.5).hex();
      ctx.fillStyle = color;
      ctx.fill();
    }

    // 绘制中心白色渐变（饱和度控制）
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // 绘制选择器指示器
    drawColorIndicators(ctx, centerX, centerY, radius);
  }, [wheelSize, primaryColor, secondaryColor]);

  // 绘制颜色指示器
  const drawColorIndicators = (
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    radius: number
  ) => {
    const drawIndicator = (color: string, isPrimary: boolean) => {
      const hsl = chroma(color).hsl();
      const hue = hsl[0] || 0;
      const saturation = hsl[1];
      const distance = saturation * radius;
      const angleRad = ((hue - 90) * Math.PI) / 180;
      
      const x = centerX + Math.cos(angleRad) * distance;
      const y = centerY + Math.sin(angleRad) * distance;
      
      // 外圈
      ctx.strokeStyle = isPrimary ? '#3b82f6' : '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.stroke();
      
      // 内圈（实际颜色）
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // 标签
      ctx.fillStyle = isPrimary ? '#3b82f6' : '#10b981';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(isPrimary ? '主' : '次', x, y - 14);
    };

    drawIndicator(primaryColor, true);
    if (mode === 'free' || (mode === 'recommended' && harmonyType !== 'monochromatic')) {
      drawIndicator(secondaryColor, false);
    }
  };

  // 从点击位置获取颜色
  const getColorFromPosition = (x: number, y: number): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;
    
    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;
    const radius = wheelSize / 2 - 10;
    
    const dx = canvasX - centerX;
    const dy = canvasY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > radius + 10) return null;
    
    const clampedDistance = Math.min(distance, radius);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    const normalizedAngle = angle < 0 ? angle + 360 : angle;
    const saturation = Math.min(clampedDistance / radius, 1);
    
    return chroma.hsl(normalizedAngle, saturation, 0.5).hex();
  };

  // 处理色轮点击/拖拽
  const handleWheelInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const color = getColorFromPosition(clientX, clientY);
    if (!color) return;

    if (mode === 'free') {
      // 自由模式：根据当前激活的选择器设置颜色
      if (activeSelector === 'primary') {
        setPrimaryColor(color);
        onColorChange([color, secondaryColor]);
      } else {
        setSecondaryColor(color);
        onColorChange([primaryColor, color]);
      }
    } else {
      // 推荐模式：设置主色，次色由算法推荐
      setPrimaryColor(color);
      const recommended = getRecommendedColors(color, harmonyType, 3);
      setRecommendedColors(recommended);
      setSecondaryColor(recommended[0]);
      onColorChange([color, recommended[0], ...recommended.slice(1)]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleWheelInteraction(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      handleWheelInteraction(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleWheelInteraction(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      e.preventDefault();
      handleWheelInteraction(e);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 处理模式切换
  const handleModeChange = (newMode: 'free' | 'recommended') => {
    setMode(newMode);
    if (newMode === 'recommended') {
      const recommended = getRecommendedColors(primaryColor, harmonyType, 3);
      setRecommendedColors(recommended);
      setSecondaryColor(recommended[0]);
      onColorChange([primaryColor, recommended[0], ...recommended.slice(1)]);
    } else {
      onColorChange([primaryColor, secondaryColor]);
    }
  };

  // 处理和谐类型切换
  const handleHarmonyTypeChange = (type: ColorHarmonyType) => {
    setHarmonyType(type);
    if (mode === 'recommended') {
      const recommended = getRecommendedColors(primaryColor, type, 3);
      setRecommendedColors(recommended);
      setSecondaryColor(recommended[0]);
      onColorChange([primaryColor, recommended[0], ...recommended.slice(1)]);
    }
  };

  // 处理颜色输入变化
  const handleColorInputChange = (color: string, isPrimary: boolean) => {
    if (!chroma.valid(color)) return;
    
    if (isPrimary) {
      setPrimaryColor(color);
      if (mode === 'recommended') {
        const recommended = getRecommendedColors(color, harmonyType, 3);
        setRecommendedColors(recommended);
        setSecondaryColor(recommended[0]);
        onColorChange([color, recommended[0], ...recommended.slice(1)]);
      } else {
        onColorChange([color, secondaryColor]);
      }
    } else {
      setSecondaryColor(color);
      onColorChange([primaryColor, color]);
    }
  };

  useEffect(() => {
    generateColorWheel();
  }, [generateColorWheel]);

  // 添加全局鼠标/触摸事件监听
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalTouchEnd = () => setIsDragging(false);
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalTouchEnd);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, []);

  return (
    <div className="color-wheel-container" ref={containerRef}>
      {/* 模式选择 */}
      <div className="mode-selector">
        <button 
          className={mode === 'free' ? 'active' : ''}
          onClick={() => handleModeChange('free')}
          data-testid="free-mode-btn"
        >
          自由选择模式
        </button>
        <button 
          className={mode === 'recommended' ? 'active' : ''}
          onClick={() => handleModeChange('recommended')}
          data-testid="recommended-mode-btn"
        >
          推荐选择模式
        </button>
      </div>

      {/* 和谐类型选择（仅在推荐模式下显示） */}
      {mode === 'recommended' && (
        <div className="harmony-type-selector">
          <label>配色方案：</label>
          <select 
            value={harmonyType} 
            onChange={(e) => handleHarmonyTypeChange(e.target.value as ColorHarmonyType)}
            data-testid="harmony-type-select"
          >
            {(Object.keys(colorHarmonyAlgorithms) as ColorHarmonyType[]).map(type => (
              <option key={type} value={type}>
                {getHarmonyTypeName(type)}
              </option>
            ))}
          </select>
          <p className="harmony-description" data-testid="harmony-description">
            {getHarmonyTypeDescription(harmonyType)}
          </p>
        </div>
      )}

      {/* 自由模式下的选择器切换 */}
      {mode === 'free' && (
        <div className="selector-toggle">
          <button 
            className={activeSelector === 'primary' ? 'active primary' : ''}
            onClick={() => setActiveSelector('primary')}
            data-testid="primary-selector-btn"
          >
            选择主色
          </button>
          <button 
            className={activeSelector === 'secondary' ? 'active secondary' : ''}
            onClick={() => setActiveSelector('secondary')}
            data-testid="secondary-selector-btn"
          >
            选择次色
          </button>
        </div>
      )}
      
      {/* 色轮画布 */}
      <canvas
        ref={canvasRef}
        width={wheelSize}
        height={wheelSize}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="color-wheel"
        data-testid="color-wheel"
      />
      
      {/* 颜色预览 */}
      <div className="color-preview-section">
        <div className="color-preview">
          <div className="color-item">
            <div 
              className="color-swatch primary"
              style={{ backgroundColor: primaryColor }}
              data-testid="primary-swatch"
            />
            <span className="color-label">主色</span>
          </div>
          <div className="color-arrow">→</div>
          <div className="color-item">
            <div 
              className="color-swatch secondary"
              style={{ backgroundColor: secondaryColor }}
              data-testid="secondary-swatch"
            />
            <span className="color-label">次色</span>
          </div>
        </div>

        {/* 推荐颜色展示（仅在推荐模式下显示） */}
        {mode === 'recommended' && recommendedColors.length > 1 && (
          <div className="recommended-colors" data-testid="recommended-colors">
            <p className="recommended-title">更多推荐颜色：</p>
            <div className="recommended-swatches">
              {recommendedColors.slice(1).map((color, index) => (
                <div
                  key={index}
                  className="color-swatch recommended"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSecondaryColor(color);
                    onColorChange([primaryColor, color, ...recommendedColors.filter(c => c !== color)]);
                  }}
                  data-testid={`recommended-swatch-${index}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 颜色值输入 */}
      <div className="color-values">
        <div className="color-input-group">
          <label>主色：</label>
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => handleColorInputChange(e.target.value, true)}
            className="color-input"
            data-testid="primary-input"
          />
        </div>
        <div className="color-input-group">
          <label>次色：</label>
          <input
            type="text"
            value={secondaryColor}
            onChange={(e) => handleColorInputChange(e.target.value, false)}
            className="color-input"
            disabled={mode === 'recommended'}
            data-testid="secondary-input"
          />
        </div>
      </div>

      {/* 色彩和谐信息 */}
      <div className="color-info">
        <p>当前主色 HSL: {(() => {
          const hsl = chroma(primaryColor).hsl();
          return `H:${Math.round(hsl[0] || 0)}° S:${Math.round(hsl[1] * 100)}% L:${Math.round(hsl[2] * 100)}%`;
        })()}</p>
        <p>当前次色 HSL: {(() => {
          const hsl = chroma(secondaryColor).hsl();
          return `H:${Math.round(hsl[0] || 0)}° S:${Math.round(hsl[1] * 100)}% L:${Math.round(hsl[2] * 100)}%`;
        })()}</p>
      </div>
    </div>
  );
};

export default ColorWheel;
