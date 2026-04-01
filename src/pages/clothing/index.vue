<!--
/*
 * File: index.vue
 * Project: wardrobe
 * Created Date: 2024-03-23 13:03:16
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:29:49
 * Modified By: 3urobeat
 *
 * Copyright (c) 2024 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
-->


<template>
    <TitleBarFull
        buttonRedirectTo="/clothing/edit?id=new"
        ref="titleBarFull"
    >
        <PhPlus class="mr-2 size-5 text-green-600"></PhPlus>
        {{ $t("add") }}
        <!-- <text class="hidden sm:block ml-1">{{ $t("clothing") }}</text> --> <!-- Cool idea but creates headaches with non-English languages -->
    </TitleBarFull>

    <div :class="titleBarFull.selectedFilters?.length > 0 ? 'py-27 md:py-20' : 'py-20'"> <!-- Push content down on mobile when title bar expands to show filter bar -->

        <!-- Responsive grid for clothing - Thank you: https://stevekinney.com/courses/tailwind/grid-auto-fit-and-auto-fill-patterns -->
        <div class="custom-items-grid" :class="itemsGridScalingToTailwind(titleBarFull.selectedScaling)">

            <!-- Clothing Cards -->
            <NuxtLink
                class="custom-items-grid-card cursor-pointer flex flex-col"
                :class="itemsGridCardScalingToTailwind(titleBarFull.selectedScaling)"
                v-for="thisClothing in clothesToShow"
                :key="thisClothing.id"
                :to="'/clothing/view?id=' + thisClothing.id"
            >
                <ImgLazy conClass="select-none w-full h-full overflow-hidden" imgClass="shadow-md rounded-2xl" :itemName="thisClothing.title" :imgPath="thisClothing.imgPath" :imgWidth="384" />

                <div>
                    <label class="self-start text-sm @xs:text-base font-semibold @xs:m-1">{{ thisClothing.title }}</label>

                    <!-- Labels -->
                    <div class="flex @3xs:flex-wrap h-7 @3xs:h-10 @2xs:h-15 mt-0.5 @3xs:mt-2 overflow-y-auto gap-0.5">
                        <button
                            class="custom-wardrobe-label-clickable text-sm @xs:text-base h-fit m-0.5"
                            :class="titleBarFull.selectedFilters.includes(thisLabel.id) ? 'custom-wardrobe-label-selected-outline' : ''"
                            v-for="thisLabel in storedLabels.filter((e) => thisClothing.labelIDs.includes(e.id))"
                            :key="thisLabel.id"
                            @click.prevent="titleBarFull.toggleFilter(thisLabel.id)"
                        >
                            {{ thisLabel.name }}
                        </button>
                    </div>
                </div>
            </NuxtLink>

        </div>

    </div>

    <div class="w-full flex justify-center items-center text-text-secondary-light dark:text-text-secondary-dark select-none"> <!-- TODO: Could be a little lower -->
        <!-- No items available text (DB empty) -->
        <label class="custom-label-primary flex items-center w-fit" v-if="storedClothing.length == 0">
            <PhBinoculars class="shrink-0 mr-2"></PhBinoculars>
            {{ $t("clothingPageEmpty") }}
        </label>

        <!-- Nothing to show text (Filter/Search matches no items) -->
        <label class="custom-label-primary flex items-center w-fit" v-else-if="clothesToShow.length == 0">
            <PhMagnifyingGlass class="shrink-0 mr-2"></PhMagnifyingGlass>
            {{ $t("filterNoMatches") }}
        </label>
    </div>
</template>


<script setup lang="ts">
    import { PhBinoculars, PhMagnifyingGlass, PhPlus } from "@phosphor-icons/vue";
    import ImgLazy from "~/components/imgLazy.vue";
    import TitleBarFull from "~/components/titleBarFull.vue";
    import { getAllClothesFromServer } from "~/composables/storage";
    import type { Clothing } from "~/model/item";
    import type { Label } from "~/model/label";
    import { defaultSortMode, sortModes } from "~/model/sort-modes";


    // Set page properties
    definePageMeta({
        showGlobalSearchBar: true
    });


    // Get labels and clothing from cache
    const storedLabels:   Ref<Label[]>    = getAllLabelsFromServer();
    const storedClothing: Ref<Clothing[]> = ref([]);
    storedClothing.value = (await getAllClothesFromServer()).document!;

    // Get refs to props exported by defineExpose() in TitleBarFull
    const titleBarFull: Ref<{ selectedSort: sortModes, selectedFilters: string[], selectedScaling: number, toggleFilter: (thisFilter: string) => void }> = ref({ selectedSort: defaultSortMode, selectedFilters: [], selectedScaling: 0, toggleFilter: () => {} }); // TODO: Can this be an exported type somewhere?


    // Pre-calculate items that should be shown. Can be accessed multiple times in template without re-calculation. Updates when sort/filter/search changes due to reactivity
    let clothesToShow = computed(() => getItemsToShow(storedClothing.value, titleBarFull.value.selectedSort, titleBarFull.value.selectedFilters) as Clothing[]);

</script>
