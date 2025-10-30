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

// RSI 계산 (Wilder's RSI 방식)
export const calculateRSI = (
  data: CandleData[],
  period: number = 14
): { time: number; value: number }[] => {
  const result: { time: number; value: number }[] = [];

  // 시간 순으로 정렬 (오름차순)
  const sortedData = [...data].sort((a, b) => a.time - b.time);

  if (sortedData.length <= period) return result;

  // 종가 리스트
  const closes = sortedData.map(candle => candle.close);

  // 가격 변화 계산
  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  // Gain과 Loss 리스트
  const gains = changes.map(change => Math.max(change, 0));
  const losses = changes.map(change => Math.max(-change, 0));

  // ✅ 초기 평균 계산 (단순 평균)
  let avgGain = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
  }
  avgGain /= period;

  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgLoss += losses[i];
  }
  avgLoss /= period;

  // ✅ period번째 이후부터 Wilder 방식(EMA 유사) 누적 계산
  for (let i = period; i < closes.length; i++) {
    const gain = gains[i - 1];
    const loss = losses[i - 1];

    // Wilder's smoothing
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    // RS와 RSI 계산 (edge case 처리)
    let rsi: number;
    if (avgLoss === 0 && avgGain === 0) {
      rsi = 50.0;
    } else if (avgLoss === 0) {
      rsi = 100.0;
    } else if (avgGain === 0) {
      rsi = 0.0;
    } else {
      const rs = avgGain / avgLoss;
      rsi = 100 - 100 / (1 + rs);
    }

    result.push({
      time: Math.floor(sortedData[i].time / 1000), // milliseconds to seconds (정수)
      value: rsi,
    });
  }

  return result;
};
