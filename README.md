# 플러스톡 (PlusStock)

Plus + Stock = 플러스톡! 🚀

Vue3 + Nuxt 경험을 바탕으로 구축된 React Native + React Native Web 기반의 크로스 플랫폼 주식/ETF 트래킹 애플리케이션입니다.

## 📊 로고 디자인

**플러스톡**의 로고는 **Plus(+)** 기호와 **상승하는 주식 차트**를 결합한 심플하고 모던한 디자인입니다:

- **+ (플러스)**: 긍정적인 수익과 성장을 상징
- **상승 차트 라인**: 주식 투자의 성공적인 트렌드를 표현
- **빨간색 (#FF3B30)**: 한국 주식 시장의 양봉(상승) 컬러 사용
- **원형 배경**: 완성도와 안정성을 나타냄

로고는 SVG 기반으로 제작되어 어떤 크기에서도 선명하게 표시됩니다.

## 🚀 주요 특징

- **크로스 플랫폼**: React Native로 모바일 앱과 웹을 하나의 코드베이스로 관리
- **실시간 주식 데이터**: 한국/미국 주요 주식 및 ETF 데이터 조회
- **다양한 차트 기간**: 1분봉부터 월봉까지 다양한 시간대 지원
- **즐겨찾기 기능**: 관심 종목 관리 및 실시간 가격 추적
- **거래소 상태**: 실시간 거래소 개폐 상태 표시
- **TypeScript**: 타입 안정성을 위한 TypeScript 사용
- **컴포넌트 분리**: CSS를 컴포넌트와 분리하여 관리
- **서비스 레이어**: Axios 기반의 API 통신 구조
- **React Navigation**: 모바일 친화적인 네비게이션 구조
- **반응형 디자인**: 모바일과 웹에서 모두 자연스러운 UI

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   ├── Avatar.tsx
│   ├── Logo.tsx         # 플러스톡 로고 컴포넌트
│   ├── CandlestickChart.tsx  # 차트 컴포넌트
│   └── index.ts
├── screens/            # 라우팅 대상 화면
│   ├── HomeScreen.tsx
│   ├── SearchScreen.tsx
│   ├── StockDetailScreen.tsx
│   ├── SettingsScreen.tsx
│   └── index.ts
├── services/           # API 호출 로직
│   ├── api.ts
│   ├── stockService.ts
│   ├── favoriteService.ts
│   └── index.ts
├── styles/             # CSS/스타일 파일
│   ├── global.ts
│   ├── components.ts
│   └── index.ts
├── hooks/              # 커스텀 React 훅
│   ├── useStocks.ts
│   ├── useFavorites.ts
│   └── index.ts
├── navigation/         # 네비게이션 설정
│   └── AppNavigator.tsx
├── types/              # TypeScript 타입 정의
│   └── index.ts
├── utils/              # 유틸리티 함수
│   ├── constants.ts
│   └── helpers.ts
└── assets/             # 이미지, 아이콘 등
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp env.example .env
```

`.env` 파일을 편집하여 필요한 환경 변수를 설정하세요.

### 3. 개발 서버 실행

```bash
# 웹에서 실행
npm run web

# iOS에서 실행
npm run ios

# Android에서 실행
npm run android

# 개발 서버 시작
npm start
```

### 4. 웹 빌드

```bash
npm run build:web
```

빌드된 파일은 `web-build/` 디렉토리에 생성됩니다.

## 🚀 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 빌드 명령어: `npm run build:web`
3. 출력 디렉토리: `web-build`

### Netlify 배포

1. Netlify에 프로젝트 연결
2. 빌드 설정은 `netlify.toml` 파일에 정의됨

## 📱 주요 기능

### 1. 주식/ETF 관리

- 종목 검색 및 상세 정보 조회
- 즐겨찾기 종목 관리
- 실시간 가격 정보 표시
- 한국/미국 주식 및 ETF 지원

### 2. 차트 분석

- 다양한 시간대 차트 (1분봉 ~ 월봉)
- 캔들 차트 데이터 시각화
- 차트 기간 선택 및 전환
- 가격 변동률 색상 표시

### 3. 거래소 정보

- 실시간 거래소 개폐 상태
- 거래소별 상태 모니터링
- 시간대별 거래 상태 표시

### 4. 네비게이션

- 탭 기반 네비게이션 (홈, 검색, 설정)
- 스택 네비게이션 (종목 상세)
- React Navigation 사용

### 5. UI 컴포넌트

- 재사용 가능한 컴포넌트들
- 일관된 디자인 시스템
- 반응형 레이아웃
- 다크 모드 지원 준비

### 6. API 통신

- Axios 기반 HTTP 클라이언트
- 백엔드 API 연동 (Spring Boot)
- 인터셉터를 통한 에러 처리
- 커스텀 훅을 통한 데이터 관리

## 🎨 스타일 시스템

- **컴포넌트 분리**: CSS를 별도 파일로 관리
- **일관된 디자인**: 색상, 폰트, 간격 등 통일된 디자인 토큰
- **반응형**: 모바일과 웹에서 모두 자연스러운 UI

## 🔧 개발 도구

- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **TypeScript**: 타입 안정성
- **React Navigation**: 네비게이션 관리

## 📦 주요 의존성

- `expo`: React Native 개발 프레임워크
- `react-native-web`: 웹 지원
- `@react-navigation/native`: 네비게이션
- `axios`: HTTP 클라이언트
- `typescript`: 타입 시스템

## 🤝 기여하기

1. 프로젝트를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
