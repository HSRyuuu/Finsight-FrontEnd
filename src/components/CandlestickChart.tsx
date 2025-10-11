import React, { useEffect, useRef } from 'react';
import { View, Platform, Text, StyleSheet } from 'react-native';
import { CandleData } from '../types';
import {
  calculateMovingAverage,
  calculateBollingerBands,
} from '../utils/chartIndicators';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
} from 'lightweight-charts';

interface CandlestickChartProps {
  data: CandleData[];
  height?: number;
  timeframe?: 'day' | 'hour' | 'minute'; // 차트 시간 단위 추가
  currency?: 'USD' | 'KRW'; // 통화 표시
  // TODO: 추후 설정 가능하도록 확장
  showMA5?: boolean;
  showMA20?: boolean;
  showMA60?: boolean;
  showMA200?: boolean;
  showBollingerBands?: boolean;
  ma5Period?: number;
  ma20Period?: number;
  ma60Period?: number;
  ma200Period?: number;
  bbPeriod?: number;
  bbStdDev?: number;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  height = 300,
  timeframe = 'day',
  currency = 'USD',
  showMA5 = true,
  showMA20 = true,
  showMA60 = true,
  showMA200 = true,
  showBollingerBands = true,
  ma5Period = 5,
  ma20Period = 20,
  ma60Period = 60,
  ma200Period = 200,
  bbPeriod = 20,
  bbStdDev = 2,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  // 날짜 포맷 함수들
  const formatDateForTooltip = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년${month}월${day}일`;
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!chartContainerRef.current || data.length === 0) return;

    // 기존 차트 제거
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // 새 차트 생성
    const chartOptions = {
      width: chartContainerRef.current!.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: '#F8F9FA' },
        textColor: '#000000',
      },
      grid: {
        vertLines: { color: '#E5E5EA' },
        horzLines: { color: '#E5E5EA' },
      },
      localization: {
        timeFormatter:
          timeframe === 'day'
            ? (time: any) => {
                const date = new Date(time * 1000);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              }
            : undefined,
        priceFormatter: (price: number) => {
          if (currency === 'KRW') {
            return Math.floor(price).toLocaleString();
          }
          return price.toFixed(2);
        },
      },
      timeScale: {
        borderColor: '#C6C6C8',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#C6C6C8',
      },
      crosshair: {
        mode: 1, // Normal crosshair mode
        vertLine: {
          color: '#6B7280',
          width: 1 as any,
          style: 0 as any, // Dashed line
          labelBackgroundColor: 'rgba(30, 58, 138, 0.1)',
          labelVisible: true,
        },
        horzLine: {
          color: '#9E9E9E',
          width: 1 as any,
          style: 0 as any, // Dashed line
          labelBackgroundColor: 'rgba(30, 58, 138, 0.1)',
          labelVisible: true,
        },
      },
    };

    const chart = createChart(chartContainerRef.current!, chartOptions);
    chartRef.current = chart;

    // 캔들스틱 시리즈 추가
    // 한국 스타일: 양봉(상승) = 빨간색, 음봉(하락) = 파란색
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#FF3B30', // 양봉 - 빨간색
      downColor: '#007AFF', // 음봉 - 파란색
      borderVisible: false,
      wickUpColor: '#FF3B30', // 양봉 꼬리 - 빨간색
      wickDownColor: '#007AFF', // 음봉 꼬리 - 파란색
    });

    // 일봉일 때만 커스텀 날짜 포맷 적용
    if (timeframe === 'day') {
      // 크로스헤어 이벤트 리스너 추가
      chart.subscribeCrosshairMove(param => {
        if (param.time && param.point && chartContainerRef.current) {
          // 기존 툴팁 제거
          const existingTooltip =
            chartContainerRef.current.querySelector('.custom-tooltip');
          if (existingTooltip) {
            existingTooltip.remove();
          }

          // 새 툴팁 생성
          const tooltip = document.createElement('div');
          tooltip.className = 'custom-tooltip';
          tooltip.style.position = 'absolute';
          tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          tooltip.style.color = 'white';
          tooltip.style.padding = '8px 12px';
          tooltip.style.borderRadius = '4px';
          tooltip.style.fontSize = '12px';
          tooltip.style.fontFamily = 'Arial, sans-serif';
          tooltip.style.pointerEvents = 'none';
          tooltip.style.zIndex = '1000';
          tooltip.style.whiteSpace = 'nowrap';
          tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';

          // 데이터 포인트 정보 가져오기
          const data = param.seriesData.get(candlestickSeries);
          if (data && typeof data === 'object' && 'open' in data) {
            const candleData = data as any;
            const dateStr = formatDateForTooltip(param.time as number);

            // 가격 포맷 함수
            const formatPrice = (value: number) => {
              if (currency === 'KRW') {
                return `${Math.floor(value).toLocaleString()}원`;
              }
              return `$${value.toFixed(2)}`;
            };

            tooltip.innerHTML = `
              <div><strong>${dateStr}</strong></div>
              <div>시가: ${candleData.open ? formatPrice(candleData.open) : 'N/A'}</div>
              <div>고가: ${candleData.high ? formatPrice(candleData.high) : 'N/A'}</div>
              <div>저가: ${candleData.low ? formatPrice(candleData.low) : 'N/A'}</div>
              <div>종가: ${candleData.close ? formatPrice(candleData.close) : 'N/A'}</div>
            `;
          } else {
            const dateStr = formatDateForTooltip(param.time as number);
            tooltip.innerHTML = `<div><strong>${dateStr}</strong></div>`;
          }

          // 툴팁 위치 설정 (툴팁을 먼저 DOM에 추가한 후 크기 계산)
          chartContainerRef.current.appendChild(tooltip);
          tooltip.style.left = `${Math.max(0, param.point.x - tooltip.offsetWidth / 2)}px`;
          tooltip.style.top = `${Math.max(0, param.point.y - tooltip.offsetHeight - 10)}px`;
        }
      });

      // 마우스가 차트를 벗어날 때 툴팁 제거
      chartContainerRef.current.addEventListener('mouseleave', () => {
        const tooltip =
          chartContainerRef.current?.querySelector('.custom-tooltip');
        if (tooltip) {
          tooltip.remove();
        }
      });
    }

    // 데이터 변환 및 설정
    const chartData = data
      .map(candle => ({
        time: Math.floor(candle.time / 1000) as any, // milliseconds to seconds (정수)
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }))
      .sort((a, b) => a.time - b.time); // 시간 순으로 정렬

    candlestickSeries.setData(chartData);

    // 차트 초기 표시 범위 설정 (최근 50일만 표시)
    if (chartData.length > 0) {
      const visibleBars = Math.min(50, chartData.length); // 최대 50개 또는 전체 데이터 중 작은 값
      const from = Math.max(0, chartData.length - visibleBars);
      const to = chartData.length - 1;

      chart.timeScale().setVisibleLogicalRange({
        from,
        to,
      });
    }

    // 볼린저 밴드 추가 (20일 이평선 = 볼린저 밴드 중간선)
    if (showBollingerBands && data.length >= bbPeriod) {
      const bollingerBands = calculateBollingerBands(data, bbPeriod, bbStdDev);

      if (bollingerBands.upper.length > 0) {
        // 상단 밴드
        const upperBandSeries = chart.addSeries(LineSeries, {
          color: '#FF9500', // 주황색 - 상단 밴드
          lineWidth: 1,
          lastValueVisible: false, // 오른쪽 가격 라벨 숨김
          priceLineVisible: false, // 가격선 숨김
        });
        upperBandSeries.setData(bollingerBands.upper as any);

        // 중간선 (= 20일 이동평균선)
        const middleBandSeries = chart.addSeries(LineSeries, {
          color: '#FF3B30', // 빨간색 - 볼린저 밴드 중간선 겸 MA20
          lineWidth: 1,
          lastValueVisible: false, // 오른쪽 가격 라벨 숨김
          priceLineVisible: false, // 가격선 숨김
        });
        middleBandSeries.setData(bollingerBands.middle as any);

        // 하단 밴드
        const lowerBandSeries = chart.addSeries(LineSeries, {
          color: '#FF9500', // 주황색 - 하단 밴드
          lineWidth: 1,
          lastValueVisible: false, // 오른쪽 가격 라벨 숨김
          priceLineVisible: false, // 가격선 숨김
        });
        lowerBandSeries.setData(bollingerBands.lower as any);
      }
    }

    // 5일 이동평균선 추가
    if (showMA5 && data.length >= ma5Period) {
      const ma5Data = calculateMovingAverage(data, ma5Period);

      if (ma5Data.length > 0) {
        const ma5Series = chart.addSeries(LineSeries, {
          color: '#5856D6', // 초록색 - 5일 이평선
          lineWidth: 1,
          lastValueVisible: false, // 오른쪽 가격 라벨 숨김
          priceLineVisible: false, // 가격선 숨김
        });
        ma5Series.setData(ma5Data as any);
      }
    }

    // 60일 이동평균선 추가
    if (showMA60 && data.length >= ma60Period) {
      const ma60Data = calculateMovingAverage(data, ma60Period);

      if (ma60Data.length > 0) {
        const ma60Series = chart.addSeries(LineSeries, {
          color: '#34C759', // 초록색 - 60일 이평선
          lineWidth: 1,
          lastValueVisible: false, // 오른쪽 가격 라벨 숨김
          priceLineVisible: false, // 가격선 숨김
        });
        ma60Series.setData(ma60Data as any);
      }
    }

    // 200일 이동평균선 추가
    if (showMA200 && data.length >= ma200Period) {
      const ma200Data = calculateMovingAverage(data, ma200Period);

      if (ma200Data.length > 0) {
        const ma200Series = chart.addSeries(LineSeries, {
          color: '#003366', // 네이비 - 200일 이평선
          lineWidth: 2,
          lastValueVisible: false, // 오른쪽 가격 라벨 숨김
          priceLineVisible: false, // 가격선 숨김
        });
        ma200Series.setData(ma200Data as any);
      }
    }

    // 반응형 처리
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, height, timeframe, currency]);

  if (Platform.OS !== 'web') {
    // 모바일에서는 WebView 사용 (추후 구현)
    return (
      <View
        style={{
          height,
          backgroundColor: '#F8F9FA',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* TODO: WebView로 차트 렌더링 */}
      </View>
    );
  }

  return (
    <View style={{ width: '100%', height, position: 'relative' }}>
      <div
        ref={chartContainerRef as any}
        style={{ width: '100%', height: '100%' }}
      />
      {/* 차트 범례 */}
      <View style={styles.legendContainer}>
        {showBollingerBands && (
          <>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendLine, { backgroundColor: '#FF3B30' }]}
              />

              <Text style={styles.legendText}>BB중단(20)</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendLine, { backgroundColor: '#FF9500' }]}
              />
              <Text style={styles.legendText}>BB상/하단</Text>
            </View>
          </>
        )}
        {showMA5 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#5856D6' }]} />
            {/* 5일 이동평균선 */}
            <Text style={styles.legendText}>5</Text>
          </View>
        )}
        {showMA60 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#34C759' }]} />
            {/* 60일 이동평균선 */}
            <Text style={styles.legendText}>60</Text>
          </View>
        )}
        {showMA200 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#003366' }]} />
            {/* 200일 이동평균선 */}
            <Text style={styles.legendText}>200</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 8,
    borderRadius: 6,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    maxWidth: '70%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  legendLine: {
    width: 20,
    height: 3,
    marginRight: 4,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
});
