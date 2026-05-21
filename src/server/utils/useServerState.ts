/*
 * File: useServerState.ts
 * Project: wardrobe
 * Created Date: 2026-05-19 22:44:15
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-20 21:58:10
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


/**
 * Provides a small server state store implementation
 */


// Supported server states
export enum SERVER_STATE {
    SERVER_READY
}

interface ServerStates {
    [SERVER_STATE.SERVER_READY]: boolean
}

// Internal: Tracks states
const states: ServerStates = {
    [SERVER_STATE.SERVER_READY]: false
};


/**
 * Gets server state
 * @param state State to get
 * @returns Value of state
 */
export function getServerState(state: SERVER_STATE) {
    return states[state];
}


/**
 * Sets a server state
 * @param state State to set
 * @param value Value to set for state
 */
export function setServerState(state: SERVER_STATE, value: any) { // TODO: Replace never with state's type
    states[state] = value;
}
