import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trash2, ChevronDown, ChevronUp, Lightbulb, Clock, Dumbbell, Pencil, Check,
} from 'lucide-react';
import type { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  index: number;
  completedSets: boolean[];
  isWorkoutActive: boolean;
  onToggleSet: (setIndex: number) => void;
  onRemove: () => void;
  onEdit: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function ExerciseCard({
  exercise,
  index,
  completedSets,
  isWorkoutActive,
  onToggleSet,
  onRemove,
  onEdit,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const completedCount = completedSets.filter(Boolean).length;
  const allDone = completedCount === exercise.sets;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ delay: Math.min(index * 0.04, 0.2) }}
      className={`bg-[#1a1a2e] border rounded-2xl overflow-hidden transition-colors ${
        allDone ? 'border-green-500/40' : 'border-white/8'
      }`}
    >
      {/* Image — compact height */}
      <div className="relative">
        {!imgError && exercise.imageUrl ? (
          <img
            src={exercise.imageUrl}
            alt={exercise.name}
            onError={() => setImgError(true)}
            className="w-full h-32 object-cover bg-slate-800"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <Dumbbell size={36} className="text-white/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1">
          <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[10px] font-bold text-white">
            {exercise.sets} SET
          </span>
          <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[10px] font-bold text-white">
            {exercise.reps} TEKRAR
          </span>
          {allDone && (
            <span className="px-2 py-0.5 rounded-full bg-green-500 text-[10px] font-bold text-white flex items-center gap-1">
              <Check size={9} /> BİTTİ
            </span>
          )}
        </div>

        {/* Title overlay at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
          <h3 className="text-white font-bold text-base leading-tight drop-shadow">
            {exercise.name}
          </h3>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {exercise.muscles.slice(0, 3).map((m) => (
              <span key={m} className="px-1.5 py-0.5 bg-black/50 backdrop-blur rounded text-[9px] text-gray-300">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action row — always visible, outside the image */}
      <div className="flex gap-2 px-3 pt-2.5 pb-2 border-b border-white/6">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/8 hover:bg-blue-500/25 text-gray-300 hover:text-blue-300 text-[11px] font-semibold transition-colors"
        >
          <Pencil size={12} />
          Düzenle
        </button>
        <button
          onClick={onRemove}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/8 hover:bg-red-500/25 text-gray-300 hover:text-red-300 text-[11px] font-semibold transition-colors"
        >
          <Trash2 size={12} />
          Sil
        </button>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5 space-y-2.5">
        {/* Set tracking */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              Set Takibi
            </span>
            <span className="text-[10px] text-gray-500 tabular-nums">
              {completedCount}/{exercise.sets}
            </span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: exercise.sets }).map((_, i) => {
              const done = completedSets[i] ?? false;
              return (
                <button
                  key={i}
                  onClick={() => onToggleSet(i)}
                  className={`flex-1 h-8 rounded-lg border text-xs font-bold transition-all ${
                    done
                      ? 'bg-green-500 border-green-500 text-white'
                      : isWorkoutActive
                      ? 'bg-white/5 border-white/15 text-gray-400 hover:border-blue-500/50 hover:text-white'
                      : 'bg-white/5 border-white/10 text-gray-600 hover:bg-white/10'
                  }`}
                >
                  {done ? <Check size={13} className="mx-auto" /> : i + 1}
                </button>
              );
            })}
          </div>
          {!isWorkoutActive && completedSets.every((c) => !c) && (
            <p className="text-[10px] text-gray-600 mt-1">
              Set takibi için "Programa Başla" butonuna bas
            </p>
          )}
        </div>

        {/* Meta + tips row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {exercise.restSeconds}sn
            </span>
            <span className="flex items-center gap-1">
              <Dumbbell size={11} />
              {exercise.equipment}
            </span>
          </div>

          {exercise.tips && exercise.tips.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] text-yellow-400/80 hover:text-yellow-300"
            >
              <Lightbulb size={11} />
              {exercise.tips.length} ipucu
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          )}
        </div>

        {/* Notes */}
        {exercise.notes && (
          <p className="text-xs text-gray-400 leading-relaxed">{exercise.notes}</p>
        )}

        {/* Tips list */}
        {expanded && exercise.tips && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-1 pl-1"
          >
            {exercise.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-400">
                <span className="text-yellow-400 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </motion.ul>
        )}
      </div>

      {/* Reorder row */}
      {(!isFirst || !isLast) && (
        <div className="flex gap-px border-t border-white/5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="flex-1 py-1.5 text-[10px] text-gray-600 hover:text-white hover:bg-white/5 disabled:opacity-25 flex items-center justify-center gap-1 transition-colors"
          >
            <ChevronUp size={11} /> Yukarı
          </button>
          <div className="w-px bg-white/5" />
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="flex-1 py-1.5 text-[10px] text-gray-600 hover:text-white hover:bg-white/5 disabled:opacity-25 flex items-center justify-center gap-1 transition-colors"
          >
            <ChevronDown size={11} /> Aşağı
          </button>
        </div>
      )}
    </motion.div>
  );
}
