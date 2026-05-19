<!--
/*
 * File: globalTitleBar.vue
 * Project: wardrobe
 * Created Date: 2025-12-28 15:07:43
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-19 19:06:39
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

    <div class="fixed flex items-center z-40 shrink-0 h-15 min-w-screen dark:text-text-dark border-y border-y-border-primary-light dark:border-y-border-primary-dark border-t-0">

        <!-- Left side -->
        <div class="fixed h-8 left-12.5 lg:left-7.5 flex gap-5 select-none">
            <!-- Wardrobe Icon(s) for light/dark mode with cut for expanded search bar on mobile -->
            <NuxtLink class="z-20 cursor-pointer transition-opacity duration-500" to="/">
                <div :class="globalSearchStr != null ? 'w-10 sm:w-fit' : ''" class="relative inline-block">
                    <img src="/logo-dark.png" class="h-7.5 object-left object-cover sm:object-contain hidden dark:block" />
                    <img src="/logo-light.png" class="h-7.5 object-left object-cover sm:object-contain block dark:hidden" />

                    <!-- Server Connection Status dot, positioned to bottom right of logo -->
                    <div class="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/3 rounded-full size-3 bg-green-500/80 shadow-md" v-if="subscriptionState" :title="$t('serverSubscriptionConnected')"></div>
                </div>
            </NuxtLink>

            <!-- User's current weather -->
            <WeatherPopout></WeatherPopout>
        </div>

        <!-- Right side -->
        <div class="fixed h-8 right-3 flex select-none shadow-md rounded-xl bg-bg-field-light dark:bg-bg-field-dark divide-border-secondary-light dark:divide-border-secondary-dark divide-x">
            <!-- Search input. Use click.prevent to prevent click from passing through and thus preventing search bar from expanding -->
            <button
                class="flex px-2 py-1 rounded-l-xl hover:bg-bg-input-hover-light hover:dark:bg-bg-input-hover-dark hover:transition-all"
                @click.stop="toggleGlobalSearchBar()"
                v-if="globalSearchBarShown"
            >
                <PhMagnifyingGlass class="self-center size-5"></PhMagnifyingGlass>
                <input
                    ref="globalSearchInput"
                    class="w-0 outline-0 transition-all"
                    :class="globalSearchStr != null ? 'w-25 sm:w-40 md:w-50 ml-2' : 'invisible w-0'"
                    :placeholder="$t('search')"
                    type="search"
                    v-model.trim="globalSearchStr"
                />
            </button>

            <!-- Light/Dark Mode toggle -->
            <button
                class="w-9 px-1.75 py-1 hover:bg-bg-input-hover-light hover:dark:bg-bg-input-hover-dark hover:transition-all"
                :class="globalSearchBarShown ? 'rounded-r-xl' : 'rounded-xl'"
                @click="toggleDarkMode()"
            >
                <PhMoon class="hidden dark:block size-5.5 transition-opacity"></PhMoon>
                <PhSun class="block dark:hidden size-5.5 transition-opacity"></PhSun>
            </button>
        </div>

    </div>

</template>


<script setup lang="ts">
    import { PhMoon, PhSun, PhMagnifyingGlass } from "@phosphor-icons/vue";
    import { onClickOutside } from '@vueuse/core'
    import { State } from "~/composables/state";


    // Refs
    const globalSearchInput                         = useTemplateRef("globalSearchInput");
    const globalSearchBarShown: Ref<boolean>        = useState(State.GLOBAL_SEARCH_BAR_SHOWN); // Poor woman's approach at page properties
    const globalSearchStr:      Ref<string|null>    = useState(State.GLOBAL_SEARCH_STRING);    // null on page load, set to "" on click to expand input
    const subscriptionState:    Ref<boolean>        = useState(State.SERVER_SUBSCRIPTION_CONNECTED);


    // Collapse search input when clicking anywhere while search bar is empty
    onClickOutside(globalSearchInput, () => {
        if (globalSearchStr.value === "") {
            globalSearchStr.value = null;
        }
    });


    // Sets globalSearchStr to !null to expand search bar and sets focus
    function toggleGlobalSearchBar() {
        globalSearchStr.value = globalSearchStr.value || "";

        // Wait a moment as we cannot focus the non-expanded input. nextTick() is not enough
        setTimeout(() => {
            globalSearchInput.value!.focus();
        }, 50);
    }


    // Toggles dark mode
    function toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle("dark");
        setUXSetting("darkModeEnabled", isDark);
    }


    // Define Props to be accepted by this component
    defineProps({ });

</script>
