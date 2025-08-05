"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";

export default function Home() {
  const [inputMinutes, setInputMinutes] = useState(0);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const [isShaking, setIsShaking] = useState(false); // 흔들림 상태 추가
  const [isClient, setIsClient] = useState(false); // 클라이언트 체크
  const circleRef = useRef<SVGCircleElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 클라이언트에서만 실행
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 별 스타일을 클라이언트에서만 생성
  const starStyles = useMemo(() => {
    if (!isClient) return [];

    return Array.from({ length: 30 }).map(() => {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = Math.random() * 2 + 1; // 1~3px
      const delay = Math.random() * 5; // 0~5초
      return {
        top: `${top}%`,
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`,
      };
    });
  }, [isClient]); // 빈 배열로 한 번만 실행

  // 알림음 재생 함수
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // 처음부터 재생
      audioRef.current.play().catch((error) => {
        console.log("오디오 재생 실패:", error);
      });
    }
  };

  // 흔들림 효과 함수 추가
  const triggerShake = () => {
    setIsShaking(true);
    // 2초 후 흔들림 중지
    setTimeout(() => {
      setIsShaking(false);
    }, 2000);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      if (isIntervalRunning) {
        setTime(totalTime);
      } else {
        setIsRunning(false);
      }

      // 알림음 재생
      playNotificationSound();
      // 흔들림 효과 시작
      triggerShake();

      if (Notification.permission === "granted") {
        new Notification("⏰ 타이머 완료!", {
          body: "설정한 시간이 끝났어요.",
        });
      } else if (Notification.permission !== "denied") {
        // 웹사이트 알림 권한 요청
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("⏰ 타이머 완료!", {
              body: "설정한 시간이 끝났어요.",
            });
          }
        });
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, time, isIntervalRunning, totalTime]);

  useEffect(() => {
    setTime(inputMinutes * 60 + inputSeconds);
    setTotalTime(inputMinutes * 60 + inputSeconds);
  }, [inputMinutes, inputSeconds]);

  // 원형 진행률 계산
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const percent = totalTime ? time / totalTime : 0;
  const dashoffset = circumference * (1 - percent);

  const format = (t: number) => {
    const m = String(Math.floor(t / 60)).padStart(2, "0");
    const s = String(t % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const applyTimer = () => {
    setTime(inputMinutes * 60 + inputSeconds);
    setTotalTime(inputMinutes * 60 + inputSeconds);
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      applyTimer();
      setIsRunning(true);
    }
  };
  const resetTimer = () => {
    setInputSeconds(0);
    setInputMinutes(0);
    setIsRunning(false);
  };

  const toggleInterval = () => {
    setIsIntervalRunning((prev) => !prev);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 20% 40%, #312e81 0%, transparent 60%),
          radial-gradient(ellipse at 80% 60%,rgb(16, 81, 99) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 80%, #581c87 0%, transparent 70%),
          linear-gradient(120deg, #0f172a 0%, #1e293b 50%, #312e81 100%)
        `,
        backgroundBlendMode: "screen",
      }}
    >
      {/* 우주 배경 별들 - 클라이언트에서만 렌더링 */}
      {isClient && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {starStyles.map((style, i) => (
            <div key={i} className="star" style={style}></div>
          ))}

          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
        </div>
      )}

      {/* 숨겨진 오디오 요소 */}
      <audio ref={audioRef} preload="auto">
        <source src="/assets/sounds/timer-end.mp3" type="audio/mpeg" />
        <source src="/assets/sounds/timer-end.ogg" type="audio/ogg" />
        <source src="/assets/sounds/timer-end.wav" type="audio/wav" />
      </audio>

      <div
        className={`bg-black/60 shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-8 w-full max-w-xs sm:max-w-md border border-gray-700 transition-all duration-300 ${
          isShaking ? "animate-[shake_0.5s_ease-in-out_infinite]" : ""
        }`}
      >
        {/* 원형 타이머 */}
        <div
          className="relative flex items-center justify-center"
          style={{
            backgroundImage: 'url("/assets/images/maple.png")',
            backgroundPosition: "center 90px",
            backgroundRepeat: "no-repeat",
          }}
        >
          <svg width={320} height={320}>
            <circle
              cx={160}
              cy={160}
              r={radius}
              fill="none"
              stroke="#374151"
              strokeWidth={16}
            />
            <circle
              ref={circleRef}
              cx={160}
              cy={160}
              r={radius}
              fill="none"
              stroke="url(#timer-gradient)"
              strokeWidth={16}
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s" }}
            />
            <defs>
              <linearGradient id="timer-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute -top-[-80px] text-5xl font-extrabold text-white select-none drop-shadow-lg">
            {format(time)}
          </span>
        </div>
        {/* 상태 
        <div className="text-center text-gray-300 text-sm mb-2 h-5">
          {isRunning ? "진행 중..." : time === 0 ? "대기 중" : "일시정지"}
        </div>*/}
        {/* 입력 */}
        <div className="flex gap-2 justify-center items-center">
          <input
            type="number"
            min={0}
            max={99}
            value={inputMinutes}
            onChange={(e) => setInputMinutes(Number(e.target.value))}
            className="w-14 text-center rounded-lg border border-gray-600 bg-gray-700 text-white p-2 font-mono text-lg shadow focus:ring-2 focus:ring-purple-500 transition"
            disabled={isRunning}
          />
          <span className="text-2xl font-bold text-white">:</span>
          <input
            type="number"
            min={0}
            max={59}
            value={inputSeconds}
            onChange={(e) => setInputSeconds(Number(e.target.value))}
            className="w-14 text-center rounded-lg border border-gray-600 bg-gray-700 text-white p-2 font-mono text-lg shadow focus:ring-2 focus:ring-cyan-500 transition"
            disabled={isRunning}
          />
          {/*
          <button
            onClick={applyTimer}
            className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold shadow hover:scale-105 active:scale-95 transition"
            disabled={isRunning}
          >
            설정
          </button>
          */}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-300 text-sm">인터벌 모드</span>
          <button
            onClick={toggleInterval}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              isIntervalRunning
                ? "bg-gradient-to-r from-purple-600 to-cyan-600"
                : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isIntervalRunning ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* 컨트롤 */}
        <div className="flex gap-4 justify-center mt-2">
          <button
            onClick={toggleTimer}
            className={`px-6 py-2 rounded-xl font-bold shadow-lg transition text-lg ${
              isRunning
                ? "bg-gradient-to-r from-red-600 to-pink-600 text-white hover:scale-105"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-105"
            }`}
            disabled={time === 0}
          >
            {isRunning ? "정지" : "시작"}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-2 rounded-xl bg-gray-600 text-gray-200 font-bold shadow hover:bg-gray-500 transition text-lg"
            disabled={totalTime === 0}
          >
            리셋
          </button>
        </div>
      </div>
    </div>
  );
}
