const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const loader = document.getElementById('loader');
const emptyState = document.getElementById('empty-state');

const settingsBtn = document.getElementById('settings-btn');
const apiModal = document.getElementById('api-modal');
const modalClose = document.getElementById('modal-close');
const saveApiBtn = document.getElementById('save-api-btn');
const clientIdInput = document.getElementById('client-id');
const clientSecretInput = document.getElementById('client-secret');

// Local Storage에서 API 키 로드
let clientId = localStorage.getItem('naverClientId') || '';
let clientSecret = localStorage.getItem('naverClientSecret') || '';

// 설정값을 모달의 인풋창에 출력
clientIdInput.value = clientId;
clientSecretInput.value = clientSecret;

// 로딩 완료 후 키가 없으면 (처음 접속시) 설정 모달 자동 띄우기
if(clientId === '' || clientSecret === '') {
    apiModal.classList.remove('hidden');
}

// 아이콘 클릭 시 모달 열기/닫기
settingsBtn.addEventListener('click', () => {
    apiModal.classList.remove('hidden');
});

modalClose.addEventListener('click', () => {
    apiModal.classList.add('hidden');
});

// API 키 스토리지 저장
saveApiBtn.addEventListener('click', () => {
    const newId = clientIdInput.value.trim();
    const newSecret = clientSecretInput.value.trim();

    if(newId === '' || newSecret === '') {
        alert('Client ID와 Client Secret을 모두 입력해주세요.');
        return;
    }

    clientId = newId;
    clientSecret = newSecret;
    
    localStorage.setItem('naverClientId', clientId);
    localStorage.setItem('naverClientSecret', clientSecret);
    
    apiModal.classList.add('hidden');
    alert('API 키가 성공적으로 저장되었습니다!');
});

// 폼 서밋 (검색) 이벤트 리스너
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if(!query) return;

    // 검색 전에 키가 세팅되어 있는지 검사
    if(clientId === '' || clientSecret === '') {
        alert('우측 상단의 톱니바퀴 버튼을 눌러 API 키를 먼저 세팅해주세요.');
        apiModal.classList.remove('hidden');
        return;
    }

    searchProducts(query);
});

// API 호출하여 데이터 받아오는 비동기 함수
async function searchProducts(query) {
    // UI 초기화 및 로딩상태 온
    resultsContainer.innerHTML = '';
    resultsContainer.classList.add('hidden');
    emptyState.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        // 네이버 검색용 URL 포맷
        const apiURL = \`https://openapi.naver.com/v1/search/shop.json?query=\${encodeURIComponent(query)}&display=20&sort=sim\`;
        
        // CORS 프록시 서버 우회 (브라우저에서 직접호출 시 보안문제 해결)
        const proxyURL = \`https://corsproxy.io/?\${encodeURIComponent(apiURL)}\`;
        
        const response = await fetch(proxyURL, {
            method: 'GET',
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret
            }
        });

        const data = await response.json();

        // 인증 에러 혹은 키 유효기간 만료 등
        if(data.errorMessage) {
            alert('API 호출 에러: ' + data.errorMessage + '\\nAPI 키를 다시 확인해주세요.');
            loader.classList.add('hidden');
            return;
        }

        if(data.items && data.items.length > 0) {
            renderProducts(data.items);
        } else {
            // 결과 없음
            emptyState.classList.remove('hidden');
        }
    } catch (error) {
        console.error(error);
        alert('상품 정보를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\\n(CORS 서버가 일시적으로 불안정할 수 있습니다.)');
    } finally {
        loader.classList.add('hidden');
    }
}

// 받아온 JSON Array를 조립하여 HTML로 그리는 함수
function renderProducts(items) {
    items.forEach(item => {
        // <b>등 HTML 태그 제거하여 title 정제
        const title = item.title.replace(/<[^>]*>?/gm, '');
        // 가격에 천단위 콤마 찍기
        const priceNum = parseInt(item.lprice, 10);
        const lprice = priceNum.toLocaleString();
        
        const card = document.createElement('a');
        card.href = item.link;
        card.target = '_blank';
        card.className = 'product-card';
        
        // mallName이 없으면 기본값 부여
        const mallName = item.mallName || '기타 쇼핑몰';

        card.innerHTML = \`
            <div class="product-img-wrap">
                <span class="mall-badge">\${mallName}</span>
                <img src="\${item.image}" alt="\${title}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">\${title}</h3>
                <div class="product-price">\${lprice}<span>원</span></div>
            </div>
        \`;
        
        resultsContainer.appendChild(card);
    });

    resultsContainer.classList.remove('hidden');
}
