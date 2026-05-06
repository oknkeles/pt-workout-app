import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Flame, Timer, RefreshCw, Heart, NotebookPen, RotateCcw,
  Play, ChevronDown, Trash2,
} from 'lucide-react';
import type { WorkoutType, Exercise } from '../types';
import { ExerciseCard } from './ExerciseCard';
import { AddExerciseModal } from './AddExerciseModal';
import { EditExerciseModal } from './EditExerciseModal';
import { RestTimer } from './RestTimer';
import { DaySetup } from './DaySetup';
import { SuggestedExercises, QuickAddAll } from './SuggestedExercises';
import { WorkoutSummary } from './WorkoutSummary';
import { WorkoutExecution } from './WorkoutExecution';
import { useWorkoutStore } from '../store/workoutStore';

const DAY_FULL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const TYPE_CONFIG: Record<
  Exclude<WorkoutType, 'UNSET'>,
  { label: string; sub: string; color: string; gradient: string; bar: string; btnBg: string }
> = {
  PULL: {
    label: 'PULL',
    sub: 'Çekiş',
    color: 'text-blue-400',
    gradient: 'from-blue-900/40 to-transparent',
    bar: 'bg-blue-500',
    btnBg: 'bg-blue-600 hover:bg-blue-500',
  },
  PUSH: {
    label: 'PUSH',
    sub: 'İtiş',
    color: 'text-orange-400',
    gradient: 'from-orange-900/40 to-transparent',
    bar: 'bg-orange-500',
    btnBg: 'bg-orange-600 hover:bg-orange-500',
  },
  LEGS: {
    label: 'LEGS',
    sub: 'Bacak',
    color: 'text-green-400',
    gradient: 'from-green-900/40 to-transparent',
    bar: 'bg-green-500',
    btnBg: 'bg-green-600 hover:bg-green-500',
  },
  REST: {
    label: 'DİNLENME',
    sub: '',
    color: 'text-gray-400',
    gradient: 'from-gray-900/40 to-transparent',
    bar: 'bg-gray-500',
    btnBg: 'bg-gray-600 hover:bg-gray-500',
  },
};

interface Props {
  dayIndex: number;
}

