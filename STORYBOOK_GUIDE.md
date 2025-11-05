# 📚 Storybook 시각적 회귀 테스트 가이드

> 이 문서는 일정 관리 앱의 Storybook 설정 및 스토리 작성 가이드입니다.
> 중간에 작업을 중단했다가 재개해도 이해할 수 있도록 상세하게 작성되었습니다.

## 📋 목차

1. [Storybook이란?](#storybook이란)
2. [설치 및 설정](#설치-및-설정)
3. [필수 스토리 작성](#필수-스토리-작성)
4. [Chromatic 연동](#chromatic-연동)
5. [CI/CD 설정](#cicd-설정)
6. [체크리스트](#체크리스트)

---

## 🎯 Storybook이란?

### 정의
- **UI 컴포넌트 개발 및 테스트 도구**
- 독립된 환경에서 컴포넌트를 개발하고 시각화
- 다양한 상태(props)를 쉽게 테스트

### 장점
- ✅ **독립적 개발**: 전체 앱 실행 없이 컴포넌트만 개발
- ✅ **시각적 테스트**: UI 변경사항을 눈으로 확인
- ✅ **문서화**: 컴포넌트 사용법 자동 문서화
- ✅ **협업**: 디자이너/PM과 컴포넌트 공유 용이
- ✅ **회귀 테스트**: Chromatic으로 시각적 변경 감지

### 과제 요구사항
```
✅ 타입에 따른 캘린더 뷰 렌더링
✅ 일정 상태별 시각적 표현
✅ 다이얼로그 및 모달
✅ 폼 컨트롤 상태
✅ 각 셀 텍스트 길이에 따른 처리
```

---

## 🚀 설치 및 설정

### Step 1: Storybook 설치

```bash
# pnpm 사용 (과제 환경)
pnpm dlx storybook@latest init

# 또는 npm 사용
npx storybook@latest init
```

**자동으로 생성되는 파일들**:
```
.storybook/
├── main.ts          # Storybook 메인 설정
└── preview.ts       # 글로벌 데코레이터, 파라미터

src/stories/         # 예제 스토리 (삭제해도 됨)
```

### Step 2: 설정 파일 수정

#### `.storybook/main.ts`
```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

#### `.storybook/preview.ts`
```typescript
import type { Preview } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

// MUI 테마 설정
const theme = createTheme();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
```

### Step 3: 실행 확인

```bash
# Storybook 실행
pnpm storybook

# 또는
npm run storybook
```

**브라우저에서 `http://localhost:6006` 자동 열림**

---

## ✍️ 필수 스토리 작성

### 📝 스토리 작성 기본 구조

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import ComponentName from './ComponentName';

const meta = {
  title: 'Components/ComponentName',  // Storybook 카테고리 경로
  component: ComponentName,
  parameters: {
    layout: 'centered',  // 레이아웃: centered, fullscreen, padded
  },
  tags: ['autodocs'],  // 자동 문서화
  argTypes: {
    // props 타입 정의 (자동 생성됨)
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 스토리
export const Default: Story = {
  args: {
    // props 값
  },
};
```

---

## 📦 컴포넌트별 스토리 작성 가이드

### 1️⃣ EventCard (우선순위: ⭐⭐⭐)

**위치**: `src/stories/EventCard.stories.tsx`

**필수 스토리**:
- ✅ Default (기본 일정)
- ✅ Notified (알림 발생한 일정)
- ✅ Repeating Daily (매일 반복)
- ✅ Repeating Weekly (매주 반복)
- ✅ Long Title (긴 제목 말줄임표)
- ✅ Dragging (드래그 중 상태)

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import EventCard from '../components/calendar/EventCard';
import { Event } from '../types';

const meta = {
  title: 'Calendar/EventCard',
  component: EventCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '200px', padding: '16px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 일정
export const Default: Story = {
  args: {
    event: {
      id: '1',
      title: '팀 회의',
      date: '2024-11-05',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    isNotified: false,
  },
};

// 알림 발생
export const Notified: Story = {
  args: {
    ...Default.args,
    isNotified: true,
  },
};

// 반복 일정 (매일)
export const RepeatingDaily: Story = {
  args: {
    event: {
      ...Default.args.event!,
      title: '아침 운동',
      repeat: { type: 'daily', interval: 1 },
    },
    isNotified: false,
  },
};

// 반복 일정 (매주)
export const RepeatingWeekly: Story = {
  args: {
    event: {
      ...Default.args.event!,
      title: '주간 회의',
      repeat: { type: 'weekly', interval: 1 },
    },
    isNotified: false,
  },
};

// 긴 제목 (말줄임표 처리)
export const LongTitle: Story = {
  args: {
    event: {
      ...Default.args.event!,
      title: '이것은 매우 긴 제목으로 말줄임표가 적용되어야 하는 일정입니다',
    },
    isNotified: false,
  },
};

// 드래그 중 상태 (시각적으로만 표현)
export const Dragging: Story = {
  args: {
    ...Default.args,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '200px', padding: '16px' }}>
        <div style={{ opacity: 0.5, cursor: 'grabbing' }}>
          <Story />
        </div>
      </div>
    ),
  ],
};
```

---

### 2️⃣ CalendarCell (우선순위: ⭐⭐⭐)

**위치**: `src/stories/CalendarCell.stories.tsx`

**필수 스토리**:
- ✅ Empty (빈 셀)
- ✅ WithDate (날짜만 있는 셀)
- ✅ WithHoliday (공휴일 포함)
- ✅ WithSingleEvent (일정 1개)
- ✅ WithMultipleEvents (일정 여러 개)
- ✅ DropHover (드롭 존 하이라이트)

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import CalendarCell from '../components/calendar/CalendarCell';
import { Event } from '../types';

const meta = {
  title: 'Calendar/CalendarCell',
  component: CalendarCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '150px', height: '120px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CalendarCell>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockEvent: Event = {
  id: '1',
  title: '팀 회의',
  date: '2024-11-05',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 팀 미팅',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

// 빈 셀
export const Empty: Story = {
  args: {
    day: null,
    events: [],
    notifiedEventIds: [],
  },
};

// 날짜만 있는 셀
export const WithDate: Story = {
  args: {
    day: 15,
    dateString: '2024-11-15',
    events: [],
    notifiedEventIds: [],
  },
};

// 공휴일 포함
export const WithHoliday: Story = {
  args: {
    day: 5,
    dateString: '2024-11-05',
    events: [],
    notifiedEventIds: [],
    holiday: '어린이날',
  },
};

// 일정 1개
export const WithSingleEvent: Story = {
  args: {
    day: 5,
    dateString: '2024-11-05',
    events: [mockEvent],
    notifiedEventIds: [],
  },
};

// 일정 여러 개
export const WithMultipleEvents: Story = {
  args: {
    day: 10,
    dateString: '2024-11-10',
    events: [
      mockEvent,
      { ...mockEvent, id: '2', title: '점심 약속', startTime: '12:00', endTime: '13:00' },
      { ...mockEvent, id: '3', title: '오후 미팅', startTime: '14:00', endTime: '15:00' },
      { ...mockEvent, id: '4', title: '저녁 운동', startTime: '18:00', endTime: '19:00' },
    ],
    notifiedEventIds: [],
  },
};

// 드롭 호버 상태
export const DropHover: Story = {
  args: {
    ...WithDate.args,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '150px', height: '120px', backgroundColor: '#e3f2fd' }}>
        <Story />
      </div>
    ),
  ],
};
```

---

### 3️⃣ OverlapDialog (우선순위: ⭐⭐)

**위치**: `src/stories/OverlapDialog.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import OverlapDialog from '../components/dialogs/OverlapDialog';

const meta = {
  title: 'Dialogs/OverlapDialog',
  component: OverlapDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OverlapDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Opened: Story = {
  args: {
    isOpen: true,
    overlappingEvents: [
      { id: '1', title: '팀 회의', date: '2024-11-05', startTime: '10:00', endTime: '11:00' },
      { id: '2', title: '점심 약속', date: '2024-11-05', startTime: '10:30', endTime: '11:30' },
    ],
    onConfirm: () => console.log('Confirmed'),
    onCancel: () => console.log('Cancelled'),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    overlappingEvents: [],
    onConfirm: () => {},
    onCancel: () => {},
  },
};
```

---

### 4️⃣ RecurringEventDialog (우선순위: ⭐⭐)

**위치**: `src/stories/RecurringEventDialog.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import RecurringEventDialog from '../components/dialogs/RecurringEventDialog';

const meta = {
  title: 'Dialogs/RecurringEventDialog',
  component: RecurringEventDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RecurringEventDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Opened: Story = {
  args: {
    isOpen: true,
    onConfirm: (editType) => console.log('Confirmed:', editType),
    onClose: () => console.log('Closed'),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onConfirm: () => {},
    onClose: () => {},
  },
};
```

---

### 5️⃣ EventForm (우선순위: ⭐⭐⭐)

**위치**: `src/stories/EventForm.stories.tsx`

**필수 스토리**:
- ✅ Empty (생성 모드)
- ✅ Filled (수정 모드)
- ✅ WithRepeat (반복 설정 활성화)
- ✅ WithNotification (알림 설정)
- ✅ ValidationError (검증 에러)

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import EventForm from '../components/event/EventForm';
import { Event } from '../types';

const meta = {
  title: 'Event/EventForm',
  component: EventForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockEvent: Event = {
  id: '1',
  title: '팀 회의',
  date: '2024-11-05',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 팀 미팅',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

// 빈 폼 (생성 모드)
export const Empty: Story = {
  args: {
    event: null,
    onSave: (event) => console.log('Save:', event),
  },
};

// 데이터 채워진 폼 (수정 모드)
export const Filled: Story = {
  args: {
    event: mockEvent,
    onSave: (event) => console.log('Save:', event),
  },
};

// 반복 설정 활성화
export const WithRepeat: Story = {
  args: {
    event: {
      ...mockEvent,
      repeat: { type: 'weekly', interval: 1 },
    },
    onSave: (event) => console.log('Save:', event),
  },
};

// 알림 설정
export const WithNotification: Story = {
  args: {
    event: {
      ...mockEvent,
      notificationTime: 60,
    },
    onSave: (event) => console.log('Save:', event),
  },
};
```

---

### 6️⃣ CalendarView (우선순위: ⭐⭐)

**위치**: `src/stories/CalendarView.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import CalendarView from '../components/calendar/CalendarView';
import { Event } from '../types';

const meta = {
  title: 'Calendar/CalendarView',
  component: CalendarView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CalendarView>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2024-11-05',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2024-11-10',
    startTime: '12:00',
    endTime: '13:00',
    description: '',
    location: '',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

// 월간 뷰
export const MonthView: Story = {
  args: {
    view: 'month',
    currentDate: new Date('2024-11-05'),
    holidays: { '2024-11-05': '어린이날' },
    filteredEvents: mockEvents,
    notifiedEventIds: [],
    onNavigate: (direction) => console.log('Navigate:', direction),
    onViewChange: (view) => console.log('View changed:', view),
    onDateClick: (day) => console.log('Date clicked:', day),
  },
};

// 주간 뷰
export const WeekView: Story = {
  args: {
    ...MonthView.args,
    view: 'week',
  },
};

// 빈 캘린더
export const EmptyCalendar: Story = {
  args: {
    ...MonthView.args,
    filteredEvents: [],
  },
};
```

---

## 🎨 Chromatic 연동

### Step 1: Chromatic 계정 생성

1. [Chromatic 웹사이트](https://www.chromatic.com/) 접속
2. **"Sign up with GitHub"** 클릭
3. 저장소 선택: `front_7th_chapter1-3`
4. **Project Token** 복사 (나중에 사용)

### Step 2: Chromatic 설치

```bash
pnpm add -D chromatic

# 또는
npm install -D chromatic
```

### Step 3: 첫 배포

```bash
pnpm exec chromatic --project-token=<YOUR_PROJECT_TOKEN>

# 또는
npx chromatic --project-token=<YOUR_PROJECT_TOKEN>
```

**결과**:
- Storybook이 Chromatic에 배포됨
- 각 스토리의 스냅샷 생성
- 대시보드 URL 제공

### Step 4: package.json에 스크립트 추가

```json
{
  "scripts": {
    "chromatic": "chromatic --exit-zero-on-changes"
  }
}
```

---

## ⚙️ CI/CD 설정

### GitHub Actions로 자동화

**파일 생성**: `.github/workflows/chromatic.yml`

```yaml
name: Chromatic Deployment

on:
  push:
    branches: [main]
  pull_request:

jobs:
  chromatic:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 전체 Git 히스토리 필요 (변경 감지용)
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Publish to Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitZeroOnChanges: true  # 변경사항 있어도 성공으로 처리
```

### GitHub Secrets 설정

1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. Name: `CHROMATIC_PROJECT_TOKEN`
4. Value: Chromatic에서 복사한 토큰
5. **Add secret** 클릭

---

## ✅ 체크리스트

### Phase 1: Storybook 설정

- [ ] Storybook 설치 완료
- [ ] `.storybook/main.ts` 설정
- [ ] `.storybook/preview.ts` 설정 (MUI 테마)
- [ ] 로컬에서 Storybook 실행 확인 (`pnpm storybook`)
- [ ] 커밋: `feat: Storybook 초기 설정`

### Phase 2: 컴포넌트 스토리 작성

- [ ] `EventCard.stories.tsx` 작성 (6개 스토리)
  - [ ] Default
  - [ ] Notified
  - [ ] Repeating Daily
  - [ ] Repeating Weekly
  - [ ] Long Title
  - [ ] Dragging
- [ ] `CalendarCell.stories.tsx` 작성 (6개 스토리)
  - [ ] Empty
  - [ ] WithDate
  - [ ] WithHoliday
  - [ ] WithSingleEvent
  - [ ] WithMultipleEvents
  - [ ] DropHover
- [ ] `OverlapDialog.stories.tsx` 작성 (2개 스토리)
- [ ] `RecurringEventDialog.stories.tsx` 작성 (2개 스토리)
- [ ] `EventForm.stories.tsx` 작성 (4개 스토리)
- [ ] `CalendarView.stories.tsx` 작성 (3개 스토리)
- [ ] 모든 스토리가 Storybook에서 정상 렌더링되는지 확인
- [ ] 커밋: `feat: 컴포넌트 스토리 작성`

### Phase 3: Chromatic 연동

- [ ] Chromatic 계정 생성 (GitHub 연동)
- [ ] Project Token 발급
- [ ] `chromatic` 패키지 설치
- [ ] 로컬에서 첫 배포 테스트
- [ ] GitHub Secrets에 토큰 등록
- [ ] `.github/workflows/chromatic.yml` 작성
- [ ] PR 생성하여 CI 동작 확인
- [ ] 커밋: `ci: Chromatic 자동 배포 설정`

### Phase 4: 최종 검증

- [ ] 모든 필수 스토리 작성 완료 (23개+)
- [ ] Storybook이 로컬에서 정상 실행
- [ ] Chromatic 대시보드에서 모든 스토리 확인
- [ ] CI/CD 파이프라인 정상 동작
- [ ] 기존 Vitest 테스트 모두 통과 (`pnpm test`)
- [ ] 커밋 히스토리 정리

---

## 🎯 예상 작업 시간

| 작업 | 예상 시간 |
|------|----------|
| Storybook 설치 및 설정 | 30분 |
| EventCard 스토리 | 30분 |
| CalendarCell 스토리 | 30분 |
| Dialog 스토리 (2개) | 40분 |
| EventForm 스토리 | 40분 |
| CalendarView 스토리 | 30분 |
| Chromatic 연동 | 30분 |
| CI/CD 설정 | 30분 |
| **총 예상 시간** | **4-5시간** |

---

## 💡 팁 & 주의사항

### ✅ DO

1. **스토리 이름은 명확하게**: `Default`, `Notified`, `LongTitle` 등
2. **Decorator 활용**: 공통 레이아웃을 decorator로 추출
3. **Args 재사용**: 기존 스토리의 args를 spread로 재사용
4. **Console 확인**: 콜백 함수는 `console.log`로 동작 확인
5. **순차 작업**: 한 컴포넌트씩 완성 후 다음으로

### ❌ DON'T

1. **API 호출 금지**: Storybook은 독립 환경, 모킹 데이터 사용
2. **라우터 의존 금지**: `useNavigate` 같은 라우터 훅 사용 X
3. **전역 상태 의존 최소화**: 가능하면 props로 전달
4. **복잡한 로직 지양**: 스토리는 시각적 표현에 집중
5. **스냅샷 테스트 과도 사용 지양**: Chromatic이 자동으로 처리

---

## 🔗 참고 자료

- [Storybook 공식 문서](https://storybook.js.org/docs/react/get-started/introduction)
- [Chromatic 문서](https://www.chromatic.com/docs/)
- [MUI Storybook 통합](https://mui.com/material-ui/guides/storybook/)

---

## 📝 작업 로그 템플릿

작업 중간에 끊을 때 아래 형식으로 메모하세요:

```markdown
## 작업 로그

### 2024-11-05 14:00
- ✅ Storybook 설치 완료
- ✅ EventCard 스토리 작성 완료 (6개)
- ⏸️ CalendarCell 스토리 작성 중 (3/6 완료)
- 📌 다음: CalendarCell 나머지 3개 스토리 작성

### 2024-11-06 10:00
- ✅ CalendarCell 스토리 완료
- ✅ Dialog 스토리 완료
- ⏸️ EventForm 스토리 시작 예정
```

---

## 🆘 문제 해결

### Q: Storybook이 실행되지 않아요
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
pnpm install

# Storybook 캐시 삭제
rm -rf node_modules/.cache
```

### Q: MUI 스타일이 적용되지 않아요
- `.storybook/preview.ts`에 `ThemeProvider` 추가 확인
- CssBaseline 컴포넌트 추가 확인

### Q: TypeScript 에러가 나요
```bash
# 타입 체크
pnpm lint:tsc
```

### Q: Chromatic 배포가 실패해요
- Project Token 확인
- GitHub Secrets 등록 확인
- fetch-depth: 0 설정 확인

---

**준비 완료! 이제 작업을 시작하세요! 🚀**

