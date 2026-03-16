import type React from 'react';
import { PointerSensor } from '@dnd-kit/core';

export class AltDragPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({ nativeEvent }: React.PointerEvent<Element>) => {
        return nativeEvent.isPrimary && nativeEvent.button === 0 && nativeEvent.altKey;
      },
    },
  ];
}
