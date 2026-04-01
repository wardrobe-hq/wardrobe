/*
 * File: unitConversion.ts
 * Project: wardrobe
 * Created Date: 2026-03-04 10:39:01
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 19:04:42
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


/*
    Implements Vue frontend interaction with model/unit.ts with automatic conversion based on user settings
*/


import type { ServerSettings } from "~/model/storage";
import { temperatureUnitToString, tempKelvinTo, UnitStrMap, Unit, type TemperatureKelvin } from "~/model/unit";


const useSet = (): Ref<ServerSettings> => getServerSettingsFromServer();


/**
 * Gets configured temp unit from settings
 * @returns Returns configured temp unit type
 */
export function getConfTempUnit(): Unit {
    return useSet().value.temperatureUnit;
}

/**
 * Gets string of configured temp unit from settings
 * @returns Returns configured temp unit string
 */
export function getConfTempUnitStr(): string {
    return UnitStrMap[getConfTempUnit()];
}

/**
 * Converts temperature to human readable string with unit from settings
 * @param value Value to display
 * @param rounded Optional: Should value be rounded
 * @returns Returns string in "value unit" format
 */
export function confTempToStr(value: TemperatureKelvin, rounded?: boolean): string {
    const unit = getConfTempUnit();
    return temperatureUnitToString(tempKelvinTo(value, unit)!, unit, rounded);
}




/*
    Localization stuff for time utils
*/


/**
 * Stupid wrapper for formatTime to return localized string
 * @param time Timestamp to format
 */
export function formatTimeLocalized(time: number) {
    return formatTime(time)
        .replace("seconds", useI18n().t("seconds"))
        .replace("minutes", useI18n().t("minutes"))
        .replace("hours", useI18n().t("hours"))
        .replace("days", useI18n().t("days"));
}


/**
 * Formats time to x hours ago if <24 hours, otherwise formats to ISO8601
 * @param timestamp The timestamp to convert
 * @param alwaysShowTimestamp Optional: Controls whether to always/never show the ISO8601 timestamp, even if <24h ago
 * @returns Formatted time, either in "x hours" or ISO8601 format
 */
export function formatTimestamp(timestamp: number, alwaysShowTimestamp?: "always" | "never") {
    let until = Math.abs((Date.now() - timestamp) / 1000);
    let untilUnit = useI18n().t("seconds");

    if (until < 86400 && (!alwaysShowTimestamp || alwaysShowTimestamp == "never")) { // 24h in sec
        if (until > 60) {
            until = until / 60; untilUnit = useI18n().t("minutes");

            if (until > 60) {
                until = until / 60; untilUnit = useI18n().t("hours");
            }
        }

        return `${Math.round(until)} ${untilUnit}`;
    } else {
        const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

        return ((new Date(timestamp - timezoneOffset)).toISOString().replace(/T/, " ").replace(/\..+/, ""));
    }
}
