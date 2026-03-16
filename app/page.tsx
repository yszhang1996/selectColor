"use client";
import React, { useState } from 'react';
import { ColorWheel, ColorHarmonyType, getHarmonyTypeName } from './components/ColorWheel';

export default function Home() {
  const [colors, setColors] = useState<string[]>(['#ff0000', '#00ffff']);
  const [allColors, setAllColors] = useState<string[]>(['#ff0000', '#00ffff']);

  const handleColorChange = (newColors: string[]) => {
    setColors(newColors.slice(0, 2));
    setAllColors(newColors);
  };

  // 生成渐变字符串
  const getGradientString = () => {
    if (allColors.length >= 2) {
      return `linear-gradient(to right, ${allColors.join(', ')})`;
    }
    return `linear-gradient(to right, ${colors[0]}, ${colors[1]})`;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-800">色彩选择器</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            使用色轮选择颜色，支持自由选择模式和智能推荐模式。
            在推荐模式下，系统会根据色彩理论为您推荐最佳配色方案。
          </p>
        </div>
        
        {/* 主内容区 */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* 色彩选择器 */}
          <div className="flex-shrink-0">
            <ColorWheel onColorChange={handleColorChange} />
          </div>
          
          {/* 渐变预览区域 */}
          <div className="flex-1 w-full max-w-md">
            <div className="gradient-preview">
              <h3>渐变效果预览</h3>
              <div 
                className="gradient-bar"
                style={{ background: getGradientString() }}
                data-testid="gradient-preview"
              />
              <div className="gradient-info">
                {allColors.length > 2 ? (
                  <span>多色渐变: {allColors.join(' → ')}</span>
                ) : (
                  <span>双色渐变: {colors[0]} → {colors[1]}</span>
                )}
              </div>
            </div>

            {/* 色彩信息卡片 */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">当前配色方案</h3>
              
              <div className="space-y-4">
                {allColors.map((color, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg shadow-md border-2 border-gray-100"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1">
                      <p className="font-mono text-sm text-gray-700">{color}</p>
                      <p className="text-xs text-gray-500">
                        {index === 0 ? '主色' : index === 1 ? '次色' : `推荐色 ${index}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 使用提示 */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">使用提示</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li><strong>自由选择模式</strong>：可独立选择主色和次色</li>
                  <li><strong>推荐选择模式</strong>：选择主色后系统自动推荐配色</li>
                  <li>支持鼠标拖拽和触摸操作选择颜色</li>
                  <li>可直接输入十六进制颜色值</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 配色方案说明 */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">配色方案说明</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">互补色 (Complementary)</h3>
              <p className="text-sm text-gray-600">色轮上相对的颜色（180°），对比强烈，视觉冲击力大，适合需要突出重点的设计。</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">类似色 (Analogous)</h3>
              <p className="text-sm text-gray-600">相邻的颜色（±30°），和谐统一，适合营造柔和、舒适的视觉氛围。</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">三角色 (Triadic)</h3>
              <p className="text-sm text-gray-600">等边三角形的三个颜色（±120°），平衡且富有活力，适合需要丰富色彩的设计。</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">分裂互补色 (Split Complementary)</h3>
              <p className="text-sm text-gray-600">主色加互补色两侧的颜色，对比强烈但更加柔和，是互补色的优雅替代。</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">四角色 (Tetradic)</h3>
              <p className="text-sm text-gray-600">矩形配色方案，色彩丰富，适合复杂的设计项目，需要注意平衡使用。</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">单色系 (Monochromatic)</h3>
              <p className="text-sm text-gray-600">相同色相不同明度，简洁优雅，层次分明，适合简约风格的设计。</p>
            </div>
          </div>
        </div>

        {/* 页脚 */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>基于色彩理论和 Chroma.js 构建</p>
        </footer>
      </div>
    </div>
  );
}
