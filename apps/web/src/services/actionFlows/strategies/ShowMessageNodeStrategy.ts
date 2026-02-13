import { BaseNodeStrategy } from "./BaseNodeStrategy";
import type {
  ActionNodeBase,
  FlowExecutionContext,
  Port,
} from "@/types/actions";
import { ShowMessageNodeParamsSchema } from "@/types/actions";
import { message } from "antd";

/**
 * 消息提示节点策略
 */
export class ShowMessageNodeStrategy extends BaseNodeStrategy {
  type = "showMessage";
  label = "Show Message";
  description = "显示消息提示";
  icon = "MessageOutlined";
  category = "action" as const;

  async execute(
    node: ActionNodeBase,
    inputs: Record<string, any>,
    _context: FlowExecutionContext,
  ): Promise<Record<string, any>> {
    const params = ShowMessageNodeParamsSchema.parse(node.params);

    const messageType = this.getInput(
      inputs,
      "messageType",
      params.messageType,
    );
    const content = this.getInput(inputs, "content", params.content);
    const duration = this.getInput(inputs, "duration", params.duration);

    this.log(`Showing ${messageType} message: ${content}`);

    try {
      // 显示消息（duration 单位是毫秒，antd 需要秒）
      if (messageType === "success") {
        message.success(content, duration / 1000);
      } else if (messageType === "error") {
        message.error(content, duration / 1000);
      } else if (messageType === "warning") {
        message.warning(content, duration / 1000);
      } else {
        message.info(content, duration / 1000);
      }

      return this.createOutput({
        success: true,
        messageType,
        content,
      });
    } catch (error) {
      this.logError("Show message failed", error);
      throw new Error(
        `Show message failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  getInputPorts(_node: ActionNodeBase): Port[] {
    return [
      { id: "trigger", name: "Trigger", type: "exec", required: false },
      { id: "messageType", name: "Type", type: "string", required: false },
      { id: "content", name: "Content", type: "string", required: false },
      {
        id: "duration",
        name: "Duration (ms)",
        type: "number",
        required: false,
      },
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
      const params = ShowMessageNodeParamsSchema.parse(node.params);

      if (!params.content || params.content.trim() === "") {
        errors.push("消息内容不能为空");
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
      messageType: "info",
      content: "",
      duration: 3000,
    };
  }
}
