const animals = ['🐯', '🐻', '🐰', '🐼', '🦊', '🦁', '🐸', '🐨', '🦄', '🐶'];
const successMessages = ['참 잘했어요! 🎉', '정답입니다! 🌟', '최고예요! 👍', '멋져요! ✨', '천재인가요? 🤩'];
const errorMessages = ['다시 한 번 생각해볼까요? 🤔', '아쉽네요, 한 번 더! 💪', '거의 다 왔어요! 🌈', '포기하지 마세요! 🎈'];

let currentNum1, currentNum2;
let score = 0;
let highScore = localStorage.getItem('gugudanHighScore') || 0;

const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer');
const submitBtn = document.getElementById('submit-btn');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const avatarEl = document.getElementById('avatar');

// 초기 최고 점수 설정
highScoreEl.textContent = highScore;

function generateQuestion() {
    // 2단부터 9단까지
    currentNum1 = Math.floor(Math.random() * 8) + 2;
    currentNum2 = Math.floor(Math.random() * 9) + 1;
    
    questionEl.textContent = `${currentNum1} x ${currentNum2} = ?`;
    answerInput.value = '';
    answerInput.focus();
    
    // 귀여운 동물 아바타 랜덤 변경
    avatarEl.textContent = animals[Math.floor(Math.random() * animals.length)];
}

function showFeedback(isCorrect) {
    feedbackEl.classList.remove('hidden', 'feedback-success', 'feedback-error');
    
    if (isCorrect) {
        // 정답 시 처리
        feedbackEl.classList.add('feedback-success');
        const randomMsg = successMessages[Math.floor(Math.random() * successMessages.length)];
        feedbackEl.textContent = randomMsg;
        
        score += 10;
        scoreEl.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem('gugudanHighScore', highScore);
        }
        
        createConfetti();
        
        // 정답이면 잠시 색종이를 즐기고 1.5초 뒤에 새로운 문제
        setTimeout(() => {
            feedbackEl.classList.add('hidden');
            generateQuestion();
        }, 1500);

    } else {
        // 오답 시 처리
        feedbackEl.classList.add('feedback-error');
        const randomMsg = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        feedbackEl.textContent = randomMsg;
        
        // 오답이면 애니메이션(흔들기) 효과 주고 점수는 깎지 않음
        answerInput.style.animation = 'shake 0.4s';
        setTimeout(() => {
            answerInput.style.animation = '';
            answerInput.value = '';
            answerInput.focus();
        }, 400);
    }
}

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value, 10);
    
    if (isNaN(userAnswer)) {
        return; // 아무것도 입력 안했을 때는 스킵
    }
    
    const correctAnswer = currentNum1 * currentNum2;
    
    if (userAnswer === correctAnswer) {
        showFeedback(true);
    } else {
        showFeedback(false);
    }
}

// 축하 색종이(Confetti) 효과 생성 함수
function createConfetti() {
    for (let i = 0; i < 40; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        document.body.appendChild(confetti);

        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        const colors = ['#f2d74e', '#95c3de', '#ff9a91', '#4ecdc4'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.left = x + 'px';
        confetti.style.top = '-20px'; // 화면 위쪽에서 시작
        confetti.style.borderRadius = (Math.random() > 0.5 ? '50%' : '0'); // 동그라미랑 네모 혼합
        confetti.style.width = (Math.random() * 8 + 5) + 'px';
        confetti.style.height = confetti.style.width;
        
        // 떨어지는 애니메이션
        const animation = confetti.animate([
            { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 1 },
            { transform: `translate3d(${Math.random() * 300 - 150}px, ${window.innerHeight}px, 0) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 1500 + 1000,
            easing: 'cubic-bezier(.37,0,.63,1)'
        });
        
        // 끝나면 DOM에서 제거
        animation.onfinish = () => confetti.remove();
    }
}

// 이벤트 리스너: [확인] 버튼 클릭
submitBtn.addEventListener('click', checkAnswer);

// 이벤트 리스너: 엔터키 입력
answerInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// CSS에 오답 시 흔들림(Shake) 애니메이션 동적 추가
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
}
`;
document.head.appendChild(style);

// 게임 시작: 첫 문제 생성
generateQuestion();
