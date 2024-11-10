import Furniture from './furniture.js';
import House from './house.js';

class Trash {

    static currentTrashCount = 0;

    constructor(scene, interval, max) {
        this.scene = scene;
        this.interval = interval;
        this.max = max;
        this.path = "./models/essential/trash/trash/scene.gltf";
        
        // localStorage에서 currentTrashCount를 가져와 설정
        const storedCount = localStorage.getItem('currentTrashCount');
        Trash.currentTrashCount = storedCount ? parseInt(storedCount) : 0;
    }

    randomTrash() {
        setInterval(() => {
            if (Trash.currentTrashCount < this.max) {
                const randomX = Math.floor(Math.random() * House.groundWidth);
                const randomZ = Math.floor(Math.random() * House.groundLength);
                const trash = new Furniture(this.scene, this.path, "trash", {x:randomX, y:0, z:randomZ}, false, 0, 10);
                trash.add();
                Trash.currentTrashCount++;
                
                // currentTrashCount를 로컬 저장소에 저장
                Trash.saveTrashCount();
            }
        }, this.interval);
    }

    static downCount() {
        Trash.currentTrashCount--;
        
        // currentTrashCount를 로컬 저장소에 저장
        Trash.saveTrashCount();
    }

    static saveTrashCount() {
        localStorage.setItem('currentTrashCount', Trash.currentTrashCount);
    }

}

export default Trash;
