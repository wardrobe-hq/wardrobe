<!--
/*
 * File: threedModelViewer.vue
 * Project: wardrobe
 * Created Date: 2026-01-31 17:03:57
 * Author: 3urobeat
 *
 * Last Modified: 2026-07-02 20:29:32
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

    <div ref="parentContainer" class="relative h-full w-full">
        <!-- WebGL disabled warning -->
        <div v-if="!WebGL.isWebGL2Available()" class="absolute inset-0 z-10 flex items-center justify-center">
            <div class="flex items-center gap-3 text-sm rounded-xl shadow-md custom-glass-pill px-4 py-3 text-orange-500 border-orange-500/50!">
                <PhWarning class="size-5 shrink-0" />
                <span>WebGL is disabled or not supported :(</span>
            </div>
        </div>

        <!-- Renderer Canvas Container -->
        <div
            ref="canvasContainer"
            id="3d-model-viewer-container"
            class="cursor-grab"
            @mousedown="rendererOnMouseDown"
            @touchstart="rendererOnTouchDown"
        >                   <!-- absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 -->
        </div>

        <!-- Auto Spin toggle -->
        <button class="absolute right-0 top-0 m-4 custom-button-icon-only" :class="autoRotationEnabled ? 'bg-green-500/50!' : ''"
            :title="$t('threedModelViewerToggleAutoRotation')" @click="autoRotationEnabled = !autoRotationEnabled"
        >
            <PhArrowCounterClockwise class="ml-0.25 size-5" />
        </button>

        <!-- Indicator that canvas is rotatable -->
        <div class="absolute flex justify-between bottom-1/8 w-full">
            <PhCaretLeft class="custom-label-icon-only size-7 ml-4 sm:ml-12"></PhCaretLeft>
            <PhCaretRight class="custom-label-icon-only size-7 mr-4 sm:mr-12"></PhCaretRight>
        </div>
    </div>

</template>


<script setup lang="ts">
    import { PhArrowCounterClockwise, PhCaretLeft, PhCaretRight, PhWarning } from "@phosphor-icons/vue";
    import * as threeJs from "three";
    import { GLTFLoader, type GLTF } from "three-stdlib";
    import WebGL from "three/addons/capabilities/WebGL.js";


    // Refs
    const autoRotationEnabled                            = ref(false);
    const parentContainer: Ref<HTMLDivElement|undefined> = ref();
    const canvasContainer: Ref<HTMLDivElement|undefined> = ref();

    let scene:      threeJs.Scene<threeJs.Object3DEventMap>;
    let camera:     threeJs.PerspectiveCamera;
    let renderer:   threeJs.WebGLRenderer;
    let loader:     GLTFLoader;
    let model:      GLTF;                           // Stores currently loaded GLTF model
    let boundingBox         = new threeJs.Box3();   // Stores bounds/sizes (X, Y, Z) of currently loaded model (in meters)
    let rendererIsMouseDown = false;
    let rendererMouseX      = 0;
    let rendererMouseY      = 0;

    const cameraPadding = 1.2;


    // Updates size of renderer if container got resized
    function setRendererSize() {
        try {

            const width  = parentContainer.value!.clientWidth;
            const height = parentContainer.value!.clientHeight;

            if (renderer.domElement.width != width || renderer.domElement.height != height) {
                // Update camera to prevent model distorting or clipping out of bounds
                camera.aspect = width / height;
                fitCameraToCenteredObject();

                renderer.setSize(width, height, false);
                renderer.render(scene, camera);
            }

        } catch(err) {
            logger.error("Failed to set threeJs renderer size: " + err);
            throw err;
        }
    }


    // Updates camera so that model never clips outside of container's bounds - Massive credit to: https://wejn.org/2020/12/cracking-the-threejs-object-fitting-nut/
    function fitCameraToCenteredObject() {
        let size = new threeJs.Vector3();
        boundingBox.getSize(size);

        // figure out how to fit the box in the view:
        // 1. figure out horizontal FOV (on non-1.0 aspects)
        // 2. figure out distance from the object in X and Y planes
        // 3. select the max distance (to fit both sides in)
        //
        // The reason is as follows:
        //
        // Imagine a bounding box (BB) is centered at (0,0,0).
        // Camera has vertical FOV (camera.fov) and horizontal FOV
        // (camera.fov scaled by aspect, see fovh below)
        //
        // Therefore if you want to put the entire object into the field of view,
        // you have to compute the distance as: z/2 (half of Z size of the BB
        // protruding towards us) plus for both X and Y size of BB you have to
        // figure out the distance created by the appropriate FOV.
        //
        // The FOV is always a triangle:
        //
        //  (size/2)
        // +--------+
        // |       /
        // |      /
        // |     /
        // | F° /
        // |   /
        // |  /
        // | /
        // |/
        //
        // F° is half of respective FOV, so to compute the distance (the length
        // of the straight line) one has to: `size/2 / Math.tan(F)`.
        //
        // FTR, from https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
        // the camera.fov is the vertical FOV.

        const fov = camera.fov * (Math.PI / 180);
        const fovh = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect);
        let dx = size.z / 2 + Math.abs(size.x / 2 / Math.tan( fovh / 2 ));
        let dy = size.z / 2 + Math.abs(size.y / 2 / Math.tan( fov / 2 ));
        let cameraZ = Math.max(dx, dy);

        // offset the camera, if desired (to avoid filling the whole canvas)
        if (cameraPadding) cameraZ *= cameraPadding;

        camera.position.z = cameraZ;

        // set the far plane of the camera so that it easily encompasses the whole object
        const minZ = boundingBox.min.z;
        const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;

        camera.far = cameraToFarEdge * 3;
        camera.updateProjectionMatrix();
    };


    function initRenderer() {
        try {

            // Create a new threeJs renderer
            scene    = new threeJs.Scene();
            camera   = new threeJs.PerspectiveCamera();
            renderer = new threeJs.WebGLRenderer({ antialias: true, alpha: true });

            // Give renderer a transparent background
            renderer.setClearColor(0x000000, 0);

            // Apply renderer to container div
            canvasContainer.value!.appendChild(renderer.domElement);

            // Spotlight from top right
            const spotLight = new threeJs.SpotLight(0xffffff, 10);
            spotLight.position.set(8, 10, 6);
            spotLight.angle = Math.PI / 5;
            spotLight.penumbra = 0.3;
            spotLight.decay = 1;
            scene.add(spotLight);
            scene.add(spotLight.target);

            // Dim ambient fill so shadow side is still visible
            const ambientLight = new threeJs.AmbientLight(0xffffff, 1);
            scene.add(ambientLight);

        } catch(err) {
            logger.error("Failed to init threeJs renderer: " + err);
            throw err;
        }
    }


    async function loadModel(path: string) {
        try {

            // Load the mannequin model
            loader = new GLTFLoader();
            model = await loader.loadAsync(path);

            // Get size of model
            boundingBox.setFromObject(model.scene);

            // Set default rotation
            rotateModel(props.yRotationDefault, props.xRotationDefault);

            // Add model to scene
            scene.add(model.scene);

            // Set camera position based on model size
            camera.position.y = boundingBox.max.y / 2;

        } catch(err) {
            logger.error("Failed to load threeJs model: " + err);
            throw err;
        }
    }


    // Exposed function for querying whether a model is loaded
    function isModelLoaded() {
        return (model != undefined);
    }


    // UV helpers for planar projection (counteracts texture folding on 3D face features)

    const UV_STORAGE_KEY = "__originalUVs";

    /** Stores a copy of the mesh's original UVs so they can be restored later. */
    function storeOriginalUVs(mesh: threeJs.Mesh) {
        if (mesh.userData[UV_STORAGE_KEY]) return;
        const uv = mesh.geometry.attributes.uv;
        if (uv) {
            mesh.userData[UV_STORAGE_KEY] = uv.array.slice();
        }
    }

    /** Restores a mesh's original UVs that were saved by storeOriginalUVs(). */
    function restoreOriginalUVs(mesh: threeJs.Mesh) {
        const original = mesh.userData[UV_STORAGE_KEY] as Float32Array | undefined;
        if (!original) return;
        mesh.geometry.attributes.uv.array.set(original);
        mesh.geometry.attributes.uv.needsUpdate = true;
    }

    /** Exposed: restore UVs on every mesh that had them saved. */
    function restoreAllOriginalUVs() {
        model.scene.traverse((child) => {
            if (child instanceof threeJs.Mesh && child.userData[UV_STORAGE_KEY]) {
                restoreOriginalUVs(child);
            }
        });
        renderer.render(scene, camera);
    }

    /**
     * Replaces a mesh's UVs with a planar front-projection (orthographic onto XY).
     * This eliminates the "folding" effect that occurs when a flat texture is mapped
     * onto a 3D face using the model's original UVs (which wrap around features like the nose).
     * Instead, each vertex gets UV coordinates based purely on its X/Y position,
     * making the texture behave like a photograph pasted onto the front of the face.
     */
    function applyPlanarProjection(mesh: threeJs.Mesh) {
        const geometry = mesh.geometry;
        const position = geometry.attributes.position;
        const uvArray = new Float32Array(position.count * 2);

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (let i = 0; i < position.count; i++) {
            const x = position.getX(i);
            const y = position.getY(i);
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;

        for (let i = 0; i < position.count; i++) {
            uvArray[i * 2]     = (position.getX(i) - minX) / rangeX;
            uvArray[i * 2 + 1] = (position.getY(i) - minY) / rangeY;
        }

        geometry.setAttribute("uv", new threeJs.BufferAttribute(uvArray, 2));
        geometry.attributes.uv.needsUpdate = true;
    }


    // Applies texture to the model, optionally to only a specific mesh (match by name, ignoring case)
    // When applying a flat texture to a 3D human face, the UV map typically doesn't use the full 0-1 square,
    // causing stretching. Pass scale to correct for this: e.g. scale=(0.7, 1) if the face UV region is narrower in U.
    // Pass projection="planar-front" to recalculate UVs via XY orthographic projection, eliminating folding
    // around 3D features (nose, cheeks, etc.) by mapping the texture like a flat photograph.
    function applyTexture(textureUrl: string, flipY: boolean = false, offset?: threeJs.Vector2, targetName?: string, scale?: threeJs.Vector2, rotation?: number, projection?: "planar-front") {
        const textureLoader = new threeJs.TextureLoader();

        // Load texture
        const texture = textureLoader.load(textureUrl, () => {
            texture.colorSpace = threeJs.SRGBColorSpace;
            texture.flipY      = flipY; // Texture seems to be flipped by default

            // Allow texture wrapping for tiling/partial mapping
            texture.wrapS = threeJs.RepeatWrapping;
            texture.wrapT = threeJs.RepeatWrapping;

            // Set repeat (scale). Values < 1 zoom in (texture appears larger on the model),
            // values > 1 repeat/tile. Independent U/V scaling corrects face UV aspect ratio distortion.
            const sx = scale?.x ?? 1;
            const sy = scale?.y ?? 1;
            texture.repeat.set(sx, sy);

            // When scaling < 1, automatically adjust offset to keep texture centered
            // (otherwise scaling pulls content toward the UV origin (0,0))
            const cx = (1 - sx) / 2;
            const cy = (1 - sy) / 2;
            texture.offset.set((offset?.x ?? 0) + cx, (offset?.y ?? 0) + cy);

            // Apply rotation (in radians) around the center of the texture
            if (rotation != null) {
                texture.rotation = rotation;
                texture.center.set(0.5, 0.5);
            }

            // Loop through all meshes/parts of the model
            model.scene.traverse((child) => {
                if (child instanceof threeJs.Mesh) {

                    // If targetName was specified, only apply texture to mesh with matching name, ignoring case
                    if (targetName && child.name.toLowerCase() != targetName.toLowerCase()) return;

                    // Optionally recalculate UVs via planar projection to eliminate folding
                    if (projection === "planar-front") {
                        storeOriginalUVs(child);
                        applyPlanarProjection(child);
                    }

                    const mat = (child.material as threeJs.MeshStandardMaterial).clone();
                    child.material  = mat;
                    mat.map         = texture;
                    mat.color.setHex(0xffffff); // Needs brightness, texture is otherwise dark
                    mat.needsUpdate = true;

                }
            });

            renderer.render(scene, camera);
        });
    }


    // Functions for handling model rotation using mouse - Credit: https://stackoverflow.com/a/19589151
    function rendererOnMouseMove(evt: MouseEvent) {
        if (!rendererIsMouseDown) {
            return;
        }

        evt.preventDefault();

        // Calculate delta between last known position and now, refresh last known position and render change
        let deltaX = evt.clientX - rendererMouseX;
        let deltaY = evt.clientY - rendererMouseY;
        rendererMouseX = evt.clientX;
        rendererMouseY = evt.clientY;

        rotateModel(deltaX, deltaY);
    }

    function rendererOnTouchMove(evt: TouchEvent) {
        if (!rendererIsMouseDown) {
            return;
        }

        evt.preventDefault();

        // Calculate delta between last known position and now, refresh last known position and render change
        if (evt.changedTouches[0]) {
            let deltaX = evt.changedTouches[0].clientX - rendererMouseX;
            let deltaY = evt.changedTouches[0].clientY - rendererMouseY;
            rendererMouseX = evt.changedTouches[0].clientX;
            rendererMouseY = evt.changedTouches[0].clientY;

            rotateModel(deltaX, deltaY);
        }
    }

    function rendererOnMouseDown(evt: MouseEvent) {
        evt.preventDefault();
        rendererIsMouseDown = true;

        // Set starting position to calculate delta on mouseMove
        rendererMouseX = evt.clientX;
        rendererMouseY = evt.clientY;

        document.addEventListener('mousemove', rendererOnMouseMove); // Use document.addEventListener instead of Vue's @mousemove to fix drag stopping when cursor leaves div
        document.addEventListener('mouseup', rendererOnMouseUp);
    }

    function rendererOnTouchDown(evt: TouchEvent) {
        evt.preventDefault();
        rendererIsMouseDown = true;

        // Set starting position to calculate delta on mouseMove
        if (evt.touches[0]) {
            rendererMouseX = evt.touches[0].clientX;
            rendererMouseY = evt.touches[0].clientY;
        }

        document.addEventListener('touchmove', rendererOnTouchMove); // Use document.addEventListener instead of Vue's @touchmove to fix drag stopping when cursor leaves div
        document.addEventListener('touchend', rendererOnMouseUp);
        document.addEventListener('touchcancel', rendererOnMouseUp);
    }

    function rendererOnMouseUp(evt: MouseEvent | TouchEvent) {
        evt.preventDefault();
        rendererIsMouseDown = false;

        document.removeEventListener('mousemove', rendererOnMouseMove); // Use document.addEventListener instead of Vue's @mousemove to fix drag stopping when cursor leaves div
        document.removeEventListener('mouseup', rendererOnMouseUp);
        document.removeEventListener('touchmove', rendererOnTouchMove);
        document.removeEventListener('touchend', rendererOnMouseUp);
        document.removeEventListener('touchcancel', rendererOnMouseUp);
    }


    // Rotates model
    function rotateModel(deltaX: number, deltaY: number, ratio: number = 100) {
        if (model && model.scene) {
            model.scene.rotation.y += deltaX / ratio;
            model.scene.rotation.x += deltaY / ratio; // TODO: Can we detect full model rotation and reset values to 0?

            // Limit rotation if desired
            if (props.yRotationLimit != null && Math.abs(model.scene.rotation.y) > props.yRotationLimit) { // Check must ignore sign (positive/negative)
                model.scene.rotation.y = props.yRotationLimit * Math.sign(model.scene.rotation.y);         // Restore sign to limit in both directions
            }

            if (props.xRotationLimit != null && Math.abs(model.scene.rotation.x) > props.xRotationLimit) {
                model.scene.rotation.x = props.xRotationLimit * Math.sign(model.scene.rotation.x);
            }

            // Render rotation
            renderer.render(scene, camera);
        }
    }


    // Setup - Client Side only
    onMounted(async () => {
        try {
            // Setup renderer, load model and scale renderer to model dimensions
            initRenderer();
            await loadModel(props.modelUrl);
            setRendererSize();

            // Animate!
            const animate = () => {
                // Abort if container does not exist (e.g. on page switch)
                if (canvasContainer.value != null) {
                    setRendererSize();   // Check if container got resized
                    requestAnimationFrame(animate);

                    if (autoRotationEnabled.value) {
                        rotateModel(1, 0); // Constantly rotate model
                    }
                }
            };

            renderer.render(scene, camera);
            animate();
        } catch(err) {
            logger.error("Failed to setup preview viewer: " + err);
        }
    });


    // Define Props to be accepted by this component
    const props = defineProps({
        modelUrl: {
            type: String,
            required: true
        },
        yRotationDefault: {
            default: 0,
            type: Number,
            required: false
        },
        xRotationDefault: {
            default: 0,
            type: Number,
            required: false
        },
        yRotationLimit: {
            default: null,
            type: Number,
            required: false
        },
        xRotationLimit: {
            default: null,
            type: Number,
            required: false
        },
    });

    // Define stuff that can be accessed by the page
    defineExpose({
        isModelLoaded,
        applyTexture,
        restoreAllOriginalUVs,
    });

</script>
