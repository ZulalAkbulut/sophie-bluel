// GESTION DE LA HOME PAGE
// >>> Generation des projets

const btnAll = document.querySelector(".filter__btn-id-null");
const btnId1 = document.querySelector(".filter__btn-id-1");
const btnId2 = document.querySelector(".filter__btn-id-2");
const btnId3 = document.querySelector(".filter__btn-id-3");

const sectionProjets = document.querySelector(".gallery");

let id;
generationProjets(data, null);

// Reset la section projets
function resetSectionProjets() {
  sectionProjets.innerHTML = "";
}

async function generationProjets(id = null) {
  const sectionProjets = document.querySelector(".gallery");
  sectionProjets.innerHTML = ""; // Nettoyez d'abord les anciens projets

  try {
    const response = await fetch("http://localhost:5678/api/works");
    let data = await response.json();

    // Filtre de catégorie
    if (id) {
      data = data.filter((item) => item.categoryId == id);
    }

    // Mettre à jour le style du bouton actif
    document.querySelectorAll(".filter__btn").forEach((btn) => {
      btn.classList.remove("filter__btn--active");
    });
    if (id === null) {
      document
        .querySelector(".filter__btn-id-null")
        .classList.add("filter__btn--active");
    } else {
      document
        .querySelector(`.filter__btn-id-${id}`)
        .classList.add("filter__btn--active");
    }

    // Si aucune donnée, afficher un avertissement
    if (!data || data.length === 0) {
      const p = document.createElement("p");
      p.classList.add("error");
      p.innerHTML =
        "Aucun projet à afficher <br><br>Toutes nos excuses pour la gêne occasionnée";
      sectionProjets.appendChild(p);
      return;
    }

    // Créer des projets
    data.forEach((item) => {
      const figure = document.createElement("figure");
      figure.classList.add(`js-projet-${item.id}`);
      sectionProjets.appendChild(figure);

      const img = document.createElement("img");
      img.src = item.imageUrl;
      img.alt = item.title;
      figure.appendChild(img);

      const figcaption = document.createElement("figcaption");
      figcaption.innerHTML = item.title;
      figure.appendChild(figcaption);
    });
  } catch (error) {
    console.error("Erreur lors de l'importation des projets:", error);

    const p = document.createElement("p");
    p.classList.add("error");
    p.innerHTML =
      "Une erreur est survenue lors de la récupération des projets<br><br>Une tentative de reconnexion automatique aura lieu dans une minute<br><br><br><br>Si le problème persiste, veuillez contacter l'administrateur du site";
    sectionProjets.appendChild(p);

    setTimeout(() => {
      window.location.href = "index.html";
    }, 60000);
  }
}

// Charger tous les projets à l'ouverture de la page
generationProjets();

// >>> Filtres

btnAll.addEventListener("click", () => {
  // Tous les projets
  generationProjets(data, null);
});

btnId1.addEventListener("click", () => {
  // Objets
  generationProjets(data, 1);
});

btnId2.addEventListener("click", () => {
  // Appartements
  generationProjets(data, 2);
});

btnId3.addEventListener("click", () => {
  // Hôtels & restaurants
  generationProjets(data, 3);
});

// GESTION DES MODULES ADMINISTATTEUR

//         2- GESTION TOKEN LOGIN                  //
//         3- GENERATION DS LA MODALE              //
//         4- GESTION SUPPRESSION PROJET           //
//         5- GESTION AJOUT PROJET                 //
//         6- GESTION AJOUT D'UN PROJET            //

// >>> Gestion boite modale

// Reset la section projets
function resetmodaleSectionProjets() {
  modaleSectionProjets.innerHTML = "";
}

// Ouverture de la modale
let modale = null;
let dataAdmin;
const modaleSectionProjets = document.querySelector(".js-admin-projets");

const openModale = function (e) {
  e.preventDefault();
  modale = document.querySelector(e.target.getAttribute("href"));

  modaleProjets(); // Génère les projets dans la modale admin
  // attendre la fin de la génération des projets
  setTimeout(() => {
    modale.style.display = null;
    modale.removeAttribute("aria-hidden");
    modale.setAttribute("aria-modal", "true");

    const filters = document.querySelector(".filters");
    if (filters) filters.style.display = "none";
  }, 25);
  // Ajout EventListener sur les boutons pour ouvrir la modale projet
  document.querySelectorAll(".js-modale-projet").forEach((a) => {
    a.addEventListener("click", openModaleProjet);
  });

  // Apl fermeture modale
  modale.addEventListener("click", closeModale);
  modale
    .querySelector(".js-modale-close")
    .addEventListener("click", closeModale);
  modale
    .querySelector(".js-modale-stop")
    .addEventListener("click", stopPropagation);
};

