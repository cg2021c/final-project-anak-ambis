// import * as gltfloader from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from './three.module.js';
import { GLTFLoader } from "./GLTFLoader.js";
import { OBJLoader } from './OBJLoader.js';
import { MTLLoader } from './MTLLoader.js';
import { Colors } from './Colors.js';
import { FBXLoader } from './FBXLoader.js'

/**
 *
 * KARS
 * ----
 * Survival driving game, created by Alvin Wan (alvinwan.com)
 */

const filename = [
    '1Story_GableRoof_Mat',
    '1Story_Mat',
    '1Story_RoundRoof_Mat',
    '1Story_Sign_Mat',
    '2Story_2_Mat',
    '2Story_Balcony_Mat',
    '2Story_Center_Mat',
    '2Story_Columns_Mat',
    '2Story_Double_Mat',
    '2Story_GableRoof_Mat',
    '2Story_Mat',
    '2Story_RoundRoof_Mat',
    '2Story_Sidehouse_Mat',
    '2Story_Sign_Mat',
    '2Story_Slim_Mat',
    '2Story_Stairs_Mat',
    '2Story_Wide_2Doors_Mat',
    '2Story_Wide_Mat',
    '3Story_Balcony_Mat',
    '3Story_Slim_Mat',
    '3Story_Small_Mat',
    '4Story_Center_Mat',
    '4Story_Mat',
    '4Story_Wide_2Doors_Mat',
    '4Story_Wide_2Doors_Roof_Mat',
    '6Story_Stack_Mat'
];

const districtInformatics = {
    buildings: [{
            objPath: '../assets/building/OBJ/6Story_Stack_Mat.obj',
            mtlPath: '../assets/building/OBJ/6Story_Stack_Mat.mtl',
            x: -100,
            y: 10,
            z: -100,
            scale: 75.0,
            radius: 160
        },
        {
            objPath: '../assets/building/OBJ/6Story_Stack_Mat.obj',
            mtlPath: '../assets/building/OBJ/6Story_Stack_Mat.mtl',
            x: 60,
            y: 10,
            z: -100,
            scale: 75.0,
            radius: 160
        },
        {
            objPath: '../assets/building/OBJ/1Story_GableRoof_Mat.obj',
            mtlPath: '../assets/building/OBJ/1Story_GableRoof_Mat.mtl',
            x: 220,
            y: 10,
            z: -100,
            scale: 75.0,
            radius: 160
        },
        {
            objPath: '../assets/building/OBJ/SmallTower.obj',
            mtlPath: '../assets/building/OBJ/SmallTower.mtl',
            x: -400,
            y: 10,
            z: -100,
            scale: 300.0,
            radius: 160
        },
        {
            objPath: '../assets/building/OBJ/SmallTower.obj',
            mtlPath: '../assets/building/OBJ/SmallTower.mtl',
            x: -800,
            y: 10,
            z: -100,
            scale: 300.0,
            radius: 160
        },
    ]
};

/**
 *
 * STEP 0
 * ------
 * Copy car customization.
 */

var bodyColor = Colors.brown;
var roofColor = Colors.brown;
var bumperColor = Colors.brownDark;
var grateColor = Colors.brownDark;
var doorColor = Colors.brown;
var handleColor = Colors.brownDark;
var _previousRAF = null;
var camStartingPos = new THREE.Vector3(0, 400, 450);
var shadowStartingPos = new THREE.Vector3(150, 350, 350);
var loader;
var mesh_import;

/**
 *
 * RENDER
 * ------
 * Initial setup for camera, renderer, fog
 *
 * Boilerplate for scene, camera, renderer, lights taken from
 * https://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
 */
var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
    renderer, container;
const clock = new THREE.Clock()

/********** End step 0 **********/

