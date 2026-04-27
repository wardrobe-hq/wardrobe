/*
 * File: nuxt.config.ts
 * Project: wardrobe
 * Created Date: 2025-09-08 17:37:49
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-24 17:31:26
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    compatibilityDate: "2025-09-08",
    css: ["~/pages/main.css"],

    vite: {
        plugins: [
            tailwindcss(),
        ],
        optimizeDeps: {
            include: [
                "@vueuse/integrations/useSortable",
                "@phosphor-icons/vue",
                "@vue/devtools-core",
                "@vue/devtools-kit",
                "three",
                "three-stdlib",
            ]
        }
    },

    srcDir: "src/",
    serverDir: "src/server",

    dir: {
        public: "src/public",
        modules: "src/modules",
        shared: "src/shared",
    },

    hooks: {
        "pages:extend"(pages) {

            // Re-Route index to clothing subdirectory
            pages.push({
                name: "index",
                path: "/",
                file: "~/pages/clothing/index.vue"
            });

            // Re-Route clothing/edit to clothing/view and toggle components to re-use code
            pages.push({
                name: "clothing-edit",
                path: "/clothing/edit",
                file: "~/pages/clothing/view.vue"
            });

            // Re-Route outfits/edit to outfits/view and toggle components to re-use code
            pages.push({
                name: "outfits-edit",
                path: "/outfits/edit",
                file: "~/pages/outfits/view.vue"
            });

        }
    },

    nitro: {
        // Storage buckets
        storage: {
            images: {
                driver: "fs",
                base: "./data/images",
            },
        },
    },

    modules: [
        "@vueuse/nuxt",
        "@nuxtjs/i18n"
    ],

    i18n: {
        locales: [
            { code: "en", language: "en-US", file: "en.json" },
            { code: "de", language: "de-DE", file: "de.json" },
            { code: "debug", language: "debug", file: "debug.json" },
        ],
        // When enabled, this adds a lang prefix to every route name. This causes errors due to the re-route above and breaks my route detection though, so we disable it.
        strategy: "no_prefix",
        defaultLocale: "en",
        restructureDir: "src/i18n"
    }

});
