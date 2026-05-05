import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, RefreshCw, X } from 'lucide-react';

interface Props {
  open: boolean;
  durationMs: number;
  totalSets: number;
  completedSets: number;
  exerciseCount: number;
  onClose: () => void;
}

export function WorkoutSummary({
  open,
  durationMs,
  totalSets,
  completedSets,
  exerciseCount,
  onClose,
}: Props) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  const completionPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto bg-gradient-to-br from-[#1a1a2e] to-[#0d0d18] border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 text-gray-400"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="inline-flex p-4 rounded-full bg-yellow-500/20 mb-3"
              >
                <Trophy size={36} className="text-yellow-400" />
              </motion.div>

              <h2 className="text-2xl font-black text-white">Antrenman Bitti! 💪</h2>
              <p className="text-sm text-gray-400 mt-1">Harika iş, dinlen ve protein al.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6">
              <Stat icon={<Clock size={18} className="text-blue-400" />} value={`${min}d ${sec}sn`} label="Süre" />
              <Stat
                icon={<RefreshCw size={18} className="text-green-400" />}
                value={`${completedSets}/${totalSets}`}
                label="Set"
              />
              <Stat icon={<Trophy size={18} className="text-orange-400" />} value={`%${completionPct}`} label="Tamam." />
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
              {exerciseCount} hareket tamamlandı
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold"
            >
              Tamam
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-base font-black text-white">{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}
