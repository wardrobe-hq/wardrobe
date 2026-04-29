<!--
/*
 * File: titleBarFull.vue
 * Project: wardrobe
 * Created Date: 2025-09-17 17:25:36
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-29 18:45:52
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

    <!-- TODO: Blur only size of components -->
    <div id="fixed-title" class="fixed flex flex-col right-0 top-20.5 w-full text-nowrap select-none px-3 md:px-6">

        <!-- Title Bar which is always displayed -->
        <div class="flex w-full justify-between md:justify-end gap-x-4 p-1.5 rounded-2xl backdrop-blur-lg">
            <!-- Sort dropdown -->
            <div class="flex min-w-18 sm:min-w-32 justify-end rounded-xl shadow-md select-none bg-bg-field-light dark:bg-bg-field-dark">
                <select class="w-full px-2 m-0.5" v-model="selectedSort" v-on:change="saveUxSetting">
                    <option :value="SortMode.dateDesc">{{ $t('sortByDateDesc') }}</option>
                    <option :value="SortMode.dateAsc">{{ $t('sortByDateAsc') }}</option>
                    <option :value="SortMode.nameDesc">{{ $t('sortByNameDesc') }}</option>
                    <option :value="SortMode.nameAsc">{{ $t('sortByNameAsc') }}</option>
                </select>
            </div>

            <!-- Filters selection for Desktop. flex-auto-reverse allows right aligned overflowing list that does not hide elements or breaks scroll (looking at you justify-end) -->
            <div
                class="flex-row-reverse rounded-xl overflow-x-auto shadow-md select-none gap-2 bg-bg-field-light dark:bg-bg-field-dark transition-all"
                :class="selectedFilters.length > 0 ? 'hidden md:flex w-0 md:w-full lg:w-1/3 p-1' : 'w-0 p-0'"
            >
                <button
                    class="custom-wardrobe-label-clickable"
                    :class="selectedFilters.includes(thisFilter.id) ? 'custom-wardrobe-label-selected-outline' : ''"
                    v-for="thisFilter in storedLabels.document!.filter((e) => selectedFilters.includes(e.id))"
                    :key="thisFilter.id"
                    @click="toggleFilter(thisFilter.id)"
                >
                    {{ thisFilter.name }}
                </button>
            </div>

            <!-- Scaling slider for Desktop -->
            <input
                type="range"
                class="w-full md:w-1/12 bg-neutral-quaternary rounded-full appearance-none cursor-pointer [&::-moz-range-track]:bg-bg-field-light dark:[&::-moz-range-track]:bg-bg-field-dark [&::-moz-range-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-bg-field-light dark:[&::-webkit-slider-runnable-track]:bg-bg-field-dark [&::-webkit-slider-runnable-track]:rounded-full"
                min="0"
                max="9"
                v-model="selectedScaling"
                v-on:change="saveUxSetting"
            >

            <!-- Add button -->
            <NuxtLink :to="buttonRedirectTo" class="custom-button-primary">
                <slot></slot>
            </NuxtLink>
        </div>


        <!-- Title bar extension that gets added on mobile -->
        <!-- TODO: Having to duplicate the entire filter selection sucks -->
        <div id="title-mobile-extension" v-if="selectedFilters.length > 0">
            <!-- Filters selection for Mobile. justify-center hides left overflowing elements so a roundabout ml-auto for the first and last element is necessary -->
            <div
                class="[&>*:first-child]:ml-auto [&>*:last-child]:mr-auto flex-row rounded-xl overflow-x-scroll shadow-md select-none gap-2 bg-bg-field-light dark:bg-bg-field-dark transition-all"
                :class="selectedFilters.length > 0 ? 'flex md:hidden w-full md:w-0 lg:w-1/3 p-1 mt-3' : 'w-0 p-0'"
            >
                <button
                    class="custom-wardrobe-label-clickable text-sm"
                    :class="selectedFilters.includes(thisFilter.id) ? 'custom-wardrobe-label-selected-outline' : ''"
                    v-for="thisFilter in storedLabels.document!.filter((e) => selectedFilters.includes(e.id))"
                    :key="thisFilter.id"
                    @click="toggleFilter(thisFilter.id)"
                >
                    {{ thisFilter.name }}
                </button>
            </div>
        </div>

    </div>

</template>


<script setup lang="ts">
    import { defaultUXSettings } from '~/model/storage';
    import type { Label } from '~/model/label';
    import { SortMode } from '~/model/sort-modes';


    // Get global cache from app.vue
    const storedLabels = getAllLabelsFromServer();

    // Refs
    const selectedSort:    Ref<SortMode>  = ref(SortMode.dateDesc);
    const selectedFilters: Ref<string[]>  = ref([]);
    const selectedScaling: Ref<number>    = ref(defaultUXSettings.selectedItemCardsScaling);

    // Client side only
    onBeforeMount(() => {
        selectedScaling.value = getUXSettings().selectedItemCardsScaling;
        selectedSort.value    = getUXSettings().selectedItemSort;
    });


    // Save scaling setting
    function saveUxSetting() {
        setUXSetting("selectedItemCardsScaling", selectedScaling.value);
        setUXSetting("selectedItemSort", selectedSort.value);
    }


    /**
     * Applies or removes a filter to/from the view
     * @param thisFilter Filter to add/remove
     */
    const toggleFilter = (thisFilter: string) => {

        // Get all selected labels without this one
        const filtered = selectedFilters.value.filter((e: string) => e != thisFilter);

        // If length does not match, the label must be selected
        if (filtered.length != selectedFilters.value.length) {
            // ...and we can simply remove it without filtering again
            selectedFilters.value = filtered;

            console.debug("DEBUG - toggleFilter: Disabled " + thisFilter);
        } else {
            // ...otherwise we can simply add it
            selectedFilters.value.push(thisFilter);

            console.debug("DEBUG - toggleFilter: Enabled " + thisFilter);
        }

    }


    // Define Props to be accepted by this component
    defineProps({
        buttonRedirectTo: {
            type: String,
            required: true
        }
    });

    // Define stuff that can be accessed by the page
    defineExpose({
        selectedSort,
        selectedFilters,
        selectedScaling,
        toggleFilter
    });

</script>
