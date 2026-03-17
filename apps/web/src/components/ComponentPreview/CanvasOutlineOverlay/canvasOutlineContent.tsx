import React from 'react';
import { useEditableShellTarget } from '@/components/EditableShell/EditableShell';

type CanvasOutlineContentEntry = {
  id: string;
  targetId: string;
  node: React.ReactNode;
};

export type { CanvasOutlineContentEntry };

type CanvasOutlineContentSnapshot = Map<string, CanvasOutlineContentEntry[]>;

type CanvasOutlineContentStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => CanvasOutlineContentSnapshot;
  getServerSnapshot: () => CanvasOutlineContentSnapshot;
  upsert: (entry: CanvasOutlineContentEntry) => void;
  remove: (entryId: string) => void;
};

const EMPTY_SNAPSHOT: CanvasOutlineContentSnapshot = new Map();
const EMPTY_STORE: CanvasOutlineContentStore = {
  subscribe: () => () => undefined,
  getSnapshot: () => EMPTY_SNAPSHOT,
  getServerSnapshot: () => EMPTY_SNAPSHOT,
  upsert: () => undefined,
  remove: () => undefined,
};

const createCanvasOutlineContentStore = (): CanvasOutlineContentStore => {
  let entriesById = new Map<string, CanvasOutlineContentEntry>();
  let snapshot: CanvasOutlineContentSnapshot = EMPTY_SNAPSHOT;
  const listeners = new Set<() => void>();

  const emitChange = () => {
    listeners.forEach((listener) => listener());
  };

  const rebuildSnapshot = () => {
    if (entriesById.size === 0) {
      snapshot = EMPTY_SNAPSHOT;
      emitChange();
      return;
    }

    const nextSnapshot = new Map<string, CanvasOutlineContentEntry[]>();

    entriesById.forEach((entry) => {
      const existingEntries = nextSnapshot.get(entry.targetId) ?? [];
      existingEntries.push(entry);
      nextSnapshot.set(entry.targetId, existingEntries);
    });

    snapshot = nextSnapshot;
    emitChange();
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => EMPTY_SNAPSHOT,
    upsert: (entry) => {
      const previousEntry = entriesById.get(entry.id);
      if (
        previousEntry &&
        previousEntry.targetId === entry.targetId &&
        previousEntry.node === entry.node
      ) {
        return;
      }

      entriesById = new Map(entriesById);
      entriesById.set(entry.id, entry);
      rebuildSnapshot();
    },
    remove: (entryId) => {
      if (!entriesById.has(entryId)) {
        return;
      }

      entriesById = new Map(entriesById);
      entriesById.delete(entryId);
      rebuildSnapshot();
    },
  };
};

const CanvasOutlineContentContext = React.createContext<CanvasOutlineContentStore>(EMPTY_STORE);

const useCanvasOutlineContentStore = (): CanvasOutlineContentStore => {
  return React.useContext(CanvasOutlineContentContext);
};

export const CanvasOutlineContentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storeRef = React.useRef<CanvasOutlineContentStore>();

  if (!storeRef.current) {
    storeRef.current = createCanvasOutlineContentStore();
  }

  return (
    <CanvasOutlineContentContext.Provider value={storeRef.current}>
      {children}
    </CanvasOutlineContentContext.Provider>
  );
};

export const useCanvasOutlineRenderNodes = (targetId: string): React.ReactNode[] => {
  const store = useCanvasOutlineContentStore();
  const snapshot = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return React.useMemo(
    () => (snapshot.get(targetId) ?? []).map((entry) => entry.node),
    [snapshot, targetId],
  );
};

export const useCanvasOutlineRenderEntries = (targetId: string): CanvasOutlineContentEntry[] => {
  const store = useCanvasOutlineContentStore();
  const snapshot = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return React.useMemo(() => snapshot.get(targetId) ?? [], [snapshot, targetId]);
};

type RenderedInCanvasOutlineProps = {
  children: React.ReactNode;
  targetId?: string;
};

export const RenderedInCanvasOutline: React.FC<RenderedInCanvasOutlineProps> = ({
  children,
  targetId: explicitTargetId,
}) => {
  const store = useCanvasOutlineContentStore();
  const target = useEditableShellTarget();
  const registrationId = React.useId();
  const targetId = explicitTargetId ?? target?.id ?? null;

  React.useLayoutEffect(() => {
    if (!targetId) {
      return undefined;
    }

    store.upsert({
      id: registrationId,
      targetId,
      node: children,
    });

    return () => {
      store.remove(registrationId);
    };
  }, [children, registrationId, store, targetId]);

  return null;
};
