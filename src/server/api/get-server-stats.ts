/*
 * File: get-server-stats.ts
 * Project: wardrobe
 * Created Date: 2026-03-21 23:35:30
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:42:10
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { ServerStatistics } from "~/model/statistics";
import { getServerStatistics } from "../utils/statistics";
import type { ApiResponse } from "~/model/api";


/**
 * This API route gets server statistics
 * Params:
 * Returns: ServerStatistics
 */


// This function is executed when this API route is called
export default defineEventHandler(async (event): Promise<ApiResponse<ServerStatistics>> => {

    console.debug(getApiLogPrefix(event), "Received request...");

    return await getApiResponse<ServerStatistics>(getServerStatistics);

});
