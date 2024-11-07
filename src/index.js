import * as THREE from 'three';
import House from './house.js';
import {initializeTimer} from './timer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

var scene;
var camera;
var renderer;
var controls;
var loader = new GLTFLoader(); // 3D data loader
let kirby;
let updatePositions; // 회전 로직을 저장하는 변수
let gameTicks = 3; // game이 흘러가는 시간 비율, 1분에 하루
let sunMesh, moonMesh;

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

    kirby = new THREE.Object3D();
    dataLoader('./data/kirby_pixar_3d.glb', kirby);
    scene.add(kirby);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);

    // OrbitControls 추가
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // 태양 light source 추가
    const sunColor = 0xfff5e1;
    const sunLight = new THREE.PointLight(sunColor, 3000)
    sunLight.castShadow = true;
    scene.add(sunLight);

    // 태양을 표현하기 위한 구체 추가
    const sunGeometry = new THREE.SphereGeometry(1, 32, 32); // 태양 크기
    const sunMaterial = new THREE.MeshBasicMaterial({ color: sunColor });
    sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sunMesh); // 씬에 추가

    // 달 light source 추가
    // const moonColor = 0xbfc1c2;
    const moonColor = 0xbfc1c2;
    const moonLight = new THREE.PointLight(moonColor, 3000)
    moonLight.castShadow = true;
    scene.add(moonLight);

    // 달을 표현하기 위한 구체 추가
    const moonGeometry = new THREE.SphereGeometry(1, 32, 32); // 달 크기
    const moonMaterial = new THREE.MeshBasicMaterial({ color: moonColor });
    moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moonMesh); // 씬에 추가

    // timer.js의 initializeTimer 함수로 회전 로직을 생성
    updatePositions = initializeTimer(gameTicks, sunLight, moonLight, sunMesh, moonMesh, kirby, scene);
    
    const house = new House(scene, 50);
    // house.init();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // OrbitControls 업데이트

    if (updatePositions) {
        updatePositions(); // 태양과 달의 위치를 업데이트
    }

    renderer.render(scene, camera);
}

/**
 * Data 파일을 로드하고 target에 load한 object를 저장합니다.
 * GLB 파일을 권장합니다.
 * @param {string} path 로드할 파일의 경로. (/data/[파일이름] 형식으로 작성합니다.)
 * @param {string} target 로드한 파일을 받을 object.
 * @returns {null}
 * @example // 사용 예
 * var kirby = new THREE.Object3D();
 * dataLoader('data/kirby_pixar_3d.glb', '커비')
 */
function dataLoader(path, target){
    loader.load(
        path, // 3D data 경로.
        function (gltf) { // Data 불러오는 함수
            target.add(gltf.scene);
        },
        undefined, 
        function (error) {// 실패 시 에러 출력
            console.error(error);
        }
    );
}

init();
animate();