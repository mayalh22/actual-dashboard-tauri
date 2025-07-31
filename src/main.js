const greetBtn = document.getElementById("greet-btn");
const greetInput = document.getElementById("greet-input");

greetBtn.addEventListener("click", () => {
  const name = greetInput.value.trim();
  if (name) {
    alert(`Hello, ${name}! Welcome to Tauri!`);
  } else {
    alert("Please enter your name.");
  }
});
