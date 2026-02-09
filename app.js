/* MENU */
function toggleMenu() {
    const nav = document.getElementById("menu");
    nav.style.display = nav.style.display === "block" ? "none" : "block";
}

/* NAVIGATION */
function showSection(id, push = true) {
    document.querySelectorAll("section").forEach(s =>
        s.classList.remove("active")
    );

    const target = document.getElementById(id);
if (!target) return;
target.classList.add("active");

    if (push) {
        history.pushState({ section: id }, "", "#" + id);
    }
    }


/* DATA */
const cooks = {
    Aigerim: {
        name: "Aigerim Nursultan",
        experience: 5,
        rating: "⭐⭐⭐⭐⭐",
        review: "Very tasty homemade food",
        dishes: ["Burger", "Plov", "Manty", "Cutlets", "Borscht"]
    },
    Anna: {
        name: "Anna Ivanova",
        experience: 3,
        rating: "⭐⭐⭐⭐",
        review: "Fresh and delicious meals",
        dishes: ["Lagman", "Rice with chicken", "Salad", "Soup", "Cookies", "SaladGreek"]
    },
    Maria: {
        name: "Maria Petrova",
        experience: 7,
        rating: "⭐⭐⭐⭐⭐",
        review: "Best European cuisine",
        dishes: ["Lasagna", "Pizza", "Pasta", "Dessert", "CreamSoup"]
    }
};

const dishes = {
    Burger: { price: "2500 ₸", desc: "Bun, beef, cheese", cook: "Aigerim" },
    Plov: { price: "2500 ₸", desc: "Rice, beef, carrot", cook: "Aigerim" },
    Manty: { price: "2000 ₸", desc: "Dough, meat, onion", cook: "Aigerim" },
    Cutlets: { price: "2400 ₸", desc: "Minced meat, spices", cook: "Aigerim" },
    Borscht: { price: "2200 ₸", desc: "Beetroot soup, beef", cook: "Aigerim" },

    Lagman: { price: "2300 ₸", desc: "Noodles, vegetables, meat", cook: "Anna" },
    "Rice with chicken": { price: "2000 ₸", desc: "Rice, chicken", cook: "Anna" },
    Salad: { price: "1500 ₸", desc: "Fresh vegetables", cook: "Anna" },
    Soup: { price: "1700 ₸", desc: "Chicken broth, vegetables", cook: "Anna" },
    Cookies: { price: "1200 ₸", desc: "Homemade sweet cookies", cook: "Anna" },
    SaladGreek: { price: "1800 ₸", desc: "Cheese, tomatoes, olives", cook: "Anna" },

    Lasagna: { price: "3500 ₸", desc: "Pasta, meat, cheese", cook: "Maria" },
    Pizza: { price: "3000 ₸", desc: "Dough, cheese, tomato", cook: "Maria" },
    Pasta: { price: "2800 ₸", desc: "Pasta, cream sauce, cheese", cook: "Maria" },
    Dessert: { price: "1800 ₸", desc: "Cream, fruits", cook: "Maria" },
    CreamSoup: { price: "2600 ₸", desc: "Creamy vegetable soup", cook: "Maria" }
};

let selectedDish = null;
let selectedCookKey = null;

/* FOOD → COOK */
function selectDish(dishName) {
    if (!dishes[dishName]) return;

    selectedDish = dishName;
    selectedCookKey = dishes[dishName].cook;

    renderCook();
    showSection("cook", true);
}

/* RENDER COOK */
function renderCook() {
    const cook = cooks[selectedCookKey];
    const dish = dishes[selectedDish];

    document.getElementById("cookName").innerText = cook.name;
    document.getElementById("cookExp").innerText = cook.experience;
    document.getElementById("cookRating").innerText = cook.rating;
    document.getElementById("cookReview").innerText = cook.review;

    document.getElementById("selectedDishInfo").innerText =
    `${selectedDish} — ${dish.price} (${dish.desc})`;

    const list = document.getElementById("cookDishes");
    list.innerHTML = "";

    cook.dishes.forEach(d => {
        if (d !== selectedDish) {
            const li = document.createElement("li");
            li.innerText = d;
            list.appendChild(li);
        }
    });
}

/* COOK → REGISTER */
function goRegister() {
    if (!selectedDish || !selectedCookKey) return;

    document.getElementById("orderInfo").innerText =
        `${selectedDish} by ${cooks[selectedCookKey].name}`;

    showSection("register");
}

/* REGISTER → PAYMENT */
function registerForm(e) {
    e.preventDefault();
    showSection("payment");
}

/* PAYMENT → FOOD */
function pay(e) {
    e.preventDefault();
    alert("✅ Payment successful. Order confirmed!");

    selectedDish = null;
    selectedCookKey = null;

    showSection("food");
}

window.addEventListener("popstate", (e) => {
    if (e.state && e.state.section) {
        showSection(e.state.section, false);
    } else {
        showSection("food", false);
    }
});

function sendSupport(e) {
    e.preventDefault();

    const message = document.getElementById("supportMessage").value.trim();

    if (!message) {
        alert("Please write a message");
        return;
    }

    alert("Message sent to support");

    // очистка
    document.getElementById("supportMessage").value = "";
}

function submitRegister(e) {
    e.preventDefault();

    alert("✅ Registration successful");

    showSection("food");
}
