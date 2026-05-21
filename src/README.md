# Wardrobe Source Tree

TBA

## Structure
https://nuxt.com/docs/4.x/directory-structure

- `components/` - Contains all reusable Vue frontend components used by pages
- `composables/` - Contains all stateful util functions for Vue frontend
- `i18n/locales/` - Contains language translations, registered in `nuxt.config.ts`
- `model/` - Contains type definitions and operations on those types
- `pages/` - Contains all Vue frontend pages, linked to by `app.vue`
  - `[...]/`
    - `edit.vue` - Dummy file, edit is implemented in `view.vue`
    - `index.vue` - Browse page for this topic
    - `view.vue` - View & Edit page for a particular object, like a piece of clothing
  - `main.css` - Contains TailwindCSS configuration and reusable styles
- `public/` - Publicly accessible resources, like favicon or the outfit dummy 3d model
- `server/`
  - `api/` - Contains all API routes provided by the server, used by frontend to get/set data
  - `plugins/`
    - `core.ts` - Contains server core code that should get executed on startup
    - `jobs.ts` - Job Manager that handles registration and execution of periodic tasks, like the dataCleanup core job
  - `utils/` - Contains all util functions for backend server
    - `jobs/` - Contains jobs that register themselves at the Job Manager
- `utils/` - Contains all stateless util functions for Vue frontend
- `app.vue` - Main frontend page, embeds and links to all other pages or components
