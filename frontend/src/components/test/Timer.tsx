"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
    startedAt: string;
    maxTime?: number;
    onTimeUp?: () => void;
    className?: string;
}

export default function Timer({
    startedAt,
    maxTime = 1200, // 20 minutes
    onTimeUp,
    className,
}: TimerProps) {
    const [elapsed, setElapsed] = useState(0);
    const hasCalledTimeUp = useRef(false);

    useEffect(() => {
        hasCalledTimeUp.current = false;

        const start = new Date(startedAt).getTime();

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - start) / 1000);

            if (elapsedSeconds >= maxTime) {
                setElapsed(maxTime);
                clearInterval(interval);

                if (onTimeUp && !hasCalledTimeUp.current) {
                    hasCalledTimeUp.current = true;
                    onTimeUp();
                }
            } else {
                setElapsed(elapsedSeconds);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startedAt, maxTime, onTimeUp]);

    const remaining = Math.max(0, maxTime - elapsed);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    const isLow = remaining < 60;
    const isCritical = remaining < 30;

    return (
        <div
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg",
                isCritical
                    ? "bg-error-100 text-error-700 animate-pulse"
                    : isLow
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700",
                className,
            )}
        >
            <Clock className="w-5 h-5" />
            <span>
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
            </span>
        </div>
    );
}
