/*
 * File: outfitPreviewImage.ts
 * Project: wardrobe
 * Created Date: 2025-12-28 21:38:23
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:32:42
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { createCanvas, loadImage } from "canvas";
import type { Outfit } from "~/model/item";
import { getClothes } from "~/server/utils/useClothesDb";
import { upsertOutfit, getOutfitsContainingClothing } from "~/server/utils/useOutfitsDb";
import { getImage, imgCategory, saveImage } from "~/server/utils/useImagesStorage";


/**
 * Generates an image collage
 * @param images Array of images, sorted how they should appear in the image, top to bottom
 * @param collageWidth Width of resulting image in pixels
 * @param collageHeight Height of resulting image in pixels
 * @returns Promise resolving to image collage as Buffer
 */
async function generateImageCollage(images: Buffer<ArrayBufferLike>[], collageWidth: number, collageHeight: number): Promise<Buffer<ArrayBufferLike>> {
    // Create a new 2D canvas
    const canvas = createCanvas(collageWidth, collageHeight);
    const ctx    = canvas.getContext("2d");

    // Calculate scaled size for every image to fit canvas evenly (vertical only!), with some overlap
    const yImgOverlap = canvas.height * 0.05;
    const scaledHeight = (collageHeight / images.length) + yImgOverlap;

    // Load every image buffer and draw it onto our canvas
    const imagePromises = images.map(async (e, i) => {
        const img = await loadImage(e);

        // Positon each image a little scattered on the x axis, alternating left/right
        const xOffsetRandomness = Math.max(Math.random() * (collageWidth / 4), collageWidth / 8) * (i % 2 == 1 ? -1 : 1); // Returns values between 1/8 and 1/4 of collage width, negative on uneven i

        // Calculate width based on scaled height and maintain aspect ratio
        const factor      = img.naturalHeight / scaledHeight;          // Calculate aspect ratio to scale image only by height
        const scaledWidth = img.naturalWidth / factor;                 // Apply aspect ratio to get width based on scaled down height

        // Calculate position of source image on canvas
        const xLeftOffset = (xOffsetRandomness + (collageWidth / 2)) - (scaledWidth / 2); // Position of image from left of canvas, centered with slight horizontal scatter
        const yTopOffset  = (i * (collageHeight / images.length));                        // Position image based on position in array offset from top of canvas

        // Save the current context
        ctx.save();
        ctx.rotate((Math.random() - 0.5) * 0.25); // Give it a random slight rotation (in radians) // TODO: Left rotation when yOffset left from center, right when right?
        ctx.drawImage(
            img,
            0, 0, img.naturalWidth, img.naturalHeight,          // Position (0, 0) and size of source image
            xLeftOffset, yTopOffset, scaledWidth, scaledHeight  // Position of scaled source image on canvas
        );

        // Restore the original context so the next image does not inherit rotation etc.
        ctx.restore();
    });

    await Promise.all(imagePromises);

    // Return collage as a Buffer
    return canvas.toBuffer("image/png");
}


/**
 * Generates a preview image for an outfit
 * @throws Throws Exception on failure
 * @param outfit Outfit to generate new preview image for
 * @returns Path of image in storage
 */
export async function generateOutfitPreviewImage(outfit: Outfit): Promise<string> {

    if (outfit.clothes.length == 0) {
        return "";
    }

    // Get all images of clothes in this outfit
    const images: Buffer<ArrayBufferLike>[] = []; // TODO: Not sorted yet, probably needs to be a 2D array: First layer represents sorted body labels, second layer clothes sorted by order index

    const clothes = await getClothes(outfit.clothes.flatMap((e) => e.clothingID));

    await Promise.all(clothes.map(async (e) => { // Refactored from a stinky await + then mixture for @DerDeathraven's sanity
        if (e.imgPath) {
            const img = await getImage(e.imgPath);

            if (img) {
                images.push(img);
            }
        }
    }));


    // Generate collage
    console.log(`Generating new outfit preview image for '${outfit.title}' (${outfit.id}) with ${images.length} images...`);

    const collage = await generateImageCollage(images, 1024, 1024);


    // Save image & return path
    const imgPath = await saveImage(imgCategory.outfit, collage);

    console.log("Finished generating outfit preview image " + imgPath);
    return imgPath;

}


/**
 * Asynchronously re-generates preview images of outfits containing a piece of clothing
 * @param clothingID
 */
export function updateImagesOfAffectedOutfits(clothingID: string) {

    // Get all outfits containing this piece of clothing
    getOutfitsContainingClothing(clothingID)
        .then((outfits) => {
            console.log(`Re-generating ${outfits.length} preview images which contain clothing '${clothingID}'...`);

            outfits.forEach(async (e) => upsertOutfit(e)); // UpsertOutfit handles preview generation
        });

}
