const BASE_URL = "https://jointest-9b595-default-rtdb.europe-west1.firebasedatabase.app/"
let users = {};
let activeUserKey = "";
let tasks = {};

const signInContainer = document.getElementById("sign_up_form");
const logInContainer = document.getElementById("login_form");
const indexHeader = document.getElementById("index_header"); 
// const passwordInput = document.getElementById("password");
// const passwordSVG = document.getElementById("password_svg");

// toggleButton.addEventListener("click", () => {
//     const isPassword = passwordInput.type === "password";
//     passwordInput.type = isPassword ? "text" : "password";
//     toggleButton .setAttribute(
//         "aria-label",
//         isPassword ? "Passwort verbergen" : "Passwort anzeigen"
//     );
// });

window.addEventListener("load", () => {
    const indexBody = document.getElementById("index_body");
    const logoContainer = document.getElementById("logo_container");
    const pageContent = document.querySelector(".page_content");

setTimeout(() => {
    indexBody.classList.add("is_loaded");
    logoContainer.classList.add("is_in_corner");
    
    pageContent.classList.add("is_visible");
}, 1000);
});

function activateSignIn() {
    signInContainer.classList.add("enable")
    logInContainer.classList.add("disable")
    indexHeader.classList.add("disable")
}

function activateLogIn() {
    signInContainer.classList.remove("enable")
    logInContainer.classList.remove("disable")
    indexHeader.classList.remove("disable")
}



async function renderUsers() {
    users = await loadData("/users") || {};
    document.getElementById('user_cards').innerHTML = "";
    let UserKeys = Object.keys(users);
    for (let index = 0; index < UserKeys.length; index++) {
        const element = UserKeys[index];
        email = users[element].email;
        lastName = users[element].lastname;
        firstName = users[element].firstname;
        document.getElementById('user_cards').innerHTML += getUserCardTempl(index, email, lastName, firstName)
    }
}

function getUserCardTempl(index, email, lastName, firstName) {
    return `
        <div class="user_div">
            <h3 id="user_${index}_name">${firstName} ${lastName}</h3>
            <p id="user_${index}_email">${email}</p>
        </div>
    `
}

function userExists(email) {
    let UserKeys = Object.keys(users);
    for (let index = 0; index < UserKeys.length; index++) {
        const element = UserKeys[index];
        const tmpEmail = users[element].email
        if (email === tmpEmail) {
            return true
        };
    }
}

async function userLogin() {
    let email = document.getElementById('email');
    let password = document.getElementById('password');
    if (accessGranted(email.value, password.value)) {
        window.location.replace("index.html");
    }
}

async function loadTasks() {
    tasks = await loadData('/tasks');
    console.log(tasks);
}


async function addTask() {
    let taskName = document.getElementById('task_name');
    let taskDescr = document.getElementById('task_descr');
    let taskCat = document.getElementById('task_cat');
    let taskDur = document.getElementById('task_duration');
    let taskUrgent = document.getElementById('task_urgent');
    let taskFinishDate = document.getElementById('task_finish_date');

    let newTaskObj = {
        'name' : taskName.value,
        'description' : taskDescr.value,
        'category' : taskCat.value,
        'duration' : taskDur.value,
        'urgent' : taskUrgent.checked,
        'finishDate' : taskFinishDate.value,
        'assignedTo' : {'userId' : ""}
    };
    let result = await uploadData('/tasks', newTaskObj)
     console.log("Firebase Key:", result?.name);
     loadTasks();
}

/**
 * Function to check if user and password matches, sets the user id and returns true when a match was found
 * @param {string} email -Email address for login
 * @param {string} password -user password
 * @returns {boolean} -True when access is granted, false if not
 */
function accessGranted(email, password) {
    let UserKeys = Object.keys(users);
    for (let index = 0; index < UserKeys.length; index++) {
        const element = UserKeys[index];
        const tmpEmail = users[element].email;
        const tmpPassword = users[element].password;
        if (email === tmpEmail && password === tmpPassword) {
            activeUserKey = element;
            return true;
        };
    }
    return false;
}

async function onloadFunc() {
    users = await loadData("/users") || {};  
    console.log(users);
    let UserKeys = Object.keys(users);
}

/** 
 * This Function is used to add a User to the path users in the Database
 *  
*/
async function addUser() {
    let email = document.getElementById('email_sign_up');
    if (!userExists(email.value)) {
        let password = document.getElementById('password');
        let givenName = document.getElementById('given_name');
        let dataObj = {
            "email": email.value, 
            "givenName": givenName.value, 
            "password": password.value, 
        };
        let result = await uploadData("/users", dataObj);
        window.location.href = 'login.html?msg=Du hast dich erfolgreich registriert';
        console.log("Firebase Key:", result?.name);
    }
}

/** 
 * This Function is used to upload Data to the path of the BASE_URL
 * 
 * @param {string} path - This is the Pathname of the Realtime Database Object
 * @param {object} dataObj - This is the Data Object to Post to the Database
*/
async function uploadData(path="", dataObj) {
        try {
        let response = await fetch(BASE_URL + path + ".json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
        },
        body: JSON.stringify(dataObj)
        });
        if (!response.ok) {
            throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${BASE_URL + path}`);
        }
        return await response.json(); 
    } catch (error) {
        console.error("Fehler beim Senden der Daten:", error);
        return null; 
    }
};

/** 
 * This Function is used to load Data from the path of the BASE_URL
 * 
 * @param {string} path - This is the Pathname of the Realtime Database Object
*/
async function loadData(path="") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        if (!response.ok) {
            throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${BASE_URL + path}`);
        }
        return await response.json(); 
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
        return null; 
    }
};


