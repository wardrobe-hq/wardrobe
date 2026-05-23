/*
 * File: main.ts
 * Project: wardrobe
 * Created Date: 2026-05-20 18:34:55
 * Author: 3urobeat
 *
 * Last Modified: 2026-05-23 13:06:58
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


import packageJson from "../../package.json";


/**
 * Initializes server - Executed once on startup by plugin 01-main
 */
export async function run() {

    // Hello World
    const curVersion = packageJson.version;
    logger.info(`Wardrobe Server v${curVersion} starting up...`);

    // Sets terminal title (thanks: https://stackoverflow.com/a/30360821/12934162) and process name (readable in task manager etc.)
    process.stdout.write(`${String.fromCharCode(27)}]0;Wardrobe Server v${curVersion}`);
    process.title = "wardrobe-server";

    // Load databases and migrate if necessary
    logger.info("Loading databases...");

    await Promise.all([
        _migrateClothingDb(curVersion),
        _migrateLabelsDb(curVersion),
        _migrateLabelCategoriesDb(curVersion),
        _migrateOutfitsDb(curVersion),
        _migrateServerSettingsDb(curVersion)
    ]);

    // Load server modules
    initJobManager();

    // Done!
    setServerState(SERVER_STATE.SERVER_READY, true);
    logger.info("Startup complete!");

}
