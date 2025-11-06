import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Repeat } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { CalendarView } from './components/calendar';
import { OverlapDialog, RecurringEventDialog } from './components/dialogs';
import { EventForm as EventFormComponent, EventList } from './components/event';
import { NotificationToast } from './components/notifications';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useRecurringEventOperations } from './hooks/useRecurringEventOperations.ts';
import { useSearch } from './hooks/useSearch.ts';
import { EVENT_BOX_STYLES } from './styles/eventBoxStyles';
import { Event, EventForm } from './types.ts';
import { findOverlappingEvents } from './utils/eventOverlap.ts';

function App() {
  // ============ 드래그 앤 드롭 센서 설정 ============
  /**
   * 드래그 앤 드롭 센서 구성
   * @description
   * - MouseSensor: 8px 이동 시 드래그 시작 (클릭과 구분)
   * - TouchSensor: 200ms 지연 + 5px 허용 오차로 터치 시작
   */
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동해야 드래그 시작 (클릭과 구분)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  /**
   * 드래그 중인 일정 상태 (DragOverlay용)
   */
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  // ============ 일정 입력 폼 상태 ============
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  // ============ 일정 CRUD 작업 ============
  const { events, saveEvent, deleteEvent, createRepeatEvent, fetchEvents } = useEventOperations(
    Boolean(editingEvent),
    () => setEditingEvent(null)
  );

  // ============ 반복 일정 작업 ============
  const { handleRecurringEdit, handleRecurringDelete } = useRecurringEventOperations(
    events,
    async () => {
      // 반복 일정 수정/삭제 후 서버에서 최신 일정 목록 가져오기
      await fetchEvents();
    }
  );

  // ============ 알림, 캘린더 뷰, 검색 ============
  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  // ============ 다이얼로그 및 UI 상태 ============
  /** 일정 겹침 경고 다이얼로그 표시 상태 */
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  /** 겹치는 일정 목록 */
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  /** 반복 일정 수정/삭제 다이얼로그 표시 상태 */
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  /** 수정 대기 중인 반복 일정 */
  const [pendingRecurringEdit, setPendingRecurringEdit] = useState<Event | null>(null);
  /** 삭제 대기 중인 반복 일정 */
  const [pendingRecurringDelete, setPendingRecurringDelete] = useState<Event | null>(null);
  /** 반복 일정 수정 모드 - true: 단일 일정만 수정, false: 모든 반복 일정 수정 */
  const [recurringEditMode, setRecurringEditMode] = useState<boolean | null>(null);
  /** 반복 일정 다이얼로그 모드 - 'edit': 수정, 'delete': 삭제 */
  const [recurringDialogMode, setRecurringDialogMode] = useState<'edit' | 'delete'>('edit');

  const { enqueueSnackbar } = useSnackbar();

  /**
   * 반복 일정 수정/삭제 확인 핸들러
   *
   * @param {boolean} editSingleOnly - true: 단일 일정만 처리, false: 모든 반복 일정 처리
   * @description
   * - edit 모드: 사용자가 선택한 수정 범위(단일/전체)를 저장하고 편집 폼으로 이동
   * - delete 모드: 사용자가 선택한 삭제 범위에 따라 반복 일정 삭제 처리
   */
  const handleRecurringConfirm = async (editSingleOnly: boolean) => {
    if (recurringDialogMode === 'edit' && pendingRecurringEdit) {
      // 편집 모드 저장하고 편집 폼으로 이동
      setRecurringEditMode(editSingleOnly);
      editEvent(pendingRecurringEdit);
      setIsRecurringDialogOpen(false);
      setPendingRecurringEdit(null);
    } else if (recurringDialogMode === 'delete' && pendingRecurringDelete) {
      // 반복 일정 삭제 처리
      try {
        await handleRecurringDelete(pendingRecurringDelete, editSingleOnly);
        enqueueSnackbar('일정이 삭제되었습니다', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      }
      setIsRecurringDialogOpen(false);
      setPendingRecurringDelete(null);
    }
  };

  /**
   * 반복 일정 여부 확인
   *
   * @param {Event} event - 확인할 일정 객체
   * @returns {boolean} 반복 일정이면 true, 아니면 false
   * @description
   * 일정의 repeat.type이 'none'이 아니고 repeat.interval이 0보다 크면 반복 일정으로 판단
   */
  const isRecurringEvent = (event: Event): boolean => {
    return event.repeat.type !== 'none' && event.repeat.interval > 0;
  };

  /**
   * 일정 수정 핸들러
   *
   * @param {Event} event - 수정할 일정 객체
   * @description
   * - 반복 일정: 수정 범위 선택 다이얼로그 표시 (단일/전체)
   * - 일반 일정: 바로 편집 폼으로 이동
   */
  const handleEditEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring edit dialog
      setPendingRecurringEdit(event);
      setRecurringDialogMode('edit');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event editing
      editEvent(event);
    }
  };

  /**
   * 일정 삭제 핸들러
   *
   * @param {Event} event - 삭제할 일정 객체
   * @description
   * - 반복 일정: 삭제 범위 선택 다이얼로그 표시 (단일/전체)
   * - 일반 일정: 바로 삭제 처리
   */
  const handleDeleteEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring delete dialog
      setPendingRecurringDelete(event);
      setRecurringDialogMode('delete');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event deletion
      deleteEvent(event.id);
    }
  };

  /**
   * 일정 겹침 확인 후 저장 처리
   *
   * @description
   * 일정 겹침 경고 다이얼로그에서 "계속 진행" 버튼 클릭 시 호출
   */
  const handleConfirmOverlap = async () => {
    setIsOverlapDialogOpen(false);

    await saveEvent({
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    });
  };

  /**
   * 캘린더 날짜 클릭 핸들러
   *
   * @param {Date} clickedDate - 클릭된 날짜
   * @description
   * 클릭된 날짜를 YYYY-MM-DD 형식으로 변환하여 일정 추가 폼에 자동 입력
   */
  const handleDateClick = (clickedDate: Date) => {
    // YYYY-MM-DD 형식으로 변환
    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
    const day = String(clickedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    setDate(dateString);
  };

  /**
   * 드래그 시작 핸들러
   *
   * @param {DragStartEvent} event - 드래그 시작 이벤트
   * @description
   * 드래그가 시작되면 해당 일정을 activeEvent에 저장하여 DragOverlay에서 표시합니다.
   */
  const handleDragStart = (event: DragStartEvent) => {
    const draggedEvent = events.find((e) => e.id === event.active.id);
    setActiveEvent(draggedEvent || null);
  };

  /**
   * 드래그 앤 드롭 종료 핸들러
   *
   * @param {DragEndEvent} event - 드래그 종료 이벤트
   * @description
   * 일정 카드를 다른 날짜로 드래그했을 때 일정의 날짜를 업데이트합니다.
   * active.id: 드래그된 일정 ID, over.id: 드롭된 날짜 문자열 (YYYY-MM-DD)
   *
   * @note
   * saveEvent() 대신 직접 PUT 요청을 사용합니다.
   * saveEvent()는 editing 상태에 따라 POST/PUT을 결정하는데,
   * 드래그 시점에는 editingEvent가 null이므로 항상 POST(생성)가 되어 일정이 복제되는 문제가 있습니다.
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // 드롭 영역이 없거나 같은 위치에 드롭한 경우 무시
    if (!over || active.id === over.id) {
      setActiveEvent(null);
      return;
    }

    try {
      // active.id는 일정 ID (string), over.id는 날짜 문자열 (YYYY-MM-DD)
      const eventId = active.id as string;
      const newDate = over.id as string;

      // 드래그된 일정 찾기
      const targetEvent = events.find((e) => e.id === eventId);
      if (!targetEvent) {
        console.error('일정을 찾을 수 없습니다:', eventId);
        setActiveEvent(null);
        return;
      }

      // 날짜가 변경되지 않은 경우 무시
      if (targetEvent.date === newDate) {
        setActiveEvent(null);
        return;
      }

      // 일정 날짜 업데이트 - 직접 PUT 요청
      const updatedEvent = {
        ...targetEvent,
        date: newDate,
      };

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      // 이벤트 목록 새로고침
      await fetchEvents();
      enqueueSnackbar('일정이 이동되었습니다', { variant: 'success' });
    } catch (error) {
      console.error('일정 이동 실패:', error);
      enqueueSnackbar('일정 이동에 실패했습니다', { variant: 'error' });
    } finally {
      // 성공/실패 여부와 관계없이 드래그 종료 시 activeEvent 초기화
      setActiveEvent(null);
    }
  };

  /**
   * 일정 추가 또는 수정 처리
   *
   * @description
   * 일정 생성/수정 시 실행되는 메인 핸들러
   *
   * 처리 흐름:
   * 1. 필수 입력값 검증 (제목, 날짜, 시작/종료 시간)
   * 2. 시간 유효성 검증
   * 3. 일정 겹침 검사
   * 4. 수정 모드인 경우:
   *    - 반복 일정: 수정 범위(단일/전체)에 따라 처리
   *    - 일반 일정: 바로 수정
   * 5. 생성 모드인 경우:
   *    - 반복 일정: 반복 규칙에 따라 여러 일정 생성
   *    - 일반 일정: 단일 일정 생성
   *
   * @throws {Error} 필수 정보 미입력 또는 시간 설정 오류 시 에러 메시지 표시
   */
  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: editingEvent
        ? editingEvent.repeat // Keep original repeat settings for recurring event detection
        : {
            type: isRepeating ? repeatType : 'none',
            interval: repeatInterval,
            endDate: repeatEndDate || undefined,
          },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    const hasOverlapEvent = overlapping.length > 0;

    // 수정
    if (editingEvent) {
      if (hasOverlapEvent) {
        setOverlappingEvents(overlapping);
        setIsOverlapDialogOpen(true);
        return;
      }

      if (
        editingEvent.repeat.type !== 'none' &&
        editingEvent.repeat.interval > 0 &&
        recurringEditMode !== null
      ) {
        await handleRecurringEdit(eventData as Event, recurringEditMode);
        setRecurringEditMode(null);
      } else {
        await saveEvent(eventData);
      }

      resetForm();
      return;
    }

    // 생성
    if (isRepeating) {
      // 반복 생성은 반복 일정을 고려하지 않는다.
      await createRepeatEvent(eventData);
      resetForm();
      return;
    }

    if (hasOverlapEvent) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return;
    }

    await saveEvent(eventData);
    resetForm();
  };

  // ============ 메인 UI 렌더링 ============
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
          {/* ========== 좌측: 일정 입력 폼 ========== */}
          <EventFormComponent
            isEditing={!!editingEvent}
            title={title}
            onTitleChange={setTitle}
            date={date}
            onDateChange={setDate}
            startTime={startTime}
            onStartTimeChange={handleStartTimeChange}
            endTime={endTime}
            onEndTimeChange={handleEndTimeChange}
            description={description}
            onDescriptionChange={setDescription}
            location={location}
            onLocationChange={setLocation}
            category={category}
            onCategoryChange={setCategory}
            isRepeating={isRepeating}
            onIsRepeatingChange={setIsRepeating}
            repeatType={repeatType}
            onRepeatTypeChange={setRepeatType}
            repeatInterval={repeatInterval}
            onRepeatIntervalChange={setRepeatInterval}
            repeatEndDate={repeatEndDate}
            onRepeatEndDateChange={setRepeatEndDate}
            notificationTime={notificationTime}
            onNotificationTimeChange={setNotificationTime}
            startTimeError={startTimeError}
            endTimeError={endTimeError}
            onSubmit={addOrUpdateEvent}
          />

          {/* ========== 중앙: 캘린더 뷰 ========== */}
          <CalendarView
            view={view}
            onViewChange={setView}
            currentDate={currentDate}
            onNavigate={navigate}
            events={filteredEvents}
            notifiedEventIds={notifiedEvents}
            holidays={holidays}
            onDateClick={handleDateClick}
          />

          {/* ========== 우측: 일정 검색 및 목록 ========== */}
          <EventList
            events={filteredEvents}
            notifiedEventIds={notifiedEvents}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </Stack>

        {/* ========== 일정 겹침 경고 다이얼로그 ========== */}
        <OverlapDialog
          open={isOverlapDialogOpen}
          onClose={() => setIsOverlapDialogOpen(false)}
          overlappingEvents={overlappingEvents}
          onConfirm={handleConfirmOverlap}
        />

        {/* ========== 반복 일정 수정/삭제 확인 다이얼로그 ========== */}
      <RecurringEventDialog
        open={isRecurringDialogOpen}
        onClose={() => {
          setIsRecurringDialogOpen(false);
          setPendingRecurringEdit(null);
          setPendingRecurringDelete(null);
        }}
        onConfirm={handleRecurringConfirm}
        event={recurringDialogMode === 'edit' ? pendingRecurringEdit : pendingRecurringDelete}
        mode={recurringDialogMode}
      />

        {/* ========== 알림 토스트 영역 (화면 우측 상단 고정) ========== */}
        <NotificationToast
          notifications={notifications}
          onClose={(index) => setNotifications((prev) => prev.filter((_, i) => i !== index))}
        />
      </Box>

      {/* ========== 드래그 오버레이 (드래그 중 표시) ========== */}
      <DragOverlay dropAnimation={null}>
        {activeEvent ? (
          <Box
            sx={{
              ...EVENT_BOX_STYLES.common,
              ...EVENT_BOX_STYLES.normal,
              cursor: 'grabbing',
              opacity: 0.8,
              boxShadow: 3,
            }}
            >
            <Stack direction="row" spacing={1} alignItems="center">
              {/* 반복 일정 아이콘 */}
              {activeEvent.repeat.type !== 'none' && <Repeat fontSize="small" />}

              <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                {activeEvent.title}
              </Typography>
        </Stack>
    </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
