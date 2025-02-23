import { defineConfig } from "vite";
import svgLoader from 'vite-svg-loader';
import { createHtmlPlugin } from 'vite-plugin-html';
import { imagetools } from 'vite-imagetools'

export default defineConfig({
    base: "./",
    plugins: [
        imagetools({
            defaultDirectives: () => new URLSearchParams({
                format: 'webp',
                lossless: true
            })
        }),
        createHtmlPlugin({ minify: true }),
        svgLoader({ defaultImport: 'url' }),
    ],
});