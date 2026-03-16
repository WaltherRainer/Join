/**
 * Retrieves the overlay element by ID.
 * Returns null if not found.
 *
 * @function getOverlayElement
 * @param {string} overlayId - The ID of the overlay element
 * @returns {HTMLElement|null} The overlay element or null
 */
function getOverlayElement(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) {
    console.warn("Overlay nicht gefunden:", overlayId);
    return null;
  }
  return overlay;
}

/**
 * Retrieves the toast box element from within the overlay.
 * Returns null if not found.
 *
 * @function getToastBox
 * @param {HTMLElement} overlay - The overlay element
 * @param {string} boxSelector - CSS selector for the toast box
 * @returns {HTMLElement|null} The toast box element or null
 */
function getToastBox(overlay, boxSelector) {
  const box = overlay.querySelector(boxSelector);
  if (!box) {
    console.warn("Toast-Box nicht gefunden in:", overlay.id, "Selector:", boxSelector);
    return null;
  }
  return box;
}

/**
 * Calculates the duration for which the toast should remain visible.
 * Uses options first, then element data attribute, with a default fallback.
 *
 * @function getToastHoldDuration
 * @param {HTMLElement} overlay - The overlay element
 * @param {Object} opts - Options object
 * @param {number} [opts.holdMs] - Optional hold duration in milliseconds
 * @returns {number} Duration in milliseconds
 */
function getToastHoldDuration(overlay, opts) {
  return Number.isFinite(opts.holdMs) ? opts.holdMs : parseInt(overlay.dataset.holdMs, 10) || 1000;
}

/**
 * Clears any previous timers and cleanup handlers attached to the overlay.
 *
 * @function clearPreviousToastTimers
 * @param {HTMLElement} overlay - The overlay element
 * @returns {void}
 */
function clearPreviousToastTimers(overlay) {
  if (overlay._toastTimer) {
    window.clearTimeout(overlay._toastTimer);
    overlay._toastTimer = null;
  }

  if (overlay._toastCleanup) {
    overlay._toastCleanup();
    overlay._toastCleanup = null;
  }

  if (overlay._toastClickCleanup) {
    overlay._toastClickCleanup();
    overlay._toastClickCleanup = null;
  }
}

/**
 * Prepares the overlay for animation by setting initial visibility and accessibility attributes.
 *
 * @function prepareOverlayForAnimation
 * @param {HTMLElement} overlay - The overlay element
 * @param {string} visibleClass - CSS class for visibility state
 * @returns {void}
 */
function prepareOverlayForAnimation(overlay, visibleClass) {
  overlay.setAttribute("aria-hidden", "false");
  overlay.classList.add(visibleClass);
}

/**
 * Triggers the animation by adding the animation class and forcing a reflow.
 *
 * @function startToastAnimation
 * @param {HTMLElement} overlay - The overlay element
 * @param {HTMLElement} box - The toast box element
 * @param {string} animateClass - CSS class that triggers animation
 * @returns {void}
 */
function startToastAnimation(overlay, box, animateClass) {
  void box.offsetWidth;
  overlay.classList.add(animateClass);
}

/**
 * Hides the toast overlay and restores accessibility state.
 * Calls the completion callback if provided.
 *
 * @function hideToastOverlay
 * @param {HTMLElement} overlay - The overlay element
 * @param {string} animateClass - CSS animation class to remove
 * @param {string} visibleClass - CSS visibility class to remove
 * @param {Object} opts - Options object
 * @param {Function} [opts.onDone] - Optional callback function
 * @returns {void}
 */
function hideToastOverlay(overlay, animateClass, visibleClass, opts) {
  overlay.classList.remove(animateClass, visibleClass);
  overlay.setAttribute("aria-hidden", "true");

  if (typeof opts.onDone === "function") {
    opts.onDone();
    return;
  }

  const fnName = overlay.dataset.onDone;
  if (fnName && typeof window[fnName] === "function") {
    window[fnName]();
  }
}

/**
 * Creates and attaches the animation end event handler.
 * Handles cleanup and scheduling the hide action.
 *
 * @function attachToastAnimationEndHandler
 * @param {HTMLElement} overlay - The overlay element
 * @param {HTMLElement} box - The toast box element
 * @param {string} animateClass - CSS animation class
 * @param {string} visibleClass - CSS visibility class
 * @param {Object} opts - Options object
 * @param {number} holdMs - Duration to hold the toast visible
 * @returns {void}
 */
function attachToastAnimationEndHandler(overlay, box, animateClass, visibleClass, opts, holdMs) {
  const onAnimEnd = (ev) => {
    if (ev.target !== box) return;

    box.removeEventListener("animationend", onAnimEnd);

    overlay._toastTimer = window.setTimeout(() => {
      hideToastOverlay(overlay, animateClass, visibleClass, opts);
    }, holdMs);
  };

  box.addEventListener("animationend", onAnimEnd);

  overlay._toastCleanup = () => {
    box.removeEventListener("animationend", onAnimEnd);
  };
}

