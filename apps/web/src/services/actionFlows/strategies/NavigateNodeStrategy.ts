import type { ActionNodeBase, FlowExecutionContext, Port } from '@/types/actions';
import { NavigateNodeParamsSchema } from '@/types/actions';
import { BaseNodeStrategy } from './BaseNodeStrategy';

/**
 * 导航节点策略
 */
export class NavigateNodeStrategy extends BaseNodeStrategy {
  type = 'navigate';

  label = 'Navigate';

  description = '页面导航';

  icon = 'LinkOutlined';

  category = 'action' as const;

  async execute(
    node: ActionNodeBase,
    inputs: Record<string, any>,
    context: FlowExecutionContext,
  ): Promise<Record<string, any>> {
    const params = NavigateNodeParamsSchema.parse(node.params);

    const path = this.getInput(inputs, 'path', params.path);
    const query = this.getInput(inputs, 'query', params.query);
    const openInNewTab = this.getInput(inputs, 'openInNewTab', params.openInNewTab);
    const replace = this.getInput(inputs, 'replace', params.replace);

    this.log(`Navigating to ${path}`, { query, openInNewTab, replace, flowId: context.flowId });

    try {
      const url = new URL(path, window.location.origin);

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      if (openInNewTab) {
        window.open(url.toString(), '_blank');
      } else if (replace) {
        window.location.replace(url.toString());
      } else {
        window.location.href = url.toString();
      }

      return this.createOutput({
        success: true,
        url: url.toString(),
      });
    } catch (error) {
      this.logError('Navigation failed', error);
      throw new Error(
        `Navigation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  getInputPorts(node: ActionNodeBase): Port[] {
    const inheritedPorts = super.getInputPorts(node);
    if (inheritedPorts.length > 0) {
      return inheritedPorts;
    }
    return [
      { id: 'trigger', name: 'Trigger', type: 'exec', required: false },
      { id: 'path', name: 'Path', type: 'string', required: false },
      { id: 'query', name: 'Query Params', type: 'object', required: false },
      {
        id: 'openInNewTab',
        name: 'Open in New Tab',
        type: 'boolean',
        required: false,
      },
      { id: 'replace', name: 'Replace', type: 'boolean', required: false },
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
      { id: 'url', name: 'URL', type: 'string', required: false },
    ];
  }

  validate(node: ActionNodeBase): { valid: boolean; errors?: string[] } {
    const baseValidation = super.validate(node);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];

    try {
      const params = NavigateNodeParamsSchema.parse(node.params);

      if (!params.path || params.path.trim() === '') {
        errors.push('路径不能为空');
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
      path: '/',
      openInNewTab: false,
      replace: false,
    };
  }
}
