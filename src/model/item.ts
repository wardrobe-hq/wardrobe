/*
 * File: item.ts
 * Project: wardrobe
 * Created Date: 2025-09-08 15:45:56
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 19:04:46
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { Implements } from "./Implements";


// Base type for Clothing & Outfit, used by generic components & composables.
export type Item = {
    id: string,
    title: string,          // Used for sorting
    labelIDs: string[], // Label[],        // Used as filters/for filtering
    addedTimestamp: number,  // Used for sorting
    modifiedTimestamp: number
}


// Implements Item
export type Clothing = Implements<Item, {
    id: string,
    title: string,
    description: string,
    imgPath: string,
    labelIDs: string[], // IMPORTANT: May reference non-existent labels if dataCleanUp job did not run yet!
    addedTimestamp: number,
    modifiedTimestamp: number
}>


// Implements Item
export type Outfit = Implements<Item, {
    id: string,
    title: string,
    clothes: { order: number, clothingID: string }[], // IMPORTANT: May reference non-existent clothes if dataCleanUp job did not run yet!
    labelIDs: string[],                               // IMPORTANT: May reference non-existent labels if dataCleanUp job did not run yet!
    previewImgPath: string,
    addedTimestamp: number,
    modifiedTimestamp: number
}>
