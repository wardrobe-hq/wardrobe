/*
 * File: api.ts
 * Project: wardrobe
 * Created Date: 2026-03-26 18:57:42
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 19:04:44
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { StorageKind, StorageKindDataMap } from "./storage";


// Data Format returned by API Routes
export interface ApiResponse<T> {
    success: boolean,
    message: string | null,
    document: T | null      // This allowing null for all T's requires ! nearly everywhere where success was already checked
}


// Event types broadcasted by the 'subscribe' API Route
export enum SubscriptionEventType {
    STORAGE
}

// Event actions
export enum SubscriptionEventAction {
    NEW,    // Is this even used?
    UPSERT,
    DELETE
}

// Generic SubscriptionEvent type broadcasted by 'subscribe' API Route to client
export interface SubscriptionEvent {
    type: SubscriptionEventType,
    action: SubscriptionEventAction | null
}

// Specific SubscriptionEvent type for storage updates
export interface StorageSubscriptionEvent extends SubscriptionEvent {
    type: SubscriptionEventType.STORAGE,
    action: SubscriptionEventAction.NEW | SubscriptionEventAction.UPSERT | SubscriptionEventAction.DELETE,
    storage: StorageKind, // Omit<StorageKind, StorageKind.LOCAL_STORAGE>,
    newData: StorageKindDataMap<StorageKind> | { id: string } // This might contain ONLY the prop id on action DELETE btw. // TODO: Also this constraint doesn't seem to work correctly, perhaps the entire interface must be generic?
}
