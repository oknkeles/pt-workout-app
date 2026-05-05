import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause, Play, RotateCcw } from 'lucide-react';

interface Props {
  seconds: number | null;
  onClose: () => void;
}

export function RestTimer({ seconds, onClose }: Props) {
  const [remaining, setRemaining] = useState(seconds ?? 0);
  const [paused, setPaused] = useState(false);
  const total = useRef(seconds ?? 0);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (seconds == null) return;
    setRemaining(seconds);
    setPaused(false);
    total.current = seconds;
  }, [seconds]);

  useEffect(() => {
    if (seconds == null || paused) return;
    if (remaining <= 0) {
      // beep
      try {
        if (!audioRef.current) audioRef.current = new AudioContext();
        const ctx = audioRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch {}
      const t = setTimeout(onClose, 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, paused, seconds, onClose]);

  const progress = total.current > 0 ? remaining / total.current : 0;
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;

  return (
    <AnimatePresence>
      {seconds != null && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 shadow-2xl shadow-blue-900/50 border border-blue-400/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">
                ⏱ Dinlenme
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/20 text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-4xl font-black text-white tabular-nums">
                {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPaused((p) => !p)}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white"
                >
                  {paused ? <Play size={16} /> : <Pause size={16} />}
                </button>
                <button
                  onClick={() => {
                    setRemaining(total.current);
                    setPaused(false);
                  }}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                animate={{ width: `${progress * 100}%` }}
                transition={{ ease: 'linear', duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