function init() {

    createScene();
    createLights();

    // Add the objects
    createGround();
    loadDistrict();
    createCar();
    createLevel();

    // add custom objects
    // createLoader();

    // Add controls
    createControls();

    // CONTOH PENGGUNAAN LOAD OBJ ================================
    loadObjModel('/assets/building/OBJ/6Story_Stack_Mat.obj',
            '/assets/building/OBJ/6Story_Stack_Mat.mtl')
        .then(model => {
            model.position.x = -400
            model.scale.x = 50
            model.scale.y = 50
            model.scale.z = 50

            scene.add(model)
            console.log("load sukses")
        })

    // END LOAD OBJ =====================================================


    // Reset game
    resetGame();

    loop();
}

function loadTruck() {
    return new Promise((resolve) => {
        var mtlLoader = new MTLLoader();
        var objMesh;

        mtlLoader.load('../assets/truckObj/source/Garbage Truck1.mtl', function(mtl) {
            mtl.preload();
            var objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);

            objLoader.load('../assets/truckObj/source/Garbage Truck1.obj', function(object) {
                objMesh = object;
                resolve(objMesh);

            });
        });

    });
}

// TODO: it's still need tobe tested
function loadGltfModel(pathGltf, pathMtl) {
    return new Promise((resolve) => {
        var mtlLoader = new MTLLoader();
        var objMesh;
        var objLoader = GLTFLoader();
        objLoader.load(pathGltf, function(object) {
            objMesh = object.scene;
            objMesh.castShadow = true;
            objMesh.receiveShadow = true;

            resolve(objMesh);
        });
    });
}

function loadDistrict() {
    districtInformatics.buildings.forEach(building => {
        loadObjModel(building.objPath, building.mtlPath).then((buildingMesh) => {
            buildingMesh.position.x = building.x;
            buildingMesh.position.y = building.y;
            buildingMesh.position.z = building.z;


            // buildingMesh.setMaterials(new THREE.MeshPhongMaterial({ color: Colors.green }))

            buildingMesh.scale.set(building.scale, building.scale, building.scale);

            buildingMesh.collidable = createCollidable(building.x, building.z, building.radius);
        });
    });
}

function loadFbxModel(pathFbx) {
    return new Promise((resolve) => {
        var fbxLoader = new FBXLoader();
        var objMesh;

        fbxLoader.load(pathFbx, function(model) {
            objMesh = model
            resolve(objMesh);

        });
    });
}

function createCollidable(x, z, radius) {
    const collidable = createCylinder(radius, radius, 200, 4, Colors.green, x, 10, z);
    collidableTrees.push(collidable);
    return collidable;
}

function loadObjModel(pathObj, pathMtl) {
    return new Promise((resolve) => {
        var mtlLoader = new MTLLoader();
        var objMesh;

        mtlLoader.load(pathMtl, function(mtl) {
            mtl.preload();
            var objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);

            objLoader.load(pathObj, function(object) {
                objMesh = object;
                objMesh.castShadow = true;
                objMesh.receiveShadow = true;
                objMesh.children.forEach(child => {
                    child.castShadow = true;
                    child.receiveShadow = true;

                });
                // scene.add( objMesh );
                resolve(objMesh);
            });
        });
    });
}

function createScene() {
    // Get the width and the height of the screen,
    // use them to set up the aspect ratio of the camera
    // and the size of the renderer.
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    // Create the scene
    scene = new THREE.Scene();

    // Add a fog effect to the scene; same color as the
    // background color used in the style sheet
    scene.fog = new THREE.Fog(0xbadbe4, 700, 1000);

    // Create the camera
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );

    // Set the position of the camera
    camera.position.set(0, 400, 400);
    camera.lookAt(0, 0, 0);

    // Create the renderer
    renderer = new THREE.WebGLRenderer({
        // Allow transparency to show the gradient background
        // we defined in the CSS
        alpha: true,

        // Activate the anti-aliasing; this is less performant,
        // but, as our project is low-poly based, it should be fine :)
        antialias: true
    });

    // Define the size of the renderer; in this case,
    // it will fill the entire screen
    renderer.setSize(WIDTH, HEIGHT);

    // Enable shadow rendering
    renderer.shadowMap.enabled = true;

    // Add the DOM element of the renderer to the
    // container we created in the HTML
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    // Listen to the screen: if the user resizes it
    // we have to update the camera and the renderer size
    window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
    // update height and width of the renderer and the camera
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}


