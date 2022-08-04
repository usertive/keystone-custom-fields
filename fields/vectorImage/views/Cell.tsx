/* eslint-disable @next/next/no-img-element */
/** @jsxRuntime classic */
/** @jsx jsx */
// noinspection ES6UnusedImports
import {jsx} from '@keystone-ui/core';
import {CellComponent} from '@keystone-6/core/types';
import {VectorImageControllerProducer} from './controller';

export const Cell: CellComponent<VectorImageControllerProducer> = ({item, field}) => {
  const data = item[field.path];
  if (!data) return null;
  return (
    <div
      css={{
        alignItems: 'center',
        display: 'flex',
        height: 24,
        lineHeight: 0,
        width: 24,
      }}
    >
      <img alt={data.filename} css={{maxHeight: '100%', maxWidth: '100%'}} src={data.url} />
    </div>
  );
};
