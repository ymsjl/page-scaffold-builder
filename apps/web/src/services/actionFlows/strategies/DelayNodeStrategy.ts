import type { ActionNodeBase, FlowExecutionContext, Port } from '@/types/actions';
import { DelayNodeParamsSchema } from '@/types/actions';
import { BaseNodeStrategy } from './BaseNodeStrategy';

/**
 * 延时节点策略
 */
export class DelayNodeStrategy extends BaseNodeStrategy {
  type = 'delay';

  label = 'Delay';

  description = '延时等待';

  icon = 'ClockCircleOutlined';

  category = 'control' as const;

  async execute(
    node: ActionNodeBase,
    inputs: Record<string, any>,
    context: FlowExecutionContext,
  ): Promise<Record<string, any>> {
    const params = DelayNodeParamsSchema.parse(node.params);

    const duration = this.getInput(inputs, 'duration', params.duration);

    this.log(`Delaying for ${duration}ms`, context.flowId);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, duration);
    });

    return this.createOutput({
      success: true,
      duration,
    });
  }

  getInputPorts(node: ActionNodeBase): Port[] {
    const inheritedPorts = super.getInputPorts(node);
    if (inheritedPorts.length > 0) {
      return inheritedPorts;
    }
    return [
      { id: 'trigger', name: 'Trigger', type: 'exec', required: false },
      {
        id: 'duration',
        name: 'Duration (ms)',
        type: 'number',
        required: false,
      },
    ];
  }

  getOutputPorts(node: ActionNodeBase): Port[] {
    const inheritedPorts = super.getOutputPorts(node);
    if (inheritedPorts.length > 0) {
      return inheritedPorts;
    }
    return [
      { id: 'completed', name: 'Completed', type: 'exec', required: false },
      { id: 'success', name: 'Success', type: 'boolean', required: false },
    ];
  }

  validate(node: ActionNodeBase): { valid: boolean; errors?: string[] } {
    const baseValidation = super.validate(node);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];

    try {
      const params = DelayNodeParamsSchema.parse(node.params);

      if (params.duration < 0) {
        errors.push('延时时间不能为负数');
      }
    } catch (error) {
      errors.push('参数配置无效');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  getDefaultParams(): Record<string, any> {
    if (this.type === '') {
      return {};
    }
    return {
      duration: 1000,
    };
  }
}
