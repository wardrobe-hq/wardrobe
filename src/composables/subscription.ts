/*
 * File: subscription.ts
 * Project: wardrobe
 * Created Date: 2026-04-08 17:59:41
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-09 21:17:04
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { handleCacheSubscriptionEvent } from "../composables/storage";
import { SubscriptionEventAction, SubscriptionEventType, type StorageSubscriptionEvent, type SubscriptionEvent } from "../model/api";
import { NotificationLevel, NotificationType, type NotificationData } from "../model/notification";

let serverSubscriptionEventStream: EventSource | undefined;


/**
 * Handles server subscription connected event
 * @param event
 */
function handleServerSubscriptionConnected(event: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
    console.debug("[DEBUG] Server Subscription: Connected!");

    emitNotificationShowEvent({
        level: NotificationLevel.DEBUG,
        title: "Server Subscription",
        message: "Connected!",
        type: NotificationType.SERVER_SUBSCRIPTION
    });
}


/**
 * Handles incoming messages from server's 'subscribe' API route
 * @param msg
 */
function handleServerSubscriptionEvent(msg: MessageEvent<any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
        const data = JSON.parse(msg.data) as SubscriptionEvent;
        console.debug("[DEBUG] Incoming server subscription message:", data);

        emitNotificationShowEvent({
            level: NotificationLevel.DEBUG,
            title: "Server Subscription",
            message: `Message: ${data.action != null ? SubscriptionEventAction[data.action] : null} @ ${SubscriptionEventType[data.type]}`,
            type: NotificationType.SERVER_SUBSCRIPTION
        });

        switch (data.type) {
            case SubscriptionEventType.STORAGE:
                handleCacheSubscriptionEvent(data as StorageSubscriptionEvent);
                break;
            default:
                throw("handleServerSubscriptionEvent: Unsupported server subscripton event type " + data.type);
        }
    } catch(err) {
        console.error("Failed to parse incoming message from server!", err);
    }
}


/**
 * Handles server subscription event stream error event
 * @param err
 */
function handleServerSubscriptionError(err: unknown) {
    const i18n = useNuxtApp().$i18n;
    console.error("Server Subscription Event Stream Error!", err);

    emitNotificationShowEvent({
        level: NotificationLevel.ERROR,
        title: i18n.t("serverSubscriptionConnectionLost"),
        message: "",
        actionLabel: i18n.t("reloadPage"),
        customDuration: 0,                                // Do not expire
        type: NotificationType.SERVER_SUBSCRIPTION_RELOAD
    });

    useNuxtApp().hook("app:notification:action", (data: NotificationData) => {
        if (data.type == NotificationType.SERVER_SUBSCRIPTION_RELOAD) {
            console.debug("[DEBUG] Got 'SERVER_SUBSCRIPTION_RECONN' event, reloading page..."); // ...or soft-reload by invalidating cache?
            reloadNuxtApp();
        }
    });
}


/**
 * Attempts to establish server subscription connection if enabled in settings
 */
export function establishServerSubscriptionConnection() {
    if (serverSubscriptionEventStream) throw("EventStream is not null, close it first");

    if (getServerSettingsFromServer().value.serverSubscriptionEnabled) {
        console.debug("[DEBUG] establishServerSubscriptionConnection: Attempting to connect...");

        serverSubscriptionEventStream = new EventSource("/api/subscribe");
        serverSubscriptionEventStream.addEventListener("open",    handleServerSubscriptionConnected);
        serverSubscriptionEventStream.addEventListener("message", handleServerSubscriptionEvent);
        serverSubscriptionEventStream.addEventListener("error",   handleServerSubscriptionError);
    } else {
        console.debug("[DEBUG] establishServerSubscriptionConnection: Server Subscription is disabled");
    }
}


/**
 * Closes server subscription event stream if open
 */
export function closeServerSubscriptionConnection() {
    if (serverSubscriptionEventStream) {
        serverSubscriptionEventStream.close();
        serverSubscriptionEventStream = undefined;
    }
}
