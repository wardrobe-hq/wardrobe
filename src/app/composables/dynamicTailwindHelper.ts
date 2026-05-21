/*
 * File: dynamicTailwindHelper.ts
 * Project: wardrobe
 * Created Date: 2026-02-04 16:37:18
 * Author: 3urobeat
 *
 * Last Modified: 2026-03-25 21:12:42
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// Tailwind does not support dynamic classes:
// https://vue-land.github.io/faq/missing-tailwind-classes
// https://tailwindcss.com/docs/detecting-classes-in-source-files#how-classes-are-detected
// This helper attempts to bridge the gap


const itemsGridSizes = [
    {
        grid: "grid-cols-[repeat(auto-fill,minmax(82px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]",
        card: "h-26 md:h-42 p-2"
    },
    {
        grid: "grid-cols-[repeat(auto-fill,minmax(98px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]",
        card: "h-32 md:h-58 p-2"
    },
    {
        grid: "grid-cols-[repeat(auto-fill,minmax(114px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(254px,1fr))]",
        card: "h-36 md:h-66 p-4"
    },
    {
        grid: "grid-cols-[repeat(auto-fill,minmax(132px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(278px,1fr))]",
        card: "h-40 md:h-74 p-4"
    },
    {
        grid: "grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(294px,1fr))]",
        card: "h-44 md:h-86 p-4"
    },
    {
        grid: "grid-cols-[repeat(auto-fill,minmax(178px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]",
        card: "h-48 md:h-90 p-4"
    },
    {
        grid: "grid-cols-[repeat(auto-fill,minmax(195px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(380px,1fr))]",
        card: "h-50 md:h-100 p-6"
    },
    {
        grid: "grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))]",
        card: "h-62 md:h-110 p-6"
    },
    {
        grid: "grid-cols-[repeat(auto-fill,minmax(250px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(450px,1fr))]",
        card: "h-82 md:h-130 p-8"
    },
    {
        grid: "grid-cols-[repeat(auto-fill,minmax(440px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(500px,1fr))]",
        card: "h-132 md:h-152 p-8"
    },
];
// TODO: Link array length to type in storage.ts

/**
 * Takes a selected scaling value for an items grid card and returns tailwind classes
 * @param scaling Number 0-10
 * @returns Tailwind classes for desktop & mobile
 */
export function itemsGridScalingToTailwind(scaling: number): string {
    if (scaling < 0 || scaling > 9) {
        throw new Error("Invalid scaling value");
    }

    return itemsGridSizes[scaling]!.grid;
}

/**
 * Takes a selected scaling value for an items grid card and returns tailwind classes
 * @param scaling Number 0-10
 * @returns Tailwind classes for desktop & mobile
 */
export function itemsGridCardScalingToTailwind(scaling: number): string {
    if (scaling < 0 || scaling > 9) {
        throw new Error("Invalid scaling value");
    }

    return itemsGridSizes[scaling]!.card;
}
