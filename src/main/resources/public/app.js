// JavaScript to handle the Hero Academy Gym app

// Check if user is already logged in on page load
/*window.onload = async function () {
    try {
        const response = await fetch('/check-session', { method: 'GET' });
        if (response.ok) {
            const username = await response.text();
            document.getElementById('username-display').innerText = username;
            showDashboard();
            fetchWorkoutHistory();
            fetchUserStats(); // Load user stats and XP progress on dashboard load
            initializeCharacterPreview(); // Initialize Three.js character preview
        } else {
            showRegistration();
        }
    } catch (error) {
        console.error("Error checking session:", error);
        showRegistration();
    }
};*/

// Testing for live view of dashboard changes!
window.onload = function () {
    document.getElementById('username-display').innerText = 'TestUser';
    showDashboard();
    initializeCharacterPreview();
    updateXPProgress(1, 50, 100);
};

// Show the dashboard and hide other sections
function showDashboard() {
    document.getElementById('registration-container').style.display = 'none';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

// Show the login screen and hide other sections
function showLogin() {
    document.getElementById('registration-container').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('forgot-password-container').style.display = 'none';
}

// Show the registration screen and hide other sections
function showRegistration() {
    document.getElementById('registration-container').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
}

// Initialize Three.js character preview for the avatar section
function initializeCharacterPreview() {
    const spinner = document.getElementById('avatar-spinner');
    spinner.style.display = 'block'; // Show spinner before avatar loads

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(300, 300);

    // Clear existing content in the model-preview and add the renderer
    const modelPreview = document.getElementById('model-preview');
    modelPreview.innerHTML = ''; // Clear any previous renderers
    modelPreview.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);

    // Load the FBX model
    const loader = new THREE.FBXLoader();
    loader.load(
        '/proxy-fbx',
        function (object) {
            spinner.style.display = 'none'; // Hide spinner after avatar loads

            object.scale.set(0.021, 0.021, 0.021); // Adjust scale
            object.position.set(0, -1, 0); // Set initial position of the object
            scene.add(object);

            // Set up animation mixer for the model
            const mixer = new THREE.AnimationMixer(object);
            if (object.animations.length > 0) {
                const action = mixer.clipAction(object.animations[0]);
                action.play();
            }

            // Animation loop
            const clock = new THREE.Clock();
            function animate() {
                requestAnimationFrame(animate);
                mixer.update(clock.getDelta());
                renderer.render(scene, camera);
            }
            animate();
        },
        undefined,
        function (error) {
            spinner.style.display = 'none'; // Hide spinner on error
            console.error('Failed to load avatar:', error);
            modelPreview.innerHTML = "<p>Avatar failed to load.</p>";
        }
    );

    // Camera positioning
    camera.position.set(0, 1.5, 4);
    camera.lookAt(0, 1, 0);
}

// Enhanced sign-up function with code validation
async function signUp() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const email = document.getElementById('register-email').value;
    const signUpCode = document.getElementById('signup-code').value;

    if (!username || !password || !email || !signUpCode) {
        document.getElementById('registration-message').innerText =
            'Please fill in all fields and enter the sign-up code.';
        return;
    }

    if (password !== confirmPassword) {
        document.getElementById('password-error').innerText =
            'Passwords do not match.';
        return;
    } else {
        document.getElementById('password-error').innerText = '';
    }

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email, signUpCode }),
        });

        if (response.ok) {
            document.getElementById('registration-message').innerText =
                'Account created successfully!';
            showLogin();
        } else {
            const message = await response.text();
            document.getElementById('registration-message').innerText = message;
        }
    } catch (error) {
        console.error('Error during sign-up:', error);
        document.getElementById('registration-message').innerText =
            'An error occurred. Please try again.';
    }
}

// Testing for working on the dashboard with live view!
function login() {
    document.getElementById('username-display').innerText = 'TestUser';
    showDashboard();
    initializeCharacterPreview();
    updateXPProgress(1, 50, 100);
}

// Log workout function with error handling and feedback
async function logWorkout() {
    const weight = document.getElementById('weight').value;
    const reps = document.getElementById('reps').value;
    const dailyGoal = document.getElementById('dailyGoal').checked;
    const streakBonus = document.getElementById('streakBonus').checked;

    if (!weight || !reps) {
        document.getElementById('workout-message').innerText =
            'Please fill in the weight and reps.';
        return;
    }

    try {
        const response = await fetch('/logWorkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weight, reps, dailyGoal, streakBonus }),
        });

        if (response.ok) {
            document.getElementById('workout-message').innerText =
                'Workout logged successfully!';
            fetchWorkoutHistory();
        } else {
            const message = await response.text();
            document.getElementById('workout-message').innerText = message;
        }
    } catch (error) {
        console.error('Error logging workout:', error);
        document.getElementById('workout-message').innerText =
            'An error occurred. Please try again.';
    }
}

// Fetch workout history
async function fetchWorkoutHistory() {
    try {
        const response = await fetch('/getWorkoutHistory', { method: 'GET' });
        if (response.ok) {
            const workoutHistory = await response.json();
            const historyElement = document.getElementById('workout-history');
            historyElement.innerHTML = workoutHistory
                .map((workout) => {
                    return `<p>${new Date(
                        workout.timestamp
                    ).toLocaleString()} - Weight: ${
                        workout.weight
                    } lbs, Reps: ${workout.reps}</p>`;
                })
                .join('');
        } else {
            console.error('Failed to fetch workout history');
        }
    } catch (error) {
        console.error('Error fetching workout history:', error);
    }
}

// Fetch user stats including level and XP to dynamically update the dashboard
async function fetchUserStats() {
    try {
        const response = await fetch('/user-stats', { method: 'GET' });
        if (response.ok) {
            const { level, xp, xpToNextLevel } = await response.json();
            updateXPProgress(level, xp, xpToNextLevel);
        } else {
            console.error('Failed to fetch user stats');
        }
    } catch (error) {
        console.error('Error fetching user stats:', error);
    }
}

// Update XP Progress UI dynamically
function updateXPProgress(level, xp, xpToNextLevel) {
    document.getElementById('avatar-level').innerText = level;

    const progressPercentage = (xp / xpToNextLevel) * 100;
    document.getElementById('xp-progress-bar').style.width = `${progressPercentage}%`;
    document.getElementById('xp-progress-text').innerText = `${progressPercentage.toFixed(
        0
    )}% to next level`;

    if (xp >= xpToNextLevel) {
        const levelUpEffect = document.createElement('div');
        levelUpEffect.innerHTML =
            '<div class ="level-up-animation">Level Up!</div>';
        document.body.appendChild(levelUpEffect);

        setTimeout(() => levelUpEffect.remove(), 2000);
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/logout', { method: 'POST' });
        if (response.ok) {
            showRegistration();
        } else {
            console.error('Failed to log out');
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
}
