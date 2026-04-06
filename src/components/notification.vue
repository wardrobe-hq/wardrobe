<!--
/*
 * File: notification.vue
 * Project: wardrobe
 * Created Date: 2026-04-02 22:24:30
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-06 21:53:49
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
    <transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <div
            v-if="visible"
            class="z-99 w-full max-w-sm overflow-hidden rounded-md shadow-md pointer-events-auto bg-bg-field-light dark:bg-bg-field-dark ring-1 ring-black/5 dark:ring-white/10"
            :class="themeClasses.border + ' ' + props.class"
        >
            <div class="p-4">

                <!-- Title Bar -->
                <div class="flex items-start gap-x-2 mb-2">

                    <!-- Icon -->
                    <div class="" :class="themeClasses.text">
                        <PhCheck   v-if="notificationData.level      === NotificationLevel.SUCCESS" class="size-6" />
                        <PhX       v-else-if="notificationData.level === NotificationLevel.ERROR"   class="size-6" />
                        <PhWarning v-else-if="notificationData.level === NotificationLevel.WARNING" class="size-6" />
                        <PhInfo    v-else-if="notificationData.level === NotificationLevel.INFO"    class="size-6" />
                        <PhWrench  v-else-if="notificationData.level === NotificationLevel.DEBUG"   class="size-6" />
                    </div>

                    <!-- Title -->
                    <p class="font-semibold">
                        {{ notificationData.title }}
                    </p>

                    <!-- Close button -->
                    <div class="flex w-full justify-end">
                        <button
                            class="custom-button-icon-only outline-0!"
                            :title="$t('close')"
                            @click="close()"
                        >
                            <PhX class="size-5 transition-opacity" />
                        </button>
                    </div>

                </div>

                <!-- Content -->
                <div class="ml-3 flex-1 pt-0.5 w-full">
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {{ notificationData.message }}
                    </p>

                    <div v-if="notificationData.actionLabel" class="mt-3">
                        <button @click="handleAction" class="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-sm" :class="themeClasses.text">
                            {{ notificationData.actionLabel }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>


<script setup lang="ts">
    import { PhCheck, PhInfo, PhWarning, PhWrench, PhX } from '@phosphor-icons/vue';
    import { defaultNotificationData, NotificationLevel, type NotificationData } from '~/model/notification';


    // Refs
    const notificationData: Ref<NotificationData> = ref(defaultNotificationData);
    const visible:          Ref<boolean>          = ref(false);


    // Define Props to be accepted by this component
    const props = defineProps({
        class: {
            type: String
        },
        duration: {
            type: Number,
            default: 5000 // Set to 0 to disable auto-close
        }
    });

    // Define stuff that can be accessed by the page
    // defineExpose();

    // Define Events emitted by this component
    // const emit = defineEmits();


    // Hook to and handle notification show event
    useNuxtApp().hook("app:notification:show", (data: NotificationData | undefined) => {
        if (!data) {
            console.debug(`[DEBUG] Hiding any present notification...`);

            close();
            return;
        }

        if (!data.title || data.level == undefined) {
            throw new Error("Notification properties title & type are not optional");
        }

        notificationData.value = data;
        visible.value = true;

        let duration = (data.customDuration == undefined ? props.duration : data.customDuration);
        console.debug(`[DEBUG] Showing notification ${duration > 0 ? 'for ' + duration + 'ms' : 'indefinitely'}:`, data);

        if (duration > 0) {
            setTimeout(() => {
                close();
            }, props.duration);
        }
    });


    // Dismiss notification
    function close() {
        console.debug(`[DEBUG] Dismissing notification...`);

        visible.value          = false;
        notificationData.value = defaultNotificationData;
    }


    // Handle action button press
    function handleAction() {
        close();
        useNuxtApp().callHook("app:notification:action", notificationData.value);
    }


    // Handle notification type
    const themeClasses = computed(() => {
        const themes = {
            [NotificationLevel.SUCCESS]: {
                border: "border-l-4 border-green-500",
                text: "text-green-500 dark:text-green-400"
            },
            [NotificationLevel.ERROR]: {
                border: "border-l-4 border-red-500",
                text: "text-red-500 dark:text-red-400"
            },
            [NotificationLevel.WARNING]: {
                border: "border-l-4 border-yellow-500",
                text: "text-yellow-500 dark:text-yellow-400"
            },
            [NotificationLevel.INFO]: {
                border: "border-l-4 border-blue-500",
                text: "text-blue-500 dark:text-blue-400"
            },
            [NotificationLevel.DEBUG]: {
                border: "border-l-4 border-cyan-500",
                text: "text-cyan-500 dark:text-cyan-400"
            }
        };

        return themes[notificationData.value.level];
    });

</script>
