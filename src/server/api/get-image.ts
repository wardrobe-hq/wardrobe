/*
 * File: get-image.ts
 * Project: wardrobe
 * Created Date: 2025-12-06 18:05:20
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 19:04:51
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { ApiResponse } from "~/model/api";
import type { CachedImage } from "~/model/storage";
import { getImage, scaleImage } from "~/server/utils/useImagesStorage";


/**
 * This API route retrieves an image by file path from storage, optionally scales it and serves it as base64 encoded blob
 * Params: { filePath: string, width?: number }
 * Returns: CachedImage
 */


// This function is executed when this API route is called
export default defineEventHandler(async (event): Promise<ApiResponse<CachedImage>> => {

    // Read body of the request we received
    const params = await readBody(event);

    if (!params || params.filePath === null) {
        throw createError({
            statusCode: 400,
            statusMessage: "filePath parameter is required"
        });
    }

    console.debug(getApiLogPrefix(event), `Received request to retrieve image '${params.filePath}'${params.width ? " scaled to " + params.width + "px wide": ""}...`);

    // Request item // TODO: Image access restricions?
    return await getApiResponse<CachedImage>(async () => {
        let item = await getImage(params.filePath);

        if (!item) {
            throw "No matching image found";
        }

        // Scale item
        if (params.width) {
            item = await scaleImage(item, params.width, true);
        }

        const res: CachedImage = {
            id: params.filePath,
            imgBlob: item.toString("base64"),
            imgWidth: params.width
        };

        return res;
    });

});
