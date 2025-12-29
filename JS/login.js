document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggle();
});

function initPasswordToggle() {
    const passwordInput = document.getElementById("password");
    const iconButton = document.getElementById("password_svg");
        if (!passwordInput || !iconButton) return;
        const ICON = {
        LOCK: "lock",
        EYE_CLOSED: "eye_closed",
        EYE_OPEN: "eye_open",
    };

    iconButton.addEventListener("mousedown", (e) => {
    e.preventDefault();
    });


    let currentIcon = ICON.LOCK;

    // --- Deine SVG-Factory-Funktionen ---
    function getSvg(iconName) {
        switch (iconName) {
            case ICON.LOCK:
            return `
                <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 21C1.45 21 0.979167 20.8042 0.5875 20.4125C0.195833 20.0208 0 19.55 0 19V9C0 8.45  
                0.195833 7.97917 0.5875 7.5875C0.979167 7.19583 1.45 7 2 7H3V5C3 3.61667 3.4875 2.4375 4.4625 
                1.4625C5.4375 0.4875 6.61667 0 8 0C9.38333 0 10.5625 0.4875 11.5375 1.4625C12.5125 2.4375 13 
                3.61667 13 5V7H14C14.55 7 15.0208 7.19583 15.4125 7.5875C15.8042 7.97917 16 8.45 16 9V19C16 
                19.55 15.8042 20.0208 15.4125 20.4125C15.0208 20.8042 14.55 21 14 21H2ZM2 19H14V9H2V19ZM8 
                16C8.55 16 9.02083 15.8042 9.4125 15.4125C9.80417 15.0208 10 14.55 10 14C10 13.45 9.80417 
                12.9792 9.4125 12.5875C9.02083 12.1958 8.55 12 8 12C7.45 12 6.97917 12.1958 6.5875 
                12.5875C6.19583 12.9792 6 13.45 6 14C6 14.55 6.19583 15.0208 6.5875 15.4125C6.97917 
                15.8042 7.45 16 8 16ZM5 7H11V5C11 4.16667 10.7083 3.45833 10.125 2.875C9.54167 2.29167 
                8.83333 2 8 2C7.16667 2 6.45833 2.29167 5.875 2.875C5.29167 3.45833 5 4.16667 5 5V7Z" fill="#A8A8A8"/>
                </svg>
            `;

            case ICON.EYE_CLOSED:
            return `
                <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.925 10.075L13.475 8.625C13.625 7.84167 13.4 7.10833 12.8 6.425C12.2 5.74167 11.425 5.475 10.475 5.625L9.025 4.175C9.30833 4.04167 9.59583 3.94167 9.8875 3.875C10.1792 3.80833 10.4917 3.775 10.825 3.775C12.075 3.775 13.1375 4.2125 14.0125 5.0875C14.8875 5.9625 15.325 7.025 15.325 8.275C15.325 8.60833 15.2917 8.92083 15.225 9.2125C15.1583 9.50417 15.0583 9.79167 14.925 10.075ZM18.125 13.225L16.675 11.825C17.3083 11.3417 17.8708 10.8125 18.3625 10.2375C18.8542 9.6625 19.275 9.00833 19.625 8.275C18.7917 6.59167 17.5958 5.25417 16.0375 4.2625C14.4792 3.27083 12.7417 2.775 10.825 2.775C10.3417 2.775 9.86667 2.80833 9.4 2.875C8.93333 2.94167 8.475 3.04167 8.025 3.175L6.475 1.625C7.15833 1.34167 7.85833 1.12917 8.575 0.9875C9.29167 0.845833 10.0417 0.775 10.825 0.775C13.2083 0.775 15.35 1.40417 17.25 2.6625C19.15 3.92083 20.575 5.55833 21.525 7.575C21.575 7.65833 21.6083 7.7625 21.625 7.8875C21.6417 8.0125 21.65 8.14167 21.65 8.275C21.65 8.40833 21.6375 8.5375 21.6125 8.6625C21.5875 8.7875 21.5583 8.89167 21.525 8.975C21.1417 9.825 20.6625 10.6083 20.0875 11.325C19.5125 12.0417 18.8583 12.675 18.125 13.225ZM17.925 18.675L14.425 15.225C13.8417 15.4083 13.2542 15.5458 12.6625 15.6375C12.0708 15.7292 11.4583 15.775 10.825 15.775C8.44167 15.775 6.3 15.1458 4.4 13.8875C2.5 12.6292 1.075 10.9917 0.125 8.975C0.075 8.89167 0.0416667 8.7875 0.025 8.6625C0.00833333 8.5375 0 8.40833 0 8.275C0 8.14167 0.00833333 8.01667 0.025 7.9C0.0416667 7.78333 0.075 7.68333 0.125 7.6C0.475 6.85 0.891667 6.15833 1.375 5.525C1.85833 4.89167 2.39167 4.30833 2.975 3.775L0.9 1.675C0.716667 1.49167 0.625 1.2625 0.625 0.9875C0.625 0.7125 0.725 0.475 0.925 0.275C1.10833 0.0916667 1.34167 0 1.625 0C1.90833 0 2.14167 0.0916667 2.325 0.275L19.325 17.275C19.5083 17.4583 19.6042 17.6875 19.6125 17.9625C19.6208 18.2375 19.525 18.475 19.325 18.675C19.1417 18.8583 18.9083 18.95 18.625 18.95C18.3417 18.95 18.1083 18.8583 17.925 18.675ZM4.375 5.175C3.89167 5.60833 3.45 6.08333 3.05 6.6C2.65 7.11667 2.30833 7.675 2.025 8.275C2.85833 9.95833 4.05417 11.2958 5.6125 12.2875C7.17083 13.2792 8.90833 13.775 10.825 13.775C11.1583 13.775 11.4833 13.7542 11.8 13.7125C12.1167 13.6708 12.4417 13.625 12.775 13.575L11.875 12.625C11.6917 12.675 11.5167 12.7125 11.35 12.7375C11.1833 12.7625 11.0083 12.775 10.825 12.775C9.575 12.775 8.5125 12.3375 7.6375 11.4625C6.7625 10.5875 6.325 9.525 6.325 8.275C6.325 8.09167 6.3375 7.91667 6.3625 7.75C6.3875 7.58333 6.425 7.40833 6.475 7.225L4.375 5.175Z" fill="#A8A8A8"/>
                </svg>
            `;

            case ICON.EYE_OPEN:
            return `
                <svg width="22" height="15" viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.825 12C12.075 12 13.1375 11.5625 14.0125 10.6875C14.8875 9.8125 15.325 8.75 15.325 7.5C15.325 6.25 14.8875 5.1875 14.0125 4.3125C13.1375 3.4375 12.075 3 10.825 3C9.575 3 8.5125 3.4375 7.6375 4.3125C6.7625 5.1875 6.325 6.25 6.325 7.5C6.325 8.75 6.7625 9.8125 7.6375 10.6875C8.5125 11.5625 9.575 12 10.825 12ZM10.825 10.2C10.075 10.2 9.4375 9.9375 8.9125 9.4125C8.3875 8.8875 8.125 8.25 8.125 7.5C8.125 6.75 8.3875 6.1125 8.9125 5.5875C9.4375 5.0625 10.075 4.8 10.825 4.8C11.575 4.8 12.2125 5.0625 12.7375 5.5875C13.2625 6.1125 13.525 6.75 13.525 7.5C13.525 8.25 13.2625 8.8875 12.7375 9.4125C12.2125 9.9375 11.575 10.2 10.825 10.2ZM10.825 15C8.50833 15 6.39167 14.3875 4.475 13.1625C2.55833 11.9375 1.10833 10.2833 0.125 8.2C0.075 8.11667 0.0416667 8.0125 0.025 7.8875C0.00833333 7.7625 0 7.63333 0 7.5C0 7.36667 0.00833333 7.2375 0.025 7.1125C0.0416667 6.9875 0.075 6.88333 0.125 6.8C1.10833 4.71667 2.55833 3.0625 4.475 1.8375C6.39167 0.6125 8.50833 0 10.825 0C13.1417 0 15.2583 0.6125 17.175 1.8375C19.0917 3.0625 20.5417 4.71667 21.525 6.8C21.575 6.88333 21.6083 6.9875 21.625 7.1125C21.6417 7.2375 21.65 7.36667 21.65 7.5C21.65 7.63333 21.6417 7.7625 21.625 7.8875C21.6083 8.0125 21.575 8.11667 21.525 8.2C20.5417 10.2833 19.0917 11.9375 17.175 13.1625C15.2583 14.3875 13.1417 15 10.825 15ZM10.825 13C12.7083 13 14.4375 12.5042 16.0125 11.5125C17.5875 10.5208 18.7917 9.18333 19.625 7.5C18.7917 5.81667 17.5875 4.47917 16.0125 3.4875C14.4375 2.49583 12.7083 2 10.825 2C8.94167 2 7.2125 2.49583 5.6375 3.4875C4.0625 4.47917 2.85833 5.81667 2.025 7.5C2.85833 9.18333 4.0625 10.5208 5.6375 11.5125C7.2125 12.5042 8.94167 13 10.825 13Z" fill="#A8A8A8"/>
                </svg>
            `;

            default:
            return "";
        }
    }

    // --- Renderer ---
    function renderIcon(nextIcon) {
    currentIcon = nextIcon;
    iconButton.innerHTML = getSvg(nextIcon);
    const hasValue = passwordInput.value.length > 0;

    if (!hasValue) {
            iconButton.setAttribute("aria-label", "Passwortfeld ist leer");
        } else if (passwordInput.type === "password") {
            iconButton.setAttribute("aria-label", "Passwort anzeigen");
        } else {
            iconButton.setAttribute("aria-label", "Passwort verbergen");
        }
    }

    // --- Sync-State abhängig vom Input-Inhalt ---
    function syncStateFromValue() {
    const hasValue = passwordInput.value.length > 0;

    if (!hasValue) {
        passwordInput.type = "password";          // reset
        renderIcon(ICON.LOCK);
        iconButton.classList.remove("pointer");
        return;
    }
    else {
        iconButton.classList.add("pointer");
    }

    // wenn Wert vorhanden:
    // Icon hängt davon ab, ob sichtbar oder nicht
    renderIcon(passwordInput.type === "password" ? ICON.EYE_CLOSED : ICON.EYE_OPEN);
    }

    // --- Klick: nur togglen, wenn etwas eingegeben wurde ---
    const start = passwordInput.selectionStart;
    const end = passwordInput.selectionEnd;

    iconButton.addEventListener("click", () => {
        if (passwordInput.value.length === 0) return;

        // Cursorposition VOR dem type-Wechsel merken
        const pos = passwordInput.selectionStart ?? passwordInput.value.length;

        const nowHidden = passwordInput.type === "password";
        passwordInput.type = nowHidden ? "text" : "password";

        renderIcon(nowHidden ? ICON.EYE_OPEN : ICON.EYE_CLOSED);

        // Cursor wieder setzen (am Ende oder an alter Position)
        requestAnimationFrame(() => {
            passwordInput.focus();
            const len = passwordInput.value.length;
            const safePos = Math.min(pos, len); // falls sich was ändert
            passwordInput.setSelectionRange(safePos, safePos);
        });
    });


    // --- Events: tippen / löschen / autofill ---
    passwordInput.addEventListener("input", syncStateFromValue);
    passwordInput.addEventListener("change", syncStateFromValue);

    // Initial render
    renderIcon(ICON.LOCK);
};

