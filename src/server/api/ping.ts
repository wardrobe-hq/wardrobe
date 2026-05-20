/*
 * File: ping.ts
 * Project: wardrobe
 * Created Date: 2026-05-19 21:53:24
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-19 21:56:59
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { ApiResponse } from "~/model/api";


/**
 * This API route may be used as a server alive check
 * Params:
 * Returns:
 */


export default defineEventHandler(async (event): Promise<ApiResponse<void>> => {
    return await getApiResponse<void>(async () => {}, event);
});