export function DayView({ dayIndex }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [summary, setSummary] = useState<{
    durationMs: number;
    totalSets: number;
    completedSets: number;
    exerciseCount: number;
  } | null>(null);

  const {
    schedule,
    setCompletion,
    activeWorkout,
    setDayType,
    addExercise,
    removeExercise,
    moveExercise,
    updateExercise,
    setDayNotes,
    setCardioMinutes,
    toggleSet,
    resetDayCompletion,
    autoResetIfNewDay,
    startWorkout,
    endWorkout,
    clearDay,
  } = useWorkoutStore();

  useEffect(() => {
    autoResetIfNewDay();
  }, [autoResetIfNewDay]);

  const day = schedule[dayIndex];
  const isActive = activeWorkout?.dayIndex === dayIndex;

  const stats = useMemo(() => {
    const totalSets = day.exercises.reduce((sum, e) => sum + e.sets, 0);
    let completed = 0;
    day.exercises.forEach((e) => {
      const arr = setCompletion[`${dayIndex}:${e.id}`] ?? [];
      completed += arr.filter(Boolean).length;
    });
    const estMinutes = totalSets * 3 + (day.cardioMinutes ?? 0);
    return {
      totalSets,
      completed,
      estMinutes,
      progress: totalSets > 0 ? completed / totalSets : 0,
    };
  }, [day, setCompletion, dayIndex]);

  // ───── UNSET: choose workout type ─────
  if (day.type === 'UNSET') {
    return <DaySetup dayIndex={dayIndex} onChoose={(type) => setDayType(dayIndex, type)} />;
  }

  // ───── REST ─────
  if (day.type === 'REST') {
    return (
      <motion.div
        key="rest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-24 -mt-4"
      >
        <div className="text-7xl mb-5">😴</div>
        <h2 className="text-2xl font-bold text-gray-300 mb-1">{DAY_FULL[dayIndex]}</h2>
        <p className="text-gray-500 text-base">Bugün dinlenme günü</p>
        <p className="text-gray-600 text-sm mt-3 max-w-xs leading-relaxed">
          Kasların büyür, gelişir. Yeterince uyu ve kaliteli protein al.
        </p>
        <button
          onClick={() => setDayType(dayIndex, 'UNSET')}
          className="mt-6 text-xs text-gray-500 hover:text-gray-300 underline"
        >
          Türü değiştir
        </button>
      </motion.div>
    );
  }

  const cfg = TYPE_CONFIG[day.type];

  const completeExercise = (exerciseId: string, totalSets: number) => {
    const completed = setCompletion[`${dayIndex}:${exerciseId}`] ?? [];
    for (let i = 0; i < totalSets; i++) {
      if (!(completed[i] ?? false)) {
        toggleSet(dayIndex, exerciseId, i, totalSets);
      }
    }
  };

  const finishWorkout = () => {
    if (!activeWorkout) return;
    const completedNow = day.exercises.reduce((sum, e) => {
      const arr = setCompletion[`${dayIndex}:${e.id}`] ?? [];
      return sum + arr.filter(Boolean).length;
    }, 0);
    setSummary({
      durationMs: Date.now() - activeWorkout.startedAt,
      totalSets: stats.totalSets,
      completedSets: completedNow,
      exerciseCount: day.exercises.length,
    });
    endWorkout();
  };

  return (
    <>
      {/* Full-screen workout execution overlay */}
      <AnimatePresence>
        {isActive && (
          <WorkoutExecution
            exercises={day.exercises}
            onCompleteExercise={completeExercise}
            onFinish={finishWorkout}
            onAbort={() => endWorkout()}
          />
        )}
      </AnimatePresence>

      <motion.div
        key={dayIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-y-auto pb-32"
      >

        {/* Header */}
        <div className={`bg-gradient-to-b ${cfg.gradient} px-4 pt-2 pb-4`}>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs text-gray-500">{DAY_FULL[dayIndex]}</p>
                <button
                  onClick={() => {
                    if (
                      day.exercises.length === 0 ||
                      confirm('Türü değiştirirsen mevcut hareketler kalır. Devam?')
                    ) {
                      setDayType(dayIndex, 'UNSET');
                    }
                  }}
                  className="text-[10px] text-gray-600 hover:text-gray-300 underline"
                >
                  değiştir
                </button>
              </div>
              <h2 className={`text-3xl font-black ${cfg.color} leading-none`}>
                {cfg.label}
              </h2>
              {cfg.sub && <p className="text-sm text-gray-500 mt-0.5">{cfg.sub}</p>}
            </div>

            {stats.totalSets > 0 && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">İlerleme</p>
                <p className="text-2xl font-black text-white">
                  {stats.completed}
                  <span className="text-gray-600 text-base">/{stats.totalSets}</span>
                </p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {stats.totalSets > 0 && (
            <div className="mt-3 h-2 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${cfg.bar}`}
                animate={{ width: `${stats.progress * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Flame size={12} className="text-orange-400" />
              {day.exercises.length} hareket
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw size={12} className="text-blue-400" />
              {stats.totalSets} set
            </span>
            <span className="flex items-center gap-1">
              <Timer size={12} className="text-green-400" />
              ~{stats.estMinutes}dk
            </span>
            <span className="flex items-center gap-1">
              <Heart size={12} className="text-pink-400" />
              {day.cardioMinutes}dk kardiyo
            </span>
          </div>

          {/* Action chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-gray-300"
            >
              <NotebookPen size={11} />
              {day.notes ? 'Not' : 'Not Ekle'}
            </button>
            {stats.completed > 0 && !isActive && (
              <button
                onClick={() => {
                  if (confirm('Set takibini sıfırla?')) resetDayCompletion(dayIndex);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-gray-300"
              >
                <RotateCcw size={11} /> Sıfırla
              </button>
            )}
            <button
              onClick={() => {
                const v = prompt('Kardiyo dakikası:', String(day.cardioMinutes));
                if (v != null) setCardioMinutes(dayIndex, Math.max(0, Number(v) || 0));
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-gray-300"
            >
              <Heart size={11} /> Kardiyo
            </button>
            {!isActive && (
              <button
                onClick={() => {
                  if (confirm('Bu günü temizle ve baştan kur?')) clearDay(dayIndex);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-[11px] text-red-400"
              >
                <Trash2 size={11} /> Temizle
              </button>
            )}
          </div>

          {/* Notes section */}
          <AnimatePresence>
            {showNotes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <textarea
                  value={day.notes ?? ''}
                  onChange={(e) => setDayNotes(dayIndex, e.target.value)}
                  rows={3}
                  placeholder="Bu güne özel notlar (örn. ağırlıklar, hedefler...)"
                  className="w-full mt-3 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50 resize-none"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick-add all suggestions when day is empty */}
        {day.exercises.length === 0 && (
          <div className="px-4">
            <QuickAddAll
              type={day.type}
              currentIds={[]}
              onAddAll={(exs) => exs.forEach((e) => addExercise(dayIndex, e))}
            />
          </div>
        )}

        {/* Exercise list */}
        <div className="px-4 space-y-3 mt-3">
          <AnimatePresence>
            {day.exercises.map((exercise, i) => {
              const completed = setCompletion[`${dayIndex}:${exercise.id}`] ?? [];
              return (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  index={i}
                  completedSets={completed}
                  isFirst={i === 0}
                  isLast={i === day.exercises.length - 1}
                  isWorkoutActive={isActive}
                  onToggleSet={(setIdx) => {
                    if (!isActive) {
                      alert('Set işaretlemek için "Programa Başla" butonuna bas.');
                      return;
                    }
                    toggleSet(dayIndex, exercise.id, setIdx, exercise.sets);
                    const wasDone = completed[setIdx] ?? false;
                    if (!wasDone) setRestSeconds(exercise.restSeconds);
                  }}
                  onRemove={() => removeExercise(dayIndex, exercise.id)}
                  onEdit={() => setEditing(exercise)}
                  onMoveUp={() => moveExercise(dayIndex, i, i - 1)}
                  onMoveDown={() => moveExercise(dayIndex, i, i + 1)}
                />
              );
            })}
          </AnimatePresence>

          {day.exercises.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-3xl mb-2">🏋️</p>
              <p className="text-sm">Aşağıdan öneri seç ya da kendi hareketini ekle</p>
              <ChevronDown size={20} className="mx-auto mt-3 text-gray-700 animate-bounce" />
            </div>
          )}
        </div>

        {/* Suggested exercises */}
        <SuggestedExercises
          type={day.type}
          currentIds={day.exercises.map((e) => e.id)}
          onAdd={(ex) => addExercise(dayIndex, ex)}
        />
      </motion.div>

      {/* Floating bottom CTA — Start / Add */}
      <div
        className="fixed left-0 right-0 flex justify-center px-4 z-30 pointer-events-none"
        style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="pointer-events-auto flex items-center gap-2">
          {!isActive && day.exercises.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => startWorkout(dayIndex)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-full text-white font-bold shadow-xl shadow-black/40 transition-colors ${cfg.btnBg}`}
            >
              <Play size={17} fill="white" />
              Programa Başla
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-3.5 rounded-full font-bold shadow-xl shadow-black/40 transition-colors border border-white/20 bg-[#1a1a2e]/90 backdrop-blur text-white hover:bg-white/10"
          >
            <Plus size={17} strokeWidth={2.5} />
            {day.exercises.length === 0 ? 'Hareket Ekle' : 'Hareket Ekle'}
          </motion.button>
        </div>
      </div>

      <RestTimer seconds={restSeconds} onClose={() => setRestSeconds(null)} />

      <AddExerciseModal
        open={addOpen}
        dayExerciseIds={day.exercises.map((e) => e.id)}
        onAdd={(exercise) => addExercise(dayIndex, exercise)}
        onClose={() => setAddOpen(false)}
      />

      <EditExerciseModal
        open={!!editing}
        exercise={editing}
        onSave={(updates) => editing && updateExercise(dayIndex, editing.id, updates)}
        onClose={() => setEditing(null)}
      />

      <WorkoutSummary
        open={!!summary}
        durationMs={summary?.durationMs ?? 0}
        totalSets={summary?.totalSets ?? 0}
        completedSets={summary?.completedSets ?? 0}
        exerciseCount={summary?.exerciseCount ?? 0}
        onClose={() => setSummary(null)}
      />
    </>
  );
}
