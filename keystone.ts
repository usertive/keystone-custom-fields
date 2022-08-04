import {config} from '@keystone-6/core';
import {KeystoneContext} from '@keystone-6/core/types';
import {withAuth} from './auth';
import {session} from './session';
import {User} from './models/User';
import {Post} from './models/Post';
import {uploadsDirectoryPath} from './constats';

export default config(
  withAuth(
    {
      server: {
        port: 4000,
      },
      db: {
        provider: 'sqlite',
        url: 'file:./database/sqlite.db',
      },
      session,
      ui: {
        isAccessAllowed: (context: KeystoneContext) => Boolean(context.session?.data),
      },
      storage: {
        // JPG, JPEG, PNG etc.
        localRasterImages: {
          kind: 'local',
          type: 'image',
          storagePath: uploadsDirectoryPath,
          serverRoute: {
            path: '/images',
          },
          generateUrl: (path) => `/images${path}`,
          preserve: false,
        },
        // SVG
        localVectorImages: {
          kind: 'local',
          type: 'file',
          storagePath: uploadsDirectoryPath,
          serverRoute: {
            path: '/svg',
          },
          generateUrl: (path) => `/images${path}`,
          preserve: false,
        },
      },
      lists: {
        User, Post
      },
    }
  )
);
