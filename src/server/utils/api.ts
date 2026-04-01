/*
 * File: api.ts
 * Project: wardrobe
 * Created Date: 2026-03-27 16:50:16
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 19:05:13
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { H3Event } from "h3";
import { IncomingMessage } from "http";
import type { ApiResponse } from "~/model/api";


/**
 * Gets IP of client who sent the request
 * @param req Incoming request
 * @returns Client's IP address
 */
export function getIpFromRequest(req: IncomingMessage) {
    return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress).replace("::ffff:", "");
}


/**
 * Constructs prefix that is used in all API log messages
 * @param event Incoming request event
 * @returns String to be used as log message prefix
 */
export function getApiLogPrefix(event: H3Event<globalThis.EventHandlerRequest>) {
    return `[API] ${event.node.req.method} '${event.node.req.url}' from ${getIpFromRequest(event.node.req)}:`;
}


/**
 * Constructs an API response with generic document content of type T on success or error message on failure
 * @param cb Async function that returns data of type T to send
 * @returns Formatted ApiResponse
 */
export async function getApiResponse<T>(cb: () => Promise<T | null>): Promise<ApiResponse<T>> {

    const res: ApiResponse<T> = {
        success: false,
        message: null,
        document: null
    };

    try {
        res.document = await cb();
        res.success  = true;
    } catch (err) {
        res.message = String(err);          // TODO: Abstract error message to avoid potential security risk by client getting some kind of server environment information?
        res.success = false;

        //  TODO
        /* throw createError({
            statusCode: 500,
            statusMessage: "No matching image found"
        }); */
    }

    return res;

}
