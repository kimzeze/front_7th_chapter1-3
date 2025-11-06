import type { Event, EventForm, RepeatInfo, RepeatType } from '../../src/types';

/**
 * 테스트 데이터 Factory
 *
 * @description
 * - Factory 패턴을 사용하여 테스트 데이터 생성
 * - 기본값을 제공하고, 필요한 부분만 오버라이드
 * - 일관성 있는 테스트 데이터 생성
 */

/**
 * 날짜 헬퍼 함수
 */
export const DateHelper = {
  /**
   * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
   */
  today: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * 특정 날짜로부터 N일 후의 날짜를 반환
   */
  addDays: (date: string, days: number): string => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  },

  /**
   * 특정 날짜로부터 N일 전의 날짜를 반환
   */
  subtractDays: (date: string, days: number): string => {
    return DateHelper.addDays(date, -days);
  },

  /**
   * YYYY-MM-DD 형식의 날짜 생성
   */
  format: (year: number, month: number, day: number): string => {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  },

  /**
   * 현재 월의 첫날
   */
  firstDayOfMonth: (): string => {
    const now = new Date();
    return DateHelper.format(now.getFullYear(), now.getMonth() + 1, 1);
  },

  /**
   * 현재 월의 마지막 날
   */
  lastDayOfMonth: (): string => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return DateHelper.format(now.getFullYear(), now.getMonth() + 1, lastDay);
  },
};

/**
 * 기본 반복 정보
 */
const DEFAULT_REPEAT_INFO: RepeatInfo = {
  type: 'none',
  interval: 1,
};

/**
 * 기본 일정 폼 데이터
 */
const DEFAULT_EVENT_FORM: EventForm = {
  title: '테스트 일정',
  date: DateHelper.today(),
  startTime: '10:00',
  endTime: '11:00',
  description: '테스트 설명',
  location: '테스트 위치',
  category: '업무',
  repeat: DEFAULT_REPEAT_INFO,
  notificationTime: 10, // 10분 전
};

/**
 * EventForm Factory
 */
export const EventFormFactory = {
  /**
   * 기본 일정 폼 생성
   */
  create: (overrides: Partial<EventForm> = {}): EventForm => {
    return {
      ...DEFAULT_EVENT_FORM,
      ...overrides,
      repeat: {
        ...DEFAULT_REPEAT_INFO,
        ...(overrides.repeat || {}),
      },
    };
  },

  /**
   * 여러 일정 폼 생성
   */
  createMany: (count: number, overrides: Partial<EventForm> = {}): EventForm[] => {
    return Array.from({ length: count }, (_, i) =>
      EventFormFactory.create({
        ...overrides,
        title: `${overrides.title || '테스트 일정'} ${i + 1}`,
      })
    );
  },

  /**
   * 반복 일정 폼 생성
   */
  createRecurring: (repeatType: RepeatType, overrides: Partial<EventForm> = {}): EventForm => {
    const endDate = DateHelper.addDays(overrides.date || DateHelper.today(), 30);

    return EventFormFactory.create({
      ...overrides,
      repeat: {
        type: repeatType,
        interval: 1,
        endDate,
        ...(overrides.repeat || {}),
      },
    });
  },

  /**
   * 전일 일정 폼 생성
   */
  createAllDay: (overrides: Partial<EventForm> = {}): EventForm => {
    return EventFormFactory.create({
      ...overrides,
      startTime: '00:00',
      endTime: '23:59',
    });
  },

  /**
   * 겹치는 일정 폼 생성
   */
  createOverlapping: (baseEvent: EventForm): EventForm => {
    // 시작 시간은 30분 뒤, 종료 시간은 30분 늦게
    const startHour = parseInt(baseEvent.startTime.split(':')[0]);
    const startMinute = parseInt(baseEvent.startTime.split(':')[1]);
    const newStartTime = `${String(startHour).padStart(2, '0')}:${String(startMinute + 30).padStart(
      2,
      '0'
    )}`;

    const endHour = parseInt(baseEvent.endTime.split(':')[0]);
    const endMinute = parseInt(baseEvent.endTime.split(':')[1]);
    const newEndTime = `${String(endHour).padStart(2, '0')}:${String(endMinute + 30).padStart(
      2,
      '0'
    )}`;

    return EventFormFactory.create({
      title: '겹치는 일정',
      date: baseEvent.date,
      startTime: newStartTime,
      endTime: newEndTime,
    });
  },
};

/**
 * Event Factory (ID 포함)
 */
export const EventFactory = {
  /**
   * 기본 일정 생성
   */
  create: (overrides: Partial<Event> = {}): Event => {
    return {
      ...EventFormFactory.create(overrides),
      id: overrides.id || `event-${Date.now()}-${Math.random()}`,
    };
  },

  /**
   * 여러 일정 생성
   */
  createMany: (count: number, overrides: Partial<Event> = {}): Event[] => {
    return Array.from({ length: count }, (_, i) =>
      EventFactory.create({
        ...overrides,
        title: `${overrides.title || '테스트 일정'} ${i + 1}`,
        id: `event-${i + 1}`,
      })
    );
  },
};

/**
 * 카테고리별 일정 템플릿
 */
