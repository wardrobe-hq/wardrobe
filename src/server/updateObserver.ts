/*
 * File: updateObserver.ts
 * Project: wardrobe
 * Created Date: 2026-03-26 18:53:29
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 18:32:57
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import { IncomingMessage, ServerResponse } from "http";
import { SubscriptionEvent } from "~/model/api";


type UpdateFunction<UpdateData> = (arg0: UpdateData) => void;

type Subscriber<UpdateFunction> = {
    id: number,
    func: UpdateFunction
}


/**
 * Observer Pattern Singleton
 * @abstract
 * Surrounding function enables defining static properties inside a generic class: https://stackoverflow.com/a/52519934
 */
function UpdateObserver<UpdateData>() {

    return class UpdateObserver {
        private subscribers: Subscriber<UpdateFunction<UpdateData>>[];

        // Singleton Pattern
        private static instance: UpdateObserver;

        static getInstance() {
            if (!this.instance) {
                this.instance = new this();
            }

            return this.instance;
        }

        protected constructor() {
            this.subscribers = [];
        }

        /**
         * Adds a subscriber to the subscription list
         * @param subscriber
         * @returns ID of this subscriber in the subscribers collection
         */
        addSubscriber(subscriber: UpdateFunction<UpdateData>) {
            const lastSub = this.subscribers[this.subscribers.length - 1] || { id: -1 };

            const length = this.subscribers.push({ id: lastSub.id + 1, func: subscriber });

            console.debug(`[DEBUG] UpdateObserver: New subscription request, adding sub with id ${lastSub.id + 1}. There are/is now ${length} subscriber(s)`);

            return lastSub.id + 1;
        }

        /**
         * Deletes a subscriber from the subscription list
         * @param id ID of the subscriber to delete
         */
        deleteSubscriber(id: number) {
            this.subscribers = this.subscribers.filter((e) => e.id != id);
            console.debug(`[DEBUG] UpdateObserver: Subscriber with id ${id} requested to be deleted, there are/is now ${this.subscribers.length} subscriber(s) left`);
        }

        /**
         * Gets list of registered subscribers
         */
        getSubscribers() {
            return this.subscribers;
        }

        /**
         * Updates every subscriber
         */
        callSubscribers(data: UpdateData) {
            this.subscribers.forEach((e) => e.func(data)); // TODO: Catch error and log
        }
    }

}


/**
 * Observer Pattern Singleton for handling 'subscribe' API Route update events
 */
export class SubscriptionUpdateObserver extends UpdateObserver<SubscriptionEvent>() {

    private constructor() {
        super();
    }

    /**
     * Creates a new subscriber from an API response stream and registers it
     * @param request
     * @param responseStream
     */
    static createSubscriber(request: IncomingMessage, responseStream: ServerResponse<IncomingMessage>) {

        // Create update function and register it
        const updateClient: UpdateFunction<SubscriptionEvent> = async (newData: SubscriptionEvent) => {
            try {
                const stringifiedData = JSON.stringify(newData);
                responseStream.write(`data: ${stringifiedData}\n\n`);

                console.debug("[DEBUG] SubscriptionUpdateObserver: Updated event stream with new data!");
            } catch (err) {
                console.error("SubscriptionUpdateObserver: Failed to update event stream with new data! ", err);
            }
        };

        const id = SubscriptionUpdateObserver.getInstance().addSubscriber(updateClient);

        // Listen for connection close and clean up
        request.on("close", () => {
            console.debug(`[DEBUG] SubscriptionUpdateObserver: Subscriber ${id} has lost connection`);

            SubscriptionUpdateObserver.getInstance().deleteSubscriber(id);
        });
    }

}
