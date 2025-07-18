import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        include: ['lib/tests/**/*.test.ts'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@lib': path.resolve(__dirname, 'lib'),
            '@component': path.resolve(__dirname, 'src/app/components'),
        },
    },
});