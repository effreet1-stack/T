// 게임 상위 변수
let numPlayers = 2;
let currentPlayer = 1;
let results = []; // 플레이어별 거리 저장 배열
let isGaugeRunning = false;
let gaugeValue = 0;
let gaugeDirection = 1; // 1은 증가, -1은 감소
let gaugeInterval;

// 화면 및 UI 요소 변수
const introScreen = document.getElementById('intro-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const playerCountSpan = document.getElementById('player-count');
const minusBtn = document.getElementById('minus-btn');
const plusBtn = document.getElementById('plus-btn');
const startBtn = document.getElementById('start-btn');
const actionBtn = document.getElementById('action-btn');
const gaugeFill = document.getElementById('gauge-fill');
const turnIndicator = document.getElementById('turn-indicator');
const shoeImg = document.getElementById('shoe-img');
const gundamImg = document.getElementById('gundam-img');
const distanceMarker = document.getElementById('distance-marker');
const distanceText = document.getElementById('distance-text');
const rankingList = document.getElementById('ranking-list');
const restartBtn = document.getElementById('restart-btn');

// 화면 초기화 및 초기 인원 세팅
minusBtn.addEventListener('click', () => {
    if (numPlayers > 2) {
        numPlayers--;
        playerCountSpan.innerText = numPlayers;
    }
});

plusBtn.addEventListener('click', () => {
    if (numPlayers < 8) { // 최대 8명까지
        numPlayers++;
        playerCountSpan.innerText = numPlayers;
    }
});

startBtn.addEventListener('click', () => {
    results = [];
    currentPlayer = 1;
    switchScreen(introScreen, gameScreen);
    startTurn();
});

// 화면 스위칭 함수
function switchScreen(from, to) {
    from.classList.remove('active');
    to.classList.add('active');
}

// 개별 플레이어의 턴 시작
function startTurn() {
    turnIndicator.innerText = `플레이어 ${currentPlayer} 차례`;
    actionBtn.innerText = '파워 충전 중... 누르세요!';
    actionBtn.disabled = false;
    
    // 신발 위치 및 스타일 초기화
    shoeImg.style.transition = 'none';
    shoeImg.style.transform = 'rotate(0deg)';
    shoeImg.style.left = '100px'; 
    shoeImg.style.bottom = '20px';
    distanceMarker.classList.add('hidden');
    
    // 게이지 시작점
    gaugeValue = 0;
    gaugeDirection = 1;
    isGaugeRunning = true;
    
    clearInterval(gaugeInterval);
    gaugeInterval = setInterval(updateGauge, 15); // 부드럽고 템포 있는 게이지 변화
}

function updateGauge() {
    gaugeValue += 2 * gaugeDirection; // 증감량 조절
    
    if (gaugeValue >= 100) {
        gaugeValue = 100;
        gaugeDirection = -1;
    } else if (gaugeValue <= 0) {
        gaugeValue = 0;
        gaugeDirection = 1;
    }
    
    gaugeFill.style.width = `${gaugeValue}%`;
}

// 타이밍에 맞춰 버튼 클릭(던지기 액션 발생) 시 실행되는 함수
actionBtn.addEventListener('click', () => {
    if (!isGaugeRunning) return;
    
    isGaugeRunning = false;
    clearInterval(gaugeInterval); // 게이지 스탑
    actionBtn.disabled = true;
    actionBtn.innerText = '아득히 멀리 날아가는 중...';
    
    // 타점에 기반한 파워 계산 (노란 구역이 대략 79~91% 구간)
    let targetOptimalValue = 85; 
    let distanceDiff = Math.abs(targetOptimalValue - gaugeValue); 
    
    let power = 100 - (distanceDiff * 1.5); // 차이가 클수록 파워 하락
    if (power < 10) power = 10; // 최소한 날아가긴 함
    
    // 타점의 힘 + 약간의 난수(운빨 변수)
    let randomMultiplier = (Math.random() * 0.3) + 0.85; // 0.85 ~ 1.15
    let finalDistance = Math.round(power * 1.5 * randomMultiplier); 
    
    // 결과 저장
    results.push({ player: currentPlayer, distance: finalDistance });
    
    // 건담 발차기(던지기 폼) 애니메이션 추가
    gundamImg.classList.add('kick');
    setTimeout(() => { gundamImg.classList.remove('kick'); }, 300);
    
    // --- 신발 비행 애니메이션 로직 ---
    let screenWidth = window.innerWidth;
    
    // 거리에 비례한 픽셀값 연산 (화면 밖/안 모두 고려)
    let distancePx = (finalDistance / 180) * (screenWidth * 0.7); 
    
    // 1단계: 위로 치솟으면서 회전 시작
    shoeImg.style.transition = 'transform 1.5s linear, left 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), bottom 0.7s cubic-bezier(0.32, 0, 0.67, 0)';
    shoeImg.style.left = `${100 + distancePx}px`; // x축
    shoeImg.style.transform = `rotate(${finalDistance * 12}deg)`; // 막 회전함
    shoeImg.style.bottom = `${40 + (power * 4)}px`; // 파워에 비례해 y축 상단 궤적

    // 2단계: 최정점을 찍고 다시 바닥으로 낙하 (포물선 흉내)
    setTimeout(() => {
        shoeImg.style.transition = 'bottom 0.8s ease-in, transform 0.8s linear';
        shoeImg.style.bottom = '20px'; // 바닥 위치
    }, 700);

    // 3단계: 애니메이션 완료 후 마커 및 결과 넘김 처리 시작
    setTimeout(() => {
        // 비거리에 마커 박기
        distanceText.innerText = `${finalDistance}m`;
        
        // 마커가 화면 넘어가지 않게 제한
        let markerLeft = 100 + distancePx;
        if(markerLeft > screenWidth - 100) markerLeft = screenWidth - 100;
        
        distanceMarker.style.left = `${markerLeft}px`;
        distanceMarker.classList.remove('hidden');
        
        // 결과 표시 대기 후 다음 턴
        setTimeout(() => {
            currentPlayer++;
            if (currentPlayer > numPlayers) {
                showResults();
            } else {
                startTurn();
            }
        }, 2500); // 2.5초간 자신의 결과를 확인하는 여유 체류 시간
        
    }, 1500); // 총 비행시간 1.5초 대기
});

// 결과창 순위 렌더링 함수
function showResults() {
    switchScreen(gameScreen, resultScreen);
    
    // 거리가 높은 순으로 내림차순 정렬
    results.sort((a, b) => b.distance - a.distance);
    
    rankingList.innerHTML = '';
    
    results.forEach((res, index) => {
        const item = document.createElement('div');
        item.className = `rank-item ${index === 0 ? 'winner' : ''}`; // 1등은 노란색 하이라이트 부여
        
        let rankText = index === 0 ? '👑 전체 1등' : `${index + 1}등`;
        
        item.innerHTML = `
            <span>${rankText} (플레이어 ${res.player})</span>
            <span>${res.distance}m</span>
        `;
        rankingList.appendChild(item);
    });
}

// 재도전 버튼
restartBtn.addEventListener('click', () => {
    switchScreen(resultScreen, introScreen);
});
