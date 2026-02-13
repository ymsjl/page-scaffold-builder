import { BaseNodeStrategy } from "./BaseNodeStrategy";
import type {
  ActionNodeBase,
  FlowExecutionContext,
  Port,
} from "@/types/actions";
import { HttpRequestNodeParamsSchema } from "@/types/actions";

/**
 * HTTP 请求节点策略
 */
export class HttpRequestNodeStrategy extends BaseNodeStrategy {
  type = "httpRequest";
  label = "HTTP Request";
  description = "发起 HTTP 请求";
  icon = "GlobalOutlined";
  category = "action" as const;

  async execute(
    node: ActionNodeBase,
    inputs: Record<string, any>,
    _context: FlowExecutionContext,
  ): Promise<Record<string, any>> {
    // 解析并验证参数
    const params = HttpRequestNodeParamsSchema.parse(node.params);

    // 允许从输入端口覆盖参数
    const url = this.getInput(inputs, "url", params.url);
    const method = this.getInput(inputs, "method", params.method);
    const body = this.getInput(inputs, "body", params.body);
    const headers = {
      ...params.headers,
      ...this.getInput(inputs, "headers", {}),
    };

    this.log(`Executing HTTP ${method} ${url}`);

    try {
      const controller = new AbortController();
      const timeoutId = params.timeout
        ? setTimeout(() => controller.abort(), params.timeout)
        : undefined;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      let data: any;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return this.createOutput({
        response: data,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });
    } catch (error) {
      this.logError("HTTP request failed", error);
      throw new Error(
        `HTTP Request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  getInputPorts(_node: ActionNodeBase): Port[] {
    return [
      { id: "trigger", name: "Trigger", type: "exec", required: false },
      { id: "url", name: "URL", type: "string", required: false },
      { id: "method", name: "Method", type: "string", required: false },
      { id: "headers", name: "Headers", type: "object", required: false },
      { id: "body", name: "Body", type: "any", required: false },
    ];
  }

  getOutputPorts(_node: ActionNodeBase): Port[] {
    return [
      { id: "success", name: "Success", type: "exec", required: false },
      { id: "error", name: "Error", type: "exec", required: false },
      { id: "response", name: "Response", type: "any", required: false },
      { id: "status", name: "Status Code", type: "number", required: false },
      {
        id: "statusText",
        name: "Status Text",
        type: "string",
        required: false,
      },
      {
        id: "headers",
        name: "Response Headers",
        type: "object",
        required: false,
      },
    ];
  }

  validate(node: ActionNodeBase): { valid: boolean; errors?: string[] } {
    const baseValidation = super.validate(node);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];

    try {
      const params = HttpRequestNodeParamsSchema.parse(node.params);

      if (!params.url || params.url.trim() === "") {
        errors.push("URL 不能为空");
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
      url: "",
      method: "GET",
      headers: {},
      timeout: 30000,
    };
  }
}
