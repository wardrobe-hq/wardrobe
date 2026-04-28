<!--
/*
 * File: index.vue
 * Project: wardrobe
 * Created Date: 2025-09-09 17:13:32
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-28 21:57:36
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
    <TitleBarBasic>
        <button class="custom-button-primary" @click="saveChanges">
            <PhCheck class="mr-2 size-5 text-green-600"></PhCheck>
            {{ $t('save') }}
        </button>
    </TitleBarBasic>

    <div class="flex flex-col items-center py-20 gap-8" @change="emitChangesMadeEvent()">

        <div
            class="flex flex-col w-full h-60 p-2 rounded-2xl shadow-lg bg-bg-input-light dark:bg-bg-input-dark transition-all"
            v-for="thisCategory in localCategories"
            :key="thisCategory.id"
        >
            <!-- Category Title/Name, Speciality Selector & Delete button -->
            <div class="flex items-center justify-between m-2">
                <div class="flex gap-6">
                    <input
                        class="custom-input-primary w-1/3 sm:w-full transition-all"
                        :placeholder="$t('categoryName')"
                        v-model.trim="thisCategory.name"
                    />

                    <div class="flex custom-input-primary px-1!" @change="updateCategorySpeciality(thisCategory)">
                        <select class="px-1" v-model="thisCategory.specialityID">
                            <option v-for="thisSpeciality in CategorySpecialities" :value="thisSpeciality.id">{{ $t(thisSpeciality.name) }}</option>
                        </select>
                    </div>
                </div>

                <button class="custom-button-icon-only" @click="deleteCategory(thisCategory)" :title="$t('deleteCategory')">
                    <PhTrash class="size-5 text-red-500" />
                </button>
            </div>

            <!-- Category content -->
            <div class="flex">
                <!-- Labels of this category -->
                <div
                    class="flex h-44 mx-2 overflow-x-auto"
                    :id="'labels-' + thisCategory.id"
                >                                               <!-- TODO: I don't like the hardcoded height but h-full glitches out of the box? Also changing any width breaks scroll overflow? -->
                    <div
                        class="w-50 md:w-60 shrink-0 px-2 m-2 rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark"
                        v-for="thisLabel in labelsPerCategory[thisCategory.id]"
                        :key="thisLabel.id"
                    >
                        <!-- Label title bar -->
                        <div class="flex w-full mt-2 mb-1">
                            <div class="flex justify-start ml-1">
                                <PhTag class="self-center size-5 text-text-light dark:text-text-dark"></PhTag>
                            </div>

                            <div class="flex w-full justify-end">
                                <button class="custom-button-icon-only p-0.75!" @click="deleteLabel(thisLabel)" :title="$t('deleteLabel')">
                                    <PhTrash class="size-5 text-red-500" />
                                </button>
                            </div>
                        </div>

                        <!-- Label content -->
                        <input
                            class="custom-input-primary w-full my-2"
                            :placeholder="$t('name')"
                            v-model.trim="thisLabel.name"
                        />

                        <div class="flex justify-between mt-9 m-1">
                            <!-- Icon acting as handle for drag interaction and indicating that item is draggable -->
                            <DraggableHandle id="drag-handle"></DraggableHandle>

                            <!-- Category Speciality Value Input --> <!-- TODO: I *also* dislike this entire block. Moving to a component would be better but complicate value passing & updating -->
                            <div
                                v-if="thisCategory.specialityID && CategorySpecialities.find((e) => e.id == thisCategory.specialityID)?.value != undefined"
                                :title="$t('labelsConfigureSpeciality')"
                            >
                                <select v-if="thisCategory.specialityID == CategorySpecialityID.Body_Part" class="custom-input-primary w-32 px-1.5!" v-model="thisLabel.specialityValue">
                                    <!-- <option value=undefined disabled selected hidden>{{ CategorySpecialities.find((e) => e.id == thisCategory.specialityID)?.description }}</option> -->
                                    <option v-for="[key, value] of Object.entries(CategorySpecialityBodyPartValue)" :value="key">{{ $t(value.toLowerCase()) }}</option>
                                </select>
                                <input v-else-if="thisCategory.specialityID == CategorySpecialityID.Color" class="w-7 h-7 rounded-4xl" type="color" :placeholder="$t(CategorySpecialities.find((e) => e.id == thisCategory.specialityID)!.description)" v-model="thisLabel.specialityValue">
                                <div v-else-if="thisCategory.specialityID == CategorySpecialityID.Season">
                                    <PickerDialog :toggleText="$t('labelsConfigureSpeciality')" hide-search>
                                        <!-- This is the element that will be displayed in the open/close button -->
                                        <template v-slot:toggle>
                                            <PhSlidersHorizontal class="custom-button-icon-only-secondary size-7 fill-text-light dark:fill-text-dark"></PhSlidersHorizontal>
                                        </template>

                                        <!-- Items area -->
                                        <template v-slot:items>
                                            <div class="min-w-80 max-w-100">
                                                <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 items-center">
                                                    <label for="specialSeasonFromTemp">{{ $t('fromTemp') }}</label>
                                                    <div class="flex items-center">
                                                        <ConvertedUnit id="specialSeasonFromTemp" type="number" class="custom-input-primary w-26 my-1 px-1.5! mr-2" :unit-type="UnitType.TEMPERATURE" v-model="getLabelInitialized(thisLabel, thisCategory).specialityValue.fromTemp" />
                                                        <label>{{ getConfTempUnitStr() }}</label>
                                                    </div>
                                                    <label for="specialSeasonToTemp">{{ $t('toTemp') }}</label>
                                                    <div class="flex items-center">
                                                        <ConvertedUnit id="specialSeasonToTemp" type="number" class="custom-input-primary w-26 my-1 px-1.5! mr-2" :unit-type="UnitType.TEMPERATURE" v-model="getLabelInitialized(thisLabel, thisCategory).specialityValue.toTemp" />
                                                        <label>{{ getConfTempUnitStr() }}</label>
                                                    </div>
                                                    <label for="specialSeasonFromTime">{{ $t('fromDate') }}</label>
                                                    <DayMonthInput id="specialSeasonFromTime" type="date" class="custom-input-primary w-fit my-1 px-1.5!" v-model="getLabelInitialized(thisLabel, thisCategory).specialityValue.fromTimestamp" />
                                                    <label for="specialSeasonToTime">{{ $t('toDate') }}</label>
                                                    <DayMonthInput id="specialSeasonToTime" type="date" class="custom-input-primary w-fit my-1 px-1.5!" v-model="getLabelInitialized(thisLabel, thisCategory).specialityValue.toTimestamp" />
                                                </div>
                                                <p class="text-text-secondary-light dark:text-text-secondary-dark mt-2 text-xs">{{ $t("labelsSpecialitySeasonTempDateTooltip") }}</p>
                                            </div>
                                        </template>
                                    </PickerDialog>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Add label button -->
                <div class="flex m-2 items-center"> <!-- TODO: Auto scroll label container to the end? -->
                    <button class="custom-button-icon-only" @click="addLabel(thisCategory)" :title="$t('addLabel')">
                        <PhPlus class="size-5 fill-text-light dark:fill-text-dark"></PhPlus>
                    </button>
                </div>
            </div>

        </div>

        <!-- Add label category button. "p-2!" overwrites custom-button-icon-only's p-1 to make button bigger -->
        <button class="custom-button-icon-only p-2!" @click="addCategory()" :title="$t('addCategory')">
            <PhPlus class="size-5 fill-text-light dark:fill-text-dark"></PhPlus>
        </button>
    </div>

    <!-- No "empty" text here because styling sucks and wardrobe comes with a few pre-configured labels -->
</template>


<script setup lang="ts">
    import { PhCheck, PhPlus, PhSlidersHorizontal, PhTag, PhTrash } from "@phosphor-icons/vue";
    import TitleBarBasic from "~/components/titleBarBasic.vue";
    import { getLabelInitialized, getLabelOrderIndexBetween, getNewLastLabelOrderIndex, sortLabelsList, type Label } from "~/model/label";
    import { getLabelsOfCategory, type Category } from "~/model/label-category";
    import { CategorySpecialities, CategorySpecialityID, CategorySpecialityBodyPartValue, CategorySpecialityMap } from "~/model/label-category";
    import { moveArrayElement, useSortable, type UseSortableReturn } from "@vueuse/integrations/useSortable";
    import type { Reactive } from "vue";
    import { UnitType } from "~/model/unit";
    import DayMonthInput from "~/components/dayMonthInput.vue";
    import { setCategoriesAndLabelsToServer } from "~/composables/storage";


    // Create local clones of global labels & category cache from app.vue. Changes are synced in saveChanges()
    const storedLabels     = getAllLabelsFromServer();
    const storedCategories = getAllLabelCategoriesFromServer();

    let localLabels:       Ref<Label[]>;
    let localCategories:   Ref<Category[]>;
    let labelsPerCategory: Reactive<{ [key: string]: Label[] }> = reactive({}); // Nested data structure must use reactive to update correctly in template when dragged
    let useSortables:      UseSortableReturn[] = [];

    function init() {
        localLabels     = useCloned(storedLabels.value.document!, { manual: true }).cloned;     // I'm not using useCloned's sync() as it just wouldn't work :shrug:
        localCategories = useCloned(storedCategories.value.document!, { manual: true }).cloned;

        // Cleanup before reassigning
        useSortables.forEach((e) => e.stop());

        // Prepare temporary list for drag & drop reorder functionality. Changes in this list must be synced to localLabels & localCategories!
        // Key/Index is category id
        localCategories.value.forEach((thisCategory) => {
            labelsPerCategory[thisCategory.id] = sortLabelsList(getLabelsOfCategory(localLabels.value, thisCategory.id));

            useSortables.push(useSortable(`#labels-${thisCategory.id}`, labelsPerCategory[thisCategory.id]!, { animation: 150, handle: "#drag-handle", onUpdate: moveLabel })); // Handle allows dragging action only on item with that id
        });
    }

    init();


    // Cache labels & categories that should be deleted
    let labelIDsToDelete:    string[] = [];
    let categoryIDsToDelete: string[] = [];


    // Add a new label to a category
    async function addLabel(category: Category) {
        const newLabel: Label = {
            id: await getUUIDFromServer(),
            name: "",
            orderIndex: getNewLastLabelOrderIndex(labelsPerCategory[category.id]!),
            categoryID: category.id,
            specialityValue: CategorySpecialityMap[category.specialityID].value // Init val
        };

        localLabels.value.push(newLabel);
        labelsPerCategory[category.id]!.push(newLabel);

        // Vue does not detect this change (as no element was edited in the DOM) so we need to track this manually
        emitChangesMadeEvent();
    }

    // Delete a label
    function deleteLabel(selectedLabel: Label) {
        const confirmed = confirm($t('labelsDeleteLabelConfirmationPrompt', { name: selectedLabel.name }));

        if (confirmed) {
            labelIDsToDelete.push(selectedLabel.id);
            localLabels.value = localLabels.value.filter((e) => e.id != selectedLabel.id);
            labelsPerCategory[selectedLabel.categoryID]! = labelsPerCategory[selectedLabel.categoryID]!.filter((e: Label) => e != selectedLabel);

            // Vue does not detect this change (as no element was edited in the DOM) so we need to track this manually
            emitChangesMadeEvent();
        }
    }

    // Called when label is moved using useSortable() and synchronizes labelsPerCategory with localLabels
    function moveLabel(event: any) { // This is of type Sortable.SortableEvent but there are no TS type definitons - https://vueuse.org/integrations/useSortable/#usesortable

        // Get data from event
        const categoryID = String(event.from.id).replace("labels-", ""); // Get category id from div id prop
        const labelIndex = event.newIndex;                               // Index of moved element in labelsPerCategory[categoryID]

        if (!labelsPerCategory[categoryID]) throw("Move event for invalid category: " + categoryID); // Uhh

        // Interject - Move item (would be automatic but we overwrote that by hooking our function: https://vueuse.org/integrations/useSortable/#tips)
        moveArrayElement(labelsPerCategory[categoryID], event.oldIndex, labelIndex, event);

        // Calculate new orderIndex after moveArrayElement() microtask has finished
        nextTick(() => {
            const list = labelsPerCategory[categoryID]!;

            const prev = (labelIndex > 0) ? list[labelIndex - 1] : undefined;               // Preceding element. If label was moved to the front, there is no preceding slot -> undefined.
            const succ = (labelIndex < list.length - 1) ? list[labelIndex + 1] : undefined; // Succeeding element. If label was moved to the last slot, ...

            const newOrderIndex = getLabelOrderIndexBetween(prev, succ);

            // Apply orderIndex change to both lists
            labelsPerCategory[categoryID]![labelIndex]!.orderIndex = newOrderIndex;
            localLabels.value.find((e) => e.id == list[labelIndex]!.id)!.orderIndex = newOrderIndex;

            //console.debug(list[labelIndex].name)
            //console.debug(labelsPerCategory[categoryID].map((e) => e.orderIndex))
        });

    }

    // Add a new category
    async function addCategory() {
        const e: Category = {
            id: await getUUIDFromServer(),
            name: "",
            specialityID: CategorySpecialityID.No_Speciality
        };

        localCategories.value.push(e);
        labelsPerCategory[e.id] = [];

        // Vue does not detect this change (as no element was edited in the DOM) so we need to track this manually
        emitChangesMadeEvent();
    }

    // Delete a category
    function deleteCategory(selectedCategory: Category) {
        const confirmed = confirm($t('labelsDeleteCategoryConfirmationPrompt', { name: selectedCategory.name }));

        if (confirmed) {
            categoryIDsToDelete.push(selectedCategory.id);
            localCategories.value = localCategories.value.filter((e) => e.id != selectedCategory.id);
            delete labelsPerCategory[selectedCategory.id];

            // Delete all labels of this category
            localLabels.value = localLabels.value.filter((e) => {
                if (e.categoryID === selectedCategory.id) {
                    labelIDsToDelete.push(e.id);
                    return false;
                }
                return true;
            });

            // Vue does not detect this change (as no element was edited in the DOM) so we need to track this manually
            emitChangesMadeEvent();
        }
    }

    // Update value of all labels of a category with default value when speciality changes
    function updateCategorySpeciality(thisCategory: Category) {
        labelsPerCategory[thisCategory.id]?.forEach((e) => {
            e.specialityValue = CategorySpecialityMap[thisCategory.specialityID].value;
        });

        localLabels.value.forEach((e) => {
            if (e.categoryID == thisCategory.id) {
                e.specialityValue = CategorySpecialityMap[thisCategory.specialityID].value;
            }
        })
    }


    // Sends changes to the database
    async function saveChanges() {

        // Send labels & categories data to API
        let rmResBody = { success: true }; // Default

        if (labelIDsToDelete.length > 0 || categoryIDsToDelete.length > 0) {
            rmResBody = await rmLabelsToServer(categoryIDsToDelete, labelIDsToDelete);
        }

        const setResBody = await setCategoriesAndLabelsToServer(localCategories.value, localLabels.value);

        // Update local refs depending on success/failure and indicate result
        if (rmResBody.success && setResBody.success) {
            responseIndicatorSuccess();

            emitChangesMadeEvent(false);
            labelIDsToDelete    = [];
            categoryIDsToDelete = [];

            // Manually sync local clones to global cache, useCloned's sync() didn't work. Refresh clone of localServerSettings to avoid it gaining reactivity
            init(); // TODO: Buggy reordering list
        } else {
            responseIndicatorFailure();
        }
        // TODO: Handle !success better

    }

</script>
