<!--
/*
 * File: outfitRecommendationDialog.vue
 * Project: wardrobe
 * Created Date: 2026-03-01 15:17:09
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-28 21:58:43
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
-->


<!--
    This file implements the outfit recommendation popup
-->


<template>

    <div class="fixed bottom-7 right-7">
        <PickerDialog
            :toggleText="$t('outfitRecommendationTooltip')"
        >
            <!-- Round button, fixed to page bottom right -->
            <template v-slot:toggle>
                <div class="lg:bottom-10 lg:right-10 custom-button-icon-only rounded-4xl!">
                    <PhLightbulb class="size-7 p-1 fill-text-light dark:fill-text-dark"></PhLightbulb>
                </div>
            </template>

            <!-- Items area -->
            <template v-slot:items="slotProps">
                <label class="p-1 text-nowrap" v-if="weatherAPIErrorMessage != null">{{ $t('weatherLoadAPIError') }} {{ weatherAPIErrorMessage }}</label>

                <div class="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:w-180 max-w-screen max-h-140 gap-4 overflow-y-auto"> <!-- TODO: overflow clips shadow -->
                    <NuxtLink
                        class="custom-items-grid-card cursor-pointer flex flex-col p-2! h-45! md:h-55! aspect-square! dark:bg-bg-embed-dark! hover:dark:bg-bg-embed-hover-dark!"
                        v-for="thisOutfit in recommendedOutfits.filter((e) => e.title.toLowerCase().includes(slotProps.searchStr.toLowerCase()))"
                        :key="thisOutfit.id"
                        :to="'/outfits/view?id=' + thisOutfit.id"
                    >                                                           <!-- TODO: How much does this search suck compared to some guideline? -->
                        <ImgLazy conClass="select-none w-full h-full overflow-hidden" :itemName="thisOutfit.title" :imgPath="thisOutfit.previewImgPath" :imgWidth="384" />

                        <div>
                            <label class="self-start text-sm font-semibold ml-0.5">{{ thisOutfit.title }}</label>

                            <!-- Labels -->
                            <div class="flex h-7 mt-1 overflow-auto gap-0.5">
                                <button
                                    class="custom-wardrobe-label-clickable text-sm h-fit m-0.5"
                                    v-for="thisLabel in storedLabels.document!.filter((e) => thisOutfit.labelIDs.includes(e.id))"
                                    :key="thisLabel.name"
                                >
                                    {{ thisLabel.name }}
                                </button>
                            </div>
                            </div>
                    </NuxtLink>

                    <label class="p-1 text-nowrap" v-if="recommendedOutfits.length == 0">{{ $t("outfitRecommendationEmpty") }}</label>
                </div>
            </template>
        </PickerDialog>
    </div>

</template>


<script setup lang="ts">
    import { PhLightbulb } from '@phosphor-icons/vue';
    import { CategorySpecialityID, type CategorySpecialityLabelValueMap } from '~/model/label-category';
    import type { Outfit } from '~/model/item';
    import { getWeatherFromServer } from '~/utils/utils';

    const i18n = useI18n();

    // Refs
    const storedLabels     = getAllLabelsFromServer();
    const storedCategories = getAllLabelCategoriesFromServer();

    const storedOutfits    = await getAllOutfitsFromServer();

    const recommendedOutfits:     Ref<Outfit[]> = ref([]);
    let   weatherAPIErrorMessage: string | null = null;


    // Generate recommendations
    onMounted(async () => {
        recommendedOutfits.value = (await getOutfitsToShowInPopout()) || [];
    });
    // TODO: Only on open popup


    // Find items to show to in popout   // TODO: use computed() to avoid multiple calculations?
    async function getOutfitsToShowInPopout(): Promise<Outfit[] | undefined> {

        // Get current weather
        weatherAPIErrorMessage = null;

        let error;
        let errorMsg;
        let currentWeather;

        ({ error: error, errorMsg: errorMsg, weather: currentWeather } = await getWeatherFromServer());

        if (error) {
            weatherAPIErrorMessage = i18n.t(error, errorMsg);
        }

        // Find season category which includes temperature & date range settings
        const seasonCategory = storedCategories.value.document!.find((e) => e.specialityID == CategorySpecialityID.Season);
        if (!seasonCategory) return; // No season category configured

        // Find labels of season category that match current weather and (if both are set) or (if one is set) date range
        const applicableLabels = storedLabels.value.document!.filter((e) => {
            if (e.categoryID == seasonCategory.id) {
                let value = e.specialityValue as CategorySpecialityLabelValueMap<CategorySpecialityID.Season>;

                let matchesWeather = (!weatherAPIErrorMessage && value.fromTemp! <= currentWeather?.main.temp! && value.toTemp! >= currentWeather?.main.temp!); // TODO: Only looks at current temp, not at day forecast

                let matchesDate;
                if (value.fromTimestamp != null && value.toTimestamp != null) {
                    matchesDate = isNowBetweenDatesIgnoringYear(value.fromTimestamp!, value.toTimestamp!);
                }

                console.debug(`[DEBUG] getOutfitsToShowInPopout:`, e.name, (value.fromTemp != null && value.toTemp != null), (value.fromTimestamp != null && value.toTimestamp != null), matchesWeather, matchesDate);

                // Temperature AND Weather constraint set?
                if (value.fromTemp != null && value.toTemp != null && value.fromTimestamp != null && value.toTimestamp != null) {
                    return matchesWeather && matchesDate;
                } else {
                    return matchesWeather || matchesDate;
                }
            }

            return false;
        });

        // Find outfits tagged with season label that matches current date and or weather
        return storedOutfits.value.document!.filter((e) => e.labelIDs.some((f) => applicableLabels.some((g) => f == g.id))); // Filtering with an m to n relationship looks weird, is this overcomplicated?

    }


    // Define Props to be accepted by this component
    // defineProps();

    // Define stuff that can be accessed by the page
    // defineExpose();

</script>
