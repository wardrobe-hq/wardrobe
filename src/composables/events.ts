/*
 * File: events.ts
 * Project: wardrobe
 * Created Date: 2026-02-11 21:31:19
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-26 16:41:56
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { HookResult } from "nuxt/schema";
import type { SubscriptionEvent } from "~/model/api";
import type { NotificationData } from "~/model/notification";


// Declare our custom hooks
declare module "#app" {
    interface RuntimeNuxtHooks {
        "app:user:changesMade": (dirty: boolean) => HookResult;
        "app:user:settingsSaved": () => HookResult;
        "app:notification:show": (data: NotificationData | undefined) => HookResult;
        "app:notification:action": (data: NotificationData) => HookResult;
        "app:subscription:update": (data: SubscriptionEvent) => HookResult;
    }
}


/**
 * Sets (or unsets) dirty flag to prompt user for unsaved changes before leaving route
 * @param val Optional: Unset dirty flag by passing false
 */
export function emitChangesMadeEvent(val: boolean = true) {
    useNuxtApp().callHook("app:user:changesMade", val);
}


/**
 * Notifies listeners that might want to recalculate/fetch values that settings have been saved
 */
export function emitSettingsSavedEvent() {
    useNuxtApp().callHook("app:user:settingsSaved");
}


/**
 * Notifies notification component to show
 * @param data Notification data to show. Pass 'undefined' to force-hide any currently shown notification
 */
export function emitNotificationShowEvent(data: NotificationData | undefined) {
    useNuxtApp().callHook("app:notification:show", data);
}


/**
 * Notifies listeners that action button in notification was pressed
 * @param data Data of notification whose action button was pressed
 */
export function emitNotificationActionEvent(data: NotificationData) {
    useNuxtApp().callHook("app:notification:action", data);
}


/**
 * Notifies listeners that a server subscription event was received
 * @param data Data of received subscription event
 */
export function emitSubscriptionEvent(data: SubscriptionEvent) {
    useNuxtApp().callHook("app:subscription:update", data);
}
