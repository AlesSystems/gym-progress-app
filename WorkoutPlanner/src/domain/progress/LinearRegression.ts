import { TrendLine } from './types';

export class LinearRegression {
  /**
   * Calculate linear regression for a set of data points
   */
  static calculate(dataPoints: Array<{ x: number; y: number }>): TrendLine {
    const n = dataPoints.length;

    if (n === 0) {
      return { slope: 0, intercept: 0, rSquared: 0 };
    }

    if (n === 1) {
      return { 
        slope: 0, 
        intercept: dataPoints[0].y, 
        rSquared: 1 
      };
    }

    const sumX = dataPoints.reduce((sum, p) => sum + p.x, 0);
    const sumY = dataPoints.reduce((sum, p) => sum + p.y, 0);
    const sumXY = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumYY = dataPoints.reduce((sum, p) => sum + p.y * p.y, 0);

    const meanX = sumX / n;
    const meanY = sumY / n;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = meanY - slope * meanX;

    // Calculate R-squared
    const ssTotal = sumYY - n * meanY * meanY;
    const ssResidual = dataPoints.reduce((sum, p) => {
      const predicted = slope * p.x + intercept;
      const residual = p.y - predicted;
      return sum + residual * residual;
    }, 0);

    const rSquared = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

    return {
      slope,
      intercept,
      rSquared: Math.max(0, Math.min(1, rSquared)), // Clamp between 0 and 1
    };
  }

  /**
   * Predict y value for a given x using the trend line
   */
  static predict(trendLine: TrendLine, x: number): number {
    return trendLine.slope * x + trendLine.intercept;
  }

  /**
   * Determine if the regression is meaningful based on R-squared threshold
   */
  static isMeaningful(trendLine: TrendLine, threshold: number = 0.5): boolean {
    return trendLine.rSquared >= threshold;
  }
}
