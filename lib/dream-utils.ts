/**
 * 꿈해석 및 로또 번호 생성 유틸리티 함수
 */

/**
 * 출생년도로 띠 계산 (12지지)
 * @param year 출생년도
 * @returns 띠 번호 (1-12)
 */
export const getZodiacNumber = (year: number): number => {
  // 12지지: 쥐(1), 소(2), 호랑이(3), 토끼(4), 용(5), 뱀(6), 말(7), 양(8), 원숭이(9), 닭(10), 개(11), 돼지(12)
  const zodiacIndex = ((year - 4) % 12) + 1;
  return zodiacIndex;
};

/**
 * 출생년도 숫자 분해
 * @param year 출생년도
 * @returns 연도 합, 끝 두 자리
 */
export const decomposeYear = (year: number): { sum: number; lastTwoDigits: number } => {
  const yearStr = year.toString();
  const sum = yearStr.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  const lastTwoDigits = parseInt(yearStr.slice(-2), 10);
  return { sum, lastTwoDigits };
};

/**
 * 꿈 상징을 숫자로 매핑
 * @param dreamText 꿈 텍스트
 * @returns 상징 숫자 배열
 */
export const mapDreamSymbolsToNumbers = (dreamText: string): number[] => {
  const symbols: number[] = [];
  const text = dreamText.toLowerCase();

  // 물 관련 상징
  if (text.includes('물') || text.includes('바다') || text.includes('강') || text.includes('비') || text.includes('우물')) {
    symbols.push(1, 6);
  }

  // 불 관련 상징
  if (text.includes('불') || text.includes('화재') || text.includes('태양') || text.includes('빛')) {
    symbols.push(9);
  }

  // 하늘/비행 관련 상징
  if (text.includes('하늘') || text.includes('비행') || text.includes('날다') || text.includes('새')) {
    symbols.push(7);
  }

  // 떨어짐 관련 상징
  if (text.includes('떨어') || text.includes('추락') || text.includes('넘어')) {
    symbols.push(4);
  }

  // 집 관련 상징
  if (text.includes('집') || text.includes('집안') || text.includes('방')) {
    symbols.push(8);
  }

  // 돈 관련 상징
  if (text.includes('돈') || text.includes('금') || text.includes('보물') || text.includes('옥')) {
    symbols.push(8);
  }

  // 죽음 관련 상징
  if (text.includes('죽') || text.includes('장례') || text.includes('무덤')) {
    symbols.push(10);
  }

  // 길 관련 상징
  if (text.includes('길') || text.includes('도로') || text.includes('이동')) {
    symbols.push(3);
  }

  // 동물 관련 상징 (띠 숫자 사용)
  const animals = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  animals.forEach((animal, index) => {
    if (text.includes(animal)) {
      symbols.push(index + 1);
    }
  });

  // 중복 제거
  return Array.from(new Set(symbols));
};

/**
 * 숫자를 1-45 범위로 조정
 */
const adjustToRange = (num: number): number => {
  if (num < 1) return ((num % 45) + 45) % 45 + 1;
  if (num > 45) return ((num - 1) % 45) + 1;
  return num;
};

/**
 * 생년월일에서 월, 일 추출
 */
const extractMonthDay = (birthMonthDay?: string): { month: number; day: number } => {
  if (!birthMonthDay) return { month: 1, day: 1 };
  try {
    const date = new Date(birthMonthDay);
    return { month: date.getMonth() + 1, day: date.getDate() };
  } catch {
    return { month: 1, day: 1 };
  }
};

/**
 * 출생시각에서 시, 분 추출
 */
const extractTime = (birthTime?: string): { hour: number; minute: number } => {
  if (!birthTime) return { hour: 12, minute: 0 };
  try {
    const [hour, minute] = birthTime.split(':').map(Number);
    return { hour: hour || 12, minute: minute || 0 };
  } catch {
    return { hour: 12, minute: 0 };
  }
};

