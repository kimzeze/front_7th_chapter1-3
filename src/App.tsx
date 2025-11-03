import { Close } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { CalendarView } from './components/calendar';
import EventItem from './components/event/EventItem';
import EventSearchInput from './components/event/EventSearchInput';
import RecurringEventDialog from './components/RecurringEventDialog.tsx';
import { CATEGORIES, NOTIFICATION_OPTIONS } from './constants';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useRecurringEventOperations } from './hooks/useRecurringEventOperations.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm, RepeatType } from './types.ts';
import { findOverlappingEvents } from './utils/eventOverlap.ts';
import { getTimeErrorMessage } from './utils/timeValidation.ts';

function App() {
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
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        {/* ========== 좌측: 일정 입력 폼 ========== */}
        <Stack spacing={2} sx={{ width: '20%' }}>
          <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

          {/* 제목 입력 */}
          <FormControl fullWidth>
            <FormLabel htmlFor="title">제목</FormLabel>
            <TextField
              id="title"
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>

          {/* 날짜 입력 */}
          <FormControl fullWidth>
            <FormLabel htmlFor="date">날짜</FormLabel>
            <TextField
              id="date"
              size="small"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormControl>

          {/* 시작/종료 시간 입력 */}
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <FormLabel htmlFor="start-time">시작 시간</FormLabel>
              <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
                <TextField
                  id="start-time"
                  size="small"
                  type="time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  onBlur={() => getTimeErrorMessage(startTime, endTime)}
                  error={!!startTimeError}
                />
              </Tooltip>
            </FormControl>
            <FormControl fullWidth>
              <FormLabel htmlFor="end-time">종료 시간</FormLabel>
              <Tooltip title={endTimeError || ''} open={!!endTimeError} placement="top">
                <TextField
                  id="end-time"
                  size="small"
                  type="time"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  onBlur={() => getTimeErrorMessage(startTime, endTime)}
                  error={!!endTimeError}
                />
              </Tooltip>
            </FormControl>
          </Stack>

          {/* 설명 입력 */}
          <FormControl fullWidth>
            <FormLabel htmlFor="description">설명</FormLabel>
            <TextField
              id="description"
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>

          {/* 위치 입력 */}
          <FormControl fullWidth>
            <FormLabel htmlFor="location">위치</FormLabel>
            <TextField
              id="location"
              size="small"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </FormControl>

          {/* 카테고리 선택 */}
          <FormControl fullWidth>
            <FormLabel id="category-label">카테고리</FormLabel>
            <Select
              id="category"
              size="small"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-labelledby="category-label"
              aria-label="카테고리"
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat} aria-label={`${cat}-option`}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 반복 일정 체크박스 (생성 시에만 표시) */}
          {!editingEvent && (
            <FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isRepeating}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsRepeating(checked);
                      if (checked) {
                        setRepeatType('daily');
                      } else {
                        setRepeatType('none');
                      }
                    }}
                  />
                }
                label="반복 일정"
              />
            </FormControl>
          )}

          {/* 반복 일정 설정 (생성 시에만 표시) */}
          {isRepeating && !editingEvent && (
            <Stack spacing={2}>
              <FormControl fullWidth>
                <FormLabel>반복 유형</FormLabel>
                <Select
                  size="small"
                  value={repeatType}
                  aria-label="반복 유형"
                  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                >
                  <MenuItem value="daily" aria-label="daily-option">
                    매일
                  </MenuItem>
                  <MenuItem value="weekly" aria-label="weekly-option">
                    매주
                  </MenuItem>
                  <MenuItem value="monthly" aria-label="monthly-option">
                    매월
                  </MenuItem>
                  <MenuItem value="yearly" aria-label="yearly-option">
                    매년
                  </MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="repeat-interval">반복 간격</FormLabel>
                  <TextField
                    id="repeat-interval"
                    size="small"
                    type="number"
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <FormLabel htmlFor="repeat-end-date">반복 종료일</FormLabel>
                  <TextField
                    id="repeat-end-date"
                    size="small"
                    type="date"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                  />
                </FormControl>
              </Stack>
            </Stack>
          )}

          {/* 알림 시간 선택 */}
          <FormControl fullWidth>
            <FormLabel htmlFor="notification">알림 설정</FormLabel>
            <Select
              id="notification"
              size="small"
              value={notificationTime}
              onChange={(e) => setNotificationTime(Number(e.target.value))}
            >
              {NOTIFICATION_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 일정 추가/수정 제출 버튼 */}
          <Button
            data-testid="event-submit-button"
            onClick={addOrUpdateEvent}
            variant="contained"
            color="primary"
          >
            {editingEvent ? '일정 수정' : '일정 추가'}
          </Button>
        </Stack>

        {/* ========== 중앙: 캘린더 뷰 ========== */}
        <CalendarView
          view={view}
          onViewChange={setView}
          currentDate={currentDate}
          onNavigate={navigate}
          events={filteredEvents}
          notifiedEventIds={notifiedEvents}
          holidays={holidays}
        />

        {/* ========== 우측: 일정 검색 및 목록 ========== */}
        <Stack
          data-testid="event-list"
          spacing={2}
          sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
        >
          {/* 일정 검색 입력 */}
          <EventSearchInput value={searchTerm} onChange={setSearchTerm} />

          {/* 일정 목록 또는 빈 상태 */}
          {filteredEvents.length === 0 ? (
            <Typography>검색 결과가 없습니다.</Typography>
          ) : (
            filteredEvents.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                isNotified={notifiedEvents.includes(event.id)}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            ))
          )}
        </Stack>
      </Stack>

      {/* ========== 일정 겹침 경고 다이얼로그 ========== */}
      <Dialog open={isOverlapDialogOpen} onClose={() => setIsOverlapDialogOpen(false)}>
        <DialogTitle>일정 겹침 경고</DialogTitle>
        <DialogContent>
          <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
          {overlappingEvents.map((event) => (
            <Typography key={event.id} sx={{ ml: 1, mb: 1 }}>
              {event.title} ({event.date} {event.startTime}-{event.endTime})
            </Typography>
          ))}
          <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOverlapDialogOpen(false)}>취소</Button>
          <Button
            color="error"
            onClick={() => {
              setIsOverlapDialogOpen(false);
              saveEvent({
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
            }}
          >
            계속 진행
          </Button>
        </DialogActions>
      </Dialog>

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
      {notifications.length > 0 && (
        <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
          {notifications.map((notification, index) => (
            <Alert
              key={index}
              severity="info"
              sx={{ width: 'auto' }}
              action={
                <IconButton
                  size="small"
                  onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Close />
                </IconButton>
              }
            >
              <AlertTitle>{notification.message}</AlertTitle>
            </Alert>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default App;
