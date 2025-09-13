// ==================== MODALE.JS ====================
// ----------- VARIABLES GLOBALES -----------
const btnAll = document.querySelector(".filter__btn-id-null");
const btnId1 = document.querySelector(".filter__btn-id-1");
const btnId2 = document.querySelector(".filter__btn-id-2");
const btnId3 = document.querySelector(".filter__btn-id-3");
const modaleSectionProjets = document.querySelector(".js-admin-projets");
const AlredyLogged = document.querySelector(".js-alredy-logged");

// ----------- VARIABLES GLOBALES -----------
let worksData = [];
let categoriesData = [];
const sectionProjets = document.querySelector(".gallery"); // container galerie

let modale = null; // modal principale
let modaleProjet = null; // modal ajout projet
let token = localStorage.getItem("token"); // token admin

// ----------- ELEMENTS FORM AJOUT PROJET -----------
const btnAddWork = document.querySelector(".js-add-work");
const inputTitle = document.querySelector(".js-title");
const inputImage = document.querySelector(".js-image");
const selectCategory = document.querySelector(".js-categoryId");
const previewImage = document.getElementById("preview-image");
const photoLabel = document.querySelector(".photo-label");

// ----------- FONCTIONS FORM AJOUT -----------
function checkForm() {
  if (inputTitle.value && inputImage.files.length > 0 && selectCategory.value) {
    btnAddWork.disabled = false;
  } else {
    btnAddWork.disabled = true;
  }
}

function preview() {
  const file = inputImage.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    previewImage.src = e.target.result;
    previewImage.style.display = "block";
    if (photoLabel) photoLabel.style.display = "none";
  };
  reader.readAsDataURL(file);
}

// ----------- GENERATION DES CATEGORIES -----------
async function generationCategories() {
  const filterContainer = document.querySelector(".filters");
  if (!filterContainer) return;

  // Appel d'API de catégories
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    categoriesData = await response.json();
  } catch (err) {
    console.error("Erreur lors du chargement des catégories :", err);
    return;
  }

  // Effacer les boutons
  filterContainer.innerHTML = "";

  // Bouton "Tous"
  const btnAll = document.createElement("button");
  btnAll.textContent = "Tous";
  btnAll.classList.add(
    "filter__btn",
    "filter__btn-id-null",
    "filter__btn--active"
  );
  btnAll.addEventListener("click", () => generationProjets(null));
  filterContainer.appendChild(btnAll);

  // Boutons catégories dynamiques
  categoriesData.forEach((cat) => {
    const btn = document.createElement("button");
    btn.textContent = cat.name;
    btn.classList.add("filter__btn", `filter__btn-id-${cat.id}`);
    btn.addEventListener("click", () => generationProjets(cat.id));
    filterContainer.appendChild(btn);
  });

    // --------- SELECT (form ajout projet) ----------
  const selectCategory = document.querySelector("#categorie"); // saisir l'élément sélectionné
  if (!selectCategory) return;

  try {
    // Récupérer les catégories à partir de l'API
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) throw new Error("Erreur API");
    const categoriesData = await response.json();

    console.log("✅ Categories reçues depuis l'API :", categoriesData);

    // Décochez la case Sélectionner
    selectCategory.innerHTML = "";

    // Ajouter une option de manière dynamique
    categoriesData.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      selectCategory.appendChild(option);

      console.log(`Option ajoutée → id: ${cat.id}, name: ${cat.name}`);
    });

    // Enregistrez la version finale de Select
    console.log("📌 Select final :", selectCategory.innerHTML);

  } catch (err) {
    console.error("Erreur lors du chargement des catégories :", err);
  }
}

// ----------- GENERATION DES PROJETS -----------
async function generationProjets(id = null, works = null) {
  if (!sectionProjets) return;

  if (!worksData.length && !works) {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      worksData = await response.json();
    } catch {
      // gestion des erreurs
    }
  } else if (works) {
    worksData = works;
  }

  sectionProjets.innerHTML = "";

  // Filtre
  let filtered =
    id !== null
      ? worksData.filter((p) => Number(p.categoryId) === Number(id))
      : worksData;

  // Active les boutons
  document
    .querySelectorAll(".filter__btn")
    .forEach((btn) => btn.classList.remove("filter__btn--active"));
  if (id === null) {
    document
      .querySelector(".filter__btn-id-null")
      .classList.add("filter__btn--active");
  } else {
    document
      .querySelector(`.filter__btn-id-${id}`)
      ?.classList.add("filter__btn--active");
  }

  // Aucun projet
  if (!filtered.length) {
    sectionProjets.innerHTML = `<p class="error">
            Aucun projet à afficher <br><br>Toutes nos excuses pour la gêne occasionnée
        </p>`;
    return;
  }

  // Génère les projets
  filtered.forEach((p) => {
    const figure = document.createElement("figure");
    figure.classList.add(`js-projet-${p.id}`);

    const img = document.createElement("img");
    img.src = p.imageUrl;
    img.alt = p.title;
    figure.appendChild(img);

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = p.title;
    figure.appendChild(figcaption);

    sectionProjets.appendChild(figure);
  });
}

window.generationProjets = generationProjets;

// ----------- ADMIN PANEL & MODALE -----------
async function modaleProjets() {
  if (!modaleSectionProjets) return;

  try {
    const response = await fetch("http://localhost:5678/api/works");
    const dataAdmin = await response.json();
    modaleSectionProjets.innerHTML = "";

    dataAdmin.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("gallery__item-modale");
      modaleSectionProjets.appendChild(div);

      const img = document.createElement("img");
      img.src = item.imageUrl;
      img.alt = item.title;
      div.appendChild(img);

      const p = document.createElement("p");
      p.classList.add(item.id, "js-delete-work");
      div.appendChild(p);

      const icon = document.createElement("i");
      icon.classList.add("fa-solid", "fa-trash-can");
      p.appendChild(icon);
    });

    deleteWork();
  } catch (error) {
    console.log(error);
  }
}

