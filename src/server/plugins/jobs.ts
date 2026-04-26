/*
 * File: jobs.ts
 * Project: wardrobe
 * Created Date: 2025-12-29 14:47:41
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-26 19:42:03
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { CoreJobPendingDummy, type Job } from "~/model/job";
import { formatTime } from "~/utils/utils";

// Import core jobs
import dataCleanupJob from "../utils/jobs/dataCleanup";
import { SubscriptionUpdateObserver } from "../updateObserver";
import { SubscriptionEventAction, SubscriptionEventType } from "~/model/api";


let _jobInterval; // eslint-disable-line @typescript-eslint/no-unused-vars
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

    console.log(`Jobs Plugin: Registering job '${job.info.name}' which executes ${job.info.runOnRegistration ? "now and then " : ""}${job.info.interval > 0 ? "every " + formatTime(job.info.interval) : "only manually"}`);

    // Check if job shall run on registration
    if (job.info.runOnRegistration) {
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
    console.log(`Jobs Plugin: Unregistering job '${jobName}'...`);
    _registeredJobs.splice(index, 1);

    sendJobSubscriptionEvent();

}


/**
 * Internal: Registers core jobs which are shipped by default after 30 seconds
 */
function _registerCoreJobs() {
    console.log("Jobs Plugin: Registering core jobs in 30 seconds...");

    // Register dummy job to explain pending registration
    registerJob({
        info: {
            name: CoreJobPendingDummy,
            interval: 0,
            runOnRegistration: false
        },
        run: () => { return {}; }
    });

    // Register core jobs after 30 seconds
    setTimeout(() => {
        // Remove dummy
        unregisterJob(CoreJobPendingDummy);

        registerJob(dataCleanupJob);
    }, 30000);
}


/**
 * Internal: Runs all due jobs
 */
function _runDueJobs() {

    _registeredJobs.forEach((job) => {
        if (job.info.interval !== 0
            && job.info._lastExecTimestamp! + job.info.interval < Date.now()
        ) {
            console.log(`JobManager: Running due job '${job.info.name}'...`);

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


// This function is executed when the server starts up
export default defineNitroPlugin(() => {

    // Register interval for checking for due jobs
    _jobInterval = setInterval(() => {
        _runDueJobs();
    }, 1000);

    // Call register for internal jobs after 30 seconds
    _registerCoreJobs();

});
