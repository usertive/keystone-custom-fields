/** @jsxRuntime classic */
/** @jsx jsx */
// noinspection ES6UnusedImports
import {jsx} from '@keystone-ui/core';
import {ReactNode} from 'react';
import {useTheme} from '@keystone-ui/core';

export const VectorImageWrapper = ({children}: {children: ReactNode}) => {
  const theme = useTheme();

  return (
    <div
      css={{
        backgroundColor: 'white',
        borderRadius: theme.radii.medium,
        border: `1px solid ${theme.colors.border}`,
        flexShrink: 0,
        lineHeight: 0,
        padding: 4,
        position: 'relative',
        textAlign: 'center',
        width: '130px', // 120px image + chrome
      }}
    >
      {children}
    </div>
  );
};
