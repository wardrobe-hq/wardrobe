<!--
/*
 * File: app.vue
 * Project: wardrobe
 * Created Date: 2025-09-08 15:54:21
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-26 17:27:27
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

    <header id="titlebar">
        <PhList :class="!showNavbar ? 'block' : 'opacity-0'" class="fixed z-50 cursor-pointer left-3 top-4.5 dark:text-text-dark lg:hidden block transition-opacity" size="25px" @click="showNavbar = !showNavbar"></PhList>
        <PhCaretLeft :class="showNavbar ? 'block' : 'opacity-0'" class="fixed z-50 cursor-pointer left-3 top-4.5 dark:text-text-dark lg:hidden block transition-opacity" size="25px" @click="showNavbar = !showNavbar"></PhCaretLeft>

        <GlobalTitleBar></GlobalTitleBar>
    </header>


    <!-- Left navigation bar which offsets everything else to the right on desktop and overlays everything on mobile -->
    <nav
        id="navbar"
        :class="showNavbar ? '' : 'invisible lg:visible w-0 min-w-0 opacity-0'"
        class="fixed top-15 z-20 w-52 min-w-52 min-h-screen backdrop-blur-md lg:opacity-100 dark:text-text-dark border-x border-x-border-primary-light dark:border-x-border-primary-dark border-l-0 select-none duration-500 transition-[width,opacity,visibility]"
    >

        <div class="absolute left-1/2 transform -translate-x-1/2 top-2 w-34">
            <div class="my-3"></div> <!-- Add some space above everything-->

            <NuxtLink to="/" class="group flex px-2 py-1 mb-1 rounded-md hover:bg-bg-input-hover-light hover:dark:bg-bg-input-hover-dark hover:transition-all">
                <span class="fixed self-center mb-1 text-xl font-bold text-green-600" v-show="route.name === 'index' || route.name === 'clothing'">|</span>

                <TextOverflowAutoScroll class="ml-4">
                    <PhHouse class="mr-2" /> {{ $t("browse") }}
                </TextOverflowAutoScroll>
            </NuxtLink>

            <div class="my-2 h-0.5 bg-border-secondary-light dark:bg-border-secondary-dark opacity-50"></div> <!-- Divider to give Browse more presence -->

            <NuxtLink to="/outfits" class="group flex px-2 py-1 mb-1 rounded-md hover:bg-bg-input-hover-light hover:dark:bg-bg-input-hover-dark hover:transition-all">
                <span class="fixed self-center mb-1 text-xl font-bold text-green-600" v-show="route.name === 'outfits'">|</span>

                <TextOverflowAutoScroll class="ml-4">
                    <PhCoatHanger class="mr-2" /> {{ $t("outfits") }}
                </TextOverflowAutoScroll>
            </NuxtLink>
            <NuxtLink to="/labels" class="group flex px-2 py-1 mb-1 rounded-md hover:bg-bg-input-hover-light hover:dark:bg-bg-input-hover-dark hover:transition-all">
                <span class="fixed self-center mb-1 text-xl font-bold text-green-600" v-show="route.name === 'labels'">|</span>

                <TextOverflowAutoScroll class="ml-4">
                    <PhTag class="mr-2" /> {{ $t("labels") }}
                </TextOverflowAutoScroll>
            </NuxtLink>
            <NuxtLink to="/settings" class="group flex px-2 py-1 mb-1 rounded-md hover:bg-bg-input-hover-light hover:dark:bg-bg-input-hover-dark hover:transition-all">
                <span class="fixed self-center mb-1 text-xl font-bold text-green-600" v-show="route.name === 'settings'">|</span>

                <TextOverflowAutoScroll class="ml-4">
                    <PhGear class="mr-2" /> {{ $t("settings") }}
                </TextOverflowAutoScroll>
            </NuxtLink>
        </div>

    </nav>

    <!-- Footer for project details. Separated from nav container because backdrop caused positioning issues -->
    <footer
        :class="showNavbar ? '' : 'invisible lg:visible opacity-0'"
        class="fixed z-20 text-nowrap bottom-0 left-0 pb-2 px-2.5 group lg:opacity-100 dark:text-text-dark select-none duration-500 transition-all"
    >
        <div class="flex flex-col text-sm opacity-50">
            <div :class="onlineVersion && onlineVersion != packagejson.version ? '' : 'hidden'" class="mb-4 px-1 py-0.5 bg-bg-embed-light dark:bg-bg-embed-dark outline-2 outline-border-secondary-light dark:outline-border-secondary-dark rounded-lg">
                <p class="font-semibold">{{ $t("navbarUpdateAvailable") }}</p>
                <p>{{ $t("navbarNewVersion") }} <span class="text-green-500 font-extrabold">{{ onlineVersion }}</span></p>
                {{ $t("navbarPatchNotesText") }} <a class="underline hover:text-gray-500" :href="'https://github.com/wardrobe-hq/wardrobe/releases/tag/' + onlineVersion" target="_blank">{{ $t("navbarPatchNotesTextLink") }}</a>
            </div>

            wardrobe v{{ packagejson.version }}

            <a class="flex w-fit items-center mt-0.5 -ml-1 rounded-xl px-2 text-gray-100 bg-gray-600 hover:bg-gray-400 hover:transition-all" href="http://github.com/wardrobe-hq/wardrobe" target="_blank">

                <!-- GitHub logo -->
                <svg class="mr-1" width="1em" height="1em" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clip-rule="evenodd"/>
                </svg>

                <span class="text-white rounded-lg text-xm" href="https://github.com/wardrobe-hq/wardrobe" target="_blank">{{ $t("navbarSourceCodeLink") }}</span>

            </a>

            <!-- Becomes visible on group hover -->
            <div class="h-0 opacity-0 group-hover:h-10 group-hover:opacity-100 duration-500 transition-all">
                <p>{{ $t("navbarLicensedUnder") }} <a class="underline hover:text-gray-500" href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank">AGPLv3</a></p>
                <p>Copyright (c) 2026 <a class="underline hover:text-gray-500" href="https://github.com/3urobeat" target="_blank">3urobeat</a></p>
            </div>
        </div>
    </footer>

    <!-- The main content itself, pushed to the side by the navbar - The extra lg: tags in :class fix a bg color bug when the window is resized while the navbar was open -->
    <main
        :class="showNavbar ? 'opacity-30 dark:opacity-70 lg:opacity-100 lg:dark:opacity-100' : ''"
        class="fixed top-15 dark:text-text-dark transition-all duration-500"
        @click="showNavbar = false"
    >
        <!-- Dummy to prevent NuxtPage button presses when the navbar is open -->
        <div :class="showNavbar ? 'fixed min-h-screen min-w-screen opacity-0 lg:w-0 lg:h-0' : ''" class="z-50"></div>

        <!-- JS disabled warning, gets hidden by global.js. Cannot use noscript tag as it causes a Vue hydration mismatch :( -->
        <div id="js-disabled-banner" class="fixed z-50 select-none min-h-screen min-w-screen bg-bg-field-light/90 dark:bg-bg-field-dark/90">
            <p class="translate-y-1/3 min-h-screen min-w-screen text-red-500 font-bold text-center">JavaScript is disabled :(<br />Please enable JavaScript to use Wardrobe.</p>
        </div>

        <!-- Page content wrapped into a border container, used to indicate success or failure for actions -->
        <div
            id="color-border"
            class="fixed left-0 lg:left-52 top-15 bottom-0 right-0 border-8 border-transparent rounded-2xl duration-500 overflow-auto"
        >
            <!-- Global notification component -->
            <Notification class="fixed top-25 right-10" />

            <div id="page-content" class="p-1 md:px-5">
                <NuxtPage></NuxtPage> <!-- Links to index.vue -->
            </div>
        </div>
    </main>

</template>


<script setup lang="ts">
    import { PhList, PhCaretLeft, PhHouse, PhGear, PhCoatHanger, PhTag } from "@phosphor-icons/vue";
    import packagejson from "../package.json";
    import type { PageProperties } from "./model/page";
    import TextOverflowAutoScroll from "./components/textOverflowAutoScroll.vue";
    import Notification from './components/notification.vue';
    import { closeServerSubscriptionConnection, establishServerSubscriptionConnection } from "./composables/subscription";
    import { NotificationLevel } from "./model/notification";
    import { SubscriptionEventType, type StorageSubscriptionEvent, type SubscriptionEvent } from "./model/api";

    const route       = useRoute();
    let   changesMade = false;


    // Refs
    const showNavbar    = ref(false);
    const onlineVersion = ref("");

    // Init global cache 'storage.ts'
    await initGlobalCache();

    useNuxtApp().hook("app:subscription:update", (data: SubscriptionEvent) => {
        if (data.type == SubscriptionEventType.STORAGE) {
            handleCacheSubscriptionEvent(data as StorageSubscriptionEvent);
        }
    });


    // Handle changesMade event from pages
    useNuxtApp().hook("app:user:changesMade", (val: boolean = true) => {
        console.debug(`[DEBUG] Received changesMade = '${val}' event!`)
        changesMade = val;
    });

    // Handle page switch
    addRouteMiddleware("page-switch", (to, from) => {
        if (changesMade) {
            if (!confirm("You have unsaved changes!\nWould you still like to continue?")) {
                return abortNavigation();
            }
        }
        changesMade = false;

        updateGlobalSearchBar(to.meta);
    }, { global: true });


    // Specify page information
    useSeoMeta({
        title: "Wardrobe",
        ogTitle: "Wardrobe",
        description: "Selfhosted clothing management web app",
        ogDescription: "Selfhosted clothing management web app"
    });

    useHead({
        link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
        script: [{ src: "/global.js" }] // Sets initial dark mode. Defined in header to fix transition load - https://stackoverflow.com/a/14416030
    });

    // Do initial page load stuff
    updateGlobalSearchBar(useRoute().meta);

    onMounted(() => { // Client side only
        console.debug("Wardrobe mounted!");
        checkForUpdate();

        if (getServerSettingsFromServer().value.serverSubscriptionEnabled) {
            establishServerSubscriptionConnection();
        }
    });

    onUnmounted(() => {
        closeServerSubscriptionConnection();
    });


    // Resets and toggles global search bar visibility
    function updateGlobalSearchBar(pageProps: PageProperties) {
        useState("globalSearchStr").value = null;

        if (pageProps && pageProps.showGlobalSearchBar) {
            useState("globalSearchBarShown").value = true;
        } else {
            useState("globalSearchBarShown").value = false;
        }
    }

    // Checks for an available update and displays a notification in the navbar
    async function checkForUpdate() {
        try {
            let output = await fetch("https://raw.githubusercontent.com/wardrobe-hq/wardrobe/main/package.json");
            let parsed = await output.json();

            console.log("Successfully checked for an Update; Local: %s | Online: %s ", packagejson.version, parsed.version);

            onlineVersion.value = parsed.version;

            if (onlineVersion.value != packagejson.version) {
                emitNotificationShowEvent({
                    level: NotificationLevel.INFO,
                    title: $t("navbarUpdateAvailable"),
                    message: `${$t("navbarNewVersion")} ${onlineVersion.value}`
                });
            }
        } catch (err) {

            console.error("checkForUpdate: Failed to check GitHub repository for an available update. " + err);
        }
    }

</script>
