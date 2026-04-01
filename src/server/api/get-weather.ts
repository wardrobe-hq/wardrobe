/*
 * File: get-weather.ts
 * Project: wardrobe
 * Created Date: 2026-02-12 17:29:11
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:30:24
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { WeatherData } from "~/model/weather";
import { getWeather } from "../utils/weather";
import { ApiResponse } from "~/model/api";


/**
 * This API route gets cached or current weather data
 * Params: { lat: number, lon: number }
 * Returns: WeatherData
 */


// This function is executed when this API route is called
export default defineEventHandler(async (event): Promise<ApiResponse<WeatherData>> => {

    // Read body of the request we received
    const params = await readBody(event);

    if (!params || params.lat === null || params.lon === null) {
        throw createError({
            statusCode: 400,
            statusMessage: "lat and lon parameters are required"
        });
    }

    console.debug(getApiLogPrefix(event), `Received request for '${params.lat}, ${params.lon}'`);

    // Get cached or fresh weather
    return await getApiResponse<WeatherData>(() => getWeather(params.lat, params.lon));

});
