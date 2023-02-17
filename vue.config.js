const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      externals: ['ffmpeg-static', 'fluent-ffmpeg'],
      nodeModulesPath: ['../../node_modules', './node_modules'],
      preload: 'src/preload.js',
      builderOptions: {
        productName: 'BilibiliVideoBox',
        appId: 'com.w.BilibiliVideoBox',
        nsis: {
          oneClick: false,
          perMachine: false,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true,
        },
        win: {
          target: 'nsis',
        },
      },
    },
  },
  configureWebpack: {
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  },
})
