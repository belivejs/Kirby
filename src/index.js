import * as THREE from 'three';
import House from './house.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var scene;
var camera;
var renderer;
var controls;
var loader = new GLTFLoader(); // 3D data loader

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75, // 시야각
        window.innerWidth / window.innerHeight, // 화면 비율
        0.1, // 가까운 절단면
        1000 // 먼 절단면
    );

    // dataLoader('data/kirby_pixar_3d.glb', 'kirby Model');
    // dataLoader('data/cartoon_villa_wooden_house_low_polygon_3d_model.glb', 'kirby Model');
    var kirby = new THREE.Object3D();
    dataLoader('data/kirby_pixar_3d/scene.gltf', kirby);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.set(70, 60, 100);
    camera.lookAt(0, 0, 0);

    // OrbitControls 추가
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    kirby.add(light);
    scene.add(kirby);

    // 집
    const house = new House(scene, 50);
    // house.init();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // OrbitControls 업데이트
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