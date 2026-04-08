"use client";
import React, { useEffect, useRef } from 'react';
import { useSnakeLogic } from '../hooks/useSnakeLogic';
import { CANVAS_SIZE, GRID_SIZE } from '../utils/constants';

export const SnakeGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Custom Hook-ээс бүх хэрэгцээт төлөв болон функцүүдийг авна
    const {
        snake,
        food,
        setDir,
        status,
        setStatus,
        score,
        highScore,
        level,
        currentSpeed,
        resetGame,
        moveSnake
    } = useSnakeLogic();

    // 1. Хэрэглэгчийн оролтыг (Input) хянах
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Тоглоом эхлээгүй үед дурын сум дарвал эхлүүлнэ
            if (status === 'IDLE' && e.key.includes("Arrow")) {
                setStatus('PLAYING');
            }

            switch (e.key) {
                case "ArrowUp": setDir(d => d.y === 1 ? d : { x: 0, y: -1 }); break;
                case "ArrowDown": setDir(d => d.y === -1 ? d : { x: 0, y: 1 }); break;
                case "ArrowLeft": setDir(d => d.x === 1 ? d : { x: -1, y: 0 }); break;
                case "ArrowRight": setDir(d => d.x === -1 ? d : { x: 1, y: 0 }); break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [status, setDir, setStatus]);

    // 2. Тоглоомын гол цикл (Game Loop)
    // currentSpeed өөрчлөгдөх бүрт (level ахихад) setInterval дахин тохируулагдана
    useEffect(() => {
        if (status !== 'PLAYING') return;

        const interval = setInterval(() => {
            moveSnake();
        }, currentSpeed);

        return () => clearInterval(interval);
    }, [moveSnake, currentSpeed, status]);

    // 3. Canvas дээр зураглал хийх (Rendering)
    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        // Арын дэвсгэр цэвэрлэх
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Могой зурах
        ctx.fillStyle = "#10b981"; // Emerald Green
        snake.forEach((part, index) => {
            // Толгойн хэсэг арай өөр өнгөтэй байж болно
            if (index === 0) ctx.fillStyle = "#34d399";
            else ctx.fillStyle = "#10b981";

            ctx.beginPath();
            // Дугуйрсан ирмэгтэй дөрвөлжин
            ctx.roundRect(
                part.x * GRID_SIZE,
                part.y * GRID_SIZE,
                GRID_SIZE - 2,
                GRID_SIZE - 2,
                4
            );
            ctx.fill();
        });

        // Хоол зурах (Гэрэлтсэн эффекттэй)
        ctx.fillStyle = "#f43f5e"; // Rose Red
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#f43f5e";
        ctx.beginPath();
        ctx.arc(
            food.x * GRID_SIZE + GRID_SIZE / 2,
            food.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 2 - 2,
            0, Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0; // Бусад дүрсүүдэд нөлөөлөхөөс сэргийлнэ
    }, [snake, food]);

    return (
        <div className="flex flex-col items-center gap-6 p-4">
            {/* Мэдээллийн самбар */}
            <div className="flex justify-between w-full max-w-[400px] px-6 py-3 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-md shadow-xl">
                <div className="flex gap-6 font-mono text-sm">
                    <div className="flex flex-col">
                        <span className="text-slate-500">SCORE</span>
                        <span className="text-white font-bold text-lg">{score}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-700 pl-6">
                        <span className="text-slate-500">LEVEL</span>
                        <span className="text-cyan-400 font-bold text-lg">{level}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-700 pl-6">
                        <span className="text-rose-500 text-[10px] font-black italic">HIGH SCORE</span>
                        <span className="text-white font-bold text-lg">{highScore}</span>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="text-emerald-500 font-black tracking-widest text-xl italic">SNAKE</span>
                </div>
            </div>

            {/* Тоглоомын талбар */}
            <div className="relative group transition-all duration-500 ease-in-out">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="rounded-2xl border-8 border-slate-800 shadow-[0_0_60px_-15px_rgba(16,185,129,0.2)]"
                />

                {/* Эхлэх дэлгэц */}
                {status === 'IDLE' && (
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center backdrop-blur-[3px] rounded-lg">
                        <div className="text-center animate-bounce">
                            <p className="text-white font-mono tracking-tighter text-xl">PRESS ANY ARROW KEY</p>
                            <p className="text-emerald-400 font-mono text-sm">TO START MISSION</p>
                        </div>
                    </div>
                )}

                {/* Game Over дэлгэц */}
                {status === 'GAME_OVER' && (
                    <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-8 text-center rounded-lg animate-in fade-in zoom-in duration-300">
                        <h2 className="text-5xl font-black text-rose-500 mb-2 tracking-tighter">MISSION FAILED</h2>
                        <p className="text-slate-400 font-mono mb-8 uppercase tracking-widest text-sm">Final Score: {score} | Level: {level}</p>
                        <button
                            onClick={resetGame}
                            className="group relative px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10">REDEPLOY SNAKE</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </div>
                )}
            </div>

            {/* Удирдлагын тусламж */}
            <div className="flex gap-4 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                <div className="grid grid-cols-3 gap-1">
                    <div /> <kbd className="bg-slate-800 p-2 rounded border border-slate-600 text-white text-xs">▲</kbd> <div />
                    <kbd className="bg-slate-800 p-2 rounded border border-slate-600 text-white text-xs">◀</kbd>
                    <kbd className="bg-slate-800 p-2 rounded border border-slate-600 text-white text-xs">▼</kbd>
                    <kbd className="bg-slate-800 p-2 rounded border border-slate-600 text-white text-xs">▶</kbd>
                </div>
                <div className="flex flex-col justify-center text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                    <span>Navigation</span>
                    <span>Controls</span>
                </div>
            </div>
        </div>
    );
};