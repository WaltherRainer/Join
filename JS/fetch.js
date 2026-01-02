const BASE_URL = "https://jointest-9b595-default-rtdb.europe-west1.firebasedatabase.app"
/** 
 * This Function is used to upload Data to the path of the BASE_URL
 * 
 * @param {string} path - This is the Pathname of the Realtime Database Object
 * @param {object} dataObj - This is the Data Object to Post to the Database
*/
async function uploadData(path = "", dataObj) {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const url = `${BASE_URL}/${cleanPath}.json`;

  console.log("UPLOAD url:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataObj),
    redirect: "follow",
  });

  console.log("FINAL response.url:", response.url);
  console.log("STATUS:", response.status);

  if (!response.ok) {
    throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${response.url}`);
  }
  return await response.json();
}


/** 
 * This Function is used to load Data from the path of the BASE_URL
 * 
 * @param {string} path - This is the Pathname of the Realtime Database Object
*/
async function loadData(path = "") {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const url = `${BASE_URL}/${cleanPath}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${response.url}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
    return null;
  }
}

async function deleteData(path = "") {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const url = `${BASE_URL}/${cleanPath}.json`;

  const response = await fetch(url, { method: "DELETE" });

  if (!response.ok) {
    throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${response.url}`);
  }
  return true;
}


function saveLocalSubtasks(localSubtasks) {
    if (typeof localSubtasks !== "object" || localSubtasks === null) {
        console.error("localSubtasks muss ein Objekt sein");
        return;
    }

    localStorage.setItem(
        "localSubtasks",
        JSON.stringify(localSubtasks)
    );
}
/*  */
function loadLocalSubtasks() {
    const data = localStorage.getItem("localSubtasks");
    return data ? JSON.parse(data) : {};
}

window.uploadData = uploadData;
window.loadData = loadData;