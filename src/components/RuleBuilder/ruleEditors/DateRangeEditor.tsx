import React, { useMemo, useRef, useEffect } from "react";
import { ProForm, ProFormItemRender, ProFormDependency } from "@ant-design/pro-components";
import OperatorSelect from "./OperatorSelect";
import DateControl from "./DateControl";
import { DATE_RANGE_OPTIONS, getDateDefaultOperator, computeOperatorParams } from "../utils";

type Props = {
  params: Record<string, any>;
  updateParams: (next: Record<string, any>) => void;
};

const DateRangeEditor: React.FC<Props> = React.memo(({ params, updateParams }) => {
  const rangeOp = React.useMemo(() => getDateDefaultOperator(params), [params]);
  const operator = params?.operator ?? rangeOp;

  const formRef = useRef<any>();

  useEffect(() => {
    formRef.current?.setFieldsValue({
      operator: params?.operator ?? rangeOp,
      minDate: params?.minDate,
      maxDate: params?.maxDate,
    });
  }, [params, rangeOp]);

  const changeOp = React.useCallback(
    (op: string) => updateParams(computeOperatorParams(op, params, "minDate", "maxDate")),
    [updateParams, params]
  );

  const handleFieldChange = React.useCallback(
    (changed: Record<string, any>) => {
      if ("minDate" in changed || "maxDate" in changed) {
        if (operator === "eq" && "minDate" in changed) {
          updateParams({ minDate: changed.minDate, maxDate: changed.minDate });
        } else if (operator === "eq" && "maxDate" in changed) {
          updateParams({ minDate: changed.maxDate, maxDate: changed.maxDate });
        } else {
          updateParams(changed as Record<string, any>);
        }
      }
    },
    [operator, updateParams]
  );

  return (
    <ProForm
      formRef={formRef}
      initialValues={{ operator, minDate: params?.minDate, maxDate: params?.maxDate }}
      submitter={false}
      onValuesChange={(changed) => {
        if (changed.operator !== undefined) {
          changeOp(changed.operator);
        } else {
          handleFieldChange(changed as Record<string, any>);
        }
      }}
    >
      <ProFormItemRender name="operator" label={false}>
        {(props: any) => (
          <OperatorSelect options={DATE_RANGE_OPTIONS} value={props.value} onChange={props.onChange} />
        )}
      </ProFormItemRender>

      <ProFormDependency name={["operator"]}>
        {({ operator }: any) => {
          switch (operator) {
            case "eq":
              return (
                <ProFormItemRender name="minDate" label='日期'>
                  {(p) => (
                    <DateControl
                      placeholder="日期"
                      value={p.value ?? params?.minDate ?? params?.maxDate}
                      onChange={(v: any) => {
                        p.onChange && p.onChange(v);
                        updateParams({ minDate: v, maxDate: v });
                      }}
                    />
                  )}
                </ProFormItemRender>
              );
            case "between":
              return (
                <>
                  <ProFormItemRender name="minDate" label='开始日期'>
                    {(p) => (
                      <DateControl placeholder="开始日期" value={p.value ?? params?.minDate} onChange={p.onChange} />
                    )}
                  </ProFormItemRender>
                  <ProFormItemRender name="maxDate" label='结束日期'>
                    {(p) => (
                      <DateControl placeholder="结束日期" value={p.value ?? params?.maxDate} onChange={p.onChange} />
                    )}
                  </ProFormItemRender>
                </>
              );
            case "gte":
              return (
                <ProFormItemRender name="minDate" label='开始日期'>
                  {(p) => (
                    <DateControl placeholder="开始日期" value={p.value ?? params?.minDate} onChange={p.onChange} />
                  )}
                </ProFormItemRender>
              );
            case "lte":
              return (
                <ProFormItemRender name="maxDate" label='结束日期'>
                  {(p) => (
                    <DateControl placeholder="结束日期" value={p.value ?? params?.maxDate} onChange={p.onChange} />
                  )}
                </ProFormItemRender>
              );
            default:
              return null;
          }
        }}
      </ProFormDependency>
    </ProForm>
  );
});

DateRangeEditor.displayName = "DateRangeEditor";

export default DateRangeEditor;
