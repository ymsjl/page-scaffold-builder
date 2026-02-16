import React from 'react';

export type PreviewMode = 'edit' | 'pure';

const PreviewModeContext = React.createContext<PreviewMode>('edit');

export const PreviewModeProvider: React.FC<{
  mode: PreviewMode;
  children: React.ReactNode;
}> = ({ mode, children }) => {
  return <PreviewModeContext.Provider value={mode}>{children}</PreviewModeContext.Provider>;
};

export const usePreviewMode = () => React.useContext(PreviewModeContext);
