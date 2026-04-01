/*
 * File: get-settings.ts
 * Project: wardrobe
 * Created Date: 2025-09-08 15:44:09
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:41:58
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { ApiResponse } from "~/model/api";
import { getServerSettings } from "../utils/useSettingsDb";
import type { ServerSettings } from "~/model/storage";


/**
 * This API route gets all stored settings and returns them
 * Params:
 * Returns: ServerSettings
 */


// This function is executed when this API route is called
export default defineEventHandler(async (event): Promise<ApiResponse<ServerSettings>> => {

    console.debug(getApiLogPrefix(event), "Received request");

    // Ask db helper for data
    return await getApiResponse<ServerSettings>(getServerSettings);

});
