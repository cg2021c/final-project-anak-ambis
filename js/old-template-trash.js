
function createBuilding() {
  loadObjModel('../assets/building/OBJ/6Story_Stack_Mat.obj', 
  '../assets/building/OBJ/6Story_Stack_Mat.mtl').then((building)=>{
      const x = -100;
      const y = 10;
      const z = -100;
      const scale = 75.0;
      const radius = 160;

      building.position.x = x;
      building.position.y = y;
      building.position.z = z;

      building.scale.set(scale, scale, scale);

      building.collidable = createCollidable(x, z, radius);
  });
}

// TODO: it's still need tobe tested
function loadGltfModel(pathGltf, pathMtl) {
  return new Promise((resolve) => {
      var mtlLoader = new MTLLoader();
      var objMesh;
      var objLoader = GLTFLoader();
      objLoader.load(pathGltf, function (object) {
          objMesh = object.scene;
          objMesh.castShadow = true;
          objMesh.receiveShadow = true;
          scene.add( objMesh );
          resolve(objMesh);
      });
  });
}


function createLoader() {
  loader = new GLTFLoader ();
  loader.load('../assets/try.gltf', handle_glb);
  // loader.load('../assets/truck/scene.gltf', handle_glb);
}

function handle_glb(glb){
  handle_load(glb, 0, 25, 50, 100);
}

//load biasa
function handle_load(gltf, x, y, z,sc) {
  // console.log(gltf);
  mesh_import = gltf.scene;
  // console.log(mesh.children[0]);
  // mesh_import.children[0].material = new THREE.MeshPhongMaterial({color: Colors.brown});
  // mesh_import.children[1].material = new THREE.MeshPhongMaterial({color: Colors.green});
  // mesh_import.children[2].material = new THREE.MeshPhongMaterial({color: Colors.blue});
  mesh_import.scale.set(sc, sc, sc);    
  mesh_import.position.z = z;
  mesh_import.position.x = x;
  mesh_import.position.y = y;
  mesh_import.castShadow = true;
  mesh_import.receiveShadow = true;
  scene.add( mesh_import );
}
