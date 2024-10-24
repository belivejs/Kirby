import * as THREE from 'three';
import House from './house.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

var scene;
var camera;
var renderer;
var controls;
var loader = new GLTFLoader(); //3D data loader

//key Code
const LEFT = 65, RIGHT = 68, FRONT = 87, BACK = 83; //adws
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


function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75, // 시야각
        window.innerWidth / window.innerHeight, // 화면 비율
        0.1, // 가까운 절단면
        1000 // 먼 절단면
    );

    kirby = new THREE.Object3D();
    // 모델 로딩
    loader.load(
        '../kirby.glb',  // 모델 경로 (GLB 또는 GLTF)
         function (glb) {
            glb.scene.scale.set(0.7, 0.7, 0.7);
            glb.scene.position.set(15, 0, 10); // 모델을 왼쪽으로 이동
            kirby = glb.scene;
            scene.add(kirby);  // 씬에 모델 추가
        },
        undefined,
        function (error) {
            console.error(error);  // 로딩 중 에러 발생 시
        }       
    );

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

    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(0, 10, 10);
    scene.add(light);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    house = new THREE.Object3D();
    // 모델 로딩
    loader.load(
        '../cartoon_villa_wooden_house_low_polygon_3d_model.glb',  // 모델 경로 (GLB 또는 GLTF)
         function (glb) {
            house = glb.scene;
            house.scale.set(5, 5, 5);
            house.position.set(35, 0, 65); // 모델을 왼쪽으로 이동
            scene.add(house);  // 씬에 모델 추가
        },
        undefined,
        function (error) {
            console.error(error);  // 로딩 중 에러 발생 시
        }       
    );

    // 집
    // const house = new House(scene, 50);
    // house.init();

    addGrass();
    addFence();
    
    //keyboard event
    document.addEventListener('keydown', moveKirbyByKeyBoard, false)
}

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // OrbitControls 업데이트
    renderer.render(scene, camera);
}

function addGrass() {
    // 잔디용 평면 지오메트리 생성

    const grassGeometry = new THREE.PlaneGeometry(120, 120, 2); 

    const textureLoader = new THREE.TextureLoader();
    const textureBaseColor = textureLoader.load('../texture/Stylized_Stone_Floor_007_BaseColor.png');
    const textureNormalMap = textureLoader.load('../texture/Stylized_Stone_Floor_007_Normal.png');
    const textureHeightMap = textureLoader.load('../texture/Stylized_Stone_Floor_007_Height.png');
    const textureRoughnessMap = textureLoader.load('../texture/Stylized_Stone_Floor_007_Roughness.png');

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

/**
 * Data 파일을 로드하고 씬에 추가하기 위한 함수입니다.
 * GLB 파일을 권장합니다.
 * @param {string} path 로드할 파일의 경로. (/data/[파일이름] 형식으로 작성합니다.)
 * @param {string} fileName 로드한 파일의 이름. console에 찍어서 데이터 형식을 확인하려고 사용함.
 * @returns {null} 리턴은 없는데 객체 형태로 내보내고 싶어요.. 근데 안됨
 * @example // 사용 예
 * DataLoader('data/kirby_pixar_3d.glb', '커비')
 * // 콘솔 결과
 * 커비 {scene: Group, scenes: Array(1), animations: Array(1), cameras: Array(0), asset: {…}, …}
 */
// function dataLoader(path, target){
//     loader.load(
//         path, // 3D data 경로.
//         function (gltf) { // Data 불러오는 함수
//             target.add(gltf.scene);
//         },
//         undefined, 
//         function (error) {// 실패 시 에러 출력
//             console.error(error);
//         }
//     );
// }

/**
 * ADWS(왼오앞뒤) 키를 누르면 커비가 이동합니다 
 * @example document.addEventListener('keydown', moveKirbyByKeyBoard, false)
 */
function moveKirbyByKeyBoard(e){
    let moveDistance = 2;  // 이동 거리
    let newPosition = new THREE.Vector3();

    // 키 입력에 따른 캐릭터의 새로운 위치 설정
    if (e.keyCode == LEFT) {
        newPosition.set(-moveDistance, 0, 0);  // 왼쪽 이동
    } else if (e.keyCode == RIGHT) {
        newPosition.set(moveDistance, 0, 0);  // 오른쪽 이동
    } else if (e.keyCode == FRONT) {
        newPosition.set(0, 0, -moveDistance);  // 앞으로 이동
    } else if (e.keyCode == BACK) {
        newPosition.set(0, 0, moveDistance);  // 뒤로 이동
    }

    // 충돌 여부 확인 후 이동
    if (!checkCollision(newPosition)) {
        kirby.position.add(newPosition);  // 충돌하지 않으면 이동
    }
}

function addFence() {
    const loader = new GLTFLoader();
    fence = new THREE.Object3D();
    fenceGroup1 = new THREE.Group();
    fenceGroup2 = new THREE.Group();
    fenceGroup3 = new THREE.Group();
    fenceGroup4 = new THREE.Group();

    loader.load('../simple_wood_fence.glb', function (glb) {

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
        return true;  // 충돌 발생 시 true 반환
    }

    if (kirbyBox.intersectsBox(fenceBox1) || kirbyBox.intersectsBox(fenceBox2) 
        || kirbyBox.intersectsBox(fenceBox3) || kirbyBox.intersectsBox(fenceBox4)) {
        return true;  // 충돌 발생 시 true 반환
    }

    return false;
}

init();
animate();