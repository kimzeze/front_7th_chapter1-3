import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

import { Event } from '../../types';

interface OverlapDialogProps {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 겹치는 일정 목록 */
  overlappingEvents: Event[];
  /** 계속 진행 핸들러 */
  onConfirm: () => void;
}

/**
 * 일정 겹침 경고 다이얼로그
 *
 * @description
 * - 새로운 일정이 기존 일정과 겹칠 때 표시
 * - 겹치는 일정 목록을 보여줌
 * - 사용자가 계속 진행할지 취소할지 선택 가능
 *
 * @example
 * ```tsx
 * <OverlapDialog
 *   open={isOverlapDialogOpen}
 *   onClose={() => setIsOverlapDialogOpen(false)}
 *   overlappingEvents={overlappingEvents}
 *   onConfirm={handleConfirmOverlap}
 * />
 * ```
 */
export default function OverlapDialog({
  open,
  onClose,
  overlappingEvents,
  onConfirm,
}: OverlapDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
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
        <Button onClick={onClose}>취소</Button>
        <Button color="error" onClick={onConfirm}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
}
