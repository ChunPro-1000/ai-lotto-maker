/**
 * 꿈해석 API Route
 * Gemini API를 사용하여 꿈을 분석하고 로또 번호를 생성합니다.
 * ai-sdk/google 모듈과 gemini-2.5-flash 모델 사용
 */

import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { DreamAnalysisRequest, DreamAnalysisResponse, ClassificationItem } from '@/types/dream-types';
import { generateLottoNumbers, getZodiacNumber } from '@/lib/dream-utils';

/**
 * 꿈해석 결과 스키마 정의
 */
const analysisSchema = z.object({
  classifications: z.array(
    z.object({
      category: z.string().describe('분류 카테고리명 (예: 오행 - 수, 음양 - 양 등)'),
      confidence: z.number().min(0).max(100).describe('신뢰도 (0-100%)'),
      reason: z.string().max(100).describe('분석 이유 (50자 이내)'),
    })
  ).min(1).describe('동양사상 기반 분류 항목들'),
  story: z.string().min(50).max(500).describe('동양 판타지 소설 형식으로 재구성한 꿈 이야기 (300자 이내)'),
  dreamNumbers: z.array(
    z.number().min(1).max(45)
  ).min(2).max(5).describe('꿈에서 추출한 상징 숫자들 (1-45 범위, 2-5개)'),
});

/**
 * POST 요청 처리: 꿈해석 및 로또 번호 생성
 */
