/*
 * File: statistics.ts
 * Project: wardrobe
 * Created Date: 2026-03-21 23:37:00
 * Author: 3urobeat
 *
 * Last Modified: 2026-03-23 17:31:30
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


export type ServerStatistics = {
    runtime: {
        nodeVersion: string,
        isDocker: boolean,
    },
    app: {
        appStorageUsage: number,
        appMemUsage: number, // RAM usage of wardrobe server in Bytes
        appMemTotal: number, // RAM available to this process
        appUptime: number
    },
    system: {
        hostname: string,
        osPlatform: string,
        cpuModel: string,
        cpuTemp: number,
        cpuSpeed: number,   // Current CPU speed in GHz
        cpuUsage: number,
        memUsage: number,   // Current system RAM usage in Bytes
        memTotal: number,
        storageUsage: number,
        storageTotal: number,
        serverTime: number,
        uptime: number
    }
}