export const EventTemplates = {
  /**
   * 업무 일정
   */
  work: (overrides: Partial<EventForm> = {}): EventForm => {
    return EventFormFactory.create({
      title: '팀 회의',
      category: '업무',
      location: '회의실 A',
      description: '주간 팀 미팅',
      startTime: '14:00',
      endTime: '15:00',
      notificationTime: 10,
      ...overrides,
    });
  },

  /**
   * 개인 일정
   */
  personal: (overrides: Partial<EventForm> = {}): EventForm => {
    return EventFormFactory.create({
      title: '개인 약속',
      category: '개인',
      location: '집',
      description: '개인 일정',
      startTime: '18:00',
      endTime: '19:00',
      notificationTime: 30,
      ...overrides,
    });
  },

  /**
   * 기타 일정
   */
  etc: (overrides: Partial<EventForm> = {}): EventForm => {
    return EventFormFactory.create({
      title: '기타 일정',
      category: '기타',
      location: '',
      description: '',
      startTime: '12:00',
      endTime: '13:00',
      notificationTime: 0,
      ...overrides,
    });
  },

  /**
   * 매일 반복 일정
   */
  dailyRecurring: (overrides: Partial<EventForm> = {}): EventForm => {
    return EventFormFactory.createRecurring('daily', {
      title: '매일 스탠드업 미팅',
      category: '업무',
      startTime: '09:00',
      endTime: '09:30',
      notificationTime: 10,
      ...overrides,
    });
  },

  /**
   * 매주 반복 일정
   */
  weeklyRecurring: (overrides: Partial<EventForm> = {}): EventForm => {
    return EventFormFactory.createRecurring('weekly', {
      title: '주간 보고',
      category: '업무',
      startTime: '16:00',
      endTime: '17:00',
      notificationTime: 60,
      ...overrides,
    });
  },

  /**
   * 매월 반복 일정
   */
  monthlyRecurring: (overrides: Partial<EventForm> = {}): EventForm => {
    return EventFormFactory.createRecurring('monthly', {
      title: '월간 회의',
      category: '업무',
      startTime: '10:00',
      endTime: '12:00',
      notificationTime: 1440, // 1일 전
      ...overrides,
    });
  },
};

/**
 * 테스트 시나리오별 데이터 세트
 */
export const TestDataSets = {
  /**
   * 기본 CRUD 테스트용 일정
   */
  basicCrud: {
    create: EventFormFactory.create({
      title: '새 일정',
      date: DateHelper.today(),
      startTime: '10:00',
      endTime: '11:00',
    }),
    update: EventFormFactory.create({
      title: '수정된 일정',
      date: DateHelper.today(),
      startTime: '14:00',
      endTime: '15:00',
    }),
  },

  /**
   * 겹침 테스트용 일정들
   */
  overlapping: {
    base: EventFormFactory.create({
      title: '기준 일정',
      date: DateHelper.today(),
      startTime: '10:00',
      endTime: '12:00',
    }),
    completeOverlap: EventFormFactory.create({
      title: '완전히 겹치는 일정',
      date: DateHelper.today(),
      startTime: '10:00',
      endTime: '12:00',
    }),
    partialOverlap: EventFormFactory.create({
      title: '부분적으로 겹치는 일정',
      date: DateHelper.today(),
      startTime: '11:00',
      endTime: '13:00',
    }),
    contained: EventFormFactory.create({
      title: '포함되는 일정',
      date: DateHelper.today(),
      startTime: '10:30',
      endTime: '11:30',
    }),
    noOverlap: EventFormFactory.create({
      title: '겹치지 않는 일정',
      date: DateHelper.today(),
      startTime: '14:00',
      endTime: '15:00',
    }),
  },

  /**
   * 검색/필터링 테스트용 다양한 일정들
   */
  searchAndFilter: {
    events: [
      EventTemplates.work({
        title: '아침 회의',
        date: DateHelper.today(),
        startTime: '09:00',
        endTime: '10:00',
      }),
      EventTemplates.personal({
        title: '점심 약속',
        date: DateHelper.today(),
        startTime: '12:00',
        endTime: '13:00',
      }),
      EventTemplates.etc({
        title: '저녁 운동',
        date: DateHelper.today(),
        startTime: '18:00',
        endTime: '19:00',
      }),
      EventTemplates.work({
        title: '오후 회의',
        date: DateHelper.addDays(DateHelper.today(), 1),
        startTime: '15:00',
        endTime: '16:00',
      }),
    ],
  },

  /**
   * 알림 테스트용 일정들
   */
  notifications: {
    withNotification: EventFormFactory.create({
      title: '알림 있는 일정',
      date: DateHelper.today(),
      startTime: '15:00',
      endTime: '16:00',
      notificationTime: 10,
    }),
    withMultipleNotifications: EventFormFactory.create({
      title: '여러 알림이 있는 일정',
      date: DateHelper.today(),
      startTime: '16:00',
      endTime: '17:00',
      notificationTime: 60,
    }),
    noNotification: EventFormFactory.create({
      title: '알림 없는 일정',
      date: DateHelper.today(),
      startTime: '17:00',
      endTime: '18:00',
      notificationTime: 0,
    }),
  },
};

/**
 * 유효성 검증 테스트용 잘못된 데이터
 */
export const InvalidData = {
  /**
   * 시작 시간이 종료 시간보다 늦은 경우
   */
  invalidTimeRange: EventFormFactory.create({
    title: '잘못된 시간 범위',
    startTime: '15:00',
    endTime: '14:00', // 시작 시간보다 빠름
  }),

  /**
   * 빈 제목
   */
  emptyTitle: EventFormFactory.create({
    title: '',
  }),

  /**
   * 과거 날짜
   */
  pastDate: EventFormFactory.create({
    title: '과거 일정',
    date: DateHelper.subtractDays(DateHelper.today(), 1),
  }),
};
