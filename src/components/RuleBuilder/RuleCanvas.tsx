import React, { memo, useCallback, useMemo } from "react";
import {
  Card,
  Space,
  Typography,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import { DeleteOutlined } from "@ant-design/icons";
import { getDefaultRuleMessage } from "./utils/ruleMapping";
import { PATTERN_PRESETS as VALIDATE_PRESETS } from "../../utils/validate";
import type { RuleNode } from "./utils/ruleMapping";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  ruleBuilderActions,
  selectRuleNodes,
  selectSelectedRuleItemId,
} from "@/store/slices/ruleBuilderSlice";

// Hoist static presets to avoid recreating them on each render
const UI_PATTERN_PRESETS = [
  {
    key: "phoneNigeria",
    label: "尼日利亚手机号",
    value:
      VALIDATE_PRESETS?.phoneNigeria?.pattern?.source ??
      "^0(70|80|81|90|91|98)\\d{8}$",
  },
  {
    key: "phoneChina",
    label: "中国手机号",
    value: VALIDATE_PRESETS?.phoneChina?.pattern?.source ?? "^1[3-9]\\d{9}$",
  },
  {
    key: "email",
    label: "邮箱",
    value:
      VALIDATE_PRESETS?.email?.pattern?.source ??
      "^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$",
  },
  {
    key: "alpha",
    label: "字母",
    value: VALIDATE_PRESETS?.alpha?.pattern?.source ?? "^[A-Za-z]+$",
  },
  {
    key: "numeric",
    label: "数字",
    value: VALIDATE_PRESETS?.numeric?.pattern?.source ?? "^\\d+$",
  },
  { key: "custom", label: "自定义", value: "" },
];

const getNodeTitle = (node: RuleNode) => {
  switch (node.type) {
    case "required":
      return "必填";
    case "length":
      return "文本长度";
    case "range":
      return "数字范围";
    case "pattern":
      return "正则表达式";
    case "dateRange":
      return "日期范围";
    case "dateMin":
      return "最早日期";
    case "dateMax":
      return "最晚日期";
    case "dateSpan":
      return "日期跨度";
    default:
      return node.type;
  }
};

// Small helpers to keep rendering logic readable and memoizable
const getLengthDefaultOperator = (params: any) => {
  if (params?.operator) return params.operator;
  if (params?.len !== undefined) return "eq";
  if (params?.min !== undefined && params?.max !== undefined) return "between";
  if (params?.min !== undefined) return "gte";
  if (params?.max !== undefined) return "lte";
  return "between";
};

const getRangeDefaultOperator = (params: any) => {
  if (params?.operator) return params.operator;
  if (params?.min !== undefined && params?.max !== undefined)
    return params.min === params.max ? "eq" : "between";
  if (params?.min !== undefined) return "gte";
  if (params?.max !== undefined) return "lte";
  return "between";
};

const getDateDefaultOperator = (type: string, params: any) => {
  if (params?.operator) return params.operator;
  if (type === "dateMin") return "gte";
  if (type === "dateMax") return "lte";
  if (params?.minDate && params?.maxDate)
    return params.minDate === params.maxDate ? "eq" : "between";
  if (params?.minDate) return "gte";
  if (params?.maxDate) return "lte";
  return "between";
};

type RuleItemProps = {
  node: RuleNode;
  isSelected: boolean;
};

