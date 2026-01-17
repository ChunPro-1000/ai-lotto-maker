"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Moon, Calendar, Clock, Send, Loader2, AlertCircle, Trophy, BookOpen, X, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DreamAnalysisResponse, DreamAnalysisResult } from "@/types/dream-types";

export default function Home() {
  const [dreamText, setDreamText] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DreamAnalysisResult | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("");

  // 예시 텍스트
  const dreamExampleText = "어둠속 우물에서 빛나는 뱀과 마주했는데 푸른 빛의 옥구슬을 받는 꿈을 꿨어";

  // 클라이언트에서만 마운트 확인 및 날짜 설정
  useEffect(() => {
    setIsMounted(true);
    setCurrentDate(
      new Date().toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      })
    );
  }, []);

  // 우주 별 위치 생성 (클라이언트에서만) - 성능 최적화
  const starPositions = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: 100 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1, // 1-3px
      duration: 1 + Math.random() * 3,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.5 + 0.3, // 0.3-0.8
    }));
  }, [isMounted]);

  // 행성 위치 생성 (클라이언트에서만) - 성능 최적화
  const planetPositions = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: 5 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 80 + 40, // 40-120px
      color: [
        'rgba(139, 69, 19, 0.3)', // 갈색 행성
        'rgba(255, 140, 0, 0.2)', // 주황 행성
        'rgba(0, 191, 255, 0.2)', // 파란 행성
        'rgba(147, 112, 219, 0.2)', // 보라 행성
        'rgba(255, 20, 147, 0.2)', // 분홍 행성
      ][Math.floor(Math.random() * 5)],
      duration: 20 + Math.random() * 30, // 20-50초
      delay: Math.random() * 5,
      x: (Math.random() - 0.5) * 200, // 이동 거리
      y: (Math.random() - 0.5) * 200,
    }));
  }, [isMounted]);

  // 헤더 별 위치 생성 (클라이언트에서만)
  const headerStarPositions = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: 15 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
  }, [isMounted]);

  /**
   * 월에 따른 일수 계산
   */
  const getDaysInMonth = (month: string): number => {
    if (!month) return 31;
    const monthNum = parseInt(month);
    if (monthNum === 2) return 29; // 윤년 고려하여 최대 29일
    if ([4, 6, 9, 11].includes(monthNum)) return 30;
    return 31;
  };

  /**
   * 꿈해석 API 호출
   */
  const handleSubmit = async () => {
    console.log("handleSubmit 호출됨", { isFormValid, dreamText: dreamText.length, birthYear });
    
    // 폼 검증 실패 시 사용자에게 피드백 제공
    if (!isFormValid) {
      if (!isDreamTextValid) {
        setError("꿈 내용을 최소 20자 이상 입력해주세요.");
      } else if (!isBirthYearValid) {
        setError("올바른 출생년도(4자리)를 입력해주세요.");
      } else {
        setError("입력 정보를 확인해주세요.");
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const year = parseInt(birthYear);
      
      if (!year || year < 1900 || year > new Date().getFullYear()) {
        setError("올바른 출생년도를 입력해주세요.");
        setIsLoading(false);
        return;
      }

      // 출생 시각 포맷팅 (HH:MM 형식)
      const formattedBirthTime = birthHour ? `${birthHour.padStart(2, '0')}:00` : undefined;
      
      // 출생월일 포맷팅 (YYYY-MM-DD 형식)
      let formattedBirthMonthDay: string | undefined = undefined;
      if (birthMonth && birthDay) {
        formattedBirthMonthDay = `${year}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
      }

      console.log("API 호출 시작", { dreamText: dreamText.trim().substring(0, 50), birthYear: year, birthMonthDay: formattedBirthMonthDay, birthTime: formattedBirthTime });

      const response = await fetch("/api/dream-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dreamText: dreamText.trim(),
          birthYear: year,
          birthMonthDay: formattedBirthMonthDay,
          birthTime: formattedBirthTime,
        }),
      });

      console.log("API 응답 상태:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `서버 오류 (${response.status})` }));
        setError(errorData.error || `서버 오류가 발생했습니다. (${response.status})`);
        setIsLoading(false);
        return;
      }

      const data: DreamAnalysisResponse = await response.json();
      console.log("API 응답 데이터:", data);

      if (!data.success) {
        setError(data.error || "분석 중 오류가 발생했습니다.");
        setIsLoading(false);
        return;
      }

      if (data.data) {
        setResult(data.data);
      } else {
        setError("결과 데이터를 받지 못했습니다.");
      }
    } catch (err) {
      console.error("꿈해석 오류:", err);
      if (err instanceof Error) {
        if (err.message.includes("fetch") || err.message.includes("network")) {
          setError("네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 잠시 후 다시 시도해주세요.");
        } else {
          setError(`오류가 발생했습니다: ${err.message}`);
        }
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 입력 검증
   */
  const isDreamTextValid = dreamText.trim().length >= 20 && dreamText.trim().length <= 2000;
  const isBirthYearValid = birthYear.length === 4 && /^\d{4}$/.test(birthYear) && 
    parseInt(birthYear) >= 1900 && parseInt(birthYear) <= new Date().getFullYear();
  const isFormValid = isDreamTextValid && isBirthYearValid && !isLoading;

  /**
   * 결과 초기화
   */
  const handleReset = () => {
    setResult(null);
    setError(null);
    setDreamText("");
    setBirthYear("");
    setBirthMonth("");
    setBirthDay("");
    setBirthHour("");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.17, 0.67, 0.83, 0.67] as const,
      },
    },
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 p-4">
      {/* 우주 배경 요소 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 우주 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 via-purple-950 to-slate-900" />
        
        {/* 별들 - 반짝이는 효과 */}
        {isMounted && starPositions.map((star, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: 'white',
              boxShadow: `0 0 ${star.size * 2}px white, 0 0 ${star.size * 4}px white`,
            }}
            animate={{
              opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* 행성들 - 천천히 움직이는 효과 */}
        {isMounted && planetPositions.map((planet, i) => (
          <motion.div
            key={`planet-${i}`}
            className="absolute rounded-full blur-xl"
            style={{
              left: `${planet.left}%`,
              top: `${planet.top}%`,
              width: `${planet.size}px`,
              height: `${planet.size}px`,
              backgroundColor: planet.color,
              boxShadow: `0 0 ${planet.size}px ${planet.color}`,
            }}
            animate={{
              x: [0, planet.x, 0],
              y: [0, planet.y, 0],
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: planet.duration,
              repeat: Infinity,
              delay: planet.delay,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* 은하수 효과 */}
        <motion.div
          className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scaleY: [1, 1.5, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* 별똥별 효과 (가끔 나타나는) */}
        {isMounted && Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`shooting-${i}`}
            className="absolute w-1 h-20 bg-gradient-to-b from-white to-transparent"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
              transform: 'rotate(45deg)',
            }}
            animate={{
              x: [0, 500],
              y: [0, 500],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 3,
              repeatDelay: 5,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="relative border-0 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 overflow-hidden rounded-3xl">
            {/* 카드 외곽 글로우 효과 - 보라색 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 via-purple-500/20 to-purple-400/20 rounded-3xl blur-xl opacity-60" />
            
            {/* 카드 내부 부드러운 그라데이션 */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-gray-800 dark:via-purple-900/20 dark:to-gray-800 pointer-events-none" />
            
            {/* 별 장식 패턴 */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
            
            <CardHeader className="relative overflow-hidden text-center pb-8 pt-8 bg-gradient-to-br from-purple-600 to-purple-500 rounded-t-3xl">
              {/* 헤더 배경 - 보라색 그라데이션 */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-600" />
              
              {/* 별 장식 */}
              <div className="absolute inset-0 opacity-20">
                {isMounted && headerStarPositions.map((star, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${star.left}%`,
                      top: `${star.top}%`,
                    }}
                    animate={{
                      opacity: [0.2, 0.6, 0.2],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: star.duration,
                      repeat: Infinity,
                      delay: star.delay,
                    }}
                  >
                    <Star className="h-3 w-3 text-white fill-white/40" />
                  </motion.div>
                ))}
              </div>
              
              {/* 헤더 하단 구분선 */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              
              <motion.div
                className="relative z-10"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* 날짜 표시 */}
                {isMounted && currentDate && (
                  <motion.p
                    className="text-white/90 text-sm mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentDate}
                  </motion.p>
                )}
                
                <motion.div
                  className="mb-6 flex justify-center"
                  animate={{
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="relative">
                    {/* 다층 글로우 효과 - 보라색 */}
                    <div className="absolute inset-0 bg-purple-400/40 blur-2xl rounded-full animate-pulse" />
                    <div className="absolute inset-0 bg-purple-300/30 blur-xl rounded-full" />
                    <Sparkles className="relative h-14 w-14 text-white drop-shadow-2xl" />
                  </div>
                </motion.div>
                
                <CardTitle className="relative z-10 text-2xl md:text-3xl lg:text-4xl font-black leading-tight tracking-tight mb-2">
                  <motion.div
                    className="flex flex-wrap justify-center items-center gap-1 md:gap-2"
                    initial="hidden"
                    animate="visible"
                    layout={false}
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.08,
                        },
                      },
                    }}
                  >
                    {"AI 꿈해석 로또 번호 추천기".split("").map((char, index) => {
                      // 무지개 색상 배열 (더 부드러운 전환을 위해 더 많은 색상)
                      const rainbowColors = [
                        '#FF0000', // 빨강
                        '#FF4500', // 주황빨강
                        '#FF7F00', // 주황
                        '#FFA500', // 오렌지
                        '#FFD700', // 금색
                        '#FFFF00', // 노랑
                        '#ADFF2F', // 연두
                        '#00FF00', // 초록
                        '#00CED1', // 청록
                        '#00BFFF', // 하늘색
                        '#0000FF', // 파랑
                        '#4169E1', // 로얄블루
                        '#4B0082', // 남색
                        '#8A2BE2', // 블루바이올렛
                        '#9400D3', // 보라
                        '#FF1493', // 딥핑크
                        '#FF69B4', // 핑크
                      ];
                      const totalChars = "AI 꿈해석 로또 번호 추천기".length;
                      const hue = (index / totalChars) * 360;
                      const currentColor = `hsl(${hue}, 100%, 60%)`;
                      const nextColor = `hsl(${(hue + 30) % 360}, 100%, 60%)`;
                      
                      return (
                        <motion.span
                          key={`title-char-${index}`}
                          layout={false}
                          variants={{
                            hidden: { 
                              opacity: 0, 
                              scale: 0,
                              y: -30,
                              rotate: -180,
                            },
                            visible: { 
                              opacity: 1, 
                              scale: 1,
                              y: 0,
                              rotate: 0,
                              transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              },
                            },
                          }}
                          whileHover={{
                            scale: 1.4,
                            y: -8,
                            rotate: [0, -10, 10, -10, 0],
                            transition: { duration: 0.3 },
                          }}
                          className="inline-block drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]"
                          style={{
                            background: `linear-gradient(135deg, ${currentColor}, ${nextColor})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: 'brightness(1.2) saturate(1.3)',
                          }}
                        >
                          {char === " " ? "\u00A0" : char}
                        </motion.span>
                      );
                    })}
                  </motion.div>
                </CardTitle>
                <CardDescription className="relative z-10 mt-2 text-base md:text-lg font-medium">
                  <motion.div
                    className="flex flex-wrap justify-center items-center gap-0.5 md:gap-1"
                    initial="hidden"
                    animate="visible"
                    layout={false}
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.5,
                        },
                      },
                    }}
                  >
                    {"당신의 운세와 꿈을 분석해서 행운으로 돌려드립니다~!".split("").map((char, index) => (
                      <motion.span
                        key={`desc-char-${index}`}
                        layout={false}
                        variants={{
                          hidden: { 
                            opacity: 0, 
                            scale: 0,
                          },
                          visible: { 
                            opacity: 1, 
                            scale: 1,
                            transition: {
                              type: "spring",
                              stiffness: 200,
                              damping: 15,
                            },
                          },
                        }}
                        whileHover={{
                          scale: 1.2,
                          transition: { duration: 0.2 },
                        }}
                        className="inline-block text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </motion.div>
                </CardDescription>
                <motion.p
                  className="relative z-10 mt-4 text-sm text-white/100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  by Brain Chun
                </motion.p>
              </motion.div>
            </CardHeader>

            <CardContent className="relative space-y-5 pt-6 px-6 pb-6">
              {/* 꿈 입력 영역 */}
              <motion.div
                className="space-y-3"
                variants={itemVariants}
              >
                <label
                  htmlFor="dream"
                  className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-200"
                >
                  <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 shadow-md">
                    <Moon className="relative h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-200">
                    오늘 아침 꾼 꿈을 입력해주세요
                  </span>
                  <span className="text-red-500 ml-1 text-lg">*</span>
                </label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="relative group"
                >
                  {/* 포커스 시 글로우 효과 - 보라색 */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-300/30 to-purple-400/30 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  
                  {/* 입력 필드 배경 */}
                  <div className="absolute inset-0 rounded-xl bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 group-focus-within:border-purple-400 dark:group-focus-within:border-purple-500 transition-all duration-300 shadow-sm" />
                  
                  <Textarea
                    id="dream"
                    placeholder={`예: ${dreamExampleText}`}
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    className="relative min-h-28 text-base transition-all duration-300 focus:ring-2 focus:ring-purple-400/40 focus:ring-offset-2 bg-transparent border-0 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    required
                  />
                </motion.div>
                {!dreamText && (
                  <motion.button
                    type="button"
                    onClick={() => setDreamText(dreamExampleText)}
                    className="group text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-base">💡</span>
                    <span className="italic text-purple-600/80 dark:text-purple-400/80 group-hover:text-purple-600 dark:group-hover:text-purple-400">"{dreamExampleText}"</span>
                    <span className="group-hover:underline">를 클릭하여 사용하기</span>
                  </motion.button>
                )}
                <motion.div
                  className="flex items-center justify-between text-xs"
                  animate={{
                    color: isDreamTextValid
                      ? "#6b7280"
                      : "#ef4444",
                  }}
                >
                  <span className={isDreamTextValid ? "text-gray-500 dark:text-gray-400" : "text-red-500"}>
                    최소 20자 이상, 최대 2000자 이하
                  </span>
                  <span className={`font-medium ${isDreamTextValid ? "text-gray-500 dark:text-gray-400" : "text-red-500"}`}>
                    {dreamText.length}/2000
                  </span>
                </motion.div>
                {dreamText.length > 0 && !isDreamTextValid && (
                  <motion.p
                    className="text-xs font-medium text-red-500"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {dreamText.length < 20 
                      ? `${20 - dreamText.length}자 더 입력해주세요.`
                      : "2000자 이하로 입력해주세요."}
                  </motion.p>
                )}
              </motion.div>

              {/* 개인 정보 입력 영역 - 간소화된 최신 UI */}
              <motion.div
                className="space-y-5"
                variants={itemVariants}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* 출생년도 입력 */}
                  <motion.div
                    className="space-y-3 relative group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* 배경 그라데이션 */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <label
                      htmlFor="birthYear"
                      className="relative flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-200"
                    >
                      <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 shadow-md">
                        <Calendar className="relative h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-200">
                        출생년도
                      </span>
                      <span className="text-red-500 ml-1 text-lg">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-300/20 to-purple-400/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                      <Input
                        id="birthYear"
                        type="text"
                        inputMode="numeric"
                        placeholder="예: 1990"
                        value={birthYear}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setBirthYear(value);
                        }}
                        className="relative transition-all duration-300 focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 focus:ring-offset-2 text-lg font-bold bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 shadow-sm text-gray-700 dark:text-gray-200"
                        required
                      />
                    </div>
                    <motion.p
                      className="text-xs flex items-center gap-1"
                      animate={{
                        color: isBirthYearValid
                          ? "#6b7280"
                          : birthYear.length > 0
                          ? "#ef4444"
                          : "#6b7280",
                      }}
                    >
                      {birthYear.length === 0 
                        ? "4자리 출생년도를 입력하세요"
                        : !isBirthYearValid
                        ? "올바른 출생년도를 입력해주세요"
                        : <><span className="text-purple-600 dark:text-purple-400">✓</span> 올바른 형식입니다</>}
                    </motion.p>
                  </motion.div>

                  {/* 출생월일 입력 */}
                  <motion.div
                    className="space-y-3 relative group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* 배경 그라데이션 */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <label className="relative flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-200">
                      <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 shadow-md">
                        <Calendar className="relative h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-200">
                        출생월일 (선택)
                      </span>
                    </label>
                    <div className="relative grid grid-cols-2 gap-2">
                      <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-300/20 to-purple-400/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                        <select
                          id="birthMonth"
                          value={birthMonth}
                          onChange={(e) => {
                            setBirthMonth(e.target.value);
                            setBirthDay(""); // 월이 변경되면 일 초기화
                          }}
                          className="relative flex h-12 w-full rounded-lg border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 px-3 py-2 text-base font-semibold shadow-sm transition-all duration-300 outline-none focus-visible:border-purple-400 dark:focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-400/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-700 dark:text-gray-200 md:text-sm"
                        >
                          <option value="">월</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={(i + 1).toString()}>
                              {i + 1}월
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-300/20 to-purple-400/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                        <select
                          id="birthDay"
                          value={birthDay}
                          onChange={(e) => setBirthDay(e.target.value)}
                          disabled={!birthMonth}
                          className="relative flex h-12 w-full rounded-lg border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 px-3 py-2 text-base font-semibold shadow-sm transition-all duration-300 outline-none focus-visible:border-purple-400 dark:focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-400/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-700 dark:text-gray-200 md:text-sm"
                        >
                          <option value="">일</option>
                          {Array.from({ length: getDaysInMonth(birthMonth) }, (_, i) => (
                            <option key={i + 1} value={(i + 1).toString()}>
                              {i + 1}일
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {birthMonth && birthDay && (
                      <motion.p
                        className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1"
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <span className="text-purple-600 dark:text-purple-400">✓</span>
                        출생월일 입력 시 더 정확한 해석이 가능합니다
                      </motion.p>
                    )}
                  </motion.div>

                  {/* 출생 시각 선택 */}
                  <motion.div
                    className="space-y-3 relative group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* 배경 그라데이션 */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <label
                      htmlFor="birthHour"
                      className="relative flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-200"
                    >
                      <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 shadow-md">
                        <Clock className="relative h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-200">
                        출생 시각 (선택)
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-300/20 to-purple-400/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                      <select
                        id="birthHour"
                        value={birthHour}
                        onChange={(e) => setBirthHour(e.target.value)}
                        className="relative flex h-12 w-full rounded-lg border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 px-4 py-2 text-base font-semibold shadow-sm transition-all duration-300 outline-none focus-visible:border-purple-400 dark:focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-400/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-700 dark:text-gray-200 md:text-sm"
                      >
                      <option value="">모르겠음</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}시
                        </option>
                      ))}
                    </select>

                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* 액션 버튼 */}
              <motion.div variants={itemVariants} className="pt-4">
                <motion.div
                  whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  className="relative group"
                >
                  {/* 다층 글로우 효과 - 보라색 */}
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500 rounded-xl blur-xl opacity-50"
                    animate={{
                      opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("버튼 클릭됨", { isFormValid, isLoading });
                      handleSubmit();
                    }}
                    disabled={!isFormValid || isLoading}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white text-base md:text-lg font-bold shadow-xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl border-0 h-14 rounded-xl"
                    size="lg"
                    type="button"
                  >
                    {/* 호버 시 그라데이션 변화 */}
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      initial={false}
                    />
                    
                    {/* 빛나는 효과 */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeInOut",
                      }}
                    />
                    
                    <span className="relative z-10 flex items-center justify-center gap-3 drop-shadow-lg">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span>분석 중...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                          <span className="tracking-wide">꿈해석 시작하기</span>
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </motion.div>

              {/* 오류 메시지 */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="rounded-xl border border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 backdrop-blur-sm p-4 shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-red-200 dark:bg-red-900/30">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">오류 발생</p>
                        <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="text-red-600/70 dark:text-red-400/70 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg p-1 transition-all duration-200 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* 결과 표시 카드 */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              variants={itemVariants}
              className="mt-6"
            >
              <Card className="relative border-0 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 overflow-hidden rounded-3xl">
                {/* 결과 카드 외곽 글로우 - 보라색 */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 via-purple-500/20 to-purple-400/20 rounded-3xl blur-xl opacity-60" />
                
                {/* 결과 카드 내부 부드러운 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-gray-800 dark:via-purple-900/20 dark:to-gray-800 pointer-events-none" />
                
                {/* 별 장식 패턴 */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }} />
                
                <CardHeader className="relative overflow-hidden text-center pb-8 pt-8 bg-gradient-to-br from-purple-600 to-purple-500 rounded-t-3xl">
                  {/* 헤더 배경 - 보라색 그라데이션 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-600" />
                  
                  {/* 별 장식 */}
                  <div className="absolute inset-0 opacity-20">
                    {isMounted && headerStarPositions.map((star, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          left: `${star.left}%`,
                          top: `${star.top}%`,
                        }}
                        animate={{
                          opacity: [0.2, 0.6, 0.2],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: star.duration,
                          repeat: Infinity,
                          delay: star.delay,
                        }}
                      >
                        <Star className="h-3 w-3 text-white fill-white/40" />
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* 헤더 하단 구분선 */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  
                  <motion.div
                    className="relative z-10"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div
                      className="mb-8 flex justify-center"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <div className="relative">
                        {/* 다층 글로우 효과 - 보라색 */}
                        <div className="absolute inset-0 bg-purple-400/40 blur-2xl rounded-full animate-pulse" />
                        <div className="absolute inset-0 bg-purple-300/30 blur-xl rounded-full" />
                        <Trophy className="relative h-16 w-16 text-white drop-shadow-2xl" />
                      </div>
                    </motion.div>
                    <CardTitle className="relative z-10 text-3xl font-black text-white md:text-4xl lg:text-5xl">
                      <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">꿈과 관련된 판타지 스토리</span>
                    </CardTitle>
                  </motion.div>
                </CardHeader>

                <CardContent className="relative space-y-6 pt-8 px-6 pb-6">
                  {/* 스토리 */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-bold text-gray-700 dark:text-gray-200">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>판타지 스토리</span>
                    </h3>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="relative rounded-xl border border-purple-200 dark:border-purple-700 bg-gradient-to-br from-purple-50/50 via-white to-purple-50/50 dark:from-purple-900/20 dark:via-gray-800 dark:to-purple-900/20 backdrop-blur-sm p-5 shadow-sm"
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent" />
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-200">{result.story}</p>
                    </motion.div>
                  </div>

                  {/* 그리스 신화 스토리 */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-bold text-gray-700 dark:text-gray-200">
                      <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-purple-200 to-purple-100 dark:from-purple-800/30 dark:to-purple-700/20 border border-purple-300 dark:border-purple-600 shadow-lg">
                        <Flame className="relative h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-200">
                        그리스 신화 스토리
                      </span>
                    </h3>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="relative rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-gradient-to-br from-purple-100/50 via-white to-purple-100/50 dark:from-purple-900/30 dark:via-gray-800 dark:to-purple-900/30 backdrop-blur-sm p-5 shadow-lg"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/50 via-purple-500/50 via-purple-400/50 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-900/10 rounded-xl" />
                      <p className="relative text-sm md:text-base leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-200 font-medium">
                        {result.greekMythStory}
                      </p>
                    </motion.div>
                  </div>

                  {/* 로또 번호 */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-bold text-gray-700 dark:text-gray-200">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>추천 로또 번호</span>
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
                      {result.lottoNumbers.map((number, index) => {
                        // 각 번호에 따라 다른 단색 할당 (이미지처럼 단색 공)
                        const ballColors = [
                          { base: '#EF4444', dark: '#DC2626' }, // 빨강
                          { base: '#3B82F6', dark: '#2563EB' }, // 파랑
                          { base: '#10B981', dark: '#059669' }, // 초록
                          { base: '#FBBF24', dark: '#F59E0B' }, // 노랑
                          { base: '#A855F7', dark: '#9333EA' }, // 보라
                          { base: '#EC4899', dark: '#DB2777' }, // 분홍
                        ];
                        const color = ballColors[index % ballColors.length];
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0, rotateY: -180 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ 
                              delay: 0.4 + index * 0.1,
                              type: "spring",
                              stiffness: 200,
                              damping: 15
                            }}
                            whileHover={{ 
                              scale: 1.15,
                              rotateY: 10,
                              rotateX: 10,
                              transition: { duration: 0.3 }
                            }}
                            className="relative flex flex-col items-center"
                          >
                            {/* 입체적인 공 모양 - 이미지와 유사한 3D 효과 */}
                            <div 
                              className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: color.base,
                                background: `
                                  radial-gradient(circle at 25% 25%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 15%, transparent 50%),
                                  radial-gradient(circle at 75% 75%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 30%, transparent 60%),
                                  ${color.base}
                                `,
                                boxShadow: `
                                  0 15px 35px -10px rgba(0,0,0,0.4),
                                  0 5px 15px rgba(0,0,0,0.2),
                                  inset -5px -5px 20px rgba(0,0,0,0.3),
                                  inset 5px 5px 20px rgba(255,255,255,0.2),
                                  0 0 0 1px rgba(255,255,255,0.1)
                                `,
                                filter: 'brightness(1.05)',
                              }}
                            >
                              {/* 확산된 하이라이트 효과 (상단 왼쪽) - 이미지처럼 확산된 형태 */}
                              <div 
                                className="absolute top-2 left-2 md:top-3 md:left-3 w-8 h-8 md:w-10 md:h-10 rounded-full"
                                style={{
                                  background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                                  filter: 'blur(2px)',
                                }}
                              />
                              
                              {/* 작은 밝은 하이라이트 포인트 */}
                              <div 
                                className="absolute top-1 left-1 md:top-2 md:left-2 w-3 h-3 md:w-4 md:h-4 rounded-full"
                                style={{
                                  background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                                  boxShadow: '0 0 8px rgba(255,255,255,0.6)',
                                }}
                              />
                              
                              {/* 하단 오른쪽 그림자 영역 */}
                              <div 
                                className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-10 h-10 md:w-12 md:h-12 rounded-full"
                                style={{
                                  background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, transparent 70%)',
                                  filter: 'blur(3px)',
                                }}
                              />
                              
                              {/* 번호 텍스트 - 큰 검은색 숫자 */}
                              <span 
                                className="relative z-10 text-2xl md:text-3xl font-black text-black"
                                style={{
                                  textShadow: '0 1px 2px rgba(255,255,255,0.3), 0 -1px 1px rgba(0,0,0,0.2)',
                                  letterSpacing: '-0.02em',
                                }}
                              >
                                {number}
                              </span>
                              
                              {/* 광택 효과를 위한 추가 하이라이트 */}
                              <div 
                                className="absolute top-0 left-0 w-full h-full rounded-full pointer-events-none"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                                }}
                              />
                            </div>
                            
                            {/* 설명 텍스트 */}
                            <p className="text-xs text-muted-foreground mt-2 text-center line-clamp-2 max-w-[80px] md:max-w-[100px]">
                              {result.numberExplanations[index]}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 분류 결과 */}
                  <div className="space-y-5">
                    <h3 className="flex items-center gap-3 text-lg font-black text-gray-700 dark:text-gray-200">
                      <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-purple-200 to-purple-100 dark:from-purple-800/30 dark:to-purple-700/20 border border-purple-300 dark:border-purple-600 shadow-lg">
                        <BookOpen className="relative h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-200">
                        동양사상 기반 분류
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {result.classifications.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                          className="relative group rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-gradient-to-br from-purple-50/50 via-white to-purple-50/50 dark:from-purple-900/20 dark:via-gray-800 dark:to-purple-900/20 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-500"
                        >
                          {/* 호버 시 글로우 */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-300/20 to-purple-400/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-700 dark:text-gray-200">{item.category}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.reason}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{item.confidence}%</div>
                              <div className="w-20 h-2 bg-purple-100 dark:bg-purple-900/50 rounded-full overflow-hidden mt-1">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.confidence}%` }}
                                  transition={{ duration: 0.5, delay: index * 0.1 }}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* 다시 시작 버튼 */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, type: "spring" }}
                    className="pt-2"
                  >
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="w-full border-2 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 font-semibold text-purple-600 dark:text-purple-400"
                      size="lg"
                    >
                      새로운 꿈 해석하기
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
