import { motion } from 'framer-motion';
import { Plus, Check, Sparkles } from 'lucide-react';
import type { WorkoutType, Exercise } from '../types';
import { EXERCISE_LIBRARY, SUGGESTED_EXERCISES } from '../data/exercises';

interface Props {
  type: WorkoutType;
  currentIds: string[];
  onAdd: (ex: Exercise) => void;
}

export function SuggestedExercises({ type, currentIds, onAdd }: Props) {
  if (type === 'REST' || type === 'UNSET') return null;

  const ids = SUGGESTED_EXERCISES[type] ?? [];
  const remaining = ids
    .map((id) => EXERCISE_LIBRARY.find((e) => e.id === id))
    .filter((e): e is Exercise => !!e && !currentIds.includes(e.id));

  if (remaining.length === 0) return null;

  return (
    <div className="px-4 mt-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={13} className="text-purple-400" />
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-purple-300">
          Önerilen Hareketler
        </h3>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {remaining.map((ex, i) => (
          <motion.button
            key={ex.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onAdd(ex)}
            className="shrink-0 w-32 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl overflow-hidden text-left transition-colors group"
          >
            <div className="relative h-20 bg-slate-800">
              {ex.imageUrl ? (
                <img
                  src={ex.imageUrl}
                  alt={ex.name}
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
                  💪
                </div>
              )}
              <div className="absolute top-1 right-1 p-1 rounded-lg bg-blue-500 text-white shadow group-hover:bg-blue-400">
                <Plus size={12} />
              </div>
            </div>
            <div className="p-2">
              <p className="text-[11px] font-bold text-white leading-tight line-clamp-2">
                {ex.name}
              </p>
              <p className="text-[9px] text-gray-500 mt-0.5 truncate">
                {ex.sets}×{ex.reps}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export function QuickAddAll({
  type,
  currentIds,
  onAddAll,
}: {
  type: WorkoutType;
  currentIds: string[];
  onAddAll: (exercises: Exercise[]) => void;
}) {
  if (type === 'REST' || type === 'UNSET') return null;
  const ids = SUGGESTED_EXERCISES[type] ?? [];
  const remaining = ids
    .map((id) => EXERCISE_LIBRARY.find((e) => e.id === id))
    .filter((e): e is Exercise => !!e && !currentIds.includes(e.id));

  if (remaining.length === 0 || currentIds.length > 0) return null;

  return (
    <button
      onClick={() => onAddAll(remaining.slice(0, 5))}
      className="w-full flex items-center justify-center gap-2 py-2.5 mt-3 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-xl text-sm font-medium text-purple-300 transition-colors"
    >
      <Check size={14} />
      Önerilen 5 hareketi ekle
    </button>
  );
}
