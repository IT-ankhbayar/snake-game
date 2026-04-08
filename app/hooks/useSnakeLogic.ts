import { useState, useEffect, useCallback, useMemo } from 'react';
import { Point, GameStatus } from '../types';
import {
    GRID_SIZE,
    CANVAS_SIZE,
    INITIAL_SNAKE,
    INITIAL_DIRECTION
} from '../utils/constants';

export const useSnakeLogic = () => {
    // --- State-үүд ---
    const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
    const [food, setFood] = useState<Point>({ x: 15, y: 15 });
    const [dir, setDir] = useState<Point>(INITIAL_DIRECTION);
    const [status, setStatus] = useState<GameStatus>('IDLE');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    // --- Туслах функцүүд ---

    // Санамсаргүй байрлалд хоол үүсгэх
    const createFood = useCallback((): Point => {
        return {
            x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        };
    }, []);

    // Тоглоомыг шинээр эхлүүлэх
    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setDir(INITIAL_DIRECTION);
        setScore(0);
        setStatus('IDLE');
        setFood(createFood());
    };

    // --- Difficulty & Persistence ---

    // 1. High Score-г LocalStorage-оос унших (Зөвхөн эхний удаа)
    useEffect(() => {
        const saved = localStorage.getItem('snakeHighScore');
        if (saved) setHighScore(parseInt(saved));
    }, []);

    // 2. Level тооцоолох (50 оноо тутамд 1 level ахина)
    const level = useMemo(() => Math.floor(score / 50) + 1, [score]);

    // 3. Хурд тооцоолох (Level ахих тусам хурдасна, доод хязгаар 50ms)
    const currentSpeed = useMemo(() => {
        const speedBoost = (level - 1) * 10;
        const newSpeed = 130 - speedBoost;
        return newSpeed > 50 ? newSpeed : 50;
    }, [level]);

    // --- Гол Логик: Могойн хөдөлгөөн ---
    const moveSnake = useCallback(() => {
        if (status !== 'PLAYING') return;

        setSnake((prevSnake) => {
            // Шинэ толгойн байрлал
            const head = {
                x: prevSnake[0].x + dir.x,
                y: prevSnake[0].y + dir.y
            };

            // Мөргөлдөөн шалгах (Хана)
            const hitWall =
                head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE ||
                head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE;

            // Мөргөлдөөн шалгах (Өөрийгөө)
            const hitSelf = prevSnake.some(s => s.x === head.x && s.y === head.y);

            if (hitWall || hitSelf) {
                setStatus('GAME_OVER');


                // High Score шинэчлэх
                if (score > highScore) {
                    setHighScore(score);
                    localStorage.setItem('snakeHighScore', score.toString());
                }
                return prevSnake;
            }

            const newSnake = [head, ...prevSnake];

            // Хоол идсэн эсэх
            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                setFood(createFood());

            } else {
                // Хоол идэхгүй бол сүүлийг нь хасаж хөдөлгөөн үүсгэнэ
                newSnake.pop();
            }

            return newSnake;
        });
    }, [dir, food, status, createFood, score, highScore]);

    return {
        snake,
        food,
        dir,
        setDir,
        status,
        setStatus,
        score,
        highScore,
        level,
        currentSpeed,
        resetGame,
        moveSnake
    };
};