import * as THREE from 'three';

class House {

    static groundHeight;

    constructor(scene, width, length) {
        this.scene = scene;
        this.length = length;
        this.width = width;
    }

    init() {
        // 바닥
        const floorGeometry = new THREE.BoxGeometry(this.width, this.length, 5);
        const floorLoader = new THREE.TextureLoader();
        const floorBaseColor = floorLoader.load('/texture/Laminate_floor/laminate_floor_02_diff_4k.jpg');
        const floorNormalMap = floorLoader.load('/texture/Laminate_floor/laminate_floor_02_nor_gl_4k.jpg');
        const floorHeightMap = floorLoader.load('/texture/Laminate_floor/laminate_floor_02_disp_4k.png');
        const floorRoughnessMap = floorLoader.load('/texture/Laminate_floor/laminate_floor_02_rough_4k.jpg');

        const floorMaterial = new THREE.MeshStandardMaterial({ 
            map : floorBaseColor,
            normalMap : floorNormalMap,
            displacementMap: floorHeightMap,
            displacementScale : 0.5,
            roughnessMap: floorRoughnessMap,
            roughness: 0.5
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(this.length / 2, 0, this.length / 2);
        floor.rotation.x = -Math.PI / 2;

        const groundBox = new THREE.Box3().setFromObject(floor);
        House.groundHeight = groundBox.max.y;

        // 벽
        const wallLoader = new THREE.TextureLoader();
        const wallBaseColor = wallLoader.load('/texture/Concrete_009_SD/Concrete_009_COLOR.jpg');
        const wallNormalMap = wallLoader.load('/texture/Concrete_009_SD/Concrete_009_NORM.jpg');
        const wallHeightMap = wallLoader.load('/texture/Concrete_009_SD/Concrete_009_DISP.png');
        const wallRoughnessMap = wallLoader.load('/texture/Concrete_009_SD/Concrete_009_ROUGH.jpg');

        const wallMaterial = new THREE.MeshStandardMaterial({ 
            map : wallBaseColor,
            normalMap : wallNormalMap,
            displacementMap: wallHeightMap, 
            displacementScale : 0.5,
            roughnessMap: wallRoughnessMap,
            roughness: 0.5
        });

        const rightwallGeometry = new THREE.BoxGeometry(this.width, this.length, 5); // 각 벽의 geometry
        const leftwallGeometry = new THREE.BoxGeometry(this.length, this.length, 5);

        const right_wall = new THREE.Mesh(rightwallGeometry, wallMaterial);
        const left_wall = new THREE.Mesh(leftwallGeometry, wallMaterial);

        right_wall.position.set(this.width / 2 - 25, this.length / 2, 0);
        left_wall.position.set(-22, this.length / 2, this.length / 2);
        left_wall.rotation.y = Math.PI / 2;

        // 추가
        this.scene.add(floor);
        this.scene.add(right_wall);
        this.scene.add(left_wall);
    }

    // Length setter/getter
    setLength(length) {
        this.length = length;
    }

    static getLength() {
        return this.length;
    }

    // Length setter/getter
    setWidth(width) {
        this.width = width;
    }

    static getWidth() {
        return this.width;
    }

    // Floor color setter/getter
    setFloorColor(color) {
        this.floorColor = color;
    }

    getFloorColor() {
        return this.floorColor;
    }

    // Left wall color setter/getter
    setLeftWallColor(color) {
        this.leftWallColor = color;
    }

    getLeftWallColor() {
        return this.leftWallColor;
    }

    // Right wall color setter/getter
    setRightWallColor(color) {
        this.rightWallColor = color;
    }

    getRightWallColor() {
        return this.rightWallColor;
    }

    static getFloor() {
        return this.floor;
    }
}

export default House;