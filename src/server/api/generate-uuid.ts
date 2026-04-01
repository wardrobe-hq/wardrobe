/*
 * File: generate-uuid.ts
 * Project: wardrobe
 * Created Date: 2026-01-23 21:48:30
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:30:02
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { randomUUID } from "crypto";
import { ApiResponse } from "~/model/api";


/**
 * This API route generates a new UUID server sided
 * Params:
 * Returns: string
 */


// This function is executed when this API route is called
export default defineEventHandler(async (): Promise<ApiResponse<string>> => {

    return await getApiResponse<string>(async () => randomUUID());

});
