/**
 * @license
 * Copyright 2021 Google LLC.
 * SPDX-License-Identifier: Apache-2.0
 */
 
 import
{
    Loader
}
from '@googlemaps/js-api-loader';

import * as THREE from 'three';
import
{
    GLTFLoader
}
from 'three/examples/jsm/loaders/GLTFLoader.js';
import
{
    FontLoader
}
from 'three/examples/jsm/loaders/FontLoader.js';
const apiOptions = {
    "apiKey": 'AIzaSyDTXbPV5vjBAwjN83TF0Wr6afPiusxzxGE',
};

import { Easing, Tween, update } from "@tweenjs/tween.js";
 
let map: google.maps.Map;

const cameraOptions: google.maps.CameraOptions = {
  tilt: 0,
  heading: 0,
  zoom: 3,
  center: { lat: 35.6594945, lng: 139.6999859 },
};

const mapOptions = {
  ...cameraOptions,
   "tilt": 0,
    "heading": 0,
    "zoom": 5,
    "center":
    {
        lat: 35.6594945,
        lng: 139.6999859
    },
    "mapId": "cde5e7a5d01eaf90"
};

async function initMap() {
	
  const mapDiv = document.getElementById("map");	
  const apiLoader = new Loader(apiOptions);
  await apiLoader.load();	
 // return new google.maps.Map(mapDiv, mapOptions);
  return  new google.maps.Map(   	 document.getElementById("map") as HTMLElement,    mapOptions  );
  

  // install Tweenjs with npm i @tweenjs/tween.js

}

function initWebGLOverlayView(map)
{
	
/* 	
	  new Tween(cameraOptions) // Create a new tween that modifies 'cameraOptions'.
    .to({ tilt: 65, heading: 90, zoom: 18 }, 15000) // Move to destination in 15 second.
    .easing(Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
    .onUpdate(() => {
      map.moveCamera(cameraOptions);
    })
    .start(); // Start the tween immediately.

  // Setup the animation loop.
   function animate(time: number) {
    requestAnimationFrame(animate);
    update(time);
  } 

  requestAnimationFrame(animate); 
   */
  
  window.setTimeout(() =>
    {
        let data = [
            ["2019-06-28T07:33:03", 37.610225, 55.651365],
            ["2019-06-28T07:33:40", 48.6107283333333, 15.6511716666667],
            ["2019-06-28T07:33:46", 32.610745, 55.6510383333333],
            ["2019-06-28T07:33:47", 19.610785, 55.6510233333333],
            ["2019-06-28T07:33:48", 18.61083, 78.65103]
        ];
        const pathCoordinate = [];
        data.forEach(path =>
        {
            pathCoordinate.push(
            {
                lat: path[2],
                lng: path[1]
            });
        });
        var i;
        var len = pathCoordinate.length
        for (i = 1; i < len; i++)
        {
            (function(i)
            {
                setTimeout(function()
                {
				

					cameraOptions.center.lat = 		pathCoordinate[i].lat;		
					cameraOptions.center.lng = 		pathCoordinate[i].lng;
					cameraOptions.center.zoom = 		10;
					
					
					console.log (cameraOptions.center);
					new Tween(cameraOptions) // Create a new tween that modifies 'cameraOptions'.
					.to({ tilt: 65, heading: 90, zoom: 10 }, 10000) // Move to destination in 15 second.
					.easing(Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
					.onUpdate(() => {
					  map.moveCamera(cameraOptions);
					})
					.start(); // Start the tween immediately.
					function animate(time: number) {
						requestAnimationFrame(animate);
						update(time);
					} 

					requestAnimationFrame(animate); 
					
					
					mapOptions.tilt =0;
					mapOptions.heading=0;
                    //var latLng = new google.maps.LatLng(pathCoordinate[i]);
                    //map.panTo(latLng);
                    let scene, renderer, camera, loader;
                    // WebGLOverlayView c ode goes here
                    const webGLOverlayView = new google.maps.WebGLOverlayView();
                    webGLOverlayView.onAdd = () =>
                    {
                        scene = new THREE.Scene();
                        camera = new THREE.PerspectiveCamera();
                        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
                        scene.add(ambientLight);
                        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
                        directionalLight.position.set(0.5, -1, 0.5);
                        scene.add(directionalLight);
                        loader = new GLTFLoader();
                        const source = 'scene.gltf';
                        loader.load(source, gltf =>
                        {
                            gltf.scene.scale.set(25, 25, 25);
                            gltf.scene.rotation.x = 90 * Math.PI / 180;
                            scene.add(gltf.scene);
                        });
                        const loader2 = new FontLoader();
                        loader2.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font)
                        {
                            const matLite = new THREE.MeshBasicMaterial(
                            {
                                color: 0xFF0000,
                                opacity: 1,
                                side: THREE.DoubleSide
                            });
                            const message = "Just a test " + i;
                            const shapes = font.generateShapes(message, 10);
                            const geometry = new THREE.ShapeGeometry(shapes);
                            geometry.computeBoundingBox();
                            const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
                            geometry.translate(xMid, 0, 0);
                            const plane = new THREE.Mesh(geometry, matLite);
                            //mesh = new THREE.Mesh( );
                            plane.position.z = +150;
                            plane.position.y = 50;
                            plane.rotation.x = 14;
                            scene.add(plane);
                        });
                    }
                    webGLOverlayView.onContextRestored = (
                    {
                        gl
                    }) =>
                    {
                        ;
                        renderer = new THREE.WebGLRenderer(
                        {
                            canvas: gl.canvas,
                            context: gl,
                            ...gl.getContextAttributes(),
                        });
                        renderer.autoClear = false;
                        loader.manager.onLoad = () =>
                        {
                            renderer.setAnimationLoop(() =>
                            {
                                map.moveCamera(
                                {
                                    "tilt": mapOptions.tilt,
                                    "heading": mapOptions.heading,
                                    "zoom": mapOptions.zoom
                                });
                                if (mapOptions.tilt < 67.5)
                                {
                                    mapOptions.tilt += 0.5
                                }
                                else if (mapOptions.heading <= 360)
                                {
                                    mapOptions.heading += 5;
                                }
                                else
                                {
                                    renderer.setAnimationLoop(null)
                                }
                            });
                        } 
                    }
                    webGLOverlayView.onDraw = (
                    {
                        gl,
                        transformer
                    }) =>
                    {
                        //console.log(pathCoordinate[i].lat);
                        const latLngAltitudeLiteral = {
                            //lat: mapOptions.center.lat.
                            //lng: mapOptions.center.lng,
                            lat: pathCoordinate[i].lat,
                            lng: pathCoordinate[i].lng,
                            altitude: 50
                        }
                        const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
                        camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
                        webGLOverlayView.requestRedraw();
                        renderer.render(scene, camera);
                        renderer.resetState();
                    }
                    webGLOverlayView.setMap(map);
                }, 5000 * i);
            }(i));
        }
    }, 100);
    //});	 
}


(async () =>
{
    const map = await initMap();
    initWebGLOverlayView(map);
})();
export {};
