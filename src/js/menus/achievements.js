// --- achievements Dialog ---
const achievementsIcon = document.getElementById("achievements-icon");
const achievementsDialog = document.getElementById("achievements-dialog");
const closeDialog = document.getElementById("close-achievements-dialog");

achievementsIcon.addEventListener("click", () => {
  achievementsDialog.classList.add("active");
});

closeDialog.addEventListener("click", () => {
  achievementsDialog.classList.remove("active");
});

// Close dialog when clicking outside
achievementsDialog.addEventListener("click", (e) => {
  if (e.target === achievementsDialog) {
    achievementsDialog.classList.remove("active");
  }
});
