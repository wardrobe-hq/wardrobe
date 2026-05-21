<!--
/*
 * File: convertedUnit.vue
 * Project: wardrobe
 * Created Date: 2026-03-09 16:46:49
 * Author: 3urobeat
 *
 * Last Modified: 2026-03-20 22:35:28
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
    Handles automatic unit conversion for HTML elements.
    get: converts to unit set in settings for user
    set: converts back to base unit for server
-->


<template>

    <!-- Temperature Conversion -->
    <input
        v-if="unitType == UnitType.TEMPERATURE"
        :value="tempKelvinTo(modelValue as number, getConfTempUnit())"
        @input="$emit('update:modelValue', tempToKelvin(Number.parseInt($event.target.value), getConfTempUnit()))"
    />

</template>


<script setup lang="ts">


    // https://pipo.blog/articles/20220714-vue3-v-model-binding

    // Define Props to be accepted by this component
    defineProps({
        unitType: {         // UnitType
            type: Number,
            required: true,
            validator(value: number): boolean {
                switch(value) {
                    case UnitType.TEMPERATURE: // Supported Units
                        return true;
                    default:
                        return false;
                }
            }
        },
        modelValue: {       // Element passed via v-model
            required: true
        }
    });

    // Define Events emitted by this component
    defineEmits(['update:modelValue']);

</script>
