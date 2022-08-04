import {statelessSessions} from '@keystone-6/core/session';

import 'dotenv/config';

export const session = statelessSessions({
  maxAge: 60 * 60 * 24 * 30, // 30 days
  secret: process.env.SESSION_SECRET,
});
