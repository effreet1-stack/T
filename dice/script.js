// 주사위 눈 각각의 위치 조합
// 3x3 그리드 위치 매핑 (a, b, c, d, e, f, g, h, i)
const diceDotConfigurations = {
    1: ['e'],
    2: ['c', 'g'],
    3: ['c', 'e', 'g'],
    4: ['a', 'c', 'g', 'i'],
    5: ['a', 'c', 'e', 'g', 'i'],
    6: ['a', 'c', 'd', 'f', 'g', 'i']
};

const dice1Element = document.getElementById('dice1');
const dice2Element = document.getElementById('dice2');
const rollBtn = document.getElementById('rollBtn');
const resultElement = document.getElementById('result');

// 주사위 화면 업데이트 함수
function updateDice(diceElement, number) {
    // 기존 주사위 눈 제거
    diceElement.innerHTML = '';
    
    // 주사위 숫자에 맞는 위치에 dot 요소 생성
    const dotsArray = diceDotConfigurations[number];
    dotsArray.forEach(positionClass => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.classList.add(`dot-${positionClass}`);
        diceElement.appendChild(dot);
    });
}

// 1~6 사이의 난수 생성
function getRandomNumber() {
    return Math.floor(Math.random() * 6) + 1;
}

// 초기 주사위 설정 (빈 주사위 대신 기본값 6으로 세팅)
updateDice(dice1Element, 6);
updateDice(dice2Element, 6);

// 주사위 굴리기 로직
rollBtn.addEventListener('click', () => {
    // 버튼 비활성화 및 결과 숨기기
    rollBtn.disabled = true;
    resultElement.classList.add('hidden');
    resultElement.innerHTML = '결과 대기 중...';
    
    // 애니메이션 시작
    dice1Element.classList.add('rolling');
    dice2Element.classList.add('rolling');
    
    // 랜덤 주사위 눈이 연속해서 변하는 시각적 효과 (빠르게 회전하는 느낌 유지)
    const rollingInterval = setInterval(() => {
        updateDice(dice1Element, getRandomNumber());
        updateDice(dice2Element, getRandomNumber());
    }, 100);

    // 1.5초 후 최종 결과 결정
    setTimeout(() => {
        clearInterval(rollingInterval); // 반복 멈춤
        
        // 최종 숫자 계산
        const finalNum1 = getRandomNumber();
        const finalNum2 = getRandomNumber();
        const total = finalNum1 + finalNum2;
        
        // 최종 주사위 렌더링
        updateDice(dice1Element, finalNum1);
        updateDice(dice2Element, finalNum2);
        
        // 주사위 접근성 레이블 업데이트
        dice1Element.setAttribute('aria-label', `주사위 1: ${finalNum1}`);
        dice2Element.setAttribute('aria-label', `주사위 2: ${finalNum2}`);
        
        // 애니메이션 클래스 제거
        dice1Element.classList.remove('rolling');
        dice2Element.classList.remove('rolling');
        
        // 결과 표시 (합계 강조)
        setTimeout(() => {
            resultElement.innerHTML = `주사위의 합은 <span class="highlight">${total}</span> 입니다!`;
            resultElement.classList.remove('hidden');
            rollBtn.disabled = false;
        }, 300); // 흔들림 멈추고 살짝 대기 후 결과 표시

    }, 1200); // 1.2초간 애니메이션 진행
});
