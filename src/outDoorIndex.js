import * as THREE from 'three';
import House from './house.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { update } from 'three/examples/jsm/libs/tween.module.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import {initializeTimer} from './timer.js';
import Kirby from './kirby_Outdoor.js';
import Furniture from './furniture.js';
var scene, camera, renderer, controls;
var loader = new GLTFLoader(); //3D data loader
var progressBar;

//key Code

let intervalId;
let kirby;
let house;
let fenceGroup1;
let fenceGroup2;
let fenceGroup3;
let fenceGroup4;
let fence;
let fenceClone1;
let fenceClone2;
let fenceClone3;
let fenceClone4;
let houseBox;
const LEFT = 65, RIGHT = 68, FRONT = 87, BACK = 83; //adws


let grassGeometry;

//태양 달 효과
let updatePositions; // 회전 로직을 저장하는 변수
let gameTicks = 30; // game이 흘러가는 시간 비율, 1분에 하루
let sunMesh, moonMesh;

progressBar = document.getElementById("progressBar");

function checkAndInitializeStorage() {
    // "isInitialized"라는 키가 없으면 새로 시작한 것이므로 초기화 진행
    if (!sessionStorage.getItem("isInitialized")) {
        sessionStorage.clear();

        // 초기 설정
        sessionStorage.setItem("money", 0); // 돈을 10000원으로 초기화
        sessionStorage.setItem("purchasedFurniture", JSON.stringify([])); // 구매한 가구를 빈 배열로 초기화
        sessionStorage.setItem("isInitialized", true); // 초기화 여부 저장
        console.log("프로젝트 초기화 완료");
        sessionStorage.setItem("progressBar", 30); // Default progress value
        sessionStorage.setItem("isFinish", "false"); // Reset finish status
        isFinish = false; // Reset in-memory finish status
        updateProgressBar(30); // Reset progress bar visually
    }
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
        const furnitureList = document.getElementById('furniture-list');
        furnitureList.innerHTML = '';

        // 로컬 스토리지에서 구매한 가구 리스트 불러오기
        const purchasedFurniture = JSON.parse(localStorage.getItem('purchasedFurniture')) || [];

        purchasedFurniture.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a href="#">${item.name}</a>`;
            furnitureList.appendChild(listItem);

            listItem.addEventListener('click', function() {
                const furnitureInstance = new Furniture(scene, item.modelPath, item.name);
                furnitureInstance.add();
            });
        });
    });
}

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75, // 시야각
        window.innerWidth / window.innerHeight, // 화면 비율
        0.1, // 가까운 절단면
        1000 // 먼 절단면
    );
    
    addGrass();
    addFence();
    addDoor();

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('./data/drakensberg_solitary_mountain_puresky_1k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        // 씬의 환경 설정
        // scene.environment = texture;
        scene.background = texture;
    });

    

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87CEEB);
    document.body.appendChild(renderer.domElement);

    camera.position.set(70, 60, 100);
    camera.lookAt(0, 0, 0);

    // OrbitControls 추가
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const textureLoader = new THREE.TextureLoader();
    //광원 추가
    // 태양 light source 추가
    const sunColor = 0xfff5e1;
    const sunLight = new THREE.PointLight(sunColor, 100000);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // 태양을 표현하기 위한 구체 추가
    const sunTexture = textureLoader.load('./texture/sun.jpg'); // 경로에 맞게 수정
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: sunTexture,
        color:sunColor
      });
    const sunGeometry = new THREE.SphereGeometry(40, 128, 128); // 태양 크기
    sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sunMesh); // 씬에 추가

    // 달 light source 추가
    const moonColor = 0xbfc1c2;
    const moonLight = new THREE.PointLight(moonColor, 50000);
    moonLight.castShadow = true;
    scene.add(moonLight);

    // 달을 표현하기 위한 구체 추가
    const moonTexture = textureLoader.load('./texture/moon.png'); // 경로에 맞게 수정
    const moonMaterial = new THREE.MeshBasicMaterial({
        map: moonTexture,
        color:moonColor
      });
    const moonGeometry = new THREE.SphereGeometry(40, 128, 128); // 달 크기
    moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moonMesh); // 씬에 추가

    // timer.js의 initializeTimer 함수로 회전 로직을 생성
    updatePositions = initializeTimer(gameTicks, sunLight, moonLight, sunMesh, moonMesh, scene, scene);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // 세기 조절 (0.5)
    scene.add(ambientLight);

    house = new THREE.Object3D();
    // 모델 로딩
    loader.load(
        './data/cartoon_house.glb',  // 모델 경로 (GLB 또는 GLTF)
         function (glb) {
            house.position.set(93, -35, 0);
            house = glb.scene;
            houseBox = new THREE.Box3().setFromObject(house);
            // console.log(houseBox);
            house.scale.set(5, 5, 5);
            house.position.set(93, -35, 0); // 모델을 왼쪽으로 이동
            scene.add(house);  // 씬에 모델 추가
        },
        undefined,
        function (error) {
            console.error(error);  // 로딩 중 에러 발생 시
        }       
    );  

    kirby = new Kirby(scene, renderer, camera, controls, 0.05,controlProgressBar, updateProgressBar);

    initializeProgressBar();
    addGrass();
    addFence();
    addDoor();

}

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // OrbitControls 업데이트

    if (updatePositions) {
        updatePositions(); // 태양과 달의 위치를 업데이트
    }

    renderer.render(scene, camera);
}

function addGrass() {
    // 잔디용 평면 지오메트리 생성

    grassGeometry = new THREE.PlaneGeometry(120, 120, 2); 

    const textureLoader = new THREE.TextureLoader();
    const textureBaseColor = textureLoader.load('./texture/Stylized/Stylized_Stone_Floor_007_BaseColor.png');
    const textureNormalMap = textureLoader.load('./texture/Stylized/Stylized_Stone_Floor_007_Normal.png');
    const textureHeightMap = textureLoader.load('./texture/Stylized/Stylized_Stone_Floor_007_Height.png');
    const textureRoughnessMap = textureLoader.load('./texture/Stylized/Stylized_Stone_Floor_007_Roughness.png');

    const grassMaterial = new THREE.MeshStandardMaterial({ 
        map : textureBaseColor,
        normalMap : textureNormalMap,
        displacementMap: textureHeightMap, 
        displacementScale : 0.5,
        roughnessMap: textureRoughnessMap,
        roughness: 0.5
    });

    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2; 
    grass.position.set(50, 0, 50); 


    scene.add(grass);
}

function addFence() {
    const loader = new GLTFLoader();
    fence = new THREE.Object3D();
    fenceGroup1 = new THREE.Group();
    fenceGroup2 = new THREE.Group();
    fenceGroup3 = new THREE.Group();
    fenceGroup4 = new THREE.Group();

    loader.load('./data/simple_wood_fence.glb', function (glb) {

        fence = glb.scene;

        // 울타리 크기 및 처음 위치 설정
        fence.scale.set(2, 2, 2); // 크기 조정

        fenceClone1 = new THREE.Object3D();
        fenceClone2 = new THREE.Object3D();
        fenceClone3 = new THREE.Object3D();
        fenceClone4 = new THREE.Object3D();

        // 동일한 울타리 복제하여 이어붙이기
        for (let i = 0; i < 5; i++) {  // 10개의 울타리 이어붙이기
            fenceClone1 = fence.clone(); // 울타리 복제
            fenceClone1.position.set(0, 7, 10 + i*20); // 각 울타리를 옆으로 이동 (X 좌표)
            fenceGroup1.add(fenceClone1);
            console.log("1");
        }

        // 동일한 울타리 복제하여 이어붙이기
        for (let i = 0; i < 5; i++) {  // 10개의 울타리 이어붙이기
            fenceClone2 = fence.clone(); // 울타리 복제
            fenceClone2.position.set(100, 7, 10 + i*20); // 각 울타리를 옆으로 이동 (X 좌표)
            fenceGroup2.add(fenceClone2);
        }

        // 동일한 울타리 복제하여 이어붙이기
        
        for (let i = 0; i < 5; i++) {  // 10개의 울타리 이어붙이기
            fence.rotation.y = Math.PI / 2; // 90도 회전 (라디안으로 설정)
            fenceClone3 = fence.clone(); // 울타리 복제
            fenceClone3.position.set(10 + i*20, 7, 100); // 각 울타리를 옆으로 이동 (X 좌표)
            fenceGroup3.add(fenceClone3);
        }

        for (let i = 0; i < 5; i++) {  // 10개의 울타리 이어붙이기
            fence.rotation.y = Math.PI / 2; // 90도 회전 (라디안으로 설정)
            fenceClone4 = fence.clone(); // 울타리 복제
            fenceClone4.position.set(10 + i*20, 7, 0); // 각 울타리를 옆으로 이동 (X 좌표)
            fenceGroup4.add(fenceClone4);
        }

        scene.add(fenceGroup1);
        scene.add(fenceGroup2);
        scene.add(fenceGroup3);
        scene.add(fenceGroup4);
    });
}

function checkCollision(newPosition) {
    const kirbyBox = new THREE.Box3().setFromObject(kirby);
    kirbyBox.translate(newPosition);  // 캐릭터의 이동할 위치로 Box를 이동

    const houseBox = new THREE.Box3().setFromObject(house);

    const fenceBox1 = new THREE.Box3().setFromObject(fenceGroup1);
    const fenceBox2 = new THREE.Box3().setFromObject(fenceGroup2);
    const fenceBox3 = new THREE.Box3().setFromObject(fenceGroup3);
    const fenceBox4 = new THREE.Box3().setFromObject(fenceGroup4);

    if (kirbyBox.intersectsBox(houseBox)) {
        controlProgressBar(5);
        return true;  // 충돌 발생 시 true 반환
    }

    if (kirbyBox.intersectsBox(fenceBox1) || kirbyBox.intersectsBox(fenceBox2) 
        || kirbyBox.intersectsBox(fenceBox3) || kirbyBox.intersectsBox(fenceBox4)) {
        controlProgressBar(-5);
        return true;  // 충돌 발생 시 true 반환
    }
    return false;
}


var isFinish = sessionStorage.getItem("isFinish") === "true" || false; // 로컬스토리지에서 완료 여부 가져오기

// Initialize progressBar with value from sessionStorage or default to 30%
function initializeProgressBar() {
    const savedProgress = sessionStorage.getItem("progressBar");
    const initialProgress = savedProgress !== null ? parseInt(savedProgress) : 30; // 기본값을 30%로 설정
    updateProgressBar(initialProgress);
}

// Update progressBar and save to sessionStorage
function updateProgressBar(value) {
    progressBar.style.width = `${value}%`;
    progressBar.textContent = `${value}%`;
    sessionStorage.setItem("progressBar", value); // Save to sessionStorage
}


// Function to control progress and display messages if 100% or 0%
function controlProgressBar(changeValue) {
    let currentProgress = parseInt(sessionStorage.getItem("progressBar"));
    currentProgress = Math.min(100, Math.max(0, currentProgress + changeValue)); // 제한 범위 설정
    updateProgressBar(currentProgress);
    console.log(currentProgress);


    // 성공 메시지
    if (currentProgress >= 100 && !isFinish) {
        isFinish = true;
        sessionStorage.setItem("isFinish", "true");
        showOverlayMessage("complete-text");
        console.log("complete");
        clearInterval(intervalId); // 0%에 도달하면 반복 중지
    }
    // 실패 메시지
    else if (currentProgress <= 0 && !isFinish) {
        isFinish = true;
        sessionStorage.setItem("isFinish", "true");
        showOverlayMessage("fail-text");
        clearInterval(intervalId); // 0%에 도달하면 반복 중지
    }
}

function addDoor(){
    let doorPath = './models/essential/door/door/scene.gltf';
    const doorInstance = new Furniture(scene, doorPath, 'door', {x:59, y:0, z: 55}, false, 0, 15);
    doorInstance.add(false, () => {
        doorInstance.model.visible = false;
    });
}

// Function to display overlay message
function showOverlayMessage(messageId) {
    console.log(messageId);
    const overlay = document.getElementById("overlay");
    overlay.style.display = "flex";
    document.getElementById(messageId).style.display = "block";
}

checkAndInitializeStorage();
// Initialize progressBar at the very beginning
initializeProgressBar();
init();
animate();
intervalId = setInterval(() => controlProgressBar(3), 5000);