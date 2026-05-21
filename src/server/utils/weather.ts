/*
 * File: weather.ts
 * Project: wardrobe
 * Created Date: 2026-02-12 17:29:48
 * Author: 3urobeat
 *
 * Last Modified: 2026-03-15 19:40:03
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


let weatherCache: WeatherData[] = [];


/**
 * Gets current weather data from API
 * @throws Throws rejection if function was unable to get current weather
 * @param lat
 * @param lon
 * @returns Current weather data from API
 */
async function getCurrentWeatherFromApi(lat: number, lon: number): Promise<WeatherData> {
    if (lat == undefined || lon == undefined) {
        throw("Parameters lat and lon are required");
    }

    const token = (await getServerSettings()).weatherApiKey;

    if (!token) {
        throw("weatherNoApiKeySet"); // Gets replaced in front end by i18n
    }

    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${token}`, {
        method: "GET"
    });

    const resBody = await res.json();

    if (res.status != 200 || resBody.cod != 200) {
        throw(" " + (resBody.message || "Unknown Error"));
    }

    return resBody;

}


/**
 * Gets current weather for a location, either from cache or from API
 * @throws Throws exception if function was unable to get any weather
 * @param lat
 * @param lon
 * @returns Returns weather data that is less than 2 hours old and in the range of ~11 km from provided position
 */
export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
    if (lat == undefined || lon == undefined) {
        throw("Parameters lat and lon are required");
    }

    // Attempt to find recent entry (1 hour) in cache with precision of one decimal place; should be around 10km: https://en.wikipedia.org/wiki/Decimal_degrees#Precision
    const rounded = (num: number) => Math.round(num * 10) / 10;
    const recent  = 60 * 60 * 1;

    // Iterate over entire cache to find relevant element and clean it at the same time
    let cachedRes;

    weatherCache = weatherCache.filter((e) => {
        if (e.dt > (Date.now() / 1000) - recent) {
            if (rounded(e.coord.lat) == rounded(lat) && rounded(e.coord.lon) == rounded(lon)) {
                cachedRes = e;
                console.debug(`[DEBUG] Found cached weather for '${lat}, ${lon}'...`);
            }
            return true;
        }
        return false;
    });

    // Ask API if no cached element was found
    if (!cachedRes) {
        console.debug(`[DEBUG] Requesting current weather for '${lat}, ${lon}' from API...`);

        const apiRes = await getCurrentWeatherFromApi(lat, lon); // Let exception fall through

        // Add result to cache
        weatherCache.push(apiRes);

        console.debug("[DEBUG] Success, added response to cache.");

        return apiRes;
    }

    return cachedRes;
}
