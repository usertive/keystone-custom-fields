/* eslint-disable @next/next/no-img-element,max-lines */
/** @jsxRuntime classic */
/** @jsx jsx */
// noinspection ES6UnusedImports
import {jsx} from '@keystone-ui/core';
import {RefObject, useEffect, useMemo, useState} from 'react';
import {FieldProps} from '@keystone-6/core/types';
import {FieldContainer, FieldLabel} from '@keystone-ui/fields';
import {VectorImageControllerProducer, VectorImageValue} from './controller';
import {useRef} from 'react';
import {validateVectorImageUpload} from '../utils';
import {Stack, Text} from '@keystone-ui/core';
import {Button} from '@keystone-ui/button';
import {VectorImageWrapper} from './VectorImageWrapper';

function useObjectURL(fileData: File | undefined) {
  const [objectURL, setObjectURL] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (fileData) {
      const url = URL.createObjectURL(fileData);
      setObjectURL(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [fileData]);
  return objectURL;
}

function createErrorMessage(value: VectorImageValue) {
  if (value.kind === 'upload') {
    return validateVectorImageUpload(value.data);
  }
}

function ImgView({
  errorMessage,
  value,
  onChange,
  field,
  inputRef,
}: {
  errorMessage?: string;
  value: Exclude<VectorImageValue, {kind: 'ref'}>;
  onChange?: (value: VectorImageValue) => void;
  field: ReturnType<VectorImageControllerProducer>;
  inputRef: RefObject<HTMLInputElement>;
}) {
  const vectorImagePathFromUpload = useObjectURL(
    errorMessage === undefined && value.kind === 'upload' ? value.data.file : undefined
  );

  return value.kind === 'from-server' || value.kind === 'upload' ? (
    <Stack gap='small' across align='center'>
      {errorMessage === undefined ? (
        value.kind === 'from-server' ? (
          <VectorImageWrapper>
            <img css={{width: '100%'}} src={value.data.src} alt={field.path} />
          </VectorImageWrapper>
        ) : (
          <VectorImageWrapper>
            <img css={{width: '100%'}} src={vectorImagePathFromUpload} alt={field.path} />
          </VectorImageWrapper>
        )
      ) : null}
      {onChange && (
        <Stack gap='small'>
          {value.kind === 'from-server' && (
            <Stack padding='xxsmall' gap='xxsmall'>
              <Stack across align='center' gap='small'>
                <Text size='small'>
                  <a href={value.data.src} target='_blank' rel={'noreferrer'}>
                    {`${value.data.filename}`}
                  </a>
                </Text>
              </Stack>
            </Stack>
          )}
          {value.kind === 'upload' && (
            <Stack padding="xxsmall" gap="xxsmall">
              <Text size="small" paddingBottom="xsmall">
                Vector image linked, save to complete upload
              </Text>
            </Stack>
          )}
          <Stack across gap='small' align='center'>
            <Button
              size='small'
              onClick={() => {
                inputRef.current?.click();
              }}
            >
              Change
            </Button>
            {value.kind === 'from-server' && (
              <Button
                size='small'
                tone='negative'
                onClick={() => {
                  onChange({kind: 'remove', previous: value});
                }}
              >
                Remove
              </Button>
            )}
            {value.kind === 'upload' && (
              <Button
                size='small'
                tone='negative'
                onClick={() => {
                  onChange(value.previous);
                }}
              >
                Cancel
              </Button>
            )}
            {errorMessage && (
              <span
                css={{
                  display: 'block',
                  marginTop: '8px',
                  color: 'red',
                }}
              >
                {errorMessage}
              </span>
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  ) : (
    <Stack gap='small'>
      <Stack css={{alignItems: 'center'}} gap='small' across>
        <Button
          size='small'
          disabled={onChange === undefined}
          onClick={() => {
            inputRef.current?.click();
          }}
          tone='positive'
        >
          Upload vector image
        </Button>
        {value.kind === 'remove' && value.previous && (
          <Button
            size='small'
            tone='negative'
            onClick={() => {
              if (value.previous !== undefined) {
                onChange?.(value?.previous);
              }
            }}
          >
            Undo removal
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

export const Field = (props: FieldProps<VectorImageControllerProducer>) => {
  const {autoFocus, field, value, onChange} = props;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const errorMessage = createErrorMessage(value);

  const onUploadChange = ({currentTarget: {validity, files}}: React.SyntheticEvent<HTMLInputElement>) => {
    const file = files?.[0];
    if (!file) return; // bail if the user cancels from the file browser
    onChange?.({
      kind: 'upload',
      data: {file, validity},
      previous: value,
    });
  };

  // Generate a random input key when the value changes, to ensure the file input is unmounted and
  // remounted (this is the only way to reset its value and ensure onChange will fire again if
  // the user selects the same file again)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const inputKey = useMemo(() => Math.random(), [value]);

  return (
    <FieldContainer as='fieldset'>
      <FieldLabel as='legend'>{field.label}</FieldLabel>
      <ImgView errorMessage={errorMessage} value={value} onChange={onChange} field={field} inputRef={inputRef} />
      <input
        css={{display: 'none'}}
        autoComplete='off'
        autoFocus={autoFocus}
        ref={inputRef}
        key={inputKey}
        name={field.path}
        onChange={onUploadChange}
        type='file'
        disabled={onChange === undefined}
        aria-describedby={field.description === null ? undefined : `${field.path}-description`}
      />
    </FieldContainer>
  );
};