/**
 *
 * LIGHTS
 * ------
 * Utilities for applying lights in scene
 */
var hemisphereLight, shadowLight;

function createLights() {
    // A hemisphere light is a gradient colored light;
    // the first parameter is the sky color, the second parameter is the ground color,
    // the third parameter is the intensity of the light
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)

    // A directional light shines from a specific direction.
    // It acts like the sun, that means that all the rays produced are parallel.
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);

    // Set the direction of the light
    shadowLight.position.set(150, 350, 350);

    // Allow shadow casting
    shadowLight.castShadow = true;

    // define the visible area of the projected shadow
    shadowLight.shadow.camera.left = -800;
    shadowLight.shadow.camera.right = 800;
    shadowLight.shadow.camera.top = 800;
    shadowLight.shadow.camera.bottom = -800;
    shadowLight.shadow.camera.near = 0;
    shadowLight.shadow.camera.far = 20000;

    // define the resolution of the shadow; the higher the better,
    // but also the more expensive and less performant
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    // to activate the lights, just add them to the scene
    scene.add(hemisphereLight);
    scene.add(shadowLight);

}

/**
 *
 * OBJECTS
 * -------
 * Definitions and constructors for car, fuel, tree, ground
 */
var car, fuel, ground, trees = [],
    collidableTrees = [],
    numTrees = 10,
    collidableFuels = [];
var mixer, animationAction;

/**
 * Generic box that casts and receives shadows
 */
function createBox(dx, dy, dz, color, x, y, z, notFlatShading) {
    var geom = new THREE.BoxGeometry(dx, dy, dz);
    var mat = new THREE.MeshPhongMaterial({ color: color, flatShading: notFlatShading != true });
    var box = new THREE.Mesh(geom, mat);
    box.castShadow = true;
    box.receiveShadow = true;
    box.position.set(x, y, z);
    return box;
}

/**
 * Generic cylinder that casts and receives shadows
 */
function createCylinder(radiusTop, radiusBottom, height, radialSegments, color,
    x, y, z) {
    var geom = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    var mat = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
    var cylinder = new THREE.Mesh(geom, mat);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.set(x, y, z);
    return cylinder;
}

/**
 * Cylinder with rotation specific to car
 */
function createTire(radiusTop, radiusBottom, height, radialSegments, color, x, y, z) {
    var cylinder = createCylinder(radiusTop, radiusBottom, height, radialSegments, color, x, y, z);
    cylinder.rotation.x = Math.PI / 2; // hardcoded for tires in the car below
    return cylinder;
}

/**
 * Template for Car with "advanced motion" (i.e., acceleration and deceleration,
 * rotation speed as a function of speed)
 */
