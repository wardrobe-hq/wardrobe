/*
 * File: unit.ts
 * Project: wardrobe
 * Created Date: 2026-03-01 22:01:20
 * Author: 3urobeat
 *
 * Last Modified: 2026-03-22 00:26:27
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// Supported unit types
export enum UnitType {
    TEMPERATURE = 0
}

// Supported units
export enum Unit {
    KELVIN = 0,
    CELSIUS = 1,
    FAHRENHEIT = 2
}

// Provides mappings of units to human readable format
export const UnitStrMap = {
    [Unit.KELVIN]: "K",
    [Unit.CELSIUS]: "°C",
    [Unit.FAHRENHEIT]: "°F"
} as const;

export type TemperatureKelvin = number; // I added this type alias to make raw incoming data (e.g. in WeatherData) more descriptive


/**
 * Convert value from base unit. If value is null or NaN, null will be returned
 * @param value
 * @param toUnit
 * @returns Value converted to toUnit
 */
export function tempKelvinTo(value: TemperatureKelvin | null, toUnit: Unit): number | null {
    if (value == null || isNaN(value)) {
        return null;
    }

    switch (toUnit) {
        case Unit.KELVIN:
            break; // Raw value is already kelvin
        case Unit.CELSIUS:
            value -= 273.15;
            break;
        case Unit.FAHRENHEIT:
            value = ((value - 273.15) * 1.8) + 32;
            break;
        default:
            throw("Unsupported unit");
    }

    return round(value, 2); // Round to two decimal places
}
// In the past I used an object to bind unit and value together which was kinda cool but it caused a lot of "overhead"


/**
 * Convert value to base unit. If value is null or NaN, null will be returned
 * @param value
 * @param fromUnit
 * @returns Value converted to base unit
 */
export function tempToKelvin(value: number | null, fromUnit: Unit): TemperatureKelvin | null {
    if (value == null || isNaN(value)) {
        return null;
    }

    switch (fromUnit) {
        case Unit.KELVIN:
            break; // Raw value is already kelvin
        case Unit.CELSIUS:
            value += 273.15;
            break;
        case Unit.FAHRENHEIT:
            value = ((value - 32) / 1.8) + 273.15;
            break;
        default:
            throw("Unsupported unit");
    }

    return round(value, 2); // Round to two decimal places
}


/**
 * Converts temperature unit data to human readable string
 * @param value Value to display
 * @param unit Unit to display
 * @param round Optional: Should value be rounded
 * @returns Returns string in "value unit" format
 */
export function temperatureUnitToString(value: TemperatureKelvin, unit: Unit, round?: boolean): string {
    return `${round ? Math.round(value) : value} ${UnitStrMap[unit]}`;
}
