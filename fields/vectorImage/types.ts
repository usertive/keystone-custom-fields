import {FileMetadata} from '@keystone-6/core/dist/declarations/src/types/context';

export type VectorImageMetadata = FileMetadata;

export type VectorImageData = {storage: string} & VectorImageMetadata;

export type VectorImageOutputType = VectorImageMetadata & {url: string, inlineCode: string};
