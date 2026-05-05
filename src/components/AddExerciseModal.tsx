import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Check, Sparkles } from 'lucide-react';
import type { Exercise } from '../types';
import { EXERCISE_LIBRARY } from '../data/exercises';
import { useWorkoutStore } from '../store/workoutStore';

interface Props {
  open: boolean;
  dayExerciseIds: string[];
  onAdd: (exercise: Exercise) => void;
  onClose: () => void;
}

const CATEGORIES = ['Tümü', 'Sırt', 'Biceps', 'Omuz', 'Göğüs', 'Triceps', 'Bacak', 'Gluteus'];

const CATEGORY_MAP: Record<string, string[]> = {
  Sırt: ['lat-pulldown', 'seated-cable-row', 'good-mornings'],
  Biceps: ['dumbbell-bicep-curl', 'hammer-curl', 'alternating-curl', 'cable-concentration-curl'],
  Omuz: ['face-pull', 'lateral-raise', 'cable-lateral-raise', 'rear-delt-raise', 'overhead-press'],
  Göğüs: ['bench-press', 'incline-dumbbell-press', 'push-up'],
  Triceps: ['tricep-pushdown', 'dips'],
  Bacak: ['squat', 'romanian-deadlift', 'leg-extension', 'dumbbell-lunge', 'sumo-deadlift', 'calf-raise'],
  Gluteus: ['hip-thrust', 'good-mornings', 'sumo-deadlift'],
};

export function AddExerciseModal({ open, dayExerciseIds, onAdd, onClose }: Props) {
  const customExercises = useWorkoutStore((s) => s.customExercises);
  const addCustomExercise = useWorkoutStore((s) => s.addCustomExercise);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tümü');
  const [added, setAdded] = useState<string[]>([]);
  const [creatingNew, setCreatingNew] = useState(false);

  // New exercise form state
  const [newName, setNewName] = useState('');
  const [newSets, setNewSets] = useState(3);
  const [newReps, setNewReps] = useState('10-12');
  const [newRest, setNewRest] = useState(90);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newMuscles, setNewMuscles] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const allExercises = [...EXERCISE_LIBRARY, ...customExercises];
  const filtered = allExercises.filter((e) => {
    const matchQuery = e.name.toLowerCase().includes(query.toLowerCase());
    const matchCat =
      category === 'Tümü' ||
      (CATEGORY_MAP[category] || []).includes(e.id) ||
      e.muscles.some((m) => m.toLowerCase().includes(category.toLowerCase()));
    return matchQuery && matchCat;
  });

  const handleAdd = (exercise: Exercise) => {
    onAdd(exercise);
    setAdded((prev) => [...prev, exercise.id]);
    setTimeout(() => setAdded((prev) => prev.filter((id) => id !== exercise.id)), 1500);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const ex: Exercise = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      sets: newSets,
      reps: newReps || '10',
      restSeconds: newRest,
      notes: newNotes,
      muscles: newMuscles.split(',').map((m) => m.trim()).filter(Boolean),
      imageUrl: newImageUrl,
      equipment: 'Özel',
      tips: [],
    };
    addCustomExercise(ex);
    onAdd(ex);
    // reset
    setNewName('');
    setNewMuscles('');
    setNewNotes('');
    setNewImageUrl('');
    setCreatingNew(false);
  };

  return (
    <AnimatePresence>
      {open && (
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
              <h2 className="text-lg font-bold text-white">
                {creatingNew ? 'Yeni Hareket Oluştur' : 'Hareket Ekle'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
                <X size={18} className="text-gray-300" />
              </button>
            </div>

            {!creatingNew ? (
              <>
                {/* Search */}
                <div className="px-5 mb-3">
                  <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 border border-white/10">
                    <Search size={16} className="text-gray-500" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Hareket ara..."
                      className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 px-5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        category === cat
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/8 text-gray-400 hover:bg-white/15'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Create new exercise CTA */}
                <div className="px-5 mb-3">
                  <button
                    onClick={() => setCreatingNew(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl text-sm font-medium text-purple-300 hover:from-purple-600/30 hover:to-blue-600/30"
                  >
                    <Sparkles size={14} />
                    Kendi hareketini oluştur
                  </button>
                </div>

                {/* Exercise list */}
                <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-2">
                  {filtered.map((exercise) => {
                    const isInDay = dayExerciseIds.includes(exercise.id);
                    const justAdded = added.includes(exercise.id);

                    return (
                      <motion.div
                        key={exercise.id}
                        layout
                        className="flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/8 rounded-xl p-2.5 transition-colors"
                      >
                        <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {exercise.imageUrl ? (
                            <img
                              src={exercise.imageUrl}
                              alt={exercise.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Sparkles size={20} className="text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{exercise.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {exercise.muscles.slice(0, 2).join(', ')}
                          </p>
                          <p className="text-xs text-gray-600">
                            {exercise.sets} set × {exercise.reps}
                          </p>
                        </div>
                        <button
                          onClick={() => !isInDay && handleAdd(exercise)}
                          disabled={isInDay}
                          className={`shrink-0 p-2.5 rounded-xl transition-all ${
                            isInDay
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : justAdded
                              ? 'bg-green-500 text-white'
                              : 'bg-blue-500 hover:bg-blue-400 text-white'
                          }`}
                        >
                          {isInDay || justAdded ? <Check size={16} /> : <Plus size={16} />}
                        </button>
                      </motion.div>
                    );
                  })}

                  {filtered.length === 0 && (
                    <div className="text-center py-10 text-gray-600">
                      <p className="text-4xl mb-2">🔍</p>
                      <p>Hareket bulunamadı</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
                <Field label="Hareket Adı *">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="örn. Bulgar Split Squat"
                    className="w-full px-3 py-2.5 bg-white/8 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/50"
                  />
                </Field>

                <div className="grid grid-cols-3 gap-2">
                  <Field label="Set">
                    <input
                      type="number"
                      value={newSets}
                      onChange={(e) => setNewSets(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-white/8 border border-white/10 rounded-xl text-sm text-white text-center outline-none"
                    />
                  </Field>
                  <Field label="Tekrar">
                    <input
                      value={newReps}
                      onChange={(e) => setNewReps(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/8 border border-white/10 rounded-xl text-sm text-white text-center outline-none"
                    />
                  </Field>
                  <Field label="Dinl. (sn)">
                    <input
                      type="number"
                      value={newRest}
                      onChange={(e) => setNewRest(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-white/8 border border-white/10 rounded-xl text-sm text-white text-center outline-none"
                    />
                  </Field>
                </div>

                <Field label="Çalışan Kaslar (virgülle)">
                  <input
                    value={newMuscles}
                    onChange={(e) => setNewMuscles(e.target.value)}
                    placeholder="Quadriceps, Gluteus"
                    className="w-full px-3 py-2.5 bg-white/8 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                  />
                </Field>

                <Field label="Görsel URL'si (opsiyonel)">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 bg-white/8 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                  />
                </Field>

                <Field label="Notlar">
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={2}
                    placeholder="Form ipuçları, notlar..."
                    className="w-full px-3 py-2.5 bg-white/8 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none"
                  />
                </Field>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setCreatingNew(false)}
                    className="flex-1 py-3 bg-white/8 hover:bg-white/15 rounded-xl text-sm font-medium text-gray-300"
                  >
                    Geri
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 disabled:opacity-40 rounded-xl text-sm font-bold text-white"
                  >
                    Oluştur ve Ekle
                  </button>
                </div>
              </div>
            )}
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
