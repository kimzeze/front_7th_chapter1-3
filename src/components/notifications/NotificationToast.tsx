import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';

interface Notification {
  message: string;
}

interface NotificationToastProps {
  /** 알림 목록 */
  notifications: Notification[];
  /** 알림 닫기 핸들러 */
  onClose: (index: number) => void;
}

/**
 * 화면 우측 상단 고정 알림 토스트
 *
 * @description
 * - 화면 우측 상단에 고정된 위치에 알림 표시
 * - 여러 알림을 세로로 나열하여 표시
 * - 각 알림마다 닫기 버튼 제공
 * - 알림이 없으면 아무것도 렌더링하지 않음
 *
 * @example
 * ```tsx
 * <NotificationToast
 *   notifications={notifications}
 *   onClose={(index) => setNotifications(prev => prev.filter((_, i) => i !== index))}
 * />
 * ```
 */
export default function NotificationToast({ notifications, onClose }: NotificationToastProps) {
  if (notifications.length === 0) return null;

  return (
    <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
      {notifications.map((notification, index) => (
        <Alert
          key={index}
          severity="info"
          sx={{ width: 'auto' }}
          action={
            <IconButton size="small" onClick={() => onClose(index)}>
              <Close />
            </IconButton>
          }
        >
          <AlertTitle>{notification.message}</AlertTitle>
        </Alert>
      ))}
    </Stack>
  );
}

