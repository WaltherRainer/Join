function groupUsersByFirstLetter(usersObj) {
  const groups = {};

  for (const [id, u] of Object.entries(usersObj || {})) {
    const name = (u?.givenName || "").trim();
    const letter = name ? name[0].toUpperCase() : "#";
    (groups[letter] ||= []).push({ id, ...u });
  }

  for (const letter of Object.keys(groups)) {
    groups[letter].sort((a, b) => (a.givenName || "").localeCompare(b.givenName || ""));
  }

  return groups;
}

function renderContacts(users) {
  const container = document.querySelector(".contact_list_sect");
  if (!container) return;

  container.querySelectorAll(".contact_list_item").forEach(e => e.remove());
  const groups = groupUsersByFirstLetter(users);
  const sortedLetters = Object.keys(groups).sort();

  for (const letter of sortedLetters) {
    const wrapper = document.createElement("div");
    wrapper.className = "contact_list_item";
    const letterDiv = document.createElement("div");
    letterDiv.className = "first_letter";
    letterDiv.textContent = letter;
    wrapper.appendChild(letterDiv);
    groups[letter].forEach(user => {
    const card = document.createElement("div");
    card.className = "contact_list_card";
    card.dataset.userId = user.id;
    card.innerHTML = getContactListTempl(user.id, user.givenName, user.email);
    wrapper.appendChild(card);
  });
  container.appendChild(wrapper);
}
}

function renderContactDetails(users, userId) {
  const u = users?.[userId];
  if (!u) return;
  
  const initials = initialsFromGivenName(u.givenName);
  const bgColor = colorIndexFromUserId(userId);
  
  const target = document.getElementById("contact_details_sect");
  if (!target) return;
  target.dataset.userId = userId;
  target.innerHTML = getContactDetailsTempl(
    bgColor,
    initials,
    u.givenName,
    u.email,
    u.userPhone || "-",
    userId
  );
  renderIcons(target);
  
  initEditButton(userId, u.givenName, u.email, u.userPhone);
  initDeleteButton(userId);
}

function initEditButton(userId, givenName, email, userPhone) {
  const editBtn = document.getElementById("edit_user");
  if (!editBtn) return;
  
  editBtn.addEventListener("click", () => {
    openEditContactModal(userId, givenName, email, userPhone);
    console.log(window.users);
  });
}

function initDeleteButton(userId) {
  const deleteBtn = document.getElementById("btn_delete_user");
  if (!deleteBtn) return;
  
  deleteBtn.addEventListener("click", () => {
    deleteContact(userId);
  });
}

function initContactsClick(users) {
  const list = document.querySelector(".contact_list_sect");
  if (!list) return;

  list.addEventListener("click", (e) => {
    const card = e.target.closest(".contact_list_card");
    if (!card) return;

    const userId = card.dataset.userId;
    if (!userId) return;
    setActiveContactCard(card);
    renderContactDetails(users, userId);
  });
}

function setActiveContactCard(cardEl) {
  document.querySelectorAll(".contact_list_card.is-active")
    .forEach(el => el.classList.remove("is-active"));
  cardEl.classList.add("is-active");
}

async function deleteContact(userId) {
  if (!userId) return;
  try {
    await deleteData(`/users/${userId}`);
    users = await loadData("/users") || {};
    renderContacts(users);
    document.querySelectorAll(".contact_list_card.is-active")
      .forEach(el => el.classList.remove("is-active"));
    const details = document.getElementById("contact_details_sect");
    if (details) {
      details.innerHTML = "";
    }
  } catch (err) {
    console.error("Delete failed:", err);
  }
}


function openContactModal() {
  const modal = document.getElementById("add_contact_modal");
  const host = document.getElementById("contact_modal_host");
  if (!modal || !host) return;

  modal.showModal();

  listenEscapeFromModal("add_contact_modal");
  bindContactFormSubmitOnce();
  
  document.getElementById("modal_close").addEventListener("click", () => {
    closeContactModal(modal);
  });

  document.getElementById("clear_contact_form").addEventListener("click", () => {
    resetContactForm();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeContactModal(modal);
  });

}

