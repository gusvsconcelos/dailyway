var dayCompleted;
let counter = 0;

function getDate() {
  const date = new Date();
  const weekDay = date.getDay();

  document.getElementById("todayDate").innerText = date.toLocaleString(
    undefined,
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return weekDay;
}

function getTasks(state) {
  if (state === "checked") {
    return document.querySelectorAll("input[type='checkbox']:checked");
  }

  return document.querySelectorAll("input[type='checkbox']");
}

function dailyTasks() {
  const completedTasks = new Array();

  getTasks().forEach((task) => {
    if (task.checked) {
      completedTasks.push(task.id);
    }
  });

  setStorage("completedTasks", completedTasks);

  const requiredTasksByDay = {
    6: ["wakeUp", "fourMeals", "study"],
    0: ["wakeUp", "fourMeals"],
  };
  const requiredTasks = requiredTasksByDay[getDate()] ?? [];

  const hasRequiredTasks =
    requiredTasks.length > 0 &&
    requiredTasks.every((task) => completedTasks.includes(task));

  dayCompleted = hasRequiredTasks || completedTasks.length === 4;

  setStorage("dayCompleted", dayCompleted);
  setStatus(dayCompleted);
}

function setStatus(done) {
  const dailyStatus = document.getElementById("status");

  const status = done
    ? { text: "Tarefas completas", color: "green" }
    : { text: "Tarefas incompletas", color: "red" };

  dailyStatus.innerText = status.text;
  dailyStatus.style.color = status.color;
}

function handleSave() {
  dailyTasks();

  document.getElementById("submit").disabled = false;
}

function handleSubmit() {
  if (confirm("Finalizar?")) {
    if (getStorage("dayCompleted")) {
      ++counter;
    } else {
      counter = 0;
    }

    document.getElementById("streak").innerText = counter;

    setStorage("streak", counter);

    removeStorage("dayCompleted");
    removeStorage("completedTasks");

    location.reload();

    document.getElementById("submit").disabled = true;
  }
}

function exportData() {
  const data = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = "dailyway_data.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);

      if (typeof data !== "object" || data === null) {
        throw new Error("Formato inválido.");
      }

      localStorage.clear();

      for (const key in data) {
        localStorage.setItem(key, data[key]);
      }

      alert("Dados importados com sucesso. Recarregando...");

      location.reload();
    } catch (err) {
      alert("Falha ao tentar importar dados: arquivo JSON inválido.");
    }
  };

  reader.readAsText(file);
}

function setStorage(key, value) {
  return localStorage.setItem(key, JSON.stringify(value));
}

function getStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

function removeStorage(key) {
  return localStorage.removeItem(key);
}

function updateFavicon() {
  const favicon = document.getElementById("favicon");
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  favicon.href = isDarkMode
    ? "assets/favicon_light.png"
    : "assets/favicon_dark.png";
}

onload = function () {
  setStatus(getStorage("dayCompleted"));

  const tasksStored = getStorage("completedTasks");

  if (tasksStored === null) {
    getTasks("checked").forEach((task) => {
      task.checked = false;
    });
  } else {
    getTasks().forEach((task) => {
      if (tasksStored.includes(task.id)) {
        task.checked = true;
      }
    });
  }

  const streak = document.getElementById("streak");
  const streakStored = getStorage("streak");

  if (streakStored === null) {
    streak.innerText = 0;
  } else {
    counter = streakStored;
    streak.innerText = counter;
  }
};

getDate();
updateFavicon();
