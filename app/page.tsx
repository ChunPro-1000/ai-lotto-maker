"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Moon, Calendar, Clock, Send, Loader2, AlertCircle, Trophy, BookOpen, X, Flame } from "lucide-react";
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

  // 예시 텍스트
  const dreamExampleText = "어둠속 우물에서 빛나는 뱀과 마주했는데 푸른 빛의 옥구슬을 받는 꿈을 꿨어";

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-purple-50/40 via-amber-50/30 to-background p-4 dark:from-background dark:via-purple-950/30 dark:via-amber-950/20 dark:to-background">
      {/* 배경 장식 요소 - 개선된 그라데이션 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 메인 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        
        {/* 애니메이션 배경 요소들 */}
        <motion.div
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -right-32 -bottom-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-accent/10 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="relative border-2 border-primary/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-2xl bg-gradient-to-br from-card/95 via-card/90 to-card/95 dark:from-card/95 dark:via-card/90 dark:to-card/95 overflow-hidden">
            {/* 카드 외곽 글로우 효과 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-lg blur-2xl opacity-50 animate-pulse" />
            
            {/* 카드 내부 다층 그라데이션 효과 */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
            
            {/* 상단 빛나는 라인 */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary via-secondary via-primary to-transparent opacity-80" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            {/* 좌우 측면 그라데이션 */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
            
            {/* 배경 패턴 효과 */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
            
            <CardHeader className="relative overflow-hidden text-center pb-8 pt-8">
              {/* 헤더 배경 다층 그라데이션 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/8 via-primary/12 to-secondary/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-transparent" />
              
              {/* 헤더 하단 구분선 */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 via-secondary/40 via-primary/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
              
              {/* 헤더 측면 장식 */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-gradient-to-b from-transparent via-primary/40 to-transparent rounded-r-full" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-gradient-to-b from-transparent via-secondary/40 to-transparent rounded-l-full" />
              
              <motion.div
                className="relative z-10"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="mb-8 flex justify-center"
                  animate={{
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="relative">
                    {/* 다층 글로우 효과 */}
                    <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
                    <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full" />
                    <div className="absolute inset-0 bg-accent/10 blur-lg rounded-full" />
                    {/* 아이콘 주변 빛나는 링 */}
                    <motion.div
                      className="absolute inset-0 border-2 border-primary/30 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                    <Sparkles className="relative h-16 w-16 text-primary drop-shadow-2xl filter brightness-110" />
                  </div>
                </motion.div>
                
                <CardTitle className="relative z-10 text-4xl font-black bg-gradient-to-r from-primary via-secondary via-accent via-primary to-secondary bg-clip-text text-transparent md:text-4xl lg:text-5xl leading-tight tracking-tight">
                  <span className="drop-shadow-[0_2px_8px_rgba(139,92,246,0.3)]">AI 꿈해석</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(245,158,11,0.3)]">
                    AI 꿈해석 로또 번호 추천기
                  </span>
                </CardTitle>
                <CardDescription className="relative z-10 mt-4 text-base md:text-lg text-foreground/70 font-semibold">
                  <span className="bg-gradient-to-r from-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                    당신의 꿈을 행운으로 돌려 드립니다~
                  </span>
                </CardDescription>
                <motion.p
                  className="relative z-10 mt-2 text-s text-muted-foreground/60"
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
                  className="flex items-center gap-3 text-sm font-bold text-foreground"
                >
                  <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
                    <div className="absolute inset-0 bg-primary/10 rounded-xl blur-sm" />
                    <Moon className="relative h-5 w-5 text-primary drop-shadow-md" />
                  </div>
                  <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    오늘 아침 꾼 꿈을 입력해주세요
                  </span>
                  <span className="text-destructive ml-1 text-lg">*</span>
                </label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="relative group"
                >
                  {/* 포커스 시 글로우 효과 */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                  
                  {/* 입력 필드 배경 패턴 */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-md border-2 border-primary/20 group-focus-within:border-primary/50 transition-all duration-300" />
                  
                  <Textarea
                    id="dream"
                    placeholder={`예: ${dreamExampleText}`}
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    className="relative min-h-28 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 bg-transparent border-0 shadow-inner"
                    required
                  />
                </motion.div>
                {!dreamText && (
                  <motion.button
                    type="button"
                    onClick={() => setDreamText(dreamExampleText)}
                    className="group text-xs text-muted-foreground hover:text-primary transition-all duration-200 cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-base">💡</span>
                    <span className="italic text-primary/80 group-hover:text-primary">"{dreamExampleText}"</span>
                    <span className="group-hover:underline">를 클릭하여 사용하기</span>
                  </motion.button>
                )}
                <motion.div
                  className="flex items-center justify-between text-xs"
                  animate={{
                    color: isDreamTextValid
                      ? "hsl(var(--muted-foreground))"
                      : "hsl(var(--destructive))",
                  }}
                >
                  <span>
                    최소 20자 이상, 최대 2000자 이하
                  </span>
                  <span className="font-medium">
                    {dreamText.length}/2000
                  </span>
                </motion.div>
                {dreamText.length > 0 && !isDreamTextValid && (
                  <motion.p
                    className="text-xs font-medium text-destructive"
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
                      className="relative flex items-center gap-3 text-sm font-bold text-foreground"
                    >
                      <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-md">
                        <div className="absolute inset-0 bg-primary/10 rounded-xl blur-sm" />
                        <Calendar className="relative h-5 w-5 text-primary drop-shadow-md" />
                      </div>
                      <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        출생년도
                      </span>
                      <span className="text-destructive ml-1 text-lg">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
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
                        className="relative transition-all duration-300 focus:border-primary/60 focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 text-lg font-bold bg-background/60 backdrop-blur-md border-2 border-primary/20 shadow-inner"
                        required
                      />
                    </div>
                    <motion.p
                      className="text-xs flex items-center gap-1"
                      animate={{
                        color: isBirthYearValid
                          ? "hsl(var(--muted-foreground))"
                          : birthYear.length > 0
                          ? "hsl(var(--destructive))"
                          : "hsl(var(--muted-foreground))",
                      }}
                    >
                      {birthYear.length === 0 
                        ? "4자리 출생년도를 입력하세요"
                        : !isBirthYearValid
                        ? "올바른 출생년도를 입력해주세요"
                        : <><span className="text-primary">✓</span> 올바른 형식입니다</>}
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
                    
                    <label className="relative flex items-center gap-3 text-sm font-bold text-foreground">
                      <div className="relative p-2 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20 shadow-md">
                        <div className="absolute inset-0 bg-accent/10 rounded-xl blur-sm" />
                        <Calendar className="relative h-5 w-5 text-accent drop-shadow-md" />
                      </div>
                      <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        출생월일 (선택)
                      </span>
                    </label>
                    <div className="relative grid grid-cols-2 gap-2">
                      <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                        <select
                          id="birthMonth"
                          value={birthMonth}
                          onChange={(e) => {
                            setBirthMonth(e.target.value);
                            setBirthDay(""); // 월이 변경되면 일 초기화
                          }}
                          className="relative flex h-12 w-full rounded-lg border-2 border-accent/20 bg-background/60 backdrop-blur-md px-3 py-2 text-base font-semibold shadow-inner transition-all duration-300 outline-none focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                        <select
                          id="birthDay"
                          value={birthDay}
                          onChange={(e) => setBirthDay(e.target.value)}
                          disabled={!birthMonth}
                          className="relative flex h-12 w-full rounded-lg border-2 border-accent/20 bg-background/60 backdrop-blur-md px-3 py-2 text-base font-semibold shadow-inner transition-all duration-300 outline-none focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
                        className="text-xs text-muted-foreground flex items-center gap-1"
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <span className="text-accent">✓</span>
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
                      className="relative flex items-center gap-3 text-sm font-bold text-foreground"
                    >
                      <div className="relative p-2 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/20 shadow-md">
                        <div className="absolute inset-0 bg-secondary/10 rounded-xl blur-sm" />
                        <Clock className="relative h-5 w-5 text-secondary drop-shadow-md" />
                      </div>
                      <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        출생 시각 (선택)
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-secondary/10 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                      <select
                        id="birthHour"
                        value={birthHour}
                        onChange={(e) => setBirthHour(e.target.value)}
                        className="relative flex h-12 w-full rounded-lg border-2 border-secondary/20 bg-background/60 backdrop-blur-md px-4 py-2 text-base font-semibold shadow-inner transition-all duration-300 outline-none focus-visible:border-secondary/60 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      >
                      <option value="">모르겠음</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}시
                        </option>
                      ))}
                    </select>
                    {birthHour && (
                      <motion.p
                        className="text-xs text-muted-foreground flex items-center gap-1"
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <span className="text-secondary">✓</span>
                        출생 시각 입력 시 더 정확한 해석이 가능합니다
                      </motion.p>
                    )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* 액션 버튼 */}
              <motion.div variants={itemVariants} className="pt-4">
                <motion.div
                  whileHover={!isLoading ? { scale: 1.03, y: -3 } : {}}
                  whileTap={!isLoading ? { scale: 0.97 } : {}}
                  className="relative group"
                >
                  {/* 다층 글로우 효과 */}
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary via-accent to-primary rounded-xl blur-xl opacity-60"
                    animate={{
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary rounded-lg blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  {/* 버튼 내부 그라데이션 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 rounded-lg" />
                  
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("버튼 클릭됨", { isFormValid, isLoading });
                      handleSubmit();
                    }}
                    disabled={!isFormValid || isLoading}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-primary via-accent to-secondary text-base md:text-lg font-black shadow-2xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl border-0 h-14"
                    size="lg"
                    type="button"
                  >
                    {/* 호버 시 그라데이션 변화 */}
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-secondary via-primary via-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-700"
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
                    className="rounded-xl border border-destructive/50 bg-gradient-to-br from-destructive/10 to-destructive/5 backdrop-blur-sm p-4 shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-destructive/20">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-destructive mb-1">오류 발생</p>
                        <p className="text-sm text-destructive/90 leading-relaxed">{error}</p>
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg p-1 transition-all duration-200 flex-shrink-0"
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
              <Card className="relative border-2 border-primary/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-2xl bg-gradient-to-br from-card/95 via-card/90 to-card/95 dark:from-card/95 dark:via-card/90 dark:to-card/95 overflow-hidden">
                {/* 결과 카드 외곽 글로우 */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-lg blur-2xl opacity-50 animate-pulse" />
                
                {/* 결과 카드 내부 다층 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
                
                {/* 상단 빛나는 라인 */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary via-secondary via-primary to-transparent opacity-80" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                
                {/* 배경 패턴 */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }} />
                
                <CardHeader className="relative overflow-hidden text-center pb-8 pt-8">
                  {/* 헤더 배경 다층 그라데이션 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/8 via-primary/12 to-secondary/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-transparent" />
                  
                  {/* 헤더 하단 구분선 */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 via-secondary/40 via-primary/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                  
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
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <div className="relative">
                        {/* 다층 글로우 효과 */}
                        <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
                        <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full" />
                        <div className="absolute inset-0 bg-accent/10 blur-lg rounded-full" />
                        {/* 빛나는 링 */}
                        <motion.div
                          className="absolute inset-0 border-2 border-primary/30 rounded-full"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                        />
                        <Trophy className="relative h-16 w-16 text-primary drop-shadow-2xl filter brightness-110" />
                      </div>
                    </motion.div>
                    <CardTitle className="relative z-10 text-3xl font-black bg-gradient-to-r from-primary via-secondary via-accent via-primary to-secondary bg-clip-text text-transparent md:text-4xl lg:text-5xl">
                      <span className="drop-shadow-[0_2px_8px_rgba(139,92,246,0.3)]">꿈해석 결과</span>
                    </CardTitle>
                  </motion.div>
                </CardHeader>

                <CardContent className="relative space-y-6 pt-8 px-6 pb-6">
                  {/* 스토리 */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-bold">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <Sparkles className="h-5 w-5 text-secondary" />
                      </div>
                      <span>판타지 스토리</span>
                    </h3>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="relative rounded-xl border border-border/50 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 backdrop-blur-sm p-5 shadow-sm"
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-foreground/90">{result.story}</p>
                    </motion.div>
                  </div>

                  {/* 그리스 신화 스토리 */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-bold">
                      <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20 shadow-lg">
                        <div className="absolute inset-0 bg-accent/10 rounded-xl blur-sm" />
                        <Flame className="relative h-6 w-6 text-accent drop-shadow-md" />
                      </div>
                      <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                        그리스 신화 스토리
                      </span>
                    </h3>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="relative rounded-xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-primary/5 to-accent/10 backdrop-blur-sm p-5 shadow-lg"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/40 via-primary/40 via-accent/40 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-xl" />
                      <p className="relative text-sm md:text-base leading-relaxed whitespace-pre-wrap text-foreground/90 font-medium">
                        {result.greekMythStory}
                      </p>
                    </motion.div>
                  </div>

                  {/* 로또 번호 */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-bold">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Trophy className="h-5 w-5 text-accent" />
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
                    <h3 className="flex items-center gap-3 text-lg font-black">
                      <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
                        <div className="absolute inset-0 bg-primary/10 rounded-xl blur-sm" />
                        <BookOpen className="relative h-6 w-6 text-primary drop-shadow-md" />
                      </div>
                      <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
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
                          className="relative group rounded-xl border-2 border-border/50 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/20 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30"
                        >
                          {/* 호버 시 글로우 */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.category}</p>
                              <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">{item.confidence}%</div>
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden mt-1">
                                <motion.div
                                  className="h-full bg-primary rounded-full"
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
                      className="w-full border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 font-semibold"
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
