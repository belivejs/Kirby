// import * as THREE from 'three';

// /**
//  * 게임 밤/낮 시스템을 위한 함수
//  * 추후에 class로 바꾸고, 다듬어야함
//  * @param {int} ticks :게임이 흘러가는 하루의 비율, 60 --> 현실 1분 == 게임 1일 
//  * @param {THREE.DirectionalLight} sunLight : 태양 light source
//  * @param {THREE.DirectionalLight} moonLight : 달 light source
//  * @param {THREE.Mesh} sunMesh : 태양 오브젝트에 사용되는 mesh
//  * @param {THREE.Mesh} moonMesh : 달 오브젝트에 사용되는 mesh
//  * @param {any} target : 태양/달이 돌아가는 고정 오브젝트, 카메라가 될 수도 있고 커비가 될 수도 있고 월드가 될 수도 있음.
//  */
// export function initializeTimer(ticks, sunLight, moonLight, sunMesh, moonMesh, target, scene) {
//     let rotationSpeed = (2 * Math.PI) / ticks; // 하루를 30초에 한 바퀴 회전
//     let seasonDuration = 100000 * 1000; // 100000초마다 계절 변화 (밀리초 단위)
//     let startTime = Date.now();
//     let currentSeason = 0; // 0: 봄, 1: 여름, 2: 가을, 3: 겨울
//     let targetAltitude = 5; // 목표 고도 (초기값: 봄)
//     let currentAltitude = 5; // 현재 고도 (초기값: 봄)

//     const dayColor = new THREE.Color(0xFFFFFF); // 하늘색 (낮)
//     const nightColor = new THREE.Color(0x000000); // 검은색 (밤)

//     function updatePositions() {
//         if (!target || !target.position) {
//             return; // kirby가 아직 로드되지 않은 경우
//         }

//         // 시간 계산
//         const currentTime = Date.now();
//         const elapsedTime = currentTime - startTime;

//         // 1분마다 계절을 변경
//         if (elapsedTime > seasonDuration) {
//             currentSeason = (currentSeason + 1) % 4; // 0, 1, 2, 3 순으로 계절 변경
//             startTime = currentTime; // 계절이 바뀔 때마다 시작 시간 초기화

//             // 계절에 따른 목표 고도 설정
//             switch (currentSeason) {
//                 case 0: // 봄
//                     targetAltitude = 5; // 중간 고도
//                     break;
//                 case 1: // 여름
//                     targetAltitude = 10; // 높은 고도
//                     break;
//                 case 2: // 가을
//                     targetAltitude = 5; // 중간 고도
//                     break;
//                 case 3: // 겨울
//                     targetAltitude = 0; // 낮은 고도
//                     break;
//             }
//         }

//         // 태양 고도를 서서히 변화시키기 위해 보간 사용 (lerp)
//         const altitudeLerpSpeed = 0.01; // 보간 속도 (0에 가까울수록 느림)
//         currentAltitude = THREE.MathUtils.lerp(currentAltitude, targetAltitude, altitudeLerpSpeed);

//         const radius = 10; // 회전 반경
//         const time = Date.now() * 0.001; // 시간 계산

//         // 태양 회전 위치 업데이트 (y축을 z축으로 변환, z축을 y축으로 변환)
//         sunMesh.position.x = target.position.x + radius * Math.cos(time * rotationSpeed);
//         sunMesh.position.y = target.position.y + radius * Math.sin(time * rotationSpeed);
//         sunMesh.position.z = currentAltitude;

//         // 태양 빛의 위치를 태양 구체의 위치와 동기화
//         sunLight.position.copy(sunMesh.position);

//         // 달 회전 위치 업데이트 (고정된 높이, 반대 방향 회전)
//         moonMesh.position.x = target.position.x + radius * Math.cos(time * rotationSpeed + Math.PI);
//         moonMesh.position.y = target.position.y + radius * Math.sin(time * rotationSpeed + Math.PI);
//         moonMesh.position.z = -currentAltitude;

//         // 달 빛의 위치를 달 구체의 위치와 동기화
//         moonLight.position.copy(moonMesh.position);

//         // 태양의 고도에 따라 배경색 변화 (하늘색에서 검정색으로 보간)
//         const altitudeRatio = (currentAltitude - 0) / 10; // 고도를 0에서 10 사이로 정규화
//         scene.background = dayColor.clone().lerp(nightColor, 1 - altitudeRatio); // 낮에서 밤으로 색상 보간

        
//     }

