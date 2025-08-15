// Sélection des champs d'erreur
const alredyLoggedError = document.querySelector(".alredyLogged__error");
const loginEmailError = document.querySelector(".loginEmail__error");
const loginMdpError = document.querySelector(".loginMdp__error");

// Sélection des champs du formulaire
const email = document.getElementById("email");
const password = document.getElementById("password");
const submit = document.getElementById("submit");
const authLink = document.getElementById("auth-link"); // Lien login/logout dans le header

// Vérifier le statut de connexion au chargement de la page
updateAuthLink();

// Événement de clic sur le bouton de connexion
if(submit){
  submit.addEventListener("click", (e) => {
    e.preventDefault();
    const user = {
      email: email.value.trim(),
      password: password.value.trim(),
    };
    login(user);
  });
}

// Fonction pour mettre à jour le lien login/logout
function updateAuthLink() {
  const token = localStorage.getItem("token");

  if (token) {
    authLink.textContent = "logout";
    authLink.href = "#";
    authLink.onclick = () => {
      logout();
      return false; // onclick'ten sonra default davranışı engelle
    };

    // Si nous sommes sur login.html, afficher le message une seule fois
    if (window.location.pathname.includes("login.html")) {
      if (!alredyLoggedError.hasChildNodes()) {
        const p = document.createElement("p");
        p.innerHTML = "<br><br><br>Vous êtes déjà connecté.";
        alredyLoggedError.appendChild(p);
      }
    }
  } else {
    authLink.textContent = "login";
    authLink.href = "login.html";
    authLink.onclick = null;

    // Effacer le message si présent
    if (window.location.pathname.includes("login.html")) {
      alredyLoggedError.innerHTML = "";
    }
  }
}

// Fonction de déconnexion
function logout() {
  localStorage.removeItem("token"); // Supprimer le token
  updateAuthLink(); // Mettre à jour le header
  if (!window.location.pathname.includes("login.html")) {
    window.location.href = "login.html"; // Rediriger vers login si on n'y est pas déjà
  } else {
    alredyLoggedError.innerHTML = ""; // Supprimer le message sur login.html
  }
}

// Fonction de connexion
function login(user) {
  loginEmailError.innerHTML = "";
  loginMdpError.innerHTML = "";

  // Vérification email
  if (!user.email.match(/^[a-zA-Z0-9._.-]+@[a-zA-Z0-9._.-]{2,}\.[a-z]{2,4}$/)) {
    const p = document.createElement("p");
    p.textContent = "Veuillez entrer une adresse e-mail valide";
    loginEmailError.appendChild(p);
    return;
  }

  // Vérification mot de passe
  if (user.password.length < 5 || !user.password.match(/^[a-zA-Z0-9]+$/)) {
    const p = document.createElement("p");
    p.textContent = "Veuillez entrer un mot de passe valide";
    loginMdpError.appendChild(p);
    return;
  }

  // Requête au serveur
  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json;charset=utf-8" },
    body: JSON.stringify(user),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Erreur HTTP: " + response.status);
      return response.json();
    })
    .then((result) => {
      if (result.error || result.message) {
        const p = document.createElement("p");
        p.textContent = "La combinaison e-mail/mot de passe est incorrecte.";
        loginMdpError.appendChild(p);
      } else if (result.token) {
        localStorage.setItem("token", result.token);
        window.location.href = "index.html";
      }
    })
    .catch((error) => {
      console.error("Erreur de connexion:", error);
      const p = document.createElement("p");
      p.textContent = "Une erreur est survenue. Veuillez réessayer plus tard.";
      loginMdpError.appendChild(p);
    });
}
