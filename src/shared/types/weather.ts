/*
 * File: weather.ts
 * Project: wardrobe
 * Created Date: 2026-02-12 17:57:36
 * Author: 3urobeat
 *
 * Last Modified: 2026-03-09 19:02:39
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// https://openweathermap.org/weather-conditions
export enum WeatherConditionGroupID {
    "Thunderstorm" = 2,
    "Drizzle" =      3,
    "Rain" =         5,
    "Snow" =         6,
    "Fog" =          7,
    "Clear" =        8,
    "Clouds" =       81
}


/**
 * Converts openweathermap weather ID to WeatherConditionGroupID
 * @param val Value to convert
 */
export function weatherIdToCondition(val: number): WeatherConditionGroupID {
    if (!val || val < WeatherConditionGroupID.Thunderstorm * 100 || val > WeatherConditionGroupID.Clouds * 100) {
        throw("Invalid val");
    }

    if (val > 800 && val < 900) { // Special case
        return WeatherConditionGroupID.Clouds;
    }

    return Math.trunc(val / 100);
}
// TODO: This sucks and can probably be realised directly in TS types but I don't know how right now


// https://openweathermap.org/current?collection=current_forecast
export type WeatherData = {
    coord: {
        lon: number
        lat: number
    },
    weather: {
        id: number,
        main: string,
        description: string,
        icon: string
    }[],
    base: string,
    main: {
        temp: TemperatureKelvin,
        feels_like: TemperatureKelvin,
        temp_min: TemperatureKelvin,
        temp_max: TemperatureKelvin,
        pressure: number,
        humidity: number,
        sea_level: number,
        grnd_level: number
    },
    visibility: number,
    wind: {
        speed: number,
        deg: number,
        gust: number
    },
    rain?: {
        "1h"?: number
    },
    snow?: {
        "1h"?: number
    },
    clouds: {
        all: number
    },
    dt: number,
    sys: {
        type: number,
        id: number,
        country: string,
        sunrise: number,
        sunset: number
    },
    timezone: number,
    id: number,
    name: string,
    cod: number
}
