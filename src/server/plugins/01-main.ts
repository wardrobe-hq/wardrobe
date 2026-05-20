/*
 * File: 01-main.ts
 * Project: wardrobe
 * Created Date: 2026-03-22 10:43:46
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-20 22:00:02
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import * as main from "../main";


/*
    Initializes server by executing main
*/


// This function is executed when the Nitro server starts up
export default defineNitroPlugin(() => {
    main.run();
});
