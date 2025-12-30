const BASE_URL = "https://jointest-9b595-default-rtdb.europe-west1.firebasedatabase.app/"
let users = {};
let activeUserKey = "";
let tasks = {};
let activeUserName = "";
let localSubtasks = {};

const signInContainer = document.getElementById("sign_up_form");
const logInContainer = document.getElementById("login_form");
const indexHeader = document.getElementById("index_header"); 

function toggleUserMenu() {
    let userMenu = document.getElementById('user_menu');
    userMenu.classList.toggle('d_none');
}

function showNav(page = "summary") {
  const mainCont = document.getElementById('main_content');
  mainCont.innerHTML = `<div w3-include-html="${page}.html"></div>`;
  w3.includeHTML(() => {
    onPageLoaded(page);
  });
}

function onPageLoaded(page) {
  // Button exists z.B. nur auf board.html
  const btn = document.getElementById("openAddTaskModalBtn");
  if (btn) {
    btn.addEventListener("click", () => openAddTaskModal());
  }
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



async function onloadFunc() {
    users = await loadData("/users") || {};  
    loadTasks();
    // console.log(users);
    // let UserKeys = Object.keys(users);
}

function loadStart() {
    showNav('summary');
}

document.addEventListener("DOMContentLoaded", () => {
  initAddTaskModalOnce();

  const navAddTask = document.getElementById("navAddTask");
  if (navAddTask) {
    navAddTask.addEventListener("click", (e) => {
      e.preventDefault();
      openAddTaskModal();
    });
  }
});





