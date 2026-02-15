import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import * as styles from './CustomNode.css';

/**
 * 节点类型到图标的映射
 */
const NODE_TYPE_ICONS: Record<string, string> = {
  'control.entry': '🚀',
  'control.exit': '🏁',
  'control.condition': '🔀',
  'control.loop': '🔁',
  'control.parallel': '⚡',
  'control.delay': '⏱️',
  'data.transform': '🔄',
  'data.merge': '🔗',
  'data.filter': '🔍',
  'action.httpRequest': '🌐',
  'action.navigate': '➡️',
  'action.showMessage': '💬',
  'action.confirm': '❓',
  'component.table.refresh': '📊',
  'component.form.submit': '📝',
  'component.form.validate': '✅',
  'component.form.reset': '🔄',
  'component.modal.open': '📋',
  'component.modal.close': '❌',
};

/**
 * 节点类型到颜色的映射
 */
const NODE_TYPE_COLORS: Record<string, string> = {
  control: '#1890ff',
  data: '#52c41a',
  action: '#fa8c16',
  component: '#722ed1',
};

/**
 * 获取节点类型的前缀（用于确定颜色）
 */
function getNodeTypePrefix(type: string): string {
  return type.split('.')[0] || 'action';
}

/**
 * 自定义节点组件
 */
export const CustomNode = memo<NodeProps>(({ data, selected }) => {
  const { type, label, params } = data as any; // 使用 any 避免类型冲突
  const typePrefix = getNodeTypePrefix(type);
  const color = NODE_TYPE_COLORS[typePrefix] || NODE_TYPE_COLORS.action;
  const icon = NODE_TYPE_ICONS[type] || '📦';

  // 获取端口配置（使用正确的属性名 inputs/outputs）
  const inputs = (data as any).inputs || [];
  const outputs = (data as any).outputs || [];

  // 检查是否有特定类型的端口
  const hasDataInput = inputs.some((p: any) => p.type !== 'exec');
  const hasExecInput = inputs.some((p: any) => p.type === 'exec');
  const hasDataOutput = outputs.some((p: any) => p.type !== 'exec');
  const hasExecOutput = outputs.some((p: any) => p.type === 'exec');

  // 如果节点没有定义任何端口，显示默认的连接点
  const showDefaultHandles = inputs.length === 0 && outputs.length === 0;

  return (
    <div
      className={`${styles.customNode} ${selected ? styles.customNodeSelected : ''}`}
      style={{ borderColor: color }}
    >
      {/* 输入端口 - 如果没有定义端口，显示默认连接点 */}
      {(showDefaultHandles || hasExecInput || hasDataInput) && (
        <>
          {/* 执行流输入 */}
          {(showDefaultHandles || hasExecInput) && (
            <Handle
              type="target"
              position={Position.Top}
              id="exec-in"
              className={`${styles.handle} ${styles.handleExec} ${styles.handleTopLeft}`}
            />
          )}

          {/* 数据流输入 */}
          {(showDefaultHandles || hasDataInput) && (
            <Handle
              type="target"
              position={Position.Left}
              id="data-in"
              className={`${styles.handle} ${styles.handleData}`}
            />
          )}
        </>
      )}

      {/* 节点内容 */}
      <div className={styles.customNodeHeader} style={{ backgroundColor: color }}>
        <span className={styles.customNodeIcon}>{icon}</span>
        <span className={styles.customNodeType}>{type.split('.').pop()}</span>
      </div>

      <div className={styles.customNodeBody}>
        <div className={styles.customNodeName}>{label || '未命名节点'}</div>
        {params && Object.keys(params).length > 0 && (
          <div className={styles.customNodeParams}>
            {Object.entries(params)
              .slice(0, 2)
              .map(([key, value]) => (
                <div key={key} className={styles.customNodeParam}>
                  <span className={styles.paramKey}>{key}:</span>
                  <span className={styles.paramValue}>
                    {String(value).length > 20 ? `${String(value).slice(0, 20)}...` : String(value)}
                  </span>
                </div>
              ))}
            {Object.keys(params).length > 2 && (
              <div className={styles.customNodeParamMore}>
                +{Object.keys(params).length - 2} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* 输出端口 - 如果没有定义端口，显示默认连接点 */}
      {(showDefaultHandles || hasExecOutput || hasDataOutput) && (
        <>
          {/* 执行流输出 */}
          {(showDefaultHandles || hasExecOutput) && (
            <Handle
              type="source"
              position={Position.Bottom}
              id="exec-out"
              className={`${styles.handle} ${styles.handleExec} ${styles.handleTopRight}`}
            />
          )}

          {/* 数据流输出 */}
          {(showDefaultHandles || hasDataOutput) && (
            <Handle
              type="source"
              position={Position.Right}
              id="data-out"
              className={`${styles.handle} ${styles.handleData}`}
            />
          )}
        </>
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
