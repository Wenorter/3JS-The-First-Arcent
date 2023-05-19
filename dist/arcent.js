import * as THREE from 'three';
import {GUI} from './build/dat.gui.module.js';
import {OrbitControls} from './build/OrbitControls.js';
import {initSierpinski} from './sierpinski.js';

//==================================
//=======The First Arcent==========
//==================================

var renderer, scene, camera; 
var mesh, animation;

let arcentMaterial, uniforms;
let clock = new THREE.Clock();

const MAX_TIME = 5.0;

const options = {
    time: 0,
    speed: 0.01,
    animate: true,
    forward: true,
    loop: true
};

renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.sortObjects = false;
document.body.appendChild(renderer.domElement);

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const clearScene = function () {
    scene.children.forEach(c => {
        c.geometry.dispose();
    });
    scene.children = [];
};

/**
 * Sets the timestamp of the animation. This will generate a new geometry.
 */
const setTime = function (time) {
    clearScene();
    if (!time) time = 0;

    time = Math.min(MAX_TIME, Math.max(0, time));
    options.time = time;

    mesh = new THREE.Mesh(initSierpinski.generate(time), arcentMaterial);
    mesh.position.set(0, -0.5, 0);
    mesh.scale.setScalar(2);
    scene.add(mesh);
};

uniforms = { 
    u_resolution:
    {
        type: "v2",
        value : new THREE.Vector2(window.innerWidth, window.innerHeight)
    },
    u_fractalIndex:
    {
        type: "f",
        value: 10.0
    },
    u_time:
    {
        type: "f",
        value: 0.0
    },
    u_color:
    {
        type: "f",
        value: 1.01
    }
}

arcentMaterial = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    uniforms: uniforms,
    side: THREE.DoubleSide
});

const gui = new GUI();
gui.add(uniforms.u_fractalIndex, "value", 0, 100.0, 0.001).name("Arcent Corruption");
gui.add(uniforms.u_color, "value", 0, 10.0, 0.001).name("Enropy Purity");

let lastTime = 0;
const animate = function(){
    const now = performance.now();
    if (!lastTime) lastTime = now;
    
    // calculate the new timestamp using dt.
    // it stops at MAX_TIME / 0, unless options.loop === true
    if (options.animate) 
    {
        let newTime = 0;

        if (options.forward) {
            
            newTime = options.time + options.speed;
            while (newTime >= MAX_TIME) 
            {
                if (options.loop) 
                {
                    newTime -= MAX_TIME;             
                    if(Math.round(newTime) == 0 && options.forward)
                    {
                        newTime = MAX_TIME - 0.1; 
                        options.forward = false;
                    }                                                                                                     
                } 
                else 
                {        
                    newTime = MAX_TIME;                     
                }           
            }                     
        } 
        else 
        {  
            newTime = options.time - options.speed;
            while (newTime <= 0.0) 
            {
                if (options.loop) 
                {                          
                    newTime += MAX_TIME;
                    if(Math.round(newTime) == MAX_TIME && !options.forward)
                    {
                        newTime = 0.1;
                        options.forward = true; 
                    }        
                } 
                else 
                {                   
                    newTime = 0;         
                }                      
            }    
        }
 
        if (options.time !== newTime) {
            setTime(newTime);
        }   
    }

    requestAnimationFrame(animate)

    let increment = 0.03;
    scene.rotation.x += increment;
    scene.rotation.y += increment;
    scene.rotation.z += increment;

    
    animateShader(); 
    controls.update();
    renderer.render(scene, camera);
   
}

const animateShader = function(){

    const deltaTime = clock.getDelta();
    uniforms.u_time.value += deltaTime * 20;
}
const resetCamera = function () {
    camera.position.set(1.5, 1, 1.5);
    camera.lookAt(0,0,0);
};

window.addEventListener('resize', onWindowResize());
function onWindowResize(event){
    resetCamera();
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.u_resolution.value.x = renderer.domElement.width;
    uniforms.u_resolution.value.y = renderer.domElement.height;
};

window.addEventListener('click', () => {PlayAudio()}, {once: true});
function PlayAudio(){
    //Music
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const audioLoader = new THREE.AudioLoader();
    const backgroundMusic = new THREE.Audio(listener);

    audioLoader.load("./music/itiscoming.mp3", function(buffer)
    {
        backgroundMusic.setBuffer(buffer);
        backgroundMusic.setLoop(true);
        backgroundMusic.setPlaybackRate(0.5);
        backgroundMusic.setVolume(0.5);
        backgroundMusic.play();
    });
}
// initial camera position
resetCamera();

// trigger render loop
animate();