function Car() {

    var direction = new THREE.Vector3(1., 0., 0.);
    var maxSpeed = 10.;
    var acceleration = 0.25;
    var currentSpeed = 0;
    var steeringAngle = Math.PI / 24;

    var movement = {
        'forward': false,
        'left': false,
        'right': false,
        'backward': false
    }

    this.berth = 100; // berth for new collidables (e.g., if berth is 100, no
    // tree will be initialized with 100 units)
    this.mesh = new THREE.Object3D();

    var body = createBox(140, 0, 50, bodyColor, 0, 0, 0);
    body.material.transparent = true
    body.material.opacity = 0;

    this.mesh.add(body)

    loadObjModel('../assets/truckObj/source/Garbage Truck1.obj', '../assets/truckObj/source/Garbage Truck1.mtl').then((truck) => {
        truck.position.x = 0;
        truck.position.y = 20;
        truck.position.z = 0;

        truck.rotation.y = 3.14
        truck.scale.x = 0.2;
        truck.scale.y = 0.2;
        truck.scale.z = 0.2;

        this.mesh.add(truck)
    })

    var headLightLeftLight = new THREE.PointLight(0xffcc00, 1, 100);
    headLightLeftLight.position.set(70, 5, 15);
    this.mesh.add(headLightLeftLight);

    var headLightRightLight = new THREE.PointLight(0xffcc00, 1, 100);
    headLightRightLight.position.set(70, 5, -15);
    this.mesh.add(headLightRightLight);

    function computeR(radians) {
        var M = new THREE.Matrix3();
        M.set(Math.cos(radians), 0, -Math.sin(radians),
            0, 1, 0,
            Math.sin(radians), 0, Math.cos(radians));
        return M;
    }

    this.update = function() {
        var sign, R, currentAngle;
        var is_moving = currentSpeed != 0;
        var is_turning = movement.left || movement.right;
        this.mesh.position.addScaledVector(direction, currentSpeed);
        this.mesh.updateMatrixWorld();

        // disallow travel through trees
        if (objectInBound(this.collidable, collidableTrees) && is_moving) {
            while (objectInBound(this.collidable, collidableTrees)) {
                this.mesh.position.addScaledVector(direction, -currentSpeed);
                this.mesh.updateMatrixWorld();
            }
            currentSpeed = 0;
            is_moving = false;
        }

        // update speed according to acceleration
        if (movement.forward) {
            currentSpeed = Math.min(maxSpeed, currentSpeed + acceleration);
        } else if (movement.backward) {
            currentSpeed = Math.max(-maxSpeed, currentSpeed - acceleration);
        }

        // update current position based on speed
        if (is_moving) {
            sign = currentSpeed / Math.abs(currentSpeed);
            currentSpeed = Math.abs(currentSpeed) - acceleration / 1.5;
            currentSpeed *= sign;

            // update and apply rotation based on speed
            if (is_turning) {
                currentAngle = movement.left ? -steeringAngle : steeringAngle;
                currentAngle *= currentSpeed / maxSpeed;
                R = computeR(currentAngle);
                direction = direction.applyMatrix3(R);
                this.mesh.rotation.y -= currentAngle;
            }
        }
    }

    this.moveForward = function() { movement.forward = true; }
    this.stopForward = function() { movement.forward = false; }

    this.turnLeft = function() { movement.left = true; }
    this.stopLeft = function() { movement.left = false; }

    this.turnRight = function() { movement.right = true; }
    this.stopRight = function() { movement.right = false; }

    this.moveBackward = function() { movement.backward = true; }
    this.stopBackward = function() { movement.backward = false; }

    this.collidable = body;

    this.reset = function() {
        car.mesh.position.set(-300, 25, -150);
        direction = new THREE.Vector3(1., 0., 0.);
        currentSpeed = 0;
        movement['forward'] = movement['backward'] = false
        movement['left'] = movement['right'] = false
        car.mesh.rotation.y = 0;
    }
}

/**
 * Create car with hard-coded start location
 */
function createCar() {
    car = new Car();
    scene.add(car.mesh);
}

/**
 * Create simple green, rectangular ground
 */
function createGround() {
    ground = createBox(3000, 20, 3000, Colors.greenDark, 0, 0, 0);
    scene.add(ground);
}

/**
 * Template for tree with three triangular prisms for foliage and a cylinderical
 * trunk.
 */
function Tree() {

    this.mesh = new THREE.Object3D();
    var top = createCylinder(1, 30, 30, 4, Colors.green, 0, 90, 0);
    var mid = createCylinder(1, 40, 40, 4, Colors.green, 0, 70, 0);
    var bottom = createCylinder(1, 50, 50, 4, Colors.green, 0, 40, 0);
    var trunk = createCylinder(10, 10, 30, 32, Colors.brownDark, 0, 0, 0);

    this.mesh.add(top);
    this.mesh.add(mid);
    this.mesh.add(bottom);
    this.mesh.add(trunk);

    this.collidable = bottom;
}

/**
 * Creates tree according to specifications
 */
function createTree(x, z, scale, rotation) {
    var tree = new Tree();
    trees.push(tree);
    scene.add(tree.mesh);
    tree.mesh.position.set(x, 0, z);
    tree.mesh.scale.set(scale, scale, scale);
    tree.mesh.rotation.y = rotation;
    return tree;
}

/**
 * Template for fuel container
 */
