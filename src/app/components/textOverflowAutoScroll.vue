<!--
/*
 * File: textOverflowAutoScroll.vue
 * Project: wardrobe
 * Created Date: 2026-03-19 17:29:47
 * Author: 3urobeat
 *
 * Last Modified: 2026-03-19 22:05:47
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
-->


<!--
    Implements text auto scroll when parent element with class 'group' is hovered
-->


<template>

    <span ref="container" class="relative w-full overflow-hidden whitespace-nowrap">
        <div
            ref="content"
            class="flex w-max items-center transition-transform ease-linear"
            :style="{
                '--scroll-dist': `-${scrollDistance}px`,
                'transition-duration': `${duration}s`
            }"
            :class="scrollDistance > 0 ? `group-hover:transform-[translateX(var(--scroll-dist))]` : ''"
        >
            <slot></slot>
        </div>
    </span>

</template>


<script setup lang="ts">
    import { useResizeObserver } from '@vueuse/core';


    // Refs
    const container: Ref<HTMLSpanElement|undefined> = ref();
    const content:   Ref<HTMLDivElement|undefined>  = ref();
    const scrollDistance = ref(0);
    const duration       = ref(0);


    // Calculate text overflow amount
    const updateDistance = () => {
        if (container.value && content.value) {
            const overflow = content.value.offsetWidth - container.value.offsetWidth;
            scrollDistance.value = overflow > 0 ? overflow : 0;

            // Calculate constant scroll speed by factoring in text length
            duration.value = scrollDistance.value / 50;
        }
    };


    // Watch out for size changes
    useResizeObserver(container, updateDistance);
    useResizeObserver(content,   updateDistance);


    // Define Props to be accepted by this component
    defineProps({
        /* onHover: {
            type: Boolean,
            required: false,
            default: false
        }, */
        /* withShadow: {
            type: Boolean,
            required: false,
            default: false
        } */
    });

    // Define Events emitted by this component
    // defineEmits();

</script>
