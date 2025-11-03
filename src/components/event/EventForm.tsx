import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChangeEvent } from 'react';

import { CATEGORIES, NOTIFICATION_OPTIONS } from '../../constants';
import { RepeatType } from '../../types';
import { getTimeErrorMessage } from '../../utils/timeValidation';

interface EventFormProps {
  /** 수정 중인 일정 여부 (null이면 추가 모드) */
  isEditing: boolean;
  /** 제목 */
  title: string;
  /** 제목 변경 핸들러 */
  onTitleChange: (value: string) => void;
  /** 날짜 */
  date: string;
  /** 날짜 변경 핸들러 */
  onDateChange: (value: string) => void;
  /** 시작 시간 */
  startTime: string;
  /** 시작 시간 변경 핸들러 */
  onStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** 종료 시간 */
  endTime: string;
  /** 종료 시간 변경 핸들러 */
  onEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** 설명 */
  description: string;
  /** 설명 변경 핸들러 */
  onDescriptionChange: (value: string) => void;
  /** 위치 */
  location: string;
  /** 위치 변경 핸들러 */
  onLocationChange: (value: string) => void;
  /** 카테고리 */
  category: string;
  /** 카테고리 변경 핸들러 */
  onCategoryChange: (value: string) => void;
  /** 반복 일정 여부 */
  isRepeating: boolean;
  /** 반복 일정 변경 핸들러 */
  onIsRepeatingChange: (value: boolean) => void;
  /** 반복 유형 */
  repeatType: RepeatType;
  /** 반복 유형 변경 핸들러 */
  onRepeatTypeChange: (value: RepeatType) => void;
  /** 반복 간격 */
  repeatInterval: number;
  /** 반복 간격 변경 핸들러 */
  onRepeatIntervalChange: (value: number) => void;
  /** 반복 종료일 */
  repeatEndDate: string;
  /** 반복 종료일 변경 핸들러 */
  onRepeatEndDateChange: (value: string) => void;
  /** 알림 시간 */
  notificationTime: number;
  /** 알림 시간 변경 핸들러 */
  onNotificationTimeChange: (value: number) => void;
  /** 시작 시간 에러 메시지 */
  startTimeError: string | null;
  /** 종료 시간 에러 메시지 */
  endTimeError: string | null;
  /** 폼 제출 핸들러 */
  onSubmit: () => void;
}

/**
 * 일정 추가/수정 폼
 *
 * @description
 * - 일정의 모든 정보를 입력받는 폼
 * - 추가 모드: 모든 필드 입력 가능, 반복 일정 설정 가능
 * - 수정 모드: 반복 일정 설정 숨김
 * - 시간 유효성 검증 (시작 시간 < 종료 시간)
 * - 카테고리, 알림 시간 선택
 *
 * @example
 * ```tsx
 * <EventForm
 *   isEditing={!!editingEvent}
 *   title={title}
 *   onTitleChange={setTitle}
 *   // ... other props
 *   onSubmit={addOrUpdateEvent}
 * />
 * ```
 */
export default function EventForm({
  isEditing,
  title,
  onTitleChange,
  date,
  onDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  description,
  onDescriptionChange,
  location,
  onLocationChange,
  category,
  onCategoryChange,
  isRepeating,
  onIsRepeatingChange,
  repeatType,
  onRepeatTypeChange,
  repeatInterval,
  onRepeatIntervalChange,
  repeatEndDate,
  onRepeatEndDateChange,
  notificationTime,
  onNotificationTimeChange,
  startTimeError,
  endTimeError,
  onSubmit,
}: EventFormProps) {
  return (
    <Stack spacing={2} sx={{ width: '20%' }}>
      <Typography variant="h4">{isEditing ? '일정 수정' : '일정 추가'}</Typography>

      {/* 제목 입력 */}
      <FormControl fullWidth>
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField
          id="title"
          size="small"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
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
          onChange={(e) => onDateChange(e.target.value)}
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
              onChange={onStartTimeChange}
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
              onChange={onEndTimeChange}
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
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </FormControl>

      {/* 위치 입력 */}
      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </FormControl>

      {/* 카테고리 선택 */}
      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          size="small"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
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
      {!isEditing && (
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={isRepeating}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onIsRepeatingChange(checked);
                  if (checked) {
                    onRepeatTypeChange('daily');
                  } else {
                    onRepeatTypeChange('none');
                  }
                }}
              />
            }
            label="반복 일정"
          />
        </FormControl>
      )}

      {/* 반복 일정 설정 (생성 시에만 표시) */}
      {isRepeating && !isEditing && (
        <Stack spacing={2}>
          <FormControl fullWidth>
            <FormLabel>반복 유형</FormLabel>
            <Select
              size="small"
              value={repeatType}
              aria-label="반복 유형"
              onChange={(e) => onRepeatTypeChange(e.target.value as RepeatType)}
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
                onChange={(e) => onRepeatIntervalChange(Number(e.target.value))}
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
                onChange={(e) => onRepeatEndDateChange(e.target.value)}
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
          onChange={(e) => onNotificationTimeChange(Number(e.target.value))}
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
        onClick={onSubmit}
        variant="contained"
        color="primary"
      >
        {isEditing ? '일정 수정' : '일정 추가'}
      </Button>
    </Stack>
  );
}
