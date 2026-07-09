import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            react: path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
            lodash: path.resolve(__dirname, 'node_modules/lodash'),
            formik: path.resolve(__dirname, 'node_modules/formik'),
            dayjs: path.resolve(__dirname, 'node_modules/dayjs'),
        },
    },
    css: {
        modules: {
            localsConvention: 'camelCase',
        },
        preprocessorOptions: {
            scss: {
                quietDeps: true,
                silenceDeprecations: ['import', 'global-builtin', 'legacy-js-api'],
            },
        },
    },
});
