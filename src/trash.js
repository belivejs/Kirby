import Furniture from './furniture.js';
import House from './house.js';

class Trash {
    static currentTrashCount = 0;

    constructor(scene, interval, max, controlProgressBar, updateProgressBar) {
        this.scene = scene;
        this.interval = interval;
        this.max = max;
        this.path = "./models/essential/trash/trash/scene.gltf";
        this._controlProgressBar = controlProgressBar;
        this._updateProgressBar = updateProgressBar;

        // 기존 쓰레기 데이터 복원 (progressBar 감소 X)
        this.restoreTrash();
    }

    // 기존 쓰레기 데이터 복원 함수 (progressBar 조작 없음)
    restoreTrash() {
        const savedTrash = JSON.parse(sessionStorage.getItem("trashData")) || [];
        savedTrash.forEach((trashData) => {
            const { x, z } = trashData;
            const trash = new Furniture(this.scene, this.path, "trash", { x, y: 0, z });
            trash.add(false);
            Trash.currentTrashCount++;
        });
    }

    randomTrash() {
        setInterval(() => {
            if (Trash.currentTrashCount < this.max) {
                const randomX = Math.floor(Math.random() * House.groundWidth);
                const randomZ = Math.floor(Math.random() * House.groundLength);
                
                const trash = new Furniture(this.scene, this.path, "trash", { x: randomX, y: 0, z: randomZ });
                trash.add(false);
                
                Trash.currentTrashCount++;
                this._controlProgressBar(-5); // progressBar 감소는 처음 생성 시에만

                // 쓰레기 위치 저장
                this.saveTrashPosition({ x: randomX, z: randomZ });
            }
        }, this.interval);
    }

    // 쓰레기 위치 저장 함수
    saveTrashPosition(trashPosition) {
        const savedTrash = JSON.parse(sessionStorage.getItem("trashData")) || [];
        savedTrash.push(trashPosition);
        sessionStorage.setItem("trashData", JSON.stringify(savedTrash));
    }

    static downCount() {
        Trash.currentTrashCount--;
    }
}

export default Trash;
