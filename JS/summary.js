function initSummary() {
  setTimeout(initSummary, 100);
  checkIfUserIsLoggedIn();
  writeGreetingDay();
  writeGreetingName();
  writeToDoNumbersInSummary();
}

/**
 * Updates the text content of the paragraph element with the ID "greetingDay"
 * to a time-of-day–appropriate greeting.
 *
 * The greeting is determined based on the client’s current local time:
 * - 05:00–11:59 → "Good morning,"
 * - 12:00–17:59 → "Good afternoon,"
 * - 18:00–21:59 → "Good evening,"
 * - 22:00–04:59 → "Good night,"
 *
 * @function writeGreetingDay
 * @returns {void} This function does not return a value.
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

function writeToDoNumbersInSummary() {
  const dataObj = JSON.parse(sessionStorage.getItem("tasks"));
  const toDo = document.getElementById("toDo");
  const toDoDone = document.getElementById("toDoDone");
  const toDoUrgent = document.getElementById("toDoUrgent");
  const toDoUrgentDeadline = document.getElementById("toDoUrgentDeadline");
  const tasksInBoard = document.getElementById("tasksInBoard");
  const tasksInProgress = document.getElementById("tasksInProgress");
  const tasksAwaitingFeedback = document.getElementById("tasksAwaitingFeedback");

  toDo.textContent = countKeyValue(dataObj, "status", 0);
  toDoDone.textContent = countKeyValue(dataObj, "status", 3);
  toDoUrgent.textContent = countKeyValue(dataObj, "priority", "urgent");
  if (tasksInBoard && dataObj && typeof dataObj === "object") {
    tasksInBoard.textContent = Object.entries(dataObj).length;
  }
  tasksInProgress.textContent = countKeyValue(dataObj, "status", 1);
  tasksAwaitingFeedback.textContent = countKeyValue(dataObj, "status", 2);

  const dates = collectFinishDates(dataObj);
  const nearestDate = getNearestFutureDate(dates);
  const formattedDate = nearestDate ? formatDateEnglishLong(nearestDate) : "No upcoming date";
  toDoUrgentDeadline.textContent = formattedDate;
}

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

function getNearestFutureDate(dateStrings) {
  const now = new Date();

  return dateStrings
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d) && d >= now)
    .reduce((nearest, current) => {
      return !nearest || current < nearest ? current : nearest;
    }, null);
}

function formatDateEnglishLong(date) {
  if (!(date instanceof Date) || isNaN(date)) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
