/**
 * 꿈해석 관련 타입 정의
 */

/**
 * 꿈해석 요청 데이터
 */
export interface DreamAnalysisRequest {
  dreamText: string;
  birthYear: number;
  birthMonthDay?: string;
  birthTime?: string;
  gender?: string;
}

/**
 * 음양오행 분류 항목
 */
export interface ClassificationItem {
  category: string;
  confidence: number; // 0-100 백분율
  reason: string;
}

/**
 * 꿈해석 결과
 */
export interface DreamAnalysisResult {
  classifications: ClassificationItem[];
  story: string; // AI가 생성한 판타지 스토리
  lottoNumbers: number[]; // 생성된 로또 번호 6개
  numberExplanations: string[]; // 각 번호에 대한 설명
}

/**
 * API 응답 타입
 */
export interface DreamAnalysisResponse {
  success: boolean;
  data?: DreamAnalysisResult;
  error?: string;
}

