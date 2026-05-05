import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Dumbbell, Check, Clock } from 'lucide-react';
import type { Exercise } from '../types';

type Phase = 'exercise' | 'rest';

interface Props {
  exercises: Exercise[];
  onCompleteExercise: (exerciseId: string, totalSets: number) => void;
  onFinish: () => void;
  onAbort: () => void;
}

export function WorkoutExecution({ exercises, onCompleteExercise, onFinish, onAbort }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('exercise');
  const [restRemaining, setRestRemaining] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [imgError, setImgError] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  const exercise = exercises[currentIndex];
  const isLast = currentIndex === exercises.length - 1;

  useEffect(() => { setImgError(false); }, [currentIndex]);

  const goToNext = () => {
    if (isLast) {
      onFinish();
    } else {
      setCurrentIndex((i) => i + 1);
      setPhase('exercise');
    }
  };

  useEffect(() => {
    if (phase !== 'rest') return;
    if (restRemaining <= 0) {
      try {
        if (!audioRef.current) audioRef.current = new AudioContext();
        const ctx = audioRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch {}
      const t = setTimeout(goToNext, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRestRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, restRemaining]);

  const handleCompleteExercise = () => {
    onCompleteExercise(exercise.id, exercise.sets);
    if (isLast) {
      onFinish();
    } else {
      const secs = exercise.restSeconds || 60;
      setRestTotal(secs);
      setRestRemaining(secs);
      setPhase('rest');
    }
  };

  const skipRest = () => {
    goToNext();
  };

  if (!exercise) return null;

  const restProgress = restTotal > 0 ? restRemaining / restTotal : 0;
  const min = Math.floor(restRemaining / 60);
  const sec = restRemaining % 60;
  const circumference = 2 * Math.PI * 44;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed inset-0 z-50 bg-[#0d0d18] flex flex-col max-w-lg mx-auto overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-8 pb-2 flex-shrink-0">
        <div className="text-xs text-gray-500 font-semibold tracking-wider uppercase">
          {currentIndex + 1} / {exercises.length}
        </div>
        <button
          onClick={onAbort}
          className="p-2 rounded-xl hover:bg-white/8 text-gray-400"
        >
          <X size={20} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'exercise' ? (
          <motion.div
            key={`ex-${currentIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Image area */}
            <div className="relative flex-shrink-0">
              {!imgError && exercise.imageUrl ? (
                <img
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  onError={() => setImgError(true)}
                  className="w-full h-64 object-cover bg-slate-800"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <Dumbbell size={64} className="text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d18] via-[#0d0d18]/10 to-transparent" />

              {/* Progress dots */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {exercises.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'w-5 h-1.5 bg-white'
                        : i < currentIndex
                        ? 'w-1.5 h-1.5 bg-green-400'
                        : 'w-1.5 h-1.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Exercise details */}
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-28">
              <h2 className="text-3xl font-black text-white leading-tight">{exercise.name}</h2>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-sm font-bold text-white">
                  {exercise.sets} SET
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-sm font-bold text-white">
                  {exercise.reps} TEKRAR
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-sm font-bold text-white flex items-center gap-1.5">
                  <Clock size={13} />
                  {exercise.restSeconds}sn dinlenme
                </span>
              </div>

              {exercise.muscles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {exercise.muscles.map((m) => (
                    <span key={m} className="px-2 py-0.5 bg-white/6 rounded text-xs text-gray-400">
                      {m}
                    </span>
                  ))}
                </div>
              )}

              {exercise.notes && (
                <p className="mt-4 text-sm text-gray-400 leading-relaxed">{exercise.notes}</p>
              )}

              {exercise.tips && exercise.tips.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-yellow-500 font-bold">İpuçları</p>
                  {exercise.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="text-yellow-400 mt-0.5 flex-shrink-0">•</span>
                      {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA button */}
            <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 z-10 max-w-lg mx-auto bg-gradient-to-t from-[#0d0d18] to-transparent">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCompleteExercise}
                className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-2xl flex items-center justify-center gap-3 ${
                  isLast
                    ? 'bg-gradient-to-r from-green-600 to-emerald-500 shadow-green-900/50'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-900/50'
                }`}
              >
                <Check size={22} />
                {isLast ? 'Antrenmanı Tamamla' : `${currentIndex + 1}. Hareketi Bitir`}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="rest"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="flex-1 flex flex-col items-center justify-center px-5 text-center pb-16"
          >
            <div className="text-6xl mb-3">💪</div>
            <h2 className="text-2xl font-black text-white mb-1">Harika iş!</h2>
            <p className="text-gray-500 text-sm mb-10">
              {currentIndex + 1}. hareket tamamlandı — dinlen
            </p>

            {/* Circular countdown */}
            <div className="relative w-52 h-52 mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="44"
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.07"
                  strokeWidth="7"
                />
                <circle
                  cx="50" cy="50" r="44"
                  fill="none"
                  stroke="rgb(59,130,246)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${circumference * (1 - restProgress)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white tabular-nums">
                  {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
                </span>
                <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">dinlenme</span>
              </div>
            </div>

            {exercises[currentIndex + 1] && (
              <p className="text-sm text-gray-500 mb-6">
                Sonraki:{' '}
                <span className="text-gray-300 font-semibold">
                  {exercises[currentIndex + 1].name}
                </span>
              </p>
            )}

            <button
              onClick={skipRest}
              className="flex items-center gap-2 px-7 py-3 bg-white/10 hover:bg-white/15 rounded-2xl text-white font-bold transition-colors"
            >
              Geç
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
