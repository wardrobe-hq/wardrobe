<!--
/*
 * File: view.vue
 * Project: wardrobe
 * Created Date: 2025-09-10 17:37:07
 * Author: 3urobeat
 *
 * Last Modified: 2026-04-28 22:19:06
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
    This file contains both routes outfits-view & outfits-edit and toggles related components to de-duplicate code.
    The relevant re-route is configured in nuxt.config.ts.
-->


<template>

    <!-- Title Bar for view -->
    <TitleBarBasic backRedirectTo="/outfits" v-if="!editModeEnabled">
        <NuxtLink :to="'/outfits/edit?id=' + (thisOutfit ? thisOutfit.id : 'new')" class="custom-button-primary">
            <PhPencil class="mr-2 size-5"></PhPencil>
            {{ $t('edit') }}
        </NuxtLink>
    </TitleBarBasic>

    <!-- Title bar for edit -->
    <TitleBarBasic :backRedirectTo="outfitId == 'new' ? '/outfits' : '/outfits/view?id=' + (thisOutfit ? thisOutfit.id : 'new')" v-if="editModeEnabled">
        <template v-slot:secondary v-if="outfitId != 'new'">
            <button class="custom-button-primary" @click="deleteOutfit">
                <PhTrash class="mr-2 size-5 text-red-600"></PhTrash>
                {{ $t('delete') }}
            </button>
        </template>

        <button class="custom-button-primary" @click="saveChanges">
            <PhCheck class="mr-2 size-5 text-green-600"></PhCheck>
            {{ $t('save') }}
        </button>
    </TitleBarBasic>


    <!-- Page content -->
    <div
        class="py-20"
        @change="editModeEnabled ? emitChangesMadeEvent() : null"
    >
        <div class="flex gap-4 mb-4 md:mb-8 justify-between">
            <!-- Outfit title -->
            <div class="w-1/3 shrink-0">
                <p     v-if="!editModeEnabled" class="custom-label-primary text-nowrap w-full">{{ thisOutfit.title }}</p>
                <input v-if="editModeEnabled"  class="custom-input-secondary w-full" :placeholder="$t('name')" v-model.trim="thisOutfit.title" />
            </div>

            <!-- Label selector bar with expanding popup -->
            <div class="flex items-center justify-end min-w-1/2 max-w-screen rounded-md shadow-md select-none bg-bg-field-light dark:bg-bg-field-dark transition-all">
                <!-- Selected labels list -->
                <div class="flex gap-x-1 overflow-x-auto p-1">
                    <p
                        class="custom-wardrobe-label"
                        v-for="thisLabel in storedLabels.document!.filter((e: Label) => thisOutfit.labelIDs.includes(e.id))"
                        :key="thisLabel.id"
                        v-if="!editModeEnabled"
                    >
                        {{ thisLabel.name }}
                    </p>

                    <button
                        class="custom-wardrobe-label-clickable custom-wardrobe-label-selected-outline mx-0.5"
                        v-for="thisLabel in storedLabels.document!.filter((e) => thisOutfit.labelIDs.includes(e.id))"
                        :key="thisLabel.id"
                        @click="toggleLabel(thisLabel)"
                        v-if="editModeEnabled"
                    >
                        {{ thisLabel.name }}
                    </button>
                </div>

                <!-- Labels selector popout -->
                <PickerDialog
                    :toggleText="$t('outfitLabelsSelectorTooltip')"
                    hideSearch
                >
                    <template v-slot:toggle>
                        <PhCaretDown class="self-center mx-2 size-5"></PhCaretDown>
                    </template>

                    <!-- TODO: Overflows screen width due to being centered to right aligned CaretDown -->
                    <template v-slot:items>
                        <!-- Separate labels by category -->
                        <div class="flex w-180 max-h-140 my-1.5 gap-x-1.5" v-for="thisCategory in storedCategories.document" :key="thisCategory.id">
                            <div class="custom-label-primary text-nowrap py-0! px-2!">
                                {{ thisCategory.name }}:
                            </div>

                            <!-- List all labels for this category -->
                            <p
                                class="custom-wardrobe-label"
                                v-for="thisLabel in storedLabels.document!.filter((e: Label) => thisOutfit.labelIDs.includes(e.id) && e.categoryID == thisCategory.id)"
                                :key="thisLabel.id"
                                v-if="!editModeEnabled"
                            >
                                {{ thisLabel.name }}
                            </p>

                            <button
                                class="custom-wardrobe-label-clickable"
                                :class="thisOutfit.labelIDs.some((e) => e == thisLabel.id) ? 'custom-wardrobe-label-selected-outline' : ''"
                                v-for="thisLabel in storedLabels.document!.filter((e: Label) => e.categoryID == thisCategory.id)"
                                :key="thisLabel.id"
                                @click="toggleLabel(thisLabel)"
                                v-if="editModeEnabled"
                            >
                                {{ thisLabel.name }}
                            </button>
                        </div>
                    </template>
                </PickerDialog>
            </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4 md:gap-8 select-none">
            <!-- Preview container --> <!-- TODO: Highlight item here when hovering it in the label container? -->
            <div class="relative w-full md:w-1/3 min-h-90 h-90 md:h-auto rounded-xl shadow-md bg-bg-embed-light dark:bg-bg-embed-dark">
                <PhUserFocus class="absolute left-0 top-0 m-4 custom-label-icon-only size-7.5"></PhUserFocus>
                <threedModelViewer modelUrl="/3d-model/mannequin.glb" :xRotationLimit="0.5"></threedModelViewer>
            </div>

            <!-- Clothes per label container -->
            <div class="flex flex-col gap-4 md:gap-8 w-full md:w-2/3">
                <div
                    class="flex flex-col w-full h-65 p-2 rounded-2xl shadow-lg bg-bg-input-light dark:bg-bg-input-dark transition-all"
                    v-for="thisLabel in bodyPartLabels" :key="thisLabel.id"
                >
                    <!-- Category Title/Name -->
                    <div class="custom-label-primary w-fit py-0! px-2! m-2">
                        {{ thisLabel.name }}
                    </div>

                    <!-- Category content -->
                    <div class="flex">
                        <!-- Clothes of this label -->
                        <div class="flex h-50 mx-2 overflow-x-auto"> <!-- TODO: I don't like the hardcoded height but h-full glitches out of the box? Also changing any width breaks scroll overflow? -->
                            <div
                                class="flex flex-col w-55 shrink-0 px-2 m-2 rounded-xl shadow-md bg-bg-field-light dark:bg-bg-field-dark"
                                v-for="thisClothing in storedClothes.document!.filter((e) => thisOutfit.clothes.some((f) => f.clothingID == e.id) && e.labelIDs.includes(thisLabel.id))"
                                :key="thisClothing.id"
                            >
                                <!-- Title bar when in edit mode, let it clip over the image -->
                                <div class="flex relative w-full mt-2 -mb-2 justify-end" v-if="editModeEnabled">
                                    <button
                                        class="absolute custom-button-icon-only"
                                        @click="removeClothing(thisClothing.id)"
                                        :title="$t('removeItem')"
                                    >
                                        <PhX class="size-5 text-red-500"></PhX>
                                    </button>
                                </div>

                                <ImgLazy conClass="h-35 my-1.5" :itemName="thisClothing.title" imgClass="shadow-md rounded-2xl" :imgPath="thisClothing.imgPath" :imgWidth="384" />
                                <label class="self-start font-semibold mx-1">{{ thisClothing.title }}</label>
                            </div>
                        </div>

                        <!-- Add clothing to label button when in edit mode -->
                        <div class="self-center m-2" v-if="editModeEnabled"> <!-- TODO: Does this picker for every label increase resource usage by a lot? -->
                            <PickerDialog
                                :toggleText="$t('addItem')"
                            >
                                <!-- This is the element that will be displayed in the open/close button -->
                                <template v-slot:toggle>
                                    <PhPlus class="custom-button-icon-only size-7 fill-text-light dark:fill-text-dark"></PhPlus>
                                </template>

                                <!-- Items area -->
                                <template v-slot:items="slotProps">
                                    <div class="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:w-180 max-w-screen max-h-140 gap-4 overflow-y-auto"> <!-- TODO: overflow clips shadow -->
                                        <button
                                            class="custom-items-grid-card cursor-pointer flex flex-col p-2! h-45! md:h-55! aspect-square! dark:bg-bg-embed-dark! hover:dark:bg-bg-embed-hover-dark!"
                                            v-for="thisClothing in getClothesToShowInPopout(thisLabel, slotProps.searchStr)"
                                            :key="thisClothing.id"
                                            @click="addClothing(thisClothing.id)"
                                        >
                                            <ImgLazy conClass="select-none w-full h-full overflow-hidden" imgClass="shadow-md rounded-2xl" :itemName="thisClothing.title" :imgPath="thisClothing.imgPath" :imgWidth="384" />

                                            <div>
                                                <label class="flex text-sm font-semibold ml-0.5">{{ thisClothing.title }}</label>

                                                <!-- Labels -->
                                                <div class="flex h-7 mt-1 overflow-auto gap-0.5">
                                                    <button
                                                        class="custom-wardrobe-label-clickable text-sm h-fit m-0.5"
                                                        v-for="thisLabel in storedLabels.document!.filter((e) => thisClothing.labelIDs.includes(e.id))"
                                                        :key="thisLabel.name"
                                                    >
                                                        {{ thisLabel.name }}
                                                    </button>
                                                </div>
                                            </div>
                                        </button>

                                        <label class="p-1 text-nowrap" v-if="getClothesToShowInPopout(thisLabel, slotProps.searchStr).length == 0">{{ $t('noItemsToShow') }}</label>
                                    </div>
                                </template>
                            </PickerDialog>
                        </div>
                    </div>

                </div>

                <div v-if="!bodyPartsCategory" class="flex h-full justify-center items-center text-text-secondary-light dark:text-text-secondary-dark select-none">
                    <!-- No items available text (DB empty) -->
                    <label class="custom-label-primary flex items-center w-fit">
                        <PhBinoculars class="shrink-0 mr-2"></PhBinoculars>
                        {{ $t("outfitPageNoBodyPartSpeciality") }}
                    </label>
                </div>
            </div>
        </div>
    </div>

</template>


<script setup lang="ts">
    import { PhCheck, PhPencil, PhPlus, PhX, PhCaretDown, PhTrash, PhBinoculars, PhUserFocus } from "@phosphor-icons/vue";
    import TitleBarBasic from "~/components/titleBarBasic.vue";
    import PickerDialog from "~/components/pickerDialog.vue";
    import { sortLabelsList, type Label } from "~/model/label";
    import { getLabelsOfCategory, type Category } from "~/model/label-category";
    import { CategorySpecialityID } from "~/model/label-category";
    import type { Clothing } from "~/model/item";
    import type { Outfit } from "~/model/item";
    import { defaultSortMode } from "~/model/sort-modes";
    import { responseIndicatorFailure, responseIndicatorSuccess } from "~/composables/responseIndicator";
    import threedModelViewer from "~/components/threedModelViewer.vue";
    import { getAllClothesFromServer, getOutfitFromServer, rmOutfitToServer, setOutfitToServer } from "~/composables/storage";


    // Get from cache
    const storedLabels     = getAllLabelsFromServer();
    const storedCategories = getAllLabelCategoriesFromServer();

    // Refs
    const thisOutfit:     Ref<Outfit>     = ref({ id: "", title: "", clothes: [], labelIDs: [], previewImgPath: "", addedTimestamp: 0, modifiedTimestamp: 0 });
    const bodyPartLabels: Ref<Label[]>    = ref([]);
    const storedClothes   = await getAllClothesFromServer();


    // Check if edit mode is enabled based on if name of this route is outfits-view or outfits-edit
    const editModeEnabled = (useRoute().name == "outfits-edit");

    // Get ID of the outfit to view from query parameters
    const outfitId = (useRoute().query.id || "new").toString();

    // Redirect to edit page if view was opened with id new
    if (!editModeEnabled && outfitId == "new") useRouter().push("/outfits/edit?id=new");

    // Get all labels on page load
    const bodyPartsCategory = storedCategories.value.document!.find((e) => e.specialityID == CategorySpecialityID.Body_Part);

    if (bodyPartsCategory) {
        bodyPartLabels.value = sortLabelsList(getLabelsOfCategory(storedLabels.value.document!, bodyPartsCategory?.id));
    }


    // Get outfit data if not new
    if (outfitId != "new") {
        thisOutfit.value = (await getOutfitFromServer(outfitId)).value.document!;
    }


    // Add clothing to a label of this outfit
    function addClothing(id: string) {
        thisOutfit.value.clothes.push({
            order: 0,       // TODO: Order
            clothingID: id
        });

        emitChangesMadeEvent();
    }


    // Remove clothing from a label of this outfit
    function removeClothing(id: string) {
        thisOutfit.value.clothes = thisOutfit.value.clothes.filter((e) => e.clothingID != id);

        emitChangesMadeEvent();
    }


    // Gets items to show to in the popout for each label   // TODO: use computed() to avoid multiple calculations?
    function getClothesToShowInPopout(thisLabel: Label, searchStr: string = "") {
        // Get all clothes that have this body part label
        const clothesForThisLabel = getItemsToShow(storedClothes.value.document!, defaultSortMode, [ thisLabel.id ]) as Clothing[];

        // Remove clothes that are already added to this outfit
        const clothesNotAddedYet = clothesForThisLabel.filter((e) => !thisOutfit.value?.clothes.some((f) => f.clothingID == e.id));

        // Remove clothes that do not match search string
        const clothesMatchingSearch = clothesNotAddedYet.filter((e) => e.title.toLowerCase().includes(searchStr.toLowerCase())); // TODO: How much does this search suck compared to some guideline?

        return clothesMatchingSearch;
    }


    // Adds/Removes a label
    async function toggleLabel(selectedLabel: Label) {
        // Get all selected labels without this one
        const filtered = thisOutfit.value.labelIDs.filter((e: string) => e != selectedLabel.id);

        // If length does not match, the label must be selected
        if (filtered.length != thisOutfit.value.labelIDs.length) {
            // ...and we can simply remove it without filtering again
            thisOutfit.value.labelIDs = filtered;
        } else {
            // ...otherwise we can simply add it
            thisOutfit.value.labelIDs.push(selectedLabel.id);
        }

        emitChangesMadeEvent();
    }


    // Sends delete request to the database
    async function deleteOutfit() {

        const confirmed = confirm($t('deleteConfirmationPrompt', { name: thisOutfit.value.title }));

        // Send request to API if user confirmed
        if (confirmed) {
            const resBody = await rmOutfitToServer(thisOutfit.value.id);

            // Indicate success/failure
            if (resBody.success) {
                responseIndicatorSuccess();

                emitChangesMadeEvent(false);
            } else {
                responseIndicatorFailure();
                return;
            }

            // Redirect back to outfits page on success
            useRouter().push("/outfits");
        }

    }


    // Sends changes to the database in edit mode
    async function saveChanges() {

        // Send data to API
        const resBody = (await setOutfitToServer(thisOutfit.value));

        // Update local refs depending on success/failure and indicate result
        if (resBody.success) {
            responseIndicatorSuccess();

            emitChangesMadeEvent(false);
            thisOutfit.value = resBody.document!;
        } else {
            responseIndicatorFailure();
        }

        // Redirect back on success
        useRouter().push("/outfits/view?id=" + thisOutfit.value.id);

    }

</script>
