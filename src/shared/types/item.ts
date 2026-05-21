/*
 * File: item.ts
 * Project: wardrobe
 * Created Date: 2025-09-08 15:45:56
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-08 18:51:20
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// Base type for Clothing & Outfit, used by generic components & composables.
export interface WardrobeItem extends DatabaseItem {
    title: string,      // Used for sorting
    labelIDs: ItemID[], // Used as filters/for filtering. IMPORTANT: May reference non-existent labels if dataCleanUp job did not run yet!
}


// Implements WardrobeItem
export interface Clothing extends WardrobeItem {
    description: string,
    imgPath: string,
}


// Implements WardrobeItem
export interface Outfit extends WardrobeItem {
    clothes: { order: number, clothingID: ItemID }[], // IMPORTANT: May reference non-existent clothes if dataCleanUp job did not run yet!
    previewImgPath: string
}
