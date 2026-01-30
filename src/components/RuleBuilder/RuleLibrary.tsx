import React from "react";
import { Button, Card, Space, Typography } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";
import { useAppDispatch } from '@/store/hooks';
import { ruleBuilderActions } from '@/store/slices/ruleBuilderSlice';
import { createNodeByType } from "./ruleNodeFactory";
import { PlusOutlined } from "@ant-design/icons";

const RULE_LIBRARY: Array<{
  type: string;
  name: string;
  description: string;
  applicableTo: string[];
}> = [
    {
      type: "required",
      name: "必填",
      description: "字段不能为空",
      applicableTo: ["all"],
    },
    {
      type: "length",
      name: "字符串长度",
      description: "限制长度范围",
      applicableTo: ["text", "textarea", "password"],
    },
    {
      type: "range",
      name: "数字范围",
      description: "限制数值范围",
      applicableTo: ["digit", "money", "percent"],
    },
    {
      type: "pattern",
      name: "正则表达式",
      description: "正则表达式校验",
      applicableTo: ["text", "textarea", "password"],
    },
    {
      type: "singleDateRange",
      name: "单日日期限制",
      description: "对单个日期限制最早/最晚（支持相对日期）",
      applicableTo: ["date", "dateTime"],
    },
    {
      type: "dateRange",
      name: "日期范围",
      description: "限制日期范围（开始/结束）",
      applicableTo: ["date", "dateTime"],
    },
    {
      type: "dateSpan",
      name: "日期跨度",
      description: "限制日期范围跨度（天数）",
      applicableTo: ["dateRange"],
    },
  ];

function RuleCard({
  rule,
  onAdd,
}: {
  rule: { type: string; name: string; description: string };
  onAdd: (type: string) => void;
}) {
  return (
    <Card size="small" style={{ width: 200 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={4}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography.Text strong>{rule.name}</Typography.Text>
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            onClick={() => onAdd(rule.type)}
          />
        </div>
        <Typography.Text type="secondary">{rule.description}</Typography.Text>
      </Space>
    </Card>
  );
}

export default function RuleLibrary({ fieldType }: { fieldType?: string }) {
  const items = RULE_LIBRARY.filter((item) => {
    if (!fieldType) return true;
    return (
      item.applicableTo.includes("all") || item.applicableTo.includes(fieldType)
    );
  });
  const dispatch = useAppDispatch();
  return (
    <Swiper
      direction="horizontal"
      slidesPerView="auto"
      spaceBetween={12}
      freeMode={{ enabled: true }}
      mousewheel={{ forceToAxis: true }}
      scrollbar={{ draggable: true }}
      modules={[FreeMode, Mousewheel, Scrollbar]}
      grabCursor
      style={{ paddingBottom: 12 }}
    >
      {items.map((rule) => (
        <SwiperSlide key={rule.type} style={{ width: "auto" }}>
          <RuleCard
            rule={rule}
            onAdd={(type) => dispatch(ruleBuilderActions.addNode(createNodeByType(type as any)))}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

