import * as THREE from 'three';

const canvas = document.querySelector('#canvas3');

import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';


// import * as dat from './dat.gui.module.js';
// const gui = new dat.GUI();



let cursor = {
    x: 0,
    y: 0
}


window.addEventListener('resize', () => {
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

})


// by dividing the mouse position by the window size we can get a value between 0 and 1
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / window.innerWidth -0.5
    cursor.y = event.clientY / window.innerHeight -0.5
})



var mouse ={
    x:innerWidth/2,
    y:innerHeight/2
}



window.addEventListener('mousemove',
    function(e){
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        // cursor.x = e.clientX - rect.left;
        // cursor.y = e.clientY - rect.top;
        console.log(rect.left,rect.top)
    }
)

window.addEventListener('resize',
    function(){
        canvas.width=window.innerWidth
        canvas.height=window.innerHeight
    }  
)

//scene
const scene = new THREE.Scene();


//axes helper
// const axesHelper = new THREE.AxesHelper(2)
// scene.add(axesHelper);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5, 5, 1, );
pointLight.position.set(-0.5, 0.5, -5)
scene.add(pointLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(0, 3, -3);
directionalLight.lookAt(new THREE.Vector3());
scene.add(directionalLight);


// geometry


const count= 500
const particleGeometry = new THREE.BufferGeometry()
const positionArray = new Float32Array(count * 3)


for (let i = 0; i < count * 3; i++) {
    positionArray[i] = (Math.random() - 0.5) * 10
}


particleGeometry.setAttribute(
    'position', 
    new THREE.BufferAttribute(positionArray,3))


const particleMaterial = new THREE.PointsMaterial()
particleMaterial.size = 0.01
particleMaterial.sizeAttenuation = true


const particles = new THREE.Points(particleGeometry,particleMaterial)
scene.add(particles)



let model;

const loader = new GLTFLoader();
loader.load(
    './assest/planet/scene.gltf',
    function(gltf){
         model = gltf.scene;

        model.position.y = -0.3
        model.position.x = 1
        model.position.z = -0.1

        scene.add(model)
 
    }
)


const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100);
scene.add( camera );

camera.position.z = 2



const renderer = new THREE.WebGLRenderer({canvas:canvas , antialias:true, alpha: true});
renderer.setSize(  window.innerWidth, window.innerHeight);

    // set pixel ratio - means every pixel should not be divided more that 4 times 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.render( scene, camera );


const clock = new THREE.Clock()


// Animation
function animate() {
    
    const elapsedTime = clock.getElapsedTime()

if(model){
    model.rotation.y = elapsedTime *0.1
}
    // earthGroup.rotation.y = elapsedTime *0.1    

    particles.rotation.y = elapsedTime *0.1

    
    requestAnimationFrame( animate );
    // render
    renderer.render( scene, camera ); 
}
animate();

