import { motion } from 'framer-motion';
import type { WorkoutType } from '../types';

const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const TYPE_CONFIG: Record<WorkoutType, { label: string; color: string; bg: string; icon: string; ring: string }> = {
  PULL: { label: 'PULL', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '💪', ring: 'ring-blue-500/60' },
  PUSH: { label: 'PUSH', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '🔥', ring: 'ring-orange-500/60' },
  LEGS: { label: 'LEGS', color: 'text-green-400', bg: 'bg-green-500/20', icon: '🦵', ring: 'ring-green-500/60' },
  REST: { label: 'REST', color: 'text-gray-400', bg: 'bg-gray-500/15', icon: '😴', ring: 'ring-gray-500/40' },
  UNSET: { label: 'PLAN', color: 'text-gray-500', bg: 'bg-white/5', icon: '＋', ring: 'ring-white/30' },
};

interface Props {
  schedule: Record<number, { type: WorkoutType; exercises: { sets: number; id: string }[]; cardioMinutes: number }>;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  setCompletion: Record<string, boolean[]>;
  activeWorkoutDay: number | null;
}

export function WeeklyCalendar({
  schedule,
  selectedDay,
  onSelectDay,
  setCompletion,
  activeWorkoutDay,
}: Props) {
  const today = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <div className="px-4 pb-3">
      <div className="grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((label, i) => {
          const day = schedule[i];
          const cfg = TYPE_CONFIG[day.type];
          const isSelected = selectedDay === i;
          const isToday = today === i;
          const isActive = activeWorkoutDay === i;

          let totalSets = 0;
          let completedSets = 0;
          day.exercises.forEach((e) => {
            totalSets += e.sets;
            const arr = setCompletion[`${i}:${e.id}`] ?? [];
            completedSets += arr.filter(Boolean).length;
          });
          const allDone = totalSets > 0 && completedSets === totalSets;

          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelectDay(i)}
              className={`
                relative flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all
                ${
                  isSelected
                    ? `${cfg.bg} border-transparent ring-2 ${cfg.ring}`
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
              `}
            >
              <span className={`text-[10px] font-medium mb-0.5 ${isSelected ? cfg.color : 'text-gray-500'}`}>
                {label}
              </span>
              <span className="text-lg leading-none my-0.5">{cfg.icon}</span>
              <span className={`text-[8px] font-bold tracking-wider ${isSelected ? cfg.color : 'text-gray-600'}`}>
                {cfg.label}
              </span>

              {isToday && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full ring-2 ring-[#0d0d18]" />
              )}
              {allDone && (
                <span className="absolute -bottom-0.5 right-1 w-1.5 h-1.5 bg-green-500 rounded-full" />
              )}
              {isActive && (
                <span className="absolute -top-1 -left-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-[#0d0d18]"></span>
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
