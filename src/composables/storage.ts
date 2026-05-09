/*
 * File: storage.ts
 * Project: wardrobe
 * Created Date: 2026-03-23 21:34:56
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-09 20:37:01
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { type ApiResponse, type StorageSubscriptionEvent } from "~/model/api";
import type { Clothing, Outfit } from "~/model/item";
import type { Label } from "~/model/label";
import type { Category } from "~/model/label-category";
import { StorageKind, type CachedImage, type ItemID, type ServerSettings, type StorageKindDataMap } from "~/model/storage";
import { emitSettingsSavedEvent } from "~/composables/events";
import { State } from "./state";


/**
 * Implements & Abstracts all storage related interactions through API with server
 */


let cachedImages: Ref<StorageKindDataMap<StorageKind.IMAGES>[]>; // Perhaps replaceable by using useFetch() with !immediate?


/**
 * Initializes global cache with data required on all pages.
 * Uses SSR(!) and must be called from app.vue
 */
export async function initGlobalCache()  {
    console.debug("[DEBUG] Initializing global cache...");

    cachedImages = useState(State.CACHED_IMAGES);

    await Promise.all([
        useFetch("/api/get-all-labels",           { key: "/api/get-all-labels" }),
        useFetch("/api/get-all-label-categories", { key: "/api/get-all-label-categories" }),
        useFetch("/api/get-settings",             { key: "/api/get-settings" })
    ]);
    // TODO: Error handling

    console.debug("[DEBUG] Finished initializing global cache!");
}


/**
 * Sends raw API request to server and returns raw response
 * @param route Route to query
 * @param headers Optional: Headers to set
 * @param body Optional: Request body to pass
 * @returns Promise resolving with response
 */
async function sendApiRequestRaw(route: string, headers?: HeadersInit, body?: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return await fetch("/api/" + route, {
        method: "POST",
        headers: headers,
        body: body
    });
}

/**
 * Sends API request with optional JSON data to server and returns parsed JSON response
 * @param route Route to query
 * @param data Optional: JSON data to pass
 * @returns Promise resolving with parsed JSON response
 */                                                          // TODO: Can I infer the return type from route like useFetch does?
async function sendApiRequest(route: string, data?: object): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const res = await sendApiRequestRaw(
        route,
        {
            "Content-Type": "application/json"
        },
        data ? JSON.stringify(data) : undefined
    );

    return await res.json();
}


/**
 * Handles incoming server storage update events
 * @param event
 * @returns Returns Promise resolving when data has been refreshed
 */
export async function handleStorageSubscriptionEvent(event: StorageSubscriptionEvent): Promise<void> {
    let newData;

    switch (event.storage) {
        case StorageKind.IMAGES:
            newData = event.newData as StorageKindDataMap<StorageKind.IMAGES>;
            cachedImages.value = cachedImages.value.filter((e) => e.id !== newData.id);
            console.debug(`[DEBUG] handleStorageSubscriptionEvent: Deleting image '${newData.id}' from cache...`);
            break;
        case StorageKind.CLOTHES:
            newData = event.newData as StorageKindDataMap<StorageKind.CLOTHES>;
            console.debug(`[DEBUG] handleStorageSubscriptionEvent: Refreshing data of API route '/api/get-all-clothes' & '/api/get-clothing/${newData.id}'...`);
            await Promise.all([ refreshNuxtData("/api/get-all-clothes"), refreshNuxtData("/api/get-clothing/" + newData.id) ]);
            break;
        case StorageKind.OUTFITS:
            newData = event.newData as StorageKindDataMap<StorageKind.OUTFITS>;
            console.debug(`[DEBUG] handleStorageSubscriptionEvent: Refreshing data of API route '/api/get-all-outfits' & '/api/get-outfit/${newData.id}'...`);
            await Promise.all([ refreshNuxtData("/api/get-all-outfits"), refreshNuxtData("/api/get-outfit/" + newData.id) ]);
            break;
        case StorageKind.LABELS:
            await refreshNuxtData("/api/get-all-labels");
            console.debug("[DEBUG] handleStorageSubscriptionEvent: Refreshing data of API route '/api/get-all-labels'...");
            break;
        case StorageKind.LABEL_CATEGORIES:
            await refreshNuxtData("/api/get-all-label-categories");
            console.debug("[DEBUG] handleStorageSubscriptionEvent: Refreshing data of API route '/api/get-all-label-categories'...");
            break;
        case StorageKind.SERVER_SETTINGS:
            await refreshNuxtData("/api/get-settings");
            emitSettingsSavedEvent();
            console.debug("[DEBUG] handleStorageSubscriptionEvent: Refreshing data of API route '/api/get-settings'...");
            return;
        default:
            throw("handleStorageSubscriptionEvent: Unsupported storage kind " + event.storage);
    }
}


