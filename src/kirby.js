import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Furniture from './furniture';
import Trash from './trash';
import House from './house';


class Kirby{
    constructor(scene, renderer, camera, orbitControls, setScale, controlProgressBar, updateProgressBar){
        this._scene = scene;
        this._renderer = renderer;
        this._camera = camera;
        this._controls = orbitControls;
        this._controlProgressBar = controlProgressBar;
        this._updateProgressBar = updateProgressBar;

        this.hasSlept = false; // sleep 상태 여부
        this.isDirty = false;  // dirty 상태 여부
        this._scale = setScale;

        this._setupModel();
        this._setupBubbleModel();
        this._setupControl();

        
        requestAnimationFrame(this.render.bind(this));
    }

    //커비 모델 불러오고 애니메이션 세팅
    _setupModel(path = './data/kirby_base.glb'){
        new GLTFLoader().load(path, (gltf) => {
            var scale = this._scale;
            
            //커비 에셋을 scene에 등록
            const model = gltf.scene;
            var mesh = gltf.scene.children[0];
            mesh.scale.set(scale,scale,scale);
            model.position.set(80,1,40)
            this._scene.add(model);

            //커비 에셋 안에 있는 animation들 꺼내기
            const mixer = new THREE.AnimationMixer(model);
            const animationsMap = {}
            gltf.animations.forEach(clip => {
                const name = clip.name;
                console.log(name);
                animationsMap[name] = mixer.clipAction(clip);
            })
            const kirbyBox = new THREE.Box3().setFromObject(model);

            this._mixer = mixer;
            this._animationMap = animationsMap;
            this._currentAnimationAction = null;
            this._model = model;  
            this._kirbyBox = kirbyBox;


            this.setupAnimations();
            this.setupTexture();
            this.initiateRandomSleep();
            this.initiateRandomDirty();
        })
    }

    //모델 불러오고 애니메이션 세팅
    _setupBubbleModel(path = './data/cloud.glb'){
        new GLTFLoader().load(path, (gltf) => {
            var scale = 1.5;
            
            //에셋을 scene에 등록
            const model = gltf.scene;
            var mesh = gltf.scene.children[0];
            mesh.scale.set(scale,scale,scale);
            model.position.set(80,10,40)
            this._scene.add(model);

            //에셋 안에 있는 animation들 꺼내기
            const mixer = new THREE.AnimationMixer(model);
            const animationsMap = {}
            gltf.animations.forEach(clip => {
                const name = clip.name;
                console.log("name : ",name);
                animationsMap[name] = mixer.clipAction(clip);
            })
            // const kirbyBox = new THREE.Box3().setFromObject(model);

            model.visible = false;
            this._bubbleMixer = mixer;
            this._bubbleAnimationMap = animationsMap;
            this._bubbleModel = model;  


            // this.setupAnimations();
            // this.setupTexture();
        })
    }

    _setupControl(){
        this._pressedKeys = {};
        //키보드 클릭 이벤트 - 걷기
        document.addEventListener('keydown', this.keydownEvent);
        //키보드 뗄때 이벤트 - 멈추기
        document.addEventListener('keyup', this.keyupEvent);
    }

    keydownEvent = (e) => {
        this._pressedKeys[e.key.toLowerCase()] = true;
        this._processAnimation();
    };
    keyupEvent = (e) => {
        this._pressedKeys[e.key.toLowerCase()] = false;
        this._processAnimation();
    };


    //걷기 애니메이션 처리
    _processAnimation(){

        // 랜덤 더러워지기 (걸을때마다 1% 확률)
        const randomNumber = Math.floor(Math.random() * 100);
        if (randomNumber === 0) {
            this.setupTexture('dirty');
            // 행복도 낮추기

        }

        const previousAnimationAction = this._currentAnimationAction;
        if(this._pressedKeys["w"] || this._pressedKeys["a"] || this._pressedKeys["s"] || this._pressedKeys["d"]){
            this._currentAnimationAction = this._animationMap["walk"];   
            this._speed = 1.5;   
            this._maxSpeed = 40;
            this._acceleration = 3;
        } else {
            this._currentAnimationAction = null;
            this._speed = 0;
            this._maxSpeed = 0;
            this._acceleration = 0;
        }
        
        this.smoothChange(previousAnimationAction); 
    }

