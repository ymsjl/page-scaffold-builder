import type { BuilderState } from './BuilderState';
import type { NormalizedComponentTree } from '@/types/Component';

export type PersistedState = Partial<Omit<BuilderState, 'componentTree'> & { componentTree: NormalizedComponentTree & { selectedNodeId: string | null } }>;
export type Mutators = [["zustand/devtools", never], ["zustand/persist", unknown], ["zustand/immer", never]];
