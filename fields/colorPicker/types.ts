export type ColorPickerFieldValidation = {
  isRequired: boolean;
};

export type ColorPickerFieldMeta = {
  isNullable: boolean;
  validation: ColorPickerFieldValidation;
  defaultValue: string | null;
};

export type InnerColorValue = {kind: 'null'; prev: string} | {kind: 'value'; value: string};

export type ColorValue =
  | {kind: 'create'; inner: InnerColorValue}
  | {kind: 'update'; inner: InnerColorValue; initial: InnerColorValue};
