/*
 * File: storage.ts
 * Project: wardrobe
 * Created Date: 2026-03-23 21:34:56
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 19:04:40
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { SubscriptionEventAction, type ApiResponse, type StorageSubscriptionEvent } from "~/model/api";
import type { Clothing, Outfit } from "~/model/item";
import type { Label } from "~/model/label";
import type { Category } from "~/model/label-category";
import { StorageKind, type CachedImage, type ServerSettings, type StorageKindDataMap } from "~/model/storage";


/**
 * Implements & Abstracts all storage related interactions through API with server
 */


// The type of storage kinds we want to cache here. They all have an ID prop, which is used for add/update/remove actions
type CachableStorageKind =
  | StorageKind.CLOTHES
  | StorageKind.LABEL_CATEGORIES
  | StorageKind.LABELS
  | StorageKind.OUTFITS
  | StorageKind.IMAGES;


// Cache
class Cache<T extends CachableStorageKind> {
    data: Ref<StorageKindDataMap<T>[]> = ref([]);

    // Initializes cache
    constructor(initData: StorageKindDataMap<T>[]) {
        this.data.value = initData;
    }

    // Adds to array and returns new length
    add(elem: StorageKindDataMap<T>): number {
        return this.data.value.push(elem);
    }
    // Flat-adds array to array and returns new length
    addArray(elem: StorageKindDataMap<T>[]): number {
        return this.data.value.push(...elem);
    }

    // Updates element with matching ID or inserts a new one and returns index
    upsert(elem: StorageKindDataMap<T>): number {
        const index = this.data.value.findIndex((e) => e.id == elem.id);

        if (index == -1) {
            return this.add(elem) - 1; // -1 since add() returns new array length
        } else {
            this.data.value[index] = elem;
            return index;
        }
    }

    // Removes any elements with matching ID and returns new length
    remove(elem: StorageKindDataMap<T>): number {
        this.data.value = this.data.value.filter((e) => e.id != elem.id);
        return this.data.value.length;
    }
    // Removes array of IDs and returns new length
    removeArray(ids: string[]): number {
        this.data.value = this.data.value.filter((e) => !ids.includes(e.id));
        return this.data.value.length;
    }
}
// TODO: Test Reactivity
// TODO: Limit size


let cachedImages:     Cache<StorageKind.IMAGES>;
// let cachedClothes:    Cache<StorageKind.CLOTHES>;
// let cachedOutfits:    Cache<StorageKind.OUTFITS>;
let storedLabels:     Cache<StorageKind.LABELS>;
let storedCategories: Cache<StorageKind.LABEL_CATEGORIES>;

const storedServerSettings: Ref<ServerSettings> = ref({} as ServerSettings); // Does not use Cache as it's just a singular object


/**
 * Initializes global cache with data required on all pages
 */
export async function initGlobalCache()  {
    console.debug("[DEBUG] Initializing global cache...");

    const [labels, categories, settings] = await Promise.all([
        useFetch("/api/get-all-labels"),
        useFetch("/api/get-all-label-categories"),
        useFetch("/api/get-settings")
    ]);
    // TODO: Error handling

    cachedImages     = new Cache([]);
    storedLabels     = new Cache(labels.data.value!.document as Label[]);
    storedCategories = new Cache(categories.data.value!.document!);

    storedServerSettings.value = settings.data.value!.document!;
}
// TODO: SSR?


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
    let dest: Cache<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

    // StorageKinds without an ID prop must already be handled here!
    switch (event.storage) {
        case StorageKind.IMAGES:
            dest = cachedImages;
            event.action = SubscriptionEventAction.DELETE; // Modify action to DELETE and let ImgLazy figure out reloading image when necessary
            break;
        case StorageKind.CLOTHES:
            throw("Clothes Update not implemented");
        case StorageKind.OUTFITS:
            throw("Outfits Update not implemented");
        case StorageKind.LABELS:
            dest = storedLabels;
            break;
        case StorageKind.LABEL_CATEGORIES:
            dest = storedCategories;
            break;
        case StorageKind.SERVER_SETTINGS:
            storedServerSettings.value = event.newData as ServerSettings;
            emitSettingsSavedEvent();
            return; // Entire overwrite, not an array, nothing to do here
        default:
            throw("handleCacheSubscriptionEvent: Unsupported storage kind " + event.storage);
    }

    switch (event.action) {
        case SubscriptionEventAction.NEW:
            dest.add(event.newData);
            break;
        case SubscriptionEventAction.UPSERT:
            dest.upsert(event.newData);
            break;
        case SubscriptionEventAction.DELETE:
            dest.remove(event.newData);
            break;
        default:
            throw("handleCacheSubscriptionEvent: Unsupported action " + event.action);
    }
}


