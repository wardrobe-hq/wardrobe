/*
 * File: set-labels.ts
 * Project: wardrobe
 * Created Date: 2025-12-08 17:43:05
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-18 20:44:30
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { ApiResponse, DeletedItem } from "~/model/api";
import type { Label } from "~/model/label";
import type { Category } from "~/model/label-category";
import { upsertLabelCategories, upsertLabels } from "~/server/utils/storage/useLabelsDb";


export type SET_LABELS_API_RETURN = { updatedLabels: Label[], deletedLabels: DeletedItem[], updatedCategories: Category[], deletedCategories: DeletedItem[] };

/**
 * This API route upserts/removes labels and label categories
 * Params: { updatedLabels?: Label[], deletedLabels?: Label[], updatedCategories?: Category[], deletedCategories?: Category[] }
 * Returns: { updatedLabels: Label[], deletedLabels: DeletedItem[], updatedCategories: Category[], deletedCategories: DeletedItem[] }
 */


// This function is executed when this API route is called
export default defineEventHandler(async (event): Promise<ApiResponse<SET_LABELS_API_RETURN>> => {

    // Read body of the request we received
    const params = await readBody(event);

    if (!params || (!params.updatedLabels && !params.deletedLabels && !params.updatedCategories && !params.deletedCategories)) {
        throw createError({
            statusCode: 400,
            statusMessage: "No labels or categories to set!",
        });
    }

    const updatedCategories: Category[] = params.updatedCategories;
    const deletedCategories: Category[] = params.deletedCategories;
    const updatedLabels:     Label[]    = params.updatedLabels;
    const deletedLabels:     Label[]    = params.deletedLabels;

    console.debug(getApiLogPrefix(event), "Received request for:", "\n updatedCategories:\n", updatedCategories, "\n deletedLabels:\n", deletedLabels, "\n updatedLabels:\n", updatedLabels, "\n deletedCategories:\n", deletedCategories);

    // Write to DB
    return await getApiResponse<SET_LABELS_API_RETURN>(async () => {
        const clientUUID = getCookie(event, "wardrobe_clientId");
        const response: SET_LABELS_API_RETURN = { updatedLabels: [], deletedLabels: [], updatedCategories: [], deletedCategories: [] };

        if (updatedCategories) response.updatedCategories = await upsertLabelCategories(updatedCategories, clientUUID);
        if (updatedLabels)     response.updatedLabels     = await upsertLabels(updatedLabels, clientUUID);
        if (deletedLabels)     response.deletedLabels     = await deleteLabels(deletedLabels.flatMap((e) => e.id), clientUUID);
        if (deletedCategories) response.deletedCategories = await deleteLabelCategories(deletedCategories.flatMap((e) => e.id), clientUUID);

        return response;
    }, event);

});
