import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

class Furniture {
    static currentFurniture = null;

    constructor(scene, path) {
        this.scene = scene;
        this.path = path;
        this.model = null;
        this.modelBackup = null;
        this.position = { x: 25, y: 0, z: 25 };
        this.scale = { x: 1, y: 1, z: 1 };
    }

    add() {
        const loader = new GLTFLoader();
        loader.load(this.path, (gltf) => {
            this.model = gltf.scene;
            this.modelBackup = this.model;
            this.model.position.set(this.position.x, this.position.y, this.position.z);
            this.model.scale.set(this.scale.x, this.scale.y, this.scale.z);

            // 크기 정규화
            const box = new THREE.Box3().setFromObject(this.model);
            const size = new THREE.Vector3();
            box.getSize(size);
            const multiple = 20 / size.y;
            this.model.scale.set(multiple, multiple, multiple);

            this.scene.add(this.model);
        });
    }

    static rotate(angle) {
        if(this.currentFurniture){
            this.currentFurniture.rotation.y += angle * Math.PI / 180;
        }
    }

    static selected(object) {
        if(this.currentFurniture){
            this.currentFurniture = null;
        } else {
            this.currentFurniture = object;
        }
    }

}

export default Furniture;