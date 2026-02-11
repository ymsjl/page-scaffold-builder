import { BaseNodeStrategy } from "./BaseNodeStrategy";
import type { ActionNodeBase, FlowExecutionContext, Port } from "@/types/actions";
import { DelayNodeParamsSchema } from "@/types/actions";

/**
 * 延时节点策略
 */
export class DelayNodeStrategy extends BaseNodeStrategy {
  type = "delay";
  label = "Delay";
  description = "延时等待";
  icon = "ClockCircleOutlined";
  category = "control" as const;

  async execute(
    node: ActionNodeBase,
    inputs: Record<string, any>,
    _context: FlowExecutionContext
  ): Promise<Record<string, any>> {
    const params = DelayNodeParamsSchema.parse(node.params);
    
    const duration = this.getInput(inputs, "duration", params.duration);
    
    this.log(`Delaying for ${duration}ms`);
    
    await new Promise((resolve) => setTimeout(resolve, duration));

    return this.createOutput({
      success: true,
      duration,
    });
  }

  getInputPorts(_node: ActionNodeBase): Port[] {
    return [
      { id: "trigger", name: "Trigger", type: "exec", required: false },
      { id: "duration", name: "Duration (ms)", type: "number", required: false },
    ];
  }

  getOutputPorts(_node: ActionNodeBase): Port[] {
    return [
      { id: "completed", name: "Completed", type: "exec", required: false },
      { id: "success", name: "Success", type: "boolean", required: false },
    ];
  }

  validate(node: ActionNodeBase): { valid: boolean; errors?: string[] } {
    const baseValidation = super.validate(node);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];
    
    try {
      const params = DelayNodeParamsSchema.parse(node.params);
      
      if (params.duration < 0) {
        errors.push("延时时间不能为负数");
      }
    } catch (error) {
      errors.push("参数配置无效");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  getDefaultParams(): Record<string, any> {
    return {
      duration: 1000,
    };
  }
}
