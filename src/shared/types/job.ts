/*
 * File: job.ts
 * Project: wardrobe
 * Created Date: 2025-12-31 14:01:39
 * Author: 3urobeat
 *
 * Last Modified: 2026-02-02 21:32:26
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


export const JobRunnerPendingDummy = "JOB_RUNNER_PENDING";

export type JobInfo = {
    name: string,
    interval: number,             // Time in ms. Set to 0 to disable periodic execution
    runOnRegistration: boolean,
    _lastExecTimestamp?: number,  // Internal
    _registeredAt?: number        // Internal
}

export type Job = {
    info: JobInfo,
    run: () => object // May return whatever I guess
}
