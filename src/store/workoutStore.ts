import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exercise, WeekSchedule, SetCompletion, WorkoutType } from '../types';
import { DEFAULT_SCHEDULE } from '../data/exercises';

interface ActiveWorkout {
  dayIndex: number;
  startedAt: number;
}

interface WorkoutStore {
  schedule: WeekSchedule;
  selectedDay: number;
  customExercises: Exercise[];
  setCompletion: SetCompletion;
  activeWorkout: ActiveWorkout | null;
  lastResetDate: string;

  setSelectedDay: (day: number) => void;
  setDayType: (dayIndex: number, type: WorkoutType) => void;
  addExercise: (dayIndex: number, exercise: Exercise) => void;
  removeExercise: (dayIndex: number, exerciseId: string) => void;
  moveExercise: (dayIndex: number, from: number, to: number) => void;
  updateExercise: (dayIndex: number, exerciseId: string, updates: Partial<Exercise>) => void;
  setCardioMinutes: (dayIndex: number, minutes: number) => void;
  setDayNotes: (dayIndex: number, notes: string) => void;
  addCustomExercise: (exercise: Exercise) => void;

  toggleSet: (dayIndex: number, exerciseId: string, setIndex: number, totalSets: number) => void;
  resetDayCompletion: (dayIndex: number) => void;
  autoResetIfNewDay: () => void;

  startWorkout: (dayIndex: number) => void;
  endWorkout: () => void;

  resetToDefault: () => void;
  clearDay: (dayIndex: number) => void;
}

const todayKey = () => new Date().toISOString().split('T')[0];

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      schedule: DEFAULT_SCHEDULE,
      selectedDay: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
      customExercises: [],
      setCompletion: {},
      activeWorkout: null,
      lastResetDate: todayKey(),

      setSelectedDay: (day) => set({ selectedDay: day }),

      setDayType: (dayIndex, type) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            [dayIndex]: { ...state.schedule[dayIndex], type },
          },
        })),

      addExercise: (dayIndex, exercise) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            [dayIndex]: {
              ...state.schedule[dayIndex],
              exercises: [...state.schedule[dayIndex].exercises, exercise],
            },
          },
        })),

      removeExercise: (dayIndex, exerciseId) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            [dayIndex]: {
              ...state.schedule[dayIndex],
              exercises: state.schedule[dayIndex].exercises.filter(
                (e) => e.id !== exerciseId
              ),
            },
          },
        })),

      moveExercise: (dayIndex, from, to) =>
        set((state) => {
          const exercises = [...state.schedule[dayIndex].exercises];
          const [moved] = exercises.splice(from, 1);
          exercises.splice(to, 0, moved);
          return {
            schedule: {
              ...state.schedule,
              [dayIndex]: { ...state.schedule[dayIndex], exercises },
            },
          };
        }),

      updateExercise: (dayIndex, exerciseId, updates) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            [dayIndex]: {
              ...state.schedule[dayIndex],
              exercises: state.schedule[dayIndex].exercises.map((e) =>
                e.id === exerciseId ? { ...e, ...updates } : e
              ),
            },
          },
        })),

      setCardioMinutes: (dayIndex, minutes) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            [dayIndex]: { ...state.schedule[dayIndex], cardioMinutes: minutes },
          },
        })),

      setDayNotes: (dayIndex, notes) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            [dayIndex]: { ...state.schedule[dayIndex], notes },
          },
        })),

      addCustomExercise: (exercise) =>
        set((state) => ({
          customExercises: [...state.customExercises, exercise],
        })),

      toggleSet: (dayIndex, exerciseId, setIndex, totalSets) =>
        set((state) => {
          const key = `${dayIndex}:${exerciseId}`;
          const current = state.setCompletion[key] ?? Array(totalSets).fill(false);
          const updated = [...current];
          while (updated.length < totalSets) updated.push(false);
          updated[setIndex] = !updated[setIndex];
          return {
            setCompletion: { ...state.setCompletion, [key]: updated },
          };
        }),

      resetDayCompletion: (dayIndex) =>
        set((state) => {
          const newCompletion = { ...state.setCompletion };
          Object.keys(newCompletion).forEach((k) => {
            if (k.startsWith(`${dayIndex}:`)) delete newCompletion[k];
          });
          return { setCompletion: newCompletion };
        }),

      autoResetIfNewDay: () => {
        const today = todayKey();
        if (get().lastResetDate !== today) {
          set({ setCompletion: {}, lastResetDate: today, activeWorkout: null });
        }
      },

      startWorkout: (dayIndex) =>
        set({
          activeWorkout: { dayIndex, startedAt: Date.now() },
        }),

      endWorkout: () => set({ activeWorkout: null }),

      resetToDefault: () =>
        set({
          schedule: DEFAULT_SCHEDULE,
          customExercises: [],
          setCompletion: {},
          activeWorkout: null,
        }),

      clearDay: (dayIndex) =>
        set((state) => {
          const newCompletion = { ...state.setCompletion };
          Object.keys(newCompletion).forEach((k) => {
            if (k.startsWith(`${dayIndex}:`)) delete newCompletion[k];
          });
          return {
            schedule: {
              ...state.schedule,
              [dayIndex]: { type: 'UNSET', exercises: [], cardioMinutes: 0 },
            },
            setCompletion: newCompletion,
            activeWorkout:
              state.activeWorkout?.dayIndex === dayIndex ? null : state.activeWorkout,
          };
        }),
    }),
    {
      name: 'pt-workout-store',
      version: 3,
      migrate: (persistedState: any, version) => {
        if (version < 3) {
          // Migrate from any prior version: reset to default to honor new UNSET flow
          return {
            schedule: DEFAULT_SCHEDULE,
            selectedDay: persistedState?.selectedDay ?? 0,
            customExercises: persistedState?.customExercises ?? [],
            setCompletion: {},
            activeWorkout: null,
            lastResetDate: todayKey(),
          };
        }
        return persistedState;
      },
    }
  )
);
