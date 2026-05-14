/*
 * File: subscribe.ts
 * Project: wardrobe
 * Created Date: 2026-03-26 18:49:20
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-14 14:26:08
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { randomUUID } from "crypto";
import { SubscriptionUpdateObserver } from "../updateObserver";


/**
 * This API route creates an event stream and registers client at SubscriptionUpdateObserver
 * Parameters:
 * Returns:
 */


// This function is executed when this API route is called
export default defineEventHandler(async (event) => {

    console.debug(getApiLogPrefix(event), "Received request...");

    // Generate a client identifier and set it as a cookie
    const clientUUID = randomUUID();
    try {
        setCookie(event, "wardrobe_clientId", clientUUID);
        console.debug(getApiLogPrefix(event), "Set cookie 'wardrobe_clientId': " + clientUUID);
    } catch(err) {
        console.error(getApiLogPrefix(event), "Failed to set 'wardrobe_clientId' cookie!", err);
    }

    // Make this a stream
    const res = event.node.res;

    setHeader(event, "cache-control", "no-cache");
    setHeader(event, "connection", "keep-alive");
    setHeader(event, "content-type", "text/event-stream");
    setResponseStatus(event, 200);

    event.node.res.flushHeaders();

    // Register client with clientUUID
    await SubscriptionUpdateObserver.createSubscriber(event.node.req, res, clientUUID);

    event._handled = true;

});
