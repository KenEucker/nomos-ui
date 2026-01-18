// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        'svelte-multiselect': '/src/lib/svelte-multiselect/index.ts'
      }
    }
  }
});
