document.addEventListener("DOMContentLoaded", () => {
  const toast = document.querySelector(".toast");
  const toastHeader = toast.querySelector(".toast-header");
  const toastContent = toast.querySelector(".toast-content");
  const toastDesc = toast.querySelector(".toast-desc");

  // Usage: window.dispatchEvent(new CustomEvent("toast",
  // { detail: { header: "Achievement Unlocked:", content: "You clicked the button!", desc: "This is a description of the achievement." } }));
  window.addEventListener("toast", (e) => {
    const { header, content, desc, type } = e.detail;
    toastHeader.textContent = header || "";
    toastContent.textContent = content || "";
    toastDesc.textContent = desc || "";

    toast.classList.add("active");

    if (type !== "pause") {
      setTimeout(() => {
        toast.classList.remove("active");
      }, 3000);
    }
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
  });
});
