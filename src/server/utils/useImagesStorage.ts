/*
 * File: useImagesStorage.ts
 * Project: wardrobe
 * Created Date: 2025-12-06 17:28:44
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:32:46
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import crypto from "node:crypto";
import sharp from "sharp";
import { sendStorageSubscriptionEvent } from "./useStorage";
import { SubscriptionEventAction } from "~/model/api";
import { StorageKind } from "~/model/storage";


// Use images storage - storage bucket is defined in nuxt.config.ts
const imagesStorage = useStorage("images");


// Image categories used to separate images in storage
export enum imgCategory {
    clothing = "clothing",
    outfit = "outfit"
}


/**
 * Gets paths of all images currently in storage
 * @returns List of all file paths
 */
export async function getAllImagePaths(): Promise<string[]> {
    return (await imagesStorage.getKeys()).map((e) => e.replace(":", "/"));
}


/**
 * Retrieves an image from storage
 * @param filePath File path of the image to retrieve
 * @returns Image buffer
 */
export async function getImage(filePath: string): Promise<Buffer<ArrayBufferLike>|null> {
    if (!filePath) throw("filePath parameter is required");

    // Get item
    const item = await imagesStorage.getItemRaw(filePath);

    if (!item) {
        console.error(`Server getImage: No image found at '${filePath}'!`);
        return null;
    }

    return item;
}


/**
 * Scales an image
 * @param img Image buffer to scale
 * @param width Width to scale to. Height is determined automatically to keep aspect ratio
 * @param onlyDownscale Optional: Set to true to leave img unmodified if its width is already < width parameter
 * @returns Returns scaled image buffer
 */
export async function scaleImage(img: Buffer<ArrayBufferLike>, width: number, onlyDownscale?: boolean): Promise<Buffer<ArrayBufferLike>> {
    // Scales and keeps aspect ratio
    return (await sharp(img)
        .resize(width, null, { withoutEnlargement: onlyDownscale })
        .toBuffer());
}


/**
 * Saves an image to the image storage
 * @throws Throws Exception on failure
 * @param category Type of image, used as directory name in storage
 * @param fileBuffer File buffer to save
 * @returns Path of image in storage
 */
export async function saveImage(category: imgCategory, fileBuffer: Buffer<ArrayBufferLike>): Promise<string> {
    if (!fileBuffer) throw("File parameter is required");

    // Calculate hash from buffer
    const hash = crypto.createHash("sha256");
    hash.update(fileBuffer);

    // Save file with hash as name
    const fileName = hash.digest("hex");
    const path = `${category}/${fileName}`;
    await imagesStorage.setItemRaw(path, fileBuffer); // TODO: Image type is hardcoded

    // Notify registered clients
    sendStorageSubscriptionEvent({
        action: SubscriptionEventAction.NEW,
        storage: StorageKind.IMAGES,
        newData: { id: path, imgBlob: null, imgWidth: undefined }   // Images are lazy loaded due to their size, won't broadcast it here
    });

    return path;

}


/**
 * Deletes an image from the image storage
 * @param filePath File path of image to delete
 */
export function deleteImage(filePath: string) {
    imagesStorage.del(filePath);

    // Notify registered clients
    sendStorageSubscriptionEvent({
        action: SubscriptionEventAction.DELETE,
        storage: StorageKind.IMAGES,
        newData: { id: filePath, imgBlob: null, imgWidth: undefined }   // Images are lazy loaded due to their size, won't broadcast it here
    });
}
