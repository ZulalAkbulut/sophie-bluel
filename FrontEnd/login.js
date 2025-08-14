// Champs de message d'erreur
const alredyLoggedError = document.querySelector(".alredyLogged__error");
const loginEmailError = document.querySelector(".loginEmail__error");
const loginMdpError = document.querySelector(".loginMdp__error");

// Champs de formulaire
const email = document.getElementById("email");
const password = document.getElementById("password");
const submit = document.getElementById("submit");

// Vérifiez l'état de l'entrée lorsque la page se charge
alredyLogged();

// Redirection si l'utilisateur est déjà connecté
function alredyLogged() {
  if (localStorage.getItem("token")) {
    // İster uyarı göster, ister doğrudan yönlendir
    const p = document.createElement("p");
    p.innerHTML = "<br><br><br>Vous êtes déjà connecté.";
    alredyLoggedError.appendChild(p);
  }
}

// Événement de clic sur le bouton de connexion
submit.addEventListener("click", (e) => {
  e.preventDefault(); // Empêcher la soumission automatique du formulaire
  let user = {
    email: email.value.trim(),
    password: password.value.trim(),
  };
  login(user);
});

// Fonction de connexion
function login(user) {
  // Effacer d'abord les messages d'erreur
  loginEmailError.innerHTML = "";
  loginMdpError.innerHTML = "";

  // Vérification de l'e-mail
  if (!user.email.match(/^[a-zA-Z0-9._.-]+@[a-zA-Z0-9._.-]{2,}\.[a-z]{2,4}$/)) {
    const p = document.createElement("p");
    p.textContent = "Veuillez entrer une adresse e-mail valide";
    loginEmailError.appendChild(p);
    return;
  }

  // Vérification du mot de passe (s'il n'est pas inférieur à 5 caractères ou uniquement composé de lettres/chiffres)
  if (user.password.length < 5 || !user.password.match(/^[a-zA-Z0-9]+$/)) {
    const p = document.createElement("p");
    p.textContent = "Veuillez entrer un mot de passe valide";
    loginMdpError.appendChild(p);
    return;
  }

  // Requête au serveur
  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(user),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP: " + response.status);
      }
      return response.json();
    })
    .then((result) => {
      console.log(result);

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
