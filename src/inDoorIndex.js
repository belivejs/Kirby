import * as THREE from 'three';
import House from './house.js';
import Trash from './trash.js';
import Kirby from './kirby.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Furniture from './furniture.js';
var scene, camera, renderer, controls;

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { select } from 'three/webgpu';

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import {initializeTimer} from './timer.js';

var loader = new GLTFLoader(); // 3D data loader


var raycaster;
var mouse;
let intervalId;
let updatePositions; // 회전 로직을 저장하는 변수
let gameTicks = 30; // game이 흘러가는 시간 비율, 1분에 하루
let sunMesh, moonMesh;
var progressBar;
let kirbyInstance;
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

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75, // 시야각
        window.innerWidth / window.innerHeight, // 화면 비율
        0.1, // 가까운 절단면
        1000 // 먼 절단면
    );

    // HDR 로더 설정
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

    // 태양 light source 추가
    const sunColor = 0xfff5e1;
    const sunLight = new THREE.PointLight(sunColor, 100000)
    sunLight.castShadow = true;
    scene.add(sunLight);

    // 태양을 표현하기 위한 구체 추가
    const sunTexture = textureLoader.load('./texture/sun.jpg'); // 경로에 맞게 수정
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: sunTexture,
        color:sunColor
      });
    const sunGeometry = new THREE.SphereGeometry(40, 32, 32); // 태양 크기
    sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sunMesh); // 씬에 추가

    // 달 light source 추가
    // const moonColor = 0xbfc1c2;
    const moonColor = 0xbfc1c2;
    const moonLight = new THREE.PointLight(moonColor, 10000)
    moonLight.castShadow = true;
    scene.add(moonLight);

    // 달을 표현하기 위한 구체 추가
    const moonTexture = textureLoader.load('./texture/moon.png'); // 경로에 맞게 수정
    const moonMaterial = new THREE.MeshBasicMaterial({
        map: moonTexture,
        color:moonColor
      });
    const moonGeometry = new THREE.SphereGeometry(40, 32, 32); // 달 크기
    moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moonMesh); // 씬에 추가

    // timer.js의 initializeTimer 함수로 회전 로직을 생성
    updatePositions = initializeTimer(gameTicks, sunLight, moonLight, sunMesh, moonMesh, scene, scene);
    

    
    // Ambient Light 추가 (장면 전체에 부드러운 조명 제공)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // 세기 조절 (0.5)
    scene.add(ambientLight);
    // const light = new THREE.DirectionalLight(0xffffff, 2);
    // light.position.set(50, 50, 50);

    // PointLight - 집 조명
    const pointLight = new THREE.PointLight(0xffffff, 20000, 0);
    pointLight.position.set(200, 200, 150);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xffffff, 20000, 0);
    pointLight2.position.set(150, 200, 150);
    scene.add(pointLight2);

    // const pointLightHelper = new THREE.PointLightHelper(pointLight, 5); // 두 번째 매개변수는 크기
    // scene.add(pointLightHelper);
    // scene.add(light);
    // 집
    const house = new House(scene, 300, 250);
    house.init();
    initializeProgressBar();

    new Kirby(scene, renderer, camera, controls, 0.15,controlProgressBar, updateProgressBar);    

    requestAnimationFrame(animate);

}

// 가구 선택
function chooseFurniture(){
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('click', onMouseClick, false);

    function onMouseClick(event) {
        if(Furniture.currentFurniture){
            Furniture.selected(null);
        } else {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            // Raycaster 광선 시각화
            // let arrowHelper;

            // const direction = raycaster.ray.direction.clone();
            // const origin = raycaster.ray.origin.clone();

            // const arrowLength = 30;
            // arrowHelper = new THREE.ArrowHelper(direction, origin, arrowLength, 0xff0000);
            // scene.add(arrowHelper);

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

                // 쓰레기 선택 예외
                if(Furniture.getFurnitureName(selectedFurniture) == 'trash'){
                    selectedFurniture = null;
                    Furniture.selected(selectedFurniture);
                    return;
                }

                Furniture.selected(selectedFurniture);
            }
        }
        console.log(Furniture.currentFurniture);
    }

    let intersectedObject = null;

    // 선택한 가구 배치
    window.addEventListener('mousemove', (event) => {

        if(Furniture.currentFurniture){
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                intersectedObject = intersects[0].object;
                const intersectPoint = intersects[0].point;

                if (Furniture.currentFurniture) {
                    // Furniture.currentFurniture.model.position.set(Math.floor(intersectPoint.x / 10) * 10, Furniture.currentFurniture.model.position.y, Math.floor(intersectPoint.z / 10) * 10);
                    Furniture.currentFurniture.position = {x: Math.floor(intersectPoint.x), y: Furniture.currentFurniture.model.position.y, z: Math.floor(intersectPoint.z)};
                    Furniture.currentFurniture.model.position.set(Math.floor(intersectPoint.x), Furniture.currentFurniture.model.position.y, Math.floor(intersectPoint.z));

                    console.log(Math.floor(intersectPoint.x), Furniture.currentFurniture.model.position.y, Math.floor(intersectPoint.z));
                }
            }
        }
    });
}

// 가구 로드 예시 코드
// const furnitureInstance = new Furniture(scene, furniture, furnitureName);
// furnitureInstance.add();

