import React from 'react';
import * as indicatorLineStyles from './IndicatorLine.css';

export const IndicatorLine: React.FC<{
  direction: 'horizontal' | 'vertical';
  lineLengthPx?: number;
}> = React.memo(({ direction, lineLengthPx = 10 }) => {
  const isContainerHorizontal = direction === 'horizontal';
  return (
    <div
      className={`${indicatorLineStyles.dropZoneLine} ${isContainerHorizontal ? indicatorLineStyles.dropZoneLineHorizontal : indicatorLineStyles.dropZoneLineVertical}`}
      style={{ ['--dz-line-length' as any]: `${lineLengthPx}px` } as React.CSSProperties}
      aria-hidden
    />
  );
});

IndicatorLine.displayName = 'IndicatorLine';
