/*
 * File: set-clothing-image.ts
 * Project: wardrobe
 * Created Date: 2025-12-06 17:23:26
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:40:15
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { ApiResponse } from "~/model/api";
import { saveImage, imgCategory } from "~/server/utils/useImagesStorage";


/**
 * This API route accepts an image upload for a piece of clothing and returns a file path
 * Params: { type: string, file: MultiPartData }
 * Returns: filePath
 */


// Used guide: https://vueschool.io/articles/vuejs-tutorials/handling-file-uploads-in-nuxt-with-usestorage/


// This function is executed when this API route is called
export default defineEventHandler(async (event): Promise<ApiResponse<{ filePath: string }>> => {

    // Get image from form data
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "No file to upload!",
        });
    }

    const file = formData[0];

    if (!file) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to extract file from form data!",
        });
    }

    console.debug(getApiLogPrefix(event), "Received request");

    // Validate file size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

    if (file.data.length > MAX_FILE_SIZE) {
        throw createError({
            statusCode: 400,
            statusMessage: `File exceeds maximum size of ${MAX_FILE_SIZE} bytes`
        });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg",  "image/png",  "image/gif"];

    if (!file.type || !allowedTypes.includes(file.type)) {
        throw createError({
            statusCode: 400,
            statusMessage: `File type ${file.type || "unknown"} is not allowed`
        });
    }

    // Save image
    return await getApiResponse<{ filePath: string }>(async () => {
        const filePath = await saveImage(imgCategory.clothing, file.data); // Type clothing is hard coded since this route is (currently) exclusively meant for clothes

        return {
            filePath: filePath
        };
    });

});
