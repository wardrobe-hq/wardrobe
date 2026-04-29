<!--
/*
 * File: globalTitleBar.vue
 * Project: wardrobe
 * Created Date: 2025-12-28 15:07:43
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-29 17:48:44
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
        <div class="fixed h-8 left-12.5 lg:left-7.5 flex gap-4 select-none">
            <!-- Wardrobe Icon(s) for light/dark mode with cut for expanded search bar on mobile -->
            <NuxtLink class="z-20 cursor-pointer transition-opacity duration-500" to="/">
                <div :class="globalSearchStr != null ? 'w-10 sm:w-fit' : ''">
                    <img src="/logo-dark.png" class="h-7.5 object-left object-cover sm:object-contain hidden dark:block">
                    <img src="/logo-light.png" class="h-7.5 object-left object-cover sm:object-contain block dark:hidden">
                </div>
            </NuxtLink>

            <!-- User's current weather -->
            <PickerDialog
                :toggleText="currentWeather?.weather?.at(0)?.description || $t('weatherLoadFail')"
                hideSearch
            >
                <template v-slot:toggle>
                    <div class="flex items-center gap-2 px-2 py-1 select-none rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark">
                        <!-- Icon -->
                        <div>
                            <PhSpinnerGap v-if="weatherLoading" class="size-5 text-orange-500 animate-spin"></PhSpinnerGap>
                            <PhWarning v-else-if="currentWeather == null" class="size-5 text-orange-500"></PhWarning>

                            <div v-else>
                                <PhCloudLightning v-if="weatherIdToCondition(currentWeather.weather[0]!.id) == WeatherConditionGroupID.Thunderstorm" />
                                <PhCloudRain v-else-if="[WeatherConditionGroupID.Drizzle, WeatherConditionGroupID.Rain].includes(weatherIdToCondition(currentWeather.weather[0]!.id))" />
                                <PhSnowflake v-else-if="weatherIdToCondition(currentWeather.weather[0]!.id) == WeatherConditionGroupID.Snow" />
                                <PhCloudFog  v-else-if="weatherIdToCondition(currentWeather.weather[0]!.id) == WeatherConditionGroupID.Fog" />
                                <PhSun       v-else-if="weatherIdToCondition(currentWeather.weather[0]!.id) == WeatherConditionGroupID.Clear" />
                                <!-- TODO: PhMoonStars when it's dark? -->
                                <PhCloud     v-else-if="weatherIdToCondition(currentWeather.weather[0]!.id) == WeatherConditionGroupID.Clouds" />
                            </div> <!-- TODO: Ugh, what a block -->
                        </div>

                        <!-- Temperature -->
                        <label class="cursor-pointer">{{ formatTemp(currentWeather?.main.temp) }}</label>
                    </div>
                </template>

                <template v-slot:items>
                    <div v-if="currentWeather" class="w-120 break-normal gap-x-2 ml-1">
                        <label class="custom-label-secondary py-0! px-2! w-fit">{{ $t("weatherForLocation", { location: currentWeather.name }) }}</label> <br>
                        <br>
                        {{ currentWeather.weather[0]?.main }} ({{ currentWeather.weather[0]?.description }}) <br>
                        {{ formatTemp(currentWeather.main.temp) }} ({{ $t("weatherTempFeelsLike") }} {{ formatTemp(currentWeather.main.feels_like) }}) <br>
                        <br>
                        <label class="custom-label-secondary py-0! px-2! w-fit">{{ $t("lastRefresh") }}</label> {{ $t("timeAgo", { time: formatTimestamp(currentWeather.dt * 1000) }) }} <br>
                        <label class="custom-label-secondary py-0! px-2! w-fit">{{ $t("poweredBy") }}</label> openweathermap.org
                    </div>
                    <div v-else class="w-120 break-normal">
                        {{ $t('weatherLoadAPIError') }} {{ weatherAPIErrorMessage }}
                    </div>
                </template>
            </PickerDialog>
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
    import { PhMoon, PhSun, PhMagnifyingGlass, PhSpinnerGap, PhCloudLightning, PhCloudRain, PhSnowflake, PhCloudFog, PhCloud, PhWarning } from "@phosphor-icons/vue";
    import { confTempToStr } from "~/composables/unitConversion";
    import { type TemperatureKelvin } from "~/model/unit";
    import { WeatherConditionGroupID, weatherIdToCondition, type WeatherData } from "~/model/weather";
    import { getWeatherFromServer } from "~/utils/utils";
    import { onClickOutside } from '@vueuse/core'
    import { State } from "~/composables/state";

    const i18n = useI18n();

    // Refs
    const globalSearchInput                         = useTemplateRef("globalSearchInput");
    const globalSearchBarShown: Ref<boolean>        = useState(State.GLOBAL_SEARCH_BAR_SHOWN); // Poor woman's approach at page properties
    const globalSearchStr:      Ref<string|null>    = useState(State.GLOBAL_SEARCH_STRING);    // null on page load, set to "" on click to expand input

    const currentWeather: Ref<WeatherData|null> = ref(null);
    const weatherLoading: Ref<boolean>          = ref(false);
    let   weatherAPIErrorMessage                = null;


    // Load weather
    onMounted(() => {
        getWeather();
    });


    // Collapse search input when clicking anywhere while search bar is empty
    onClickOutside(globalSearchInput, () => {
        if (globalSearchStr.value === "") {
            globalSearchStr.value = null;
        }
    });


    // Re-fetch weather from server when settings have been changed to react to changed position/api key
    useNuxtApp().hook("app:user:settingsSaved", () => {
        console.debug(`[DEBUG] Received settingsSaved event, refetching weather'`);
        getWeather();
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


    // Gets current weather from server
    async function getWeather() {

        // Display loading icon and clear stored value
        weatherLoading.value = true;
        currentWeather.value = null;
        weatherAPIErrorMessage = null;

        let error;
        let errorMsg;

        ({ error: error, errorMsg: errorMsg, weather: currentWeather.value } = await getWeatherFromServer());

        if (error) {
            weatherAPIErrorMessage = i18n.t(error, errorMsg);
        }

        // Disable loading icon again
        weatherLoading.value = false;

    }


    // Formats temp in kelvin to human readable string. Middleman function to display "? unit" on undefined
    function formatTemp(temp: TemperatureKelvin | undefined): string {
        if (!temp) {
            return `? ${getConfTempUnitStr()}`; // Data not loaded (yet)
        }

        return confTempToStr(temp, true);
    }


    // Define Props to be accepted by this component
    defineProps({ });

</script>
