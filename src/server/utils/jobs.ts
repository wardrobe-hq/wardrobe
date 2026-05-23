/*
 * File: jobs.ts
 * Project: wardrobe
 * Created Date: 2025-12-29 14:47:41
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-23 13:06:58
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { formatTime } from "~/../shared/utils/utils";


let   _jobInterval; // eslint-disable-line @typescript-eslint/no-unused-vars
const _registeredJobs: Job[] = [];


/**
 * Notifies registered clients about jobs update
 */
function sendJobSubscriptionEvent() {
    SubscriptionUpdateObserver.getInstance().callSubscribers({
        type: SubscriptionEventType.JOB,
        action: SubscriptionEventAction.ANY
    });
}


/**
 * Registers a job.
 * @throws Throws exception if Job with that name is already registered
 * @param job Job to register
 */
export function registerJob(job: Job) {

    // Check for duplicate name
    if (_registeredJobs.some((e) => e.info.name == job.info.name)) {
        throw("A Job with that is already registered");
    }

    logger.info(`Jobs Plugin: Registering job '${job.info.name}' which executes ${job.info.runOnRegistration ? "now and then " : ""}${job.info.interval > 0 ? "every " + formatTime(job.info.interval) : "only manually"}`);

    // Check if job shall run on registration. Ignore if server is not fully started yet, it will be processed asap
    if (job.info.runOnRegistration && getServerState(SERVER_STATE.SERVER_READY)) {
        job.run();
        job.info._lastExecTimestamp = Date.now();
    } else {
        job.info._lastExecTimestamp = 0;
    }

    // Register job
    job.info._registeredAt = Date.now();
    _registeredJobs.push(job);

    sendJobSubscriptionEvent();

}


/**
 * Unregisters a job
 * @param jobName Name of the job to unregister
 */
export function unregisterJob(jobName: string) {

    // Search for job
    const index = _registeredJobs.findIndex((e) => e.info.name === jobName);

    // Check if job does not exist
    if (index === -1) {
        throw("No job with that name exists!");
    }

    // Remove job
    logger.info(`Jobs Plugin: Unregistering job '${jobName}'...`);
    _registeredJobs.splice(index, 1);

    sendJobSubscriptionEvent();

}


/**
 * Internal: Runs all due jobs
 */
function _runDueJobs() {

    // Ignore request if server is not ready yet
    if (!getServerState(SERVER_STATE.SERVER_READY)) throw("Server not ready");

    _registeredJobs.forEach((job) => {
        if (job.info.interval !== 0
            && job.info._lastExecTimestamp! + job.info.interval < Date.now()
        ) {
            logger.info(`JobManager: Running due job '${job.info.name}'...`);

            job.run();
            job.info._lastExecTimestamp = Date.now();

            sendJobSubscriptionEvent();
        }
    });

}


/**
 * Returns all registered jobs
 * @returns All registered jobs
 */
export function getRegisteredJobs(): Job[] {
    return _registeredJobs;
}


/**
 * Initializes job manager, call on startup
 */
export function initJobManager() {

    // Register dummy job to explain pending registration
    registerJob({
        info: {
            name: JobRunnerPendingDummy,
            interval: 0,
            runOnRegistration: false
        },
        run: () => { return {}; }
    });

    // Register job runner after 30 seconds
    setTimeout(() => {
        // Remove dummy
        unregisterJob(JobRunnerPendingDummy);

        _jobInterval = setInterval(() => {
            _runDueJobs();
        }, 1000);
    }, 30000);

}
