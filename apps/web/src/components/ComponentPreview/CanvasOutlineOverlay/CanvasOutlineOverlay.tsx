import React from 'react';
import { createPortal } from 'react-dom';
import {
  buildEditableProjectionId,
  createComponentNodeSource,
  type EditableSource,
} from '@/editing/types';
import { selectActiveEditingSource, selectHoverEditingSource } from '@/editing/store/selectors';
import { useAppSelector } from '@/store/hooks';
import { selectSelectedNodeId } from '@/store/componentTreeSlice/componentTreeSelectors';
import * as styles from './CanvasOutlineOverlay.css';
import { useCanvasOutlineRenderEntries } from './canvasOutlineContent';

type OutlineTone = 'hover' | 'selected';
type OutlineVariant = 'default' | 'subtle';

type OutlineSnapshot = {
  targetId: string;
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: string;
  variant: OutlineVariant;
  tone: OutlineTone;
};

const GEOMETRY_TRACKING_WINDOW_MS = 220;
const GEOMETRY_STABLE_FRAME_COUNT = 2;

const areOutlinesEqual = (left: OutlineSnapshot[], right: OutlineSnapshot[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((outline, index) => {
    const nextOutline = right[index];
    if (!nextOutline) {
      return false;
    }

    return (
      outline.targetId === nextOutline.targetId &&
      outline.top === nextOutline.top &&
      outline.left === nextOutline.left &&
      outline.width === nextOutline.width &&
      outline.height === nextOutline.height &&
      outline.borderRadius === nextOutline.borderRadius &&
      outline.variant === nextOutline.variant &&
      outline.tone === nextOutline.tone
    );
  });
};

const getProjectionIdFromSource = (source: EditableSource | null): string | null => {
  if (!source) {
    return null;
  }

  return buildEditableProjectionId(source);
};

const escapeAttributeValue = (value: string): string => {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

const getTargetElements = (targetId: string): HTMLElement[] => {
  return Array.from(
    document.querySelectorAll<HTMLElement>(`[data-target-id="${escapeAttributeValue(targetId)}"]`),
  );
};

const getPreviewRoot = (): HTMLElement | null => document.getElementById('modal-preview-root');

const getPreviewSelectedElements = (): HTMLElement[] => {
  const previewRoot = getPreviewRoot();
  if (!previewRoot) {
    return [];
  }

  return Array.from(previewRoot.querySelectorAll<HTMLElement>('[data-selected="true"]'));
};

const isPreviewDragging = (): boolean => {
  const previewRoot = getPreviewRoot();
  if (!previewRoot) {
    return false;
  }

  return previewRoot.querySelector('[data-dragging="true"]') !== null;
};

const isElementVisible = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return false;
  }

  const computedStyle = window.getComputedStyle(element);
  return computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
};

const getHoveredTargetElement = (elements: HTMLElement[]): HTMLElement | null => {
  const hoveredElement = elements.find(
    (element) => element.matches(':hover') && isElementVisible(element),
  );
  if (hoveredElement) {
    return hoveredElement;
  }

  return null;
};

const getTargetElement = (targetId: string, tone: OutlineTone): HTMLElement | null => {
  const elements = getTargetElements(targetId);
  if (elements.length === 0) {
    return null;
  }

  if (tone === 'hover') {
    const hoveredElement = getHoveredTargetElement(elements);
    if (hoveredElement) {
      return hoveredElement;
    }
  }

  return elements.find((element) => isElementVisible(element)) ?? null;
};

const getTargetVariant = (element: HTMLElement): OutlineVariant => {
  return element.dataset.outlineVariant === 'subtle' ? 'subtle' : 'default';
};

const measureElementOutline = (element: HTMLElement, tone: OutlineTone): OutlineSnapshot | null => {
  if (!isElementVisible(element)) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);

  return {
    targetId: element.dataset.targetId ?? 'unknown',
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    borderRadius: computedStyle.borderRadius,
    variant: getTargetVariant(element),
    tone,
  };
};

