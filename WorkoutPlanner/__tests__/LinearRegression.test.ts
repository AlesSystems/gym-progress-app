import { LinearRegression } from '../src/domain/progress/LinearRegression';

describe('LinearRegression', () => {
  describe('calculate', () => {
    it('should calculate linear regression for positive slope', () => {
      const dataPoints = [
        { x: 0, y: 100 },
        { x: 1, y: 105 },
        { x: 2, y: 110 },
        { x: 3, y: 115 },
      ];
      
      const result = LinearRegression.calculate(dataPoints);
      
      expect(result.slope).toBeCloseTo(5, 1);
      expect(result.intercept).toBeCloseTo(100, 1);
      expect(result.rSquared).toBeCloseTo(1, 1);
    });

    it('should calculate linear regression for negative slope', () => {
      const dataPoints = [
        { x: 0, y: 120 },
        { x: 1, y: 115 },
        { x: 2, y: 110 },
        { x: 3, y: 105 },
      ];
      
      const result = LinearRegression.calculate(dataPoints);
      
      expect(result.slope).toBeCloseTo(-5, 1);
      expect(result.intercept).toBeCloseTo(120, 1);
      expect(result.rSquared).toBeCloseTo(1, 1);
    });

    it('should handle flat line (zero slope)', () => {
      const dataPoints = [
        { x: 0, y: 100 },
        { x: 1, y: 100 },
        { x: 2, y: 100 },
      ];
      
      const result = LinearRegression.calculate(dataPoints);
      
      expect(result.slope).toBeCloseTo(0, 1);
      expect(result.intercept).toBeCloseTo(100, 1);
      expect(result.rSquared).toBeCloseTo(1, 1);
    });

    it('should handle single data point', () => {
      const dataPoints = [{ x: 0, y: 100 }];
      
      const result = LinearRegression.calculate(dataPoints);
      
      expect(result.slope).toBe(0);
      expect(result.intercept).toBe(100);
      expect(result.rSquared).toBe(1);
    });

    it('should handle empty array', () => {
      const result = LinearRegression.calculate([]);
      
      expect(result.slope).toBe(0);
      expect(result.intercept).toBe(0);
      expect(result.rSquared).toBe(0);
    });

    it('should clamp R-squared between 0 and 1', () => {
      const dataPoints = [
        { x: 0, y: 100 },
        { x: 1, y: 105 },
        { x: 2, y: 108 },
        { x: 3, y: 116 },
      ];
      
      const result = LinearRegression.calculate(dataPoints);
      
      expect(result.rSquared).toBeGreaterThanOrEqual(0);
      expect(result.rSquared).toBeLessThanOrEqual(1);
    });
  });

  describe('predict', () => {
    it('should predict value using trend line', () => {
      const trendLine = {
        slope: 5,
        intercept: 100,
        rSquared: 1,
      };
      
      expect(LinearRegression.predict(trendLine, 0)).toBe(100);
      expect(LinearRegression.predict(trendLine, 1)).toBe(105);
      expect(LinearRegression.predict(trendLine, 5)).toBe(125);
    });
  });

  describe('isMeaningful', () => {
    it('should return true for high R-squared', () => {
      const trendLine = { slope: 5, intercept: 100, rSquared: 0.9 };
      expect(LinearRegression.isMeaningful(trendLine)).toBe(true);
    });

    it('should return false for low R-squared', () => {
      const trendLine = { slope: 5, intercept: 100, rSquared: 0.3 };
      expect(LinearRegression.isMeaningful(trendLine)).toBe(false);
    });

    it('should use custom threshold', () => {
      const trendLine = { slope: 5, intercept: 100, rSquared: 0.6 };
      expect(LinearRegression.isMeaningful(trendLine, 0.7)).toBe(false);
      expect(LinearRegression.isMeaningful(trendLine, 0.5)).toBe(true);
    });
  });
});
