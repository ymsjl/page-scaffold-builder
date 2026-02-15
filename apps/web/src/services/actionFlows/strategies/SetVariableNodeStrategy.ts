import type { ActionNodeBase, FlowExecutionContext, Port } from '@/types/actions';
import { SetVariableNodeParamsSchema } from '@/types/actions';
import { setVariableValue } from '@/store/variablesSlice/variablesSlice';
import type { PrimitiveVariableValue } from '@/types';
import { BaseNodeStrategy } from './BaseNodeStrategy';

const toPrimitiveVariableValue = (value: unknown): PrimitiveVariableValue => {
  if (typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
    return value;
  }
  throw new Error('变量值仅支持 boolean/string/number');
};

export class SetVariableNodeStrategy extends BaseNodeStrategy {
  type = 'action.setVariable';

  label = 'Set Variable';

  description = '设置全局变量值';

  icon = 'ControlOutlined';

  category = 'action' as const;

  async execute(
    node: ActionNodeBase,
    inputs: Record<string, any>,
    context: FlowExecutionContext,
  ): Promise<Record<string, any>> {
    const params = SetVariableNodeParamsSchema.parse(node.params);
    const variableName = this.getInput(inputs, 'variableName', params.variableName);
    const rawValue = this.getInput(inputs, 'value', params.value);

    if (!variableName || typeof variableName !== 'string') {
      throw new Error('变量名不能为空');
    }

    const value = toPrimitiveVariableValue(rawValue);

    if (!context.variables || typeof context.variables !== 'object') {
      context.variables = {};
    }
    context.variables[variableName] = value;

    const dispatch =
      context.services?.dispatch ||
      (context.services?.store as { dispatch?: (action: unknown) => void } | undefined)?.dispatch;
    dispatch?.(
      setVariableValue({
        name: variableName,
        value,
      }),
    );

    return this.createOutput({
      variableName,
      value,
      success: true,
    });
  }

  getInputPorts(node: ActionNodeBase): Port[] {
    if (!this.type || !node) {
      return [];
    }
    return [
      { id: 'trigger', name: 'Trigger', type: 'exec', required: false },
      {
        id: 'variableName',
        name: 'Variable Name',
        type: 'string',
        required: false,
      },
      { id: 'value', name: 'Value', type: 'any', required: false },
    ];
  }

  getOutputPorts(node: ActionNodeBase): Port[] {
    if (!this.type || !node) {
      return [];
    }
    return [
      { id: 'completed', name: 'Completed', type: 'exec', required: false },
      { id: 'value', name: 'Value', type: 'any', required: false },
    ];
  }

  getDefaultParams(): Record<string, any> {
    if (!this.type) {
      return {};
    }
    return {
      variableName: '',
      value: false,
    };
  }
}
