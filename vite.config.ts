import { defineConfig } from "vite";
import svgLoader from 'vite-svg-loader';
import { viteSingleFile } from "vite-plugin-singlefile";
import { createHtmlPlugin } from 'vite-plugin-html';
import { imagetools } from 'vite-imagetools'
import viteAudioTransform from "vite-audio-transform";

export default defineConfig({
    base: "./",
    build: {
        assetsInlineLimit: 2.097152e+6, // 2mb
        chunkSizeWarningLimit: 10000, // 10mb
        minify: 'terser',
        terserOptions: {
            compress: {
                arguments: true,
                booleans_as_integers: true,
                hoist_funs: true,
                hoist_vars: true,
                keep_fargs: false,
                passes: 3,
            },
            format: {
                comments: false,
            }
        },
        rollupOptions: {
            treeshake: 'smallest',
        }
    },
    plugins: [
        imagetools({
            defaultDirectives: () => new URLSearchParams({
                format: 'webp',
                inline: 'true',
                lossless: 'true'
            })
        }),
        createHtmlPlugin({ minify: true }),
        svgLoader({ defaultImport: 'url' }),
        viteAudioTransform({ type: 'webm', quality: 48 }),
        viteSingleFile(),
    ],
});