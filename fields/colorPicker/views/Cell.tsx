/* eslint-disable @next/next/no-img-element,max-lines */
/** @jsxRuntime classic */
/** @jsx jsx */
// noinspection ES6UnusedImports
import {jsx} from '@keystone-ui/core';
import {CellComponent} from '@keystone-6/core/types';
import {CellLink, CellContainer} from '@keystone-6/core/admin-ui/components';

const Cell: CellComponent = ({item, field, linkTo}) => {
  const value = item[field.path] + '';
  const colorBox = <div css={{backgroundColor: value, width: 38 - 5, height: 38 - 5, border: '5px solid #e1e5e9', borderRadius: 6}} />;
  return linkTo ? <CellLink {...linkTo}>{colorBox}</CellLink> : <CellContainer>{colorBox}</CellContainer>;
};
Cell.supportsLinkTo = true;

export {Cell};
