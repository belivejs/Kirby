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

        const radius = 500; // 회전 반경
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
        currentBackgroundColor.lerpColors(dayColor, nightColor, dayNightRatio);
        
        // currentBackgroundColor.lerpColors(nightColor, dayColor, dayNightRatio * 0.05); // 천천히 밤에서 낮으로 색상 보간
        scene.background = currentBackgroundColor;

        // // 태양과 달의 빛의 세기를 낮과 밤에 맞춰 서서히 전환 (낮에는 태양 빛이 점점 켜지고, 밤에는 달빛이 점점 켜짐)
        // sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, dayNightRatio, 0.05); // 서서히 전환
        // moonLight.intensity = THREE.MathUtils.lerp(moonLight.intensity, 1 - dayNightRatio, 0.05); // 서서히 전환
    }

    return updatePositions; // 회전 로직을 반환
}