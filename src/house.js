import * as THREE from 'three';

class House {
    constructor(scene, length) {
        this.scene = scene;
        this.length = length;
        this.floorColor = 0x616161;
        this.leftWallColor = 0x757575;
        this.rightWallColor = 0x424242;
    }

    init() {
        // 바닥
        const floorGeometry = new THREE.BoxGeometry(this.length, this.length, 5);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: this.floorColor });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(this.length / 2, 0, this.length / 2);
        floor.rotation.x = -Math.PI / 2;

        // 벽
        const left_wallMaterial = new THREE.MeshStandardMaterial({ color: this.leftWallColor });
        const right_wallMaterial = new THREE.MeshStandardMaterial({ color: this.rightWallColor });

        const right_wall = new THREE.Mesh(floorGeometry, right_wallMaterial);
        const left_wall = new THREE.Mesh(floorGeometry, left_wallMaterial);

        right_wall.position.set(this.length / 2, this.length / 2, 0);
        left_wall.position.set(0, this.length / 2, this.length / 2);
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

    getLength() {
        return this.length;
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
}

export default House;
