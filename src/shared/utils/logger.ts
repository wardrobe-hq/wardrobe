/*
 * File: logger.ts
 * Project: wardrobe
 * Created Date: 2026-05-23 12:24:06
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-23 13:26:49
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


/**
 * Stupid mini logger abstraction until my logging lib is rewritten
 */


export const logger = {
    debug: (...args: unknown[]) => {
        if (import.meta.dev) console.log("[DEBUG]", ...args); // Using console.log instead of console.debug because Nuxt appears to consume it
    },
    verbose: (...args: unknown[]) => {
        if (import.meta.dev) console.log("[VERBOSE]", ...args); // TODO, currently unused
    },
    info: (...args: unknown[]) => {
        console.log("[INFO]", ...args);
    },
    warn: (...args: unknown[]) => {
        console.log("[WARN]", ...args);
    },
    error: (...args: unknown[]) => {
        console.error("[ERROR]", ...args);
    },
};
