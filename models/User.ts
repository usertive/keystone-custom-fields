import {list} from '@keystone-6/core';
import {password, relationship, text} from '@keystone-6/core/fields';
import {Lists} from '.keystone/types';
import {FieldHooks} from '@keystone-6/core/dist/declarations/src/types/config/hooks';
import {string, ValidationError} from 'yup';
import {isAuthenticated} from '../utils/access-control-utils';
import {vectorImage} from '../fields/vectorImage';

export const User = list({
  fields: {
    name: text({
      validation: {isRequired: true},
      db: {isNullable: false},
      graphql: {
        read: {isNonNull: true},
        create: {isNonNull: true}
      },
      hooks: {
        validateInput: ({resolvedData, addValidationError}) => {
          const {name} = resolvedData;

          if(name !== undefined) {
            try {
              string().label('name').required().min(3).validateSync(name, {strict: true, abortEarly: true});
            } catch(e: unknown) {
              if(ValidationError.isError(e)) {
                e.errors.forEach(addValidationError);
              }
            }
          }
        }
      }  as FieldHooks<Lists.User.TypeInfo>,
    }),
    email: text({
      validation: {isRequired: true},
      isIndexed: 'unique',
      db: {isNullable: false},
      graphql: {
        read: {isNonNull: true},
        create: {isNonNull: true}
      },
      hooks: {
        validateInput: ({resolvedData, addValidationError}) => {
          const {email} = resolvedData;

          if(email !== undefined) {
            try {
              string().label('email').email().required().validateSync(email, {strict: true, abortEarly: true});
            } catch(e: unknown) {
              if(ValidationError.isError(e)) {
                e.errors.forEach(addValidationError);
              }
            }
          }
        }
      }  as FieldHooks<Lists.User.TypeInfo>,
    }),
    password: password({
      validation: {isRequired: true},
      db: {isNullable: false},
      access: {
        read: isAuthenticated,
      },
    }),
    avatar: vectorImage({
      storage: 'localVectorImages'
    }),
    posts: relationship({
      ref: 'Post.author',
      many: true,
      ui: {
        displayMode: 'count',
        hideCreate: true,
        createView: {fieldMode: 'hidden'},
      },
    }),
  },
  access: {
    operation: {
      create: isAuthenticated,
      update: isAuthenticated,
      delete: isAuthenticated,
    },
  },
  ui: {
    labelField: 'name'
  },
});
