/*
 * File: storage.ts
 * Project: wardrobe
 * Created Date: 2026-03-23 21:34:56
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-29 17:45:11
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
import { StorageKind, type CachedImage, type ServerSettings, type StorageKindDataMap } from "~/model/storage";
import { emitSettingsSavedEvent } from "~/composables/events";
import { State } from "./state";


/**
 * Implements & Abstracts all storage related interactions through API with server
 */


let cachedImages: Ref<StorageKindDataMap<StorageKind.IMAGES>[]>;


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
 */
export function handleCacheSubscriptionEvent(event: StorageSubscriptionEvent) {
    let imageId: string;

    switch (event.storage) {
        case StorageKind.IMAGES:
            imageId = (event.newData as StorageKindDataMap<StorageKind.IMAGES>).id;
            cachedImages.value = cachedImages.value.filter((e) => e.id !== imageId);
            console.debug(`[DEBUG] handleCacheSubscriptionEvent: Deleting image '${imageId}' from cache...`);
            break;
        case StorageKind.CLOTHES:
            refreshNuxtData("/api/get-all-clothes");
            console.debug("[DEBUG] handleCacheSubscriptionEvent: Refreshing data of API route '/api/get-all-clothes'...");
            break;
        case StorageKind.OUTFITS:
            refreshNuxtData("/api/get-all-outfits");
            console.debug("[DEBUG] handleCacheSubscriptionEvent: Refreshing data of API route '/api/get-all-outfits'...");
            break;
        case StorageKind.LABELS:
            refreshNuxtData("/api/get-all-labels");
            console.debug("[DEBUG] handleCacheSubscriptionEvent: Refreshing data of API route '/api/get-all-labels'...");
            break;
        case StorageKind.LABEL_CATEGORIES:
            refreshNuxtData("/api/get-all-label-categories");
            console.debug("[DEBUG] handleCacheSubscriptionEvent: Refreshing data of API route '/api/get-all-label-categories'...");
            break;
        case StorageKind.SERVER_SETTINGS:
            refreshNuxtData("/api/get-settings")
                .then(() => emitSettingsSavedEvent());
            console.debug("[DEBUG] handleCacheSubscriptionEvent: Refreshing data of API route '/api/get-settings'...");
            return;
        default:
            throw("handleCacheSubscriptionEvent: Unsupported storage kind " + event.storage);
    }
}


/* eslint-disable jsdoc/require-jsdoc */
/*
    -------------------- CLOTHES --------------------
*/

export async function getAllClothesFromServer(): Promise<Ref<ApiResponse<Clothing[]>>> {
    return (await useFetch("/api/get-all-clothes")).data as Ref<ApiResponse<Clothing[]>>;
}

export async function getClothingFromServer(id: string): Promise<Ref<ApiResponse<Clothing>>> {
    return (await useFetch("/api/get-clothing", { method: "POST", body: { id: id } })).data as Ref<ApiResponse<Clothing>>;
}

export async function setClothingToServer(data: Clothing): Promise<ApiResponse<Clothing>> {
    return await sendApiRequest("set-clothing", { clothing: data });
}

export async function rmClothingToServer(id: string): Promise<ApiResponse<never>> {
    return await sendApiRequest("rm-clothing", { id: id });
}


/*
    -------------------- OUTFITS --------------------
*/

export async function getAllOutfitsFromServer(): Promise<Ref<ApiResponse<Outfit[]>>> {
    return (await useFetch("/api/get-all-outfits")).data as Ref<ApiResponse<Outfit[]>>; // SSR
}

export async function getOutfitFromServer(id: string): Promise<Ref<ApiResponse<Outfit>>> {
    return (await useFetch("/api/get-outfit", { method: "POST", body: { id: id } })).data as Ref<ApiResponse<Outfit>>;
}

export async function setOutfitToServer(data: Outfit): Promise<ApiResponse<Outfit>> {
    return await sendApiRequest("set-outfit", { outfit: data });
}

export async function rmOutfitToServer(id: string): Promise<ApiResponse<never>> {
    return await sendApiRequest("rm-outfit", { id: id });
}


/*
    -------------------- LABELS --------------------
*/

export function getAllLabelsFromServer(): Ref<ApiResponse<Label[]>> {
    return useNuxtData("/api/get-all-labels").data; // Return values fetched in initGlobalCache()
}

export function getAllLabelCategoriesFromServer(): Ref<ApiResponse<Category[]>> {
    return useNuxtData("/api/get-all-label-categories").data; // Return values fetched in initGlobalCache()
}

export async function setCategoriesAndLabelsToServer(categoryData: Category[] | undefined, labelsData: Label[] | undefined): Promise<ApiResponse<never>> {
    const resBody = await sendApiRequest("set-labels", {
        categories: categoryData,
        labels: labelsData
    });

    if (resBody.success) {
        if (categoryData) refreshNuxtData("/api/get-all-label-categories"); // storedCategories.value.push(...categoryData);
        if (labelsData)   refreshNuxtData("/api/get-all-labels"); // storedLabels.value.push(...labelsData);
    }

    return resBody;
}

export async function rmLabelsToServer(categoryIDs: string[] | undefined, labelIDs: string[] | undefined): Promise<ApiResponse<never>> {
    const resBody = await sendApiRequest("rm-labels", {
        categoryIDs: categoryIDs,
        labelIDs: labelIDs
    });

    if (resBody.success) {
        if (categoryIDs) refreshNuxtData("/api/get-all-label-categories"); // storedCategories.value = storedCategories.value.filter((e) => !categoryIDs.includes(e.id));
        if (labelIDs)    refreshNuxtData("/api/get-all-labels"); // storedLabels.value = storedLabels.value.filter((e) => !labelIDs.includes(e.id));
    }

    return resBody;
}


/*
    -------------------- SETTINGS --------------------
*/

export function getServerSettingsFromServer(): Ref<ApiResponse<ServerSettings>> {
    return useNuxtData("/api/get-settings").data; // Return values fetched in initGlobalCache()
}

export async function setServerSettingsToServer(data: ServerSettings): Promise<ApiResponse<never>> {
    const resBody = await sendApiRequest("set-settings", data);

    if (resBody.success) {
        refreshNuxtData("/api/get-settings");
    }

    return resBody;
}


/*
    -------------------- IMAGES --------------------
*/

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
