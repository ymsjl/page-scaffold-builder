import { describe, it, expect } from "vitest";
import type { ProCommonColumn, SchemaField } from "../../../types";
import componentTreeReducer, {
  componentTreeActions,
} from "../componentTreeSlice";

const createBaseState = () => {
  let state = componentTreeReducer(undefined, { type: "" } as any) as any;
  state = componentTreeReducer(
    state,
    componentTreeActions.addNode({ parentId: null, type: "Table" }),
  );
  const tableId = state.normalizedTree.result[0];
  state = componentTreeReducer(
    state,
    componentTreeActions.selectNode(tableId),
  );

  return { state, tableId };
};

const updateTableProps = (
  state: any,
  tableId: string,
  updates: Record<string, any>,
) => {
  return componentTreeReducer(
    state,
    componentTreeActions.updateNodeProps({
      id: tableId,
      props: updates,
    }),
  );
};

const addEntityModel = (
  state: any,
  entityModelId: string,
  fields: SchemaField[],
) => {
  let nextState = componentTreeReducer(
    state,
    componentTreeActions.startEditEntityModel(entityModelId),
  );
  nextState = componentTreeReducer(
    nextState,
    componentTreeActions.applyEntityModelChange({
      name: "User",
      title: "User",
      primaryKey: fields[0]?.id,
      fields,
    }),
  );
  return nextState;
};

const makeColumn = (
  key: string,
  title: string,
  dataIndex: string,
): ProCommonColumn => ({
  key,
  title,
  dataIndex,
});

describe("columnReducers", () => {
  it("adds columns from entity model and avoids duplicates", () => {
    const fields: SchemaField[] = [
      {
        id: "field_id",
        key: "id",
        title: "ID",
        valueType: "string",
        isFilterable: true,
      },
      {
        id: "field_name",
        key: "name",
        title: "Name",
        valueType: "string",
        isFilterable: false,
      },
    ];

    const { state, tableId } = createBaseState();
    let nextState = addEntityModel(state, "em_1", fields);
    nextState = updateTableProps(nextState, tableId, {
      entityModelId: "em_1",
      columns: [makeColumn("id", "ID", "id")],
    });

    nextState = componentTreeReducer(
      nextState,
      componentTreeActions.addColumnsFromEntityModelToSelectedNode(),
    );

    const columns =
      nextState.normalizedTree.entities.nodes[tableId].props.columns;
    expect(columns.length).toBe(2);
    const nameColumn = columns.find((c: ProCommonColumn) => c.dataIndex === "name");
    expect(nameColumn).toBeTruthy();
    expect(nameColumn?.title).toBe("Name");
    expect(nameColumn?.valueType).toBe("text");
    expect(nameColumn?.hideInSearch).toBe(true);
  });

  it("applies editing column changes and inserts when missing", () => {
    const { state, tableId } = createBaseState();
    let nextState = componentTreeReducer(
      state,
      componentTreeActions.setEditingColumn({
        title: "Age",
        dataIndex: "age",
      }),
    );

    nextState = componentTreeReducer(
      nextState,
      componentTreeActions.applyChangesToColumnOfSelectedNode({
        valueType: "text",
      }),
    );

    const columns =
      nextState.normalizedTree.entities.nodes[tableId].props.columns;
    expect(columns.length).toBe(1);
    expect(columns[0].title).toBe("Age");
    expect(columns[0].dataIndex).toBe("age");
    expect(columns[0].valueType).toBe("text");
    expect(typeof columns[0].key).toBe("string");
  });

  it("updates existing column when editing column matches", () => {
    const { state, tableId } = createBaseState();
    let nextState = updateTableProps(state, tableId, {
      columns: [makeColumn("col_1", "Title", "title")],
    });

    nextState = componentTreeReducer(
      nextState,
      componentTreeActions.setEditingColumn({
        key: "col_1",
        title: "Title",
        dataIndex: "title",
      }),
    );

    nextState = componentTreeReducer(
      nextState,
      componentTreeActions.applyChangesToColumnOfSelectedNode({
        hideInTable: true,
      }),
    );

    const columns =
      nextState.normalizedTree.entities.nodes[tableId].props.columns;
    expect(columns.length).toBe(1);
    expect(columns[0].hideInTable).toBe(true);
  });

  it("upserts columns for selected node", () => {
    const { state, tableId } = createBaseState();
    let nextState = componentTreeReducer(
      state,
      componentTreeActions.upsertColumnOfSelectedNode(
        makeColumn("col_1", "Name", "name"),
      ),
    );

    let columns =
      nextState.normalizedTree.entities.nodes[tableId].props.columns;
    expect(columns.length).toBe(1);
    expect(columns[0].title).toBe("Name");

    nextState = componentTreeReducer(
      nextState,
      componentTreeActions.upsertColumnOfSelectedNode({
        key: "col_1",
        title: "Updated",
        dataIndex: "name",
      }),
    );
    columns = nextState.normalizedTree.entities.nodes[tableId].props.columns;
    expect(columns.length).toBe(1);
    expect(columns[0].title).toBe("Updated");
  });

  it("deletes and moves columns on selected node", () => {
    const { state, tableId } = createBaseState();
    let nextState = updateTableProps(state, tableId, {
      columns: [
        makeColumn("col_1", "A", "a"),
        makeColumn("col_2", "B", "b"),
        makeColumn("col_3", "C", "c"),
      ],
    });

    nextState = componentTreeReducer(
      nextState,
      componentTreeActions.moveColumnForSelectedNode({ from: 0, to: 2 }),
    );
    let columns =
      nextState.normalizedTree.entities.nodes[tableId].props.columns;
    expect(columns.map((col: ProCommonColumn) => col.key)).toEqual([
      "col_2",
      "col_3",
      "col_1",
    ]);

    nextState = componentTreeReducer(
      nextState,
      componentTreeActions.deleteColumnForSelectedNode("col_2"),
    );
    columns = nextState.normalizedTree.entities.nodes[tableId].props.columns;
    expect(columns.map((col: ProCommonColumn) => col.key)).toEqual([
      "col_3",
      "col_1",
    ]);
  });
});
