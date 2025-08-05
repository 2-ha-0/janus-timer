"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [inputMinutes, setInputMinutes] = useState(0);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      setIsRunning(false);

      if (Notification.permission === "granted") {
        new Notification("⏰ 타이머 완료!", {
          body: "설정한 시간이 끝났어요.",
        });

      } else if (Notification.permission !== "denied") {
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
  }, [isRunning, time]);

  useEffect(() => {
    setTime(inputMinutes * 60 + inputSeconds);
    setTotalTime(inputMinutes * 60 + inputSeconds);
  }, [inputMinutes, inputSeconds]);

  // 원형 진행률 계산
  const radius = 90;
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
    setIsRunning(false);
  };

  const toggleTimer = () => setIsRunning((prev) => !prev);
  const resetTimer = () => {
    setTime(totalTime);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
      <div className="bg-gray-800/90 shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-8 w-full max-w-xs sm:max-w-md border border-gray-700">
        {/* 원형 타이머 */}
        <div className="relative flex items-center justify-center">
          <svg width={220} height={220}>
            <circle
              cx={110}
              cy={110}
              r={radius}
              fill="none"
              stroke="#374151"
              strokeWidth={16}
            />
            <circle
              ref={circleRef}
              cx={110}
              cy={110}
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
          <span className="absolute text-5xl font-extrabold text-white select-none drop-shadow-lg">
            {format(time)}
          </span>
        </div>
        {/* 상태 */}
        <div className="text-center text-gray-300 text-sm mb-2 h-5">
          {isRunning ? "진행 중..." : time === 0 ? "대기 중" : "일시정지"}
        </div>
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
          <button
            onClick={applyTimer}
            className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold shadow hover:scale-105 active:scale-95 transition"
            disabled={isRunning}
          >
            설정
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
            disabled={time === totalTime || totalTime === 0}
          >
            리셋
          </button>
        </div>
      </div>
    </div>
  );
}
