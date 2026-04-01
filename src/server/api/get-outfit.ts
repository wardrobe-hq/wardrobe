/*
 * File: get-outfit.ts
 * Project: wardrobe
 * Created Date: 2025-09-10 18:51:02
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:42:18
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { ApiResponse } from "~/model/api";
import type { Outfit } from "~/model/item";
import { getOutfit } from "~/server/utils/useOutfitsDb";


/**
 * This API route gets details for a stored clothing and returns them
 * Params: { id: string }
 * Returns: Outfit | null
 */


// This function is executed when this API route is called
export default defineEventHandler(async (event): Promise<ApiResponse<Outfit>> => {

    // Read body of the request we received
    const params = await readBody(event);

    if (!params || params.id === null) {
        throw createError({
            statusCode: 400,
            statusMessage: "ID parameter is required",
        });
    }

    console.debug(getApiLogPrefix(event), `Received request for id '${params.id}'...`);

    // Ask db helper to retrieve item
    return await getApiResponse<Outfit>(async () => {
        const outfit = await getOutfit(params.id);

        return outfit && outfit[0] ? outfit[0] : null;
    });

});
