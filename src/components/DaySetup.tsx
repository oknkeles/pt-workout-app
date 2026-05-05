import { motion } from 'framer-motion';
import type { WorkoutType } from '../types';

const OPTIONS: { type: WorkoutType; label: string; sub: string; icon: string; color: string; gradient: string }[] = [
  {
    type: 'PULL',
    label: 'PULL',
    sub: 'Sırt + Biceps + Arka Omuz',
    icon: '💪',
    color: 'text-blue-400',
    gradient: 'from-blue-600/20 to-blue-900/10 border-blue-500/30 hover:border-blue-400/60',
  },
  {
    type: 'PUSH',
    label: 'PUSH',
    sub: 'Göğüs + Omuz + Triceps',
    icon: '🔥',
    color: 'text-orange-400',
    gradient: 'from-orange-600/20 to-orange-900/10 border-orange-500/30 hover:border-orange-400/60',
  },
  {
    type: 'LEGS',
    label: 'LEGS',
    sub: 'Bacak + Gluteus + Baldır',
    icon: '🦵',
    color: 'text-green-400',
    gradient: 'from-green-600/20 to-green-900/10 border-green-500/30 hover:border-green-400/60',
  },
  {
    type: 'REST',
    label: 'DİNLENME',
    sub: 'Bugün antrenman yok',
    icon: '😴',
    color: 'text-gray-400',
    gradient: 'from-gray-600/20 to-gray-900/10 border-gray-500/30 hover:border-gray-400/60',
  },
];

const DAY_FULL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

interface Props {
  dayIndex: number;
  onChoose: (type: WorkoutType) => void;
}

export function DaySetup({ dayIndex, onChoose }: Props) {
  return (
    <motion.div
      key="setup"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 px-5 pb-24 pt-2"
    >
      <div className="text-center mb-6 mt-2">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
          {DAY_FULL[dayIndex]}
        </p>
        <h2 className="text-2xl font-black text-white">Bugün ne yapacaksın?</h2>
        <p className="text-sm text-gray-500 mt-1">Antrenman türünü seç, öneriler hazırlayalım.</p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map((opt, i) => (
          <motion.button
            key={opt.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChoose(opt.type)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br border transition-all ${opt.gradient}`}
          >
            <div className="text-4xl">{opt.icon}</div>
            <div className="flex-1 text-left">
              <p className={`text-lg font-black ${opt.color}`}>{opt.label}</p>
              <p className="text-xs text-gray-400">{opt.sub}</p>
            </div>
            <div className={`text-xl ${opt.color}`}>→</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
