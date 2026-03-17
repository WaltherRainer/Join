/**
 * Initializes the summary view.
 *
 * Schedules itself to run again after 150 ms, checks login state, updates
 * greeting text, and renders the current "to-do" counters in the summary.
 *
 * @function initSummary
 * @returns {void}
 */
function initSummary() {
  setTimeout(initSummary, 150);
  checkIfUserIsLoggedIn();
  writeGreetingDay();
  writeGreetingName();
  if (sessionStorage.getItem("justLoggedIn")) {
    showAndHideGreeting();
    sessionStorage.removeItem("justLoggedIn");
  }
  writeToDoNumbersInSummary();
}

/**
 * Shows the greeting element on small screens and triggers its timed hide.
 *
 * Displays `.greeting` as flex only when the viewport width is <= 1100px,
 * then delegates the hide transition scheduling to {@link hideGreetingAfterDelay}.
 *
 * @function showAndHideGreeting
 * @returns {void}
 */
function showAndHideGreeting() {
  if (window.innerWidth > 1100) return;
  const greeting = document.querySelector(".greeting");
  if (!greeting) return;
  greeting.style.display = "flex";
  hideGreetingAfterDelay(greeting, 1000);
}

/**
 * Adds the hide class after a delay and removes the greeting from the layout
 * after the CSS transition finishes.
 *
 * @function hideGreetingAfterDelay
 * @param {HTMLElement} greetingEl - The greeting element to hide.
 * @param {number} delayMs - Delay in milliseconds before starting the hide transition.
 * @returns {void}
 */
function hideGreetingAfterDelay(greetingEl, delayMs) {
  setTimeout(() => {
    greetingEl.classList.add("hide");
    greetingEl.addEventListener(
      "transitionend",
      () => {
        greetingEl.style.display = "none";
        greetingEl.classList.remove("hide");
      },
      { once: true },
    );
  }, delayMs);
}

/**
 * Writes a time-of-day greeting into the element with ID "greetingDay".
 *
 * Looks up the target element and sets its text content based on the current
 * local hour using {@link getGreetingByHour}.
 *
 * @function writeGreetingDay
 * @returns {void} Does not return a value.
 */
function writeGreetingDay() {
  const el = document.getElementById("greetingDay");
  if (!el) return;
  const hour = new Date().getHours();
  el.textContent = getGreetingByHour(hour);
}

/**
 * Returns the appropriate greeting string for a given hour of the day.
 *
 * Time ranges:
 * - 05:00–11:59 → "Good morning,"
 * - 12:00–17:59 → "Good afternoon,"
 * - 18:00–21:59 → "Good evening,"
 * - 22:00–04:59 → "Good night,"
 *
 * @function getGreetingByHour
 * @param {number} hour - Hour of day in 24h format (0–23).
 * @returns {string} The greeting for the provided hour.
 */
function getGreetingByHour(hour) {
  if (hour >= 5 && hour < 12) return "Good morning,";
  if (hour >= 12 && hour < 18) return "Good afternoon,";
  if (hour >= 18 && hour < 22) return "Good evening,";
  return "Good night,";
}

/**
 * Writes a personalized name greeting into the DOM.
 *
 * This function selects the element with the ID "greetingName" and replaces
 * its inner HTML with the markup returned by {@link writeGreetingNameTemplate}.
 * It assumes that the template function returns a valid HTML string
 * representing the name-specific greeting.
 *
 * @function writeGreetingName
 * @returns {void} This function does not return a value.
 */
function writeGreetingName() {
  const target = document.getElementById("greetingName");
  target.innerHTML = writeGreetingNameTemplate();
}

/**
 * Updates the summary counters and urgent deadline text based on stored tasks.
 *
 * Reads tasks from session storage, computes the summary counts, writes them
 * to the corresponding DOM elements, and updates the urgent deadline display.
 *
 * @function writeToDoNumbersInSummary
 * @returns {void}
 */
function writeToDoNumbersInSummary() {
  const tasks = readJsonFromSession("tasks", {});
  const counts = buildSummaryCounts(tasks);
  setTextByIdMap(counts);
  const deadlineText = buildUrgentDeadlineText(tasks);
  setTextById("toDoUrgentDeadline", deadlineText);
}

/**
 * Reads a JSON value from session storage with a safe fallback.
 *
 * Attempts to parse the stored value under the given key; if the key is
 * missing or parsing fails, the provided fallback is returned.
 *
 * @function readJsonFromSession
 * @param {string} key - Session storage key to read.
 * @param {*} fallback - Value to return when missing or invalid.
 * @returns {*} Parsed JSON value or the fallback.
 */
