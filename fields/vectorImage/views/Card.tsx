/* eslint-disable @next/next/no-img-element */
/** @jsxRuntime classic */
/** @jsx jsx */
// noinspection ES6UnusedImports
import {jsx} from '@keystone-ui/core';
import {FieldContainer, FieldLabel} from '@keystone-ui/fields';
import {CardValueComponent} from '@keystone-6/core/types';
import {VectorImageWrapper} from './VectorImageWrapper';

export const CardValue: CardValueComponent = ({ item, field }) => {
  const data = item[field.path];
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {data && (
        <VectorImageWrapper>
          <img css={{ width: '100%' }} alt={data.filename} src={data.url} />
        </VectorImageWrapper>
      )}
    </FieldContainer>
  );
};
