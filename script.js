// 스크립트가 DOM 콘텐츠를 모두 읽은 후에 실행되도록 보장합니다.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. 시계 기능 ---
    const clockElement = document.getElementById('clock');

    function updateClock() {
        const now = new Date();
        // 24시 형식, 2자리 숫자로 맞추기 (padStart)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // 1초마다 updateClock 함수 실행
    setInterval(updateClock, 1000);
    // 페이지 로드 시 즉시 1회 실행
    updateClock();

    // --- 2 & 3. 투두 리스트 기능 ---
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');

    // 할 일 추가하는 함수
    function addTask() {
        const taskText = todoInput.value.trim(); // 입력값의 앞뒤 공백 제거

        // 입력값이 비어있으면 함수 종료 (아무것도 추가하지 않음)
        if (taskText === "") {
            return;
        }

        // 1. 새로운 <li> (리스트 아이템) 생성
        const li = document.createElement('li');

        // 2. 할 일 텍스트를 담을 <span> 생성
        const taskSpan = document.createElement('span');
        taskSpan.textContent = taskText;
        taskSpan.className = 'task-text';

        // 3. '완료' 버튼 생성
        const completeButton = document.createElement('button');
        completeButton.textContent = '완료';
        completeButton.className = 'complete-button';

        // 4. '완료' 버튼 클릭 이벤트 처리
        completeButton.addEventListener('click', () => {
            completeTask(li, taskText);
        });

        // 5. <li>에 텍스트(span)와 버튼 추가
        li.appendChild(taskSpan);
        li.appendChild(completeButton);

        // 6. '진행 중인 할 일' 목록에 <li> 추가
        todoList.appendChild(li);

        // 7. 입력창 초기화
        todoInput.value = '';
    }

    // 할 일을 완료 처리하는 함수
    function completeTask(taskItem, taskText) {
        // 1. '진행 중' 목록에서 해당 아이템 제거
        taskItem.remove();

        // 2. '마친 일' 목록에 새로 <li> 생성
        const completedLi = document.createElement('li');
        completedLi.textContent = taskText;
        
        // (style.css에 정의된 '.completed' 클래스를 적용하려 했으나,
        // 여기서는 #completed-list li 에 직접 스타일을 적용했으므로 클래스 추가 불필요)

        // 3. '마친 일' 목록에 추가
        completedList.appendChild(completedLi);
    }

    // '추가' 버튼 클릭 시 addTask 함수 실행
    addButton.addEventListener('click', addTask);

    // 엔터 키 입력 시 addTask 함수 실행
    todoInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

});