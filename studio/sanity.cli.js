// sanity.cli.js
import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'clgsgxc0',
    dataset: 'production'
  },
  deployment: {
    appId: '773fca0c94d49a21e604a9e8'
  },
  vite: (prev) => {
    const emptyModule = `${__dirname}/src/lib/emptyModule.js`;
    return {
      ...prev,
      resolve: {
        ...prev?.resolve,
        alias: {
          ...prev?.resolve?.alias,
          '3d-force-graph-vr': emptyModule,
          '3d-force-graph-ar': emptyModule,
        },
      },
    };
  },
})
