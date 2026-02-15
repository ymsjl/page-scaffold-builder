import React from 'react';
import { Input, Modal } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-components';

import type { EnumOption } from './entityModelDesignerTypes';
import { makeRandomId } from './entityModelDesignerUtils';
import { type useEnumAdvancedModal } from './hooks/useEnumAdvancedModal';
import { type useSqlImportModal } from './hooks/useSqlImportModal';

const PLACEHOLDER_SQL = `CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  birthday DATE,
  gender ENUM('male', 'female') NOT NULL
);`;

export const EntityModelDesignerSubModals = (props: {
  sqlImportModal: ReturnType<typeof useSqlImportModal>;
  enumAdvancedModal: ReturnType<typeof useEnumAdvancedModal>;
  enumTableColumns: ProColumns<EnumOption>[];
}) => {
  const { sqlImportModal, enumAdvancedModal, enumTableColumns } = props;

  return (
    <>
      <Modal
        title="从 SQL 导入"
        open={sqlImportModal.isOpen}
        onCancel={sqlImportModal.close}
        onOk={sqlImportModal.importSql}
        okText="解析并导入"
        confirmLoading={sqlImportModal.isParsing}
      >
        <Input.TextArea
          rows={6}
          defaultValue={PLACEHOLDER_SQL}
          placeholder="请输入 MySQL CREATE TABLE 语句"
          value={sqlImportModal.sqlInput}
          onChange={(event) => sqlImportModal.setSqlInput(event.target.value)}
        />
      </Modal>

      <Modal
        title="枚举高级设置"
        open={enumAdvancedModal.isOpen}
        onCancel={enumAdvancedModal.close}
        onOk={enumAdvancedModal.save}
        okText="完成"
        destroyOnClose
      >
        <EditableProTable<EnumOption>
          rowKey="id"
          size="small"
          columns={enumTableColumns}
          value={enumAdvancedModal.enumOptions}
          onChange={(next) => enumAdvancedModal.setEnumOptions([...(next || [])])}
          recordCreatorProps={{
            position: 'bottom',
            newRecordType: 'dataSource',
            creatorButtonText: '新增枚举项',
            record: () => ({
              id: makeRandomId('enum'),
              label: '',
              value: '',
            }),
          }}
          editable={{
            type: 'multiple',
            editableKeys: enumAdvancedModal.editableKeys,
            onValuesChange: (_record, recordList) => {
              enumAdvancedModal.setEnumOptions([...(recordList || [])]);
            },
            actionRender: () => [],
          }}
          pagination={false}
          search={false}
          options={false}
        />
      </Modal>
    </>
  );
};
