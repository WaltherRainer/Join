function initSummary() {
  writeGreetingDay();
  writeGreetingName();
}

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

function writeGreetingName() {
  const target = document.getElementById("greetingName");
  target.innerHTML = writeGreetingNameTemplate();
}

