/*
 * File: get-all-labels.ts
 * Project: wardrobe
 * Created Date: 2025-09-09 16:43:11
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:42:31
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { ApiResponse } from "~/model/api";
import type { Label } from "~/model/label";
import { getAllLabels } from "~/server/utils/useLabelsDb";


/**
 * This API route gets all stored labels and returns them
 * Params:
 * Returns: Label[]
 */


// This function is executed when this API route is called
export default defineEventHandler(async (event): Promise<ApiResponse<Label[]>> => {

    console.debug(getApiLogPrefix(event), "Received request");

    // Ask db helper to retrieve items
    return await getApiResponse<Label[]>(getAllLabels);

});
