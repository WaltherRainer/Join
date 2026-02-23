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
  writeToDoNumbersInSummary();
}

/**
 * Writes a time-based greeting into the `greetingDay` element.
 *
 * Selects a greeting string based on the current hour and updates the
 * target element's text content. If the element is missing, it exits silently.
 *
 * @function writeGreetingDay
 * @returns {void}
 */
function writeGreetingDay() {
  const el = document.getElementById("greetingDay");
  if (!el) return;
  const hour = new Date().getHours();
  let greeting;
  if (hour >= 5 && hour < 12) {
    greeting = "Good morning,";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Good afternoon,";
  } else if (hour >= 18 && hour < 22) {
    greeting = "Good evening,";
  } else {
    greeting = "Good night,";
  }
  el.textContent = greeting;
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
 * Recursively counts occurrences of a specific key/value pair in a nested structure.
 *
 * Traverses arrays and plain objects and increments the counter whenever an
 * object property matches `targetKey` and `targetValue`.
 *
 * @function countKeyValue
 * @param {*} root - Root value to traverse (object/array/nested data).
 * @param {string} targetKey - Property name to match.
 * @param {*} targetValue - Property value to match.
 * @returns {number} Number of matches found.
 */
function countKeyValue(root, targetKey, targetValue) {
  let count = 0;

  if (Array.isArray(root)) {
    for (const item of root) {
      count += countKeyValue(item, targetKey, targetValue);
    }
  } else if (root && typeof root === "object") {
    for (const [key, val] of Object.entries(root)) {
      if (key === targetKey && val === targetValue) {
        count++;
      }
      count += countKeyValue(val, targetKey, targetValue);
    }
  }

  return count;
}

/**
 * Recursively collects all `finishDate` string values from a nested structure.
 *
 * Traverses arrays and objects, pushing any property named `finishDate`
 * (when it is a string) into the provided result array.
 *
 * @function collectFinishDates
 * @param {*} value - Root value to traverse (object/array/nested data).
 * @param {string[]} [result=[]] - Accumulator array for collected date strings.
 * @returns {string[]} Array of collected `finishDate` values.
 */
function collectFinishDates(value, result = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectFinishDates(item, result);
    }
  } else if (value && typeof value === "object") {
    for (const [key, val] of Object.entries(value)) {
      if (key === "finishDate" && typeof val === "string") {
        result.push(val);
      }
      collectFinishDates(val, result);
    }
  }
  return result;
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
