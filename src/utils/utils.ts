/*
 * File: utils.ts
 * Project: wardrobe
 * Created Date: 2026-01-23 22:00:18
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:33:00
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import type { ApiResponse } from "~/model/api";
import type { ServerSettings } from "~/model/storage";
import type { WeatherData } from "~/model/weather";


/**
 * Helper function to query generate-uuid API route
 * @returns UUID
 */
export async function getUUIDFromServer(): Promise<string> {
    const res = await fetch("/api/generate-uuid");
    const resBody: ApiResponse<string> = await res?.json();
    return resBody.document!;
}


/**
 * Attempts to geolocate client
 * @throws Throws exception on failure
 * @returns Returns array containing [ lat, lon ] on success
 */
export async function geolocateClient(): Promise<[ lat: number, lon: number ]> {

    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error("Browser does not support geolocation!"));
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => resolve([ pos.coords.latitude, pos.coords.longitude ]),
            (err) => reject(err.message || "Unknown Error"),
            { timeout: 10000 }
        );
    });

}


/**
 * Helper function to query get-weather API route
 * @returns Object containing error message and weather data
 */
export async function getWeatherFromServer() {

    // Get settings
    const storedServerSettings: Ref<ServerSettings> = getServerSettingsFromServer();

    const response: { error: string | null, errorMsg: any, weather: WeatherData | null } = {
        error: null,
        errorMsg: null,
        weather: null
    };


    // Get lat/lon from geolocation API or from settings
    let lat;
    let lon;

    if (storedServerSettings.value.location.useGeolocation) {
        [ lat, lon ] = await geolocateClient()
            .catch((err) => {
                response.error = "weatherGeolocationFail";
                response.errorMsg = { errorText: err };
                return [ undefined, undefined ];
            });
    } else {
        lat = storedServerSettings.value.location.lat;
        lon = storedServerSettings.value.location.lon;

        if (lat == undefined || lon == undefined) {
            response.error = "weatherGeolocationDisabledNoLatLonSet";
        }
    }


    // Use lat/lon to get weather
    if (lat != undefined && lon != undefined) {
        const res = await fetch("/api/get-weather", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                lat: lat,
                lon: lon
            })
        });

        const resBody: ApiResponse<WeatherData> = await res?.json();

        if (res.ok) {
            response.weather = resBody.document;
        } else {
            response.error = resBody.message;
        }
    }


    // Return result
    return response;

}


/**
 * Rounds a number with x decimals
 * @param value Number to round
 * @param decimals Amount of decimals
 * @returns Rounded number
 */
export function round(value: number, decimals: number): number {
    return Number(Math.round(value+"e"+decimals)+"e-"+decimals);
}


/**
 * Formats ms value to human readable value
 * @param time Number in milliseconds to convert
 * @returns Formatted time as e.g. "x hours"
 */
export function formatTime(time: number) {
    let until = time / 1000;
    let untilUnit = "seconds";

    if (until > 60) {
        until = until / 60;
        untilUnit = "minutes";

        if (until > 60) {
            until = until / 60;
            untilUnit = "hours";

            if (until > 24) {
                until = until / 24;
                untilUnit = "days";
            }
        }
    }

    return `${Math.round(until)} ${untilUnit}`;
}


// Year used for dates where year is being ignored (I swear this makes sense)
export const YEARLESS_DATE_YEAR = 2024; // Use a lap year so Feb 29 is always an option

/**
 * Inits a yearless and timeless date object from a timestamp
 * @param timestamp Optional: Timestamp to parse. If undefined, current time is used
 * @returns Returns constructed Date object
 */
export function initYearlessDate(timestamp?: number): Date {
    const date = timestamp != undefined ? new Date(timestamp) : new Date();

    date.setUTCFullYear(YEARLESS_DATE_YEAR);
    date.setUTCHours(0, 0, 0, 0); // Intentionally not using UTC here to remove timezone

    return date;
}

/**
 * Is current timestamp between (<= & >=) from & to while ignoring year?
 * @param from From: If greater than to, the previous year will be used internally
 * @param to ...
 * @returns Boolean indicating whether now is between from & to
 */
export function isNowBetweenDatesIgnoringYear(from: number, to: number): boolean {

    // Parse dates and bring them all onto the same year to effectively ignore it
    const fromDate = initYearlessDate(from);
    const toDate   = initYearlessDate(to);
    const nowDate  = initYearlessDate();

    // Handle special case where from > to
    fromDate.setUTCFullYear(YEARLESS_DATE_YEAR - (from > to ? 1 : 0));

    // console.debug("[DEBUG] isNowBetweenDatesIgnoringYear: ", fromDate, toDate, nowDate);

    return (fromDate.getTime() <= nowDate.getTime()) && (toDate.getTime() >= nowDate.getTime());

}
