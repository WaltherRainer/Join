const BASE_URL = "https://jointest-9b595-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Loads JSON data from the backend via HTTP and returns the parsed result.
 *
 * Builds a request URL from the given path by normalizing leading slashes
 * and appending the `.json` extension. The function performs a `fetch`
 * request, validates the HTTP response, and parses the response body as JSON.
 *
 * If the request fails or the response is not OK, the error is logged and
 * the function resolves with `null` instead of throwing, allowing the caller
 * to handle missing data gracefully.
 *
 * @async
 * @function loadData
 * @param {string} [path=""] - Relative API path (without leading slash or `.json` extension).
 * @returns {Promise<Object|null>} A promise that resolves to the parsed JSON object,
 * or `null` if an error occurred during fetching or parsing.
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
    console.log(data);
    return data;
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
    return null;
  }
}

/**
 * Uploads JSON-serializable data to the backend via an HTTP POST request.
 *
 * Builds a request URL from the given path by normalizing leading slashes
 * and appending the `.json` extension. The provided data object is serialized
 * to JSON and sent in the request body with the appropriate content type.
 *
 * The function logs request and response details for debugging purposes.
 * If the server responds with a non-OK status, an error is thrown so the
 * caller can handle the failure explicitly.
 *
 * @async
 * @function uploadData
 * @param {string} [path=""] - Relative API path (without leading slash or `.json` extension).
 * @param {Object} dataObj - The data object to be uploaded; must be JSON-serializable.
 * @returns {Promise<Object>} A promise that resolves to the parsed JSON response
 * returned by the server.
 *
 * @throws {Error} Throws an error if the HTTP request fails or the response
 * status is not OK.
 */
async function uploadData(path = "", dataObj) {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const url = `${BASE_URL}/${cleanPath}.json`;

  // console.log("UPLOAD url:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataObj),
    redirect: "follow",
  });

  // console.log("FINAL response.url:", response.url);
  // console.log("STATUS:", response.status);

  if (!response.ok) {
    throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${response.url}`);
  }
  return await response.json();
}

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
 * Deletes data on the backend via an HTTP DELETE request.
 *
 * Constructs the request URL from the given path by removing leading slashes
 * and appending the `.json` extension. The function sends a DELETE request
 * to the backend endpoint and validates the HTTP response.
 *
 * If the server responds with a non-OK status, an error is thrown so that
 * the caller can handle the failure explicitly.
 *
 * @async
 * @function deleteData
 * @param {string} [path=""] - Relative API path (without leading slash or `.json` extension).
 * @returns {Promise<boolean>} A promise that resolves to `true` if the delete
 * operation completed successfully.
 *
 * @throws {Error} Throws an error if the HTTP request fails or the response
 * status is not OK.
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
