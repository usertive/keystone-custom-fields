import {BaseListTypeInfo} from '@keystone-6/core/dist/declarations/src/types/type-info';
import {
  CommonFieldConfig,
  FieldData,
  fieldType,
  FieldTypeFunc,
  filters,
  orderDirectionEnum,
} from '@keystone-6/core/types';
import {graphql} from '@keystone-6/core';
import {assertCreateIsNonNullAllowed, assertReadIsNonNullAllowed} from './utils';
import {ColorPickerFieldMeta} from './types';
import {humanize} from './utils';

export type ColorPickerFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<ListTypeInfo> & {
  isIndexed?: true | 'unique';
  validation?: {
    /**
     * Makes the field disallow null values and require a string at least 1 character long
     */
    isRequired?: boolean;
  };
  defaultValue?: string;
  graphql?: {create?: {isNonNull?: boolean}; read?: {isNonNull?: boolean}};
  db?: {isNullable?: boolean; map?: string};
};

export const colorPicker = <ListTypeInfo extends BaseListTypeInfo>(
  config: ColorPickerFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> => {
  const {isIndexed, defaultValue: _defaultValue, validation, ...restOfConfigOptions} = config;

  return (meta: FieldData) => {
    // defaulted to false as a zero length string is preferred to null
    const isNullable = config.db?.isNullable ?? false;

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    assertReadIsNonNullAllowed(meta, config, isNullable);

    assertCreateIsNonNullAllowed(meta, config);

    const mode = isNullable ? 'optional' : 'required';

    const defaultValue = !isNullable || _defaultValue !== undefined ? _defaultValue || '#FFFFFF' : undefined;

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'String',
      default: defaultValue === undefined ? undefined : {kind: 'literal', value: defaultValue},
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      map: config.db?.map,
    })({
      ...restOfConfigOptions,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const val = args.resolvedData[meta.fieldKey];
          if(val === null && (validation?.isRequired || !isNullable)) {
            args.addValidationError(`${fieldLabel} is required`);
          }

          await config.hooks?.validateInput?.(args);
        },
      },
      input: {
        uniqueWhere: isIndexed === 'unique' ? {arg: graphql.arg({type: graphql.String})} : undefined,
        where: {
          arg: graphql.arg({
            type: filters[meta.provider].String[mode],
          }),
          resolve: mode === 'required' ? undefined : filters.resolveString,
        },
        create: {
          arg: graphql.arg({
            type: config.graphql?.create?.isNonNull ? graphql.nonNull(graphql.String) : graphql.String,
            defaultValue: config.graphql?.create?.isNonNull ? defaultValue : undefined,
          }),
          resolve(val) {
            if(val === undefined) {
              return defaultValue ?? null;
            }
            return val;
          },
        },
        update: {arg: graphql.arg({type: graphql.String})},
        orderBy: {arg: graphql.arg({type: orderDirectionEnum})},
      },
      output: graphql.field({
        type: config.graphql?.read?.isNonNull ? graphql.nonNull(graphql.String) : graphql.String,
      }),
      views: require.resolve('./views/index.ts'),
      getAdminMeta(): ColorPickerFieldMeta {
        return {
          validation: {
            isRequired: validation?.isRequired ?? false,
          },
          defaultValue: defaultValue ?? (isNullable ? null : '#FFFFFF'),
          isNullable,
        };
      },
    });
  };
};
