<!--
/*
 * File: app.vue
 * Project: wardrobe
 * Created Date: 2026-05-11 18:45:27
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-12 19:01:56
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
-->


<template>
    <!-- Logo -->
    <button class="fixed mx-7 my-4" @click="goHome">
        <img src="/logo-dark.png" class="h-7.5 hidden dark:block" />
        <img src="/logo-light.png" class="h-7.5 block dark:hidden" />
    </button>

    <!-- Content -->
    <div class="flex flex-col gap-8 justify-center items-center min-h-[60vh] select-none text-text-light dark:text-text-dark">
        <span class="text-9xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-wardrobe-blue to-wardrobe-blue/50">
            {{ error.statusCode }}
        </span>

        <h1 class="text-3xl font-bold">
            {{ error.statusCode == 404 ? $t("errorPageTitle") : error.statusMessage }}
        </h1>

        <!-- Go Back/Home Button Group -->
        <div class="flex gap-4">
            <button class="custom-button-primary" @click="goBack">
                <PhCaretLeft class="size-5 mr-2" /> {{ $t("goBack") }}
            </button>

            <button class="custom-button-primary" @click="goHome">
                <PhHouse class="size-5 mr-2" /> {{ $t("errorPageGoHome") }}
            </button>
        </div>
    </div>
</template>


<script setup lang="ts">
    import { PhHouse, PhArrowClockwise, PhCaretLeft } from "@phosphor-icons/vue";

    const props = defineProps({
        error: {
            type: Object,
            required: true
        }
    });

    console.error("Wardrobe encountered an error!", props.error);


    useSeoMeta({
        title: "Wardrobe - Error",
        ogTitle: "Wardrobe - Error"
    });

    useHead({
        link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
        script: [{ src: "/global.js" }]
    });


    // Clears error and redirects to index
    function goHome() {
        clearError({ redirect: '/' });
    }

    // Redirects to previous page
    function goBack() {
        clearError();
        useRouter().go(-1);
    }

</script>
