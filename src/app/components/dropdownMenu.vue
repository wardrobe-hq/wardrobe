<!--
/*
 * File: dropdownMenu.vue
 * Project: wardrobe
 * Created Date: 2026-09-03 17:46:28
 * Author: 3urobeat
 *
 * Last Modified: 2026-09-04 22:47:30
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
-->


<!-- Example from FreeFrontend used as reference: https://freefrontend.com/tailwind-dropdowns/#2025-12-17-tailwind-css-fly-out-menu-vue-js-l & https://codepen.io/stefan-galescu/pen/vYNXWMP -->


<template>

    <div ref="dropdownRef" class="relative inline-block">
        <!-- Toggle button -->
        <button type="button" class="custom-button-icon-only" @click="isVisible = !isVisible">
            <span class="px-2">...</span>
        </button>

        <!-- Triangle -->
        <p v-if="isVisible" class="text-2xl -mt-1 -mb-1 right-0 text-bg-field-light dark:text-bg-field-dark">&#x25B2;</p>

        <!-- Dropdown panel -->
        <div v-if="isVisible" class="absolute right-0 z-50">

            <!-- Apply classes to sub-elements (our slot items) using e.g. [&>button]:flex or *:flex to all component kinds -->
            <div
                class="
                    relative py-1 rounded-md shadow-lg bg-bg-input-light dark:bg-bg-input-dark outline-2 outline-border-primary-light dark:outline-border-primary-dark
                    *:flex *:items-center *:text-nowrap *:px-4 *:py-2 [&>button]:hover:bg-bg-input-hover-light [&>button]:hover:dark:bg-bg-input-hover-dark [&>button]:active:bg-bg-input-click-light [&>button]:active:dark:bg-bg-input-click-dark [&>button]:hover:transition-all
                "
                @click="isVisible = false"
            >
                <!-- Slots, used for drop down items, usually buttons -->
                <slot></slot>

                <!-- Extra space for some text, visible when <template v-slot:text> is present -->
                <div v-if="$slots.text" class="custom-text-small-secondary border-t border-border-secondary-light dark:border-border-secondary-dark mt-1">
                    <slot name="text"></slot>
                </div>
            </div>

        </div>
    </div>

</template>


<script setup lang="ts">
    import { onClickOutside } from "@vueuse/core";

    const isVisible = ref(false);
    const dropdownRef = ref<HTMLElement | null>(null);

    onClickOutside(dropdownRef, () => {
        isVisible.value = false;
    });

</script>
