/*
 * File: statistics.ts
 * Project: wardrobe
 * Created Date: 2026-03-21 23:56:43
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 19:05:11
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import si from "systeminformation";
import os from "os";
import util from "node:util";
import childProcess from "node:child_process";

import type { ServerStatistics } from "~/model/statistics";
import { tempToKelvin, Unit } from "~/model/unit";
import { getDBStorageSize, getImageStorageSize, getStorageMount } from "./useStorage";

const exec = util.promisify(childProcess.exec);


// SystemInformation docs: https://github.com/sebhildebrandt/systeminformation?tab=readme-ov-file#reference


/**
 * Returns OS kernel name and release
 * @returns Result of 'uname -s -r'
 */
async function getOS(): Promise<string> {
    const { stdout /* , stderr */ } = await exec("uname -s -r");
    return stdout.trim(); // TODO: Error handling
}


/**
 * Collects server statistics
 * @returns ServerStatistics object
 */
export async function getServerStatistics(): Promise<ServerStatistics> {

    const cpu = await si.cpu();
    const mem = await si.mem();

    const storageMount = await getStorageMount();
    const storageFs    = (await si.fsSize(storageMount)).find((e) => e.mount == storageMount); // There may be multiple filesystems mounted beneath, like '/efi' - this finds the actual data mount
    // TODO: Error handling


    const stats: ServerStatistics = {
        runtime: {
            nodeVersion: process.version,
            isDocker: (process.env.WARDROBE_HOST_ENV != undefined), // Environment variable set in Dockerfile
        },
        app: {
            appStorageUsage: (await getDBStorageSize()) + (await getImageStorageSize()),
            appMemUsage: process.memoryUsage().rss,
            appMemTotal: process.availableMemory(),
            appUptime: Date.now() - (process.uptime() * 1000)
        },
        system: {
            hostname: os.hostname(),
            osPlatform: await getOS(),
            cpuModel: `${cpu.manufacturer} ${cpu.brand}`,
            cpuTemp: tempToKelvin((await si.cpuTemperature()).main, Unit.CELSIUS)!,
            cpuSpeed: (await si.cpuCurrentSpeed()).avg, // In GHz
            cpuUsage: (await si.currentLoad()).currentLoad,
            memUsage: mem.active,
            memTotal: mem.total,
            storageUsage: storageFs?.used || 0,
            storageTotal: storageFs?.size || 0,
            serverTime: si.time().current,
            uptime: Date.now() - (si.time().uptime * 1000)
        },
    };

    return stats;

}
