import { FormControl, FormLabel, TextField } from '@mui/material';

interface EventSearchInputProps {
  /** 검색어 */
  value: string;
  /** 검색어 변경 핸들러 */
  onChange: (value: string) => void;
}

/**
 * 일정 검색 입력 필드
 *
 * @description
 * - 일정을 검색하기 위한 텍스트 입력 필드
 * - 제목, 설명, 위치 등으로 일정 필터링
 * - FormControl로 레이블과 함께 표시
 *
 * @example
 * ```tsx
 * <EventSearchInput
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 * />
 * ```
 */
export default function EventSearchInput({ value, onChange }: EventSearchInputProps) {
  return (
    <FormControl fullWidth>
      <FormLabel htmlFor="search">일정 검색</FormLabel>
      <TextField
        id="search"
        size="small"
        placeholder="검색어를 입력하세요"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
}
