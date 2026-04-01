/*
 * File: useStorage.ts
 * Project: wardrobe
 * Created Date: 2026-03-22 12:21:07
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 19:05:18
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
import util from "node:util";
import childProcess from "node:child_process";
import { type StorageSubscriptionEvent, SubscriptionEventType } from "~/model/api";
import { SubscriptionUpdateObserver } from "../updateObserver";

const exec = util.promisify(childProcess.exec);


/**
 * Gets size of all files in directory - Thanks: https://stackoverflow.com/a/69418940
 * @param dir Directory path
 * @returns Size in Bytes
 */
async function getDirSize(dir: string): Promise<number> {
    let files;

    try {
        files = await readdir(dir);
    } catch (err) {
        console.error(`getDirSize: Failed to access dir '${dir}': ${err}`);
        return 0;
    }

    const stats = files.map((file) => stat(path.join(dir, file)));

    return (await Promise.all(stats)).reduce((accumulator, { size }) => accumulator + size, 0);
}
// TODO: Not recursive


/**
 * Returns size of database storage in Bytes
 * @returns Size in Bytes
 */
export async function getDBStorageSize(): Promise<number> {
    return await getDirSize("data/database");
}


/**
 * Returns size of image storage in Bytes
 * @returns Size in Bytes
 */
export async function getImageStorageSize(): Promise<number> {
    return (await getDirSize("data/images/outfit")) + (await getDirSize("data/images/clothing"));
}


/**
 * Returns fs mount point of storage pool
 * @returns Mount point of storage pool
 */
export async function getStorageMount(): Promise<string> {
    const { stdout /* , stderr */ } = await exec("stat -c %m -- 'data/'");
    return stdout.trim(); // TODO: Error handling
}


/**
 * Notifies registered clients about storage update - Storage specific SubscriptionUpdateObserver wrapper function for type safety
 * @param event Event to send
 */
export async function sendStorageSubscriptionEvent(event: Omit<StorageSubscriptionEvent, "type">) {
    SubscriptionUpdateObserver.getInstance().callSubscribers({ type: SubscriptionEventType.STORAGE, ...event });
}
