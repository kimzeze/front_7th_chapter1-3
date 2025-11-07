import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useRecurringEventOperations } from '../../hooks/useRecurringEventOperations';
import { Event } from '../../types';

describe('반복 일정 전체 수정 통합 테스트', () => {
  let mockUpdateEvents: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateEvents = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  describe('repeatId가 있는 경우 - 반복 일정 API 사용', () => {
    it('repeatId가 있는 반복 일정 전체 수정', async () => {
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '주간 미팅',
          date: '2025-11-03',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 진행 상황 공유',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'weekly',
            interval: 1,
            id: 'repeat-123',
          },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '주간 미팅',
          date: '2025-11-10',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 진행 상황 공유',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'weekly',
            interval: 1,
            id: 'repeat-123',
          },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '주간 미팅',
          date: '2025-11-17',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 진행 상황 공유',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'weekly',
            interval: 1,
            id: 'repeat-123',
          },
          notificationTime: 10,
        },
        {
          id: '4',
          title: '주간 미팅',
          date: '2025-11-24',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 진행 상황 공유',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'weekly',
            interval: 1,
            id: 'repeat-123',
          },
          notificationTime: 10,
        },
      ];

      const { result } = renderHook(() =>
        useRecurringEventOperations(mockEvents, mockUpdateEvents)
      );

      const updatedEvent: Event = {
        ...mockEvents[0],
        title: '주간 팀 미팅',
        description: '주간 진행 상황 및 목표 공유',
      };

      // 관련 이벤트가 모두 찾아지는지 확인
      const relatedEvents = result.current.findRelatedRecurringEvents(mockEvents[0]);
      expect(relatedEvents).toHaveLength(4); // 4개의 관련 이벤트 확인

      await act(async () => {
        await result.current.handleRecurringEdit(updatedEvent, false); // editSingleOnly = false
      });

      // 반복 일정 API가 1번만 호출되어야 함 (관련 이벤트 개수와 무관하게 1번만)
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('/api/recurring-events/repeat-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '주간 팀 미팅',
          description: '주간 진행 상황 및 목표 공유',
          location: '회의실 A',
          category: '업무',
          notificationTime: 10,
        }),
      });

      // 개별 이벤트 API는 호출되지 않아야 함
      expect(fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/events/'),
        expect.anything()
      );

      // updateEvents가 호출되어야 함
      expect(mockUpdateEvents).toHaveBeenCalledWith([]);
    });
  });

  describe('repeatId가 없는 경우 - 개별 이벤트 API 사용', () => {
    it('repeatId가 없는 반복 일정 전체 수정', async () => {
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '아침 운동',
          date: '2025-11-01',
          startTime: '07:00',
          endTime: '08:00',
          description: '매일 아침 운동',
          location: '공원',
          category: '건강',
          repeat: {
            type: 'daily',
            interval: 1,
            // repeatId 없음
          },
          notificationTime: 5,
        },
        {
          id: '2',
          title: '아침 운동',
          date: '2025-11-02',
          startTime: '07:00',
          endTime: '08:00',
          description: '매일 아침 운동',
          location: '공원',
          category: '건강',
          repeat: {
            type: 'daily',
            interval: 1,
            // repeatId 없음
          },
          notificationTime: 5,
        },
        {
          id: '3',
          title: '아침 운동',
          date: '2025-11-03',
          startTime: '07:00',
          endTime: '08:00',
          description: '매일 아침 운동',
          location: '공원',
          category: '건강',
          repeat: {
            type: 'daily',
            interval: 1,
            // repeatId 없음
          },
          notificationTime: 5,
        },
        {
          id: '4',
          title: '아침 운동',
          date: '2025-11-04',
          startTime: '07:00',
          endTime: '08:00',
          description: '매일 아침 운동',
          location: '공원',
          category: '건강',
          repeat: {
            type: 'daily',
            interval: 1,
            // repeatId 없음
          },
          notificationTime: 5,
        },
        {
          id: '5',
          title: '아침 운동',
          date: '2025-11-05',
          startTime: '07:00',
          endTime: '08:00',
          description: '매일 아침 운동',
          location: '공원',
          category: '건강',
          repeat: {
            type: 'daily',
            interval: 1,
            // repeatId 없음
          },
          notificationTime: 5,
        },
      ];

      const { result } = renderHook(() =>
        useRecurringEventOperations(mockEvents, mockUpdateEvents)
      );

      const updatedEvent: Event = {
        ...mockEvents[0],
        title: '아침 러닝',
      };

      // 관련 이벤트가 모두 찾아지는지 확인
      const relatedEvents = result.current.findRelatedRecurringEvents(mockEvents[0]);
      expect(relatedEvents).toHaveLength(5); // 5개의 관련 이벤트 확인

      await act(async () => {
        await result.current.handleRecurringEdit(updatedEvent, false); // editSingleOnly = false
      });

      // 관련 이벤트 개수만큼 API 호출이 발생해야 함
      expect(fetch).toHaveBeenCalledTimes(relatedEvents.length);

      // 모든 관련 이벤트가 수정된 제목으로 업데이트되어야 함
      relatedEvents.forEach((event) => {
        expect(fetch).toHaveBeenCalledWith(`/api/events/${event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...event,
            title: '아침 러닝', // 수정된 제목
          }),
        });
      });

      // updateEvents가 호출되어야 함
      expect(mockUpdateEvents).toHaveBeenCalledWith([]);
    });
  });

  describe('관련 이벤트 찾기 검증', () => {
    it('같은 반복 시리즈의 모든 이벤트 찾기', () => {
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '주간 미팅',
          date: '2025-11-03',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 진행 상황 공유',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '주간 미팅',
          date: '2025-11-10',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 진행 상황 공유',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '주간 미팅',
          date: '2025-11-17',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 진행 상황 공유',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '4',
          title: '주간 미팅',
          date: '2025-11-24',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 진행 상황 공유',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '5',
          title: '월간 리뷰',
          date: '2025-11-01',
          startTime: '14:00',
          endTime: '15:00',
          description: '월간 진행 상황 리뷰',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'monthly', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '6',
          title: '월간 리뷰',
          date: '2025-12-01',
          startTime: '14:00',
          endTime: '15:00',
          description: '월간 진행 상황 리뷰',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'monthly', interval: 1 },
          notificationTime: 10,
        },
      ];

      const { result } = renderHook(() =>
        useRecurringEventOperations(mockEvents, mockUpdateEvents)
      );

      const relatedEvents = result.current.findRelatedRecurringEvents(mockEvents[0]);

      // 같은 반복 시리즈의 4개 이벤트만 반환되어야 함
      expect(relatedEvents).toHaveLength(4);
      expect(relatedEvents).toContain(mockEvents[0]);
      expect(relatedEvents).toContain(mockEvents[1]);
      expect(relatedEvents).toContain(mockEvents[2]);
      expect(relatedEvents).toContain(mockEvents[3]);

      // 다른 반복 일정은 포함되지 않아야 함
      expect(relatedEvents).not.toContain(mockEvents[4]);
      expect(relatedEvents).not.toContain(mockEvents[5]);
    });
  });

  describe('에러 처리', () => {
    it('API 요청 실패 시 처리', async () => {
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '주간 미팅',
          date: '2025-11-03',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 진행 상황 공유',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'weekly',
            interval: 1,
            id: 'repeat-123',
          },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '주간 미팅',
          date: '2025-11-10',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 진행 상황 공유',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'weekly',
            interval: 1,
            id: 'repeat-123',
          },
          notificationTime: 10,
        },
      ];

      // API 실패 응답 모킹
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

      const { result } = renderHook(() =>
        useRecurringEventOperations(mockEvents, mockUpdateEvents)
      );

      const updatedEvent: Event = {
        ...mockEvents[0],
        title: '주간 팀 미팅',
      };

      await act(async () => {
        await result.current.handleRecurringEdit(updatedEvent, false);
      });

      // API 요청은 시도되어야 함
      expect(fetch).toHaveBeenCalled();

      // 하지만 updateEvents는 여전히 호출되어야 함 (새로고침 신호)
      expect(mockUpdateEvents).toHaveBeenCalledWith([]);
    });
  });
});
