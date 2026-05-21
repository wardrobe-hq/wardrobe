<!--
/*
 * File: app.vue
 * Project: wardrobe
 * Created Date: 2025-09-08 15:54:21
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-20 22:22:28
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
-->


<template>

    <!-- Fullscreen loading page shown until server startup is complete -->
    <div v-if="isReady.error.value">
        <div class="flex flex-col gap-8 justify-center items-center min-h-[60vh] select-none text-text-light dark:text-text-dark">
            <div>
                <div class="w-26 -mb-1.5 inline-block">
                    <img src="/logo-dark.png" class="h-20 object-left object-cover hidden dark:block" />
                    <img src="/logo-light.png" class="h-20 object-left object-cover block dark:hidden" />
                </div>

                <span class="text-8xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-wardrobe-blue to-wardrobe-blue/50">
                    Wardrobe
                </span>
            </div>
            <p class="text-2xl font-bold dark:text-text-dark">v{{ packagejson.version }}</p>
            <div class="loader"></div>
        </div>
    </div>

    <!-- Server is ready, show app content -->
    <Main v-else></Main>

</template>


<script setup lang="ts">
    import packagejson from "~/../../package.json";
    import Main from "./main.vue";


    // Specify page information
    useSeoMeta({
        title: "Wardrobe",
        ogTitle: "Wardrobe",
        description: "Selfhosted clothing management web app",
        ogDescription: "Selfhosted clothing management web app"
    });

    useHead({
        link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
        script: [{ src: "/global.js" }] // Sets initial dark mode. Defined in header to fix transition load - https://stackoverflow.com/a/14416030
    });


    // Check if server is ready once during SSR
    const isReady = await useFetch("/api/ping"); // Middleware will deny request if !ready

    onMounted(async () => { // Client side only
        console.debug("Wardrobe mounted!");

        // If server was not ready during SSR, re-fetch API endpoint
        if (!isReady.data.value) {
            const isReadyCheckInterval = setInterval(() => {
                isReady.refresh();
                if (isReady.data.value) clearInterval(isReadyCheckInterval);
            }, 1000);
        }
    });

</script>