    //부드러운 애니메이션 전환
    smoothChange(previousAnimationAction){
        if(previousAnimationAction == null && this._currentAnimationAction == null){
        } 
        else if(previousAnimationAction == null){
            this._currentAnimationAction.reset().fadeIn(0.5).play();
        }
        else if (this._currentAnimationAction == null){
            this._doAction = false;
            previousAnimationAction.fadeOut(0.5);
        } 
        else if (this._currentAnimationAction !== previousAnimationAction){
            previousAnimationAction.fadeOut(0.5);
            this._currentAnimationAction.reset().fadeIn(0.5).play();        
        } 

    }

    /**
     * 
     * @param {string} animationName : 실행할 애니메이션 이름
     * @param {object} loopOption : THREE.LoopOnce - 클립 한번 재생
                                    THREE.LoopRepeat - 클립의 끝에서 시작 부분으로 즉시 이동할 때마다 선택한 repetitions 수 만큼 클립 재생
                                    THREE.LoopPingPong - 선택한 repetitions 수 만큼 클립을 앞뒤로 재생
     * @param {int} repetitions : 반복횟수 (THREE.LoopRepeat, THREE.LoopPingPong 일때)  
     * @param {string} nextAnimation : 바로 연결해 사용할 애니메이션 있다면 적기
     * @param {boolean} clamp 
     */
     changeAnimation(animationName, loopOption = null, repetitions = null, nextAnimation = null, clamp = false){
        return new Promise((resolve)=>{
            var previousAnimationAction = this._currentAnimationAction;
            this._currentAnimationAction = this._animationMap[animationName];
        

            //애니메이션 마지막 프레임에서 고정하도록 옵션 설정
            if(this._currentAnimationAction && clamp){
                this._currentAnimationAction.clampWhenFinished = true; 
            }

            //애니메이션 반복 옵션
            if(loopOption)
                this._currentAnimationAction.setLoop(loopOption, repetitions)

            //실행
            this.smoothChange(previousAnimationAction)

            //두번째 애니메이션
            if(nextAnimation){
                previousAnimationAction = this._currentAnimationAction;
                this._currentAnimationAction = this._animationMap[nextAnimation];
                //1번 애니메이션이 끝나면 2번 애니메이션 시작
                this._currentAnimationAction.getMixer().addEventListener('finished', () => {
                    this.smoothChange(previousAnimationAction)
                });
            } 
            setTimeout(() => {
                resolve();
            },3000);
        });
    }

    //버튼으로 애니메이션 변경 
    setupAnimations(){
        document.getElementById('work').onclick = () => {
            this.changeAnimation("seat", THREE.LoopOnce, null, 'work', true); //애니메이션 한 번만 실행
        }
        document.getElementById('stand').onclick = () => {
            this.changeAnimation(null);
        }
        document.getElementById('sleep').onclick = () => {
            this.changeAnimation("sleep");
        }
        document.getElementById('cleaning').onclick = () => {
            this.changeAnimation("cleaning", THREE.LoopPingPong, 2, null, false);
        }
    }

    //버튼으로 텍스쳐 변경
    setupTexture(name){
        if(name == 'dirty') {  
            this.changeBobyTexture(this._model, "texture/kirby/Kirby_dirty.jpg")
            this.changeFaceTexture(this._model, "texture/kirby/Kirby-Face_dirty.jpg")
        } else if(name == 'angry'){
            this.changeBobyTexture(this._model, "texture/kirby/Kirby_angry.jpg")
            this.changeFaceTexture(this._model, "texture/kirby/Kirby-Face_angry.jpg")
        } else if(name == 'sleeping') {
            this.changeBobyTexture(this._model, "texture/kirby/Kirby_sleeping.jpg")
            this.changeFaceTexture(this._model, "texture/kirby/Kirby-Face_sleeping.jpg")
        } else if(name == 'base'){
            this.changeBobyTexture(this._model, "texture/kirby/Kirby_base.jpg")
            this.changeFaceTexture(this._model, "texture/kirby/Kirby-Face_base.jpg")
        }
    }

