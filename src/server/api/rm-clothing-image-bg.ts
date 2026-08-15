/*
 * File: rm-clothing-image-bg.ts
 * Project: wardrobe
 * Created Date: 2026-08-15 18:21:41
 * Author: 3urobeat
 *
 * Last Modified: 2026-08-16 17:14:03
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


/**
 * This API route forwards the image stored at filePath to the rembg container and returns the result
 * Params: { filePath: string }
 * Returns: CachedImage
 *
 * Requires a running rembg server available at the URL set as env var REMBG_URL (see docker-compose.yml)
 */


// This function is executed when this API route is called
export default defineEventHandler(async (event): Promise<ApiResponse<CachedImage>> => {

    // Read body of the request we received
    const params = await readBody(event);

    if (!params || !params.filePath) {
        throw createError({
            statusCode: 400,
            statusMessage: "No file to process!",
        });
    }

    logger.debug(getApiLogPrefix(event), "Received request for: ", params.filePath);

    // Forward image to rembg
    return await getApiResponse<CachedImage>(async () => {

        // Attempt to get file at filePath
        const img = await getImage(params.filePath);

        if (!img) {
            throw "No matching image found";
        }

        // Construct request
        const rembgUrl = process.env.REMBG_URL ?? "http://localhost:7000";

        const rembgFormData = new FormData();
        rembgFormData.append("file", base64ToFile(img.toString("base64"), "image.png", "image/png"));

        // Currently not needed but we could overwrite the u2net model used by rembg by default
        /* if (params.model) {
            rembgFormData.append("model", params.model);
        } */

        // Send request to rembg
        const remBgRes = await fetch(`${rembgUrl}/api/remove`, {
            method: "POST",
            body: rembgFormData
        });

        if (!remBgRes.ok) {
            throw `Rembg service returned status ${remBgRes.status}: ${remBgRes.statusText}`;
        }

        // Save and return result
        const imgRes     = Buffer.from(await remBgRes.arrayBuffer()); // uhh
        const clientUUID = getCookie(event, "wardrobe_clientId");
        const filePath   = await saveImage(imgCategory.clothing, imgRes, clientUUID); // Type clothing is hard coded since this route is (currently) exclusively meant for clothes

        const res: CachedImage = {
            id: filePath,
            imgBlob: imgRes.toBase64(),
            imgWidth: undefined
        };

        return res;
    }, event);

});
