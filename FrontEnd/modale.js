// ==================== MODALE.JS ====================

// ----------- VARIABLES GLOBALES -----------
const btnAll = document.querySelector(".filter__btn-id-null");
const btnId1 = document.querySelector(".filter__btn-id-1");
const btnId2 = document.querySelector(".filter__btn-id-2");
const btnId3 = document.querySelector(".filter__btn-id-3");
const modaleSectionProjets = document.querySelector(".js-admin-projets");
const AlredyLogged = document.querySelector(".js-alredy-logged");

// Global variables
let worksData = []; 
const sectionProjets = document.querySelector(".gallery"); // HTML’deki container

let modale = null;
let modaleProjet = null;
let token = localStorage.getItem("token"); // Admin token

// ----------- GENERATION DES PROJETS -----------
async function generationProjets(id = null, works = null) {
 if (!sectionProjets) return;

  if (!worksData.length && !works) {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      worksData = await response.json();
    } catch {
      // hata yönetimi
    }
  } else if (works) {
    worksData = works;
  }

  // Reset la section
  sectionProjets.innerHTML = "";

  // Filtre
  let filtered = id && [1,2,3].includes(id)
    ? worksData.filter(p => p.categoryId === id)
    : worksData;

  // Active les boutons
  document.querySelectorAll(".filter__btn").forEach(btn => btn.classList.remove("filter__btn--active"));
  if (id === null) {
    document.querySelector(".filter__btn-id-null").classList.add("filter__btn--active");
  } else if ([1,2,3].includes(id)) {
    document.querySelector(`.filter__btn-id-${id}`).classList.add("filter__btn--active");
  }

  // Aucun projet
  if (!filtered.length) {
    sectionProjets.innerHTML = `<p class="error">
      Aucun projet à afficher <br><br>Toutes nos excuses pour la gêne occasionnée
    </p>`;
    return;
  }

  // Génère les projets
  filtered.forEach(p => {
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

// ----------- FILTER EVENT LISTENERS -----------
btnAll?.addEventListener("click", () => generationProjets(null));
btnId1?.addEventListener("click", () => generationProjets(1));
btnId2?.addEventListener("click", () => generationProjets(2));
btnId3?.addEventListener("click", () => generationProjets(3));

// ----------- MODALE ADMIN & PANEL -----------
async function modaleProjets() {
  if (!modaleSectionProjets) return;

  try {
    const response = await fetch("http://localhost:5678/api/works");
    const dataAdmin = await response.json();
    modaleSectionProjets.innerHTML = "";

    dataAdmin.forEach(item => {
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

  AlredyLogged.textContent = "logout";
  document.body.classList.add("mode-active");

  const filters = document.querySelector(".filters");
  if (filters) filters.style.display = "none";
}

adminPanel();

// ----------- MODALE OPEN/CLOSE -----------
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

  modale.querySelector(".js-modale-close").addEventListener("click", closeModale);
  modale.addEventListener("click", closeModale);
  modale.querySelector(".js-modale-stop").addEventListener("click", stopPropagation);

  document.querySelectorAll(".js-modale-projet").forEach((a) => a.addEventListener("click", openModaleProjet));
};

const closeModale = function (e) {
  e.preventDefault();
  if (!modale) return;

  modale.setAttribute("aria-hidden", "true");
  modale.removeAttribute("aria-modal");
  modale.querySelector(".js-modale-close").removeEventListener("click", closeModale);

  setTimeout(() => {
    modale.style.display = "none";
    modale = null;
    modaleSectionProjets.innerHTML = "";

    const filters = document.querySelector(".filters");
    if (filters) filters.style.display = "flex";
  }, 300);
};

const stopPropagation = function (e) { e.stopPropagation(); };

document.querySelectorAll(".js-modale").forEach((a) => a.addEventListener("click", openModale));
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModale(e);
    closeModaleProjet(e);
  }
});

// ----------- DELETE PROJETS -----------
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
  await modaleProjets();
  const projet = document.querySelector(`.js-projet-${i}`);
  if (projet) projet.style.display = "none";
}

// ----------- MODALE AJOUT PROJET -----------
const openModaleProjet = function (e) {
  e.preventDefault();
  modaleProjet = document.querySelector(e.target.getAttribute("href"));
  if (!modaleProjet) return;

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

// ----------- CHARGEMENT INITIAL -----------
document.addEventListener("DOMContentLoaded", () => {
  generationProjets();
});
