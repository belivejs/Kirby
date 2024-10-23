import * as THREE from 'three';
import House from './house.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


var scene;
var camera;
var renderer;
var controls;
var loader = new GLTFLoader(); // 3D data loader

//keyCode
const LEFT = 65, RIGHT = 68, FRONT = 87, BACK = 83; //adws
let kirbyScene;
//animation
var mixer;
var previousTime;


function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75, // 시야각
        window.innerWidth / window.innerHeight, // 화면 비율
        0.1, // 가까운 절단면
        1000 // 먼 절단면
    );

    dataLoader('data/kirby_pixar_3d.glb', 'kirby Model')
    .then(gltf => {
        kirbyScene = gltf.scene
        objectAnimation(gltf.animations);
    });
    // dataLoader('data/kirby.glb', 'kirby Model')
    // .then(gltf => {
    //     kirbyScene = gltf.scene
    // });
    // dataLoader('data/cartoon_villa_wooden_house_low_polygon_3d_model.glb', 'kirby Model');

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
    scene.add(light);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // 집
    const house = new House(scene, 50);
    // house.init()

    //keyboard event
    document.addEventListener('keydown', moveKirbyByKeyBoard, false)


    requestAnimationFrame(animate);
}


function update(time){
    time *= 0.001; // second unit

    if(mixer) {
        const deltaTime = time - previousTime;
        mixer.update(deltaTime);
    }
    previousTime = time;
}


function animate(time) {
    update(time);
    requestAnimationFrame(animate);
    controls.update(); // OrbitControls 업데이트
    renderer.render(scene, camera);
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
function dataLoader(path, fileName){
    return new Promise((resolve, reject) => { //gltf를 리턴으로 받기위해 비동기 처리
        loader.load(
            path, // 3D data 경로.
            function (gltf) { // Data 불러오는 함수
                console.log(fileName, gltf);
                const characterMesh = gltf;
                scene.add(gltf.scene);

                //성공적으로 로드 된 경우 gltf resolve
                resolve(gltf);
            },
            undefined, 
            function (error) {// 실패 시 에러 출력
                console.error(error);
                reject(error);
            }
        );
    })
    
}

function objectAnimation(animations){
    //에니메이션
    const animationClips = animations
    console.log(animationClips);
    const newMixer = new THREE.AnimationMixer(kirbyScene);
    const animationsMap = {};
    animationClips.forEach(clip => {
        const name = clip.name;
        console.log("name", name);
        animationsMap[name] = newMixer.clipAction(clip); // THREE.AnimationAction
    });

    mixer = newMixer;
    animationsMap["Take 01"].play();
}

/**
 * ADWS(왼오앞뒤) 키를 누르면 커비가 이동합니다 
 * @example document.addEventListener('keydown', moveKirbyByKeyBoard, false)
 */
function moveKirbyByKeyBoard(e){
    if(e.keyCode == LEFT){
        kirbyScene.position.x += 0.5;
    } else if (e.keyCode == RIGHT){
        kirbyScene.position.x -= 0.5;
    } else if (e.keyCode == FRONT){
        kirbyScene.position.z += 0.5;
    } else if (e.keyCode == BACK){
        kirbyScene.position.z -= 0.5;
    }
}


init();
animate();