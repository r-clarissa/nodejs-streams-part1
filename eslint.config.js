import globals from 'globals'
import pluginJs from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'

/** @type {import('eslint').Linter.Config[]} */
export default [
  stylistic.configs.customize({
    flat: true, // required for flat config
    // the following options are the default values
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: true,
  }),
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
]
