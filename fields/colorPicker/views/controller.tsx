/* eslint-disable @next/next/no-img-element,max-lines */
/** @jsxRuntime classic */
/** @jsx jsx */
// noinspection ES6UnusedImports
import {jsx} from '@keystone-ui/core';
import {FieldController, FieldControllerConfig} from '@keystone-6/core/types';
import {ColorPickerFieldValidation, ColorPickerFieldMeta, ColorValue} from '../types';
import {TextInput} from '@keystone-ui/fields';
import {deserializeColorValue, validateColorValue} from '../utils';

export type ColorPickerFieldController = FieldController<ColorValue, string> & {
  validation: ColorPickerFieldValidation;
  isNullable: boolean;
};
export type ColorPickerFieldConfig = FieldControllerConfig<ColorPickerFieldMeta>;
export type ColorPickerFieldControllerProducer = (config: ColorPickerFieldConfig) => ColorPickerFieldController;

export const controller = (config: ColorPickerFieldConfig): ColorPickerFieldController => {
  const validation: ColorPickerFieldValidation = {
    isRequired: config.fieldMeta.validation.isRequired,
  };

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: {kind: 'create', inner: deserializeColorValue(config.fieldMeta.defaultValue)},
    isNullable: config.fieldMeta.isNullable,
    deserialize: (data) => {
      const inner = deserializeColorValue(data[config.path]);
      return {kind: 'update', inner, initial: inner};
    },
    serialize: (value) => ({[config.path]: value.inner.kind === 'null' ? null : value.inner.value}),
    validation,
    validate: (val) => validateColorValue(val, validation, config.label).length === 0,
    filter: {
      Filter(props) {
        return (
          <TextInput
            onChange={(event) => {
              props.onChange(event.target.value);
            }}
            value={props.value}
            autoFocus={props.autoFocus}
          />
        );
      },

      graphql: ({type, value}) => {
        const isNot = type.startsWith('not_');
        const key =
          type === 'is_i' || type === 'not_i'
            ? 'equals'
            : type
                .replace(/_i$/, '')
                .replace('not_', '')
                .replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
        const filter = {[key]: value};
        return {
          [config.path]: {
            ...(isNot ? {not: filter} : filter),
            mode: 'insensitive',
          },
        };
      },
      Label({label, value}) {
        return `${label.toLowerCase()}: "${value}"`;
      },
      types: {
        is_i: {
          label: 'Is exactly',
          initialValue: '',
        },
        not_i: {
          label: 'Is not exactly',
          initialValue: '',
        },
      },
    },
  };
};
