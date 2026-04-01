/*
 * File: useSettingsDb.ts
 * Project: wardrobe
 * Created Date: 2026-02-14 19:44:02
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:32:53
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import nedb from "@seald-io/nedb";
import { SubscriptionEventAction } from "~/model/api";
import { defaultServerSettings, ServerSettings, StorageKind } from "~/model/storage";


// Load database
const serverSettingsDb = new nedb({ filename: "data/database/serverSettings.db", autoload: true });


/**
 * Retrieves server settings from database
 * @returns Returns currently saved server settings
 */
export async function getServerSettings(): Promise<ServerSettings> {
    return (await serverSettingsDb.findOneAsync({})) || defaultServerSettings;
}


/**
 * Updates server settings in database
 * @throws Throws Exception on failure
 * @param settings Settings to set
 */
export async function setServerSettings(settings: ServerSettings): Promise<ServerSettings | null> {
    const res      = await serverSettingsDb.updateAsync({}, { $set: settings }, { upsert: true, returnUpdatedDocs: true });
    const affected = res.affectedDocuments ? res.affectedDocuments as unknown as ServerSettings : null;

    if (affected) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.UPSERT,
            storage: StorageKind.SERVER_SETTINGS,
            newData: affected
        });
    }

    return affected;
}