//     return updatePositions; // 회전 로직을 반환
// }
import * as THREE from 'three';

/**
 * 게임 밤/낮 시스템을 위한 함수
 * 추후에 class로 바꾸고, 다듬어야함
 * @param {int} ticks :게임이 흘러가는 하루의 비율, 60 --> 현실 1분 == 게임 1일 
 * @param {THREE.DirectionalLight} sunLight : 태양 light source
 * @param {THREE.DirectionalLight} moonLight : 달 light source
 * @param {THREE.Mesh} sunMesh : 태양 오브젝트에 사용되는 mesh
 * @param {THREE.Mesh} moonMesh : 달 오브젝트에 사용되는 mesh
 * @param {any} target : 태양/달이 돌아가는 고정 오브젝트, 카메라가 될 수도 있고 커비가 될 수도 있고 월드가 될 수도 있음.
 */
export function initializeTimer(ticks, sunLight, moonLight, sunMesh, moonMesh, target, scene) {
    let rotationSpeed = (2 * Math.PI) / ticks; // 하루를 ticks만큼에 한 바퀴 회전
    let startTime = Date.now();

    const dayColor = new THREE.Color(0x50bcdf);
    const nightColor = new THREE.Color(0x212121); // 검은색 (밤)
    let currentBackgroundColor = dayColor.clone();

    function updatePositions() {
        if (!target || !target.position) {
            return; // kirby가 아직 로드되지 않은 경우
        }

        // 시간 계산
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        const radius = 50; // 회전 반경
        const time = (Date.now() - startTime) * 0.001; // 경과 시간을 사용하여 시간 계산

        // 태양 회전 위치 업데이트 (y축을 z축으로 변환, z축을 y축으로 변환)
        sunMesh.position.x = target.position.x + radius * Math.cos(time * rotationSpeed + Math.PI / 2);
        sunMesh.position.y = target.position.y + radius * Math.sin(time * rotationSpeed + Math.PI / 2);
        sunMesh.position.z = 0;

        // 태양 빛의 위치를 태양 구체의 위치와 동기화
        sunLight.position.copy(sunMesh.position);

        // 태양이 0도에서 179도일 때만 보이도록 설정
        sunMesh.visible = (sunMesh.position.y > 0);
        sunLight.visible = sunMesh.visible;
        

        const sunVisibility = Math.max(0, Math.cos(time * rotationSpeed + Math.PI + Math.PI / 2));
        // sunLight.intensity = sunVisibility * sunLight.intensity;

        // 달 회전 위치 업데이트 (고정된 높이, 반대 방향 회전)
        moonMesh.position.x = target.position.x + radius * Math.cos(time * rotationSpeed + Math.PI + Math.PI / 2);
        moonMesh.position.y = target.position.y + radius * Math.sin(time * rotationSpeed + Math.PI + Math.PI / 2);
        moonMesh.position.z = 0;

        // 달 빛의 위치를 달 구체의 위치와 동기화
        moonLight.position.copy(moonMesh.position);

        // 달이 0도에서 179도일 때만 보이도록 설정
        moonMesh.visible = (moonMesh.position.y > 0);
        moonLight.visible = moonMesh.visible;
        const moonVisibility = Math.max(0, Math.cos(time * rotationSpeed + Math.PI + Math.PI / 2));
        // moonLight.intensity = moonVisibility * moonLight.intensity;
        
        // 태양의 고도에 따라 배경색 변화 (낮: 하얀색, 밤: 검은색으로 보간)
        const dayNightRatio = (1 - Math.cos(time * rotationSpeed)) / 2; // 0에서 1 사이로 주기적으로 변화
        currentBackgroundColor.lerpColors(dayColor, nightColor, dayNightRatio)
        // currentBackgroundColor.lerpColors(nightColor, dayColor, dayNightRatio * 0.05); // 천천히 밤에서 낮으로 색상 보간
        scene.background = currentBackgroundColor;

        // // 태양과 달의 빛의 세기를 낮과 밤에 맞춰 서서히 전환 (낮에는 태양 빛이 점점 켜지고, 밤에는 달빛이 점점 켜짐)
        // sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, dayNightRatio, 0.05); // 서서히 전환
        // moonLight.intensity = THREE.MathUtils.lerp(moonLight.intensity, 1 - dayNightRatio, 0.05); // 서서히 전환
    }

    return updatePositions; // 회전 로직을 반환
}