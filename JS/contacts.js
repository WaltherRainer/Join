// console.log("wireContactDeleteOnce called");

// const details = document.getElementById("contact_details_sect");
// console.log("details exists?", !!details, details);

// console.log("bound?", details?.dataset?.bound, details?.dataset?.deleteBound);



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

/**
 * Function to generate a deterministic color index for a user based on the user id.
 * The index is always between 1 and the maximum number of defined user colors.
 * Same user id will always result in the same color index.
 *
 * @param {string} userId -Unique user identifier (e.g. Firebase user id)
 * @returns {number} -Color index between 1 and USER_COLOR_COUNT
 */
function colorIndexFromUserId(userId) {
  // simple hash
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0; // unsigned
  }
  return (hash % USER_COLOR_COUNT) + 1; // 1..15
}

/**
 * Function to generate a CSS color variable reference for a user based on the user id.
 * Maps the user deterministically to one of the predefined CSS variables (--user_c_1 .. --user_c_15).
 *
 * @param {string} userId -Unique user identifier (e.g. Firebase user id)
 * @returns {string} -CSS variable string for the user color (e.g. "var(--user_c_7)")
 */
function colorVarFromUserId(userId) {
  const idx = colorIndexFromUserId(userId);
  return `var(--user_c_${idx})`;
}

/**
 * Function to generate user initials from a given name string.
 * For single names, the first two characters are used.
 * For multiple names, the first character of the first and last name is used.
 *
 * @param {string} givenName -Full given name of the user
 * @param {string} [fallback="?"] -Fallback initials when no valid name is provided
 * @returns {string} -Uppercase initials to be displayed in the user avatar
 */
function initialsFromGivenName(givenName, fallback = "?") {
  if (!givenName) return fallback;

  const parts = String(givenName).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function initContactsClick(users) {
  const list = document.querySelector(".contact_list_sect");
  if (!list) return;
//   if (list.dataset.bound === "1") return;
//   list.dataset.bound = "1";

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

    // users neu laden (Realtime DB)
    users = await loadData("/users") || {};

    // Liste neu rendern
    renderContacts(users);

    // Active-Markierung entfernen
    document.querySelectorAll(".contact_list_card.is-active")
      .forEach(el => el.classList.remove("is-active"));

    // Details leeren
    const details = document.getElementById("contact_details_sect");
    if (details) {
      details.innerHTML = "";
    //   delete details.dataset.userId;
    //   delete details.dataset.bound;
    }
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

