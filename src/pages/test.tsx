import React from 'react';

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

// 测试用例
const testCases = [
  { baseColor: '#FF0000', expected: '#00FFFF' }, // 红色 -> 青色
  { baseColor: '#00FF00', expected: '#FF00FF' }, // 绿色 -> 洋红色
  { baseColor: '#0000FF', expected: '#FFFF00' }, // 蓝色 -> 黄色
  { baseColor: '#FF5733', expected: '#33A8FF' }, // 橙红色 -> 蓝绿色
];

const runTests = () => {
  return testCases.map((testCase, index) => {
    const result = generateRecommendedColor(testCase.baseColor);
    const passed = result === testCase.expected;
    return {
      id: index + 1,
      baseColor: testCase.baseColor,
      expected: testCase.expected,
      result,
      passed
    };
  });
};

const TestPage: React.FC = () => {
  const testResults = runTests();
  const analogousTest = generateAnalogousColors('#3dc279');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          色彩推荐算法测试
        </h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-lg font-semibold mb-6 text-gray-800">互补色测试</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">测试用例</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">基础颜色</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预期结果</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">实际结果</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testResults.map((test) => (
                  <tr key={test.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded mr-2" style={{ backgroundColor: test.baseColor }}></div>
                        <span className="text-sm text-gray-900">{test.baseColor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded mr-2" style={{ backgroundColor: test.expected }}></div>
                        <span className="text-sm text-gray-900">{test.expected}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded mr-2" style={{ backgroundColor: test.result }}></div>
                        <span className="text-sm text-gray-900">{test.result}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {test.passed ? '通过' : '失败'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">测试总结</h3>
            <p className="text-sm text-gray-700">
              共 {testResults.length} 个测试用例，
              成功 {testResults.filter(t => t.passed).length} 个，
              失败 {testResults.filter(t => !t.passed).length} 个。
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-lg font-semibold mb-6 text-gray-800">类似色测试</h2>
          <div className="flex space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-lg mb-2" style={{ backgroundColor: '#3dc279' }}></div>
              <p className="text-sm font-medium text-gray-700">基础颜色</p>
              <p className="text-xs font-mono text-gray-500">#3dc279</p>
            </div>
            {analogousTest.map((color, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-lg mb-2" style={{ backgroundColor: color }}></div>
                <p className="text-sm font-medium text-gray-700">类似色 {index + 1}</p>
                <p className="text-xs font-mono text-gray-500">{color}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;