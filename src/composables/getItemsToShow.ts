/*
 * File: getItemsToShow.ts
 * Project: wardrobe
 * Created Date: 2025-09-17 17:25:36
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-29 18:44:22
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { Item } from "~/model/item";
import { SortMode } from "~/model/sort-modes";
import { State } from "./state";


/**
 * Returns items to display based on selectedSort & selectedFilters
 * @param storedItems
 * @param selectedSort
 * @param selectedFilters
 */
export default function(storedItems: Item[], selectedSort?: SortMode, selectedFilters?: string[]): Item[] {

    // Get search string ref from app.vue
    const searchStr: Ref<string|null> = useState(State.GLOBAL_SEARCH_STRING);

    // Apply search
    if (searchStr.value != null) {
        storedItems = storedItems.filter((e) => e.title.toLowerCase().includes(searchStr.value!.toLowerCase())); // Hey TS, how can searchStr.value be "possibly null" at this point?
    }

    // Apply filter
    if (selectedFilters && selectedFilters.length > 0) {
        storedItems = storedItems.filter((e) => selectedFilters.every((f) => e.labelIDs.includes(f)));
    }

    // Apply sort to storedItems
    switch (selectedSort) {
        case SortMode.dateDesc:
            storedItems = storedItems.sort((a, b) => b.addedTimestamp - a.addedTimestamp);
            break;

        case SortMode.dateAsc:
            storedItems = storedItems.sort((a, b) => a.addedTimestamp - b.addedTimestamp);
            break;

        case SortMode.nameDesc:
            storedItems = storedItems.sort((a, b) => a.title.charCodeAt(0) - b.title.charCodeAt(0)); /* TODO: Does not sort e.g. "Bc 1" & "Bd 2" */
            break;

        case SortMode.nameAsc:
            storedItems = storedItems.sort((a, b) => b.title.charCodeAt(0) - a.title.charCodeAt(0));
            break;

        default:
            break; // Sorted by ID, invisible to user
    }

    return storedItems;

}
