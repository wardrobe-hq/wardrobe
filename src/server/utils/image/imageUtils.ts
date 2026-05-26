/*
 * File: imageUtils.ts
 * Project: wardrobe
 * Created Date: 2026-05-26 18:32:39
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-26 18:34:04
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import sharp from "sharp";


/**
 * Scales an image
 * @param img Image buffer to scale
 * @param width Width to scale to. Height is determined automatically to keep aspect ratio
 * @param onlyDownscale Optional: Set to true to leave img unmodified if its width is already < width parameter
 * @returns Returns scaled image buffer
 */
export async function scaleImage(img: Buffer<ArrayBufferLike>, width: number, onlyDownscale?: boolean): Promise<Buffer<ArrayBufferLike>> {
    // Scales and keeps aspect ratio
    return (await sharp(img)
        .resize(width, null, { withoutEnlargement: onlyDownscale })
        .toBuffer());
}