/* eslint-disable jsdoc/require-jsdoc */
/*
    -------------------- CLOTHES --------------------
*/

export async function getAllClothesFromServer(): Promise<void> {
    await useFetch("/api/get-all-clothes", { key: "/api/get-all-clothes" }); // Fetch data initially
}

export function getAllClothesFromCache(): Ref<ApiResponse<Clothing[]>> {
    return useNuxtData("/api/get-all-clothes").data; // Return nuxt data cache for fetched data to make refreshNuxtData() work
}

export async function getClothingFromServer(id: ItemID): Promise<void> {
    await useFetch("/api/get-clothing", { method: "POST", body: { id: id }, key: "/api/get-clothing/" + id });
}

export function getClothingFromCache(id: ItemID): Ref<ApiResponse<Clothing>> {
    return useNuxtData("/api/get-clothing/" + id).data;
}

export async function setClothingToServer(data: Clothing): Promise<ApiResponse<Clothing>> {
    const resBody = await sendApiRequest("set-clothing", { clothing: data });

    if (resBody.success) {
        await refreshNuxtData("/api/get-all-clothes");
    }

    return resBody;
}

export async function rmClothingToServer(id: ItemID): Promise<ApiResponse<never>> {
    const resBody = await sendApiRequest("rm-clothing", { id: id });

    if (resBody.success) {
        await refreshNuxtData("/api/get-all-clothes");
    }

    return resBody;
}


/*
    -------------------- OUTFITS --------------------
*/

export async function getAllOutfitsFromServer(): Promise<void> {
    await useFetch("/api/get-all-outfits", { key: "/api/get-all-outfits" }); // Fetch data initially
}

export function getAllOutfitsFromCache(): Ref<ApiResponse<Outfit[]>> {
    return useNuxtData("/api/get-all-outfits").data; // Return nuxt data cache for fetched data to make refreshNuxtData() work
}

export async function getOutfitFromServer(id: ItemID): Promise<void> {
    await useFetch("/api/get-outfit", { method: "POST", body: { id: id }, key: "/api/get-outfit/" + id });
}

export function getOutfitFromCache(id: ItemID): Ref<ApiResponse<Outfit>> {
    return useNuxtData("/api/get-outfit/" + id).data;
}

export async function setOutfitToServer(data: Outfit): Promise<ApiResponse<Outfit>> {
    const resBody = await sendApiRequest("set-outfit", { outfit: data });

    if (resBody.success) {
        await refreshNuxtData("/api/get-all-outfits");
    }

    return resBody;
}

export async function rmOutfitToServer(id: ItemID): Promise<ApiResponse<never>> {
    const resBody = await sendApiRequest("rm-outfit", { id: id });

    if (resBody.success) {
        await refreshNuxtData("/api/get-all-outfits");
    }

    return resBody;
}


/*
    -------------------- LABELS --------------------
*/

export function getAllLabelsFromCache(): Ref<ApiResponse<Label[]>> {
    return useNuxtData("/api/get-all-labels").data; // Return values fetched in initGlobalCache()
}

