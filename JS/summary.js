function initSummary() {
  checkIfUserIsLoggedIn();
  writeGreetingDay();
  writeGreetingName();
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
 * If no element with the ID "greetingDay" exists in the DOM, the function
 * exits silently without performing any action.
 *
 * @function writeGreetingDay
 * @returns {void} This function does not return a value.
 *
 * @example
 * // Call after the DOM or included HTML has been loaded
 * writeGreetingDay();
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
 * This function is typically called as part of a higher-level initialization
 * routine (e.g. {@link initSummary}) after the DOM or dynamically included
 * HTML content has been fully loaded.
 *
 * @function writeGreetingName
 * @returns {void} This function does not return a value.
 *
 * @throws {TypeError} May throw an error if the element with ID "greetingName"
 * is not present in the DOM and `target` is `null`.
 *
 * @example
 * // Writes the name greeting into the summary section
 * writeGreetingName();
 */
function writeGreetingName() {
  const target = document.getElementById("greetingName");
  target.innerHTML = writeGreetingNameTemplate();
}
