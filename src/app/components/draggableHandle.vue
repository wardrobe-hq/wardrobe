<!--
/*
 * File: draggableHandle.vue
 * Project: wardrobe
 * Created Date: 2025-12-28 15:51:11
 * Author: 3urobeat
 *
 * Last Modified: 2026-02-02 21:32:26
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
-->


<template>

    <!-- Fixed mt should be fine here since height of container is hard coded as well -->
    <svg class="cursor-move size-7 text-gray-400 dark:text-neutral-500" xmlns="http://www.w3.org/2000/svg" width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="4" cy="4" r="1"></circle>
        <circle cx="4" cy="12" r="1"></circle>
        <circle cx="4" cy="20" r="1"></circle>
        <circle cx="12" cy="4" r="1"></circle>
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="12" cy="20" r="1"></circle>
        <circle cx="20" cy="4" r="1"></circle>
        <circle cx="20" cy="12" r="1"></circle>
        <circle cx="20" cy="20" r="1"></circle>
        <circle cx="28" cy="4" r="1"></circle>
        <circle cx="28" cy="12" r="1"></circle>
        <circle cx="28" cy="20" r="1"></circle>
    </svg>

</template>