/* eslint-disable jsdoc/require-jsdoc */
/*
    -------------------- CLOTHES --------------------
*/

export async function getAllClothesFromServer(): Promise<ApiResponse<Clothing[]>> {
    /* if (!cachedClothes) {
        cachedClothes = new Cache([]);          // Asynchronously fill cache - No SSR :(
        sendApiRequest("get-all-clothes").then((res) => cachedClothes.data.value = res);
    }

    return cachedClothes.data; */
    return (await useFetch("/api/get-all-clothes")).data.value!; // SSR
}

export async function getClothingFromServer(id: string): Promise<ApiResponse<Clothing>> {
    return await sendApiRequest("get-clothing", { id: id });
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

export async function getAllOutfitsFromServer(): Promise<ApiResponse<Outfit[]>> {
    /* if (!cachedOutfits) {
        cachedOutfits = new Cache([]);          // Asynchronously fill cache - No SSR :(
        sendApiRequest("/api/get-all-outfits").then((res) => cachedOutfits.data.value = res);
    }

    return cachedOutfits.data; */
    return (await useFetch("/api/get-all-outfits")).data.value!; // SSR
}

export async function getOutfitFromServer(id: string): Promise<ApiResponse<Outfit>> {
    return await sendApiRequest("get-outfit", { id: id });
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

export function getAllLabelsFromServer(): Ref<Label[]> {
    return storedLabels.data;
}

export function getAllLabelCategoriesFromServer(): Ref<Category[]> {
    return storedCategories.data;
}

export async function setCategoriesAndLabelsToServer(categoryData: Category[] | undefined, labelsData: Label[] | undefined): Promise<ApiResponse<never>> {
    const resBody = await sendApiRequest("set-labels", {
        categories: categoryData,
        labels: labelsData
    });

    if (resBody.success) {
        if (categoryData) storedCategories.addArray(categoryData);
        if (labelsData)   storedLabels.addArray(labelsData);
    }

    return resBody;
}

export async function rmLabelsToServer(categoryIDs: string[] | undefined, labelIDs: string[] | undefined): Promise<ApiResponse<never>> {
    const resBody = await sendApiRequest("rm-labels", {
        categoryIDs: categoryIDs,
        labelIDs: labelIDs
    });

    if (resBody.success) {
        if (categoryIDs) storedCategories.removeArray(categoryIDs);
        if (labelIDs)    storedLabels.removeArray(labelIDs);
    }

    return resBody;
}


/*
    -------------------- SETTINGS --------------------
*/

export function getServerSettingsFromServer(): Ref<ServerSettings> {
    return storedServerSettings;
}

export async function setServerSettingsToServer(data: ServerSettings): Promise<ApiResponse<never>> {
    const resBody = await sendApiRequest("set-settings", data);

    if (resBody.success) {
        storedServerSettings.value = data;
    }

    return resBody;
}


/*
    -------------------- IMAGES --------------------
*/

export async function getImageFromServer(imgPath: string, scaleToWidth: number | undefined): Promise<CachedImage | null> {
    if (!imgPath) return null;

    // Attempt to find image with matching size (or none) in cache
    const cachedImg = cachedImages.data.value.find((e) => e.id == imgPath && e.imgWidth == scaleToWidth);

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
    const cacheLength = cachedImages.add(resBody.document!);
    console.debug(`[DEBUG] getImageFromServer: Fetched image '${imgPath}' from server. Image cache has ${cacheLength} entries now.`);

    return cachedImages.data.value[cacheLength - 1]!;
}

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
    cachedImages.remove({ id: resBody.filePath, imgBlob: "", imgWidth: 0 });
    console.debug(`[DEBUG] sendImageToServer: Removed '${resBody.filePath}' from image cache...`);

    return resBody;

}


/* eslint-enable jsdoc/require-jsdoc */
