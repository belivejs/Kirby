import * as THREE from 'three';
import House from './house.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

var scene;
var camera;
var renderer;
var controls;

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75, // 시야각
        window.innerWidth / window.innerHeight, // 화면 비율
        0.1, // 가까운 절단면
        1000 // 먼 절단면
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

        // 모델 로딩
        const loader = new GLTFLoader();
        loader.load(
        '../cartoon_villa_wooden_house_low_polygon_3d_model.glb',  // 모델 경로 (GLB 또는 GLTF)
         function (glb) {
            glb.scene.scale.set(5, 5, 5);
            glb.scene.position.set(35, 0, 65); // 모델을 왼쪽으로 이동
            scene.add(glb.scene);  // 씬에 모델 추가
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

function addFence() {
    const loader = new GLTFLoader();
    loader.load('../simple_wood_fence.glb', function (glb) {
        const fence = glb.scene;

        // 울타리 크기 및 처음 위치 설정
        fence.scale.set(2, 2, 2); // 크기 조정

        // 동일한 울타리 복제하여 이어붙이기
        for (let i = 0; i < 5; i++) {  // 10개의 울타리 이어붙이기
            const fenceClone = fence.clone(); // 울타리 복제
            fenceClone.position.set(0, 7, 10 + i*20); // 각 울타리를 옆으로 이동 (X 좌표)
            scene.add(fenceClone);  // 씬에 복제한 울타리 추가
        }

        // 동일한 울타리 복제하여 이어붙이기
        for (let i = 0; i < 5; i++) {  // 10개의 울타리 이어붙이기
            const fenceClone = fence.clone(); // 울타리 복제
            fenceClone.position.set(100, 7, 10 + i*20); // 각 울타리를 옆으로 이동 (X 좌표)
            scene.add(fenceClone);  // 씬에 복제한 울타리 추가
        }

        // 동일한 울타리 복제하여 이어붙이기
        
        for (let i = 0; i < 5; i++) {  // 10개의 울타리 이어붙이기
            fence.rotation.y = Math.PI / 2; // 90도 회전 (라디안으로 설정)
            const fenceClone = fence.clone(); // 울타리 복제
            fenceClone.position.set(10 + i*20, 7, 100); // 각 울타리를 옆으로 이동 (X 좌표)
            scene.add(fenceClone);  // 씬에 복제한 울타리 추가
        }

        for (let i = 0; i < 5; i++) {  // 10개의 울타리 이어붙이기
            fence.rotation.y = Math.PI / 2; // 90도 회전 (라디안으로 설정)
            const fenceClone = fence.clone(); // 울타리 복제
            fenceClone.position.set(10 + i*20, 7, 0); // 각 울타리를 옆으로 이동 (X 좌표)
            scene.add(fenceClone);  // 씬에 복제한 울타리 추가
        }
    });
}

init();
animate();