// Toast overlay management and HTML include helper

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
  if (overlay._toastTimer) window.clearTimeout(overlay._toastTimer);
  if (overlay._toastCleanup) overlay._toastCleanup();
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
  attachToastAnimationEndHandler(overlay, box, animateClass, visibleClass, opts, holdMs);
}

/**
 * Recursively includes HTML fragments into elements marked with
 * `w3-include-html` attribute (mimics w3schools include behavior).
 * Calls optional callback after processing.
 *
 * @function w3includeHTML
 * @param {Function} [cb] - Optional callback executed once all includes done
 * @returns {void}
 */
function w3includeHTML(cb) {
  var z, i, elmnt, file, xhttp;
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            elmnt.innerHTML = this.responseText;
          }
          if (this.status == 404) {
            elmnt.innerHTML = "Page not found.";
          }
          elmnt.removeAttribute("w3-include-html");
          w3includeHTML(cb);
        }
      };
      xhttp.open("GET", file, true);
      xhttp.send();
      return;
    }
  }
  if (cb) cb();
}