function readJsonFromSession(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Builds the numeric counters used in the summary view.
 *
 * Computes totals for different task states and priorities from the given
 * tasks collection and returns a map that can be written into the DOM.
 *
 * @function buildSummaryCounts
 * @param {Object<string, Object>} tasks - Object mapping task IDs to task objects.
 * @returns {{
 *   toDo: number,
 *   toDoDone: number,
 *   toDoUrgent: number,
 *   tasksInBoard: number,
 *   tasksInProgress: number,
 *   tasksAwaitingFeedback: number
 * }} Summary counts keyed by UI field names.
 */
function buildSummaryCounts(tasks) {
  return {
    toDo: countKeyValue(tasks, "status", 0),
    toDoDone: countKeyValue(tasks, "status", 3),
    toDoUrgent: countKeyValue(tasks, "priority", "urgent"),
    tasksInBoard: Object.keys(tasks ?? {}).length,
    tasksInProgress: countKeyValue(tasks, "status", 1),
    tasksAwaitingFeedback: countKeyValue(tasks, "status", 2),
  };
}

/**
 * Sets text content for multiple elements by id.
 *
 * Iterates over an id-to-value map and delegates each update to {@link setTextById}.
 *
 * @function setTextByIdMap
 * @param {Object<string, *>} idToValue - Map of element IDs to text values.
 * @returns {void}
 */
function setTextByIdMap(idToValue) {
  for (const [id, value] of Object.entries(idToValue)) {
    setTextById(id, value);
  }
}

/**
 * Sets the text content of an element by its DOM id.
 *
 * Looks up the element and assigns `textContent` to the stringified value.
 *
 * @function setTextById
 * @param {string} id - The id of the target element.
 * @param {*} value - Value to display (converted to string).
 * @returns {void}
 */
function setTextById(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

/**
 * Builds the display text for the nearest upcoming urgent deadline.
 *
 * Collects finish dates from the tasks, selects the nearest future date,
 * and formats it as a long English date string. If no future date exists,
 * a fallback message is returned.
 *
 * @function buildUrgentDeadlineText
 * @param {Object<string, Object>} tasks - Object mapping task IDs to task objects.
 * @returns {string} Formatted nearest deadline text or a fallback message.
 */
function buildUrgentDeadlineText(tasks) {
  const dates = collectFinishDates(tasks);
  const nearest = getNearestFutureDate(dates);
  return nearest ? formatDateEnglishLong(nearest) : "No upcoming date";
}

/**
 * Counts how often a specific key-value pair occurs in a nested structure.
 *
 * This is the public entry point and delegates the recursive traversal to
 * {@link countKeyValueInNode}.
 *
 * @function countKeyValue
 * @param {*} root - Root value to traverse (object, array, or primitive).
 * @param {string} targetKey - Object key to match.
 * @param {*} targetValue - Value to match for the given key.
 * @returns {number} Number of occurrences of `targetKey: targetValue`.
 */
function countKeyValue(root, targetKey, targetValue) {
  return countKeyValueInNode(root, targetKey, targetValue);
}

/**
 * Recursively traverses arrays and objects and accumulates matches for a key-value pair.
 *
 * @function countKeyValueInNode
 * @param {*} node - Current node in the traversal.
 * @param {string} targetKey - Object key to match.
 * @param {*} targetValue - Value to match for the given key.
 * @returns {number} Number of matches found in this node and its children.
 */
function countKeyValueInNode(node, targetKey, targetValue) {
  let count = 0;
  if (Array.isArray(node)) for (const item of node) count += countKeyValueInNode(item, targetKey, targetValue);
  else if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node)) {
      if (k === targetKey && v === targetValue) count++;
      count += countKeyValueInNode(v, targetKey, targetValue);
    }
  return count;
}

/**
 * Collects all `finishDate` string values from a nested data structure.
 *
 * This is the public entry point and returns an array of date strings found
 * anywhere inside nested objects/arrays by delegating to {@link walkFinishDates}.
 *
 * @function collectFinishDates
 * @param {*} root - Root value to traverse (object, array, or primitive).
 * @returns {string[]} Array of collected `finishDate` strings.
 */
function collectFinishDates(root) {
  const result = [];
  walkFinishDates(root, result);
  return result;
}

/**
 * Recursively traverses arrays and objects and pushes any `finishDate` string
 * properties into the provided result array.
 *
 * @function walkFinishDates
 * @param {*} node - Current node in the traversal.
 * @param {string[]} result - Collector array to append found date strings to.
 * @returns {void} Does not return a value.
 */
function walkFinishDates(node, result) {
  if (Array.isArray(node)) {
    for (const item of node) walkFinishDates(item, result);
    return;
  }
  if (!node || typeof node !== "object") return;
  for (const [key, val] of Object.entries(node)) {
    if (key === "finishDate" && typeof val === "string") result.push(val);
    walkFinishDates(val, result);
  }
}

/**
 * Returns the nearest future (or current) date from an array of date strings.
 *
 * Parses the provided strings into `Date` objects, filters out invalid dates
 * and past dates, then selects the smallest remaining date.
 *
 * @function getNearestFutureDate
 * @param {string[]} dateStrings - Array of date strings parseable by `Date`.
 * @returns {Date|null} The nearest future date, or `null` if none exist.
 */
function getNearestFutureDate(dateStrings) {
  const now = new Date();
  return dateStrings
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d) && d >= now)
    .reduce((nearest, current) => {
      return !nearest || current < nearest ? current : nearest;
    }, null);
}

/**
 * Formats a Date as a long English (en-GB) date string.
 *
 * Returns an empty string for invalid or non-Date inputs.
 *
 * @function formatDateEnglishLong
 * @param {Date} date - Date instance to format.
 * @returns {string} Formatted date (e.g. "23 February 2026") or an empty string.
 */
function formatDateEnglishLong(date) {
  if (!(date instanceof Date) || isNaN(date)) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
