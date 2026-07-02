// Habit Tracker JavaScript
const habitInput = document.getElementById('habit-input');
const categorySelect = document.getElementById('category-select');
const addBtn = document.getElementById('add-habit-btn');
const habitsList = document.getElementById('habits-list');
const totalHabitsEl = document.getElementById('total-habits');
const longestStreakEl = document.getElementById('longest-streak');

let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Save to localStorage
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
    updateStats();
}

// Add new habit (category is now optional and safe)
function addHabit() {
    const name = habitInput.value.trim();
    if (!name) return;

    // Safe category handling
    let category = 'General';
    if (categorySelect && categorySelect.value) {
        category = categorySelect.value;
    }

    habits.push({
        id: Date.now(),
        name: name,
        category: category,
        completedDates: [],
        currentStreak: 0,
        longestStreak: 0
    });

    habitInput.value = '';
    renderHabits();
    saveHabits();
}

// Delete habit
function deleteHabit(id) {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    habits = habits.filter(h => h.id !== id);
    renderHabits();
    saveHabits();
}

// Edit habit name
function editHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const newName = prompt('Edit habit name:', habit.name);
    if (newName && newName.trim() !== '') {
        habit.name = newName.trim();
        renderHabits();
        saveHabits();
    }
}

// View completion history
function viewHistory(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit || habit.completedDates.length === 0) {
        alert('No completion history yet for this habit.');
        return;
    }

    const sortedDates = [...habit.completedDates].sort().reverse();
    alert(`Completion History for "${habit.name}":

${sortedDates.join('\n')}`);
}

// Toggle completion for today
function toggleHabit(id) {
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const index = habit.completedDates.indexOf(today);

    if (index === -1) {
        habit.completedDates.push(today);
        habit.completedDates.sort();
    } else {
        habit.completedDates.splice(index, 1);
    }

    calculateStreaks(habit);
    renderHabits();
    saveHabits();
}

// Calculate streaks
function calculateStreaks(habit) {
    if (habit.completedDates.length === 0) {
        habit.currentStreak = 0;
        return;
    }

    let streak = 1;
    let maxStreak = 1;
    const dates = [...habit.completedDates].sort();

    for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = (curr - prev) / (1000 * 3600 * 24);

        if (diff === 1) {
            streak++;
            maxStreak = Math.max(maxStreak, streak);
        } else {
            streak = 1;
        }
    }

    habit.currentStreak = streak;
    habit.longestStreak = Math.max(habit.longestStreak || 0, maxStreak);
}

// Render all habits
function renderHabits() {
    habitsList.innerHTML = '';

    if (habits.length === 0) {
        habitsList.innerHTML = `<p style="color:#64748b; text-align:center; padding:2rem;">No habits yet. Add one above!</p>`;
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    habits.forEach(habit => {
        const isCompletedToday = habit.completedDates.includes(today);

        const div = document.createElement('div');
        div.className = 'habit-item';
        
        div.innerHTML = `
            <div class="habit-info">
                <input type="checkbox" class="habit-checkbox" ${isCompletedToday ? 'checked' : ''}>
                <div>
                    <span class="habit-name">${habit.name}</span>
                    <span class="habit-category">${habit.category}</span>
                </div>
            </div>
            
            <div class="habit-actions">
                <span class="streak">🔥 ${habit.currentStreak} day</span>
                
                <button class="action-btn" title="View History">📅</button>
                <button class="action-btn" title="Edit">✏️</button>
                <button class="delete-btn" title="Delete">🗑️</button>
            </div>
        `;

        // Checkbox
        const checkbox = div.querySelector('.habit-checkbox');
        checkbox.addEventListener('change', () => toggleHabit(habit.id));

        // History button
        const historyBtn = div.querySelector('.action-btn[title="View History"]');
        if (historyBtn) historyBtn.addEventListener('click', () => viewHistory(habit.id));

        // Edit button
        const editBtn = div.querySelector('.action-btn[title="Edit"]');
        if (editBtn) editBtn.addEventListener('click', () => editHabit(habit.id));

        // Delete button
        const deleteBtn = div.querySelector('.delete-btn');
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteHabit(habit.id));

        habitsList.appendChild(div);
    });
}

// Update stats
function updateStats() {
    totalHabitsEl.textContent = habits.length;

    let maxStreak = 0;
    habits.forEach(h => {
        if (h.currentStreak > maxStreak) maxStreak = h.currentStreak;
    });
    longestStreakEl.textContent = maxStreak;
}

// Event listeners
addBtn.addEventListener('click', addHabit);
habitInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addHabit();
});

// Initial render
renderHabits();
updateStats();
