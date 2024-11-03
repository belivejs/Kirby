import * as THREE from 'three';
import House from './house.js';
import Kirby from './kirby.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Furniture from './furniture.js';
var scene, camera, renderer, controls;

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
var loader = new GLTFLoader(); // 3D data loader



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
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));


    // 집 생성
    const house = new House(scene, 100);
    house.init();
  
    new Kirby(scene, renderer, camera, controls);    

    requestAnimationFrame(animate);
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
        }
        console.log(Furniture.currentFurniture);
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
            const furnitureName = furniture.split('/')[2]
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a href="#">${furniture}</a>`;
            listItem.addEventListener('click', function() {
                const furnitureInstance = new Furniture(scene, furniture, furnitureName);
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

function animate(time) {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

/**
 * Data 파일을 로드하고 씬에 추가하기 위한 함수입니다.
 * GLB 파일을 권장합니다.
 * @param {string} path 로드할 파일의 경로. (/data/[파일이름] 형식으로 작성합니다.)
 * @param {string} fileName 로드한 파일의 이름. console에 찍어서 데이터 형식을 확인하려고 사용함.
 * @param {float} scale 스케일할 크기 : 0.5면 원래 크기의 0.5배로 렌더링됨
 * @returns {null} 리턴은 없는데 객체 형태로 내보내고 싶어요.. 근데 안됨
 * @example // 사용 예
 * DataLoader('data/kirby_pixar_3d.glb', '커비')
 * // 콘솔 결과
 * 커비 {scene: Group, scenes: Array(1), animations: Array(1), cameras: Array(0), asset: {…}, …}
 */
function dataLoader(path, fileName, scale=1) {
        loader.load(
            path, // 3D data 경로.
            function (gltf) { // Data 불러오는 함수
                console.log(fileName, gltf);
                const characterMesh = gltf; //mesh
                var mesh = gltf.scene.children[0];
                mesh.scale.set(scale,scale,scale);
                scene.add(gltf.scene);
            },
            undefined,
            function (error) { // 실패 시 에러 출력
                console.error(error);
            }
        );
}

/** object 색 설정
* @param {} objectScene 모델 scene
* @param {string} color 미리 정의된 컬러 이름(hotpink)이나 컬러 코드(#000000)
*/
function setColor(objectScene, color){
    objectScene.traverse(object => { //scene내부 모든 객체들을 하나씩 순회
        console.log("이름",object.name, "타입", object.type); 
        if(object.isMesh){
            object.material.color.set(color);
        }
    })
    scene.add(objectScene);

}


init();
furnitureUI();
chooseFurniture();
animate();