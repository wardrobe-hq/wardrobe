/*
 * File: useLabelsDb.ts
 * Project: wardrobe
 * Created Date: 2025-12-06 17:28:44
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:32:48
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import nedb from "@seald-io/nedb";
import { SubscriptionEventAction } from "~/model/api";
import type { Label } from "~/model/label";
import type { Category } from "~/model/label-category";
import { StorageKind } from "~/model/storage";


// Load database
const labelsDb          = new nedb({ filename: "data/database/labels.db", autoload: true });
const labelCategoriesDb = new nedb({ filename: "data/database/label-categories.db", autoload: true });


/**
 * Provide function to access Database instance from API
 * @returns Nedb database instance
 */
/* export function useLabelsDb() {
    return labelsDb;
} */


/**
 * Inserts new or updates existing label
 * @throws Throws Exception on failure
 * @param label Label to upsert. Leave id field empty to insert new label
 * @returns
 */
async function upsertLabel(label: Label): Promise<Label | null> {

    // Generate identifier for new label
    if (!label.id) {
        label.id = crypto.randomUUID();
    }

    const res      = await labelsDb.updateAsync({ id: label.id }, { $set: label }, { upsert: true, returnUpdatedDocs: true });
    const affected = res.affectedDocuments ? res.affectedDocuments as unknown as Label : null;

    if (affected) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.UPSERT,
            storage: StorageKind.LABELS,
            newData: affected
        });
    }

    return affected;

}

/**
 * Inserts new or updates existing labels
 * @throws Throws Exception on failure
 * @param labels Labels to upsert. Leave id field of new labels empty
 * @returns
 */
export async function upsertLabels(labels: Label[]): Promise<void> {

    // Call upsertLabel for every label and await all resulting promises
    Promise.all(labels.map((e) => upsertLabel(e)));

}


/**
 * Removes label
 * @throws Throws Exception on failure
 * @param labelID Label ID to remove
 * @returns
 */
async function removeLabel(labelID: string): Promise<void> {

    await labelsDb.removeAsync({ id: labelID }, {});

    sendStorageSubscriptionEvent({              // Notify registered clients
        action: SubscriptionEventAction.DELETE,
        storage: StorageKind.LABELS,
        newData: { id: labelID }
    });

}

/**
 * Removes list of labels
 * @throws Throws Exception on failure
 * @param labelIDs Labels to remove
 * @returns
 */
export async function removeLabels(labelIDs: string[]): Promise<void> {

    // Call removeLabel for every label and await all resulting promises
    await Promise.all(labelIDs.map((e) => removeLabel(e)));

}

/**
 * Retrieves all labels from the database
 * @returns Returns an array of all matching labels
 */
export async function getAllLabels(): Promise<Label[]> {
    return await labelsDb.findAsync({});
}



/**
 * Inserts new or updates existing category
 * @throws Throws Exception on failure
 * @param category Category to upsert. Leave id field empty to insert new category
 * @returns
 */
async function upsertLabelCategory(category: Category): Promise<Category | null> {

    // Generate identifier for new category
    if (!category.id) {
        category.id = crypto.randomUUID();
    }

    const res      = await labelCategoriesDb.updateAsync({ id: category.id }, { $set: category }, { upsert: true, returnUpdatedDocs: true });
    const affected = res.affectedDocuments ? res.affectedDocuments as unknown as Category : null;

    if (affected) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.UPSERT,
            storage: StorageKind.LABEL_CATEGORIES,
            newData: affected
        });
    }

    return affected;

}

/**
 * Inserts new or updates existing categories
 * @throws Throws Exception on failure
 * @param categories Categories to upsert. Leave id field of new categories empty
 * @returns
 */
export async function upsertLabelCategories(categories: Category[]): Promise<void> {

    // Call upsertLabelCategory for every category and await all resulting promises
    await Promise.all(categories.map((e) => upsertLabelCategory(e)));

}

/**
 * Removes category
 * @throws Throws Exception on failure
 * @param categoryID Category ID to remove
 * @returns
 */
async function removeLabelCategory(categoryID: string): Promise<void> {

    await labelCategoriesDb.removeAsync({ id: categoryID }, {});

    sendStorageSubscriptionEvent({              // Notify registered clients
        action: SubscriptionEventAction.DELETE,
        storage: StorageKind.LABEL_CATEGORIES,
        newData: { id: categoryID }
    });

    // TODO: Delete labels referencing this category, currently only done by dataCleanup, right?

}

/**
 * Removes list of categories
 * @throws Throws Exception on failure
 * @param categoryIDs Labels to remove
 * @returns
 */
export async function removeLabelCategories(categoryIDs: string[]): Promise<void> {

    // Call removeLabelCategory for every category and await all resulting promises
    await Promise.all(categoryIDs.map((e) => removeLabelCategory(e)));

}

/**
 * Retrieves all labels from the database
 * @returns Returns an array of all matching labels
 */
export async function getAllLabelCategories(): Promise<Category[]> {
    return await labelCategoriesDb.findAsync({});
}
