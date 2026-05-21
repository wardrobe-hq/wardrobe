/*
 * File: useLabelsDb.ts
 * Project: wardrobe
 * Created Date: 2025-12-06 17:28:44
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-20 23:14:03
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import nedb from "@seald-io/nedb";


// Load database
const labelsDb          = new nedb({ filename: "data/database/labels.db", autoload: true });
const labelCategoriesDb = new nedb({ filename: "data/database/label-categories.db", autoload: true });

// Internal: Access Database instance directly
// export const _useLabelsDb = () => labelsDb;
// Internal: Access Database instance directly
// export const _useLabelCategoriesDb = () => labelCategoriesDb;

/**
 * Internal: Migrates DB if necessary and updates DatabaseMetaItem
 * @param toVersion Wardrobe Version to migrate to
 */
export async function _migrateLabelsDb(toVersion: string) {

    // Get current record
    const curItem = await labelsDb.findOneAsync({ id: defaultDatabaseMetaItem.id }) as unknown as DatabaseMetaItem | null;
    console.debug(`[DEBUG] Labels Database Meta - Created in '${curItem?.dbCreatedVersion}', last loaded in '${curItem?.dbVersion}'. Updating version to '${toVersion}'...`);

    // Apply any necessary dbCreatedVersion -> toVersion migration
    // ...

    // Update (or create) record
    const newItem: DatabaseMetaItem = curItem || defaultDatabaseMetaItem;
    if (!newItem.dbCreatedVersion) {
        newItem.dbCreatedVersion = toVersion;
    }
    newItem.dbVersion = toVersion;
    updateDatabaseItemMetadata(newItem);

    await labelsDb.updateAsync({ id: defaultDatabaseMetaItem.id }, { $set: newItem }, { upsert: true });

}

/**
 * Internal: Migrates DB if necessary and updates DatabaseMetaItem
 * @param toVersion Wardrobe Version to migrate to
 */
export async function _migrateLabelCategoriesDb(toVersion: string) {

    // Get current record
    const curItem = await labelCategoriesDb.findOneAsync({ id: defaultDatabaseMetaItem.id }) as unknown as DatabaseMetaItem | null;
    console.debug(`[DEBUG] Label Categories Database Meta - Created in '${curItem?.dbCreatedVersion}', last loaded in '${curItem?.dbVersion}'. Updating version to '${toVersion}'...`);

    // Apply any necessary dbCreatedVersion -> toVersion migration
    // ...

    // Update (or create) record
    const newItem: DatabaseMetaItem = curItem || defaultDatabaseMetaItem;
    if (!newItem.dbCreatedVersion) {
        newItem.dbCreatedVersion = toVersion;
    }
    newItem.dbVersion = toVersion;
    updateDatabaseItemMetadata(newItem);

    await labelCategoriesDb.updateAsync({ id: defaultDatabaseMetaItem.id }, { $set: newItem }, { upsert: true });

}


/**
 * Inserts new or updates existing label
 * @throws Throws Exception on failure
 * @param label Label to upsert. Leave id field empty to insert new label
 * @param originClientId Optional: ID of client making request
 * @param dontEmitStorageEvent Optional: Bypass emitting storage subscription event, for example when doing mass upserts
 * @returns Returns affected document
 */
async function upsertLabel(label: Label, originClientId?: string, dontEmitStorageEvent?: boolean): Promise<Label | null> {

    // Generate identifier for new label, otherwise run conflict check
    if (!label.id) {
        label.id = crypto.randomUUID();
    } else {
        await checkStorageLockMatch(label, labelsDb);
    }

    // Update metadata
    updateDatabaseItemMetadata(label);

    const res      = await labelsDb.updateAsync({ id: label.id }, { $set: label }, { upsert: true, returnUpdatedDocs: true });
    const affected = res.affectedDocuments ? res.affectedDocuments as unknown as Label : null;

    if (!dontEmitStorageEvent && affected) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.UPSERT,
            storage: StorageKind.LABELS,
            newData: [affected]
        }, originClientId);
    }

    return affected;

}

/**
 * Inserts new or updates existing labels
 * @throws Throws Exception on failure
 * @param labels Labels to upsert. Leave id field of new labels empty
 * @param originClientId Optional: ID of client making request
 * @returns Returns affected documents
 */
export async function upsertLabels(labels: Label[], originClientId?: string): Promise<Label[]> {

    // Call upsertLabel for every label and await all resulting promises
    const affected = (await Promise.all(labels.map((e) => upsertLabel(e, originClientId, true))))
        .filter((e) => e != null);

    if (affected.length > 0) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.UPSERT,
            storage: StorageKind.LABELS,
            newData: affected
        }, originClientId);
    }

    return affected;

}

/**
 * Removes label
 * @throws Throws Exception on failure
 * @param labelID Label ID to remove
 * @param originClientId Optional: ID of client making request
 * @param dontEmitStorageEvent Optional: Bypass emitting storage subscription event, for example when doing mass upserts
 * @returns Returns affected document
 */
