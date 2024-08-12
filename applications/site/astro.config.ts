import SpaceFood from '@spacefood/theme';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [
    SpaceFood({
      config: {
        title: 'My Recipes',
        description: '🚧 My recipes are currently under construction!',
      },
      pages: {},
      overrides: {},
    }),
  ],
});
