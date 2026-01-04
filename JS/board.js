function initBoardModalButton() {
  const btn = document.getElementById("openAddTaskModalBtn");
  if (!btn) return;
  btn.addEventListener("click", openAddTaskModal);
}
