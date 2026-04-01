/*
 * File: get-registered-jobs-info.ts
 * Project: wardrobe
 * Created Date: 2025-12-31 13:03:12
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:42:14
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { ApiResponse } from "~/model/api";
import { getRegisteredJobs } from "../plugins/jobs";
import type { JobInfo } from "~/model/job";


/**
 * This API route gets metadata of all registered jobs
 * Params:
 * Returns: JobInfo[]
 */


// This function is executed when this API route is called
export default defineEventHandler(async (event): Promise<ApiResponse<JobInfo[]>> => {

    console.debug(getApiLogPrefix(event), "Received request...");

    // Ask job manager what's going on and remove functions from result as they can't be passed anyway
    return await getApiResponse<JobInfo[]>(async () => getRegisteredJobs().map((e) => e.info));

});
