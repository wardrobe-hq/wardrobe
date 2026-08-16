<!--
/*
 * File: weatherPopout.vue
 * Project: wardrobe
 * Created Date: 2026-05-18 18:22:12
 * Author: 3urobeat
 *
 * Last Modified: 2026-08-16 17:49:50
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

    <PickerDialog
        :toggleText="currentWeather?.weather?.at(0)?.description || $t('weatherLoadFail')"
        hideSearch
    >
        <template v-slot:toggle>
            <div class="flex items-center gap-2 px-2 py-1 select-none rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark"> <!-- Color Gradient?: text-white bg-linear-to-br from-wardrobe-blue to-blue-900 -->
                <!-- Icon -->
                <div>
                    <PhSpinnerGap v-if="weatherLoading" class="size-5 text-orange-500 animate-spin"></PhSpinnerGap>
                    <PhWarning v-else-if="currentWeather == null" class="size-5 text-orange-500"></PhWarning>

                    <component v-else :is="weatherIcon" class="size-5" /> <!-- weight="duotone" -->
                </div>

                <!-- Temperature -->
                <label class="cursor-pointer">{{ formatTemp(currentWeather?.main.temp) }}</label>
            </div>
        </template>

        <template v-slot:items>
            <div v-if="currentWeather" class="w-80 overflow-hidden rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark">
                <!-- Hero -->
                <div class="bg-linear-to-br from-wardrobe-blue to-blue-900 px-4 pb-4 pt-3 text-white text-center">
                    <!-- Location -->
                    <div class="flex items-center justify-center gap-1 text-lg font-semibold leading-tight">
                        <PhMapPin class="size-5 shrink-0" weight="fill" />
                        {{ currentWeather.name }}
                    </div>

                    <!-- Big icon & temperature -->
                    <div class="mt-3 flex items-center justify-center gap-2">
                        <component :is="weatherIcon" class="size-12 shrink-0" weight="duotone" />
                        <div class="text-5xl font-light leading-none">{{ formatTemp(currentWeather.main.temp) }}</div>
                    </div>

                    <!-- Condition -->
                    <div class="mt-2">
                        <div class="text-lg font-semibold leading-tight">{{ currentWeather.weather[0]?.main }}</div>
                        <div class="text-xs leading-tight text-white/80 capitalize">{{ currentWeather.weather[0]?.description }}</div>
                    </div>

                    <!-- Min / Max / Feels like -->
                    <div class="mt-3 flex items-center justify-center gap-x-4 text-sm">
                        <span class="flex items-center gap-1">
                            <PhArrowDown class="size-3.5" weight="bold" />
                            {{ formatTemp(currentWeather.main.temp_min) }}
                        </span>
                        <span class="flex items-center gap-1">
                            <PhArrowUp class="size-3.5" weight="bold" />
                            {{ formatTemp(currentWeather.main.temp_max) }}
                        </span>
                        <span class="flex items-center gap-1 text-white/80">
                            <PhThermometer class="size-3.5" weight="bold" />
                            {{ $t("weatherTempFeelsLike") }} {{ formatTemp(currentWeather.main.feels_like) }}
                        </span>
                    </div>
                </div>

                <!-- Details strip -->
                <div class="grid grid-cols-3 divide-x divide-bg-embed-light dark:divide-bg-embed-dark bg-bg-input-light dark:bg-bg-input-dark px-2 py-2 text-center">
                    <div class="flex flex-col items-center gap-0.5 px-1">
                        <PhDrop class="size-4 text-wardrobe-blue" weight="fill" />
                        <span class="text-sm font-medium text-text-light dark:text-text-dark">{{ currentWeather.main.humidity }}%</span>
                        <span class="text-[0.6rem] leading-tight text-text-secondary-light dark:text-text-secondary-dark">{{ $t("weatherHumidity") }}</span>
                    </div>
                    <div class="flex flex-col items-center gap-0.5 px-1">
                        <PhWind class="size-4 text-wardrobe-blue" weight="fill" />
                        <span class="text-sm font-medium text-text-light dark:text-text-dark">{{ round(currentWeather.wind.speed, 2) }} m/s</span>
                        <span class="text-[0.6rem] leading-tight text-text-secondary-light dark:text-text-secondary-dark">{{ $t("weatherWind") }}</span>
                    </div>
                    <div class="flex flex-col items-center gap-0.5 px-1">
                        <PhCloud class="size-4 text-wardrobe-blue" weight="fill" />
                        <span class="text-sm font-medium text-text-light dark:text-text-dark">{{ currentWeather.clouds.all }}%</span>
                        <span class="text-[0.6rem] leading-tight text-text-secondary-light dark:text-text-secondary-dark">{{ $t("weatherClouds") }}</span>
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 px-3 py-1.5 text-[0.65rem] text-text-secondary-light dark:text-text-secondary-dark">
                    <span>{{ $t("lastRefresh") }} {{ $t("timeAgo", { time: formatTimestamp(currentWeather.dt * 1000) }) }}</span>
                    <span>{{ $t("poweredBy") }} openweathermap.org</span>
                </div>
            </div>
            <div v-else class="w-80 break-normal">
                {{ $t('weatherLoadAPIError') }} {{ weatherAPIErrorMessage }}
            </div>
        </template>
    </PickerDialog>

</template>


<script setup lang="ts">
    import { PhSun, PhSpinnerGap, PhCloudLightning, PhCloudRain, PhSnowflake, PhCloudFog, PhCloud, PhWarning, PhMapPin, PhDrop, PhWind, PhArrowUp, PhArrowDown, PhThermometer } from "@phosphor-icons/vue";

    const i18n = useI18n();


    const currentWeather: Ref<WeatherData|null> = ref(null);
    const weatherLoading: Ref<boolean>          = ref(false);
    let   weatherAPIErrorMessage                = null;


    // Returns icon component matching the current weather condition
    const weatherIcon = computed(() => {
        if (!currentWeather.value) return null;

        switch (weatherIdToCondition(currentWeather.value.weather[0]!.id)) {
            case WeatherConditionGroupID.Thunderstorm: return PhCloudLightning;
            case WeatherConditionGroupID.Drizzle:
            case WeatherConditionGroupID.Rain:          return PhCloudRain;
            case WeatherConditionGroupID.Snow:          return PhSnowflake;
            case WeatherConditionGroupID.Fog:           return PhCloudFog;
            case WeatherConditionGroupID.Clear:         return PhSun;
            case WeatherConditionGroupID.Clouds:        return PhCloud;
        }
    });


    // Load weather
    onMounted(() => {
        getWeather();
    });

    // Re-fetch weather from server when settings have been changed to react to changed position/api key
    useNuxtApp().hook("app:user:settingsSaved", () => {
        logger.debug(`Received settingsSaved event, refetching weather'`);
        getWeather();
    });


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
    defineProps({
        backRedirectTo: { // Leave empty to disable back button
            type: String,
            required: false
        }
    });

</script>
