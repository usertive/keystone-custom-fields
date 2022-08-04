import {BaseListTypeInfo, KeystoneContextFromListTypeInfo} from '@keystone-6/core/types';

export type BaseAccessArgs<ListTypeInfo extends BaseListTypeInfo> = {
  session: any;
  listKey: string;
  context: KeystoneContextFromListTypeInfo<ListTypeInfo>;
};

export function isAuthenticated<ListTypeInfo extends BaseListTypeInfo = BaseListTypeInfo>({session}: BaseAccessArgs<ListTypeInfo>) {
  return session?.data.id !== undefined;
}