    //몸 텍스쳐 바꾸기
    changeBobyTexture(model, texturePath){
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(texturePath, (texture) => {
            model.traverse((child) => {
                if (child.isMesh) {
                    console.log(child);
                    if(child.name == 'Kirby_Kirby_0'){
                        texture.colorSpace = 'srgb'
                        texture.flipY = false;
                        child.material.map = texture;
                        child.material.needsUpdate = true;
                    }
                }
            });
        }, undefined, (error) => {
            console.error(`Failed to load texture: ${texturePath}`, error);
        });
    }

    //얼굴 텍스쳐 바꾸기
    changeFaceTexture(model, texturePath) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(texturePath, (texture) => {
            model.traverse((child) => {
                if (child.isMesh) {
                    if (child.name == 'Kirby_Kirby_Face_0'){
                    // 모델의 기본 텍스처를 새 텍스처로 교체
                        texture.colorSpace = 'srgb'
                        texture.flipY = false;
                        child.material.map = texture;
                        child.material.needsUpdate = true;
                    }
                }
            });
        }, undefined, (error) => {
            console.error(`Failed to load texture: ${texturePath}`, error);
        });
    }


    //방향별로 offset을 줘서 캐릭터가 이동하는 방향을 바라보도록 하기
    _previousDirectionOffset = 0;
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
        } else {
            directionOffset = this._previousDirectionOffset;
        }

        this._previousDirectionOffset = directionOffset;

        return directionOffset;        
    }


    _speed = 0;
    _maxSpeed = 0;
    _acceleration = 0;

    update(time){
        time *= 0.001; // second unit
        const deltaTime = time - this._previousTime;

        if(this._bubbleMixer){
            this._bubbleMixer.update(deltaTime);
        }
        //믹서가 있을때 애니메이션 실행
        if(this._mixer){
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
            // // 최대 속도 설정
            // if(this._speed < this._maxSpeed) 
            //     this._speed += this._acceleration;
            // else 
            //     this._speed -= this._acceleration*2;
            // 방향 속도 합치기
            const moveX = walkDirection.x * (this._speed);
            const moveZ = walkDirection.z * (this._speed);

            let newPosition = new THREE.Vector3();
            newPosition.set(this._model.position.x + moveX, this._model.position.y, this._model.position.z + moveZ)
            if(!this._doAction){//액션 없을 때
                if(!this.checkCollision(newPosition)){
                    if(newPosition.x <= House.groundWidth && newPosition.z <= House.groundLength){
                        
                        //캐릭터 이동
                        this._model.position.x += moveX;
                        this._model.position.y = 0;
                        this._model.position.z += moveZ; 
                        //카메라 이동
                        this._camera.position.x += moveX;
                        this._camera.position.z += moveZ;
                        //카메라가 바라보는 타겟을 캐릭터로 
                        this._controls.target.set(
                            this._model.position.x,
                            this._model.position.y,
                            this._model.position.z,
                        );     
                    }
                } else{ //부딪혔을때
                    this.collisionAction()
                }
            }
        }

        // if(this._model)
        //     this.checkCollision()
        this._previousTime = time;
    }

    _collisionFurniture;
        // 매 프레임마다 충돌 여부 확인
     checkCollision(newPosition) {
        // Kirby와 가구 경계 상자 새로 설정 (모델 위치 업데이트 반영)
        this._kirbyBox = new THREE.Box3().setFromObject(this._model);
        this._kirbyBox.expandByScalar(-5); // 숫자만큼 모든 방향에서 줄이기
        this._kirbyBox.translate(newPosition.clone().sub(this._model.position)); // 새로운 위치로 Kirby 박스를 이동

        for (const furnitureModel of Furniture.furnitureModelList){
            const furnitureBox = new THREE.Box3().setFromObject(furnitureModel);
            // var furnitureHelper = new THREE.BoxHelper(furnitureModel, 0xff0000); // 빨간색 경계 상자
            // this._scene.add(furnitureHelper);
            // 상자가 겹치는지 확인
            if (this._kirbyBox.intersectsBox(furnitureBox)) {
                console.log('Kirby와 가구가 충돌했습니다!', Furniture.getFurnitureName(furnitureModel));
                const preCollision = this._collisionFurniture;
                this._collisionFurniture = furnitureModel;
                return true;
            }
        }
        for (const wall of House.walls){
            const wallBox = new THREE.Box3().setFromObject(wall);
            // 상자가 겹치는지 확인
            if (this._kirbyBox.intersectsBox(wallBox)) {
                const preCollision = this._collisionFurniture;
                this._collisionFurniture = wall;
                return true;
            }
        }
        return false;
    }

    //부딪혔을때 취할 액션
    _doAction=false;
    async collisionAction(){
        const name = Furniture.getFurnitureName(this._collisionFurniture);
        if (name != "desk") {//책상 부딪혔을떈 애니메이션 x
            console.log(Furniture.getFurnitureName(Furniture.currentFurniture));
            this._doAction = true;
            this._speed = 0;
            document.removeEventListener('keydown', this.keydownEvent);
            document.removeEventListener('keyup', this.keyupEvent);
            this._pressedKeys = {}

            // 충돌한 가구 중심 구하기
            const box = new THREE.Box3().setFromObject(this._collisionFurniture);
            const center = new THREE.Vector3();
            box.getCenter(center);
            
            if(name == 'bath'){
                if(this.isDirty) {
                    this._controlProgressBar(5);
                    this.changeBobyTexture(this._model, "texture/kirby/Kirby_base.jpg")
                    this.changeFaceTexture(this._model, "texture/kirby/Kirby-Face_base.jpg")
                    this.isDirty = false;
                }

                this._model.position.set(
                    center.x,
                    center.y,
                    center.z,
                );
                this._bubbleModel.position.set(
                    center.x,
                    center.y,
                    center.z,
                )
                this._bubbleModel.visible = true;
                this._bubbleAnimationMap['bubble'].play();
                await this.changeAnimation("cleaning");

                this._bubbleModel.visible = false;
                this._bubbleAnimationMap['bubble'].stop();
                this.setupTexture('base');
                this.moveKirby()
                this.changeAnimation(null);
            } else if (name == 'bed'){
                if(this.hasSlept) {
                    this._controlProgressBar(5);
                    this.changeBobyTexture(this._model, "texture/kirby/Kirby_base.jpg")
                    this.changeFaceTexture(this._model, "texture/kirby/Kirby-Face_base.jpg")
                    this.hasSlept = false;
                }

                this._model.position.set(
                    center.x,
                    center.y,
                    center.z,
                );
                await this.changeAnimation("sleep");

                

                this.moveKirby()
                this.changeAnimation(null);

            } else if (name == 'chair'){

                this.updateMoney(2000); 
                this._controlProgressBar(-5);

                this._model.position.set(
                    center.x,
                    center.y,
                    center.z,
                );
                await this.changeAnimation("seat", THREE.LoopOnce, null, 'work', true);
                this.moveKirby()
                this.changeAnimation(null);
            } else if (name == 'trash'){
                // 없애기가 안되서 안보이는 좌표로 날려버림
                // Furniture.findFurniture(this._collisionFurniture);
                this._collisionFurniture.position.x = 9999;
                this._collisionFurniture.position.y = 9999;
                this._collisionFurniture.position.z = 9999;

                // 쓰레기 현재 쓰레기 갯수 감소
                Trash.downCount();
                Furniture.removeFurniture(this._collisionFurniture);
                Furniture.saveToLocalStorage();

                // 행복도 증가
                this._controlProgressBar(5);
            }
            else if (name == 'door'){
                window.open('outdoor_index.html', '_self');
            }
            
            //키보드 이벤트 다시 세팅
            document.addEventListener('keydown', this.keydownEvent);
            document.addEventListener('keyup', this.keyupEvent);
        }
    }

    //커비 옮기기 moveX, moveZ만큼
    moveKirby(){
        const box = new THREE.Box3().setFromObject(this._collisionFurniture);
        const distance = 15;
        
        //캐릭터 이동
        if(this._model.position.x >= 0 && this._model.position.x < House.groundWidth/2 && this._model.position.z <= House.groundLength/2){
            this._model.position.x = box.max.x + distance;
            this._model.position.y = 0;
            this._model.position.z = box.max.z + distance;
        } else if (this._model.position.x > House.groundWidth/2 && this._model.position.z <= House.groundLength/2) {
            this._model.position.x = box.min.x - distance;
            this._model.position.y = 0;
            this._model.position.z = box.max.z + distance;
        } else if (this._model.position.x >= 0 && this._model.position.x < House.groundWidth/2 && this._model.position.z > House.groundLength/2) {
            this._model.position.x = box.max.x + distance;
            this._model.position.y = 0;
            this._model.position.z = box.min.z - distance;
        } else if (this._model.position.x > House.groundWidth/2 && this._model.position.z > House.groundLength/2) {
            this._model.position.x = box.min.x - distance;
            this._model.position.y = 0;
            this._model.position.z = box.min.z - distance;
        }

        
        // // 카메라 이동: x와 z 좌표는 모델 위치에 맞추고, y는 모델보다 높은 값으로 설정
        // this._camera.position.x = this._model.position.x;
        // this._camera.position.y = this._model.position.y + 10;  // 모델보다 10만큼 위로 위치
        // this._camera.position.z = this._model.position.z + 10;  // 모델보다 약간 뒤쪽으로 위치

        // 카메라가 바라보는 타겟을 캐릭터로 설정
        this._controls.target.set(
            this._model.position.x,
            this._model.position.y,
            this._model.position.z,
        );

    }

    render(time) {
        this._renderer.render(this._scene, this._camera);
        this.update(time);

        requestAnimationFrame(this.render.bind(this));
    }

    updateMoney(amount) {
        // 현재 저장된 돈을 불러옵니다.
        let currentMoney = parseInt(sessionStorage.getItem('money')) || 0;
        currentMoney += amount; // 돈 추가
        sessionStorage.setItem('money', currentMoney); // 로컬 스토리지에 저장
        console.log(`Updated Money: ${currentMoney}원`); // 콘솔로 확인
    }

    // 행복도 업데이트 및 텍스처 변경 로직 추가
    checkProgress() {
        let currentProgress = parseInt(sessionStorage.getItem("progressBar"));
        console.log("확인중 : ", currentProgress);

        if (!this._model) {
            console.warn("Kirby 모델이 아직 로드되지 않았습니다.");
            return;
        }
    
        // 행복도 수치가 20 이하일 때 텍스처 변경
        if (currentProgress <= 20 && !this.isDirty && !this.hasSlept) {
            this.changeBobyTexture(this._model, "texture/kirby/Kirby_angry.jpg");
            this.changeFaceTexture(this._model, "texture/kirby/Kirby-Face_angry.jpg");
        }

        else if(currentProgress > 20 && !this.isDirty && !this.hasSlept) {
            this.changeBobyTexture(this._model, "texture/kirby/Kirby_base.jpg");
            this.changeFaceTexture(this._model, "texture/kirby/Kirby-Face_base.jpg");
        }
    }

    // 30초마다 무작위로 Kirby를 sleep 상태로 변경
    initiateRandomSleep() {
        var random = Math.floor(Math.random() *  1000);
        setInterval(() => {
            if (this._model && !this.hasSlept) {  
                this.hasSlept = true;
                this._controlProgressBar(-5);
                console.log("Changing Kirby to sleep texture.");
                this.changeBobyTexture(this._model, "texture/kirby/Kirby_sleeping.jpg");
                this.changeFaceTexture(this._model, "texture/kirby/Kirby-Face_sleeping.jpg");
            }
        }, random*100); 
    }

    // 30초마다 무작위로 Kirby를 sleep 상태로 변경
    initiateRandomDirty() {
        var random = Math.floor(Math.random() *  1000);
        setInterval(() => {
            if (this._model && !this.hasSlept && !this.isDirty) {  
                this.isDirty = true;
                this._controlProgressBar(-5);
                console.log("Changing Kirby to dirty texture.");
                this.changeBobyTexture(this._model, "texture/kirby/Kirby_dirty.jpg");
                this.changeFaceTexture(this._model, "texture/kirby/Kirby-Face_dirty.jpg");
            }
        }, random*100); 
    }
}

export default Kirby;