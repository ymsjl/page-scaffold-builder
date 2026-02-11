import React from "react";
import { getComponentPrototype } from "../../componentMetas";
import { useAppSelector } from "../../store/hooks";
import { selectFirstParentPageNode } from "@/store/componentTree/componentTreeSelectors";
import ComponentPreviewInner from "./ComponentPreviewInner";
import { EMPTY_STATE_STYLE, ERROR_STATE_STYLE } from "./previewStyles";

interface ComponentPreviewProps { }


const ComponentPreview: React.FC<ComponentPreviewProps> = () => {
  const rootNode = useAppSelector(selectFirstParentPageNode);
  if (!rootNode) return <div style={EMPTY_STATE_STYLE}>请选择一个组件实例以查看预览</div>;

  const componentPrototype = getComponentPrototype(rootNode.type);

  if (!componentPrototype) {
    return (
      <div style={ERROR_STATE_STYLE}>未知的组件类型: {rootNode.type}</div>
    );
  }
  return (
    <ComponentPreviewInner node={rootNode} componentPrototype={componentPrototype} />
  );
};

export default ComponentPreview;
