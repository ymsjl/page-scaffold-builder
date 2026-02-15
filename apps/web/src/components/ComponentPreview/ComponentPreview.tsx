import React from 'react';
import { Button, Space, message } from 'antd';
import { EyeOutlined, EditOutlined, ExportOutlined } from '@ant-design/icons';
import {
  selectFirstParentPageNode,
  selectComponentTreeState,
} from '@/store/componentTree/componentTreeSelectors';
import { getComponentPrototype } from '../../componentMetas';
import { useAppSelector } from '../../store/hooks';
import ComponentPreviewInner from './ComponentPreviewInner';
import * as previewStyles from './previewStyles.css';
import { PreviewModeProvider, type PreviewMode } from './previewMode';

interface ComponentPreviewProps {
  initialMode?: PreviewMode;
  hideToolbar?: boolean;
  containerVariant?: 'builder' | 'final';
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  initialMode = 'edit',
  hideToolbar = false,
  containerVariant = 'builder',
}) => {
  const [mode, setMode] = React.useState<PreviewMode>(initialMode);
  const rootNode = useAppSelector(selectFirstParentPageNode);
  const componentTreeState = useAppSelector(selectComponentTreeState);
  if (!rootNode)
    return <div className={previewStyles.emptyState}>请选择一个组件实例以查看预览</div>;

  const componentPrototype = getComponentPrototype(rootNode.type, {
    previewMode: mode,
  });

  if (!componentPrototype) {
    return <div className={previewStyles.errorState}>未知的组件类型: {rootNode.type}</div>;
  }

  const handleOpenNewWindowPreview = () => {
    try {
      const sid = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const storageKey = `psb.previewSnapshot.${sid}`;

      const snapshot = {
        version: 1,
        createdAt: Date.now(),
        componentTree: {
          selectedNodeId: componentTreeState.selectedNodeId,
          normalizedTree: componentTreeState.normalizedTree,
          entityModel: componentTreeState.entityModel,
          variables: componentTreeState.variables,
          variableValues: componentTreeState.variableValues,
        },
      };

      localStorage.setItem(storageKey, JSON.stringify(snapshot));

      const url = new URL(window.location.href);
      url.searchParams.set('previewOnly', '1');
      url.searchParams.set('sid', sid);

      const win = window.open(url.toString(), '_blank', 'noopener,noreferrer');
      if (!win) {
        message.error('浏览器阻止了新窗口预览，请允许弹窗后重试');
      }
    } catch (err) {
      message.error('打开新窗口预览失败');
    }
  };

  return (
    <>
      {!hideToolbar ? (
        <div className={previewStyles.toolbar}>
          <div className={previewStyles.toolbarContainer}>
            <Space size={8}>
              <Space.Compact>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  shape="round"
                  type={mode === 'edit' ? 'primary' : 'default'}
                  onClick={() => setMode('edit')}
                  title="编辑预览"
                />
                <Button
                  icon={<EyeOutlined />}
                  size="small"
                  shape="round"
                  type={mode === 'pure' ? 'primary' : 'default'}
                  onClick={() => setMode('pure')}
                  title="纯预览"
                />
              </Space.Compact>

              <Button
                icon={<ExportOutlined />}
                size="small"
                shape="round"
                onClick={handleOpenNewWindowPreview}
                title="在新窗口打开预览"
              />
            </Space>
          </div>
        </div>
      ) : null}

      <PreviewModeProvider mode={mode}>
        <ComponentPreviewInner
          node={rootNode}
          componentPrototype={componentPrototype}
          containerVariant={containerVariant}
        />
      </PreviewModeProvider>
    </>
  );
};

export default ComponentPreview;
