<!--
/*
 * File: dayMonthInput.vue
 * Project: wardrobe
 * Created Date: 2026-03-20 22:08:57
 * Author: 3urobeat
 *
 * Last Modified: 2026-03-21 22:00:23
 * Modified By: 3urobeat
 *
 * Copyright (c) 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
-->


<template>
    <div class="flex divide-border-secondary-light dark:divide-border-secondary-dark divide-x-2 gap-2">

        <!-- Month Dropdown -->
        <select
            class="w-fit"
            :value="date?.getMonth()"
            @input="setMonth($event.target!.value)"
        >
            <option :value="null"></option>
            <option v-for="(e, i) in months" :key="i" :value="i">{{ $rt(months.at(i)) }}</option>
        </select>

        <!-- Day Dropdown -->
        <select
            class="w-fit"
            :value="date?.getDate()"
            @input="setDay($event.target!.value)"
        >
            <option :value="null"></option>
            <option v-for="i in daysInThisMonth" :key="i" :value="i">{{ i }}</option>
        </select>

    </div>
</template>


<script setup lang="ts">

    // Define Props to be accepted by this component
    const props = defineProps({
        modelValue: {       // Element passed via v-model, must be number or null
            required: true,
            validator(value: unknown): boolean {
                return (typeof value == "number" || value == null);
            }
        }
    });

    // Define Events emitted by this component
    const emit = defineEmits(["update:modelValue"]);


    // Refs
    const i18n                   = useI18n();
    const months                 = i18n.tm("months");
    const date: Ref<Date | null> = ref(null);
    const daysInThisMonth        = ref(0);

    if (props.modelValue != null) {
        date.value = new Date((props.modelValue as number));
        date.value.setUTCFullYear(YEARLESS_DATE_YEAR);
        daysInThisMonth.value = getDaysPerMonth(date.value.getMonth());
    }


    // Calculate days in the selected month
    function getDaysPerMonth(month: number): number {
        // Use a lap year so Feb 29 is always an option. Date(year, monthIndex + 1, 0) returns the last day of the current month
        return new Date(YEARLESS_DATE_YEAR, month + 1, 0).getDate();
    };

    // Preprocess: Incoming value inits date, incoming null unsets date. Returns boolean indicating whether parent function should continue
    function setOrUnset(val: number | string | null): boolean {
        if (val != null && val != "") { // null option will be an empty string
            if (date.value == null) {
                date.value = new Date(0);
                date.value.setUTCFullYear(YEARLESS_DATE_YEAR, 0, 1);
            }
            return true;
        } else {
            date.value = null;
            daysInThisMonth.value = 0;
            emitVal();
            return false;
        }
    }

    // Update month
    function setMonth(val: string | null) {
        if (!setOrUnset(val)) return;
        const selectedMonth: number = Number.parseInt(val!);

        // Check if an invalid day for this month is selected
        daysInThisMonth.value = getDaysPerMonth(selectedMonth);

        if (date.value!.getDate() > daysInThisMonth.value) {
            console.debug(`[DEBUG] dayMonthInput: Reducing selected day to ${daysInThisMonth.value} because month ${selectedMonth + 1} does not have ${date.value!.getDate()} days!`);
            date.value!.setDate(daysInThisMonth.value);
        }

        date.value!.setMonth(selectedMonth);
        emitVal();
    }

    // Update day
    function setDay(val: string | null) {
        if (!setOrUnset(val)) return;
        const selectedDay: number = Number.parseInt(val!);

        date.value!.setDate(selectedDay);
        emitVal();
    }

    // Emits v-model update event with date as timestamp
    function emitVal() {
        emit("update:modelValue", date.value != null ? date.value.getTime() : null);
    }

</script>
