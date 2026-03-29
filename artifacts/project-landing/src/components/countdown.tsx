import { useState, useEffect } from 'react';

export function Countdown() {
  // Set a target date 3 days from now for urgency
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-2 sm:gap-4 text-center">
      <TimeUnit value={format(timeLeft.days)} label="Days" />
      <span className="text-2xl font-bold text-primary animate-pulse">:</span>
      <TimeUnit value={format(timeLeft.hours)} label="Hours" />
      <span className="text-2xl font-bold text-primary animate-pulse">:</span>
      <TimeUnit value={format(timeLeft.minutes)} label="Mins" />
      <span className="text-2xl font-bold text-primary animate-pulse">:</span>
      <TimeUnit value={format(timeLeft.seconds)} label="Secs" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-background/50 backdrop-blur-sm border border-primary/20 rounded-lg p-3 sm:p-4 min-w-[60px] sm:min-w-[70px] shadow-[0_0_15px_rgba(249,115,22,0.15)]">
        <span className="text-2xl sm:text-4xl font-display font-bold text-white tracking-wider">{value}</span>
      </div>
      <span className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium uppercase tracking-widest">{label}</span>
    </div>
  );
}
