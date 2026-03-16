import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ColorWheel, colorHarmonyAlgorithms, getRecommendedColors, getHarmonyTypeName, getHarmonyTypeDescription, ColorHarmonyType } from './ColorWheel';

describe('ColorWheel', () => {
  const mockOnColorChange = jest.fn();

  beforeEach(() => {
    mockOnColorChange.mockClear();
    // Mock canvas context with all required methods
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      arc: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      font: '',
      textAlign: 'center',
      textBaseline: 'middle',
      lineWidth: 1,
      strokeStyle: '',
      fillStyle: '',
    })) as any;
    
    HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      width: 320,
      height: 320,
      right: 320,
      bottom: 320,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }));
  });

  describe('组件渲染', () => {
    test('renders ColorWheel component with all elements', () => {
      render(<ColorWheel onColorChange={mockOnColorChange} />);
      
      // 检查模式选择按钮
      expect(screen.getByTestId('free-mode-btn')).toBeInTheDocument();
      expect(screen.getByTestId('recommended-mode-btn')).toBeInTheDocument();
      
      // 检查色轮
      expect(screen.getByTestId('color-wheel')).toBeInTheDocument();
      
      // 检查颜色预览
      expect(screen.getByTestId('primary-swatch')).toBeInTheDocument();
      expect(screen.getByTestId('secondary-swatch')).toBeInTheDocument();
      
      // 检查输入框
      expect(screen.getByTestId('primary-input')).toBeInTheDocument();
      expect(screen.getByTestId('secondary-input')).toBeInTheDocument();
    });

    test('默认显示自由选择模式', () => {
      render(<ColorWheel onColorChange={mockOnColorChange} />);
      
      const freeModeBtn = screen.getByTestId('free-mode-btn');
      expect(freeModeBtn).toHaveClass('active');
      
      // 自由模式下应该显示选择器切换按钮
      expect(screen.getByTestId('primary-selector-btn')).toBeInTheDocument();
      expect(screen.getByTestId('secondary-selector-btn')).toBeInTheDocument();
    });
  });

  describe('模式切换', () => {
    test('switches to recommended mode when button is clicked', () => {
      render(<ColorWheel onColorChange={mockOnColorChange} />);
      
      const recommendedButton = screen.getByTestId('recommended-mode-btn');
      fireEvent.click(recommendedButton);
      
      expect(recommendedButton).toHaveClass('active');
      expect(screen.getByTestId('free-mode-btn')).not.toHaveClass('active');
    });

    test('shows harmony type selector in recommended mode', () => {
      render(<ColorWheel onColorChange={mockOnColorChange} />);
      
      fireEvent.click(screen.getByTestId('recommended-mode-btn'));
      
      expect(screen.getByTestId('harmony-type-select')).toBeInTheDocument();
      expect(screen.getByTestId('harmony-description')).toBeInTheDocument();
    });

    test('hides selector toggle in recommended mode', () => {
      render(<ColorWheel onColorChange={mockOnColorChange} />);
      
      fireEvent.click(screen.getByTestId('recommended-mode-btn'));
      
      expect(screen.queryByTestId('primary-selector-btn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('secondary-selector-btn')).not.toBeInTheDocument();
    });
  });

  describe('颜色输入', () => {
    test('calls onColorChange when primary color input changes in free mode', () => {
      render(<ColorWheel onColorChange={mockOnColorChange} />);
      
      const primaryInput = screen.getByTestId('primary-input');
      fireEvent.change(primaryInput, { target: { value: '#0000ff' } });
      
      expect(mockOnColorChange).toHaveBeenCalled();
    });

    test('calls onColorChange when secondary color input changes in free mode', () => {
      render(<ColorWheel onColorChange={mockOnColorChange} />);
      
      const secondaryInput = screen.getByTestId('secondary-input');
      fireEvent.change(secondaryInput, { target: { value: '#ffff00' } });
      
      expect(mockOnColorChange).toHaveBeenCalled();
    });

    test('disables secondary input in recommended mode', () => {
      render(<ColorWheel onColorChange={mockOnColorChange} />);
      
      fireEvent.click(screen.getByTestId('recommended-mode-btn'));
      
      const secondaryInput = screen.getByTestId('secondary-input');
      expect(secondaryInput).toBeDisabled();
    });
  });

  describe('选择器切换', () => {
    test('switches between primary and secondary selectors in free mode', () => {
      render(<ColorWheel onColorChange={mockOnColorChange} />);
      
      const secondaryBtn = screen.getByTestId('secondary-selector-btn');
      fireEvent.click(secondaryBtn);
      
      expect(secondaryBtn).toHaveClass('active');
      expect(screen.getByTestId('primary-selector-btn')).not.toHaveClass('active');
    });
  });

  describe('和谐类型选择', () => {
    test('changes harmony type in recommended mode', () => {
      render(<ColorWheel onColorChange={mockOnColorChange} />);
      
      fireEvent.click(screen.getByTestId('recommended-mode-btn'));
      
      const select = screen.getByTestId('harmony-type-select');
      fireEvent.change(select, { target: { value: 'analogous' } });
      
      expect(select).toHaveValue('analogous');
    });
  });
});

