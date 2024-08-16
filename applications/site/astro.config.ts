import SpaceFood from '@spacefood/theme';
import { defineConfig } from 'astro/config';
import { trace } from 'vitrace';

export default defineConfig({
  integrations: [
    trace(
      { prefix: 'prefix', color: 'blueBright' },
      SpaceFood({
        config: {
          title: 'My Recipes',
          description: '🚧 My recipes are currently under construction!',
        },
        pages: {},
        overrides: {},
      }),
    ),
  ],
});
