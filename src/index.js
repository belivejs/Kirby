import * as THREE from 'three';
import House from './house.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Furniture from './furniture.js';
var scene, camera, renderer, controls;

function init(){
    // Three.js 씬, 카메라, 렌더러 초기화
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.set(70, 60, 100);
    camera.lookAt(0, 0, 0);

    // OrbitControls 설정
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // 조명 추가
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

    // 집 생성
    const house = new House(scene, 100);
    house.init();
    
}

// 가구 선택
function chooseFurniture(){
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('click', onMouseClick, false);

    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children, true);

        let selectedFurniture = null;

        if (intersects.length > 0) {
            selectedFurniture = intersects[0].object;

            while (selectedFurniture.parent && selectedFurniture.parent.type !== 'Scene') {
                selectedFurniture = selectedFurniture.parent;
            }

            if (selectedFurniture.type == 'Mesh') {   
                selectedFurniture = null;
                Furniture.selected(selectedFurniture);
                return;
            }

            Furniture.selected(selectedFurniture);
            console.log(Furniture.getFurnitureName(selectedFurniture));
        }
    }

    let intersectedObject = null;

    // 배치
    window.addEventListener('mousemove', (event) => {

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            intersectedObject = intersects[0].object;
            const intersectPoint = intersects[0].point;

            if (Furniture.currentFurniture) {
                Furniture.currentFurniture.position.set(Math.floor(intersectPoint.x / 10) * 10, Math.floor(intersectPoint.y / 10) * 10, Math.floor(intersectPoint.z / 10) * 10);
            }
        }
    });
}

// 가구 로드
function furnitureUI() {
    document.getElementById('menu-toggle').addEventListener('click', function(e) {
        e.preventDefault();
        const sidebar = document.getElementById('sidebar');
        if (sidebar.style.display === 'none') {
            sidebar.style.display = 'block';
        } else {
            sidebar.style.display = 'none';
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        const furnitureArray = [
            'models/essential/desk/desk1/scene.gltf',
            'models/essential/desk/desk2/scene.gltf',
            'models/essential/desk/desk3/scene.gltf',
            'models/essential/desk/desk4/scene.gltf',
            'models/essential/chair/chair1/scene.gltf',
            'models/essential/chair/chair2/scene.gltf',
            'models/essential/chair/chair3/scene.gltf',
            'models/essential/chair/chair4/scene.gltf',
            'models/essential/bed/bed1/scene.gltf',
            'models/essential/bed/bed2/scene.gltf',
            'models/essential/bed/bed3/scene.gltf',
            'models/essential/bed/bed4/scene.gltf',
            'models/essential/bath/bath1/scene.gltf',
            'models/essential/bath/bath2/scene.gltf',
            'models/essential/bath/bath3/scene.gltf',
            'models/essential/bath/bath4/scene.gltf',
        ];

        const list = document.getElementById('furniture-list');
        list.innerHTML = '';

        furnitureArray.forEach(furniture => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a href="#">${furniture}</a>`;
            listItem.addEventListener('click', function() {
                const furnitureInstance = new Furniture(scene, furniture, furniture);
                furnitureInstance.add();
            });
            list.appendChild(listItem);
        });
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'e' || e.key === 'ㄷ') {
        Furniture.rotate(45);
    } else if (e.key === 'r' || e.key === 'ㄱ') {
        Furniture.rotate(-45);
    }
});

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

furnitureUI()
init();
chooseFurniture();
animate();