// ----------- AFFICHAGE DU PANEL ADMIN -----------
function adminPanel() {
  if (!token) return;

  document.querySelectorAll(".admin__modifer").forEach((a) => {
    a.removeAttribute("aria-hidden");
    a.removeAttribute("style");

    const modaleLink = a.querySelector(".js-modale");
    if (modaleLink) modaleLink.addEventListener("click", openModale);
  });

  const adminRod = document.querySelector(".admin__rod");
  if (adminRod) {
    adminRod.style.display = "flex";
    adminRod.removeAttribute("aria-hidden");
  }

  AlredyLogged.textContent = "logout";
  document.body.classList.add("mode-active");

  const filters = document.querySelector(".filters");
  if (filters) filters.style.display = "none";
}

// ----------- OUVERTURE / FERMETURE MODALE PRINCIPALE -----------
const openModale = async function (e) {
  e.preventDefault();
  modale = document.querySelector(e.target.getAttribute("href"));
  if (!modale) return;

  await modaleProjets();

  modale.style.display = "block";
  modale.removeAttribute("aria-hidden");
  modale.setAttribute("aria-modal", "true");

  const filters = document.querySelector(".filters");
  if (filters) filters.style.display = "none";

  modale
    .querySelector(".js-modale-close")
    .addEventListener("click", closeModale);
  modale.addEventListener("click", closeModale);
  modale
    .querySelector(".js-modale-stop")
    .addEventListener("click", stopPropagation);

  document
    .querySelectorAll(".js-modale-projet")
    .forEach((a) => a.addEventListener("click", openModaleProjet));
};

const closeModale = function (e) {
  e.preventDefault();
  if (!modale) return;

  modale.setAttribute("aria-hidden", "true");
  modale.removeAttribute("aria-modal");
  modale
    .querySelector(".js-modale-close")
    .removeEventListener("click", closeModale);

  setTimeout(() => {
    modale.style.display = "none";
    modale = null;
    modaleSectionProjets.innerHTML = "";

    const filters = document.querySelector(".filters");
    if (filters) filters.style.display = "flex";
  }, 300);
};

// ----------- STOP PROPAGATION CLIQUE -----------
const stopPropagation = function (e) {
  e.stopPropagation();
};

// ----------- OUVERTURE / FERMETURE MODALE AJOUT -----------
const openModaleProjet = function (e) {
  e.preventDefault();
  modaleProjet = document.querySelector(e.target.getAttribute("href"));
  if (!modaleProjet) return;

  if (modale) modale.style.display = "none";

  modaleProjet.style.display = "block";
  modaleProjet.removeAttribute("aria-hidden");
  modaleProjet.setAttribute("aria-modal", "true");

  modaleProjet.addEventListener("click", closeModaleProjet);
  modaleProjet
    .querySelector(".js-modale-close")
    .addEventListener("click", closeModaleProjet);
  modaleProjet
    .querySelector(".js-modale-stop")
    .addEventListener("click", stopPropagation);

  modaleProjet
    .querySelector(".js-modale-return")
    .addEventListener("click", () => {
      closeModaleProjet(e);
      if (modale) {
        modale.style.display = "block";
        modale.removeAttribute("aria-hidden");
        modale.setAttribute("aria-modal", "true");
      }
    });
};

const closeModaleProjet = function (e) {
  e.preventDefault();
  if (!modaleProjet) return;

  modaleProjet.setAttribute("aria-hidden", "true");
  modaleProjet.removeAttribute("aria-modal");
  modaleProjet
    .querySelector(".js-modale-close")
    .removeEventListener("click", closeModaleProjet);

  setTimeout(() => {
    modaleProjet.style.display = "none";
    modaleProjet = null;

    // reset form
    inputTitle.value = "";
    inputImage.value = "";
    selectCategory.value = "";
    previewImage.style.display = "none";
    if (photoLabel) photoLabel.style.display = "block";
    btnAddWork.disabled = true;
  }, 300);
};

// ----------- SUPPRESSION PROJETS -----------
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
      alert(
        "Vous n'êtes pas autorisé à supprimer ce projet, merci de vous connecter avec un compte valide"
      );
      window.location.href = "login.html";
    }
  } catch (error) {
    console.log(error);
  }
}

async function refreshPage(i) {
  await modaleProjets();
  const projet = document.querySelector(`.js-projet-${i}`);
  if (projet) projet.style.display = "none";
}

// ----------- FORMULAIRE AJOUT PROJET -----------
inputTitle.addEventListener("input", checkForm);
inputImage.addEventListener("change", () => {
  checkForm();
  preview();
});

// ----------- SUBMIT FORM AJOUT PROJET -----------
const formAddWork = document.querySelector(".modale-projet-form");
formAddWork.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("title", inputTitle.value);
  formData.append("image", inputImage.files[0]);
  formData.append("category", selectCategory.value);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const newWork = await response.json();

      worksData.push(newWork);
      generationProjets();

      closeModaleProjet(e);
    } else {
      alert("Erreur lors de l'ajout du projet.");
    }
  } catch (error) {
    console.log(error);
  }
});

// ----------- INITIALISATION AU CHARGEMENT -----------
document.addEventListener("DOMContentLoaded", async () => {
  await generationCategories();
  generationProjets();
  adminPanel();
});

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModale(e);
    closeModaleProjet(e);
  }
});
