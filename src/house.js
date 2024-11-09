import * as THREE from 'three';
class House {

    static groundHeight;
    static groundWidth;
    static groundLength;

    static walls = [];

    constructor(scene, width, length) {
        this.scene = scene;
        this.width = width;
        this.length = length;
    }
    init() {
        // 바닥
        const floorGeometry = new THREE.BoxGeometry(this.width, this.length, 5);
        const floorLoader = new THREE.TextureLoader();
        // 벽
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
        floor.position.set(this.width / 2, 0, this.length / 2);
        floor.rotation.x = -Math.PI / 2;

        // floor 최대 y 값 구하기 -> 가구의 높이 정규화를 위해 사용
        const modelBox = new THREE.Box3().setFromObject(floor);
        House.groundWidth = modelBox.max.x - modelBox.min.x;
        House.groundLength = modelBox.max.z - modelBox.min.z;
        House.groundHeight = modelBox.max.y;

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
        right_wall.position.set(this.width / 2, this.length / 2, 0);
        left_wall.position.set(0, this.length / 2, this.length / 2);
        left_wall.rotation.y = Math.PI / 2;
        

        // 추가
        this.scene.add(floor);
        this.scene.add(right_wall);
        this.scene.add(left_wall);

        // wall list에 추가
        // 0: 왼쪽 벽 1: 오른쪽 벽
        House.walls.push(left_wall);
        House.walls.push(right_wall);
    }
    // Length setter/getter
    setLength(length) {
        this.length = length;
    }
    static getLength() {
        return this.length;
    }
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