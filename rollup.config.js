import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'lib/index.ts', // Your TypeScript entry file
    output: [
      {
        file: 'dist/bundle.cjs.js', // Output file for CommonJS bundle
        format: 'cjs', // Specify the format as CommonJS
        sourcemap: true // Optional: Generate source map
      },
      {
        file: 'dist/bundle.esm.js', // Output file for ESM bundle
        format: 'esm', // Specify the format as ESM
        sourcemap: true // Optional: Generate source map
      }
    ],
    plugins: [
      typescript(), // Compile TypeScript files
      nodeResolve(), // Resolve node modules
      commonjs() // Convert CommonJS modules to ESM
    ]
  }
];