import {createAuth} from '@keystone-6/auth';

const {withAuth} = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'id name email',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },
});

export {withAuth};