/**
 * Displays a toast overlay with animation and auto-hide.
 * Orchestrates all sub-functions to show and manage the toast lifecycle.
 *
 * @function showToastOverlay
 * @param {string} overlayId - ID of the overlay element
 * @param {Object} opts - Configuration options
 * @param {string} [opts.visibleClass="is_visible"] - CSS class for visibility
 * @param {string} [opts.animateClass="is_animating"] - CSS class for animation
 * @param {string} [opts.boxSelector="[data-toast-box], .signup_success_box, .task_success_box"] - Selector for toast box
 * @param {number} [opts.holdMs] - Duration to hold toast visible
 * @param {Function} [opts.onDone] - Callback when toast completes
 * @returns {void}
 */
function showToastOverlay(overlayId, opts = {}) {
  const overlay = getOverlayElement(overlayId);
  if (!overlay) return;

  const visibleClass = opts.visibleClass || "is_visible";
  const animateClass = opts.animateClass || "is_animating";
  const boxSelector = opts.boxSelector || "[data-toast-box], .signup_success_box, .task_success_box";

  const box = getToastBox(overlay, boxSelector);
  if (!box) return;

  const holdMs = getToastHoldDuration(overlay, opts);

  clearPreviousToastTimers(overlay);
  prepareOverlayForAnimation(overlay, visibleClass);
  startToastAnimation(overlay, box, animateClass);
  attachToastClickHandler(overlay, animateClass, visibleClass, opts);
  attachToastAnimationEndHandler(overlay, box, animateClass, visibleClass, opts, holdMs);
}

/**
 * Recursively loads and injects HTML partials for elements marked with `w3-include-html`.
 *
 * Finds the next include element, fetches its referenced file, writes the response into
 * the element, removes the attribute, and continues until no includes remain. When all
 * includes are processed, the optional callback is executed.
 *
 * @function w3includeHTML
 * @param {Function} [cb] - Callback invoked after all includes have been processed.
 * @returns {void}
 */
function w3includeHTML(cb) {
  const el = findNextIncludeEl();
  if (!el) return runCb(cb);

  const file = el.getAttribute("w3-include-html");
  if (!file) return w3includeHTML(cb);

  requestInclude(file, (status, html) => {
    writeIncludeResult(el, status, html);
    el.removeAttribute("w3-include-html");
    w3includeHTML(cb);
  });
}

/**
 * Finds the next element that requests an HTML include.
 *
 * Searches the document for the first element with the `w3-include-html` attribute.
 *
 * @function findNextIncludeEl
 * @returns {Element|null} The next include element, or `null` if none exists.
 */
function findNextIncludeEl() {
  return document.querySelector("[w3-include-html]");
}

/**
 * Loads an HTML partial via XMLHttpRequest and returns the response.
 *
 * Performs an asynchronous GET request and calls the callback once the request
 * completes, passing the HTTP status code and response text.
 *
 * @function requestInclude
 * @param {string} url - URL of the file to load.
 * @param {(status: number, html: string) => void} done - Callback invoked on completion.
 * @returns {void}
 */
function requestInclude(url, done) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState !== 4) return;
    done(xhr.status, xhr.responseText);
  };
  xhr.open("GET", url, true);
  xhr.send();
}

/**
 * Writes the result of an HTML include request into a target element.
 *
 * Injects the loaded HTML on success (200) or displays a "Page not found."
 * message when the request returns 404.
 *
 * @function writeIncludeResult
 * @param {Element} el - Target element to receive the included content.
 * @param {number} status - HTTP status code from the include request.
 * @param {string} html - Response text containing the HTML partial.
 * @returns {void}
 */
function writeIncludeResult(el, status, html) {
  if (status === 200) el.innerHTML = html;
  else if (status === 404) el.innerHTML = "Page not found.";
}

/**
 * Safely executes a callback if it is a function.
 *
 * @function runCb
 * @param {*} cb - Potential callback to invoke.
 * @returns {void}
 */
function runCb(cb) {
  if (typeof cb === "function") cb();
}

/**
 * Immediately closes the toast and clears all related timers and handlers.
 *
 * @param {HTMLElement} overlay - The overlay element.
 * @param {string} animateClass - CSS animation class.
 * @param {string} visibleClass - CSS visibility class.
 * @param {Object} opts - Options object.
 * @returns {void}
 */
function dismissToastOverlay(overlay, animateClass, visibleClass, opts) {
  clearPreviousToastTimers(overlay);
  hideToastOverlay(overlay, animateClass, visibleClass, opts);
}

/**
 * Attaches a click handler to a toast overlay and stores a cleanup function.
 *
 * On click, dismisses the toast via {@link dismissToastOverlay}. Also assigns
 * `_toastClickCleanup` on the overlay to remove the listener later.
 *
 * @function attachToastClickHandler
 * @param {HTMLElement} overlay - Toast overlay element.
 * @param {string} animateClass - CSS class used for the dismiss animation.
 * @param {string} visibleClass - CSS class indicating the toast is visible.
 * @param {Object} opts - Options forwarded to {@link dismissToastOverlay}.
 * @returns {void}
 */
function attachToastClickHandler(overlay, animateClass, visibleClass, opts) {
  const onClick = () => {
    dismissToastOverlay(overlay, animateClass, visibleClass, opts);
  };

  overlay.addEventListener("click", onClick);

  overlay._toastClickCleanup = () => {
    overlay.removeEventListener("click", onClick);
  };
}
