/**
 * @license
 * Copyright 2021 Google LLC.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { Easing, Tween, update } from "@tweenjs/tween.js";

const apiOptions = {
    "apiKey": 'AIzaSyDTXbPV5vjBAwjN83TF0Wr6afPiusxzxGE',
};

let map: google.maps.Map;

const cameraOptions: google.maps.CameraOptions = {
    tilt: 0,
    heading: 0,
    zoom: 3,
    center: { lat: 35.6594945, lng: 139.6999859 }
};
 
const mapOptions = {
    ...cameraOptions,
    "tilt": 0,
    "heading": 0,
    "zoom": 6,
    "center":
    {
        lat: 35.6594945,
        lng: 139.6999859
    },
    "mapId": "cde5e7a5d01eaf90"
};


async function initMap() {
    const mapDiv = document.getElementById("map") as HTMLElement;	
    const apiLoader = new Loader(apiOptions);
    await apiLoader.load();	
    return new google.maps.Map(mapDiv, mapOptions);
}


function initWebGLOverlayView(map)
{  
    let scene, renderer, camera;
    let loadingManager;
    let gltfModel;
    let font;

    const webGLOverlayView = new google.maps.WebGLOverlayView();

    const pathCoordinate = [];

    const loader = new THREE.FileLoader();

    loader.load("TemperatureBreakers.json", ( data ) => {
            let json = JSON.parse(data);

            json.forEach(item => {
                let text = [];
                text.push(`Current Temperature: ${item.CurrentTemperature}`);
                text.push(`${item.City}, ${item.Country}`);
                text.push(`Previous Records: ${item.PastTemperatures}`);
                text.push(`Time recorded: ${item.SnapshotTime}`);
                
                pathCoordinate.push({
                    text: text,
                    point: {
                        lat: item.lat,
                        lng: item.lon
                    }
                });
            });

            map.moveCamera({
                "center": pathCoordinate[0].point
            });

            cameraOptions.center = pathCoordinate[0].point;
        }
    );

    
    const createObjects = () => {
        const matLite = new  THREE.MeshBasicMaterial(
        {
            color: 0xFF0000,
            opacity: 1,
	    envMap: "refelection",
            side: THREE.DoubleSide
        });

        
        gltfModel.scene.scale.set(1000, 2000, 1000);
        gltfModel.scene.rotation.x = 90 * Math.PI / 180;
        gltfModel.scene.position.copy(latLngToVector3(mapOptions.center));
        const modelBox = new THREE.Box3().setFromObject(gltfModel.scene);

        pathCoordinate.forEach((data, index) => {
            const textArray = data.text;
            const point = data.point;

            let textHeight;

            textArray.forEach((text, index) => {
                const shapes = font.generateShapes(text, 500);
                const geometry = new THREE.ShapeGeometry(shapes);
    
                geometry.computeBoundingBox();

                if (!textHeight) {
                    textHeight = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
                }
                
                const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
                const yBottom = - geometry.boundingBox.min.y;
                geometry.translate(xMid, yBottom, 0);

                const plane = new THREE.Mesh(geometry, matLite);
                plane.position.copy(latLngToVector3(point));
                plane.position.z = modelBox.max.z * 1.1 + (textArray.length - index) * (textHeight * 1.9);
                
                plane.rotation.x = 13.5;
                
                scene.add(plane);
            });
            

            const model = gltfModel.scene.clone();
            model.position.copy(latLngToVector3(point));
            scene.add(model);
        });
    }

    webGLOverlayView.onAdd = () =>
    {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera();

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.35);
        directionalLight.position.set(0.5, -1, 0.5);
        scene.add(directionalLight);

        loadingManager = new THREE.LoadingManager();

        const modelLoader = new GLTFLoader(loadingManager);
        const source = 'scene.gltf';

        modelLoader.load(source, gltf =>
        {
            gltfModel = gltf;
        });

        const fontLoader = new FontLoader(loadingManager);
        //fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(f)
        fontLoader.load('font.json', function(f)
        {
            font = f;
        });

    }

    webGLOverlayView.onContextRestored = ({ gl }) => {
        
        renderer = new THREE.WebGLRenderer(
        {
            canvas: gl.canvas,
            context: gl,
            ...gl.getContextAttributes(),
        });
        renderer.autoClear = false;

        loadingManager.onLoad = () => {
           
            createObjects();

            let tweens: Tween<google.maps.CameraOptions>[] = [];

            const zoom = 12;
            const delay = 3000;

            //Zoom to first point
            tweens.push(
                new Tween(cameraOptions) 
                .to({ tilt: 67.5, zoom: zoom }, 3000) 
                .easing(Easing.Quadratic.Out)
                .onUpdate(() => {
                    map.moveCamera(cameraOptions);
                })
            );

            // Rotate first point
            tweens.push(new Tween(cameraOptions) 
                    .to({ heading: '+360' }, 3000) 
                    .easing(Easing.Quadratic.Out)
                    .onUpdate(() => {
                        map.moveCamera(cameraOptions);
                    })
            );

            tweens[0].chain(tweens[1]);

            let tweenIndex = 2;
            pathCoordinate.forEach((data, index) => {
                if (index == 0) { // Skip first point
                    return;
                }

                const point = data.point;

                let moveTween = new Tween(cameraOptions) 
                    .to({ center: point }, 3000) 
                    .easing(Easing.Quadratic.Out)
                    .onUpdate(() => {
                        map.moveCamera(cameraOptions);
                    })
                    .delay(delay);

                let zoomOutTween = new Tween(cameraOptions) 
                    .to({ zoom: 6 }, 1500) 
                    .easing(Easing.Quadratic.Out)
                    .onUpdate(() => {
                        map.moveCamera(cameraOptions);
                    })
                    .delay(delay);

                let zoomInTween = new Tween(cameraOptions) 
                    .to({ zoom: zoom }, 1500) 
                    .easing(Easing.Quadratic.Out)
                    .onUpdate(() => {
                        map.moveCamera(cameraOptions);
                    });

                let rotateTween = new Tween(cameraOptions) 
                    .to({ heading: '+360' }, 3000) 
                    .easing(Easing.Quadratic.Out)
                    .onUpdate(() => {
                        map.moveCamera(cameraOptions);
                    });

                zoomOutTween.chain(zoomInTween);

                tweens[tweenIndex - 1].chain(moveTween, zoomOutTween);
                tweens.push(moveTween);
                tweenIndex++;

                moveTween.chain(rotateTween);
                tweens.push(rotateTween);
                tweenIndex++;
            });

            tweens[0].start();

            function animate(time: number) {
                requestAnimationFrame(animate);
                update(time);
            } 

            requestAnimationFrame(animate); 

            // renderer.setAnimationLoop(() => {
            //     map.moveCamera({
            //         "tilt": mapOptions.tilt,
            //         "heading": mapOptions.heading,
            //         "zoom": mapOptions.zoom
            //     });
        
            //     if (mapOptions.tilt < 67.5) {
            //         mapOptions.tilt += 0.5
            //     } else if (mapOptions.heading <= 360) {
            //         mapOptions.heading += 4;
            //     } else {
            //         renderer.setAnimationLoop(null)
            //     }
            // });
        }

    }

    webGLOverlayView.onDraw = ({ gl, transformer }) => {
        
        const latLngAltitudeLiteral = {
            lat: 0,
            lng: 0,
            altitude: 50
        }
        
        const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
        camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
        
        webGLOverlayView.requestRedraw();
        renderer.render(scene, camera);
        renderer.resetState();
    }

    webGLOverlayView.setMap(map);
}


function latLngToVector3(point) {
    const x = 6371010 * THREE.MathUtils.degToRad(point.lng);
    const y =
        0 -
        6371010 *
        Math.log(
            Math.tan(0.5 * (Math.PI * 0.5 - THREE.MathUtils.degToRad(point.lat)))
        );

    let target = new THREE.Vector3();

    return target.set(x, y, 0);
}
  


(async () =>
{
	
    const map = await initMap();
	    initWebGLOverlayView(map);
})();

export {};
 
