// sanity.cli.js
import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'clgsgxc0',
    dataset: 'production'
  },
  deployment: {
    appId: '773fca0c94d49a21e604a9e8'
  }
})
