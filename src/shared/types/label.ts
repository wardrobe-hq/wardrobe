/*
 * File: label.ts
 * Project: wardrobe
 * Created Date: 2025-09-09 21:59:50
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-08 18:51:43
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


/**
 * Implements type definitions and operations on labels
 */


export interface Label extends DatabaseItem {
    name: string,
    orderIndex: number,         // Floating point number
    categoryID: ItemID,         // IMPORTANT: May reference non-existent category if dataCleanUp job did not run yet!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    specialityValue: any        // Arbitrary data submitted for label if selected category speciality calls for it
}

// Extend type using intersection
/* export type LabelWithSpeciality<T extends CategorySpecialityID> = Label & {
    specialityValue: CategorySpecialityLabelValueMap<T> // Arbitrary data submitted for label if selected category speciality calls for it
} */


/**
 * Returns label with correctly initialized specialityValue
 * @param label Label to process
 * @param category Category of this label
 * @returns Returns label with initialized specialityValue
 */
export function getLabelInitialized(label: Label, category: Category): Label {
    if (label.specialityValue === undefined
        || typeof label.specialityValue !== typeof CategorySpecialityMap[category.specialityID].value) {
        label.specialityValue = CategorySpecialityMap[category.specialityID].value;
    }

    return label;
}


/**
 * Helper: Gets a new last orderIndex for (unsorted) list of labels
 * @param list List of labels to analyze
 * @returns {number} New last orderIndex floating point number. If list is empty, 1.0 will be returned.
 */
export function getNewLastLabelOrderIndex(list: Label[]) {
    if (!list || list.length == 0) return 1.0; // Important to use 1.0 to allow labels to be placed infront later on

    // Quickly find the currently greatest orderIndex
    let thisOrderIndex = list[0]!.orderIndex;
    let max = thisOrderIndex;

    for (let i = 1; i < list.length; i++) {
        thisOrderIndex = list[i]!.orderIndex;
        if (thisOrderIndex > max) max = thisOrderIndex;
    }

    // Remove decimals and add 1.0 to get new index
    return Math.trunc(max) + 1.0;
}

/**
 * Helper: Calculates orderIndex to position new element between two existing elements
 * @param el1 Preceding list element. If `undefined`, 0.0 will be used for calculation.
 * @param el2 Succeeding list element. If `undefined`, a new succeeding label order index will be returned.
 * @returns {number} Floating point number half way between el1 & el2
 */
export function getLabelOrderIndexBetween(el1?: Label, el2?: Label) {
    const el1Index = el1 ? el1.orderIndex : 0.0;

    if (!el2) {
        return Math.trunc(el1Index) + 1.0;
    }

    return (el1Index + el2.orderIndex) / 2;
}

/**
 * Helper: Sorts a list of labels by their orderIndex in ascending order
 * @param list List of labels to analyze
 * @returns {Labels[]} Sorted array of labels in ascending order
 */
export function sortLabelsList(list: Label[]) {
    return list.sort((a, b) => a.orderIndex - b.orderIndex);
}