// Génère les projets dans la modale admin
async function modaleProjets() {
  const response = await fetch("http://localhost:5678/api/works");
  dataAdmin = await response.json();
  resetmodaleSectionProjets();
  for (let i = 0; i < dataAdmin.length; i++) {
    const div = document.createElement("div");
    div.classList.add("gallery__item-modale");
    modaleSectionProjets.appendChild(div);

    const img = document.createElement("img");
    img.src = dataAdmin[i].imageUrl;
    img.alt = dataAdmin[i].title;
    div.appendChild(img);

    const p = document.createElement("p");
    div.appendChild(p);
    p.classList.add(dataAdmin[i].id, "js-delete-work");

    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-trash-can");
    p.appendChild(icon);
  }
  deleteWork();
}

//  Ferme la modale
const closeModale = function (e) {
  e.preventDefault();
  if (modale === null) return;

  modale.setAttribute("aria-hidden", "true");
  modale.removeAttribute("aria-modal");

  modale
    .querySelector(".js-modale-close")
    .removeEventListener("click", closeModale);

  // Fermeture de la modale apres 400ms
  window.setTimeout(function () {
    modale.style.display = "none";
    modale = null;
    resetmodaleSectionProjets();

    const filters = document.querySelector(".filters");
    if (filters) filters.style.display = "flex";
  }, 300);
};

// Définit la "border" du click pour fermer la modale
const stopPropagation = function (e) {
  e.stopPropagation();
};
// Selectionne les éléments qui ouvrent la modale
document.querySelectorAll(".js-modale").forEach((a) => {
  a.addEventListener("click", openModale);
});
// Ferme la modale avec la touche echap
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModale(e);
    closeModaleProjet(e);
  }
});

// >>> Gestion token login

// Récupération du token
const token = localStorage.getItem("token");
const AlredyLogged = document.querySelector(".js-alredy-logged");

adminPanel();
// Gestion de l'affichage des boutons admin
function adminPanel() {
  if (token === null) {
    return;
  } else {
    // Rendre les éléments .admin__modifer visibles
    document.querySelectorAll(".admin__modifer").forEach((a) => {
      a.removeAttribute("aria-hidden");
      a.removeAttribute("style");
    });

    // Rendre l'élément <aside class="admin__rod"> visible
    const adminRod = document.querySelector(".admin__rod");
    if (adminRod) {
      adminRod.style.display = "flex";
      adminRod.removeAttribute("aria-hidden");
    }

    // Mettre logout
    AlredyLogged.innerHTML = "logout";

    // ajouter une classe au body
    document.body.classList.add("mode-active");

    // masquer les filtres
    const filters = document.querySelector(".filters");
    if (filters) filters.style.display = "none";
  }
}

// >>> Gestion suppression d'un projet

// Event listener sur les boutons supprimer par apport a leur id
function deleteWork() {
  let btnDelete = document.querySelectorAll(".js-delete-work");
  for (let i = 0; i < btnDelete.length; i++) {
    btnDelete[i].addEventListener("click", deleteProjets);
  }
}

