import * as THREE from 'three';

const canvas = document.querySelector('#canvas2');

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import {FontLoader} from './three/examples/jsm/loaders/FontLoader.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';

// import * as dat from './dat.gui.module.js';
// const gui = new dat.GUI();

// import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';

//cursor

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


//Ball canvas


var ballCanvas = document.createElement('canvas');

ballCanvas.width = window.innerWidth;
ballCanvas.height = window.innerHeight;

var c = ballCanvas.getContext('2d');


//variables
var mouse ={
    x:innerWidth/2,
    y:innerHeight/2
}

var colorArray = [
    // '#010221',
    '#0A7373',
    '#B7BF99',
    // '#EDAA25',
    // '#ff1100',
    // '#C43302'
]


//event listeners
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
        ballCanvas.width=window.innerWidth
        ballCanvas.height=window.innerHeight
    }  
)


//utility function

function randomIntFromRange(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function randomColor(color){
    return color[Math.floor(Math.random()*color.length)];
}

// we have to calc the distance first
function getDistance(x1,x2,y1,y2){
    let xDistance = x2-x1;
    let yDistance = y2-y1;

    return Math.sqrt(Math.pow(xDistance,2)+Math.pow(yDistance,2));
}

// Collision Detection !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

/**
 * Swaps out two colliding ballParticles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of ballParticles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        
        // Grab angle between the two colliding ballParticles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        
        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        
        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);
        
        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };
        
        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);
        
        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

// Function to draw background color and border
function drawBackgroundAndBorder() {
    
    c.save();
    // Draw background color
    c.fillStyle = '#010101';
    c.fillRect(0, 0, ballCanvas.width, ballCanvas.height);

    // Draw border
    c.strokeStyle = 'white';
    c.lineWidth =2;
    c.strokeRect(0, 0, ballCanvas.width, ballCanvas.height);
    c.restore();
}


//object
function ballParticle(x,y,radius,color){
        this.x=x;
        this.y=y;
        this.velocity= {
            x:(Math.random()-0.5) *2,
            y:(Math.random()-0.5 )*2
        }
        this.radius=radius;
        this.color=color;
        this.mass = 1;
        this.opacity=0

        
        
        this.draw = function (){
            c.beginPath();
            c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
            c.save();
            c.globalAlpha=this.opacity;
            c.fillStyle =this.color;
            c.fill()
            c.restore();
            c.strokeStyle =this.color
            c.stroke();
            c.closePath();
        }
    
        this.update = function(){

        this.draw();

        for(let i =0; i<ballParticles.length;i++){
            if (this ===ballParticles[i]) continue;
            if(getDistance(this.x,ballParticles[i].x,this.y,ballParticles[i].y) - radius*2 < 0){
                resolveCollision(this , ballParticles[i] );
            }
        }

        if(this.x - this.radius<=0 || this.x + this.radius>=innerWidth){
            this.velocity.x = - this.velocity.x
        }
        if(this.y - this.radius<=0 || this.y + this.radius>=innerHeight){
            this.velocity.y = - this.velocity.y
        }

        if(getDistance(mouse.x,this.x,mouse.y,this.y)<80 && this.opacity<0.4){
            this.opacity +=0.02;
        } else if(this.opacity>0 ){
            this.opacity -=0.02;

            this.opacity = Math.max(0,this.opacity)
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        }
    }

//implementation

let ballParticles;
function init(){
    ballParticles =[];

    for(let i =0; i<50;i++){
        const radius =15;
        let x = Math.random()*(innerWidth-radius*2)+radius;
        let y = Math.random()*(innerHeight-radius*2)+radius;
        const color =randomColor(colorArray);

        if(i!=0){
            for(let j=0; j<ballParticles.length;j++){
                if(getDistance(x,ballParticles[j].x,y,ballParticles[j].y) - radius*2 < 0){
                    x = Math.random()*(innerWidth-radius*2)+radius;
                    y = Math.random()*(innerHeight-radius*2)+radius;

                    j =-1;
                }
            }
        }

        ballParticles.push(new ballParticle(x,y,radius,color))
    }
}

//animation loop
function circle_object_motion(){
    requestAnimationFrame(circle_object_motion);
    c.clearRect(0,0,ballCanvas.width,ballCanvas.height);
    drawBackgroundAndBorder();
    
    ballParticles.forEach(particle => {
        particle.update(ballParticles);
    });

}


// Initial draw
drawBackgroundAndBorder();
init();
circle_object_motion();



//scene
const scene = new THREE.Scene();


//axes helper
// const axesHelper = new THREE.AxesHelper(2)
// scene.add(axesHelper);



// // LIGHTS


//ambient light 
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5, 5, 1, );
pointLight.position.set(-0.5, 0.5, -5)
scene.add(pointLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(0, 3, -3);
directionalLight.lookAt(new THREE.Vector3());
scene.add(directionalLight);


// gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001);
// gui.add(directionalLight.position, 'x').min(-9).max(9).step(0.01);
// gui.add(directionalLight.position, 'y').min(-9).max(9).step(0.01);
// gui.add(directionalLight.position, 'z',-9, 9, 0.01);

// gui.add(pointLight, 'intensity').min(0).max(1).step(0.001);
// gui.add(pointLight.position, 'x').min(-15).max(16).step(0.01);
// gui.add(pointLight.position, 'y').min(-15).max(15).step(0.01);
// gui.add(pointLight.position, 'z',-13, 13, 0.01);

// light helper
// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(directionalLightHelper);

// const pointLightHelper = new THREE.PointLightHelper(pointLight, 5);
// scene.add(pointLightHelper);

// texture
const textureLoader = new THREE.TextureLoader()


// Load skybox textures
const cubeTextureLoader = new THREE.CubeTextureLoader();

const enviormentMapTexture = cubeTextureLoader.load([
    './assest/Standard-Cube-Map5/px.png',
    './assest/Standard-Cube-Map5/nx.png',
    './assest/Standard-Cube-Map5/py.png',
    './assest/Standard-Cube-Map5/ny.png',
    './assest/Standard-Cube-Map5/pz.png',
    './assest/Standard-Cube-Map5/nz.png'
])

const matcapTexture = textureLoader.load('./assest/image/matcap.jpg');

// Apply the skybox texture to the scene's background
scene.background = enviormentMapTexture;




// Fonts 
const fontLoader = new FontLoader();            // new instance

fontLoader.load(
   // resource URL
    './assest/font/helvetiker_regular.typeface.json',

	// onLoad callback
	function ( font ) {
		// do something with the font

        const textgeometry = new TextGeometry( 'Hi, I'+"'"+'m Arihant Jain', {
            font: font,
            size: 0.7,
            depth: 0.2,
            curveSegments: 8,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        } );

        textgeometry.computeBoundingBox();
        textgeometry.center();            


        const textmaterial = new THREE.MeshMatcapMaterial({
            matcap: matcapTexture,
            color: 'white',
            // blending: THREE.AdditiveBlending 
        });
        const text = new THREE.Mesh( textgeometry, textmaterial);

        text.position.z = -5
        text.position.y = 3.5
        
        
        const textgeometry2 = new TextGeometry( ' | Full Stack Web Developer |', {
            font: font,
            size: 0.3,
            depth: 0.1,
            curveSegments: 8,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        } );
        
        textgeometry2.computeBoundingBox();
        textgeometry2.center();            

        const textmaterial2 = new THREE.MeshMatcapMaterial({
            matcap: matcapTexture,
            color: 'Yellow',
        });

        const text2 = new THREE.Mesh( textgeometry2, textmaterial2 );
        
        text2.position.z = -7
        text2.position.x = 2
        text2.position.y = 3
        scene.add( text );
        scene.add( text2 );

	},

	// onProgress callback
	function ( xhr ) {
	},

	// onError callback
	function ( err ) {
	}
)

const groupLeft = new THREE.Group();
const groupRight = new THREE.Group();

const loader = new GLTFLoader();
loader.load(
    './assest/model/laptop.glb',
    function(gltf){
        const model = gltf.scene;

        model.scale.set(2.8,3.3,3.1)
        model.position.y = -2.8
        model.position.x = -0.1
        model.position.z = -0.95

        model.traverse((child) => {
            if (child.isMesh) {
                child.material.metalness = 1;
                child.material.roughness = 0.3;
            }
        })
 
        groupLeft.add(model);

    }
)
loader.load(
    './assest/model/laptop.glb',
    function(gltf){
        const model2 = gltf.scene;

        model2.scale.set(2.8,3.3,3.1)
        model2.position.y = -2.8
        model2.position.x = -0.1
        model2.position.z = -0.95

        model2.traverse((child) => {
            if (child.isMesh) {
                child.material.metalness = 1;
                child.material.roughness = 0.3;
            }
        })
 
        groupRight.add(model2);

    }
)

loader.load(
    './assest/model/astronout.glb',
    function(gltf){
        const model2 = gltf.scene;

        model2.scale.set(5,5,5)

        model2.traverse((child) => {
            if (child.isMesh) {
                child.material.metalness = 0.7;
                child.material.roughness = 0.2;
            }
        })

        // gui.add(model2.position, 'x').min(-15).max(15).step(0.01).name('cube x')
        // gui.add(model2.position, 'y').min(-15).max(15).step(0.01).name('cube y')
        // gui.add(model2.position, 'z',-11, 18, 0.01).name('cube z')
        // gui.add(model2.rotation, 'x').min(-15).max(15).step(0.01).name('cube x')
        // gui.add(model2.rotation, 'y').min(-15).max(15).step(0.01).name('cube y')
        // gui.add(model2.rotation, 'z',-5, 5, 0.01).name('cube z')
        // gui.add(model2.scale, 'x').min(-5).max(5).step(0.01).name('cube x')
        // gui.add(model2.scale, 'y').min(-5).max(5).step(0.01).name('cube y')
        // gui.add(model2.scale, 'z',-5, 5, 0.01).name('cube z')
 
        model2.position.set(-12,-11,-11)
        model2.rotation.set(5.4,5.4,-1)
        scene.add(model2);

    }
)

//geometry

// const canvasTexture = new THREE.CanvasTexture(document.querySelector('canvas'));
const canvasTexture = new THREE.CanvasTexture(ballCanvas);


// const planematerial = new THREE.MeshStandardMaterial( { color: 0xffffff  } );
const planematerial = new THREE.MeshBasicMaterial( {  map: canvasTexture  } );


//left plane
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 5,100,100),
    planematerial
)

plane.position.z = -3
groupLeft.add(plane)

groupLeft.rotateY(Math.PI * 0.4)
groupLeft.position.x = -5
scene.add(groupLeft);

//right plane
const plane2 = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 5,100,100),
    planematerial
)
// plane.rotation.x = - Math.PI * 0.5
plane2.position.z = -3
groupRight.add(plane2)

groupRight.position.x = 5
groupRight.rotateY(-Math.PI * 0.4)

scene.add(groupRight);



//camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100);
scene.add( camera );

const controls = new OrbitControls( camera, canvas );
controls.enableDamping = true
controls.dampingFactor = 0.05

controls.minDistance = 2
controls.maxDistance = 3

controls.minPolarAngle = Math.PI * 0.35
controls.maxPolarAngle = Math.PI * 0.60

controls.minAzimuthAngle = Math.PI *1.6
controls.maxAzimuthAngle = Math.PI *0.4

camera.position.z = 2


//renderer
const renderer = new THREE.WebGLRenderer({canvas:canvas , antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );

    // set pixel ratio - means every pixel should not be divided more that 4 times 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.render( scene, camera );

// Animation
function animate() {
    
    // update controls for orbit controls
    controls.update();
    canvasTexture.needsUpdate = true;

    
    requestAnimationFrame( animate );
    // render
    renderer.render( scene, camera ); 
}
animate();

