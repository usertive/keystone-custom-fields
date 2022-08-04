/* eslint-disable @next/next/no-img-element,max-lines */
/** @jsxRuntime classic */
/** @jsx jsx */
// noinspection ES6UnusedImports
import {jsx} from '@keystone-ui/core';
import {Stack, useTheme} from '@keystone-ui/core';
import {FieldProps} from '@keystone-6/core/types';
import {ColorPickerFieldControllerProducer} from './controller';
import {useState} from 'react';
import {validateColorValue} from '../utils';
import {FieldContainer, FieldLabel, TextInput, Checkbox} from '@keystone-ui/fields';

export const Field = (props: FieldProps<ColorPickerFieldControllerProducer>) => {
  const {field, value, onChange, autoFocus, forceValidation} = props;

  const {typography, fields} = useTheme();
  const [shouldShowErrors, setShouldShowErrors] = useState(false);
  const validationMessages = validateColorValue(value, field.validation, field.label);
  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      {onChange ? (
        <Stack gap='small'>
          <TextInput
            id={field.path}
            autoFocus={autoFocus}
            onChange={(event) => onChange({...value, inner: {kind: 'value', value: event.target.value}})}
            value={value.inner.kind === 'null' ? '' : value.inner.value}
            disabled={value.inner.kind === 'null'}
            type={'color' as unknown as 'text'}
            css={{width: 38, padding: '0 1px'}}
            onBlur={() => {
              setShouldShowErrors(true);
            }}
            aria-describedby={field.description === null ? undefined : `${field.path}-description`}
          />
          {field.isNullable && (
            <Checkbox
              autoFocus={autoFocus}
              disabled={false}
              onChange={() => {
                if (value.inner.kind === 'value') {
                  onChange({
                    ...value,
                    inner: {
                      kind: 'null',
                      prev: value.inner.value,
                    },
                  });
                } else {
                  onChange({
                    ...value,
                    inner: {
                      kind: 'value',
                      value: value.inner.prev,
                    },
                  });
                }
              }}
              checked={value.inner.kind === 'null'}
            >
              <span css={{fontWeight: typography.fontWeight.semibold, color: fields.labelColor}}>
                Set field as null
              </span>
            </Checkbox>
          )}
          {!!validationMessages.length &&
            (shouldShowErrors || forceValidation) &&
            validationMessages.map((message, i) => (
              <span key={i} css={{color: 'red'}}>
                {message}
              </span>
            ))}
        </Stack>
      ) : value.inner.kind === 'null' ? null : (
        value.inner.value
      )}
    </FieldContainer>
  );
};
