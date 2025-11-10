document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date'); // 날짜 요소
    const countdownElement = document.getElementById('countdown');
    
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoDeadlineInput = document.getElementById('todo-deadline');
    const todoAsapCheckbox = document.getElementById('todo-asap');
    const todoListElement = document.getElementById('todo-list');
    const completedListElement = document.getElementById('completed-list');

    // 로컬 저장소에서 할 일 목록 불러오기
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    // 1. 시계 및 날짜 기능
    function updateClockAndDate() {
        const now = new Date();
        
        // 시계 (24시, 초 단위)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;

        // 날짜 (년, 월, 일, 요일)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작
        const day = String(now.getDate()).padStart(2, '0');
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
        dateElement.textContent = `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
    }

    // 2. 퇴근 카운트다운 기능 (08시 ~ 17시 기준)
    function updateCountdown() {
        const now = new Date();
        const workEndTime = new Date(now);
        workEndTime.setHours(17, 0, 0, 0); // 퇴근 시간 17:00:00

        const workStartTime = new Date(now);
        workStartTime.setHours(8, 0, 0, 0); // 출근 시간 08:00:00

        const dayOfWeek = now.getDay(); // 0 = 일요일, 6 = 토요일

        // 주말
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            countdownElement.textContent = "주말입니다. 편히 쉬세요. :)";
            countdownElement.classList.remove('text-indigo-600');
            countdownElement.classList.add('text-green-600');
            return;
        }

        // 업무 시작 전
        if (now < workStartTime) {
            countdownElement.textContent = "업무 시작 전입니다.";
            countdownElement.classList.remove('text-indigo-600');
            countdownElement.classList.add('text-gray-500');
            return;
        }

        // 업무 종료 후
        if (now >= workEndTime) {
            countdownElement.textContent = "업무가 종료되었습니다. 고생하셨습니다!";
            countdownElement.classList.remove('text-indigo-600');
            countdownElement.classList.add('text-green-600');
            return;
        }

        // 업무 시간 중
        const diff = workEndTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownElement.textContent = `퇴근 시간까지 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} 남았습니다.`;
        countdownElement.classList.add('text-indigo-600');
        countdownElement.classList.remove('text-green-600', 'text-gray-500');
    }

    // 1초마다 모든 시간 관련 함수 실행
    setInterval(() => {
        updateClockAndDate();
        updateCountdown();
    }, 1000);
    
    // 페이지 로드 시 즉시 실행
    updateClockAndDate();
    updateCountdown();

    // 3. 할 일 목록 기능

    // ASAP 체크박스 선택 시 마감 시간 입력 비활성화
    todoAsapCheckbox.addEventListener('change', () => {
        if (todoAsapCheckbox.checked) {
            todoDeadlineInput.disabled = true;
            todoDeadlineInput.value = '';
        } else {
            todoDeadlineInput.disabled = false;
        }
    });

    // 할 일 목록을 화면에 렌더링하는 함수
    function renderTodos() {
        todoListElement.innerHTML = '';
        completedListElement.innerHTML = '';

        // 할 일 정렬: 
        // 1. 완료되지 않은 항목이 위로
        // 2. ASAP이 가장 위로
        // 3. 마감 시간이 임박한 순서대로
        // 4. 마감 시간이 없는 항목은 맨 뒤로
        const sortedTodos = todos.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1; // 완료된 항목은 뒤로
            }

            // ASAP 우선순위
            if (a.deadline === 'ASAP' && b.deadline !== 'ASAP') return -1;
            if (a.deadline !== 'ASAP' && b.deadline === 'ASAP') return 1;
            if (a.deadline === 'ASAP' && b.deadline === 'ASAP') return 0;

            // 마감 시간 없는 경우 (둘 다 ASAP이 아닐 때)
            if (a.deadline === null && b.deadline !== null) return 1;
            if (a.deadline !== null && b.deadline === null) return -1;
            if (a.deadline === null && b.deadline === null) return 0;

            // 마감 시간 비교 (임박한 순)
            return new Date(a.deadline) - new Date(b.deadline);
        });

        sortedTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between p-3 rounded-md transition-colors duration-200';
            li.dataset.id = todo.id;

            let deadlineText = '';
            if (todo.deadline === 'ASAP') {
                deadlineText = '<span class="text-xs font-bold text-red-500 ml-2">[ASAP]</span>';
            } else if (todo.deadline) {
                try {
                    const deadlineDate = new Date(todo.deadline);
                    // 'ko-KR' 로케일을 사용하여 보기 편한 날짜/시간 형식으로 변환
                    deadlineText = `<span class="text-xs text-gray-500 ml-2">(${deadlineDate.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })})</span>`;
                } catch(e) {
                    console.error("Invalid date format:", todo.deadline);
                    deadlineText = `<span class="text-xs text-red-500 ml-2">(날짜 오류)</span>`;
                }
            }

            li.innerHTML = `
                <div class="flex items-center">
                    <input type="checkbox" class="todo-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" ${todo.completed ? 'checked' : ''}>
                    <span class="ml-3 text-sm font-medium">${todo.text}</span>
                    ${deadlineText}
                </div>
                <button class="delete-todo-btn text-gray-400 hover:text-red-500 transition-colors">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;

            if (todo.completed) {
                li.classList.add('completed-task'); // 완료 스타일 적용
                completedListElement.appendChild(li); // '마친 일' 목록으로 이동
            } else {
                li.classList.add('hover:bg-gray-50');
                todoListElement.appendChild(li); // '할 일' 목록에 추가
            }
        });
    }

    // '추가' 버튼 클릭 시 할 일 추가
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text === '') return; // 내용이 없으면 추가하지 않음

        const isAsap = todoAsapCheckbox.checked;
        // ASAP이거나, 마감 시간 값이 있으면 ISO 문자열로 저장, 없으면 null
        const deadline = isAsap ? 'ASAP' : (todoDeadlineInput.value ? new Date(todoDeadlineInput.value).toISOString() : null);

        const newTodo = {
            id: Date.now(), // 고유 ID 생성
            text: text,
            deadline: deadline,
            completed: false
        };

        todos.push(newTodo); // 배열에 추가
        saveAndRender(); // 저장 및 화면 갱신

        // 입력 폼 초기화
        todoInput.value = '';
        todoDeadlineInput.value = '';
        todoAsapCheckbox.checked = false;
        todoDeadlineInput.disabled = false;
    });

    // 할 일 목록 영역(main)에서 발생하는 클릭 이벤트 처리 (이벤트 위임)
    document.querySelector('main').addEventListener('click', (e) => {
        const li = e.target.closest('li[data-id]'); // 클릭된 요소의 부모 <li> 찾기
        if (!li) return;
        
        const id = Number(li.dataset.id);

        // 체크박스 클릭 시 (완료/미완료 토글)
        if (e.target.classList.contains('todo-checkbox')) {
            toggleTodoCompletion(id);
        }

        // 삭제 버튼 클릭 시
        if (e.target.closest('.delete-todo-btn')) {
            deleteTodo(id);
        }
    });

    // 할 일 완료 상태 토글 함수
    function toggleTodoCompletion(id) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            saveAndRender();
        }
    }

    // 할 일 삭제 함수
    function deleteTodo(id) {
        todos = todos.filter(t => t.id !== id);
        saveAndRender();
    }

    // 변경된 'todos' 배열을 로컬 저장소에 저장하고 화면을 다시 그리는 함수
    function saveAndRender() {
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    }

    // 페이지가 처음 로드될 때 할 일 목록을 렌더링
    renderTodos();
});