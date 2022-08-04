import {ColorPickerFieldValidation, ColorValue, InnerColorValue} from './types';
import {BaseListTypeInfo} from '@keystone-6/core/dist/declarations/src/types/type-info';
import {FieldAccessControl, FieldData} from '@keystone-6/core/types';

export function validateColorValue(
  value: ColorValue,
  validation: ColorPickerFieldValidation,
  fieldLabel: string
): string[] {
  // if the value is the same as the initial for an update, we don't want to block saving
  // since we're not gonna send it anyway if it's the same
  // and going "fix this thing that is unrelated to the thing you're doing" is bad
  // and also bc it could be null bc of read access control
  if (
    value.kind === 'update' &&
    ((value.initial.kind === 'null' && value.inner.kind === 'null') ||
      (value.initial.kind === 'value' && value.inner.kind === 'value' && value.inner.value === value.initial.value))
  ) {
    return [];
  }

  if (value.inner.kind === 'null') {
    if (validation.isRequired) {
      return [`${fieldLabel} is required`];
    }
    return [];
  }

  return [];
}

export function deserializeColorValue(value: string | null): InnerColorValue {
  if (value === null) {
    return {kind: 'null', prev: ''};
  }
  return {kind: 'value', value};
}

/**
 * Converts the first character of a string to uppercase.
 * @param {String} str The string to convert.
 * @returns The new string
 */
export const capitalize = (str: string) => str.slice(0, 1).toUpperCase() + str.slice(1);

export const humanize = (str: string) => {
  return str
    .replace(/([a-z])([A-Z]+)/g, '$1 $2')
    .split(/\s|_|-/)
    .filter((i) => i)
    .map(capitalize)
    .join(' ');
};

export function hasReadAccessControl<ListTypeInfo extends BaseListTypeInfo>(
  access: FieldAccessControl<ListTypeInfo> | undefined
) {
  if (access === undefined) {
    return false;
  }
  return typeof access === 'function' || typeof access.read === 'function';
}

export function assertReadIsNonNullAllowed<ListTypeInfo extends BaseListTypeInfo>(
  meta: FieldData,
  config: {
    access?: FieldAccessControl<ListTypeInfo> | undefined;
    graphql?: { read?: { isNonNull?: boolean } };
  },
  resolvedIsNullable: boolean
) {
  if (config.graphql?.read?.isNonNull) {
    if (resolvedIsNullable) {
      throw new Error(
        `The field at ${meta.listKey}.${meta.fieldKey} sets graphql.read.isNonNull: true but not validation.isRequired: true or db.isNullable: false.\n` +
        `Set validation.isRequired: true or db.isNullable: false or disable graphql.read.isNonNull`
      );
    }
    if (hasReadAccessControl(config.access)) {
      throw new Error(
        `The field at ${meta.listKey}.${meta.fieldKey} sets graphql.read.isNonNull: true and has read access control, this is not allowed.\n` +
        'Either disable graphql.read.isNonNull or read access control.'
      );
    }
  }
}

export function hasCreateAccessControl<ListTypeInfo extends BaseListTypeInfo>(
  access: FieldAccessControl<ListTypeInfo> | undefined
) {
  if (access === undefined) {
    return false;
  }
  return typeof access === 'function' || typeof access.create === 'function';
}

export function assertCreateIsNonNullAllowed<ListTypeInfo extends BaseListTypeInfo>(
  meta: FieldData,
  config: {
    access?: FieldAccessControl<ListTypeInfo> | undefined;
    graphql?: { create?: { isNonNull?: boolean } };
  }
) {
  if (config.graphql?.create?.isNonNull && hasCreateAccessControl(config.access)) {
    throw new Error(
      `The field at ${meta.listKey}.${meta.fieldKey} sets graphql.create.isNonNull: true and has create access control, this is not allowed.\n` +
      'Either disable graphql.create.isNonNull or create access control.'
    );
  }
}
