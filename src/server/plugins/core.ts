/*
 * File: core.ts
 * Project: wardrobe
 * Created Date: 2026-03-22 10:43:46
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-01 19:05:05
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import packageJson from "~/../package.json";


/*
    Contains server core code that should get executed on startup
*/


// This function is executed when the server starts up
export default defineNitroPlugin(() => {

    // Sets terminal title (thanks: https://stackoverflow.com/a/30360821/12934162) and process name (readable in task manager etc.)
    process.stdout.write(`${String.fromCharCode(27)}]0;Wardrobe Server v${packageJson.version}`);
    process.title = "wardrobe-server";

});
