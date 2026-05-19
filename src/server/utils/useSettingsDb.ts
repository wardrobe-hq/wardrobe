/*
 * File: useSettingsDb.ts
 * Project: wardrobe
 * Created Date: 2026-02-14 19:44:02
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-19 18:56:56
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
import { DatabaseMetaItem, defaultDatabaseMetaItem, defaultServerSettings, type ServerSettings, StorageKind, updateDatabaseItemMetadata } from "~/model/storage";


// Load database
const serverSettingsDb = new nedb({ filename: "data/database/serverSettings.db", autoload: true });

// Internal: Access Database instance directly
// export const _useServerSettingsDb = () => serverSettingsDb;

/**
 * Internal: Migrates DB if necessary and updates DatabaseMetaItem
 * @param toVersion Wardrobe Version to migrate to
 */
export async function _migrateServerSettingsDb(toVersion: string) {

    // Get current record
    const curItem = await serverSettingsDb.findOneAsync({ id: defaultDatabaseMetaItem.id }) as unknown as DatabaseMetaItem | null;
    console.debug(`[DEBUG] Clothing Database Meta - Created in '${curItem?.dbCreatedVersion}', last loaded in '${curItem?.dbVersion}'. Updating version to '${toVersion}'...`);

    // Apply any necessary dbCreatedVersion -> toVersion migration
    if (!curItem?.dbVersion && toVersion === "0.3.0") { // 0.2.0 -> 0.3.0: ServerSettings record did not have an ID, conflicts with new DatabaseMetaItem
        console.info("Migrating serverSettings.db to from v0.2.0 to v0.3.0...");
        await serverSettingsDb.updateAsync({ id: { $exists: false } }, { $set: { id: defaultServerSettings.id, addedTimestamp: Date.now(), modifiedTimestamp: Date.now(), _lockVersion: 1 } });
    }

    // Update (or create) record
    const newItem: DatabaseMetaItem = curItem || defaultDatabaseMetaItem;
    if (!newItem.dbCreatedVersion) {
        newItem.dbCreatedVersion = toVersion;
    }
    newItem.dbVersion = toVersion;
    updateDatabaseItemMetadata(newItem);

    await serverSettingsDb.updateAsync({ id: defaultDatabaseMetaItem.id }, { $set: newItem }, { upsert: true });

}


/**
 * Retrieves server settings from database
 * @returns Returns currently saved server settings
 */
export async function getServerSettings(): Promise<ServerSettings> {
    return (await serverSettingsDb.findOneAsync({ id: defaultServerSettings.id })) || defaultServerSettings;
}


/**
 * Updates server settings in database
 * @throws Throws Exception on failure
 * @param settings Settings to set
 * @param originClientId Optional: ID of client making request
 */
export async function setServerSettings(settings: ServerSettings, originClientId?: string): Promise<ServerSettings | null> {
    const res      = await serverSettingsDb.updateAsync({ id: defaultServerSettings.id }, { $set: settings }, { upsert: true, returnUpdatedDocs: true });
    const affected = res.affectedDocuments ? res.affectedDocuments as unknown as ServerSettings : null;

    if (affected) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.UPSERT,
            storage: StorageKind.SERVER_SETTINGS,
            newData: [affected]
        }, originClientId);
    }

    return affected;
}
