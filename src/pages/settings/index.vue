<!--
/*
 * File: index.vue
 * Project: wardrobe
 * Created Date: 2025-09-08 15:51:02
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-26 19:42:21
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
    <TitleBarBasic>
        <button class="custom-button-primary" @click="saveChanges">
            <PhCheck class="mr-2 size-5 text-green-600"></PhCheck>
            {{ $t('save') }}
        </button>
    </TitleBarBasic>

    <div class="flex flex-col py-20 gap-8" @change="emitChangesMadeEvent()">

        <!-- User Settings section -->
        <div class="flex-col w-full h-60 p-2 rounded-2xl shadow-lg select-none bg-bg-input-light dark:bg-bg-input-dark transition-all">
            <div class="custom-label-primary w-fit h-fit py-0! px-2! m-2">
                {{ $t('settingsUserSettings') }}
            </div>

            <!-- Setting cards -->
            <div class="flex h-44 mx-2 overflow-x-auto">

                <!-- General -->
                <div class="shrink-0 px-2 m-2 rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark overflow-y-auto">
                    <div class="flex gap-x-2 mt-2 mb-3 ml-2 h-6">
                        <div class="custom-label-icon-only"> <!-- This extra div just for the icon to scale correctly is stupid -->
                            <PhGear class="text-text-light dark:text-text-dark"></PhGear>
                        </div>
                        <label class="custom-label-primary py-0! px-2!">{{ $t('general') }}</label>
                    </div>

                    <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 mx-1">
                        <!-- TODO
                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit" for="saveSelectedFilters">Save Selected Filters?</label>
                        <input id="saveSelectedFilters" type="checkbox" class="size-4 self-center" :checked="storedUxSettings.saveSelectedFilters"> -->

                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit" for="temperatureUnit">{{ $t('language') }}:</label>
                        <select id="language" class="custom-input-secondary h-6! px-2!" v-model="selectedLanguage"> <!-- TODO: Options are not centered? -->
                            <option value="en">🇬🇧 English</option>
                            <option value="de">🇩🇪 Deutsch</option> <!-- Hard-coded languages, meh -->
                            <DevOnly><option value="debug">Debug</option></DevOnly>
                        </select>
                    </div>
                </div>

            </div>
        </div>

        <!-- Server Settings section -->
        <div class="flex-col w-full h-60 p-2 rounded-2xl shadow-lg select-none bg-bg-input-light dark:bg-bg-input-dark transition-all">
            <div class="custom-label-primary w-fit h-fit py-0! px-2! m-2">
                {{ $t('settingsServerSettings') }}
            </div>

            <!-- Setting cards -->
            <div class="flex h-44 mx-2 overflow-x-auto">

                <!-- General -->
                <div class="shrink-0 px-2 m-2 rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark overflow-y-auto">
                    <div class="flex gap-x-2 mt-2 mb-3 ml-2 h-6">
                        <div class="custom-label-icon-only"> <!-- This extra div just for the icon to scale correctly is stupid -->
                            <PhGear class="text-text-light dark:text-text-dark"></PhGear>
                        </div>
                        <label class="custom-label-primary py-0! px-2!">{{ $t('general') }}</label>
                    </div>

                    <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 mx-1">
                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit" for="temperatureUnit">{{ $t('settingsTemperatureUnit') }}</label>
                        <select id="temperatureUnit" class="custom-input-secondary w-1/2 h-6! px-2!" v-model="localServerSettings.temperatureUnit"> <!-- TODO: Options are not centered? -->
                            <option :value="Unit.KELVIN">{{ UnitStrMap[Unit.KELVIN] }}</option>
                            <option :value="Unit.CELSIUS">{{ UnitStrMap[Unit.CELSIUS] }}</option>
                            <option :value="Unit.FAHRENHEIT">{{ UnitStrMap[Unit.FAHRENHEIT] }}</option>
                        </select>

                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit" for="serverSubscriptionEnabled">{{ $t('settingsServerSubscriptionEnabled') }}</label>
                        <input id="serverSubscriptionEnabled" type="checkbox" class="size-4 self-center" v-model="localServerSettings.serverSubscriptionEnabled">
                    </div>
                </div>

                <!-- Weather Settings -->
                <div class="shrink-0 px-2 m-2 rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark overflow-y-auto">
                    <div class="flex gap-x-2 mt-2 mb-3 ml-2 h-6">
                        <div class="custom-label-icon-only"> <!-- This extra div just for the icon to scale correctly is stupid -->
                            <PhCloud class="text-text-light dark:text-text-dark"></PhCloud>
                        </div>
                        <label class="custom-label-primary py-0! px-2!">{{ $t('weather') }}</label>
                    </div>

                    <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 mx-1">
                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit" for="useGeolocation">{{ $t('settingsLocationAutomatic') }}</label>
                        <input id="useGeolocation" type="checkbox" class="size-4 self-center" v-model="localServerSettings.location.useGeolocation">

                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit" for="locationLat">{{ $t('settingsLocationForceLat') }}</label>
                        <input id="locationLat" type="number" class="custom-input-secondary w-1/2 h-6! px-2!" placeholder="52.520" v-model.trim="localServerSettings.location.lat" :disabled="localServerSettings.location.useGeolocation">

                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit" for="locationLon">{{ $t('settingsLocationForceLon') }}</label>
                        <input id="locationLon" type="number" class="custom-input-secondary w-1/2 h-6! px-2!" placeholder="13.405" v-model.trim="localServerSettings.location.lon" :disabled="localServerSettings.location.useGeolocation">

                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit" for="weatherApiKey">{{ $t('settingsWeatherApiKey') }}</label>
                        <input id="weatherApiKey" type="password" class="custom-input-secondary w-full h-6! px-2!" placeholder="W8orAGjB6NCnefMVX7bdpesKXJokemVV" v-model.trim="localServerSettings.weatherApiKey" autocomplete="off" data-1p-ignore data-lpignore="true" data-protonpass-ignore="true" data-bwignore="true"> <!-- Disable auto-completion for various password managers -->
                    </div>
                </div>

            </div>
        </div>

        <!-- Server Jobs section -->
        <div class="flex-col w-full h-60 p-2 rounded-2xl shadow-lg select-none bg-bg-input-light dark:bg-bg-input-dark transition-all">
            <div class="custom-label-primary w-fit h-fit py-0! px-2! m-2">
                {{ $t('settingsServerJobs') }}
            </div>

            <!-- Job cards -->
            <div class="flex h-44 mx-2 overflow-x-auto">
                <div
                    class="shrink-0 px-2 m-2 rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark overflow-y-auto"
                    v-for="thisJobInfo in jobs"
                    :key="thisJobInfo.name"
                >
                    <!-- Check if server is waiting to register core jobs -->
                    <div class="flex-col m-2" v-if="thisJobInfo.name == CoreJobPendingDummy">
                        <div class="custom-label-icon-only w-6 mb-3"> <!-- This extra div just for the icon to scale correctly is stupid -->
                            <PhHourglassMedium class="text-text-light dark:text-text-dark"></PhHourglassMedium>
                        </div>
                        <p class="custom-label-secondary py-0! px-2! break-normal whitespace-pre-line"> <!-- whitespace-pre-line preserves \n in text -->
                            {{ $t('settingsServerJobsRegistrationPendingText') }}
                        </p>
                    </div>
                    <div v-else>
                        <!-- Job name -->
                        <div class="flex gap-x-2 mt-2 mb-3 ml-2 h-6">
                            <div class="custom-label-icon-only"> <!-- This extra div just for the icon to scale correctly is stupid -->
                                <PhArrowClockwise class="text-text-light dark:text-text-dark"></PhArrowClockwise>
                            </div>
                            <label class="custom-label-primary py-0! px-2!">{{ thisJobInfo.name }}</label>
                        </div>

                        <!-- Job info -->
                        <ClientOnly>
                            <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 ml-1" v-for="[key, value] of Object.entries(thisJobInfo)">
                                <label v-if="key != 'name'" class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ key }}:</label>

                                <label v-if=     "key == 'interval'">{{ formatTimeLocalized(value as number) }}</label>
                                <input v-else-if="key == 'runOnRegistration'" type="checkbox" class="size-4 self-center" :checked="value as boolean" disabled>
                                <label v-else-if="key == '_lastExecTimestamp' || key == '_registeredAt'">{{ $t("timeAgo", { time: formatTimestamp(value as number) }) }}</label>
                            </div>
                        </ClientOnly>
                    </div>
                </div>
            </div>
        </div>

        <!-- Server Info section -->
        <div class="flex-col w-full h-60 p-2 rounded-2xl shadow-lg select-none bg-bg-input-light dark:bg-bg-input-dark transition-all">
            <div class="custom-label-primary w-fit h-fit py-0! px-2! m-2">
                {{ $t('settingsServerInfo') }}
            </div>

            <!-- Setting cards -->
            <div class="flex h-44 mx-2 overflow-x-auto">

                <!-- General -->
                <div class="shrink-0 px-2 m-2 rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark overflow-y-auto">
                    <div class="flex gap-x-2 mt-2 mb-3 ml-2 h-6">
                        <div class="custom-label-icon-only"> <!-- This extra div just for the icon to scale correctly is stupid -->
                            <PhGear class="text-text-light dark:text-text-dark" />
                        </div>
                        <label class="custom-label-primary py-0! px-2!">{{ $t('general') }}</label>
                    </div>

                    <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 mx-1">

                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">Wardrobe:</label>
                        <label>v{{ packageJson.version }}</label>

                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">Docker?</label>
                        <input type="checkbox" class="size-4 self-center" :checked="serverStatistics?.runtime.isDocker" disabled>

                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">Node:</label>
                        <label>{{ serverStatistics?.runtime.nodeVersion }}</label>

                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">Nuxt:</label>
                        <label>v{{ packageJson.dependencies.nuxt.replace("\^", "") }}</label>

                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">Vue:</label>
                        <label>v{{ packageJson.dependencies.vue.replace("\^", "") }}</label>

                        <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">Tailwind:</label>
                        <label>v{{ packageJson.dependencies["@tailwindcss/vite"].replace("\^", "") }}</label>

                    </div>
                </div>

                <!-- System -->
                <div class="shrink-0 px-2 m-2 rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark overflow-y-auto">
                    <div class="flex gap-x-2 mt-2 mb-3 ml-2 h-6">
                        <div class="custom-label-icon-only"> <!-- This extra div just for the icon to scale correctly is stupid -->
                            <PhCpu class="text-text-light dark:text-text-dark" />
                        </div>
                        <label class="custom-label-primary py-0! px-2!">{{ $t('system') }}</label>
                    </div>

                    <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 mx-1">

                        <!-- <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('cpuModel') }}:</label>
                        <label>{{ serverStatistics?.system.cpuModel }}</label> -->
                        <!-- TODO: Currently breaks styling due to long text, wait for https://github.com/users/wardrobe-hq/projects/1/views/1?pane=issue&itemId=165862198 -->

                        <ClientOnly>
                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('cpu') }}:</label>
                            <label>{{ round(serverStatistics?.system.cpuUsage || 0, 2) }} %, {{ round(serverStatistics?.system.cpuSpeed || 0, 2) }} GHz</label>

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('temperature') }}:</label>
                            <label>{{ formatTemp(serverStatistics?.system.cpuTemp) }}</label>

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('memUsage') }}:</label>
                            <label>{{ round((serverStatistics?.system.memUsage || 0) / 1000000000, 2) }} GB / {{ round((serverStatistics?.system.memTotal || 0) / 1000000000, 2) }} GB</label>

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('storage') }}:</label>
                            <label>{{ round((serverStatistics?.system.storageUsage || 0) / 1000000000, 2) }} GB / {{ round((serverStatistics?.system.storageTotal || 0) / 1000000000, 2) }} GB</label>

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('uptime') }}:</label>
                            <label>{{ $t("timeSince", { time: formatTimestamp(serverStatistics?.system.uptime || 0) }) }}</label>

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('systemTime') }}:</label>
                            <label>{{ formatTimestamp(serverStatistics?.system.serverTime || 0, "always") }}</label>

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('name') }}:</label>
                            <label>{{ serverStatistics?.system.hostname }}</label>

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('system') }}:</label>
                            <label>{{ serverStatistics?.system.osPlatform }}</label>
                        </ClientOnly>

                    </div>
                </div>

                <!-- Wardrobe -->
                <div class="shrink-0 px-2 m-2 rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark overflow-y-auto">
                    <div class="flex gap-x-2 mt-2 mb-3 ml-2 h-6">
                        <div class="custom-label-icon-only"> <!-- This extra div just for the icon to scale correctly is stupid -->
                            <PhCoatHanger class="text-text-light dark:text-text-dark" />
                        </div>
                        <label class="custom-label-primary py-0! px-2!">Wardrobe</label>
                    </div>

                    <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 mx-1">

                        <ClientOnly>
                            <!-- TODO: Database amount statistics from global cache -->
                            <!-- <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('clothes') }}:</label>
                            <label></label>

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('outfits') }}:</label>
                            <label></label>

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('labels') }}:</label>
                            <label></label>

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('images') }}:</label>
                            <label></label> -->

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('storageUsage') }}:</label>
                            <label>{{ round((serverStatistics?.app.appStorageUsage || 0) / 1000000, 2) }} MB</label>

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('memUsage') }}:</label>
                            <label>{{ round((serverStatistics?.app.appMemUsage || 0) / 1000000, 2) }} MB / {{ round((serverStatistics?.app.appMemTotal || 0) / 1000000000, 2) }} GB</label>

                            <label class="custom-label-secondary text-nowrap py-0! px-2! w-fit">{{ $t('uptime') }}:</label>
                            <label>{{ $t("timeSince", { time: formatTimestamp(serverStatistics?.app.appUptime || 0) }) }}</label>
                        </ClientOnly>

                    </div>
                </div>

                <!-- Debug -->
                <DevOnly>
                    <div class="shrink-0 px-2 m-2 rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark overflow-y-auto">
                        <div class="flex gap-x-2 mt-2 mb-3 ml-2 h-6">
                            <div class="custom-label-icon-only"> <!-- This extra div just for the icon to scale correctly is stupid -->
                                <PhWrench class="text-text-light dark:text-text-dark" />
                            </div>
                            <label class="custom-label-primary py-0! px-2!">Debug</label>
                        </div>

                        <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 mx-1">

                            <ClientOnly>
                                <button class="custom-button-primary" @click="useNuxtApp().callHook('app:notification:show', { level: NotificationLevel.INFO, title: 'Test!', message: 'Hello!', actionLabel: 'No, thanks' })">Show Notification</button>
                            </ClientOnly>

                        </div>
                    </div>
                </DevOnly>

            </div>
        </div>

    </div>
</template>


<script setup lang="ts">
    import { PhArrowClockwise, PhCheck, PhCloud, PhCoatHanger, PhCpu, PhGear, PhHourglassMedium, PhWrench } from "@phosphor-icons/vue";
    import TitleBarBasic from "~/components/titleBarBasic.vue";
    import { defaultUXSettings, type ServerSettings, type UXSettings } from "~/model/storage";
    import { responseIndicatorFailure, responseIndicatorSuccess } from "~/composables/responseIndicator";
    import { CoreJobPendingDummy, type JobInfo } from "~/model/job";
    import { Unit, UnitStrMap, type TemperatureKelvin } from "~/model/unit";
    import { formatTimeLocalized } from "~/composables/unitConversion";
    import type { ServerStatistics } from "~/model/statistics";
    import packageJson from "~/../package.json";
    import { getServerSettingsFromServer, setServerSettingsToServer } from "~/composables/storage";
    import { SubscriptionEventType, type ApiResponse, type StorageSubscriptionEvent, type SubscriptionEvent } from "~/model/api";
    import { NotificationLevel } from "~/model/notification";

    const i18n = useI18n();

    // Refs
    const storedServerSettings: Ref<ServerSettings> = getServerSettingsFromServer();
    let   localServerSettings:  Ref<ServerSettings> = useCloned(storedServerSettings, { manual: true }).cloned; // I'm not using useCloned's sync() as it just wouldn't work :shrug:
    const jobs:                 Ref<JobInfo[]>      = ref([]);

    let   storedUxSettings:     UXSettings          = defaultUXSettings;
    let   selectedLanguage:     string              = i18n.locale.value; // Separated from UXSettings because nuxt i18n module handles it

    let   serverStatistics:     Ref<ServerStatistics | undefined> = ref();


    // Load data and attach event listener to refresh on subscription event
    const jobRes = await useFetch("/api/get-registered-jobs-info");
    jobs.value = jobRes.data.value?.document!;

    useNuxtApp().hook("app:subscription:update", async (data: SubscriptionEvent) => {
        if (data.type == SubscriptionEventType.JOB) {
            await jobRes.execute();
            jobs.value = jobRes.data.value?.document!
        }
    });


    // Client side only
    onBeforeMount(() => {
        storedUxSettings = getUXSettings();
    });

    onMounted(async () => {
        const res = await fetch("/api/get-server-stats", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const resBody: ApiResponse<ServerStatistics> = await res.json();

        serverStatistics.value = resBody.document!; // TODO: Error handling
    });


    // Formats temp in kelvin to human readable string. Middleman function to display "? unit" on undefined
    function formatTemp(temp: TemperatureKelvin | undefined): string {
        if (!temp) {
            return `? ${getConfTempUnitStr()}`; // Data not loaded (yet)
        }

        return confTempToStr(temp, true);
    }


    // Saves user & server settings
    async function saveChanges() {

        // Save user settings to localStorage
        setUXSetting("saveSelectedFilters", storedUxSettings.saveSelectedFilters);

        i18n.setLocale(selectedLanguage as never); // I won't be able to fulfill this parameter constraint when using a variable...

        // Send server settings to backend to be saved in database
        const resBody = await setServerSettingsToServer(localServerSettings.value);

        // Indicate success/failure
        if (resBody.success) {
            responseIndicatorSuccess();
            emitChangesMadeEvent(false);

            // Manually sync local clones to global cache, useCloned's sync() didn't work. Refresh clone of localServerSettings to avoid it gaining reactivity
            localServerSettings = useCloned(storedServerSettings, { manual: true }).cloned;

            emitSettingsSavedEvent(); // Notify listeners to e.g. refresh weather in globalTitleBar
        } else {
            responseIndicatorFailure();
        }

    }

</script>