export async function POST(request: NextRequest) {
  try {
    // API 키 확인 - GOOGLE_GENERATIVE_AI_API_KEY 환경 변수 사용
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey || apiKey.trim() === '') {
      console.error('API 키 확인:', {
        hasKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        keyLength: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        // 호환성을 위해 다른 환경 변수도 확인
        hasGeminiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
      });
      
      return NextResponse.json<DreamAnalysisResponse>(
        {
          success: false,
          error: 'API 키가 설정되지 않았습니다.\n\n다음 사항을 확인해주세요:\n1. .env.local 파일에 GOOGLE_GENERATIVE_AI_API_KEY=your_api_key 형식으로 입력되어 있는지\n2. 따옴표나 공백 없이 입력되어 있는지\n3. Next.js 개발 서버를 재시작했는지\n\nAPI 키는 https://aistudio.google.com/app/apikey 에서 발급받을 수 있습니다.',
        },
        { status: 500 }
      );
    }

    // 요청 본문 파싱
    const body: DreamAnalysisRequest = await request.json();
    const { dreamText, birthYear, birthMonthDay, birthTime, gender } = body;

    // 입력 검증
    if (!dreamText || dreamText.trim().length < 30) {
      return NextResponse.json<DreamAnalysisResponse>(
        {
          success: false,
          error: '꿈 내용은 최소 30자 이상 입력해주세요.',
        },
        { status: 400 }
      );
    }

    if (dreamText.length > 2000) {
      return NextResponse.json<DreamAnalysisResponse>(
        {
          success: false,
          error: '꿈 내용은 2000자 이하로 입력해주세요.',
        },
        { status: 400 }
      );
    }

    if (!birthYear || birthYear < 1900 || birthYear > new Date().getFullYear()) {
      return NextResponse.json<DreamAnalysisResponse>(
        {
          success: false,
          error: '올바른 출생년도를 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 띠 계산
    const zodiacNumber = getZodiacNumber(birthYear);
    const zodiacNames = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
    const zodiacName = zodiacNames[(zodiacNumber - 1) % 12];

    // Gemini API 모델 초기화
    // ai-sdk/google을 사용하여 gemini-2.5-flash 모델 설정
    // 환경 변수 GOOGLE_GENERATIVE_AI_API_KEY를 자동으로 사용
    const model = google('gemini-2.5-flash');

    // 꿈해석 프롬프트 구성
    const analysisPrompt = `당신은 동양사상의 음양오행과 풍수지리설에 근거한 꿈해석 전문가입니다.

사용자의 꿈을 분석하여 다음 항목으로 분류하고, 각 항목에 대한 신뢰도를 백분율로 제공해주세요:

1. 오행 분류 (금, 목, 수, 화, 토)
2. 음양 분류 (음, 양)
3. 방위 분류 (동, 서, 남, 북, 중앙)
4. 색상 분류 (오방색: 청, 적, 황, 백, 흑)
5. 상징 분류 (동물, 자연물, 인공물 등)

각 분류 항목에 대해:
- 카테고리명 (예: "오행 - 수", "음양 - 양" 형식)
- 신뢰도 (0-100% 정수)
- 간단한 분석 이유 (50자 이내)

또한 이 꿈을 동양 판타지 소설 형식으로 300자 이내로 재구성해주세요. 권선징악적 교훈이 포함되어야 합니다.

**중요: 꿈에서 숫자 상징 추출**
꿈의 내용을 분석하여 동양사상과 수리상징에 기반한 숫자 2-5개를 추출해주세요 (1-45 범위).
다음 규칙을 참고하되, 꿈의 구체적인 내용에 맞게 다양하게 숫자를 추출해주세요:

기본 상징 매핑 (참고용):
- 물/바다/강/비/우물: 1, 6, 11, 16, 21, 26, 31, 36, 41
- 불/화재/태양/빛/열: 9, 14, 19, 24, 29, 34, 39, 44
- 하늘/비행/새/구름: 7, 12, 17, 22, 27, 32, 37, 42
- 떨어짐/추락/불안정: 4, 13, 18, 23, 28, 33, 38, 43
- 집/방/기반/축적: 8, 15, 20, 25, 30, 35, 40, 45
- 돈/금/보물/옥/재물: 8, 15, 20, 25, 30, 35, 40, 45
- 죽음/장례/재시작: 10, 19, 28, 37
- 길/도로/이동/진행: 3, 12, 21, 30, 39
- 동물 (띠 숫자 기반): 1-12 (쥐-돼지)
- 나무/식물/성장: 2, 11, 20, 29, 38
- 돌/산/단단함: 5, 14, 23, 32, 41
- 바람/공기/자유: 6, 15, 24, 33, 42
- 땅/흙/안정: 5, 14, 23, 32, 41
- 달/밤/은밀: 2, 11, 20, 29, 38
- 별/하늘/꿈: 7, 16, 25, 34, 43
- 꽃/아름다움: 3, 12, 21, 30, 39
- 과일/풍요: 4, 13, 22, 31, 40
- 무기/도구: 5, 14, 23, 32, 41
- 문/출입: 6, 15, 24, 33, 42
- 계단/상승: 7, 16, 25, 34, 43
- 다리/연결: 8, 17, 26, 35, 44
- 창문/시야: 9, 18, 27, 36, 45
- 거울/반영: 1, 10, 19, 28, 37
- 열쇠/해결: 2, 11, 20, 29, 38
- 촛불/희망: 3, 12, 21, 30, 39
- 우산/보호: 4, 13, 22, 31, 40
- 배/여행: 5, 14, 23, 32, 41
- 자동차/이동: 6, 15, 24, 33, 42
- 비행기/도약: 7, 16, 25, 34, 43
- 책/지식: 8, 17, 26, 35, 44
- 펜/표현: 9, 18, 27, 36, 45
- 시계/시간: 10, 19, 28, 37
- 반지/약속: 1, 11, 21, 31, 41
- 목걸이/장식: 2, 12, 22, 32, 42
- 신발/발걸음: 3, 13, 23, 33, 43
- 모자/보호: 4, 14, 24, 34, 44
- 가방/보관: 5, 15, 25, 35, 45

**꿈의 구체적인 내용을 분석하여 가장 적합한 숫자 2-5개를 선택해주세요.**
같은 꿈이라도 세부 내용이 다르면 다른 숫자를 추출해야 합니다.

사용자 정보:
- 출생년도: ${birthYear}년 (${zodiacName}띠)
${birthMonthDay ? `- 출생월일: ${birthMonthDay}` : ''}
${birthTime ? `- 출생시각: ${birthTime}` : ''}
${gender ? `- 성별: ${gender === 'male' ? '남성' : '여성'}` : ''}

꿈 내용:
${dreamText}`;

    // Gemini API 호출
    let analysisResult;
    try {
      const result = await generateObject({
        model,
        prompt: analysisPrompt,
        schema: analysisSchema,
        temperature: 0.7,
      });

      analysisResult = result.object;
      
      // 결과 검증
      if (!analysisResult || !analysisResult.classifications || analysisResult.classifications.length === 0) {
        throw new Error('AI 분석 결과가 올바르지 않습니다.');
      }
      
    } catch (apiError: any) {
      console.error('Gemini API 오류:', apiError);
      
      // 오류 타입별 처리
      if (apiError instanceof Error) {
        const errorMessage = apiError.message.toLowerCase();
        const errorString = JSON.stringify(apiError).toLowerCase();
        
        // 네트워크 오류
        if (
          errorMessage.includes('network') || 
          errorMessage.includes('fetch') || 
          errorMessage.includes('econnrefused') ||
          errorMessage.includes('timeout') ||
          errorString.includes('network')
        ) {
          return NextResponse.json<DreamAnalysisResponse>(
            {
              success: false,
              error: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 잠시 후 다시 시도해주세요.',
            },
            { status: 503 }
          );
        }
        
        // 인증 오류
        if (
          errorMessage.includes('api key') || 
          errorMessage.includes('authentication') || 
          errorMessage.includes('unauthorized') || 
          errorMessage.includes('invalid api key') ||
          errorMessage.includes('api_key') ||
          errorString.includes('401') ||
          errorString.includes('403')
        ) {
          return NextResponse.json<DreamAnalysisResponse>(
            {
              success: false,
              error: 'API 키가 유효하지 않습니다. .env.local 파일의 GOOGLE_GENERATIVE_AI_API_KEY를 확인해주세요.',
            },
            { status: 401 }
          );
        }
        
        // 할당량 오류
        if (
          errorMessage.includes('quota') || 
          errorMessage.includes('rate limit') || 
          errorMessage.includes('too many requests') ||
          errorString.includes('quota') ||
          errorString.includes('429')
        ) {
          return NextResponse.json<DreamAnalysisResponse>(
            {
              success: false,
              error: 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
            },
            { status: 429 }
          );
        }
        
        // 모델 오류
        if (
          errorMessage.includes('model') ||
          errorMessage.includes('not found') ||
          errorMessage.includes('invalid model')
        ) {
          return NextResponse.json<DreamAnalysisResponse>(
            {
              success: false,
              error: 'AI 모델을 찾을 수 없습니다. 모델명을 확인해주세요.',
            },
            { status: 500 }
          );
        }
      }

      // 기타 오류
      return NextResponse.json<DreamAnalysisResponse>(
        {
          success: false,
          error: `AI 분석 중 오류가 발생했습니다: ${apiError instanceof Error ? apiError.message : '알 수 없는 오류'}. 잠시 후 다시 시도해주세요.`,
        },
        { status: 500 }
      );
    }

    // 분류 항목 정규화
    const classifications: ClassificationItem[] = 
      analysisResult.classifications.map((item) => ({
        category: item.category || '분류 없음',
        confidence: Math.min(100, Math.max(0, Math.round(item.confidence || 0))),
        reason: item.reason || '분석 중',
      }));

    // 기본 분류가 없으면 추가
    if (classifications.length === 0) {
      classifications.push({
        category: '오행 - 수',
        confidence: 70,
        reason: '꿈 내용을 분석한 결과',
      });
    }

    // 스토리 추출
    const story = analysisResult.story || '꿈의 내용을 분석하여 신비로운 이야기로 재구성했습니다.';

    // AI가 추출한 꿈 숫자 사용 (없으면 기존 로직 사용)
    const aiDreamNumbers = analysisResult.dreamNumbers || [];
    
    // 로또 번호 생성 (AI 추출 숫자 우선 사용, 생년월일/일시 반영)
    const { numbers, explanations } = generateLottoNumbers(
      birthYear, 
      dreamText, 
      aiDreamNumbers,
      birthMonthDay,
      birthTime
    );

    // 응답 반환
    return NextResponse.json<DreamAnalysisResponse>({
      success: true,
      data: {
        classifications,
        story,
        lottoNumbers: numbers,
        numberExplanations: explanations,
      },
    });
    
  } catch (error) {
    console.error('꿈해석 API 오류:', error);
    
    return NextResponse.json<DreamAnalysisResponse>(
      {
        success: false,
        error: error instanceof Error 
          ? `오류가 발생했습니다: ${error.message}`
          : '알 수 없는 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
