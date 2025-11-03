import { SxProps, Theme } from '@mui/material';

/**
 * 일정 박스 스타일 상수
 * @property {Object} notified - 알림이 발생한 일정의 스타일 (빨간색 강조)
 * @property {Object} normal - 일반 일정의 스타일 (회색 배경)
 * @property {Object} common - 모든 일정 박스에 공통으로 적용되는 스타일
 */
export const EVENT_BOX_STYLES = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  },
} as const satisfies Record<string, SxProps<Theme>>;
