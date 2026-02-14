import { useCallback } from 'react';
import type { FlowExecutionContext } from '@/types/actions';
import { useAppDispatch } from '@/store/hooks';
import { useFlowExecutor } from './useFlowExecutor';

type CreateFlowHandlerOptions = {
  componentId?: string;
  componentProps?: Record<string, unknown>;
  eventName?: string;
};

export function useActionFlowHandler() {
  const { executeFlow } = useFlowExecutor();
  const dispatch = useAppDispatch();

  const createFlowHandler = useCallback(
    (flowId: string, options?: CreateFlowHandlerOptions) => {
      return async (eventData?: unknown, ...args: unknown[]) => {
        const context: Partial<FlowExecutionContext> = {
          componentId: options?.componentId,
          componentProps: options?.componentProps,
          services: {
            dispatch,
          },
          eventData: {
            eventName: options?.eventName,
            payload: eventData,
            args,
          },
        };

        await executeFlow(flowId, context);
      };
    },
    [dispatch, executeFlow],
  );

  return {
    createFlowHandler,
  };
}
