/*
 * File: diff.ts
 * Project: wardrobe
 * Created Date: 2026-05-04 18:16:50
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-09 22:08:53
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import * as jsondiffpatch from "jsondiffpatch";
import type { DiffContext, Filter } from "jsondiffpatch";


/**
 * Implements JSON diffing using the jsondiffpatch library with a custom instance
 */


// Create a custom "stupid" jsondiffpatch filter that includes the entire changed object when diffing arrays of objects in delta
// This makes it easier for us to query elements (ID is available instead of only index) and inserting diff into the database - https://github.com/benjamine/jsondiffpatch/blob/master/docs/plugins.md
const fullObjectsInArrayDeltaFilter: Filter<DiffContext> = function (context) {
    // Do we care?
    if (context.leftType !== "object" || context.leftIsArray || !context.parent?.leftIsArray) { // We basically only want to use this handler for diffing our labels page (= array of objects)
        return;
    }
    // Are both objects the same?
    if (context.left === context.right || JSON.stringify(context.left) === JSON.stringify(context.right)) {
        context.setResult(undefined).exit();
        return;
    }
    // Different, set both instead of creating a property level diff like the original filter would
    context.setResult([context.left, context.right]).exit();
};
fullObjectsInArrayDeltaFilter.filterName = "fullObjectsInArrayDeltaFilter";


// Create a custom jsondiffpatcher instance matching based on DatabaseItem's ID field - https://github.com/benjamine/jsondiffpatch
const databaseItemDiffPatcher = jsondiffpatch.create({
    objectHash: function (obj: object) { // Can't specify parameter to be DatabaseItem :shrug:
        return (obj as DatabaseItem).id;
    }
});


// Insert our custom filter before the "objects" filter into the diff pipe - https://github.com/benjamine/jsondiffpatch/blob/master/docs/plugins.md
databaseItemDiffPatcher.processor.pipes.diff.before("objects", fullObjectsInArrayDeltaFilter);


/**
 * Calculate the diff between two DatabaseItems or arrays of DatabaseItems based on their ID
 * @param obj1 Item
 * @param obj2 Item to diff against obj1
 */
export function getDiff<T extends DatabaseItem | DatabaseItem[]>(obj1: T, obj2: T): Diff<T> | FullObjectsInArrayDiff<T> {
    return databaseItemDiffPatcher.diff(obj1, obj2);
}


/**
 * Apply a diff to a DatabaseItem or array of DatabaseItems
 * @param obj Item to modify
 * @param diff Diff to apply to obj
 */
export function applyDiff<T extends DatabaseItem | DatabaseItem[]>(obj: T, diff: Diff<T> | FullObjectsInArrayDiff<T>): T {
    return databaseItemDiffPatcher.patch(obj, diff) as T;
}


/**
 * Returns new or modified DatabaseItems from a FullObjectsInArrayDiff
 * Docs: https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md
 * @param diff Diff of obj
 */
export function getUpdatedFromFullObjectsInArrayDiff<T extends DatabaseItem[]>(diff: FullObjectsInArrayDiff<T>): T {
    const res: T = [] as unknown as T;

    // Sanity checks
    if (!diff) return res;                         // No changes
    if ((diff as jsondiffpatch.ArrayDelta)._t !== "a") {
        throw("Diff does not describe an array");  // Property _t tracks diff type, a is array, as mentioned in the docs
    }

    // Traverse diff and extract values. Diff consists of index keys, prefixed with _ if they were deleted
    for (const [key, val] of Object.entries(diff)) {
        if (key == "_t") continue; // Skip diff type prop

        if (!key.startsWith("_")) {
            res.push(val[1] ? val[1] : val[0]); // Diff consists out of [old, new] on update or [new] on insert
        }
    }

    return res;
}


/**
 * Returns deleted DatabaseItems from a FullObjectsInArrayDiff
 * Docs: https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md
 * @param diff Diff of obj
 */
export function getDeletedFromFullObjectsInArrayDiff<T extends DatabaseItem[]>(diff: FullObjectsInArrayDiff<T>): T {
    const res: T = [] as unknown as T;

    // Sanity checks
    if (!diff) return res;                         // No changes
    if ((diff as jsondiffpatch.ArrayDelta)._t !== "a") {
        throw("Diff does not describe an array");  // Property _t tracks diff type, a is array, as mentioned in the docs
    }

    // Traverse diff and extract values. Diff consists of index keys, prefixed with _ if they were deleted
    for (const [key, val] of Object.entries(diff)) {
        if (key == "_t") continue; // Skip diff type prop

        if (key.startsWith("_")) {
            res.push(val[0]);
        }
    }

    return res;
}
