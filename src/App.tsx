import { Dumbbell, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkoutStore } from './store/workoutStore';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { DayView } from './components/DayView';

export default function App() {
  const { schedule, selectedDay, setSelectedDay, setCompletion, activeWorkout, resetToDefault } = useWorkoutStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0d18] text-white flex flex-col max-w-lg mx-auto relative">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <Dumbbell size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">PT Program</h1>
            <p className="text-[11px] text-gray-500 leading-tight">PPL · 5 Gün / Hafta</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-xl hover:bg-white/8 text-gray-400"
          >
            <MoreVertical size={18} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 z-40 w-44 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl py-1"
                >
                  <button
                    onClick={() => {
                      if (confirm('Programı varsayılana sıfırla?\n(Set takibi ve özel hareketler de silinir)')) {
                        resetToDefault();
                      }
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5"
                  >
                    Programı Sıfırla
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Weekly calendar */}
      <WeeklyCalendar
        schedule={schedule}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        setCompletion={setCompletion}
        activeWorkoutDay={activeWorkout?.dayIndex ?? null}
      />

      {/* Day content */}
      <DayView dayIndex={selectedDay} />
    </div>
  );
}
