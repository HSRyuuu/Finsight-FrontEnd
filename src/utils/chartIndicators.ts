import { CandleData } from '../types';

// 이동평균선 계산
export const calculateMovingAverage = (
  data: CandleData[],
  period: number
): Array<{ time: number; value: number }> => {
  const result: Array<{ time: number; value: number }> = [];

  // 시간 순으로 정렬 (오름차순)
  const sortedData = [...data].sort((a, b) => a.time - b.time);

  for (let i = period - 1; i < sortedData.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += sortedData[i - j].close;
    }
    const average = sum / period;
    result.push({
      time: Math.floor(sortedData[i].time / 1000), // milliseconds to seconds (정수)
      value: average,
    });
  }

  return result;
};

// 표준편차 계산
const calculateStandardDeviation = (
  data: number[],
  average: number
): number => {
  const squaredDiffs = data.map(value => Math.pow(value - average, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
  return Math.sqrt(variance);
};

// 볼린저 밴드 계산
export const calculateBollingerBands = (
  data: CandleData[],
  period: number = 20,
  stdDev: number = 2
): {
  upper: Array<{ time: number; value: number }>;
  middle: Array<{ time: number; value: number }>;
  lower: Array<{ time: number; value: number }>;
} => {
  const upper: Array<{ time: number; value: number }> = [];
  const middle: Array<{ time: number; value: number }> = [];
  const lower: Array<{ time: number; value: number }> = [];

  // 시간 순으로 정렬 (오름차순)
  const sortedData = [...data].sort((a, b) => a.time - b.time);

  for (let i = period - 1; i < sortedData.length; i++) {
    const slice = sortedData.slice(i - period + 1, i + 1);
    const closes = slice.map(candle => candle.close);
    const sum = closes.reduce((a, b) => a + b, 0);
    const avg = sum / period;
    const std = calculateStandardDeviation(closes, avg);

    const time = Math.floor(sortedData[i].time / 1000); // milliseconds to seconds (정수)

    middle.push({ time, value: avg });
    upper.push({ time, value: avg + stdDev * std });
    lower.push({ time, value: avg - stdDev * std });
  }

  return { upper, middle, lower };
};

// RSI 계산 (추후 확장용)
export const calculateRSI = (
  data: CandleData[],
  period: number = 14
): { time: number; value: number }[] => {
  const result: { time: number; value: number }[] = [];

  if (data.length < period + 1) return result;

  for (let i = period; i < data.length; i++) {
    let gains = 0;
    let losses = 0;

    for (let j = i - period + 1; j <= i; j++) {
      const change = data[j].close - data[j - 1].close;
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    result.push({
      time: data[i].time / 1000,
      value: rsi,
    });
  }

  return result;
};
