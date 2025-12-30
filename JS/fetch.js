/** 
 * This Function is used to upload Data to the path of the BASE_URL
 * 
 * @param {string} path - This is the Pathname of the Realtime Database Object
 * @param {object} dataObj - This is the Data Object to Post to the Database
*/
async function uploadData(path="", dataObj) {
        try {
        let response = await fetch(BASE_URL + path + ".json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
        },
        body: JSON.stringify(dataObj)
        });
        if (!response.ok) {
            throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${BASE_URL + path}`);
        }
        return await response.json(); 
    } catch (error) {
        console.error("Fehler beim Senden der Daten:", error);
        return null; 
    }
};

/** 
 * This Function is used to load Data from the path of the BASE_URL
 * 
 * @param {string} path - This is the Pathname of the Realtime Database Object
*/
async function loadData(path="") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        if (!response.ok) {
            throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${BASE_URL + path}`);
        }
        return await response.json(); 
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
        return null; 
    }
};

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