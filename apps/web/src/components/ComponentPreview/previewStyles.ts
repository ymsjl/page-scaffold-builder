import type { CSSProperties } from "react";

export const EMPTY_STATE_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  color: "#999",
  fontSize: "14px",
  backgroundColor: "#fafafa",
  border: "4px solid #e8e8e8",
  borderRadius: "16px",
};

export const ERROR_STATE_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  color: "#ff4d4f",
  fontSize: "14px",
  backgroundColor: "#fff2f0",
  border: "1px solid #ffccc7",
  borderRadius: "4px",
};

export const CONTAINER_STYLE: CSSProperties = {
  padding: "20px",
  height: "100%",
  overflow: "auto",
  backgroundColor: "#fafafa",
  border: "4px solid #e8e8e8",
  borderRadius: "16px",
};
