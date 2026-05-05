import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import type { Exercise } from '../types';

interface Props {
  open: boolean;
  exercise: Exercise | null;
  onSave: (updates: Partial<Exercise>) => void;
  onClose: () => void;
}

export function EditExerciseModal({ open, exercise, onSave, onClose }: Props) {
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState('10');
  const [restSeconds, setRestSeconds] = useState(60);
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (exercise) {
      setSets(exercise.sets);
      setReps(exercise.reps);
      setRestSeconds(exercise.restSeconds);
      setNotes(exercise.notes);
      setImageUrl(exercise.imageUrl);
    }
  }, [exercise]);

  const handleSave = () => {
    onSave({ sets, reps, restSeconds, notes, imageUrl });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && exercise && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#12121e] rounded-t-3xl max-h-[90vh] flex flex-col"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-4" />

            <div className="flex items-center justify-between px-5 mb-4">
              <h2 className="text-lg font-bold text-white">{exercise.name}</h2>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
                <X size={18} className="text-gray-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
              {/* Sets, reps, rest in a row */}
              <div className="grid grid-cols-3 gap-3">
                <NumberField label="Set" value={sets} onChange={setSets} min={1} max={10} />
                <TextField label="Tekrar" value={reps} onChange={setReps} placeholder="10-12" />
                <NumberField label="Dinlenme (sn)" value={restSeconds} onChange={setRestSeconds} min={0} max={300} step={15} />
              </div>

              {/* Image URL */}
              <Field label="Görsel URL'si">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 bg-white/8 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
                />
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="mt-2 w-full h-32 object-cover rounded-xl"
                    onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.3')}
                  />
                )}
              </Field>

              {/* Notes */}
              <Field label="Notlar / Açıklama">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white/8 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 resize-none"
                />
              </Field>
            </div>

            <div className="px-5 pb-6 pt-2 border-t border-white/8">
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
              >
                <Save size={18} />
                Kaydet
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

function NumberField({
  label, value, onChange, min, max, step = 1,
}: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <Field label={label}>
      <div className="flex items-center bg-white/8 border border-white/10 rounded-xl">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="px-3 py-2.5 text-gray-400 hover:text-white"
        >−</button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
          className="flex-1 bg-transparent text-center text-sm text-white outline-none w-full"
        />
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="px-3 py-2.5 text-gray-400 hover:text-white"
        >+</button>
      </div>
    </Field>
  );
}

function TextField({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Field label={label}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-white/8 border border-white/10 rounded-xl text-sm text-white text-center placeholder-gray-600 outline-none focus:border-blue-500/50"
      />
    </Field>
  );
}
