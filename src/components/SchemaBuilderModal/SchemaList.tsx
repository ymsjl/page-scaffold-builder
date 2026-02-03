import React, { useCallback, useMemo } from "react";
import { Modal, List, Button, Space, Empty, Tag, message, Flex } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";
import { DeleteOutlined, EditOutlined, NodeExpandOutlined } from "@ant-design/icons";
import type { ComponentInstance, ProCommonColumn } from "@/types";
import SchemaBuilderModal from "./SchemaBuilderModal";
import { selectComponentTreeState, selectEditingColumn, selectEntityModelInUse, selectSelectedNode } from "@/store/componentTree/componentTreeSelectors";
import { createProCommonColumnFromSchemeField } from "./useAutoFillByDataIndex";

const ValueTyps =
  [
    { label: "文本", value: "text" },
    { label: "文本域", value: "textarea" },
    { label: "密码", value: "password" },
    { label: "数字", value: "digit" },
    { label: "日期", value: "date" },
    { label: "日期时间", value: "dateTime" },
    { label: "日期范围", value: "dateRange" },
    { label: "时间", value: "time" },
    { label: "下拉选择", value: "select" },
    { label: "多选", value: "checkbox" },
    { label: "单选", value: "radio" },
    { label: "开关", value: "switch" },
    { label: "进度条", value: "progress" },
    { label: "百分比", value: "percent" },
    { label: "金额", value: "money" },
  ]

interface SchemaListProps {
  selectedEntityModelId?: string;
}

export const SchemaList: React.FC<SchemaListProps> = React.memo(({ selectedEntityModelId }) => {
  const selectedNode = useAppSelector(selectSelectedNode) as ComponentInstance | null;
  const columns = useMemo(() => selectedNode?.props?.columns ?? ([] as ProCommonColumn[]), [selectedNode]);
  const dispatch = useAppDispatch();
  const editingColumn = useAppSelector(selectEditingColumn);
  const isDrawerOpen = useAppSelector((state) => selectComponentTreeState(state).isSchemaBuilderModalOpen);
  const entityFields = useAppSelector(selectEntityModelInUse)?.fields || [];
  const handleStartEdit = (field: ProCommonColumn) => dispatch(componentTreeActions.startEditingColumn(field));

  // 删除字段
  const handleDelete = (key: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个字段吗？",
      onOk: () => {
        dispatch(componentTreeActions.deleteColumnForSelectedNode(key));
        message.success("字段已删除");
      },
    });
  };

  const handleFinish: React.ComponentProps<typeof SchemaBuilderModal>["onFinish"] = (values) => {
    dispatch(componentTreeActions.applyChangesToColumnOfSelectedNode(values));
    dispatch(componentTreeActions.setEditingColumn(null));
  };

  const handleFinishAndNext: React.ComponentProps<typeof SchemaBuilderModal>["onFinishAndNext"] = (values) => {
    handleFinish(values)
  }

  const handleAddColumnsFromEntityModel = useCallback(() => {
    if (!selectedNode?.id || entityFields.length === 0) return;
    dispatch(
      componentTreeActions.updateNode({
        id: selectedNode.id,
        updates: {
          props: {
            ...selectedNode.props,
            columns: entityFields.map(createProCommonColumnFromSchemeField),
          },
        },
      }),
    );
  }, [dispatch, entityFields, selectedNode]);

  return (
    <>
      <SchemaBuilderModal
        title={`配置 ${selectedNode?.name} 的 Columns`}
        componentType={selectedNode?.type}
        editingColumn={editingColumn}
        isOpen={isDrawerOpen}
        onClose={() => dispatch(componentTreeActions.setIsSchemaBuilderModalOpen(false))}
        onFinish={handleFinish}
        onFinishAndNext={handleFinishAndNext}
      />
      <Space
        direction="vertical"
        style={{ width: "100%" }}
        size="middle"
      >
        {columns.length === 0
          ? (
            <Empty
              description="暂无字段，点击上方按钮添加"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                hidden={entityFields.length === 0}
                title="从实体模型添加列定义"
                onClick={handleAddColumnsFromEntityModel}
                icon={<NodeExpandOutlined />}
              >
                从实体模型添加列定义
              </Button>
            </Empty>
          )
          : (
            <List<ProCommonColumn>
              dataSource={columns}
              renderItem={(field, index) => {
                const valueTypeLabel = ValueTyps.find((opt) => opt.value === field.valueType)?.label ||
                  field.valueType;

                return (
                  <List.Item key={field.key}>
                    <Flex gap={8} style={{ width: "100%" }}>
                      <div style={{ flex: 1 }}>{field.title}</div>
                      <Flex gap={8} wrap="wrap">
                        <Tag color="blue" >{valueTypeLabel}</Tag>
                      </Flex>
                      <Space size="small">
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleStartEdit(field)}
                        />
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(field.key as string)}
                        />
                      </Space>
                    </Flex>
                  </List.Item>
                );
              }}
            />
          )}
      </Space>
    </>
  );
});

SchemaList.displayName = "SchemaList";

export default SchemaList;
