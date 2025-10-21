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

// RSI 계산 (EMA 방식)
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

  // 초기 평균 계산 (단순 평균)
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // period번째 이후부터 EMA 방식으로 갱신
  for (let i = period; i < closes.length; i++) {
    const gain = gains[i - 1];
    const loss = losses[i - 1];

    // EMA 방식 갱신
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    // RS와 RSI 계산
    const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    result.push({
      time: Math.floor(sortedData[i].time / 1000), // milliseconds to seconds (정수)
      value: rsi,
    });
  }

  return result;
};
