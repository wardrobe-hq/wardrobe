/*
 * File: useOutfitsDb.ts
 * Project: wardrobe
 * Created Date: 2025-12-06 17:28:44
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-17 16:16:24
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
import type { Outfit } from "~/model/item";
import { type ItemID, StorageKind, updateDatabaseItemMetadata } from "~/model/storage";
import { generateOutfitPreviewImage } from "~/server/utils/outfitPreviewImage";
import { checkStorageLockMatch } from "./useStorage";


// Load database
const outfitsDb = new nedb({ filename: "data/database/outfits.db", autoload: true });


/**
 * Provide function to access Database instance from API
 * @returns Nedb database instance
 */
/* export function useOutfitsDb() {
    return outfitsDb;
} */


/**
 * Inserts a new outfit or updates an existing one
 * @throws Throws Exception on failure
 * @param outfit Outfit data to set. Leave id field empty to insert new outfit
 * @param originClientId Optional: ID of client making request
 * @returns
 */
export async function upsertOutfit(outfit: Outfit, originClientId?: string): Promise<Outfit | null> {

    // Generate identifier for new outfit, otherwise run conflict check
    if (!outfit.id) {
        outfit.id = crypto.randomUUID();
    } else {
        await checkStorageLockMatch(outfit, outfitsDb);
    }

    // Re-generate preview image // TODO: ...when previewImgPath == null or imgPath of referenced clothing has changed
    const newPreviewImg = await generateOutfitPreviewImage(outfit, originClientId);

    if (newPreviewImg != undefined) {          // Explicitly match against undefined to accept empty string (e.g. when all clothes were removed)
        outfit.previewImgPath = newPreviewImg; // Unused image will be deleted by periodic database cleanup job
    }

    // Update metadata
    updateDatabaseItemMetadata(outfit);

    const res      = await outfitsDb.updateAsync({ id: outfit.id }, { $set: outfit }, { upsert: true, returnUpdatedDocs: true });
    const affected = res.affectedDocuments ? res.affectedDocuments as unknown as Outfit : null;

    if (affected) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.UPSERT,
            storage: StorageKind.OUTFITS,
            newData: [affected]
        }, originClientId);
    }

    return affected;

}

/**
 * Deletes an outfit
 * @throws Throws Exception on failure
 * @param outfitID ID of the outfit to remove
 * @param originClientId Optional: ID of client making request
 * @returns
 */
export async function deleteOutfit(outfitID: ItemID, originClientId?: string): Promise<void> {
    // Unused image will be deleted by periodic database cleanup job

    await outfitsDb.removeAsync({ id: outfitID }, {});

    sendStorageSubscriptionEvent({              // Notify registered clients
        action: SubscriptionEventAction.DELETE,
        storage: StorageKind.OUTFITS,
        newData: [{ id: outfitID }]
    }, originClientId);
}

/**
 * Retrieves one or all outfits from the database
 * @param id Optional: ID of the outfit to retrieve. Leave empty to get all outfits
 * @returns Returns an array of all matching outfits
 */
export async function getOutfit(id: ItemID|null): Promise<Outfit[]> {
    return await outfitsDb.findAsync(id ? { id: id } : {});
}

/**
 * Retrieves all outfits containing a piece of clothing
 * @param clothingID ID of clothing to search for
 * @returns Returns an array of outfits
 */
export async function getOutfitsContainingClothing(clothingID: ItemID): Promise<Outfit[]> {
    return await outfitsDb.findAsync({ clothes: { $elemMatch: { clothingID: clothingID } } });
}
