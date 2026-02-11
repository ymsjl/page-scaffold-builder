export type EntityField = {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  comment?: string;
};

export type EntityModel = {
  name: string;
  fields: EntityField[];
};