async function deleteLabel(labelID: ItemID, originClientId?: string, dontEmitStorageEvent?: boolean): Promise<DeletedItem> {

    await labelsDb.removeAsync({ id: labelID }, {});

    if (!dontEmitStorageEvent) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.DELETE,
            storage: StorageKind.LABELS,
            newData: [{ id: labelID }]
        }, originClientId);
    }

    return { id: labelID };

}

/**
 * Removes list of labels
 * @throws Throws Exception on failure
 * @param labelIDs Labels to remove
 * @param originClientId Optional: ID of client making request
 * @returns Returns affected documents
 */
export async function deleteLabels(labelIDs: ItemID[], originClientId?: string): Promise<DeletedItem[]> {

    // Call deleteLabel for every label and await all resulting promises
    const affected = await Promise.all(labelIDs.map((e) => deleteLabel(e, originClientId, true)));

    if (affected.length > 0) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.DELETE,
            storage: StorageKind.LABELS,
            newData: affected
        }, originClientId);
    }

    return affected;

}

/**
 * Retrieves all labels from the database
 * @returns Returns an array of all matching labels
 */
export async function getAllLabels(): Promise<Label[]> {
    return await labelsDb.findAsync({ id: NEDB_META_ITEM_FILTER });
}



/**
 * Inserts new or updates existing category
 * @throws Throws Exception on failure
 * @param category Category to upsert. Leave id field empty to insert new category
 * @param originClientId Optional: ID of client making request
 * @param dontEmitStorageEvent Optional: Bypass emitting storage subscription event, for example when doing mass upserts
 * @returns Returns affected document
 */
async function upsertLabelCategory(category: Category, originClientId?: string, dontEmitStorageEvent?: boolean): Promise<Category | null> {

    // Generate identifier for new category, otherwise run conflict check
    if (!category.id) {
        category.id = crypto.randomUUID();
    } else {
        await checkStorageLockMatch(category, labelCategoriesDb);
    }

    // Update metadata
    updateDatabaseItemMetadata(category);

    const res      = await labelCategoriesDb.updateAsync({ id: category.id }, { $set: category }, { upsert: true, returnUpdatedDocs: true });
    const affected = res.affectedDocuments ? res.affectedDocuments as unknown as Category : null;

    if (!dontEmitStorageEvent && affected) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.UPSERT,
            storage: StorageKind.LABEL_CATEGORIES,
            newData: [affected]
        }, originClientId);
    }

    return affected;

}

/**
 * Inserts new or updates existing categories
 * @throws Throws Exception on failure
 * @param categories Categories to upsert. Leave id field of new categories empty
 * @param originClientId Optional: ID of client making request
 * @returns Returns affected documents
 */
export async function upsertLabelCategories(categories: Category[], originClientId?: string): Promise<Category[]> {

    // Call upsertLabelCategory for every category and await all resulting promises
    const affected = (await Promise.all(categories.map((e) => upsertLabelCategory(e, originClientId, true))))
        .filter((e) => e != null);

    if (affected.length > 0) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.UPSERT,
            storage: StorageKind.LABEL_CATEGORIES,
            newData: affected
        }, originClientId);
    }

    return affected;

}

/**
 * Removes category
 * @throws Throws Exception on failure
 * @param categoryID Category ID to remove
 * @param originClientId Optional: ID of client making request
 * @param dontEmitStorageEvent Optional: Bypass emitting storage subscription event, for example when doing mass upserts
 * @returns Returns affected document
 */
async function deleteLabelCategory(categoryID: ItemID, originClientId?: string, dontEmitStorageEvent?: boolean): Promise<DeletedItem> {

    await labelCategoriesDb.removeAsync({ id: categoryID }, {});

    if (!dontEmitStorageEvent) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.DELETE,
            storage: StorageKind.LABEL_CATEGORIES,
            newData: [{ id: categoryID }]
        }, originClientId);
    }

    // TODO: Delete labels referencing this category, currently only done by dataCleanup, right?

    return { id: categoryID };

}

/**
 * Removes list of categories
 * @throws Throws Exception on failure
 * @param categoryIDs Labels to remove
 * @param originClientId Optional: ID of client making request
 * @returns Returns affected documents
 */
export async function deleteLabelCategories(categoryIDs: ItemID[], originClientId?: string): Promise<DeletedItem[]> {

    // Call deleteLabelCategory for every category and await all resulting promises
    const affected = (await Promise.all(categoryIDs.map((e) => deleteLabelCategory(e, originClientId, true))))
        .filter((e) => e != null);

    if (affected.length > 0) {
        sendStorageSubscriptionEvent({              // Notify registered clients
            action: SubscriptionEventAction.DELETE,
            storage: StorageKind.LABEL_CATEGORIES,
            newData: affected
        }, originClientId);
    }

    return affected;

}

/**
 * Retrieves all labels from the database
 * @returns Returns an array of all matching labels
 */
export async function getAllLabelCategories(): Promise<Category[]> {
    return await labelCategoriesDb.findAsync({ id: NEDB_META_ITEM_FILTER });
}
