<!--
/*
 * File: weatherPopout.vue
 * Project: wardrobe
 * Created Date: 2026-05-18 18:22:12
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-19 19:06:41
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

</template>


<script setup lang="ts">
    import { PhMoon, PhSun, PhMagnifyingGlass, PhSpinnerGap, PhCloudLightning, PhCloudRain, PhSnowflake, PhCloudFog, PhCloud, PhWarning } from "@phosphor-icons/vue";
    import { WeatherConditionGroupID, weatherIdToCondition, type WeatherData } from "~/model/weather";
    import { confTempToStr } from "~/composables/unitConversion";
    import { type TemperatureKelvin } from "~/model/unit";
    import { getWeatherFromServer } from "~/utils/utils";

    const i18n = useI18n();


    const currentWeather: Ref<WeatherData|null> = ref(null);
    const weatherLoading: Ref<boolean>          = ref(false);
    let   weatherAPIErrorMessage                = null;


    // Load weather
    onMounted(() => {
        getWeather();
    });

    // Re-fetch weather from server when settings have been changed to react to changed position/api key
    useNuxtApp().hook("app:user:settingsSaved", () => {
        console.debug(`[DEBUG] Received settingsSaved event, refetching weather'`);
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
