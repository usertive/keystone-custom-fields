import {FieldController, FieldControllerConfig} from '@keystone-6/core/types';
import {validateVectorImageUpload} from '../utils';
import {VectorImageMetadata} from '../types';

export type VectorImageValue =
  | {kind: 'empty'}
  | {
  kind: 'from-server';
  data: VectorImageMetadata & {src: string};
}
  | {
  kind: 'upload';
  data: {
    file: File;
    validity: ValidityState;
  };
  previous: VectorImageValue;
}
  | {kind: 'remove'; previous?: Exclude<VectorImageValue, {kind: 'remove'}>};

export type VectorImageController = FieldController<VectorImageValue>;
export type VectorImageControllerProducer = (config: FieldControllerConfig) => VectorImageController;

// Controller
export const controller: VectorImageControllerProducer = (config: FieldControllerConfig): VectorImageController => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} {
        url
        filename
        filesize
      }`,
    defaultValue: {kind: 'empty'},
    deserialize(item) {
      const value = item[config.path];
      if(!value) return {kind: 'empty'};
      return {
        kind: 'from-server',
        data: {
          src: value.url,
          filename: value.filename,
          ref: value.ref,
          filesize: value.filesize,
          storage: value.storage,
        },
      };
    },
    validate(value): boolean {
      return value.kind !== 'upload' || validateVectorImageUpload(value.data) === undefined;
    },
    serialize(value) {
      if(value.kind === 'upload') {
        return {[config.path]: {upload: value.data.file}};
      }
      if(value.kind === 'remove') {
        return {[config.path]: null};
      }
      return {};
    },
  };
};
