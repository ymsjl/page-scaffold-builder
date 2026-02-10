import { List } from "antd";
import React, { useCallback } from "react";

export interface RowActionsProps {
  // 这里可以定义一些回调函数的 props，比如添加行、删除行等
}

const RowActions: React.FC<RowActionsProps> = React.memo((props) => {
  return (
    <List>
      <List.Item>ss</List.Item>
    </List>
  );
});

RowActions.displayName = "RowActions";

export default RowActions;
