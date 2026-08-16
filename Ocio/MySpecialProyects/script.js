const orders = [
  { customer: "Luna", avatar: "🧒", ingredients: ["queso", "tomate", "aceituna"] },
  { customer: "Mateo", avatar: "👦", ingredients: ["queso", "champiñón", "pimiento"] },
  { customer: "Sofía", avatar: "👧", ingredients: ["tomate", "aceituna", "pimiento"] }
];

const ingredients = {
  queso: { name: "Queso rallado", emoji: "〰" },
  tomate: { name: "Salsa de tomate", emoji: "◉" },
  aceituna: { name: "Aceituna", emoji: "🫒" },
  champiñón: { name: "Champiñón", emoji: "🍄" },
  pimiento: { name: "Pimiento", emoji: "🫑" },
  piña: { name: "Piña", emoji: "🍍" }
};

let level = 0;
let coins = 0;
let selected = [];
let seconds = 30;
let timerId;

const screens = document.querySelectorAll(".screen");
const pizza = document.querySelector("#pizza");
const ingredientButtons = document.querySelector("#ingredient-buttons");
const serveButton = document.querySelector("#serve-pizza");

function showScreen(id) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
}

function createIngredientButtons() {
  ingredientButtons.replaceChildren(...Object.entries(ingredients).map(([id, ingredient]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ingredient";
    button.dataset.ingredient = id;
    button.innerHTML = `<span class="food">${ingredient.emoji}</span><span>${ingredient.name}</span>`;
    button.addEventListener("click", () => toggleIngredient(id));
    return button;
  }));
}

function startLevel() {
  clearInterval(timerId);
  selected = [];
  seconds = 30;
  const order = orders[level];
  document.querySelector("#level").textContent = level + 1;
  document.querySelector("#customer-name").textContent = order.customer;
  document.querySelector("#customer-avatar").textContent = order.avatar;
  document.querySelector("#order-items").replaceChildren(...order.ingredients.map((id) => {
    const item = document.createElement("span");
    item.className = "order-item";
    item.textContent = `${ingredients[id].emoji} ${ingredients[id].name}`;
    return item;
  }));
  document.querySelector("#time").textContent = seconds;
  document.querySelector("#pizza-status").textContent = "0 ingredientes elegidos";
  document.querySelectorAll(".ingredient").forEach((button) => button.classList.remove("selected"));
  drawPizza();
  serveButton.disabled = true;
  showScreen("game");
  timerId = setInterval(() => {
    seconds -= 1;
    document.querySelector("#time").textContent = seconds;
    if (seconds <= 0) finishLevel(false);
  }, 1000);
}

function toggleIngredient(id) {
  const button = document.querySelector(`[data-ingredient="${id}"]`);
  if (selected.includes(id)) {
    selected = selected.filter((ingredient) => ingredient !== id);
    button.classList.remove("selected");
  } else {
    selected.push(id);
    button.classList.add("selected");
  }
  drawPizza();
  document.querySelector("#pizza-status").textContent = `${selected.length} ingrediente${selected.length === 1 ? "" : "s"} elegido${selected.length === 1 ? "" : "s"}`;
  serveButton.disabled = selected.length === 0;
}

function drawPizza() {
  pizza.replaceChildren();
  if (!selected.length) {
    pizza.innerHTML = '<span class="pizza-hint">¡Haz clic en los ingredientes!</span>';
    return;
  }
  if (selected.includes("tomate")) {
    const sauce = document.createElement("span");
    sauce.className = "pizza-sauce";
    pizza.append(sauce);
  }
  if (selected.includes("queso")) {
    const cheese = document.createElement("span");
    cheese.className = "pizza-cheese";
    pizza.append(cheese);
  }
  const positions = [[30, 22], [61, 25], [46, 48], [25, 59], [65, 63], [48, 74]];
  selected.filter((id) => !["tomate", "queso"].includes(id)).forEach((id, index) => {
    const topping = document.createElement("span");
    topping.className = "pizza-topping";
    topping.textContent = ingredients[id].emoji;
    topping.style.left = `${positions[index][0]}%`;
    topping.style.top = `${positions[index][1]}%`;
    pizza.append(topping);
  });
}

function finishLevel(served) {
  clearInterval(timerId);
  const requested = orders[level].ingredients;
  const perfect = served && selected.length === requested.length && selected.every((id) => requested.includes(id));
  const earned = perfect ? 20 + seconds : 5;
  coins += earned;
  document.querySelector("#coins").textContent = coins;
  document.querySelector("#earned-coins").textContent = earned;
  document.querySelector("#result-icon").textContent = perfect ? "🌟" : "🍕";
  document.querySelector("#result-kicker").textContent = perfect ? "¡PEDIDO PERFECTO!" : "¡CASI, CHEF!";
  document.querySelector("#result-title").textContent = perfect ? "¡Pizza genial!" : "¡Sigue practicando!";
  document.querySelector("#result-text").textContent = perfect ? `¡${orders[level].customer} está feliz! Ganaste un bonus por tu rapidez.` : "Comprueba los ingredientes del pedido antes de servir la próxima pizza.";
  document.querySelector("#next-level").textContent = level === orders.length - 1 ? "JUGAR DE NUEVO ↻" : "SIGUIENTE NIVEL ▶";
  showScreen("result");
}

document.querySelector("#start-game").addEventListener("click", () => {
  level = 0;
  coins = 0;
  document.querySelector("#coins").textContent = coins;
  startLevel();
});

document.querySelector("#clear-pizza").addEventListener("click", () => {
  selected = [];
  document.querySelectorAll(".ingredient").forEach((button) => button.classList.remove("selected"));
  drawPizza();
  document.querySelector("#pizza-status").textContent = "0 ingredientes elegidos";
  serveButton.disabled = true;
});

serveButton.addEventListener("click", () => finishLevel(true));
document.querySelector("#next-level").addEventListener("click", () => {
  level = level === orders.length - 1 ? 0 : level + 1;
  startLevel();
});

createIngredientButtons();
