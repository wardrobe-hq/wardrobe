/*
 * File: rm-clothing.ts
 * Project: wardrobe
 * Created Date: 2025-12-27 10:07:47
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-23 13:06:42
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


/**
 * This API route deletes a piece of clothing
 * Params: { id: ItemID }
 * Returns:
 */


// This function is executed when this API route is called
export default defineEventHandler(async (event): Promise<ApiResponse<void>> => {

    // Read body of the request we received
    const params = await readBody(event);

    if (!params || !params.id) {
        throw createError({
            statusCode: 400,
            statusMessage: "ID parameter is required",
        });
    }

    logger.debug(getApiLogPrefix(event), "Received request for: ", params.id);

    // Ask db helper to delete entry
    return await getApiResponse<void>(() => {
        const clientUUID = getCookie(event, "wardrobe_clientId");
        return deleteClothing(params.id, clientUUID);
    }, event);

});
