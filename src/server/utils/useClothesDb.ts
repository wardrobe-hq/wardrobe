/*
 * File: useClothesDb.ts
 * Project: wardrobe
 * Created Date: 2025-12-06 17:28:44
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:32:45
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
import { SubscriptionEventAction } from "~/model/api";
import type { Clothing } from "~/model/item";
import { StorageKind } from "~/model/storage";
import { updateImagesOfAffectedOutfits } from "~/server/utils/outfitPreviewImage";


// Load database
const clothesDb = new nedb({ filename: "data/database/clothes.db", autoload: true });


/**
 * Provide function to access Database instance from API
 * @returns Nedb database instance
 */
/* export function useClothesDb() {
    return clothesDb;
} */


/**
 * Inserts a new piece of clothing or updates an existing one
 * @throws Throws Exception on failure
 * @param clothing Clothing data to set. Leave id field empty to insert new clothing
 * @returns Affected documents
 */
export async function upsertClothing(clothing: Clothing): Promise<Clothing | null> {

    // Generate identifier for new piece of clothing
    if (!clothing.id) {
        clothing.id = crypto.randomUUID();
    }

    // Update metadata
    if (!clothing.addedTimestamp) {
        clothing.addedTimestamp = Date.now();
    }

    clothing.modifiedTimestamp = Date.now();

    // Unused image will be deleted by periodic database cleanup job

    const res      = await clothesDb.updateAsync({ id: clothing.id }, { $set: clothing }, { upsert: true, returnUpdatedDocs: true });
    const affected = res.affectedDocuments ? res.affectedDocuments as unknown as Clothing : null;

    // Tell outfit image handler to figure out re-generating images of outfits containing this clothing // TODO: ...only when image has changed (requires a DB query beforehand to get old value...)
    if (affected) {
        updateImagesOfAffectedOutfits(affected.id);

        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.UPSERT,
            storage: StorageKind.CLOTHES,
            newData: affected
        });
    }

    return affected;

}

/**
 * Deletes a piece of clothing
 * @throws Throws Exception on failure
 * @param clothingID ID of the clothing to remove
 */
export async function deleteClothing(clothingID: string): Promise<void> {
    // Unused image will be deleted by periodic database cleanup job

    await clothesDb.removeAsync({ id: clothingID }, {});

    sendStorageSubscriptionEvent({              // Notify registered clients
        action: SubscriptionEventAction.DELETE,
        storage: StorageKind.CLOTHES,
        newData: { id: clothingID }
    });
}

/**
 * Retrieves set of clothes or all from the database
 * @param id Optional: Array of IDs of the clothes to retrieve. Leave empty to get all clothes
 * @returns Returns an array of all matching clothes
 */
export async function getClothes(id?: string[]): Promise<Clothing[]> {
    return await clothesDb.findAsync(id && id.length > 0 ? { id: { $in: id } } : {});
}
