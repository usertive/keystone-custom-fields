import {list} from '@keystone-6/core';
import {relationship, select, text, timestamp} from '@keystone-6/core/fields';
import {document} from '@keystone-6/fields-document';
import {Lists, PostCreateInput, PostUpdateInput} from '.keystone/types';
import {string, ValidationError} from 'yup';
import {FieldHooks} from '@keystone-6/core/dist/declarations/src/types/config/hooks';
import {isAuthenticated} from '../utils/access-control-utils';
import {colorPicker} from '../fields/colorPicker';

export const Post = list({
  fields: {
    themeColor: colorPicker({}),
    title: text({
      validation: {isRequired: true},
      db: {isNullable: false},
      graphql: {
        read: {isNonNull: true},
      },
      hooks: {
        validateInput: ({resolvedData, addValidationError}) => {
          const {title} = resolvedData;

          if(title !== undefined) {
            try {
              string().label('title').required().min(3).validateSync(title, {strict: true, abortEarly: true});
            } catch(e: unknown) {
              if(ValidationError.isError(e)) {
                e.errors.forEach(addValidationError);
              }
            }
          }
        }
      } as FieldHooks<Lists.Post.TypeInfo>,
    }),
    publishedAt: timestamp({
      ui: {
        itemView: {
          fieldMode: 'read',
        },
        createView: {
          fieldMode: 'hidden'
        },
        listView: {
          fieldMode: 'read'
        },
      },
      hooks: {
        resolveInput: async (args) => {
          const {operation, item, resolvedData, fieldKey} = args;

          const newResolvedData: PostCreateInput | PostUpdateInput = {
            ...resolvedData,
          };

          switch(operation) {
            case 'create': {
              newResolvedData[fieldKey] = resolvedData.status === 'published' ? new Date() : null;
              break;
            }
            case 'update': {
              if(resolvedData.status === 'published' && item[fieldKey] === null)
                newResolvedData[fieldKey] = new Date();
              else if(resolvedData.status === 'draft' && item[fieldKey] !== null)
                newResolvedData[fieldKey] = null;
              break;
            }
          }

          return newResolvedData[fieldKey];
        },
      } as FieldHooks<Lists.Post.TypeInfo>,
    }),
    status: select({
      type: 'enum',
      options: [
        {label: 'Published', value: 'published'},
        {label: 'Draft', value: 'draft'},
      ],
      defaultValue: 'draft',
      validation: {isRequired: true},
      db: {isNullable: false},
      graphql: {
        read: {isNonNull: true},
      },
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    author: relationship({
      ref: 'User.posts',
      ui: {
        displayMode: 'select',
        hideCreate: true,
      },
      many: false,
      hooks: {
        validateInput: ({resolvedData, addValidationError}) => {
          const {author} = resolvedData;

          if(author === undefined || author.connect === undefined)
            addValidationError('author must be defined');
        }
      } as FieldHooks<Lists.Post.TypeInfo>,
    }),
    content: document({
      formatting: true,
      links: true,
      dividers: true,
      relationships: {
        mention: {
          listKey: 'User',
          label: 'Mention',
          selection: 'id name email',
        },
      },
      ui: {
        listView: {
          fieldMode: 'hidden'
        },
      },
    })
  },
  access: {
    filter: {
      query: (args) => isAuthenticated(args) ? true : {status: {equals: 'published'}},
    },
    operation: {
      create: isAuthenticated,
      update: isAuthenticated,
      delete: isAuthenticated,
    },
  },
  ui: {
    labelField: 'title'
  },
});