function userLogin() {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const emailBox = emailInput.closest(".input_box");
    const passwordBox = passwordInput.closest(".input_box");
    const warningLogin = document.getElementById("warning_login_failed");
    // Reset Fehlerzustände
    emailBox.classList.remove("has_error");
    passwordBox.classList.remove("has_error");
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

  // optional: normale Validierung
  if (emailValue === "" || passwordValue === "") {
    if (emailValue === "") emailBox.classList.add("has_error");
    if (passwordValue === "") passwordBox.classList.add("has_error");
    return;
  }

    if (accessGranted(emailValue, passwordValue)) {
        window.location.replace("start.html");
        warningLogin.classList.remove("visible");
    }
    else {
        emailBox.classList.add("has_error");
        passwordBox.classList.add("has_error");
        warningLogin.classList.add("visible");
    }
};


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
};

/** resets the error when user is typing in something the input box */
function enableFormErrorReset(formElement) {
  const inputBoxes = formElement.querySelectorAll(".input_box");

  inputBoxes.forEach(box => {
    const input = box.querySelector("input, textarea, select");
    if (!input) return;

    input.addEventListener("input", () => {
      inputBoxes.forEach(b => b.classList.remove("has_error"));
    });
  });
}

const loginForm = document.querySelector(".login_form form");
enableFormErrorReset(loginForm);

/** Activates Sign In Form */
function activateSignIn() {
    signInContainer.classList.add("enable")
    logInContainer.classList.add("disable")
    indexHeader.classList.add("disable")
    // const signupForm = document.querySelector(".signup_form form");
    // enableFormErrorReset(signupForm);
}
/** Activates Log In Form */
function activateLogIn() {
    signInContainer.classList.remove("enable")
    logInContainer.classList.remove("disable")
    indexHeader.classList.remove("disable")
    const loginForm = document.querySelector(".login_form form");
    enableFormErrorReset(loginForm);
}

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