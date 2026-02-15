import React, { useCallback, useMemo, useState } from 'react';
import { Button, Flex, message, Modal } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { ProForm, ProFormItemRender, ProFormText } from '@ant-design/pro-components';

import type { EntityModel } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { entityModelActions } from '@/store/entityModelSlice/entityModelSlice';
import {
  selectEditingEntityModel,
  selectIsEntityModelModalOpen,
} from '@/store/componentTreeSlice/componentTreeSelectors';

import type { EnumOption } from './entityModelDesignerTypes';
import { EntityModelDesignerSubModals } from './EntityModelDesignerSubModals';
import { EntityModelFieldsTable } from './EntityModelFieldsTable';
import { useEnumAdvancedModal } from './hooks/useEnumAdvancedModal';
import { useSqlImportModal } from './hooks/useSqlImportModal';
import { useSyncFormOnModalOpen } from './hooks/useSyncFormOnModalOpen';
import * as styles from './styles.css';

export const EntityModelDesignerPanel = React.memo(() => {
  const isOpen = useAppSelector(selectIsEntityModelModalOpen);
  const [fieldEditableKeys, setFieldEditableKeys] = useState<React.Key[]>([]);
  const dispatch = useAppDispatch();
  const editingEntityModel = useAppSelector(selectEditingEntityModel);
  const [form] = ProForm.useForm<EntityModel>();

  useSyncFormOnModalOpen({ isOpen, editingEntityModel, form });

  const sqlImportModal = useSqlImportModal({ dispatch });
  const enumAdvancedModal = useEnumAdvancedModal({
    form,
    entityModelId: editingEntityModel?.id,
    dispatch,
  });

  const closeEnumAdvancedModal = enumAdvancedModal.close;
  const closeSqlImportModal = sqlImportModal.close;

  const currentTableEditingKey = fieldEditableKeys?.length ? String(fieldEditableKeys[0]) : null;
  const isTableEditing = Boolean(currentTableEditingKey);

  const primaryKey = ProForm.useWatch('primaryKey', form);

  const setAsPrimaryKey = useCallback(
    (key: string) => {
      const nextKey = String(key || '').trim();
      if (!nextKey) {
        message.warning('请先填写字段 key');
        return;
      }
      form.setFieldValue('primaryKey', nextKey);
      message.success(`已设置主键：${nextKey}`);
    },
    [form],
  );

  const onClose = useCallback(() => {
    // Close main modal
    dispatch(entityModelActions.closeEntityModelModal());
    // Also reset sub-modals state to avoid stale or dangling UI
    closeEnumAdvancedModal();
    closeSqlImportModal();
  }, [dispatch, closeEnumAdvancedModal, closeSqlImportModal]);

  const handleSaveEntity = useCallback(() => {
    if (isTableEditing) {
      message.warning('请先完成当前行编辑');
      return;
    }

    if (enumAdvancedModal.isOpen) {
      message.warning('请先完成字段高级编辑');
      return;
    }

    dispatch(entityModelActions.applyEntityModelChange(form.getFieldsValue()));
    message.success('已保存');
    onClose();
  }, [isTableEditing, enumAdvancedModal.isOpen, dispatch, form, onClose]);

  const enumTableColumns = useMemo<ProColumns<EnumOption>[]>(() => {
    return [
      {
        title: '名称',
        dataIndex: 'label',
        width: 220,
        formItemProps: {
          rules: [{ required: true, whitespace: true, message: '请输入名称' }],
        },
      },
      {
        title: '值',
        dataIndex: 'value',
        width: 220,
        formItemProps: {
          rules: [{ required: true, whitespace: true, message: '请输入值' }],
        },
      },
    ];
  }, []);

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={onClose}
        width="1200px"
        title="实体类型设计器"
        destroyOnClose
        afterClose={() => form.resetFields()}
        onOk={handleSaveEntity}
        okText="保存"
      >
        <Flex justify="flex-end" className={styles.actionsRow}>
          <Button onClick={sqlImportModal.open}>从 SQL 导入</Button>
        </Flex>
        <ProForm<EntityModel> grid labelAlign="left" form={form} submitter={false}>
          <ProFormText
            label="title"
            name="title"
            tooltip="展示名称（用于页面/字段面板提示）"
            placeholder="例如：用户"
            colProps={{ xs: 12 }}
          />
          <ProFormText
            label="name"
            name="name"
            tooltip="程序化标识（用于生成 TS 类型名，建议英文/驼峰）"
            placeholder="例如：User"
            colProps={{ xs: 12 }}
          />
          <ProFormText label="primaryKey" name="primaryKey" hidden />
          <ProFormItemRender
            name="fields"
            label="字段列表"
            layout="vertical"
            tooltip="定义该实体类型包含的字段"
            className={styles.fullWidth}
          >
            {(props) => (
              <EntityModelFieldsTable
                value={props.value || []}
                onChange={props.onChange}
                primaryKey={primaryKey}
                onSetPrimaryKey={setAsPrimaryKey}
                isTableEditing={isTableEditing}
                currentTableEditingKey={currentTableEditingKey}
                fieldEditableKeys={fieldEditableKeys}
                setFieldEditableKeys={setFieldEditableKeys}
                onOpenEnumAdvanced={enumAdvancedModal.openForField}
              />
            )}
          </ProFormItemRender>
        </ProForm>
      </Modal>

      <EntityModelDesignerSubModals
        sqlImportModal={sqlImportModal}
        enumAdvancedModal={enumAdvancedModal}
        enumTableColumns={enumTableColumns}
      />
    </>
  );
});
