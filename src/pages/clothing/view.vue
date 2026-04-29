<!--
/*
 * File: view.vue
 * Project: wardrobe
 * Created Date: 2025-09-08 15:39:55
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-29 18:33:15
 * Modified By: 3urobeat
 *
 * Copyright (c) 2025 - 2026 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
-->


<!--
    This file contains both routes clothing-view & clothing-edit and toggles related components to de-duplicate code.
    The relevant re-route is configured in nuxt.config.ts.
-->


<template>

    <!-- Title bar for edit -->
    <TitleBarBasic backRedirectTo="/" v-if="!editModeEnabled">
        <NuxtLink :to="'/clothing/edit?id=' + clothingId" class="custom-button-primary">
            <PhPencil class="mr-2 size-5"></PhPencil>
            {{ $t("edit") }}
        </NuxtLink>
    </TitleBarBasic>

    <!-- Title bar for edit -->
    <TitleBarBasic :backRedirectTo="clothingId == 'new' ? '/clothing' : '/clothing/view?id=' + clothingId" v-if="editModeEnabled">
        <template v-slot:secondary v-if="clothingId != 'new'">
            <button class="custom-button-primary" @click="deleteClothing">
                <PhTrash class="mr-2 size-5 text-red-600"></PhTrash>
                {{ $t("delete") }}
            </button>
        </template>

        <button class="custom-button-primary" @click="saveChanges">
            <PhCheck class="mr-2 size-5 text-green-600"></PhCheck>
            {{ $t("save") }}
        </button>
    </TitleBarBasic>


    <!-- Page content -->
    <div
        class="flex justify-center items-center py-20"
        @change="editModeEnabled ? emitChangesMadeEvent() : null"
    >
        <!-- TODO: Pop-In Animation -->
        <div class="flex flex-col w-full md:w-xl h-200 px-4 pb-4 sm:px-8 sm:pb-8 rounded-2xl shadow-lg bg-bg-input-light dark:bg-bg-input-dark transition-all"> <!-- TODO: Why does this use input when it is a field/embed? Sounds like inconsistent styling -->

            <!-- Image (Upload) -->
            <div
                class="relative flex m-6 justify-center h-3/6 rounded-2xl shadow-md select-none bg-bg-field-light/35 dark:bg-bg-field-dark/35 outline-border-primary-light dark:outline-border-primary-dark outline-dashed transition-all"
                :class="editModeEnabled ? 'outline-2 cursor-pointer hover:bg-bg-field-hover-light/50 dark:hover:bg-bg-field-hover-dark/50' : 'outline-0'"
            >
                <!-- Show image if available -->
                <img
                    v-if="thisClothingImgBlob"
                    class="rounded-2xl self-center h-fit max-h-full select-none"
                    :class="editModeEnabled ? 'opacity-50' : ''"
                    :src="'data:image/png;base64,' + thisClothingImgBlob"
                    alt=""
                >
                <PhImageBroken v-else-if="!editModeEnabled" class="h-2/3 w-2/3 self-center text-text-secondary-light/50 dark:text-text-secondary-dark/50" />

                <!-- Upload icon -->
                <PhUploadSimple v-if="editModeEnabled" class="absolute self-center text-4xl text-text-light dark:text-text-dark" />

                <!-- Full size dummy component that handles file uploading. Position it absolute to parent by setting parent to relative -->
                <FileUpload v-if="editModeEnabled" class="absolute w-full h-full" ref="fileUpload" @uploadSuccess="updateImage" />
            </div>

            <div class="flex flex-col w-full gap-4 h-2/3">
                <!-- Name label/input -->
                <p
                    class="custom-label-primary w-full sm:w-1/2 self-center sm:self-start"
                    v-if="!editModeEnabled"
                >
                    {{ thisClothing.title }}
                </p>
                <input
                    class="custom-input-secondary shrink-0 w-full sm:w-1/2 self-center sm:self-start"
                    :placeholder="$t('name')"
                    v-model.trim="thisClothing.title"
                    v-if="editModeEnabled"
                />

                <!-- Description label/input -->
                <p
                    class="custom-label-primary w-full h-20! shrink-0 py-1"
                    v-if="!editModeEnabled"
                >
                    {{ thisClothing.description }}
                </p>
                <textarea
                    class="custom-input-secondary w-full h-20! shrink-0 py-1"
                    :placeholder="$t('description')"
                    v-model.trim="thisClothing.description"
                    v-if="editModeEnabled"
                />

                <!-- Label selector area -->
                <div class="w-full h-full overflow-auto self-center rounded-xl shadow-md select-none bg-bg-field-light dark:bg-bg-field-dark">

                    <!-- Separate labels by category -->
                    <div class="flex m-1.5 gap-1.5" v-for="thisCategory in storedCategories.document" :key="thisCategory.id">
                        <div class="custom-label-primary text-nowrap text-md w-fit py-0! px-2!">
                            {{ thisCategory.name }}:
                        </div>

                        <!-- List all labels for this category -->
                        <p
                            class="custom-wardrobe-label"
                            v-for="thisLabel in storedLabels.document!.filter((e: Label) => thisClothing.labelIDs.includes(e.id) && e.categoryID == thisCategory.id)"
                            :key="thisLabel.id"
                            v-if="!editModeEnabled"
                        >
                            {{ thisLabel.name }}
                        </p>

                        <button
                            class="custom-wardrobe-label-clickable"
                            :class="thisClothing.labelIDs.some((e) => e == thisLabel.id) ? 'custom-wardrobe-label-selected-outline' : ''"
                            v-for="thisLabel in sortLabelsList(getLabelsOfCategory(storedLabels.document!, thisCategory.id))"
                            :key="thisLabel.id"
                            @click="toggleLabel(thisLabel)"
                            v-if="editModeEnabled"
                        >
                            {{ thisLabel.name }}
                        </button>

                        <!-- Label Quick Add Button -->
                        <button @click="quickAddLabel(thisCategory)" v-if="editModeEnabled">
                            <PhPlus class="fill-text-light dark:fill-text-dark"></PhPlus>
                        </button>
                    </div>

                </div>
            </div>

        </div>
    </div>
</template>


<script setup lang="ts">
    import { PhCheck, PhImageBroken, PhPencil, PhPlus, PhTrash, PhUploadSimple } from "@phosphor-icons/vue";
    import TitleBarBasic from "~/components/titleBarBasic.vue";
    import FileUpload from "~/components/fileUpload.vue";
    import type { Clothing } from "~/model/item";
    import { getNewLastLabelOrderIndex, sortLabelsList, type Label } from "~/model/label";
    import { getLabelsOfCategory, type Category } from "~/model/label-category";
    import { CategorySpecialityMap } from "~/model/label-category";
    import { getImageFromServer, setCategoriesAndLabelsToServer } from "~/composables/storage";


    // Get from cache
    const storedLabels     = getAllLabelsFromServer();
    const storedCategories = getAllLabelCategoriesFromServer();

    // Refs
    const thisClothing:        Ref<Clothing> = ref({ id: "", title: "", description: "", imgPath: "", labelIDs: [], addedTimestamp: 0, modifiedTimestamp: 0 });
    const thisClothingImgBlob: Ref<string>   = ref("");

    // Check if edit mode is enabled based on if name of this route is outfits-view or outfits-edit
    const editModeEnabled = (useRoute().name == "clothing-edit");

    // Get ID of the outfit to view from query parameters
    const clothingId = (useRoute().query.id || "new").toString();

    // Redirect to edit page if view was opened with id new
    if (!editModeEnabled && clothingId == "new") useRouter().push("/clothing/edit?id=new");


    // Get clothing
    if (clothingId != "new") {
        thisClothing.value = (await getClothingFromServer(clothingId)).value.document!; // TODO: Does ref break?

        thisClothingImgBlob.value = (await getSSRImageFromServer(thisClothing.value.imgPath, 512))?.value.document?.imgBlob || ""; // TODO: Does ref break?
    }


    // Adds/Removes a label
    async function toggleLabel(selectedLabel: Label) {
        console.debug("DEBUG: Toggling label " + selectedLabel.id);

        // Get all selected labels without this one
        const filtered = thisClothing.value.labelIDs.filter((e: string) => e != selectedLabel.id);

        // If length does not match, the label must be selected
        if (filtered.length != thisClothing.value.labelIDs.length) {
            // ...and we can simply remove it without filtering again
            thisClothing.value.labelIDs = filtered;
        } else {
            // ...otherwise we can simply add it
            thisClothing.value.labelIDs.push(selectedLabel.id);
        }

        emitChangesMadeEvent();
    }


    // Label quick add function
    async function quickAddLabel(thisCategory: Category) {
        const name = prompt("clothingQuickAddLabelNamePrompt");

        // If prompt was submitted with content
        if (name) {
            const newLabel: Label = {
                id: await getUUIDFromServer(),
                name: name,
                orderIndex: getNewLastLabelOrderIndex(getLabelsOfCategory(storedLabels.value.document!, thisCategory.id)),
                categoryID: thisCategory.id,
                specialityValue: CategorySpecialityMap[thisCategory.specialityID].value // Init val
            };

            // Send new label to server
            const res = await setCategoriesAndLabelsToServer(undefined, [ newLabel ]);

            // Directly select new label
            thisClothing.value.labelIDs.push(newLabel.id);

            // Vue does not detect this change (as no element was edited in the DOM) so we need to track this manually
            emitChangesMadeEvent();
        }
    }


    // Triggered when new image was uploaded
    async function updateImage(fileName: string) {
        if (!fileName) throw("Error: Image was uploaded without file name?");

        thisClothing.value.imgPath = fileName;
        console.debug("DEBUG - updateImage: Setting imgPath of clothing to " + thisClothing.value.imgPath);

        thisClothingImgBlob.value = (await getImageFromServer(fileName, 512))?.imgBlob || "";
    }


    // Sends delete request to the database
    async function deleteClothing() {

        const confirmed = confirm($t('deleteConfirmationPrompt', { name: thisClothing.value.title }));

        // Send request to API if user confirmed
        if (confirmed) {
            const resBody = await rmClothingToServer(thisClothing.value.id);

            // Indicate success/failure
            if (resBody.success) {
                responseIndicatorSuccess();

                emitChangesMadeEvent(false);
            } else {
                responseIndicatorFailure();
                return;
            }

            // Redirect back to Browse page on success
            useRouter().push("/");
        }

    }


    // Sends changes to the database
    async function saveChanges() {

        // Send data to API
        const resBody = await setClothingToServer(thisClothing.value);

        // Update local refs depending on success/failure and indicate result
        if (resBody.success) {
            responseIndicatorSuccess();

            emitChangesMadeEvent(false);
            thisClothing.value = resBody.document!;
            thisClothingImgBlob.value = (await getImageFromServer(resBody.document!.imgPath, 512))?.imgBlob || "";
        } else {
            responseIndicatorFailure();
        }

        // Redirect back on success
        useRouter().push("/clothing/view?id=" + thisClothing.value.id);

    }

</script>
