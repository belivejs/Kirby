import Furniture from './furniture.js';
import House from './house.js';

class Trash {

    static currentTrashCount = 0;

    constructor(scene, interval, max) {
        this.scene = scene;
        this.interval = interval;
        this.max = max;
        this.path = "./models/essential/trash/trash/scene.gltf";
    }

    randomTrash() {
        setInterval(() => {
            if (Trash.currentTrashCount < this.max) {
                const randomX = Math.floor(Math.random() * House.groundWidth);
                const randomZ = Math.floor(Math.random() * House.groundLength);
                console.log("랜덤 변수: ", House.groundWidth, House.groundLength);
                const trash = new Furniture(this.scene, this.path, "trash", {x:randomX, y:0, z:randomZ});
                trash.add(false);
                Trash.currentTrashCount++;
            }
        }, this.interval);
    }

    static downCount() {
        Trash.currentTrashCount--;
    }

}

export default Trash;
