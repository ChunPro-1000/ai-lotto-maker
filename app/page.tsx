"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Moon, Calendar, Clock, User, Send, Loader2, AlertCircle, Trophy, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DreamAnalysisResponse, DreamAnalysisResult } from "@/types/dream-types";

export default function Home() {
  const [dreamText, setDreamText] = useState("");
  const [birthMonthDay, setBirthMonthDay] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [gender, setGender] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DreamAnalysisResult | null>(null);

  // 예시 텍스트
  const dreamExampleText = "어둠속 우물에서 빛나는 뱀과 마주했는데 푸른 빛의 옥구슬을 받는 꿈을 꿨어";

  /**
   * 꿈해석 API 호출
   */
  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 출생년월일에서 출생년도 추출
      const birthYear = birthMonthDay ? new Date(birthMonthDay).getFullYear() : null;
      
      if (!birthYear) {
        setError("출생년월일을 입력해주세요.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/dream-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dreamText: dreamText.trim(),
          birthYear: birthYear,
          birthMonthDay: birthMonthDay || undefined,
          birthTime: birthTime || undefined,
          gender: gender || undefined,
        }),
      });

      const data: DreamAnalysisResponse = await response.json();

      if (!data.success) {
        setError(data.error || "분석 중 오류가 발생했습니다.");
        return;
      }

      if (data.data) {
        setResult(data.data);
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
  const isDreamTextValid = dreamText.trim().length >= 30 && dreamText.trim().length <= 2000;
  const isFormValid = isDreamTextValid && birthMonthDay && !isLoading;

  /**
   * 결과 초기화
   */
  const handleReset = () => {
    setResult(null);
    setError(null);
    setDreamText("");
    setBirthMonthDay("");
    setBirthTime("");
    setGender("");
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-purple-50/30 to-amber-50/20 p-4 dark:from-background dark:via-purple-950/20 dark:to-amber-950/10">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
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
          <Card className="border-2 border-primary/20 shadow-2xl backdrop-blur-sm">
            <CardHeader className="relative overflow-hidden text-center">
              {/* 헤더 배경 장식 */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
              
              <motion.div
                className="relative z-10"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="mb-4 flex justify-center"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="h-12 w-12 text-primary" />
                </motion.div>
                
                <CardTitle className="relative z-10 text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent md:text-5xl">
                  AI 꿈해석 로또 번호 추천기 (by Brain Chun)
                </CardTitle>
                <CardDescription className="relative z-10 mt-4 text-lg text-muted-foreground">
                  당신의 꿈을 로또 번호로 바꾸어 드립니다.
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 꿈 입력 영역 */}
              <motion.div
                className="space-y-2"
                variants={itemVariants}
              >
                <label
                  htmlFor="dream"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Moon className="h-4 w-4 text-primary" />
                  오늘 아침 꾼 꿈을 입력해주세요
                  <span className="text-destructive ml-1">*</span>
                </label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Textarea
                    id="dream"
                    placeholder={`예: ${dreamExampleText}`}
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    className="min-h-32 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </motion.div>
                {!dreamText && (
                  <motion.button
                    type="button"
                    onClick={() => setDreamText(dreamExampleText)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer underline flex items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span>💡</span>
                    <span className="italic">"{dreamExampleText}"</span>
                    <span>를 클릭하여 사용하기</span>
                  </motion.button>
                )}
                <motion.p
                  className="text-xs text-muted-foreground"
                  animate={{
                    color: isDreamTextValid
                      ? "hsl(var(--muted-foreground))"
                      : "hsl(var(--destructive))",
                  }}
                >
                  최소 30자 이상, 최대 2000자 이하로 입력해주세요. ({dreamText.length}/2000)
                  {dreamText.length > 0 && !isDreamTextValid && (
                    <span className="ml-1 font-medium">
                      {dreamText.length < 30 
                        ? `${30 - dreamText.length}자 더 입력해주세요.`
                        : "2000자 이하로 입력해주세요."}
                    </span>
                  )}
                </motion.p>
              </motion.div>

              {/* 개인 정보 입력 영역 */}
              <motion.div
                className="space-y-4 rounded-lg border border-border/50 bg-muted/30 p-4"
                variants={itemVariants}
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4 text-primary" />
                  개인 정보
                </h3>

                <motion.div
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <label
                    htmlFor="birthMonthDay"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Calendar className="h-4 w-4 text-primary" />
                    출생년월일
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <Input
                    id="birthMonthDay"
                    type="date"
                    value={birthMonthDay}
                    onChange={(e) => setBirthMonthDay(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </motion.div>

                <motion.div
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <label
                    htmlFor="birthTime"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Clock className="h-4 w-4 text-primary" />
                    출생 시각 (선택)
                  </label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </motion.div>

                <motion.p
                  className="text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: birthTime ? 1 : 0.7 }}
                >
                  출생 시각을 입력하시면 더 정확한 해석이 가능합니다.
                </motion.p>

                <motion.div
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="gender" className="text-sm font-medium">
                    성별 (선택)
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-all duration-300 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
                  >
                    <option value="">선택하지 않음</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </motion.div>
              </motion.div>

              {/* 액션 버튼 */}
              <motion.div variants={itemVariants}>
                <motion.div
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-primary to-secondary text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                    size="lg"
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      initial={false}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          분석 중...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          꿈해석 시작하기
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-lg border border-destructive/50 bg-destructive/10 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">오류 발생</p>
                        <p className="text-sm text-destructive/80 mt-1">{error}</p>
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
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
              <Card className="border-2 border-primary/20 shadow-2xl backdrop-blur-sm">
                <CardHeader className="relative overflow-hidden text-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
                  <motion.div
                    className="relative z-10"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="mb-4 flex justify-center"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Trophy className="h-12 w-12 text-primary" />
                    </motion.div>
                    <CardTitle className="relative z-10 text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent md:text-4xl">
                      꿈해석 결과
                    </CardTitle>
                  </motion.div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* 분류 결과 */}
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <BookOpen className="h-5 w-5 text-primary" />
                      동양사상 기반 분류
                    </h3>
                    <div className="space-y-2">
                      {result.classifications.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="rounded-lg border border-border/50 bg-muted/30 p-4"
                        >
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

                  {/* 스토리 */}
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <Sparkles className="h-5 w-5 text-primary" />
                      판타지 스토리
                    </h3>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-lg border border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5 p-4"
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.story}</p>
                    </motion.div>
                  </div>

                  {/* 로또 번호 */}
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <Trophy className="h-5 w-5 text-primary" />
                      추천 로또 번호
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

                  {/* 다시 시작 버튼 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="w-full"
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
