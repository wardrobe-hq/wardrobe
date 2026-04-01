/*
 * File: dataCleanup.ts
 * Project: wardrobe
 * Created Date: 2025-12-30 22:18:23
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:38:13
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { getClothes, upsertClothing } from "~/server/utils/useClothesDb";
import { deleteImage, getAllImagePaths, imgCategory } from "~/server/utils/useImagesStorage";
import { getAllLabelCategories, getAllLabels, removeLabels } from "~/server/utils/useLabelsDb";
import { getOutfit, upsertOutfit } from "~/server/utils/useOutfitsDb";
import type { Clothing } from "~/model/item";
import type { Outfit } from "~/model/item";


/*
    This core job is registered directly by the job manager on startup
*/


/**
 * Deletes unreferenced images from storage
 * @param clothes
 * @param outfits
 * @returns Amount of deleted images
 */
async function deleteUnusedImages(clothes: Clothing[], outfits: Outfit[]): Promise<number> {
    const imagePaths              = await getAllImagePaths();
    const deletedImages: string[] = [];

    imagePaths.forEach((img) => {
        if (img.startsWith(imgCategory.clothing)) {
            if (!clothes.some((e) => e.imgPath == img)) {
                deletedImages.push(img);
                deleteImage(img);
            }
        }
        if (img.startsWith(imgCategory.outfit)) {
            if (!outfits.some((e) => e.previewImgPath == img)) {
                deletedImages.push(img);
                deleteImage(img);
            }
        }
    });

    if (deletedImages.length > 0) console.debug("DEBUG - dataCleanup: Unused images: ", deletedImages);
    return deletedImages.length;
}


/**
 * Cleans databases & image storage in data directory
 */
export default {
    info: {
        name: "dataCleanup",
        interval: 4.32e+7, // 12 hours
        runOnRegistration: true
    },
    run: async function () {

        // Get all clothes, outfits, labels & label categories
        let [clothes, outfits, labels, categories] = await Promise.all([ // eslint-disable-line prefer-const
            getClothes(),
            getOutfit(null),
            getAllLabels(),
            getAllLabelCategories()
        ]);
        // TODO: Error handling?


        // Delete labels pointing to deleted categories // TODO: Not (yet) in separate function due to amount of in/out params
        const labelIDsToRemove: string[] = [];

        labels = labels.filter((label) => {
            if (categories.findIndex((f) => f.id === label.categoryID) === -1) {
                labelIDsToRemove.push(label.id);

                return false; // Remove it
            } else {
                return true;  // Keep it
            }
        });

        console.debug("DEBUG - dataCleanup: Unreferenced labels: ", labelIDsToRemove);
        removeLabels(labelIDsToRemove);


        // Filter clothes for non existent labels // TODO: Not (yet) in separate function due to amount of in/out params
        let clothesUpdated = 0;

        clothes = clothes.map((clothing) => {
            let mod = false;

            clothing.labelIDs = clothing.labelIDs.filter((id) => {
                const exists = labels.findIndex((label) => label.id == id) != -1;

                if (!exists) {
                    console.debug(`DEBUG - dataCleanup: Clothing '${clothing.id}' references deleted label '${id}'`);
                    mod = true;
                }
                return exists;
            });

            if (mod) {
                upsertClothing(clothing);
                clothesUpdated++;
            }
            return clothing;
        });


        // Filter outfits for non existent labels & clothes // TODO: Not (yet) in separate function due to amount of in/out params
        let outfitsUpdated = 0;

        outfits = outfits.map((outfit) => {
            let mod = false;

            outfit.labelIDs = outfit.labelIDs.filter((id) => {
                const exists = labels.findIndex((label) => label.id == id) != -1;

                if (!exists) {
                    console.debug(`DEBUG - dataCleanup: Outfit '${outfit.id}' references deleted label '${id}'`);
                    mod = true;
                }
                return exists;
            });

            outfit.clothes = outfit.clothes.filter((assignment) => {
                const exists = clothes.findIndex((clothing) => clothing.id == assignment.clothingID) != -1;

                if (!exists) {
                    console.debug(`DEBUG - dataCleanup: Outfit '${outfit.id}' references deleted clothing '${assignment.clothingID}'`);
                    mod = true;
                }
                return exists;
            });

            if (mod) {
                upsertOutfit(outfit);
                outfitsUpdated++;
            }
            return outfit;
        });


        // Delete images not referenced in any clothes & outfits
        const imagesDeleted = await deleteUnusedImages(clothes, outfits);


        // Return result
        console.log(`Job dataCleanup: Deleted ${labelIDsToRemove.length} unreferences labels, deleted ${imagesDeleted} unused images and removed broken references from ${clothesUpdated} clothes & ${outfitsUpdated} outfits...`);

        return {
            labelsDeleted: labelIDsToRemove.length,
            imagesDeleted: imagesDeleted,
            clothesUpdated: clothesUpdated,
            outfitsUpdated: outfitsUpdated
        };

    }

};