const measureOutline = (targetId: string, tone: OutlineTone): OutlineSnapshot | null => {
  const element = getTargetElement(targetId, tone);
  if (!element) {
    return null;
  }

  return measureElementOutline(element, tone);
};

const buildSelectedTargetId = (
  activeSource: EditableSource | null,
  selectedNodeId: string | null,
): string | null => {
  const activeTargetId = getProjectionIdFromSource(activeSource);
  if (activeTargetId) {
    return activeTargetId;
  }

  if (!selectedNodeId) {
    return null;
  }

  return buildEditableProjectionId(createComponentNodeSource({ nodeId: selectedNodeId }));
};

const getVariantClassName = (tone: OutlineTone, variant: OutlineVariant): string => {
  if (tone === 'selected') {
    return variant === 'subtle'
      ? styles.outlineVariant.selectedSubtle
      : styles.outlineVariant.selectedDefault;
  }

  return variant === 'subtle'
    ? styles.outlineVariant.hoverSubtle
    : styles.outlineVariant.hoverDefault;
};

const measureActiveOutlines = ({
  hoveredTargetId,
  selectedTargetId,
  previousOutlines,
  dragging,
}: {
  hoveredTargetId: string | null;
  selectedTargetId: string | null;
  previousOutlines: OutlineSnapshot[];
  dragging: boolean;
}): OutlineSnapshot[] => {
  const nextOutlines: OutlineSnapshot[] = [];

  if (dragging) {
    nextOutlines.push(...previousOutlines.filter((outline) => outline.tone === 'selected'));
  }

  const selectedElementOutlines = dragging
    ? []
    : (getPreviewSelectedElements()
        .map((element) => measureElementOutline(element, 'selected'))
        .filter(Boolean) as OutlineSnapshot[]);

  if (!dragging && selectedElementOutlines.length > 0) {
    nextOutlines.push(...selectedElementOutlines);
  }

  if (!dragging && selectedElementOutlines.length === 0 && selectedTargetId) {
    const selectedOutline = measureOutline(selectedTargetId, 'selected');
    if (selectedOutline) {
      nextOutlines.push(selectedOutline);
    }
  }

  if (hoveredTargetId && hoveredTargetId !== selectedTargetId) {
    const hoverOutline = measureOutline(hoveredTargetId, 'hover');
    if (hoverOutline) {
      nextOutlines.push(hoverOutline);
    }
  }

  return nextOutlines;
};

const OutlineAdornment: React.FC<{ outline: OutlineSnapshot }> = ({ outline }) => {
  const renderedEntries = useCanvasOutlineRenderEntries(outline.targetId);
  return (
    <>
      {renderedEntries.map((entry) => (
        <React.Fragment key={entry.id}>{entry.node}</React.Fragment>
      ))}
    </>
  );
};

