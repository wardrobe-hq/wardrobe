/*
 * File: state.ts
 * Project: wardrobe
 * Created Date: 2026-04-29 17:32:34
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-29 17:49:51
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


export enum State {
    SERVER_SUBSCRIPTION_CONNECTED = "serverSubscriptionConnected",
    CACHED_IMAGES                 = "cachedImages",
    GLOBAL_SEARCH_STRING          = "globalSearchStr",
    GLOBAL_SEARCH_BAR_SHOWN       = "globalSearchBarShown"
}


/**
 * Initializes all states with default value
 */
export function initState() {
    useState(State.SERVER_SUBSCRIPTION_CONNECTED, () => false);
    useState(State.CACHED_IMAGES, () => []);
    useState(State.GLOBAL_SEARCH_STRING, () => null);
    useState(State.GLOBAL_SEARCH_BAR_SHOWN, () => false);
}