function Fuel() {
    this.mesh = new THREE.Object3D();
    this.berth = 100;
    this.modelReady = false
    this.animReady = false
    this.animationArr = []
    this.currAnim = 0

    var slab = createBox(50, 5, 50, Colors.brown, 0, 0, 0);

    var light = new THREE.PointLight(0xffcc00, 1, 100);
    light.position.set(0, 60, 0);

    this.mesh.add(slab);

    loadFbxModel('../assets/monsterfbx/Dragon.fbx').then(monster => {
        console.log(monster)
        monster.animations.forEach(anim => {
            this.animationArr.push(anim)
        });

        mixer = new THREE.AnimationMixer(monster);

        monster.scale.x = 0.4;
        monster.scale.y = 0.4;
        monster.scale.z = 0.4;
        monster.position.x = -50

        this.mesh.add(monster)

        this.modelReady = true;
        this.switchAnim(this.currAnim);

    })

    this.collidable = this.mesh.children[0];

    this.switchAnim = function(num) {
        if (this.animationArr[num]) {
            if (this.currAnim != num) {
                animationAction.stop();

                animationAction = mixer.clipAction(this.animationArr[num]);
                this.currAnim = num
                animationAction.play();

                this.animReady = true;

            } else {
                animationAction = mixer.clipAction(this.animationArr[num]);
                animationAction.play();

                this.animReady = true;
            }
        } else {
            console.log("this anim not available")
        }

    }
}

function createFuel(x, z) {
    fuel = new Fuel();
    fuel.mesh.position.set(x, 0, z);
    scene.add(fuel.mesh);

    collidableFuels.push(fuel.collidable);
}


function updateCamPos() {
    var newPos = new THREE.Vector3(camStartingPos.x, camStartingPos.y, camStartingPos.z);
    newPos.add(car.mesh.position);
    camera.position.copy(newPos);
}

function updateRenderShadowPos() {
    var newPos = new THREE.Vector3(shadowStartingPos.x, shadowStartingPos.y, shadowStartingPos.z);
    newPos.add(car.mesh.position);
    shadowLight.position.copy(newPos);
    shadowLight.target.position.copy(car.mesh.position);
    shadowLight.updateMatrixWorld();
    shadowLight.target.updateMatrixWorld();
}

/**
 *
 * MECHANICS
 * ---------
 * Handles controls, game loop, and object collisions
 */

function loop() {

    if (fuel.modelReady) {
        mixer.update(clock.getDelta())
    } else {
        console.log("MODEL Not Ready")
    }
    // method 1
    // handle car movement and collisions
    car.update();

    // handle all growth animations
    animateGrow();
    animateShrink();

    // render the scene
    renderer.render(scene, camera);
    updateCamPos();
    updateRenderShadowPos();

    // console.log( car.mesh.position );
    // camera.position.copy( car.mesh.position )
    // scene.rotation.y += 0.0025
    // scene.transl

    // check global collisions
    checkCollisions();

    // call the loop function again
    requestAnimationFrame(loop);

    // // method 2
    // requestAnimationFrame((t) => {
    //     if (_previousRAF === null) {
    //       _previousRAF = t;
    //     }

    //     loop();
    //     // handle car movement and collisions
    //     car.update();

    //     // handle all growth animations
    //     animateGrow();
    //     animateShrink();

    //     renderer.render(scene, camera);
    //     updateCamPos();
    //     // check global collisions
    //     checkCollisions();
    //     _previousRAF = t;
    //   });
}

var left = 37;
var right = 39;
var up = 38;
var down = 40;

function createControls() {
    document.addEventListener(
        'keydown',
        function(ev) {
            var key = ev.keyCode;

            if (key == left) {
                car.turnLeft();
            }
            if (key == right) {
                car.turnRight();
            }
            if (key == up) {
                car.moveForward();
            }
            if (key == down) {
                car.moveBackward();
            }
        }
    );

    document.addEventListener(
        'keyup',
        function(ev) {
            var key = ev.keyCode;

            if (key == left) {
                car.stopLeft();
            }
            if (key == right) {
                car.stopRight();
            }
            if (key == up) {
                car.stopForward();
            }
            if (key == down) {
                car.stopBackward();
            }
        }
    );
}