/**
 * 로또 번호 생성 (prd.md 규칙 기반, 생년월일/일시 반영)
 * @param birthYear 출생년도
 * @param dreamText 꿈 텍스트
 * @param aiDreamNumbers AI가 추출한 꿈 숫자 배열 (선택)
 * @param birthMonthDay 출생월일 (YYYY-MM-DD 형식, 선택)
 * @param birthTime 출생시각 (HH:mm 형식, 선택)
 * @returns 로또 번호 6개 (오름차순 정렬)
 */
export const generateLottoNumbers = (
  birthYear: number,
  dreamText: string,
  aiDreamNumbers?: number[],
  birthMonthDay?: string,
  birthTime?: string
): { numbers: number[]; explanations: string[] } => {
  const zodiacNumber = getZodiacNumber(birthYear);
  const { sum, lastTwoDigits } = decomposeYear(birthYear);
  const { month, day } = extractMonthDay(birthMonthDay);
  const { hour, minute } = extractTime(birthTime);
  
  // AI가 추출한 숫자가 있으면 우선 사용, 없으면 기존 로직 사용
  const dreamSymbols = aiDreamNumbers && aiDreamNumbers.length > 0 
    ? aiDreamNumbers.filter(n => n >= 1 && n <= 45)
    : mapDreamSymbolsToNumbers(dreamText);

  const numbers: number[] = [];
  const explanations: string[] = [];

  // 1. 띠 숫자 (1-12) → 더 넓은 범위로 변환
  // 띠 숫자 × 3 + 출생월로 분산
  const zodiacBased = adjustToRange(zodiacNumber * 3 + month);
  numbers.push(zodiacBased);
  explanations.push(`띠 숫자 × 3 + 월 (${zodiacNumber} × 3 + ${month} = ${zodiacBased})`);

  // 2. 출생년도 합 → 곱셈으로 분산
  // (출생년도 합 × 2) + 일
  const yearSumBased = adjustToRange(sum * 2 + day);
  numbers.push(yearSumBased);
  explanations.push(`출생년도 합 × 2 + 일 (${sum} × 2 + ${day} = ${yearSumBased})`);

  // 3. 출생년도 끝 두 자리 활용 → 제곱으로 분산
  // (끝 두 자리 × 월) % 45 + 1
  const lastTwoBased = adjustToRange((lastTwoDigits * month) % 45 + 1);
  numbers.push(lastTwoBased);
  explanations.push(`출생년도 끝 두 자리 × 월 (${lastTwoDigits} × ${month} = ${lastTwoBased})`);

  // 4. 생년월일 조합 → 곱셈과 나머지 연산
  // (년도 합 × 월 × 일) % 45 + 1
  const dateCombined = adjustToRange((sum * month * day) % 45 + 1);
  numbers.push(dateCombined);
  explanations.push(`생년월일 조합 (${sum} × ${month} × ${day} = ${dateCombined})`);

  // 5. 출생시각 활용 → 시간 정보 반영
  // (시 × 2 + 분) % 45 + 1
  const timeBased = adjustToRange((hour * 2 + minute) % 45 + 1);
  numbers.push(timeBased);
  explanations.push(`출생시각 (${hour}시 × 2 + ${minute}분 = ${timeBased})`);

  // 6. 꿈 상징 숫자 (AI 추출 우선) → 여러 개 사용
  if (dreamSymbols.length > 0) {
    // 첫 번째 꿈 숫자
    const symbol1 = adjustToRange(dreamSymbols[0]);
    numbers.push(symbol1);
    const symbol1Name = aiDreamNumbers && aiDreamNumbers.length > 0 
      ? 'AI 분석 숫자' 
      : getSymbolName(symbol1);
    explanations.push(`꿈 상징 숫자 1 (${symbol1Name})`);
  } else {
    // 꿈 숫자가 없으면 생년월일과 시각 조합
    const fallback = adjustToRange((month * day + hour) % 45 + 1);
    numbers.push(fallback);
    explanations.push(`생년월일+시각 조합 (${month} × ${day} + ${hour} = ${fallback})`);
  }

  // 7. 추가 꿈 상징 숫자 또는 조정 숫자
  if (dreamSymbols.length > 1) {
    const symbol2 = adjustToRange(dreamSymbols[1]);
    numbers.push(symbol2);
    const symbol2Name = (aiDreamNumbers && aiDreamNumbers.length > 1) 
      ? 'AI 분석 숫자' 
      : getSymbolName(symbol2);
    explanations.push(`꿈 상징 숫자 2 (${symbol2Name})`);
  } else if (dreamSymbols.length > 0 && dreamSymbols[0]) {
    // 꿈 숫자 1개만 있으면 변형하여 사용
    const symbol2 = adjustToRange((dreamSymbols[0] * 2 + minute) % 45 + 1);
    numbers.push(symbol2);
    explanations.push(`꿈 상징 숫자 변형 (${dreamSymbols[0]} × 2 + ${minute}분 = ${symbol2})`);
  } else {
    // 조정 숫자 (기존 숫자들의 차이값 활용)
    const existingSum = numbers.reduce((a, b) => a + b, 0);
    const diff = Math.abs(numbers[0] - numbers[numbers.length - 1]) || 1;
    const adjusted = adjustToRange((existingSum % diff) + diff || 23);
    numbers.push(adjusted);
    explanations.push(`조정 숫자 (차이값 기반: ${adjusted})`);
  }

  // 6개만 선택 (중복 제거 및 범위 보정)
  const uniqueNumbers: number[] = [];
  const uniqueExplanations: string[] = [];
  const usedNumbers = new Set<number>();

  // 숫자들을 순회하며 중복 제거
  numbers.forEach((num, index) => {
    let finalNum = adjustToRange(num);

    // 중복 처리 - 중복이면 다음 숫자로
    if (usedNumbers.has(finalNum)) {
      // 중복 시 다양한 방법으로 변형 시도
      let attempts = 0;
      while (usedNumbers.has(finalNum) && attempts < 45 && uniqueNumbers.length < 6) {
        finalNum = adjustToRange((finalNum + attempts * 7 + 1) % 45 + 1);
        attempts++;
      }
    }

    if (!usedNumbers.has(finalNum) && uniqueNumbers.length < 6) {
      uniqueNumbers.push(finalNum);
      uniqueExplanations.push(explanations[index]);
      usedNumbers.add(finalNum);
    }
  });

  // 6개가 안 되면 보정 (넓은 범위에서 선택)
  while (uniqueNumbers.length < 6) {
    // 기존 숫자들의 평균과 분산을 활용하여 새로운 숫자 생성
    const existingSum = uniqueNumbers.reduce((a, b) => a + b, 0);
    const existingAvg = Math.floor(existingSum / uniqueNumbers.length) || 23;
    
    // 다양한 범위에서 숫자 선택 시도
    let newNum = adjustToRange((existingAvg * 2 + uniqueNumbers.length * 5) % 45 + 1);
    let attempts = 0;
    
    while (usedNumbers.has(newNum) && attempts < 45) {
      newNum = adjustToRange((newNum + 11) % 45 + 1);
      attempts++;
    }
    
    if (!usedNumbers.has(newNum)) {
      uniqueNumbers.push(newNum);
      uniqueExplanations.push('보정 숫자');
      usedNumbers.add(newNum);
    } else {
      break;
    }
  }

  // 오름차순 정렬
  const sorted = uniqueNumbers.sort((a, b) => a - b);

  return {
    numbers: sorted,
    explanations: uniqueExplanations,
  };
};

/**
 * 띠 이름 반환
 */
const getZodiacName = (number: number): string => {
  const names = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  return names[(number - 1) % 12] || '알 수 없음';
};

/**
 * 상징 이름 반환
 */
const getSymbolName = (number: number): string => {
  const symbolMap: Record<number, string> = {
    1: '물',
    3: '길',
    4: '떨어짐',
    6: '물',
    7: '하늘/비행',
    8: '집/돈',
    9: '불',
    10: '죽음',
  };
  return symbolMap[number] || `상징 ${number}`;
};

