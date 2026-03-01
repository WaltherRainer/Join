const BASE_URL = "https://jointest-9b595-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Fetches JSON data from the backend for the given path.
 *
 * Normalizes the path (removes leading slashes), builds the `.json` URL,
 * performs a `fetch`, validates the response, and returns the parsed JSON.
 * On any error, logs the issue and resolves with `null`.
 *
 * @async
 * @function loadData
 * @param {string} [path=""] - Relative API path (without leading slashes or `.json`).
 * @returns {Promise<Object|null>} The parsed JSON response, or `null` on failure.
 */
async function loadData(path = "") {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const url = `${BASE_URL}/${cleanPath}.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${response.url}`);
    }
    let data = await response.json();
    return data;
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
    return null;
  }
}

/**
 * Sends JSON data to the backend via an HTTP POST request.
 *
 * Normalizes the path (removes leading slashes), builds the `.json` URL,
 * posts the serialized `dataObj`, validates the response, and returns the
 * parsed JSON response body.
 *
 * @async
 * @function uploadData
 * @param {string} [path=""] - Relative API path (without leading slashes or `.json`).
 * @param {Object} dataObj - JSON-serializable payload to upload.
 * @returns {Promise<Object>} The parsed JSON response from the server.
 * @throws {Error} If the HTTP response status is not OK.
 */
async function uploadData(path = "", dataObj) {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const url = `${BASE_URL}/${cleanPath}.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataObj),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${response.url}`);
  }
  return await response.json();
}

/**
 * Updates an existing record on the backend via an HTTP PUT request.
 *
 * Normalizes the path, builds a resource URL including the given `dataId`,
 * sends the JSON-serialized `dataObj`, validates the response, and returns
 * the parsed JSON response body.
 *
 * @async
 * @function editData
 * @param {string} [path=""] - Base API path (without leading slashes or `.json`).
 * @param {string} dataId - Identifier of the record to update.
 * @param {Object} dataObj - JSON-serializable payload with updated fields.
 * @returns {Promise<Object>} The parsed JSON response from the server.
 * @throws {Error} If the HTTP response status is not OK.
 */
async function editData(path = "", dataId, dataObj) {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const url = `${BASE_URL}/${cleanPath}/${dataId}.json`;
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataObj),
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${response.url}`);
  }
  return await response.json();
}

/**
 * Partially updates an existing record on the backend via an HTTP PATCH request.
 *
 * Normalizes the path, builds a resource URL including `dataId`, sends the
 * JSON-serialized `partialObj`, validates the response, and returns the
 * parsed JSON response body.
 *
 * @async
 * @function patchData
 * @param {string} [path=""] - Base API path (without leading slashes or `.json`).
 * @param {string} dataId - Identifier of the record to patch.
 * @param {Object} partialObj - JSON-serializable object containing only the fields to update.
 * @returns {Promise<Object>} The parsed JSON response from the server.
 * @throws {Error} If the HTTP response status is not OK.
 */
async function patchData(path = "", dataId, partialObj) {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const url = `${BASE_URL}/${cleanPath}/${dataId}.json`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partialObj),
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${response.url}`);
  }
  return await response.json();
}

/**
 * Deletes data on the backend via an HTTP DELETE request.
 *
 * Normalizes the path, builds the `.json` URL, sends a DELETE request,
 * validates the response, and resolves to `true` on success.
 *
 * @async
 * @function deleteData
 * @param {string} [path=""] - Relative API path (without leading slashes or `.json`).
 * @returns {Promise<boolean>} `true` if the delete request succeeded.
 * @throws {Error} If the HTTP response status is not OK.
 */
async function deleteData(path = "") {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const url = `${BASE_URL}/${cleanPath}.json`;
  const response = await fetch(url, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${response.url}`);
  }
  return true;
}

/**
 * Persists subtasks locally in the browser's Local Storage.
 *
 * Validates that the provided value is a non-null object before serializing
 * it to JSON and storing it under the `localSubtasks` key in `localStorage`.
 * If the validation fails, an error is logged and the operation is aborted.
 *
 * @function saveLocalSubtasks
 * @param {Object} localSubtasks - An object containing subtasks to be stored locally.
 * @returns {void}
 */
function saveLocalSubtasks(localSubtasks) {
  if (typeof localSubtasks !== "object" || localSubtasks === null) {
    console.error("localSubtasks muss ein Objekt sein");
    return;
  }
  localStorage.setItem("localSubtasks", JSON.stringify(localSubtasks));
}

/**
 * Loads locally stored subtasks from the browser's Local Storage.
 *
 * Retrieves the value stored under the `localSubtasks` key from
 * `localStorage` and parses it from JSON into a JavaScript object.
 * If no data is found, an empty object is returned as a safe default.
 *
 * @function loadLocalSubtasks
 * @returns {Object} An object containing the locally stored subtasks,
 * or an empty object if none are available.
 */
function loadLocalSubtasks() {
  const data = localStorage.getItem("localSubtasks");
  return data ? JSON.parse(data) : {};
}

window.uploadData = uploadData;
window.loadData = loadData;
window.editData = editData;
