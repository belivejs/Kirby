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
        new GLTFLoader().load('data/kirby_dirty_face.glb', (gltf) => {
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

            this._model = model;  
            console.log("model position: ", this._model.position.x,":", this._model.position.y)



        })
    }

    _setupControl(){
        this._pressedKeys = {};
        
        //키보드 클릭 이벤트 - 걷기
        document.addEventListener('keydown', (event) => {
            this._pressedKeys[event.key.toLowerCase()] = true;
            this._processAnimation();
        });
        //키보드 뗄때 이벤트 - 멈추기
        document.addEventListener('keyup', (event) => {
            this._pressedKeys[event.key.toLowerCase()] = false;
            this._processAnimation();
        });
    }

    _processAnimation(){
        const previousAnimationAction = this._currentAnimationAction;

        if(this._pressedKeys["w"] || this._pressedKeys["a"] || this._pressedKeys["s"] || this._pressedKeys["d"]){
            this._currentAnimationAction = this._animationMap["walk"];      
            this._maxSpeed = 40;
            this._acceleration = 3;
        } else {
            this._currentAnimationAction = null;
            this._speed = 0;
            this._maxSpeed = 0;
            this._acceleration = 0;
        }
        

        //애니메이션 전환시 부드럽게
        if(previousAnimationAction == null && this._currentAnimationAction == null){
        } 
        else if(previousAnimationAction == null){
            this._currentAnimationAction.reset().fadeIn(0.5).play();
        } 
        else if (this._currentAnimationAction == null){
            previousAnimationAction.fadeOut(0.5);
        } 
        else if (previousAnimationAction !== this._currentAnimationAction) {
            previousAnimationAction.fadeOut(0.5);
            this._currentAnimationAction.reset().fadeIn(0.5).play();
        }
    }

    //방향별로 offset을 줘서 캐릭터가 이동하는 방향을 바라보도록 하기
    _directionOffset(){
        const pressedKeys = this._pressedKeys;
        let directionOffset = 0; //기본 : 정면

        //정면에서 시계 방향 -, 반시계 방향 +. 최대 180
        if(pressedKeys['w']==true){
            if (pressedKeys['a']) {
                directionOffset = Math.PI / 4 // w+a (45도)
            } else if (pressedKeys['d']) {
                directionOffset = - Math.PI / 4 // w+d (-45도)
            }
        } else if(pressedKeys['s'] == true){
            if (pressedKeys['a']) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // s+a (135도)
            } else if (pressedKeys['d']) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d (-135도)
            } else {
                directionOffset = Math.PI // s (180도)
            }
        } else if (pressedKeys['a']) {
            directionOffset = Math.PI / 2 // a (90도)
        } else if (pressedKeys['d']) {
            directionOffset = - Math.PI / 2 // d (-90도)
        }

        return directionOffset;        
    }

    _speed = 0;
    _maxSpeed = 0;
    _acceleration = 0;

    update(time){
        time *= 0.001; // second unit

        //믹서가 있을때 애니메이션 실행
        if(this._mixer){
            const deltaTime = time - this._previousTime;
            this._mixer.update(deltaTime);


            /// 카메라가 보는 방향으로 캐릭터 회전 ///
            //카메라가 보는 방향을 캐릭터도 바라보게하기위한 angle값, Math.PI는 캐릭터가 기본적으로 바라보고 있는 값
            const angleCameraDirectionAxisY = Math.atan2(
                (this._camera.position.x - this._model.position.x),
                (this._camera.position.z - this._model.position.z)
            ) + Math.PI;
            //캐릭터 회전
            const rotateQuarternion = new THREE.Quaternion();
            rotateQuarternion.setFromAxisAngle(
                new THREE.Vector3(0,1,0), //y축 방향으로 -> y축 고정으로 돌린단 말
                angleCameraDirectionAxisY + this._directionOffset() //이 angle만큼 
            );
            this._model.quaternion.rotateTowards(
                rotateQuarternion, 
                THREE.MathUtils.degToRad(5) //목표angle에 도달할때까지 5도씩 점진적으로 회전한다.
            );



            /// 캐릭터 걷기 ///
            //카메라가 바라보는 방향 가져오기
            const walkDirection = new THREE.Vector3();
            this._camera.getWorldDirection(walkDirection);
            walkDirection.y = 0; //위아래 이동x
            walkDirection.normalize();
            walkDirection.applyAxisAngle(new THREE.Vector3(0,1,0), this._directionOffset()); //누른 방향으로 보정
            //최대 속도 설정
            if(this._speed < this._maxSpeed) 
                this._speed += this._acceleration;
            else 
                this._speed -= this._acceleration*2;
            // 방향 속도 합치기
            const moveX = walkDirection.x * (this._speed * deltaTime);
            const moveZ = walkDirection.z * (this._speed * deltaTime);
           // 이동
            this._model.position.x += moveX;
            this._model.position.z += moveZ; 



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
