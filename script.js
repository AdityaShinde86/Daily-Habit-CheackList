document.addEventListener('DOMContentLoaded', function() {

    const habitsList = document.getElementById('habitsList');
    const newHabitInput = document.getElementById('newHabit');
    const addBtn = document.getElementById('addBtn');
    const resetBtn = document.getElementById('resetBtn');
    const clearBtn = document.getElementById('clearBtn');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const completedCount = document.getElementById('completedCount');
    const totalCount = document.getElementById('totalCount');
    const streakCount = document.getElementById('streakCount');
    const notification = document.getElementById('notification');
    const insightsBtn = document.getElementById('insightsBtn');

    let habits = JSON.parse(localStorage.getItem('habits')) || [];
    let streakData = JSON.parse(localStorage.getItem('streakData')) || {
        currentStreak: 0,
        lastUpdate: null
    };

    function init() {
        checkStreak();
        renderHabits();
        updateProgress();
    }

    function renderHabits() {
        habitsList.innerHTML = '';

        if (habits.length === 0) {
            habitsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No habits added yet</p>
                    <small>Add your first habit to get started</small>
                </div>
            `;
            return;
        }

        habits.forEach((habit, index) => {
            const habitItem = document.createElement('li');
            habitItem.className = 'habit-item';
            habitItem.style.animationDelay = `${index * 0.05}s`;

            habitItem.innerHTML = `
                <input type="checkbox" class="habit-checkbox" ${habit.completed ? 'checked' : ''} data-index="${index}">
                <span class="habit-text ${habit.completed ? 'completed' : ''}">${habit.text}</span>
                <button class="delete-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            habitsList.appendChild(habitItem);
        });
    }

    function addHabit() {
        const text = newHabitInput.value.trim();
        if (text) {
            if (habits.some(habit => habit.text.toLowerCase() === text.toLowerCase())) {
                showNotification('Habit already exists!');
                return;
            }

            habits.push({
                text,
                completed: false,
                createdAt: new Date().toISOString()
            });

            saveHabits();
            newHabitInput.value = '';
            renderHabits();
            updateProgress();
            showNotification('Habit added successfully!');
        } else {
            showNotification('Please enter a habit name');
        }
    }

    function toggleHabit(index) {
        habits[index].completed = !habits[index].completed;
        habits[index].lastUpdated = new Date().toISOString();

        if (habits[index].completed) {
            checkStreak();
        }

        saveHabits();
        renderHabits();
        updateProgress();
    }

    function deleteHabit(index) {
        habits.splice(index, 1);
        saveHabits();
        renderHabits();
        updateProgress();
        showNotification('Habit deleted');
    }

    function resetHabits() {
        habits.forEach(habit => {
            habit.completed = false;
        });
        saveHabits();
        renderHabits();
        updateProgress();
        showNotification('All habits reset');
    }

    function clearCompleted() {
        if (!habits.some(habit => habit.completed)) {
            showNotification('No completed habits to clear');
            return;
        }

        habits = habits.filter(habit => !habit.completed);
        saveHabits();
        renderHabits();
        updateProgress();
        showNotification('Completed habits cleared');
    }

    function updateProgress() {
        const totalHabits = habits.length;
        totalCount.textContent = totalHabits;

        if (totalHabits === 0) {
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
            completedCount.textContent = '0';
            return;
        }

        const completedHabits = habits.filter(habit => habit.completed).length;
        completedCount.textContent = completedHabits;

        const progressPercentage = Math.round((completedHabits / totalHabits) * 100);
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `${progressPercentage}%`;

        if (progressPercentage < 30) {
            progressBar.style.background = 'linear-gradient(90deg, var(--danger), #ff6b6b)';
        } else if (progressPercentage < 70) {
            progressBar.style.background = 'linear-gradient(90deg, var(--warning), #f9ca24)';
        } else {
            progressBar.style.background = 'linear-gradient(90deg, var(--success), #20bf6b)';
        }
    }

    function checkStreak() {
        const today = new Date().toDateString();
        const lastUpdate = streakData.lastUpdate ? new Date(streakData.lastUpdate).toDateString() : null;

        if (lastUpdate === today) {
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        if (!lastUpdate || new Date(streakData.lastUpdate).toDateString() === yesterday.toDateString()) {

            streakData.currentStreak += 1;
        } else if (new Date(streakData.lastUpdate).toDateString() !== today) {

            streakData.currentStreak = 1;
        }

        streakData.lastUpdate = new Date().toISOString();
        localStorage.setItem('streakData', JSON.stringify(streakData));
        streakCount.textContent = streakData.currentStreak;
    }

    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }


    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }

    addBtn.addEventListener('click', addHabit);
    newHabitInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addHabit();
        }
    });

    resetBtn.addEventListener('click', resetHabits);
    clearBtn.addEventListener('click', clearCompleted);
    insightsBtn.addEventListener('click', function() {
        showNotification('Insights feature coming soon!');
    });

    habitsList.addEventListener('click', function(e) {
        if (e.target.classList.contains('habit-checkbox')) {
            const index = e.target.getAttribute('data-index');
            toggleHabit(index);
        }

        if (e.target.classList.contains('delete-btn') || e.target.parentElement.classList.contains('delete-btn')) {
            const index = e.target.classList.contains('delete-btn') ?
                e.target.getAttribute('data-index') :
                e.target.parentElement.getAttribute('data-index');
            deleteHabit(index);
        }
    });

    init();
});