import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton, MenuItem, Select, Stack } from '@mui/material';

interface CalendarNavigationProps {
  /** 현재 뷰 타입 */
  view: 'week' | 'month';
  /** 뷰 타입 변경 핸들러 */
  onViewChange: (view: 'week' | 'month') => void;
  /** 이전 버튼 클릭 핸들러 */
  onPrevious: () => void;
  /** 다음 버튼 클릭 핸들러 */
  onNext: () => void;
}

/**
 * 캘린더 네비게이션 (이전/다음/뷰 선택)
 *
 * @description
 * - 이전/다음 버튼으로 날짜 이동
 * - 주간/월간 뷰 전환 드롭다운
 * - 간결한 네비게이션 UI 제공
 *
 * @example
 * ```tsx
 * <CalendarNavigation
 *   view={view}
 *   onViewChange={setView}
 *   onPrevious={() => navigate('prev')}
 *   onNext={() => navigate('next')}
 * />
 * ```
 */
export default function CalendarNavigation({
  view,
  onViewChange,
  onPrevious,
  onNext,
}: CalendarNavigationProps) {
  return (
    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
      <IconButton aria-label="Previous" onClick={onPrevious}>
        <ChevronLeft />
      </IconButton>

      <Select
        size="small"
        aria-label="뷰 타입 선택"
        value={view}
        onChange={(e) => onViewChange(e.target.value as 'week' | 'month')}
      >
        <MenuItem value="week" aria-label="week-option">
          Week
        </MenuItem>
        <MenuItem value="month" aria-label="month-option">
          Month
        </MenuItem>
      </Select>

      <IconButton aria-label="Next" onClick={onNext}>
        <ChevronRight />
      </IconButton>
    </Stack>
  );
}