export const CanvasOutlineOverlay: React.FC = () => {
  const hoverSource = useAppSelector(selectHoverEditingSource);
  const activeSource = useAppSelector(selectActiveEditingSource);
  const selectedNodeId = useAppSelector(selectSelectedNodeId);
  const hoveredTargetId = React.useMemo(
    () => getProjectionIdFromSource(hoverSource),
    [hoverSource],
  );
  const selectedTargetId = React.useMemo(
    () => buildSelectedTargetId(activeSource, selectedNodeId),
    [activeSource, selectedNodeId],
  );
  const [outlines, setOutlines] = React.useState<OutlineSnapshot[]>([]);
  const outlinesRef = React.useRef<OutlineSnapshot[]>([]);

  React.useEffect(() => {
    outlinesRef.current = outlines;
  }, [outlines]);

  React.useLayoutEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    if (!hoveredTargetId && !selectedTargetId) {
      if (outlinesRef.current.length > 0) {
        setOutlines([]);
      }
      return undefined;
    }

    let measureFrameId = 0;
    let trackingFrameId = 0;
    let trackingUntil = 0;
    let stableFrameCount = 0;

    const measureAndCommitOutlines = (): boolean => {
      const dragging = isPreviewDragging();
      const nextOutlines = measureActiveOutlines({
        hoveredTargetId,
        selectedTargetId,
        previousOutlines: outlinesRef.current,
        dragging,
      });

      const hasChanged = !areOutlinesEqual(outlinesRef.current, nextOutlines);
      if (hasChanged) {
        setOutlines(nextOutlines);
      }

      return hasChanged;
    };

    const scheduleMeasure = () => {
      if (measureFrameId) {
        return;
      }

      measureFrameId = window.requestAnimationFrame(() => {
        measureFrameId = 0;
        measureAndCommitOutlines();
      });
    };

    const stopTracking = () => {
      if (trackingFrameId) {
        window.cancelAnimationFrame(trackingFrameId);
        trackingFrameId = 0;
      }
      trackingUntil = 0;
      stableFrameCount = 0;
    };

    const trackOutlineGeometry = () => {
      trackingFrameId = window.requestAnimationFrame(() => {
        const hasChanged = measureAndCommitOutlines();
        stableFrameCount = hasChanged ? 0 : stableFrameCount + 1;

        const shouldContinue =
          performance.now() < trackingUntil || stableFrameCount < GEOMETRY_STABLE_FRAME_COUNT;

        if (shouldContinue) {
          trackOutlineGeometry();
          return;
        }

        stopTracking();
      });
    };

    const startTracking = (durationMs = GEOMETRY_TRACKING_WINDOW_MS) => {
      trackingUntil = Math.max(trackingUntil, performance.now() + durationMs);
      stableFrameCount = 0;

      if (!trackingFrameId) {
        trackOutlineGeometry();
      }
    };

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            startTracking();
          });

    const mutationObserver =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(() => {
            startTracking();
          });

    const selectedElement = selectedTargetId
      ? getTargetElement(selectedTargetId, 'selected')
      : null;
    const hoveredElement = hoveredTargetId ? getTargetElement(hoveredTargetId, 'hover') : null;
    const previewRoot = document.getElementById('modal-preview-root');

    if (resizeObserver && selectedElement) {
      resizeObserver.observe(selectedElement);
    }

    if (resizeObserver && hoveredElement && hoveredElement !== selectedElement) {
      resizeObserver.observe(hoveredElement);
    }

    if (mutationObserver && previewRoot) {
      mutationObserver.observe(previewRoot, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
        attributeFilter: ['class', 'style', 'data-dragging'],
      });
    }

    const handleViewportChange = () => {
      scheduleMeasure();
    };

    const handleAnimatedGeometryChange = () => {
      startTracking();
    };

    scheduleMeasure();
    startTracking();

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    document.addEventListener('transitionrun', handleAnimatedGeometryChange, true);
    document.addEventListener('transitionend', handleAnimatedGeometryChange, true);
    document.addEventListener('animationstart', handleAnimatedGeometryChange, true);
    document.addEventListener('animationend', handleAnimatedGeometryChange, true);

    return () => {
      if (measureFrameId) {
        window.cancelAnimationFrame(measureFrameId);
      }
      stopTracking();
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
      document.removeEventListener('transitionrun', handleAnimatedGeometryChange, true);
      document.removeEventListener('transitionend', handleAnimatedGeometryChange, true);
      document.removeEventListener('animationstart', handleAnimatedGeometryChange, true);
      document.removeEventListener('animationend', handleAnimatedGeometryChange, true);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [hoveredTargetId, selectedTargetId]);

  if (typeof document === 'undefined' || outlines.length === 0) {
    return null;
  }

  return createPortal(
    <div className={styles.overlayRoot} aria-hidden>
      {outlines.map((outline) => (
        <div
          id={`${outline.targetId}-outline`}
          key={`${outline.tone}:${outline.targetId}`}
          className={`${styles.outline} ${getVariantClassName(outline.tone, outline.variant)}`}
          style={{
            top: outline.top,
            left: outline.left,
            width: outline.width,
            height: outline.height,
            borderRadius: outline.borderRadius,
          }}
        >
          <OutlineAdornment outline={outline} />
        </div>
      ))}
    </div>,
    document.body,
  );
};