// https://stackoverflow.com/a/11480717/4855984 (doesn't work)
function objectCollidedWith(object, collidableMeshList) { // TODO: place elsewhere, dysfunctional
    for (let child of object.children) {
        var childPosition = child.position.clone();
        for (var vertexIndex = 0; vertexIndex < child.geometry.vertices.length; vertexIndex++) {
            var localVertex = child.geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4(child.matrix);
            var directionVector = child.position.sub(globalVertex);

            var ray = new THREE.Raycaster(childPosition, directionVector.clone().normalize());
            var collisionResults = ray.intersectObjects(collidableMeshList);
            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                return true;
            }
        }
    }
    return false;
}

function checkCollisions() {

    // mark victory and advance level
    if (objectInBound(car.collidable, collidableFuels)) {
        endLevel();
    }
}

function objectInBound(object, objectList) { // TODO: annotate
    var o = get_xywh(object);
    for (let target of objectList) {
        var t = get_xywh(target);
        if ((Math.abs(o.x - t.x) * 2 < t.w + o.w) && (Math.abs(o.y - t.y) * 2 < t.h + o.h)) {
            return true;
        }
    }
    return false;
}

function get_xywh(object) { // TODO: annotate

    var globalPosition = new THREE.Vector3(0., 0., 0.);
    object.getWorldPosition(globalPosition);
    var x = globalPosition.x;
    var y = globalPosition.z;

    var p = object.geometry.parameters;
    var w = p.width;
    // console.log( p );
    if (p.hasOwnProperty('radiusBottom')) {
        w = Math.max(p.radiusTop, p.radiusBottom); // should be multiplied by 2?
    }
    var h = p.height;

    return { 'x': x, 'y': y, 'w': w, 'h': h };
}

/**
 *
 * LEVELS
 * ------
 * Logic for start and end of levels, including initialization of objects on
 * the map
 */

function createLevel() {
    createFuels();
    createTrees();

    startTimer();
}

function endLevel() {
    fuel.switchAnim(2);

    setTimeout(() => {
        endFuels();
        endTrees();

        updateStatus();
        stopTimer();

        setTimeout(createLevel, 2000);

    }, 1000);

}

function resetGame() {
    car.reset();

    // added in step 1
    resetTimer();

    // added in step 2
    fuelLeft = 100;

    // added in step 3
    if (score > record) {
        record = score;
        window.localStorage.setItem('record', record);
    }
    score = 0;

    updateScoreDisplay();
    updateRecordDisplay();
}

/**
 *
 * STEP 1
 * ------
 * Create timer.
 * Make sure to update resetGame above.
 */

var time = 15;
var timer;

function startTimer() {
    time += 10;
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    // time -= 1;
    updateTimeDisplay();

    // Added in step 2
    // fuelLeft -= 5;
    updateFuelDisplay();

    if (time <= 0 || fuelLeft <= 0) {
        alert('Game over');
        resetGame();
    }
}

function resetTimer() {
    stopTimer();
    startTimer();
}

function stopTimer() {
    clearInterval(timer);
}

/********** End step 1 **********/

/**
 *
 * STEP 2
 * ------
 * Add fuel.
 * Make sure to update resetGame above.
 */

var fuelLeft;

function updateStatus() {
    fuelLeft = Math.min(100, fuelLeft + 25);
    updateFuelDisplay();

    // added in step 3
    score += 1;
    updateScoreDisplay();
}

/********** End step 2 **********/

/**
 *
 * STEP 3
 * ------
 * Add score and record!
 * Make sure to update resetGame above.
 */

var score;
var record = window.localStorage.getItem('record', 0);

/********** End step 3 **********/

function updateTimeDisplay() {
    document.getElementById('time').innerHTML = time;
}

function updateFuelDisplay() {
    document.getElementById('fuel').style.width = fuelLeft.toString() + '%';
}

function updateScoreDisplay() {
    document.getElementById('score').innerHTML = score;
}

function updateRecordDisplay() {
    document.getElementById('record').innerHTML = record;
}

