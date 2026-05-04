/*
 * File: item.ts
 * Project: wardrobe
 * Created Date: 2025-09-08 15:45:56
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-04 22:52:22
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { DatabaseItem } from "./storage";


// Base type for Clothing & Outfit, used by generic components & composables.
export interface WardrobeItem extends DatabaseItem {
    title: string,      // Used for sorting
    labelIDs: string[], // Used as filters/for filtering
}


// Implements WardrobeItem
export interface Clothing extends WardrobeItem {
    id: string,
    title: string,
    description: string,
    imgPath: string,
    labelIDs: string[] // IMPORTANT: May reference non-existent labels if dataCleanUp job did not run yet!
}


// Implements WardrobeItem
export interface Outfit extends WardrobeItem {
    title: string,
    clothes: { order: number, clothingID: string }[], // IMPORTANT: May reference non-existent clothes if dataCleanUp job did not run yet!
    labelIDs: string[],                               // IMPORTANT: May reference non-existent labels if dataCleanUp job did not run yet!
    previewImgPath: string
}
