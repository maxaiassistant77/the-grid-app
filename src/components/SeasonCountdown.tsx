'use client';

import { useEffect, useState } from 'react';

interface SeasonCountdownProps {
  endDate: string;
}

export function SeasonCountdown({ endDate }: SeasonCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endDate + 'T23:59:59');
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  if (!timeLeft) return null;

  return (
    <p className="text-sm text-[#00d9a6] mt-1 font-medium">
      Season ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
    </p>
  );
}
