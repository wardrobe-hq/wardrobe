/*
 * File: utils.ts
 * Project: wardrobe
 * Created Date: 2026-01-20 23:12:01
 * Author: 3urobeat
 *
 * Last Modified: 2026-01-20 23:12:01
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */



/**
 * Rounds a number with x decimals
 * @param value Number to round
 * @param decimals Amount of decimals
 * @returns Rounded number
 */
export function round(value: number, decimals: number): number {
    return Number((value).toFixed(decimals)); // Number(Math.round(value+"e"+decimals)+"e-"+decimals);
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
