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
        viteAudioTransform({ type: 'webm', quality: undefined }),
        viteSingleFile(),
    ],
});