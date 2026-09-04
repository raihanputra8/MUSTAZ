/**
 * Toast Notification System for MUSTAZ Garage
 */

export function showToast({ title, message, image, onAction, actionText = "VIEW CART" }) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast-item";

  const fallbackImg = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&auto=format&fit=crop&q=80";
  const imgSrc = image || fallbackImg;

  toast.innerHTML = `
    <img src="${imgSrc}" class="toast-thumb" alt="${title}" onerror="this.src='${fallbackImg}'">
    <div class="toast-content">
      <h4 class="toast-title">${title}</h4>
      <p class="toast-desc">${message}</p>
    </div>
    ${onAction ? `<button class="toast-btn">${actionText}</button>` : ""}
  `;

  if (onAction) {
    const btn = toast.querySelector(".toast-btn");
    btn.addEventListener("click", () => {
      onAction();
      toast.remove();
    });
  }

  container.appendChild(toast);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}
