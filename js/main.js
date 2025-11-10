document.addEventListener("DOMContentLoaded", () => {
  // Variables
  const galeria = document.querySelector(".galeria");
  const formulario = document.querySelector(".nav__busqueda");
  let coleccionesFiltradas = [];
  let categoriasRandom = [];
  const fragment = document.createDocumentFragment();
  const PEXELS_API_KEY =
    "ZOVklWfofO0RAya4Id41GDeAMk4RS3ga4NWRljgtcElZFXdkiyv5Iaeu";

  // Eventos
  formulario.addEventListener("submit", (ev) => {
    ev.preventDefault();

    let busqueda = formulario.elements["search"];

    if (validar(busqueda.value)) {
      obtenerImagenes(busqueda.value);
      const botoneraExistente = document.querySelector(".botonera");
      if (botoneraExistente) botoneraExistente.remove();
    } else {
      busqueda.placeholder = "Ingresa un dato correcto...";
      busqueda.classList.toggle("busqueda--error");

      setTimeout(() => {
        busqueda.classList.toggle("busqueda--error");
        busqueda.placeholder = "Buscar imágenes...";
      }, 1000);
    }

    busqueda.value = "";
  });

  const validar = (busqueda) => {
    busqueda = busqueda.trim();

    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

    return regex.test(busqueda);
  };

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
    const botoneraExistente = document.querySelector(".botonera");
    if (botoneraExistente) botoneraExistente.remove();

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

  /**
   * @description Obtiene las imágenes de una categoría específica.
   * @param {*} categoria Categoría de imágenes a obtener
   * @returns {void}
   */
  const obtenerImagenes = async (categoria) => {
    try {
      galeria.innerHTML = `<p class="texto-centrado">Cargando imágenes...</p>`;

      const respuesta = await fetch(
        `https://api.pexels.com/v1/search?query=${categoria}&per_page=80`,
        {
          headers: { Authorization: PEXELS_API_KEY },
        }
      );

      const data = await respuesta.json();

      if (!data.photos || data.photos.length === 0) {
        galeria.innerHTML = `<p class="texto-centrado">No se encontraron imágenes de ${categoria}.</p>`;
        return;
      }

      crearContenidoImg(categoria, data);
    } catch (err) {
      console.error("Error al obtener las imagenes:", err);
      galeria.innerHTML = `<p class="texto-centrado--error">Error al cargar imágenes.</p>`;
    }
  };

  /**
   * @description Crea el contenido de imágenes para una categoría específica.
   * @param {*} categoria Categoría de imágenes
   * @param {*} imgData Datos de las imágenes
   */
  const crearContenidoImg = async (categoria, imgData) => {
    galeria.className = "galeria";
    galeria.innerHTML = "";

    const volverBtn = document.createElement("BUTTON");
    volverBtn.textContent = "⬅ Volver a categorías";
    volverBtn.classList.add("volver-btn");
    volverBtn.addEventListener("click", mostrarCategorias);
    fragment.append(volverBtn);

    const filtroContainer = document.createElement("DIV");
    filtroContainer.classList.add("filtro__container");

    const etiqueta = document.createElement("LABEL");
    etiqueta.htmlFor = "filtro-orientacion";
    etiqueta.textContent = "Mostrar: ";
    filtroContainer.append(etiqueta);

    const seleccionar = document.createElement("SELECT");
    seleccionar.id = "filtro-orientacion";
    const opciones = [
      { value: "all", texto: "Todas" },
      { value: "horizontal", texto: "Horizontales" },
      { value: "vertical", texto: "Verticales" },
    ];
    opciones.forEach((op) => {
      const opcion = document.createElement("OPTION");
      opcion.value = op.value;
      opcion.textContent = op.texto;
      seleccionar.append(opcion);
    });
    filtroContainer.append(seleccionar);

    fragment.append(filtroContainer);

    galeria.append(fragment);

    mostrarImagenes(imgData.photos, "all");

    let totalPaginas = Math.ceil(imgData.total_results / imgData.per_page);
    totalPaginas = Math.min(totalPaginas, 10);

    crearBotones(totalPaginas, categoria);

    const filtroSelect = filtroContainer.querySelector("#filtro-orientacion");
    filtroSelect.addEventListener("change", async () => {
      const orientacion = filtroSelect.value;
      mostrarImagenes(imgData.photos, orientacion);
    });
  };

  /**
   * @description Muestra las imágenes filtradas en la galería.
   * @param {*} imgData Datos de las imágenes
   * @param {*} filtro Filtro de orientación ("all", "horizontal", "vertical")
   */
  const mostrarImagenes = (imgData, filtro = "all") => {
    const existentes = document.querySelectorAll(".galeria__link");
    existentes.forEach((el) => el.remove());

    const galeriaClassList = galeria.classList;
    galeriaClassList.remove("galeria--horizontal", "galeria--vertical");

    if (filtro === "horizontal") galeriaClassList.add("galeria--horizontal");
    else if (filtro === "vertical") galeriaClassList.add("galeria--vertical");

    imgData.forEach((img) => {
      const orientation = img.width >= img.height ? "horizontal" : "vertical";

      if (filtro === "all" || filtro === orientation) {
        const link = document.createElement("A");
        link.href = img.photographer_url;
        link.target = "_blank";
        link.classList.add("galeria__link");

        const elementoFigure = document.createElement("FIGURE");
        elementoFigure.classList.add("galeria__miniatura");

        const imagen = document.createElement("IMG");
        imagen.src = img.src.large;
        imagen.alt = img.alt || "Foto";
        imagen.classList.add("galeria__img");
        elementoFigure.append(imagen);

        const elementoFigcaption = document.createElement("FIGCAPTION");
        elementoFigcaption.classList.add("galeria__caption");
        elementoFigcaption.textContent = `Foto por ${img.photographer}`;
        elementoFigure.append(elementoFigcaption);

        link.append(elementoFigure);

        fragment.append(link);
      }
    });

    galeria.append(fragment);
  };

  /**
   * @description Crea los botones de paginación.
   * @param {*} paginas Número de páginas
   * @param {*} categoria Categoría de imágenes
   */
  const crearBotones = (paginas, categoria) => {
    const botonera = document.createElement("DIV");
    botonera.classList.add("botonera");

    for (let i = 1; i <= paginas; i++) {
      const boton = document.createElement("BUTTON");
      boton.textContent = i;
      boton.classList.add("btnPaginas");

      boton.addEventListener("click", async () => {
        await cargarPagina(categoria, i);

        document
          .querySelectorAll(".btnPaginas")
          .forEach((b) => b.classList.remove("btnPaginas--activo"));

        boton.classList.add("btnPaginas--activo");

        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      botonera.append(boton);
    }

    galeria.insertAdjacentElement("afterend", botonera);

    const primerBoton = botonera.querySelector(".btnPaginas");
    if (primerBoton) primerBoton.classList.add("btnPaginas--activo");
  };

  /**
   * @description Carga una página de imágenes.
   * @param {*} categoria Categoría de imágenes
   * @param {*} pagina Número de página
   * @returns {void}
   */
  const cargarPagina = async (categoria, pagina) => {
    try {
      const respuesta = await fetch(
        `https://api.pexels.com/v1/search?page=${pagina}&per_page=80&query=${categoria}`,
        {
          headers: { Authorization: PEXELS_API_KEY },
        }
      );

      if (!respuesta.ok) {
        console.error("Error en cargar página");
        return;
      }

      const data = await respuesta.json();

      mostrarImagenes(data.photos, "all");
    } catch (error) {
      console.error("Error al cargar página:", error);
    }
  };

  // Invocacion inicial
  inicializarCategorias();
});
