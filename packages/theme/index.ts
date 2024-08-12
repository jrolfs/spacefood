import { z } from 'astro/zod';
import defineTheme from 'astro-theme-provider';

export default defineTheme({
  name: '@spacefood/theme',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});