// Supprimer le projet
async function deleteProjets() {
  console.log("DEBUG DEBUT DE FUNCTION SUPRESSION");
  console.log(this.classList[0]);
  console.log(token);

  await fetch(`http://localhost:5678/api/works/${this.classList[0]}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => {
      console.log(response);
      // Token correct
      if (response.status === 204) {
        console.log("DEBUG SUPPRESION DU PROJET " + this.classList[0]);
        refreshPage(this.classList[0]);
      }
      // Token incorrect
      else if (response.status === 401) {
        alert(
          "Vous n'êtes pas autorisé à supprimer ce projet, merci de vous connecter avec un compte valide"
        );
        window.location.href = "login.html";
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

// Rafraichit les projets sans recharger la page
async function refreshPage(i) {
  modaleProjets(); // Re lance une génération des projets dans la modale admin

  // supprime le projet de la page d'accueil
  const projet = document.querySelector(`.js-projet-${i}`);
  projet.style.display = "none";
}

// >>> Gestion boite modale ajout projet

// Ouverture de la modale projet
let modaleProjet = null;
const openModaleProjet = function (e) {
  e.preventDefault();
  modaleProjet = document.querySelector(e.target.getAttribute("href"));

  modaleProjet.style.display = null;
  modaleProjet.removeAttribute("aria-hidden");
  modaleProjet.setAttribute("aria-modal", "true");

  // Apl fermeture modale
  modaleProjet.addEventListener("click", closeModaleProjet);
  modaleProjet
    .querySelector(".js-modale-close")
    .addEventListener("click", closeModaleProjet);
  modaleProjet
    .querySelector(".js-modale-stop")
    .addEventListener("click", stopPropagation);

  modaleProjet
    .querySelector(".js-modale-return")
    .addEventListener("click", backToModale);
};

// Fermeture de la modale projet
const closeModaleProjet = function (e) {
  if (modaleProjet === null) return;

  modaleProjet.setAttribute("aria-hidden", "true");
  modaleProjet.removeAttribute("aria-modal");

  modaleProjet
    .querySelector(".js-modale-close")
    .removeEventListener("click", closeModaleProjet);
  modaleProjet
    .querySelector(".js-modale-stop")
    .removeEventListener("click", stopPropagation);

  modaleProjet.style.display = "none";
  modaleProjet = null;

  closeModale(e);
};

// Retour au modale admin
const backToModale = function (e) {
  e.preventDefault();
  modaleProjet.style.display = "none";
  modaleProjet = null;
  modaleProjets(dataAdmin);
};

// >>> Gestion ajout d'un projet

const fileInput = document.querySelector(".js-image");
const previewImage = document.getElementById("preview-image");
const titleInput = document.querySelector(".js-title");
const categorySelect = document.querySelector(".js-categoryId");
const submitButton = document.querySelector(".js-add-work");

// Fonction qui met à jour l'état du bouton
function updateButtonState() {
  const fileOK = fileInput.files.length > 0;
  const titleOK = titleInput.value.trim() !== "";
  const categoryOK = categorySelect.value !== "";

  if (fileOK && titleOK && categoryOK) {
    submitButton.disabled = false;
    submitButton.classList.add("active");
  } else {
    submitButton.disabled = true;
    submitButton.classList.remove("active");
  }
}

// Une fois la photo sélectionnée, actualisez le bouton et affichez l'aperçu.
// Récupérez les éléments DOM
const photoIcon = document.querySelector(".photo-icon");
const photoLabel = document.querySelector(".photo-label");
const formGroupPhoto = document.querySelector(".form-group-photo");

fileInput.addEventListener("change", function () {
  updateButtonState();

  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      previewImage.style.display = "block";

      // Masquer l'icône, le label et le texte lorsque la photo est téléchargée
      photoIcon.classList.add("hidden-when-photo");
      photoLabel.classList.add("hidden-when-photo");
      formGroupPhoto.classList.add("hide-after");
    };
    reader.readAsDataURL(file);
  } else {
    // Lorsque la photo est supprimée, ramenez tout
    previewImage.src = "";
    previewImage.style.display = "none";
    photoIcon.classList.remove("hidden-when-photo");
    photoLabel.classList.remove("hidden-when-photo");
    formGroupPhoto.classList.remove("hide-after");
  }
});

// Mettre à jour le bouton lorsque le titre et la catégorie changent
titleInput.addEventListener("input", updateButtonState);
categorySelect.addEventListener("change", updateButtonState);

// Vérifier l'état du bouton lors du chargement de la page
updateButtonState();

// Envoyer formulaire
const btnAjouterProjet = document.querySelector(".js-add-work");
btnAjouterProjet.addEventListener("click", addWork);

async function addWork(event) {
  event.preventDefault();

  const title = titleInput.value;
  const categoryId = categorySelect.value;
  const image = fileInput.files[0];

  if (title === "" || categoryId === "" || image === undefined) {
    alert("Merci de remplir tous les champs");
    return;
  } else if (categoryId !== "1" && categoryId !== "2" && categoryId !== "3") {
    alert("Merci de choisir une catégorie valide");
    return;
  } else {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", categoryId);
      formData.append("image", image);

      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 201) {
        modaleProjets(dataAdmin);
        backToModale(event);
        generationProjets(data, null);
      } else if (response.status === 400) {
        alert("Merci de remplir tous les champs");
      } else if (response.status === 500) {
        alert("Erreur serveur");
      } else if (response.status === 401) {
        alert("Vous n'êtes pas autorisé à ajouter une photo");
        window.location.href = "login.html";
      }
    } catch (error) {
      console.log(error);
    }
  }
}
