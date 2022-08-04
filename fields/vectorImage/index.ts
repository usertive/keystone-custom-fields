import {
  BaseListTypeInfo,
  FieldTypeFunc,
  CommonFieldConfig,
  fieldType,
  KeystoneContext,
  BaseItem,
} from '@keystone-6/core/types';
import {graphql} from '@keystone-6/core';
import {FileUpload} from 'graphql-upload';
import {ApolloError} from 'apollo-server-errors';
import {VectorImageData, VectorImageOutputType} from './types';
import {FileData} from '@keystone-6/core/dist/declarations/src/types/context';
import path from 'node:path';
import {readFile as readFileAsync} from 'node:fs/promises';
import {uploadsDirectoryPath} from '../../constats';

export const userInputError = (msg: string) => new ApolloError(`Input error: ${msg}`, 'KS_USER_INPUT_ERROR');

export type VectorImageFieldConfig<ListTypeInfo extends BaseListTypeInfo> = {storage: string} & CommonFieldConfig<ListTypeInfo>;

const VectorImageFieldInput = graphql.inputObject({
  name: 'VectorImageFieldInput',
  fields: {
    upload: graphql.arg({type: graphql.nonNull(graphql.Upload)}),
  },
});

type VectorImageFieldInputType = undefined | null | {upload: Promise<FileUpload>};

async function inputResolver(storage: string, data: VectorImageFieldInputType, context: KeystoneContext): Promise<FileData> {
  switch (data) {
    case undefined:
      return {filename: undefined, filesize: undefined};
    case null:
      return {filename: null, filesize: null};
    default: {
      const upload = await data.upload;
      return context.files(storage).getDataFromStream(upload.createReadStream(), upload.filename);
    }
  }
}

const VectorImageFieldOutput = graphql.object<Partial<VectorImageData>>()({
  name: 'VectorImageFieldOutput',
  fields: graphql.fields<VectorImageOutputType>()({
    filename: graphql.field({type: graphql.nonNull(graphql.String)}),
    filesize: graphql.field({type: graphql.nonNull(graphql.Int)}),
    url: graphql.field({
      type: graphql.nonNull(graphql.String),
      resolve(data, args, context) {
        return context.files(data.storage).getUrl(data.filename);
      },
    }),
  }),
});

export const vectorImage =
  <ListTypeInfo extends BaseListTypeInfo>(config: VectorImageFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
  (meta) => {
    const storage = meta.getStorage(config.storage);

    if (!storage) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} has storage set to ${config.storage}, but no storage configuration was found for that key`
      );
    }

    if ('isIndexed' in config) {
      throw Error("isIndexed: 'unique' is not a supported option for field type `vectorImage`.");
    }

    return fieldType({
      kind: 'multi',
      fields: {
        filesize: {kind: 'scalar', scalar: 'Int', mode: 'optional'},
        filename: {kind: 'scalar', scalar: 'String', mode: 'optional'},
      },
    })({
      ...config,
      input: {
        create: {
          arg: graphql.arg({type: VectorImageFieldInput}),
          resolve: (data: VectorImageFieldInputType, context: KeystoneContext) => inputResolver(config.storage, data, context),
        },
        update: {
          arg: graphql.arg({type: VectorImageFieldInput}),
          resolve: (data: VectorImageFieldInputType, context: KeystoneContext) => inputResolver(config.storage, data, context),
        },
      },
      output: graphql.field({
        type: VectorImageFieldOutput,
        resolve(args: {value: FileData; item: BaseItem}): VectorImageData | null {
          const {
            value: {filesize, filename},
          } = args;

          if (filesize === null || filename === null) return null;

          return {filename, filesize, storage: config.storage};
        },
      }),
      views: require.resolve('./views/index.ts'),
    });
  };