const furnitureArray = [
    './models/essential/desk/desk2/scene.gltf',
    './models/essential/chair/chair1/scene.gltf',
    './models/essential/bed/bed1/scene.gltf',
    './models/essential/bath/bath3/scene.gltf',
];

function furnitureUI() {
    document.getElementById('menu-toggle').addEventListener('click', function(e) {
        e.preventDefault();
        const sidebar = document.getElementById('sidebar');
        sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('DOMContentLoaded', function() {
        const furnitureList = document.getElementById('furniture-list');
        furnitureList.innerHTML = '';

        // sessionStorage에서 구매한 가구 불러오기
        const purchasedFurniture = JSON.parse(sessionStorage.getItem('purchasedFurniture')) || [];

        // 기본 가구 배열 (furnitureArray)와 구매한 가구 배열 합치기
        const allFurniture = [
            ...furnitureArray.map(path => ({ name: path.split('/')[3], modelPath: path })), // 기본 가구들
            ...purchasedFurniture // 구매한 가구들
        ];

        // 모든 가구를 메뉴에 표시
        allFurniture.forEach(item => {
            const listItem = document.createElement('li');
            listItem.style.display = 'flex';
            listItem.style.justifyContent = 'space-between';
            listItem.style.alignItems = 'center';

            // 숫자를 떼어낸 기본 이름 추출
            const furnitureBaseName = item.name.replace(/\d+$/, '');

            const itemName = document.createElement('a');
            itemName.href = '#';
            itemName.textContent = item.name;
            listItem.appendChild(itemName);

            // 가구가 사용 중일 경우 글자 색을 빨간색으로 설정
            let furnitureInstance = Furniture.furnitureList.find(f => f.furnitureName === item.name);
            if (furnitureInstance) {
                itemName.style.color = 'red'; // 이미 scene에 추가된 경우 빨간색으로 표시
            }

            // del 버튼 생성
            const delButton = document.createElement('button');
            delButton.textContent = 'del';
            delButton.style.marginLeft = 'auto';

            // 가구 클릭 시 scene에 추가
            itemName.addEventListener('click', function() {
                if (!furnitureInstance) {
                    furnitureInstance = new Furniture(scene, item.modelPath, furnitureBaseName); // 숫자 제거한 이름으로 생성
                    furnitureInstance.add(); // scene에 가구 추가
                    itemName.style.color = 'red'; // 추가 후 빨간색으로 변경
                }
            });

            // del 버튼 클릭 시 가구 숨기기
            delButton.addEventListener('click', function(e) {
                e.stopPropagation();
                if (furnitureInstance) {
                    furnitureInstance.hide(); // scene에서 가구 숨기기
                    furnitureInstance = null; // 인스턴스 제거
                    itemName.style.color = 'black'; // 숨기기 후 검은색으로 복구
                }
            });

            listItem.appendChild(delButton);
            furnitureList.appendChild(listItem);
        });
    });
}







// 
document.addEventListener('keydown', (e) => {
    if (Furniture.currentFurniture) {
        if (e.key === 'e' || e.key === 'ㄷ') {
            Furniture.currentFurniture.rotate(45);
        } else if (e.key === 'r' || e.key === 'ㄱ') {
            Furniture.currentFurniture.rotate(-45);
        }
    }
});


// function initFurniture() {

//     for (let i = 0; i < furnitureArray.length; i++) {
//         try{
//             switch (i) {
//                 case 0:
//                     const deskInstance = new Furniture(scene, furnitureArray[i], "desk", {x:17, y:2.5041244718755564, z:9});
//                     deskInstance.add(false, 90);
//                     break;
//                 case 1:
//                     const chairInstance = new Furniture(scene, furnitureArray[i], 'chair', {x:22, y:12.500000000000012, z:21});
//                     chairInstance.add(false, 180);
//                     break;
//                 case 2:
//                     const bedInstance = new Furniture(scene, furnitureArray[i], 'bed', {x:88, y:22.499983113709934, z:30});
//                     bedInstance.add(false, 0);
//                     break;
//                 case 3:
//                     const bathInstance = new Furniture(scene, furnitureArray[i], 'bath', {x: 2, y: 3.332235320347188, z: 79});
//                     bathInstance.add(false, 0);
//                     break;
//                 default:
//                     console.error('알 수 없는 가구 인덱스입니다.');
//             }
//         }catch(e){
//             console.log(e)
//         }
//     }
// }

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (updatePositions) {
        updatePositions(); // 태양과 달의 위치를 업데이트
    }

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


    if(kirbyInstance) {
        kirbyInstance.checkProgress(); // Check progress and update textures if necessary
    }

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

// Function to display overlay message
function showOverlayMessage(messageId) {
    console.log(messageId);
    const overlay = document.getElementById("overlay");
    overlay.style.display = "flex";
    document.getElementById(messageId).style.display = "block";
}


// Initialize progressBar at the very beginning
initializeProgressBar();
checkAndInitializeStorage();

window.addEventListener("beforeunload", function() {
    Furniture.saveToLocalStorage();
    //Trash.saveTrashCount();    
});


init();
furnitureUI();
chooseFurniture();
var trash = new Trash(scene, 1000, 5, controlProgressBar, updateProgressBar);
trash.randomTrash();
animate();
// Progress가 계속 증가하는 interval 설정
intervalId = setInterval(() => controlProgressBar(3), 5000);