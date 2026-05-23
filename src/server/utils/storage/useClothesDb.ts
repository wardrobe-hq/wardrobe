/*
 * File: useClothesDb.ts
 * Project: wardrobe
 * Created Date: 2025-12-06 17:28:44
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-23 13:13:22
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import nedb from "@seald-io/nedb";
import crypto from "node:crypto";


// Load database
const clothesDb = new nedb({ filename: "data/database/clothes.db", autoload: true });

// Internal: Access Database instance directly
// export const _useClothesDb = () => clothesDb;


/**
 * Internal: Migrates DB if necessary and updates DatabaseMetaItem
 * @param toVersion Wardrobe Version to migrate to
 */
export async function _migrateClothingDb(toVersion: string) {

    // Get current record
    const curItem = await clothesDb.findOneAsync({ id: defaultDatabaseMetaItem.id }) as unknown as DatabaseMetaItem | null;
    logger.debug(`Clothes Database Meta - Created in '${curItem?.dbCreatedVersion}', last loaded in '${curItem?.dbVersion}'. Updating version to '${toVersion}'...`);

    // Apply any necessary dbCreatedVersion -> toVersion migration
    // ...

    // Update (or create) record
    const newItem: DatabaseMetaItem = curItem || defaultDatabaseMetaItem;
    if (!newItem.dbCreatedVersion) {
        newItem.dbCreatedVersion = toVersion;
    }
    newItem.dbVersion = toVersion;
    updateDatabaseItemMetadata(newItem);

    await clothesDb.updateAsync({ id: defaultDatabaseMetaItem.id }, { $set: newItem }, { upsert: true });

}


/**
 * Inserts a new piece of clothing or updates an existing one
 * @throws Throws Exception on failure
 * @param clothing Clothing data to set. Leave id field empty to insert new clothing
 * @param originClientId Optional: ID of client making request
 * @returns Affected documents
 */
export async function upsertClothing(clothing: Clothing, originClientId?: string): Promise<Clothing | null> {

    // Generate identifier for new piece of clothing, otherwise run conflict check
    if (!clothing.id) {
        clothing.id = crypto.randomUUID();
    } else {
        await checkStorageLockMatch(clothing, clothesDb);
    }

    // Update metadata
    updateDatabaseItemMetadata(clothing);

    // Unused image will be deleted by periodic database cleanup job

    const res      = await clothesDb.updateAsync({ id: clothing.id }, { $set: clothing }, { upsert: true, returnUpdatedDocs: true });
    const affected = res.affectedDocuments ? res.affectedDocuments as unknown as Clothing : null;

    // Tell outfit image handler to figure out re-generating images of outfits containing this clothing // TODO: ...only when image has changed (requires a DB query beforehand to get old value...)
    if (affected) {
        updateImagesOfAffectedOutfits(affected.id, originClientId);

        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.UPSERT,
            storage: StorageKind.CLOTHES,
            newData: [affected]
        }, originClientId);
    }

    return affected;

}

/**
 * Deletes a piece of clothing
 * @throws Throws Exception on failure
 * @param clothingID ID of the clothing to remove
 * @param originClientId Optional: ID of client making request
 */
export async function deleteClothing(clothingID: ItemID, originClientId?: string): Promise<void> {
    // Unused image will be deleted by periodic database cleanup job

    await clothesDb.removeAsync({ id: clothingID }, {});

    sendStorageSubscriptionEvent({              // Notify registered clients
        action: SubscriptionEventAction.DELETE,
        storage: StorageKind.CLOTHES,
        newData: [{ id: clothingID }]
    }, originClientId);
}

/**
 * Retrieves set of clothes or all from the database
 * @param id Optional: Array of IDs of the clothes to retrieve. Leave empty to get all clothes
 * @returns Returns an array of all matching clothes
 */
export async function getClothes(id?: ItemID[]): Promise<Clothing[]> {
    return await clothesDb.findAsync((id && id.length > 0) ? { id: { $in: id, ...NEDB_META_ITEM_FILTER }, } : { id: NEDB_META_ITEM_FILTER });
}
