// 注意：======================================================================
// 大家尽量不要修改这个文件， 此文件是为了统一大家的编码风格。
// 采用的是antdesign 默认提供的 eslint.
// 在开发的过程中，强烈建议大家打开eslint，统一编码风格。
// 对大家个人的编码能力的提升是很有帮助的。
// 特别是对 新版本的 JavaScript 的新增功能在代码中的使用。
//
// 如果大家真的暂时不想打开eslint可以通过 VS code 扩展中 查找ESLint插件，并禁用。
//
module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier', 'plugin:compat/recommended'],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  globals: {
    APP_TYPE: true,
    APP_VB_HOST : true,
    page: true,
    APP_LOCALE_API : true
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js'] }],
    'react/jsx-wrap-multilines': 0,
    'react/prop-types': 0,
    'react/forbid-prop-types': 0,
    'react/jsx-one-expression-per-line': 0,
    'import/no-unresolved': [2, { ignore: ['^@/', '^umi/'] }],
    'import/no-extraneous-dependencies': [
      2,
      {
        optionalDependencies: true,
        devDependencies: ['**/tests/**.js', '/mock/**/**.js', '**/**.test.js'],
      },
    ],
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'linebreak-style': 0,
  },
  settings: {
    polyfills: ['fetch', 'promises', 'url', 'object-assign'],
  },
};
