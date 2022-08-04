/* eslint-disable @next/next/no-img-element,max-lines */
/** @jsxRuntime classic */
/** @jsx jsx */
// noinspection ES6UnusedImports
import {jsx} from '@keystone-ui/core';
import {CardValueComponent} from '@keystone-6/core/types';
import {FieldContainer, FieldLabel} from '@keystone-ui/fields';

export const CardValue: CardValueComponent = ({item, field}) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <div css={{backgroundColor: item[field.path], width: 38 + 5, height: 38 + 5, border: '5px solid #e1e5e9', borderRadius: 6}} />
    </FieldContainer>
  );
};