export function getAllLabelCategoriesFromCache(): Ref<ApiResponse<Category[]>> {
    return useNuxtData("/api/get-all-label-categories").data; // Return values fetched in initGlobalCache()
}

export async function setCategoriesAndLabelsToServer(updatedCategories: Category[] | undefined, deletedCategories: Category[] | undefined, updatedLabels: Label[] | undefined, deletedLabels: Label[] | undefined): Promise<ApiResponse<never>> {
    const resBody = await sendApiRequest("set-labels", {
        updatedCategories: updatedCategories,
        deletedCategories: deletedCategories,
        updatedLabels: updatedLabels,
        deletedLabels: deletedLabels
    });

    if (resBody.success) {
        await refreshNuxtData("/api/get-all-label-categories"); // storedCategories.value.push(...categoryData);
        await refreshNuxtData("/api/get-all-labels"); // storedLabels.value.push(...labelsData);
    }

    return resBody;
}


/*
    -------------------- SETTINGS --------------------
*/

export function getServerSettingsFromCache(): Ref<ApiResponse<ServerSettings>> {
    return useNuxtData("/api/get-settings").data; // Return values fetched in initGlobalCache()
}

export async function setServerSettingsToServer(data: ServerSettings): Promise<ApiResponse<never>> {
    const resBody = await sendApiRequest("set-settings", data);

    if (resBody.success) {
        await refreshNuxtData("/api/get-settings");
    }

    return resBody;
}


/*
    -------------------- IMAGES --------------------
*/

export async function getSSRImageFromServer(imgPath: string, scaleToWidth: number | undefined): Promise<Ref<ApiResponse<CachedImage>>> { // Variant that supports SSR for image loads on page load
    const body = {
        filePath: imgPath,
        width: scaleToWidth
    };

    return (await useFetch("/api/get-image", { method: "POST", body: body })).data as Ref<ApiResponse<CachedImage>>;
}

export async function getImageFromServer(imgPath: string, scaleToWidth: number | undefined): Promise<CachedImage | null> {
    if (!imgPath) return null;

    // Attempt to find image with matching size (or none) in cache
    const cachedImg = cachedImages.value.find((e) => e.id == imgPath && e.imgWidth == scaleToWidth);

    if (cachedImg) {
        console.debug(`[DEBUG] getImageFromServer: Found image '${imgPath}' in cache!`);
        return cachedImg;
    }

    // Fetch image from server
    const resBody: ApiResponse<CachedImage> = await sendApiRequest("get-image", {
        filePath: imgPath,
        width: scaleToWidth
    });

    // Add to cache
    cachedImages.value.push(resBody.document!);
    console.debug(`[DEBUG] getImageFromServer: Fetched image '${imgPath}' from server. Image cache has ${cachedImages.value.length} entries now.`);

    return cachedImages.value[cachedImages.value.length - 1]!;
}
// TODO: SSR?

export async function sendImageToServer(file: File): Promise<ApiResponse<{ filePath: string }>> {

    // Construct form to post
    const formData = new FormData();
    formData.append("file", file);
    // formData.append("imgType", "clothing"); // TODO: Image type is hardcoded

    // Attempt to post file to API
    const res = await sendApiRequestRaw("set-clothing-image", undefined, formData);

    if (!res.ok) {
        throw("Failed to upload image: " + res.statusText);
    }

    // Get file name from response
    const resBody = await res.json();

    // Remove all references of image from cache to fetch next usage from server again
    // TODO: Return imgBlob from API route and replace every matching imgPath using map() instead of deleting them
    cachedImages.value = cachedImages.value.filter((e) => e.id !== resBody.filePath);
    console.debug(`[DEBUG] sendImageToServer: Removed '${resBody.filePath}' from image cache...`);

    return resBody;

}


/* eslint-enable jsdoc/require-jsdoc */
