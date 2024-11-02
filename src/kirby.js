import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


class Kirby{
    constructor(scene, renderer, camera){
        this._scene = scene;

        // const renderer = new THREE.WebGLRenderer();
        // renderer.setSize(window.innerWidth, window.innerHeight);
        // document.body.appendChild(renderer.domElement);

        // renderer.shadowMap.enabled = true;
        // renderer.shadowMap.type = THREE.VSMShadowMap;

        this._renderer = renderer;
        this._camera = camera;

        this._setupModel();
        this._setupControl();
        
        requestAnimationFrame(this.render.bind(this));
    }

    //커비 모델 불러오고 애니메이션 세팅
    _setupModel(){
        new GLTFLoader().load('data/kirby_base.glb', (gltf) => {
            var scale = 0.2;
            
            //커비 에셋을 scene에 등록
            const model = gltf.scene;
            var mesh = gltf.scene.children[0];
            mesh.scale.set(scale,scale,scale);
            this._scene.add(model);

            //커비 에셋 안에 있는 animation들 꺼내기
            const mixer = new THREE.AnimationMixer(model);
            const animationsMap = {}
            gltf.animations.forEach(clip => {
                const name = clip.name;
                console.log(name);
                animationsMap[name] = mixer.clipAction(clip);
            })

            this._mixer = mixer;
            this._animationMap = animationsMap;
            this._currentAnimationAction = null;
            // this._currentAnimationAction.play();

            this._model = model;  
            


        })
    }

    _setupControl(){
        this._pressedKeys = {};
        
        document.addEventListener('keydown', (event) => {
            this._pressedKeys[event.key.toLowerCase()] = true;
            this._processAnimation();
        });

        document.addEventListener('keyup', (event) => {
            this._pressedKeys[event.key.toLowerCase()] = false;
            this._processAnimation();
        });
    }

    _processAnimation(){
        const previousAnimationAction = this._currentAnimationAction;

        if(this._pressedKeys["w"] || this._pressedKeys["a"] || this._pressedKeys["s"] || this._pressedKeys["d"]){
            this._currentAnimationAction = this._animationMap["walk"];      
            this._speed = 2;
        } else {
            this._currentAnimationAction = null;
            this._speed = 0;
        }
        

        //애니메이션 전환시 부드럽게
        if(previousAnimationAction == null && this._currentAnimationAction == null){
            console.log('1')   
        } 
        else if(previousAnimationAction == null){
            console.log("2")   
            this._currentAnimationAction.reset().fadeIn(0.5).play();
        } 
        else if (this._currentAnimationAction == null){
            console.log("3")   
            previousAnimationAction.fadeOut(0.5);
        } 
        else if (previousAnimationAction !== this._currentAnimationAction) {
            previousAnimationAction.fadeOut(0.5);
            this._currentAnimationAction.reset().fadeIn(0.5).play();
        }
    }

    update(time){
        time *= 0.001; // second unit

        //믹서가 있을때 애니메이션 실행
        if(this._mixer){
            const deltaTime = time - this._previousTime;
            this._mixer.update(deltaTime);

            // 현재 속도에 맞춰 이동
            if (this._speed > 0) {
                this._model.position.x += this._speed * deltaTime;
                this._model.position.z += this._speed * deltaTime;
            }
        }
        this._previousTime = time;
    }

    render(time) {
        this._renderer.render(this._scene, this._camera);
        this.update(time);

        requestAnimationFrame(this.render.bind(this));
    }

}

export default Kirby;
