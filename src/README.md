# Wardrobe Source Tree

TBA

## Structure
https://nuxt.com/docs/4.x/directory-structure

- `app/` - Contains front end code
  - `components/` - Contains all reusable Vue front end components used by pages
  - `composables/` - Contains all stateful util functions for Vue front end
  - `i18n/locales/` - Contains language translations, registered in `nuxt.config.ts`
  - `pages/` - Contains all Vue front end pages, linked to by `main.vue`
    - `[...]/`
      - `edit.vue` - Dummy file, edit is implemented in `view.vue`
      - `index.vue` - Browse page for this topic
      - `view.vue` - View & Edit page for a particular object, like a piece of clothing
    - `main.css` - Contains TailwindCSS configuration and reusable styles
  - `utils/` - Contains all stateless util functions for Vue front end
  - `app.vue` - Front end entry point, checks if server is ready and loads `main.vue`
  - `error.vue` - Custom error page
  - `main.vue` - Main front end page, contains embeds and links to all other pages or components
- `public/` - Publicly accessible resources, like favicon or the outfit dummy 3d model
- `server/` - Contains back end code
  - `api/` - Contains all API routes provided by the server, used by front end to get/set data
  - `middleware/` - Contains request interceptors
  - `plugins/` - Contains anything that should run on startup
  - `utils/` - Contains all util functions for back end server
  - `main.ts` - Contains DIY main file that is run on startup by the `01-main.ts` plugin and gives us at least some lifecycle control
- `shared/` - Contains code shared between front and back end
  - `types` - Contains type definitions and operations on those types
  - `utils` - Contains all stateless util functions shared between front and back end
