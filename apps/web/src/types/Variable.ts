export type PrimitiveVariableValue = boolean | string | number;

export interface VariableDefinition {
  id: string;
  name: string;
  initialValue: PrimitiveVariableValue;
}

export interface VariableRef {
  type: "variableRef";
  variableName: string;
}

export function isVariableRef(value: unknown): value is VariableRef {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as VariableRef).type === "variableRef" &&
    "variableName" in value &&
    typeof (value as VariableRef).variableName === "string"
  );
}