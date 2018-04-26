import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'
import pkg from './package.json'

const minify = process.env.MINIFY
const format = process.env.FORMAT
const es = format === 'es'
const umd = format === 'umd'
const cjs = format === 'cjs'

let output

if (es) {
  output = { file: `dist/react-callbag-listener.es.js`, format: 'es' }
} else if (umd) {
  if (minify) {
    output = {
      file: `dist/react-callbag-listener.umd.min.js`,
      format: 'umd'
    }
  } else {
    output = { file: `dist/react-callbag-listener.umd.js`, format: 'umd' }
  }
} else if (cjs) {
  output = { file: `dist/react-callbag-listener.cjs.js`, format: 'cjs' }
} else if (format) {
  throw new Error(`invalid format specified: "${format}".`)
} else {
  throw new Error('no format specified. --environment FORMAT:xxx')
}

export default {
  input: 'src/index.js',
  output: Object.assign(
    {
      name: 'react-callbag-listener',
      exports: 'named',
      globals: {
        react: 'React',
        'prop-types': 'PropTypes'
      }
    },
    output
  ),
  external: umd
    ? Object.keys(pkg.peerDependencies || {})
    : [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
      ],
  plugins: [
    resolve({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' }),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [['env', { loose: true, modules: false }], 'stage-2'],
      plugins: [
        'external-helpers',
        ['transform-react-remove-prop-types', { mode: 'unsafe-wrap' }]
      ]
    }),
    umd
      ? replace({
          'process.env.NODE_ENV': JSON.stringify(
            minify ? 'production' : 'development'
          )
        })
      : null,
    minify ? uglify() : null
  ].filter(Boolean)
}