const RuleItem: React.FC<RuleItemProps> = memo(function RuleItem({
  node,
  isSelected,
}) {
  const dispatch = useAppDispatch();

  const style = useMemo<React.CSSProperties>(
    () => ({
      background: node.enabled ? undefined : "#fafafa",
      border: isSelected ? "1px solid #1677ff" : undefined,
    }),
    [node.enabled, isSelected],
  );

  const updateParams = useCallback(
    (next: Record<string, any>) => {
      const params = { ...(node.params || {}), ...next };
      dispatch(
        ruleBuilderActions.updateNode({
          ...node,
          params,
          message: node.message || getDefaultRuleMessage({ ...node, params }),
        }),
      );
    },
    [node, dispatch],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(ruleBuilderActions.deleteNode(node.id));
    },
    [dispatch, node.id],
  );

  // Memoized derived values
  const patternSelectedKey = useMemo(() => {
    const p = node.params?.pattern || "";
    const found = UI_PATTERN_PRESETS.find(
      (preset) => preset.value === p && preset.key !== "custom",
    );
    return found ? found.key : "custom";
  }, [node.params?.pattern]);

  const lengthOp = useMemo(
    () => getLengthDefaultOperator(node.params),
    [node.params],
  );
  const rangeOp = useMemo(
    () => getRangeDefaultOperator(node.params),
    [node.params],
  );
  const dateOp = useMemo(
    () => getDateDefaultOperator(node.type, node.params),
    [node.type, node.params],
  );

  return (
    <Card
      size="small"
      style={style}
      title={<Typography.Text strong>{getNodeTitle(node)}</Typography.Text>}
      extra={
        <Space wrap>
          <button
            aria-label="delete"
            onClick={handleDelete}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <DeleteOutlined />
          </button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size={6}>
        <div onClick={(e) => e.stopPropagation()}>
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, display: "block", marginBottom: 6 }}
          >
            {node.message || "未设置提示"}
          </Typography.Text>

          {node.type === "length" ? (
            <>
              <Row gutter={8} wrap align="middle">
                <Col span={6}>
                  <Select
                    value={node.params?.operator ?? lengthOp}
                    onChange={(op: any) => {
                      if (op === "eq") {
                        const len =
                          node.params?.len ?? node.params?.min ?? undefined;
                        updateParams({
                          operator: "eq",
                          len,
                          min: undefined,
                          max: undefined,
                        });
                      } else if (op === "between") {
                        const min =
                          node.params?.min ?? node.params?.len ?? undefined;
                        const max = node.params?.max ?? undefined;
                        updateParams({
                          operator: "between",
                          min,
                          max,
                          len: undefined,
                        });
                      } else if (op === "gte") {
                        const min =
                          node.params?.min ?? node.params?.len ?? undefined;
                        updateParams({
                          operator: "gte",
                          min,
                          max: undefined,
                          len: undefined,
                        });
                      } else if (op === "lte") {
                        const max =
                          node.params?.max ?? node.params?.len ?? undefined;
                        updateParams({
                          operator: "lte",
                          max,
                          min: undefined,
                          len: undefined,
                        });
                      }
                    }}
                    options={[
                      { label: "介于", value: "between" },
                      { label: "等于", value: "eq" },
                      { label: "大于或等于", value: "gte" },
                      { label: "小于或等于", value: "lte" },
                    ]}
                    style={{ width: "100%", marginBottom: 6 }}
                  />
                </Col>
                <Col span={18}>
                  {(node.params?.operator ?? lengthOp) === "eq" ? (
                    <InputNumber
                      style={{ width: "100%", marginBottom: 6 }}
                      placeholder="长度"
                      value={node.params?.len}
                      onChange={(val) =>
                        updateParams({ len: val ?? undefined })
                      }
                    />
                  ) : (
                    <Row gutter={8} wrap align="middle">
                      <Col span={12}>
                        <InputNumber
                          style={{ width: "100%", marginBottom: 6 }}
                          placeholder="最小长度"
                          value={node.params?.min}
                          onChange={(val) =>
                            updateParams({ min: val ?? undefined })
                          }
                        />
                      </Col>
                      <Col span={12}>
                        <InputNumber
                          style={{ width: "100%", marginBottom: 6 }}
                          placeholder="最大长度"
                          value={node.params?.max}
                          onChange={(val) =>
                            updateParams({ max: val ?? undefined })
                          }
                        />
                      </Col>
                    </Row>
                  )}
                </Col>
              </Row>
            </>
          ) : null}

          {node.type === "range" ? (
            <>
              <Row gutter={8} wrap align="middle">
                <Col span={6}>
                  <Select
                    value={node.params?.operator ?? rangeOp}
                    onChange={(op: any) => {
                      if (op === "eq") {
                        const v =
                          node.params?.min ?? node.params?.max ?? undefined;
                        updateParams({ operator: "eq", min: v, max: v });
                      } else if (op === "between") {
                        const min = node.params?.min ?? undefined;
                        const max = node.params?.max ?? undefined;
                        updateParams({ operator: "between", min, max });
                      } else if (op === "gte") {
                        const min = node.params?.min ?? undefined;
                        updateParams({ operator: "gte", min, max: undefined });
                      } else if (op === "lte") {
                        const max = node.params?.max ?? undefined;
                        updateParams({ operator: "lte", max, min: undefined });
                      }
                    }}
                    options={[
                      { label: "介于", value: "between" },
                      { label: "等于", value: "eq" },
                      { label: "大于或等于", value: "gte" },
                      { label: "小于或等于", value: "lte" },
                    ]}
                    style={{ width: "100%", marginBottom: 6 }}
                  />
                </Col>
                <Col span={18}>
                  {(node.params?.operator ?? rangeOp) === "eq" ? (
                    <InputNumber
                      style={{ width: "100%", marginBottom: 6 }}
                      placeholder="值"
                      value={node.params?.min ?? node.params?.max}
                      onChange={(val) =>
                        updateParams({
                          min: val ?? undefined,
                          max: val ?? undefined,
                        })
                      }
                    />
                  ) : (node.params?.operator ?? rangeOp) === "between" ? (
                    <Row gutter={8} wrap align="middle">
                      <Col span={12}>
                        <InputNumber
                          style={{ width: "100%", marginBottom: 6 }}
                          placeholder="最小值"
                          value={node.params?.min}
                          onChange={(val) =>
                            updateParams({ min: val ?? undefined })
                          }
                        />
                      </Col>
                      <Col span={12}>
                        <InputNumber
                          style={{ width: "100%", marginBottom: 6 }}
                          placeholder="最大值"
                          value={node.params?.max}
                          onChange={(val) =>
                            updateParams({ max: val ?? undefined })
                          }
                        />
                      </Col>
                    </Row>
                  ) : (node.params?.operator ?? rangeOp) === "gte" ? (
                    <InputNumber
                      style={{ width: "100%", marginBottom: 6 }}
                      placeholder="最小值"
                      value={node.params?.min}
                      onChange={(val) =>
                        updateParams({ min: val ?? undefined })
                      }
                    />
                  ) : (
                    <InputNumber
                      style={{ width: "100%", marginBottom: 6 }}
                      placeholder="最大值"
                      value={node.params?.max}
                      onChange={(val) =>
                        updateParams({ max: val ?? undefined })
                      }
                    />
                  )}
                </Col>
              </Row>
            </>
          ) : null}

          {node.type === "pattern" ? (
            <>
              <Row gutter={8}>
                <Col span={6}>
                  <Select
                    value={patternSelectedKey}
                    onChange={(key) => {
                      const preset = UI_PATTERN_PRESETS.find(
                        (p) => p.key === key,
                      );
                      if (!preset) return;
                      if (preset.key === "custom") {
                        const current = node.params?.pattern || "";
                        const isPresetValue = UI_PATTERN_PRESETS.some(
                          (pp) => pp.value === current && pp.key !== "custom",
                        );
                        updateParams({ pattern: isPresetValue ? "" : current });
                      } else {
                        updateParams({ pattern: preset.value });
                      }
                    }}
                    options={UI_PATTERN_PRESETS.map((p) => ({
                      label: p.label,
                      value: p.key,
                    }))}
                    style={{ width: "100%", marginBottom: 6 }}
                  />
                </Col>
                <Col span={18}>
                  <Input
                    placeholder="自定义正则表达式"
                    value={node.params?.pattern || ""}
                    onChange={(e) => updateParams({ pattern: e.target.value })}
                    disabled={patternSelectedKey !== "custom"}
                    style={{ marginBottom: 6 }}
                  />
                </Col>
              </Row>
            </>
          ) : null}

          {node.type === "dateMin" ||
          node.type === "dateMax" ||
          node.type === "dateRange" ? (
            <>
              <Row gutter={8} wrap align="middle">
                <Col span={6}>
                  <Select
                    value={node.params?.operator ?? dateOp}
                    onChange={(op: any) => {
                      if (op === "eq") {
                        const v =
                          node.params?.minDate ??
                          node.params?.maxDate ??
                          undefined;
                        updateParams({
                          operator: "eq",
                          minDate: v,
                          maxDate: v,
                        });
                      } else if (op === "between") {
                        const minDate = node.params?.minDate ?? undefined;
                        const maxDate = node.params?.maxDate ?? undefined;
                        updateParams({ operator: "between", minDate, maxDate });
                      } else if (op === "gte") {
                        const minDate = node.params?.minDate ?? undefined;
                        updateParams({
                          operator: "gte",
                          minDate,
                          maxDate: undefined,
                        });
                      } else if (op === "lte") {
                        const maxDate = node.params?.maxDate ?? undefined;
                        updateParams({
                          operator: "lte",
                          maxDate,
                          minDate: undefined,
                        });
                      }
                    }}
                    options={[
                      { label: "介于", value: "between" },
                      { label: "等于", value: "eq" },
                      { label: "晚于或等于", value: "gte" },
                      { label: "早于或等于", value: "lte" },
                    ]}
                    style={{ width: "100%", marginBottom: 6 }}
                  />
                </Col>
                <Col span={18}>
                  {(node.params?.operator ?? dateOp) === "eq" ? (
                    <DatePicker
                      style={{ width: "100%", marginBottom: 6 }}
                      value={
                        node.params?.minDate
                          ? dayjs(node.params.minDate)
                          : undefined
                      }
                      onChange={(date) =>
                        updateParams({
                          minDate: date ? date.format("YYYY-MM-DD") : undefined,
                          maxDate: date ? date.format("YYYY-MM-DD") : undefined,
                        })
                      }
                    />
                  ) : (node.params?.operator ?? dateOp) === "between" ? (
                    <Row gutter={8} wrap align="middle">
                      <Col span={12}>
                        <DatePicker
                          style={{ width: "100%", marginBottom: 6 }}
                          placeholder="开始日期"
                          value={
                            node.params?.minDate
                              ? dayjs(node.params.minDate)
                              : undefined
                          }
                          onChange={(date) =>
                            updateParams({
                              minDate: date
                                ? date.format("YYYY-MM-DD")
                                : undefined,
                            })
                          }
                        />
                      </Col>
                      <Col span={12}>
                        <DatePicker
                          style={{ width: "100%", marginBottom: 6 }}
                          placeholder="结束日期"
                          value={
                            node.params?.maxDate
                              ? dayjs(node.params.maxDate)
                              : undefined
                          }
                          onChange={(date) =>
                            updateParams({
                              maxDate: date
                                ? date.format("YYYY-MM-DD")
                                : undefined,
                            })
                          }
                        />
                      </Col>
                    </Row>
                  ) : (node.params?.operator ?? dateOp) === "gte" ? (
                    <DatePicker
                      style={{ width: "100%", marginBottom: 6 }}
                      placeholder="开始日期"
                      value={
                        node.params?.minDate
                          ? dayjs(node.params.minDate)
                          : undefined
                      }
                      onChange={(date) =>
                        updateParams({
                          minDate: date ? date.format("YYYY-MM-DD") : undefined,
                        })
                      }
                    />
                  ) : (
                    <DatePicker
                      style={{ width: "100%", marginBottom: 6 }}
                      placeholder="结束日期"
                      value={
                        node.params?.maxDate
                          ? dayjs(node.params.maxDate)
                          : undefined
                      }
                      onChange={(date) =>
                        updateParams({
                          maxDate: date ? date.format("YYYY-MM-DD") : undefined,
                        })
                      }
                    />
                  )}
                </Col>
              </Row>
            </>
          ) : null}
        </div>
      </Space>
    </Card>
  );
});

export default memo(function RuleCanvas() {
  const nodes = useAppSelector(selectRuleNodes);
  const selectedId = useAppSelector(selectSelectedRuleItemId);
  return (
    <Card size="small" title="规则链" style={{ minHeight: 260 }}>
      <div style={{ borderRadius: 8, padding: 4 }}>
        <Space direction="vertical" style={{ width: "100%" }} size={8}>
          {nodes.length === 0 ? (
            <Typography.Text type="secondary">
              暂无规则（请从左侧添加）
            </Typography.Text>
          ) : (
            nodes.map((node) => (
              <RuleItem
                key={node.id}
                node={node}
                isSelected={node.id === selectedId}
              />
            ))
          )}
        </Space>
      </div>
    </Card>
  );
});
