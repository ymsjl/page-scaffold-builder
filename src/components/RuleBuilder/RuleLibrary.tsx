import React from "react";
import { Button, Card, Space, Typography } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";
import { useAppDispatch } from "@/store/hooks";
import { PlusOutlined } from "@ant-design/icons";
import { RuleTemplate } from "./RuleParamsDateSchema";
import { RULE_LIBRARY } from "./RULE_LIBRARY";
import { componentTreeActions } from "@/store/slices/componentTree/componentTreeSlice";

const RuleCard: React.FC<{ ruleTemplate: RuleTemplate }> = React.memo(({ ruleTemplate }) => {
  const dispatch = useAppDispatch();
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
          <Typography.Text strong>{ruleTemplate.name}</Typography.Text>
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            onClick={() =>
              dispatch(componentTreeActions.addRuleNodeToEditingColumn(ruleTemplate))
            }
          />
        </div>
        <Typography.Text type="secondary">
          {ruleTemplate.description}
        </Typography.Text>
      </Space>
    </Card>
  );
});

RuleCard.displayName = "RuleCard";

const RuleLibrary: React.FC<{ valueType?: string }> = React.memo(({ valueType }) => {
  const items = RULE_LIBRARY.filter((item) => {
    if (!valueType) return true;
    return (
      item.applicableTo.includes("all") || item.applicableTo.includes(valueType)
    );
  });

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
          <RuleCard ruleTemplate={rule} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
});

RuleLibrary.displayName = "RuleLibrary";

export default RuleLibrary;