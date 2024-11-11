import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import House from './house.js';

class Furniture {
    static currentFurniture = null;
    static furnitureList = [];
    static furnitureModelList =[];

    constructor(scene, path, furnitureName, position = { x: 25, y: 0, z: 25 }) {
        this.scene = scene;
        this.path = path;
        this.furnitureName = furnitureName;
        this.model = null;
        this.object3D = null;
        this.position = position;
        this.scale = { x: 0.7, y: 0.7, z: 0.7 };
    }

    hide() {
        if(this.model) {
            this.model.visible = false;
        }
    }


    add(ifSelect=true, rotate=0) {
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

            // 높이 조정
            const modelBox = new THREE.Box3().setFromObject(this.model);
            const modelBottomY = modelBox.min.y;
            this.model.position.y += House.groundHeight - modelBottomY;

            Furniture.furnitureList.push(this);
            Furniture.furnitureModelList.push(this.model);

            if(ifSelect){
                Furniture.currentFurniture = this;
            }
            console.log("rotate전까지");
            this.rotate(rotate);

            console.log("add전까지");
            this.scene.add(this.model);
            console.log("모델 : ", this.model);
        });
    }

    rotate(angle) {
        console.log(this);
        if(this){
            this.model.rotation.y += angle * Math.PI / 180;
        }
    }

    static selected(furniture) {
        if(furniture){
            const foundFurniture = this.furnitureList.find(item => item.model.uuid === furniture.uuid);
            if (!foundFurniture) {
                Furniture.currentFurniture = null;
                return;
            }
            Furniture.currentFurniture = foundFurniture;
        } else {
            Furniture.currentFurniture = null;
            return;
        }
    }

    static getFurnitureName(furniture) {
        if(furniture){
            const foundFurniture = this.furnitureList.find(item => item.model.uuid === furniture.uuid);
            if (!foundFurniture) {
                return null;
            }
            return foundFurniture.furnitureName;
        }
    }
}

export default Furniture;
