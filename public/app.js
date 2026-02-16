// Function to load and display birthdays
function loadBirthdays() {
    fetch('/api/birthdays')
        .then(res => res.json())
        .then(birthdays => {
            const container = document.getElementById('birthdays');
            
            if (birthdays.length === 0) {
                container.innerHTML = '<p>No birthdays yet!</p>';
                return;
            }

            // Sort birthdays by next occurrence
            const today = new Date();
            const sortedBirthdays = birthdays.map(bday => {
                // Calculate next occurrence
                const thisYear = today.getFullYear();
                let nextDate = new Date(thisYear, bday.month - 1, bday.day);
                
                // If birthday already passed this year, use next year
                if (nextDate < today) {
                    nextDate = new Date(thisYear + 1, bday.month - 1, bday.day);
                }
                
                const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
                
                return { ...bday, daysUntil, nextDate };
            }).sort((a, b) => a.daysUntil - b.daysUntil);

            container.innerHTML = sortedBirthdays.map(bday => `
                <div id="bday-${bday.id}">
                    <div class="birthday-display">
                        <h3>${bday.name}</h3>
                        <p>Date: ${bday.month}/${bday.day} ${bday.daysUntil === 0 ? '🎉 TODAY!' : `(in ${bday.daysUntil} day${bday.daysUntil === 1 ? '' : 's'})`}</p>
                        ${bday.relationship ? `<p>Relationship: ${bday.relationship}</p>` : ''}
                        <button class="edit-btn" data-id="${bday.id}">Edit</button>
                        <button class="delete-btn" data-id="${bday.id}">Delete</button>
                    </div>
                    <div class="birthday-edit" style="display: none;">
                        <input type="text" class="edit-name" value="${bday.name}" required>
                        <input type="text" class="edit-relationship" value="${bday.relationship || ''}" placeholder="Relationship">
                        <input type="number" class="edit-month" value="${bday.month}" min="1" max="12" required>
                        <input type="number" class="edit-day" value="${bday.day}" min="1" max="31" required>
                        <button class="save-btn" data-id="${bday.id}">Save</button>
                        <button class="cancel-btn" data-id="${bday.id}">Cancel</button>
                    </div>
                </div>
            `).join('');
        });
}

// Load birthdays on page load
loadBirthdays();

// Handle form submission
document.getElementById('birthdayForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        month: document.getElementById('month').value,
        day: document.getElementById('day').value,
        relationship: document.getElementById('relationship').value
    };

    const response = await fetch('/api/birthdays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });

    if (response.ok) {
        // Clear the form
        document.getElementById('birthdayForm').reset();
        // Reload birthdays
        loadBirthdays();
    }
});

// Handle delete button clicks
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const birthdayId = e.target.dataset.id;
        
        if (confirm('Are you sure you want to delete this birthday?')) {
            const response = await fetch(`/api/birthdays/${birthdayId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadBirthdays();
            }
        }
    }
});

// Handle edit button clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
        const birthdayId = e.target.dataset.id;
        const container = document.getElementById(`bday-${birthdayId}`);
        container.querySelector('.birthday-display').style.display = 'none';
        container.querySelector('.birthday-edit').style.display = 'block';
    }
});

// Handle cancel button clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cancel-btn')) {
        const birthdayId = e.target.dataset.id;
        const container = document.getElementById(`bday-${birthdayId}`);
        container.querySelector('.birthday-display').style.display = 'block';
        container.querySelector('.birthday-edit').style.display = 'none';
    }
});

// Handle save button clicks
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('save-btn')) {
        const birthdayId = e.target.dataset.id;
        const container = document.getElementById(`bday-${birthdayId}`);
        
        const formData = {
            name: container.querySelector('.edit-name').value,
            month: container.querySelector('.edit-month').value,
            day: container.querySelector('.edit-day').value,
            relationship: container.querySelector('.edit-relationship').value
        };

        const response = await fetch(`/api/birthdays/${birthdayId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            loadBirthdays();
        }
    }
});