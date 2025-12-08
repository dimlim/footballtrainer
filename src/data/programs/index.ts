// All Training Programs
import { TrainingProgram } from '@/types/training';
import { explosivenessProgram } from './explosiveness';

// All available programs
export const allPrograms: TrainingProgram[] = [
  explosivenessProgram,
];

// Get program by ID
export const getProgramById = (id: string): TrainingProgram | undefined => {
  return allPrograms.find(p => p.id === id);
};

// Get program day
export const getProgramDay = (programId: string, dayNumber: number) => {
  const program = getProgramById(programId);
  return program?.days.find(d => d.dayNumber === dayNumber);
};

// Get all public programs
export const getPublicPrograms = (): TrainingProgram[] => {
  return allPrograms.filter(p => p.isPublic);
};

// Export individual programs
export { explosivenessProgram };

