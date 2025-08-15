// GESTION DE LA HOME PAGE
// >>> Generation des projets

const btnAll = document.querySelector(".filter__btn-id-null");
const btnId1 = document.querySelector(".filter__btn-id-1");
const btnId2 = document.querySelector(".filter__btn-id-2");
const btnId3 = document.querySelector(".filter__btn-id-3");

const sectionProjets = document.querySelector(".gallery");

// Reset la section projets
function resetSectionProjets() {
  sectionProjets.innerHTML = "";
}

async function generationProjets(id = null) {
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
      document.querySelector(".filter__btn-id-null").classList.add("filter__btn--active");
    } else {
      document.querySelector(`.filter__btn-id-${id}`).classList.add("filter__btn--active");
    }

    // Si aucune donnée, afficher un avertissement
    if (!data || data.length === 0) {
      const p = document.createElement("p");
      p.classList.add("error");
      p.innerHTML = "Aucun projet à afficher <br><br>Toutes nos excuses pour la gêne occasionnée";
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
    p.innerHTML = "Une erreur est survenue lors de la récupération des projets<br><br>Une tentative de reconnexion automatique aura lieu dans une minute<br><br><br><br>Si le problème persiste, veuillez contacter l'administrateur du site";
    sectionProjets.appendChild(p);

    setTimeout(() => {
      window.location.href = "index.html";
    }, 60000);
  }
}

// Charger tous les projets à l'ouverture de la page
generationProjets();

// >>> Filtres
btnAll.addEventListener("click", () => generationProjets(null));
btnId1.addEventListener("click", () => generationProjets(1));
btnId2.addEventListener("click", () => generationProjets(2));
btnId3.addEventListener("click", () => generationProjets(3));

// >>> Gestion boite modale

let modale = null;
let dataAdmin;
const modaleSectionProjets = document.querySelector(".js-admin-projets");

// Reset la section projets
function resetmodaleSectionProjets() {
  modaleSectionProjets.innerHTML = "";
}

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

// Ouverture de la modale
const openModale = async function (e) {
  e.preventDefault();
  modale = document.querySelector(e.target.getAttribute("href"));
  if (!modale) return;

  // Projeleri yüklemeden modal açma
  await modaleProjets();

  modale.style.display = "block";
  modale.removeAttribute("aria-hidden");
  modale.setAttribute("aria-modal", "true");

  const filters = document.querySelector(".filters");
  if (filters) filters.style.display = "none";

  modale.querySelector(".js-modale-close").addEventListener("click", closeModale);
  modale.addEventListener("click", closeModale);
  modale.querySelector(".js-modale-stop").addEventListener("click", stopPropagation);

  document.querySelectorAll(".js-modale-projet").forEach((a) => {
    a.addEventListener("click", openModaleProjet);
  });
};

// Ferme la modale
const closeModale = function (e) {
  e.preventDefault();
  if (!modale) return;

  modale.setAttribute("aria-hidden", "true");
  modale.removeAttribute("aria-modal");

  modale.querySelector(".js-modale-close").removeEventListener("click", closeModale);

  setTimeout(() => {
    modale.style.display = "none";
    modale = null;
    resetmodaleSectionProjets();

    const filters = document.querySelector(".filters");
    if (filters) filters.style.display = "flex";
  }, 300);
};

const stopPropagation = function (e) {
  e.stopPropagation();
};

document.querySelectorAll(".js-modale").forEach((a) => a.addEventListener("click", openModale));

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModale(e);
    closeModaleProjet(e);
  }
});

// >>> Gestion token login
const token = localStorage.getItem("token");
const AlredyLogged = document.querySelector(".js-alredy-logged");
adminPanel();

function adminPanel() {
  if (!token) return;

  document.querySelectorAll(".admin__modifer").forEach((a) => {
    a.removeAttribute("aria-hidden");
    a.removeAttribute("style");
  });

  const adminRod = document.querySelector(".admin__rod");
  if (adminRod) {
    adminRod.style.display = "flex";
    adminRod.removeAttribute("aria-hidden");
  }

  AlredyLogged.innerHTML = "logout";
  document.body.classList.add("mode-active");

  const filters = document.querySelector(".filters");
  if (filters) filters.style.display = "none";
}

// >>> Gestion suppression d'un projet
function deleteWork() {
  const btnDelete = document.querySelectorAll(".js-delete-work");
  btnDelete.forEach((btn) => btn.addEventListener("click", deleteProjets));
}

async function deleteProjets() {
  const workId = this.classList[0];

  try {
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 204) {
      refreshPage(workId);
    } else if (response.status === 401) {
      alert("Vous n'êtes pas autorisé à supprimer ce projet, merci de vous connecter avec un compte valide");
      window.location.href = "login.html";
    }
  } catch (error) {
    console.log(error);
  }
}

async function refreshPage(i) {
  await modaleProjets(); // Relancer la génération modale

  const projet = document.querySelector(`.js-projet-${i}`);
  if (projet) projet.style.display = "none";
}

// >>> Gestion boite modale ajout projet

let modaleProjet = null;
const openModaleProjet = function (e) {
  e.preventDefault();
  modaleProjet = document.querySelector(e.target.getAttribute("href"));

  modaleProjet.style.display = "block";
  modaleProjet.removeAttribute("aria-hidden");
  modaleProjet.setAttribute("aria-modal", "true");

  modaleProjet.addEventListener("click", closeModaleProjet);
  modaleProjet.querySelector(".js-modale-close").addEventListener("click", closeModaleProjet);
  modaleProjet.querySelector(".js-modale-stop").addEventListener("click", stopPropagation);

  modaleProjet.querySelector(".js-modale-return").addEventListener("click", () => {
    closeModaleProjet(e);
    openModale(e);
  });
};

const closeModaleProjet = function (e) {
  e.preventDefault();
  if (!modaleProjet) return;

  modaleProjet.setAttribute("aria-hidden", "true");
  modaleProjet.removeAttribute("aria-modal");

  modaleProjet.querySelector(".js-modale-close").removeEventListener("click", closeModaleProjet);

  setTimeout(() => {
    modaleProjet.style.display = "none";
    modaleProjet = null;
  }, 300);
};
