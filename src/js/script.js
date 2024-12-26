// Firebase configuration (use your actual credentials)
const firebaseConfig = {
    apiKey: "AIzaSyBQRy-4dn-N6ik9YMUF-cqUMnRPIVWuC7k",
    authDomain: "electron-app-73463.firebaseapp.com",
    projectId: "electron-app-73463",
    storageBucket: "electron-app-73463.firebasestorage.app",
    messagingSenderId: "239237088922",
    appId: "1:239237088922:web:525a884e6007781bdd4123"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Sign In Button
document.getElementById('signin-btn').addEventListener('click', function () {
    document.getElementById('welcome-container').style.display = 'none';
    document.getElementById('signin-container').style.display = 'block';
});

// Back to Welcome Page from Sign In
document.getElementById('back-btn').addEventListener('click', function () {
    document.getElementById('signin-container').style.display = 'none';
    document.getElementById('welcome-container').style.display = 'block';
});

// Sign Up Button
document.getElementById('signup-btn').addEventListener('click', function () {
    document.getElementById('signin-container').style.display = 'none';
    document.getElementById('welcome-container').style.display = 'none';
    document.getElementById('signup-container').style.display = 'block';
});

// Back to Welcome Page from Sign Up
document.getElementById('back-btn-signup').addEventListener('click', function () {
    document.getElementById('signup-container').style.display = 'none';
    document.getElementById('welcome-container').style.display = 'none';
    document.getElementById('signin-container').style.display = 'block';
});

// Back to Sign In from Forgot Password
document.getElementById('forgot-password-back-btn').addEventListener('click', function () {
    document.getElementById('forgot-password-container').style.display = 'none';
    document.getElementById('signin-container').style.display = 'block';
});

// Handle the "Forgot Password" Button in Sign In
document.getElementById('forgot-password-btn').addEventListener('click', function () {
    document.getElementById('signin-container').style.display = 'none';
    document.getElementById('forgot-password-container').style.display = 'block';
});

// Handle the "Forgot Password" Form Submission
document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-password-email').value;

    try {
        await firebase.auth().sendPasswordResetEmail(email);
        showMessage('A reset link has been sent to your email. Please check your inbox.', 'success');
        document.getElementById('forgot-password-container').style.display = 'none';
        document.getElementById('signin-container').style.display = 'block';
    } catch (error) {
        showMessage('Failed to send reset link. Please try again.');
    }
});

// Show message on the screen
function showMessage(message, type = 'error') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerText = message;

    // Apply styles to make the message appear at the top
    messageElement.style.position = 'fixed';
    messageElement.style.top = '10px';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translateX(-50%)';
    messageElement.style.zIndex = '9999';  // Ensure it's above other content
    messageElement.style.padding = '10px 20px';
    messageElement.style.backgroundColor = type === 'success' ? 'green' : 'red';
    messageElement.style.color = 'white';
    messageElement.style.borderRadius = '5px';
    messageElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    messageElement.style.fontSize = '16px';

    document.body.appendChild(messageElement);

    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}


// Sign Up Form Submission
document.getElementById('signup-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('signup-email').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Password validation (at least 6 characters)
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters.');
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match.');
        return;
    }

    // Check if username already exists
    db.collection('users').where('username', '==', username).get()
        .then(snapshot => {
            if (snapshot.empty) {
                // Username is available, now register user
                auth.createUserWithEmailAndPassword(email, password)
                    .then(cred => {
                        // Add username to Firestore
                        db.collection('users').doc(cred.user.uid).set({
                            email: email,
                            username: username
                        }).then(() => {
                            // Create a folder for user notes in Firestore
                            db.collection('notes').doc(cred.user.uid).set({}).catch(error => {
                                showMessage('Error creating user folder in Firestore.');
                            });

                            showMessage('Account created successfully!', 'success');
                            // Redirect to sign in page after 1.5 seconds
                            setTimeout(() => {
                                document.getElementById('signup-container').style.display = 'none';
                                document.getElementById('signin-container').style.display = 'block';
                            }, 1500);
                            document.getElementById('signup-form').reset();
                        }).catch(error => {
                            showMessage('Error saving user data.');
                        });
                    })
                    .catch(error => {
                        showMessage(error.message);
                    });
            } else {
                // Username is already taken
                showMessage('Username is already taken.');
            }
        })
        .catch(error => {
            showMessage('Error checking username availability.');
        });
});

// Sign In Form Submission
document.getElementById('signin-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('signin-username').value;
    const password = document.getElementById('signin-password').value;

    // Sign in the user
    db.collection('users').where('username', '==', username).get()
        .then(snapshot => {
            if (!snapshot.empty) {
                const userDoc = snapshot.docs[0];
                const userEmail = userDoc.data().email;

                auth.signInWithEmailAndPassword(userEmail, password)
                    .then(() => {
                        showMessage('Sign in successful!', 'success');
                        // Pass the document ID in the query string when redirecting
                        setTimeout(() => {
                            window.location.href = `note-taking.html?docId=${userDoc.id}`;
                        }, 1500);
                    })
                    .catch(error => {
                        showMessage('Incorrect password.');
                    });
            } else {
                showMessage('Username not found.');
            }
        })
        .catch(error => {
            showMessage('Error signing in.');
        });
});
