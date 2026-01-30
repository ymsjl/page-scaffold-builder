import React from "react";
import { Button, Card, Space, Typography } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";
import { useAppDispatch } from "@/store/hooks";
import { ruleBuilderActions } from "@/store/slices/ruleBuilderSlice";
import { PlusOutlined } from "@ant-design/icons";
import { RuleTemplate } from "./RuleParamsDateSchema";
import { RULE_LIBRARY } from "./RULE_LIBRARY";

function RuleCard({ ruleTemplate }: { ruleTemplate: RuleTemplate }) {
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
              dispatch(ruleBuilderActions.addNodeFromTemplate(ruleTemplate))
            }
          />
        </div>
        <Typography.Text type="secondary">
          {ruleTemplate.description}
        </Typography.Text>
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
}
