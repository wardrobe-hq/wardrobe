/*
 * File: utils.ts
 * Project: wardrobe
 * Created Date: 2026-05-21 18:01:54
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-23 13:07:15
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import path from "path";
import { readdir, stat } from "fs/promises";


/**
 * Gets size of all files in directory - Thanks: https://stackoverflow.com/a/69418940
 * @param dir Directory path
 * @returns Size in Bytes
 */
export async function getDirSize(dir: string): Promise<number> {
    let files;

    try {
        files = await readdir(dir);
    } catch (err) {
        logger.error(`getDirSize: Failed to access dir '${dir}': ${err}`);
        return 0;
    }

    const stats = files.map((file) => stat(path.join(dir, file)));

    return (await Promise.all(stats)).reduce((accumulator, { size }) => accumulator + size, 0);
}
// TODO: Not recursive
