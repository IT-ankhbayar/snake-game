"use client";
import React, { useEffect, useRef } from 'react';
import { useSnakeLogic } from '../hooks/useSnakeLogic';
import { CANVAS_SIZE, GRID_SIZE } from '../utils/constants';

export const SnakeGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // 1. Гарны даралтыг мэдрэх (Компьютерт зориулсан)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status === 'IDLE' && e.key.includes("Arrow")) setStatus('PLAYING');

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

    // 2. Тоглоомын цикл
    useEffect(() => {
        if (status !== 'PLAYING') return;
        const interval = setInterval(moveSnake, currentSpeed);
        return () => clearInterval(interval);
    }, [moveSnake, currentSpeed, status]);

    // 3. Зураглал (Canvas Rendering)
    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Могой зурах
        snake.forEach((p, i) => {
            ctx.fillStyle = i === 0 ? "#34d399" : "#10b981";
            ctx.beginPath();
            ctx.roundRect(p.x * GRID_SIZE, p.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2, 4);
            ctx.fill();
        });

        // Хоол зурах
        ctx.fillStyle = "#f43f5e";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#f43f5e";
        ctx.beginPath();
        ctx.arc(food.x * GRID_SIZE + GRID_SIZE / 2, food.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }, [snake, food]);

    // Утасны удирдлагын функц
    const handleMobileControl = (x: number, y: number) => {
        if (status === 'IDLE') setStatus('PLAYING');
        setDir(currentDir => {
            // Буцаж эргэхээс сэргийлэх логик
            if (x !== 0 && currentDir.x === -x) return currentDir;
            if (y !== 0 && currentDir.y === -y) return currentDir;
            return { x, y };
        });
    };

    return (
        <div className="flex flex-col items-center gap-6 p-4 max-w-full">
            {/* Мэдээллийн самбар */}
            <div className="flex justify-between w-full max-w-[400px] px-4 py-3 bg-slate-800/80 rounded-2xl border border-slate-700 backdrop-blur-md">
                <div className="flex gap-4 font-mono text-xs sm:text-sm">
                    <div className="flex flex-col">
                        <span className="text-slate-500">SCORE</span>
                        <span className="text-white font-bold">{score}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-700 pl-4">
                        <span className="text-rose-500 font-black">HighScore</span>
                        <span className="text-white font-bold">{highScore}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-700 pl-4">
                        <span className="text-slate-500">LVL</span>
                        <span className="text-cyan-400 font-bold">{level}</span>
                    </div>
                </div>
            </div>

            {/* Тоглоомын талбар */}
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="rounded-2xl border-4 border-slate-800 shadow-2xl max-w-full h-auto"
                />

                {status === 'IDLE' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px] rounded-2xl">
                        <p className="text-white font-bold animate-pulse text-center px-4">Arrow товч дээр дарж эхлүүлнэ үү</p>
                    </div>
                )}

                {status === 'GAME_OVER' && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center rounded-2xl">
                        <h2 className="text-3xl font-black text-rose-500 mb-4 tracking-tighter">GAME OVER</h2>
                        <button
                            onClick={resetGame}
                            className="px-8 py-3 bg-emerald-500 text-slate-950 font-black rounded-full active:scale-95 transition-transform"
                        >
                            ДАХИН ЭХЛЭХ
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Controls (Утасны удирдлага) */}
            <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
                <div />
                <button
                    className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl active:bg-emerald-500 active:scale-90 transition-all shadow-xl border border-slate-700"
                    onClick={() => handleMobileControl(0, -1)}
                >
                    <span className="text-white">↑</span>
                </button>
                <div />

                <button
                    className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl active:bg-emerald-500 active:scale-90 transition-all shadow-xl border border-slate-700"
                    onClick={() => handleMobileControl(-1, 0)}
                >
                    <span className="text-white">←</span>
                </button>
                <button
                    className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl active:bg-emerald-500 active:scale-90 transition-all shadow-xl border border-slate-700"
                    onClick={() => handleMobileControl(0, 1)}
                >
                    <span className="text-white">↓</span>
                </button>
                <button
                    className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl active:bg-emerald-500 active:scale-90 transition-all shadow-xl border border-slate-700"
                    onClick={() => handleMobileControl(1, 0)}
                >
                    <span className="text-white">→</span>
                </button>
            </div>

            <p className="hidden md:block text-slate-500 text-xs font-mono uppercase tracking-widest mt-4">
                Use arrow keys to control
            </p>
        </div>
    );
};