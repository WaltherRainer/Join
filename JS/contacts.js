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
    u.phone || "-",
    userId
  );
  renderIcons(target);
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

