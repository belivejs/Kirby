import * as THREE from 'three';
import House from './house.js';
import Kirby from './kirby.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


var scene;
var camera;
var renderer;
var controls;
var loader = new GLTFLoader(); // 3D data loader

//keyCode
const LEFT = 65, RIGHT = 68, FRONT = 87, BACK = 83; //adws
//animation
var mixer;
var previousTime;
var kirbyGltf;
const kirbyAnimationsMap = {}; //커비에 들어있는 애니메이션 목록을 저장



function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75, // 시야각
        window.innerWidth / window.innerHeight, // 화면 비율
        0.1, // 가까운 절단면
        1000 // 먼 절단면
    );

    
    // dataLoader('data/kirby_angry_face.glb', 'kirby', 0.2).then((gltf) => {
    //     kirbyGltf = gltf;
    //     // setColor(kirbyGltf.scene, "hotpink"); //색 입히기
    //     objectAnimation(kirbyGltf.scene, kirbyGltf.animations)
    //     document.addEventListener('keydown', moveKirbyByKeyBoard, false);
    //     document.addEventListener('keyup', stopKirbyByKeyBoard, false);
    // }).catch((error) => {
    //     console.error("Failed to load model:", error);
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
    house.init()

    new Kirby(scene, renderer, camera, controls);



    requestAnimationFrame(animate);
}


function controlAnimation(time){
    time *= 0.001; // second unit
    if(mixer) {
        const deltaTime = time - previousTime;
        mixer.update(deltaTime);
    }
    previousTime = time;
}


function animate(time) {
    controlAnimation(time);
    requestAnimationFrame(animate);
    controls.update(); // OrbitControls 업데이트
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
    return new Promise((resolve, reject) => {
        loader.load(
            path, // 3D data 경로.
            function (gltf) { // Data 불러오는 함수
                console.log(fileName, gltf);
                const characterMesh = gltf; //mesh
                var mesh = gltf.scene.children[0];
                mesh.scale.set(scale,scale,scale);
                scene.add(gltf.scene);

                // 성공적으로 로드된 경우 resolve
                resolve(gltf);
            },
            undefined,
            function (error) { // 실패 시 에러 출력
                console.error(error);
                reject(error);
            }
        );
    });
}

//object animation
function objectAnimation(scene, animations){
    //에니메이션
    const animationClips = animations
    console.log(animationClips);
    const newMixer = new THREE.AnimationMixer(scene);
    animationClips.forEach(clip => {
        const name = clip.name;
        console.log("name", name);
        kirbyAnimationsMap[name] = newMixer.clipAction(clip); // THREE.AnimationAction
    });

    mixer = newMixer;
    // animationsMap["walk"].play(); //animationClips:name에 들어있는 이름이어야함
}
//애니메이션 시작
function startAnimation(actionTitle) {
    if (kirbyAnimationsMap[actionTitle] && !kirbyAnimationsMap[actionTitle].isRunning()) {
        kirbyAnimationsMap[actionTitle].play()
        console.log('start')
    }
}
// 애니메이션 멈춤
function stopAnimation(actionTitle) {
    if (kirbyAnimationsMap[actionTitle] && kirbyAnimationsMap[actionTitle].isRunning()) {
        kirbyAnimationsMap[actionTitle].stop()
    }
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


/**
 * ADWS(왼오앞뒤) 키를 누르면 커비가 이동합니다 
 * @example document.addEventListener('keydown', moveKirbyByKeyBoard, false)
 */
function moveKirbyByKeyBoard(e){
    if(e.keyCode == LEFT){
        kirbyGltf.scene.position.x += 0.5;
        startAnimation('walk')
    } else if (e.keyCode == RIGHT){
        kirbyGltf.scene.position.x -= 0.5;
        startAnimation('walk')
    } else if (e.keyCode == FRONT){
        kirbyGltf.scene.position.z += 0.5;
        startAnimation('walk')
    } else if (e.keyCode == BACK){
        kirbyGltf.scene.position.z -= 0.5;
        startAnimation('walk')
    }
}
function stopKirbyByKeyBoard(e){
    if(e.keyCode == LEFT){
        stopAnimation('walk')
    } else if (e.keyCode == RIGHT){
        stopAnimation('walk')
    } else if (e.keyCode == FRONT){
        stopAnimation('walk')
    } else if (e.keyCode == BACK){
        stopAnimation('walk')
    }
}


init();
animate();