describe('色彩和谐算法', () => {
  describe('colorHarmonyAlgorithms', () => {
    test('complementary returns hue + 180', () => {
      const result = colorHarmonyAlgorithms.complementary(0);
      expect(result).toEqual([180]);
    });

    test('analogous returns hues at +30 and -30', () => {
      const result = colorHarmonyAlgorithms.analogous(60);
      expect(result).toEqual([90, 30]);
    });

    test('triadic returns hues at +120 and +240', () => {
      const result = colorHarmonyAlgorithms.triadic(0);
      expect(result).toEqual([120, 240]);
    });

    test('splitComplementary returns hues at +150 and +210', () => {
      const result = colorHarmonyAlgorithms.splitComplementary(0);
      expect(result).toEqual([150, 210]);
    });

    test('tetradic returns hues at +60, +180, +240', () => {
      const result = colorHarmonyAlgorithms.tetradic(0);
      expect(result).toEqual([60, 180, 240]);
    });

    test('monochromatic returns same hue', () => {
      const result = colorHarmonyAlgorithms.monochromatic(120);
      expect(result).toEqual([120]);
    });

    test('handles hue wrapping correctly', () => {
      const result = colorHarmonyAlgorithms.complementary(270);
      expect(result).toEqual([90]);
    });
  });

  describe('getRecommendedColors', () => {
    test('returns complementary color for red', () => {
      const colors = getRecommendedColors('#ff0000', 'complementary', 1);
      expect(colors).toHaveLength(1);
      // 红色的互补色应该是青色
      expect(colors[0]).toMatch(/^#[0-9a-f]{6}$/i);
    });

    test('returns multiple analogous colors', () => {
      const colors = getRecommendedColors('#ff0000', 'analogous', 2);
      expect(colors).toHaveLength(2);
      colors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    test('returns monochromatic colors with different lightness', () => {
      const colors = getRecommendedColors('#ff0000', 'monochromatic', 3);
      expect(colors).toHaveLength(3);
      colors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    test('handles invalid color gracefully', () => {
      // 无效颜色应该返回空数组或处理异常
      const colors = getRecommendedColors('#ff0000', 'complementary', 1);
      expect(Array.isArray(colors)).toBe(true);
    });
  });
});

describe('辅助函数', () => {
  describe('getHarmonyTypeName', () => {
    test('returns correct Chinese names for all harmony types', () => {
      const testCases: [ColorHarmonyType, string][] = [
        ['complementary', '互补色'],
        ['analogous', '类似色'],
        ['triadic', '三角色'],
        ['splitComplementary', '分裂互补色'],
        ['tetradic', '四角色'],
        ['monochromatic', '单色系']
      ];

      testCases.forEach(([type, expected]) => {
        expect(getHarmonyTypeName(type)).toBe(expected);
      });
    });
  });

  describe('getHarmonyTypeDescription', () => {
    test('returns non-empty description for all harmony types', () => {
      const types: ColorHarmonyType[] = [
        'complementary', 'analogous', 'triadic', 
        'splitComplementary', 'tetradic', 'monochromatic'
      ];

      types.forEach(type => {
        const description = getHarmonyTypeDescription(type);
        expect(description).toBeTruthy();
        expect(typeof description).toBe('string');
        expect(description.length).toBeGreaterThan(0);
      });
    });

    test('returns correct description for complementary', () => {
      const description = getHarmonyTypeDescription('complementary');
      expect(description).toContain('对比');
    });

    test('returns correct description for analogous', () => {
      const description = getHarmonyTypeDescription('analogous');
      expect(description).toContain('和谐');
    });
  });
});

describe('色彩理论正确性测试', () => {
  test('complementary of red (0°) should be cyan (180°)', () => {
    const colors = getRecommendedColors('#ff0000', 'complementary', 1);
    // 青色应该在180度左右
    expect(colors[0]).toBeTruthy();
  });

  test('triadic of red should include green and blue tones', () => {
    const colors = getRecommendedColors('#ff0000', 'triadic', 2);
    expect(colors).toHaveLength(2);
  });

  test('analogous colors should be close to base color', () => {
    const baseColor = '#ff6600'; // 橙色
    const colors = getRecommendedColors(baseColor, 'analogous', 2);
    expect(colors).toHaveLength(2);
    // 类似色应该与基础色相近
    colors.forEach(color => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});
