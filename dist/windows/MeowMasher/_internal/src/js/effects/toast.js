document.addEventListener("DOMContentLoaded", () => {
  const toast = document.querySelector(".toast");
  const toastHeader = toast.querySelector(".toast-header");
  const toastContent = toast.querySelector(".toast-content");
  const toastDesc = toast.querySelector(".toast-desc");

  const queue = [];
  let isShowing = false;

  function showNext() {
    if (isShowing || queue.length === 0) return;

    const { header, content, desc, type } = queue.shift();
    isShowing = true;

    toastHeader.textContent = header || "";
    toastContent.textContent = content || "";
    toastDesc.textContent = desc || "";
    toast.classList.add("active");

    if (type === "pause") return; // queue resumes on "resume" event

    setTimeout(() => {
      toast.classList.remove("active");
      setTimeout(() => {
        isShowing = false;
        showNext();
      }, 300); // match your CSS transition duration
    }, 3000);
  }

  // Usage: window.dispatchEvent(new CustomEvent("toast",
  // { detail: { header: "Achievement Unlocked:", content: "You clicked the button!", desc: "This is a description of the achievement." } }));
  window.addEventListener("toast", (e) => {
    queue.push(e.detail);
    showNext();
  });

  window.addEventListener("pause", () => {
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: {
          header: "Game Paused",
          content: "(Press ▶️ to Resume)",
          type: "pause",
        },
      }),
    );
    toast.onclick = () => {
      window.dispatchEvent(new Event("resume"));
      toast.onclick = null;
    };
  });

  window.addEventListener("resume", () => {
    toast.classList.remove("active");
    setTimeout(() => {
      isShowing = false;
      showNext();
    }, 300);
  });
});
