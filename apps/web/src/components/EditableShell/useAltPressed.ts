import React from 'react';

let isAltPressed = false;
const altPressedSubscribers = new Set<() => void>();
let altPressedListenersBound = false;

const notifyAltPressedSubscribers = () => {
  altPressedSubscribers.forEach((listener) => listener());
};

const setAltPressed = (nextValue: boolean) => {
  if (isAltPressed === nextValue) {
    return;
  }

  isAltPressed = nextValue;
  notifyAltPressedSubscribers();
};

const bindAltPressedListeners = () => {
  if (altPressedListenersBound || typeof window === 'undefined') {
    return;
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    setAltPressed(event.altKey);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    setAltPressed(event.altKey);
  };

  const handleWindowBlur = () => {
    setAltPressed(false);
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('blur', handleWindowBlur);
  altPressedListenersBound = true;
};

const subscribeAltPressed = (listener: () => void) => {
  bindAltPressedListeners();
  altPressedSubscribers.add(listener);

  return () => {
    altPressedSubscribers.delete(listener);
  };
};

const getAltPressedSnapshot = () => isAltPressed;

const getAltPressedServerSnapshot = () => false;

export const useAltPressed = () => {
  return React.useSyncExternalStore(
    subscribeAltPressed,
    getAltPressedSnapshot,
    getAltPressedServerSnapshot,
  );
};