function openEditContactModal(userId, givenName, email, userPhone) {
  const modal = document.getElementById("edit_contact_modal");
  const host = document.getElementById("edit_contact_modal_host");
  if (!modal || !host) return;

  modal.showModal();
  preloadEditFormData(givenName, email, userPhone);
  renderEditContactAvatar(userId, givenName);
  listenEscapeFromModal("edit_contact_modal");
  bindEditContactFormSubmitOnce(userId);
  
  document.getElementById("edit_modal_close").addEventListener("click", () => {
    closeEditContactModal(modal);
  });

  document.getElementById("delete_contact_btn").addEventListener("click", () => {
    deleteContact(userId);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeEditContactModal(modal);
  });
}

function preloadEditFormData(givenName, email, userPhone) {
  setValueById("edit_user_name", givenName);
  setValueById("edit_user_email", email);
  setValueById("edit_user_phone", userPhone);
}

function closeContactModal(modal) {
  modal.removeEventListener('submit', addNewUser);
  modal.close();
}

function contactEventList() {
  document.getElementById("open_add_user_modal").addEventListener("click", () => {
    openContactModal();
  });
}

function closeEditContactModal(modal) {
  modal.removeEventListener('submit', editUser);
  modal.close();
}

function bindContactFormSubmitOnce() {
  const form = document.getElementById("contact_form");
  if (!form) return;
  if (form.dataset.submitBound === "1") return;
  form.dataset.submitBound = "1";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        await addNewUser();
    } 
    catch (err) {
      console.error("addUser failed", err);
    }
  });
}

function bindEditContactFormSubmitOnce(userId) {
  const form = document.getElementById("edit_contact_form");
  if (!form) return;
  if (form.dataset.submitBound === "1") return;
  form.dataset.submitBound = "1";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        await editUser(userId);
    } 
    catch (err) {
      console.error("EditUser failed", err);
    }
  });
}

function resetContactForm() {
  setValueById("user_name", "");
  setValueById("user_email", "");
  setValueById("user_phone", "");
}

async function addNewUser() {
  const modal = document.getElementById("add_contact_modal");
  const userNameInp = document.getElementById("user_name");
  const emailInp = document.getElementById("user_email");
  const userPhoneInp = document.getElementById("user_phone");
  const email = emailInp?.value?.trim() || "";
  const givenName = userNameInp?.value?.trim() || "";
  const userPhone = userPhoneInp?.value?.trim() || "";
  const password = "12345"
  let dataArray = {};

  if (!email || !givenName || !userPhone) return;
  window.usersReady = null;
  await initUsersLoading();
  if (userExists(email)) return;
  const dataObj = { email, givenName, password, userPhone };
  await uploadData("/users", dataObj);
  window.usersReady = null;
  dataArray = await initUsersLoading();
  resetContactForm();
  closeContactModal(modal);
  renderContacts(dataArray);
  initContactsClick(dataArray);
  showToastOverlay("toast_contact_added");
}

async function editUser(userId) {
  const modal = document.getElementById("edit_contact_modal");
  const userNameInp = document.getElementById("edit_user_name");
  const emailInp = document.getElementById("edit_user_email");
  const userPhoneInp = document.getElementById("edit_user_phone");
  const email = emailInp?.value?.trim() || "";
  const givenName = userNameInp?.value?.trim() || "";
  const userPhone = userPhoneInp?.value?.trim() || "";
  if (!email || !givenName || !userPhone) return;
  let dataArray = {};
  const dataObj = { email, givenName, userPhone };
  await window.editData("/users", userId, dataObj);
  window.usersReady = null;
  dataArray = await initUsersLoading();
  renderContacts(dataArray);
  renderContactDetails(dataArray, userId);
  closeEditContactModal(modal);
}

function renderEditContactAvatar(userId, givenName) {
  const avatarEl = document.getElementById("user_avatar_edit");
  if (!avatarEl) return;
  
  const initials = initialsFromGivenName(givenName);
  const bgColor = colorIndexFromUserId(userId);
  
  avatarEl.style.backgroundColor = `var(--user_c_${bgColor})`;
  avatarEl.innerHTML = initials;
}

