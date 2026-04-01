/*
 * File: set-clothing.ts
 * Project: wardrobe
 * Created Date: 2025-12-07 18:39:22
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:30:36
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { ApiResponse } from "~/model/api";
import { Clothing } from "~/model/item";
import { upsertClothing } from "~/server/utils/useClothesDb";


/**
 * This API route inserts/updates a piece of clothing
 * Params: { clothing: Clothing }
 * Returns: Clothing | null
 */


// This function is executed when this API route is called
export default defineEventHandler(async (event): Promise<ApiResponse<Clothing>> => {

    // Read body of the request we received
    const params = await readBody(event);

    if (!params || !params.clothing) {
        throw createError({
            statusCode: 400,
            statusMessage: "No clothing data to set!",
        });
    }

    console.debug(getApiLogPrefix(event), "Received request for: ", params.clothing);

    // Ask db helper to upsert entry
    return await getApiResponse<Clothing>(() => upsertClothing(params.clothing));

});