function createTrees() { // TODO: find a home
    var x, z, scale, rotate, delay;
    for (var i = 0; i < numTrees; i++) {
        x = Math.random() * 600 - 300;
        z = Math.random() * 400 - 200;
        scale = Math.random() * 1 + 0.5;
        rotate = Math.random() * Math.PI * 2;
        delay = 2000 * Math.random()

        var treePosition = new THREE.Vector3(x, 0, z);
        if (treePosition.distanceTo(car.mesh.position) < car.berth ||
            treePosition.distanceTo(fuel.mesh.position) < fuel.berth) {
            continue;
        }
        var tree = createTree(x, z, 0.01, rotate);

        setTimeout(function(object, scale) {
            startGrowth(object, 50, 10, scale);
        }.bind(this, tree.mesh, scale), delay);

        collidableTrees.push(tree.collidable);
    }
}

function endTrees() {
    var scale, delay;
    for (let tree of trees) {
        scale = tree.mesh.scale.x;
        delay = delay = 2000 * Math.random();
        setTimeout(function(object, scale) {
            startShrink(object, 25, -10, scale);
        }.bind(this, tree.mesh, scale), delay);
    }
    collidableTrees = [];
    collidableFuels = [];
    trees = [];
}

function createFuels() {
    var x = Math.random() * 600 - 300;
    var y = Math.random() * 400 - 200;
    createFuel(x, y);
    startGrowth(fuel.mesh, 50, 10, 1);
}

function endFuels() {
    var scale = fuel.mesh.scale.x;
    startShrink(fuel.mesh, 25, -10, scale);
}

/**
 *
 * ANIMATION
 * ---------
 * Allows growth and shrinkage for any object in the game
 *
 * Call `startGrowth(...)` or `startShrink(...)` accordingly, on any object, to
 * start growing or shrinking the object. Main game loop invoke `animateGrow`
 * and `animateShrink` which handle incremental grow and shrink updates.
 */

function startGrowth(object, duration, dy, scale) { // TODO: annotate all of these functions
    object.animateGrow_isGrowing = true;
    object.animateGrow_end_time = duration;
    object.animateGrow_end_dy = dy;
    object.animateGrow_end_scale = scale;
    object.animateGrow_start_y = object.position.y - dy;
    object.animateGrow_time = 0;
}

function startShrink(object, duration, dy, scale) {
    object.animateShrink_isShrinking = true;
    object.animateShrink_start_time = duration;
    object.animateShrink_time = duration;
    object.animateShrink_start_scale = scale;
    object.animateShrink_end_dy = dy;
    object.animateShrink_start_y = object.position.y;
}

function animateGrow() {
    var progress, x, y, z, scale;
    for (let child of scene.children) {
        if (child.animateGrow_isGrowing) {
            child.animateGrow_time++;

            progress = child.animateGrow_time / child.animateGrow_end_time;

            x = child.position.x;
            z = child.position.z;
            y = child.animateGrow_start_y + (progress * child.animateGrow_end_dy);
            child.position.set(x, y, z);

            scale = child.animateGrow_end_scale * progress;
            child.scale.set(scale, scale, scale);

            if (child.animateGrow_time >= child.animateGrow_end_time) {
                child.animateGrow_isGrowing = false;
            }
        }
    }
}

function animateShrink() {
    var scale, progress, x, y, z;
    for (let child of scene.children) {
        if (child.animateShrink_isShrinking) {
            child.animateShrink_time--;

            progress = child.animateShrink_time / child.animateShrink_start_time;

            x = child.position.x;
            z = child.position.z;
            y = child.animateShrink_start_y + (progress * child.animateShrink_end_dy);
            child.position.set(x, y, z);

            scale = progress * child.animateShrink_start_scale;
            child.scale.set(scale, scale, scale);

            if (child.animateShrink_time <= 0) {
                scene.remove(child);
                child.animateShrink_isShrinking = false;
            }
        }
    }
}

// TODO: add times of day
// TODO: fix object collision weirdness (possible due to rotated objects)

//init();  // uncomment for JSFiddle, wraps code in onLoad eventListener
window.addEventListener('load', init, false);