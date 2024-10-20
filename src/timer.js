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
export function initializeTimer(ticks, sunLight, moonLight, sunMesh, moonMesh, target) {
    let rotationSpeed = (2 * Math.PI) / ticks; // 하루를 30초에 한 바퀴 회전
    let seasonDuration = 100000 * 1000; // 100000초마다 계절 변화 (밀리초 단위)
    let startTime = Date.now();
    let currentSeason = 0; // 0: 봄, 1: 여름, 2: 가을, 3: 겨울
    let targetAltitude = 5; // 목표 고도 (초기값: 봄)
    let currentAltitude = 5; // 현재 고도 (초기값: 봄)

    function updatePositions() {
        if (!target || !target.position) {
            return; // kirby가 아직 로드되지 않은 경우
        }

        // 시간 계산
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        // 1분마다 계절을 변경
        if (elapsedTime > seasonDuration) {
            currentSeason = (currentSeason + 1) % 4; // 0, 1, 2, 3 순으로 계절 변경
            startTime = currentTime; // 계절이 바뀔 때마다 시작 시간 초기화

            // 계절에 따른 목표 고도 설정
            switch (currentSeason) {
                case 0: // 봄
                    targetAltitude = 5; // 중간 고도
                    break;
                case 1: // 여름
                    targetAltitude = 10; // 높은 고도
                    break;
                case 2: // 가을
                    targetAltitude = 5; // 중간 고도
                    break;
                case 3: // 겨울
                    targetAltitude = 0; // 낮은 고도
                    break;
            }
        }

        // 태양 고도를 서서히 변화시키기 위해 보간 사용 (lerp)
        const altitudeLerpSpeed = 0.01; // 보간 속도 (0에 가까울수록 느림)
        currentAltitude = THREE.MathUtils.lerp(currentAltitude, targetAltitude, altitudeLerpSpeed);

        const radius = 10; // 회전 반경
        const time = Date.now() * 0.001; // 시간 계산

        // 태양 회전 위치 업데이트 (y축을 z축으로 변환, z축을 y축으로 변환)
        sunMesh.position.x = target.position.x + radius * Math.cos(time * rotationSpeed);
        sunMesh.position.y = target.position.y + radius * Math.sin(time * rotationSpeed);
        sunMesh.position.z = currentAltitude;

        // 태양 빛의 위치를 태양 구체의 위치와 동기화
        sunLight.position.copy(sunMesh.position);

        // 달 회전 위치 업데이트 (고정된 높이, 반대 방향 회전)
        moonMesh.position.x = target.position.x + radius * Math.cos(time * rotationSpeed + Math.PI);
        moonMesh.position.y = target.position.y + radius * Math.sin(time * rotationSpeed + Math.PI);
        moonMesh.position.z = -currentAltitude;

        // 달 빛의 위치를 달 구체의 위치와 동기화
        moonLight.position.copy(moonMesh.position);
    }

    return updatePositions; // 회전 로직을 반환
}