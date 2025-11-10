document.addEventListener("DOMContentLoaded", () => {
  // Variables
  const galeria = document.querySelector(".galeria");
  let coleccionesFiltradas = [];
  let categoriasRandom = [];
  const fragment = document.createDocumentFragment();
  const PEXELS_API_KEY =
    "ZOVklWfofO0RAya4Id41GDeAMk4RS3ga4NWRljgtcElZFXdkiyv5Iaeu";

  // Funciones

  /**
   * @description Obtiene las colecciones de imágenes de Pexels.
   * @param {*} pagina Pagina de colecciones a obtener
   * @param {*} total Total de colecciones a obtener
   * @returns {Object} Datos de las colecciones obtenidas
   */
  const obtenerColecciones = async (pagina = 1, total = 50) => {
    try {
      const respuesta = await fetch(
        `https://api.pexels.com/v1/collections/featured?page=${pagina}&per_page=${total}`,
        {
          method: "GET",
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        }
      );

      if (!respuesta.ok) {
        throw new Error("Error al obtener las colecciones");
      }

      const datos = await respuesta.json();
      return datos;
    } catch (error) {
      console.error("Error en obtenerColecciones", error);
      return null;
    }
  };

  /**
   * @description Filtra las colecciones de imágenes según un número mínimo de fotos.
   * @param {*} colecciones Colecciones a filtrar
   * @param {*} filtro Número mínimo de fotos por colección
   * @returns {Array} Colecciones filtradas
   */
  const filtrarColecciones = (colecciones, filtro) => {
    return colecciones.collections.filter(
      (coleccion) => coleccion.photos_count >= filtro
    );
  };

  /**
   * @description Obtiene las fotos de una colección específica.
   * @param {*} idColeccion ID de la colección a obtener
   * @returns {Array} Fotos de la colección
   */
  const obtenerFotosDeColeccion = async (idColeccion) => {
    try {
      const respuesta = await fetch(
        `https://api.pexels.com/v1/collections/${idColeccion}?type=photos`,
        {
          headers: { Authorization: PEXELS_API_KEY },
        }
      );

      if (!respuesta.ok)
        throw new Error("Error al obtener fotos de la colección");

      const datos = await respuesta.json();
      return datos.media;
    } catch (error) {
      console.error("Error en obtenerFotosDeColeccion:", error);
      return [];
    }
  };

  /**
   * @description Inicializa las categorías seleccionando aleatoriamente 3 colecciones.
   */
  const inicializarCategorias = async () => {
    const colecciones = await obtenerColecciones();

    coleccionesFiltradas = filtrarColecciones(colecciones, 50);

    for (let i = 0; i < 3; i++) {
      let numRandom;
      let coleccionRandom;

      do {
        numRandom = Math.floor(Math.random() * coleccionesFiltradas.length);
        coleccionRandom = coleccionesFiltradas[numRandom];
      } while (categoriasRandom.includes(coleccionRandom));

      categoriasRandom.push(coleccionRandom);
    }

    mostrarCategorias();
  };

  /**
   * @description Muestra las categorías en la galería.
   */
  const mostrarCategorias = async () => {
    galeria.className = "galeria categorias__container";
    galeria.innerHTML = "";

    try {
      for (const cat of categoriasRandom) {
        const fotos = await obtenerFotosDeColeccion(cat.id);

        const imagenUrl = fotos[0].src.medium;

        const card = document.createElement("DIV");
        card.classList.add("categoria__card");
        const imagen = document.createElement("IMG");
        imagen.src = imagenUrl;
        imagen.alt = cat.title;
        card.append(imagen);
        const nombre = document.createElement("DIV");
        nombre.classList.add("categoria__nombre");
        nombre.textContent = cat.title;
        card.append(nombre);

        card.addEventListener("click", () => obtenerImagenes(cat.title));

        fragment.append(card);
      }

      galeria.append(fragment);
    } catch (error) {
      console.error("Error al mostrar las categorías:", error);
    }
  };

  // Invocacion inicial
  inicializarCategorias();
});
