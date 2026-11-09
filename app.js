const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "reminders-app-items";

let reminders = loadReminders();

$("date").textContent = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function loadReminders() {
  try {
    const savedReminders = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedReminders) ? savedReminders : [];
  } catch (error) {
    console.error("Could not load reminders:", error);
    return [];
  }
}

function saveReminders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

function createReminder() {
  const date = $("reminderdate").value;
  const name = $("remindername").value.trim();

  if (!name || !date) return;

  reminders.push({
    id: crypto.randomUUID(),
    name,
    date,
  });

  saveReminders();
  renderReminders();

  $("remindername").value = "";
  $("reminderdate").value = "";
}

function deleteReminder(id) {
  reminders = reminders.filter((reminder) => reminder.id !== id);
  saveReminders();
  renderReminders();
}

function renderReminders() {
  const list = document.querySelector(".reminders ul");
  list.replaceChildren();

  [...reminders]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((reminder) => {
      const div = document.createElement("div");
      div.classList.add("reminder-item", getDateClass(reminder.date));

      const li = document.createElement("li");
      li.textContent = reminder.name;

      const dateText = document.createElement("p");
      dateText.textContent = reminder.date;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "🗑️";
      deleteButton.classList.add("delete");
      deleteButton.setAttribute("aria-label", "Delete " + reminder.name);
      deleteButton.addEventListener("click", () => deleteReminder(reminder.id));

      div.append(deleteButton, li, dateText);
      list.append(div);
    });

  $("no-tasks").textContent = reminders.length;
}

function getDateClass(dateValue) {
  if (!dateValue) return "far";

  const [year, month, day] = dateValue.split("-").map(Number);
  const now = new Date();

  const dueDate = Date.UTC(year, month - 1, day);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const daysAway = (dueDate - today) / (1000 * 60 * 60 * 24);

  if (daysAway <= 7) return "soon";
  if (daysAway <= 30) return "mid";
  return "far";
}

$("add").addEventListener("click", createReminder);
renderReminders();
