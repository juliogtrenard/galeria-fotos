document.addEventListener("DOMContentLoaded", () => {
  // Variables
  const tituloInicio = document.querySelector(".titulo__link");
  const galeria = document.querySelector(".galeria");
  const formulario = document.querySelector(".nav__busqueda");
  const btnFavoritos = document.querySelector(".nav__fav-btn");
  const main = document.querySelector("main");
  let coleccionesFiltradas = [];
  let categoriasRandom = [];
  const fragment = document.createDocumentFragment();
  const PEXELS_API_KEY =
    "ZOVklWfofO0RAya4Id41GDeAMk4RS3ga4NWRljgtcElZFXdkiyv5Iaeu";

  // Eventos
  tituloInicio.addEventListener("click", () => {
    mostrarCategorias();
  });

  formulario.addEventListener("submit", (ev) => {
    ev.preventDefault();

    let busqueda = formulario.elements["search"];

    if (validar(busqueda.value)) {
      eliminarHeaderFooter();
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

  btnFavoritos.addEventListener("click", () => {
    let favoritos = obtenerFavoritos();

    mostrarFavoritos(favoritos);
  });

  // Funciones

  /**
   * @description Realiza una petición a la API de Pexels.
   * @param {string} endpoint URL del endpoint de la API
   * @returns {Object} Datos obtenidos de la API
   */
  const apiFetch = async (endpoint) => {
    try {
      const respuesta = await fetch(endpoint, {
        headers: { Authorization: PEXELS_API_KEY },
      });

      if (!respuesta.ok) throw new Error("Error en la petición a la API");

      return await respuesta.json();
    } catch (error) {
      console.error("Error en apiFetch:", error);
      return null;
    }
  };

  /**
   * @description Valida la entrada de búsqueda para permitir solo letras y espacios.
   * @param {string} busqueda Texto de búsqueda a validar
   * @returns {boolean} Verdadero si la búsqueda es válida, falso en caso contrario.
   */
  const validar = (busqueda) => {
    busqueda = busqueda.trim();

    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

    return regex.test(busqueda);
  };

  /**
   * @description Obtiene las colecciones a usar como categorías.
   * @param {number} pagina Página de resultados
   * @param {number} total Total de colecciones a obtener de esa página
   * @returns {Object} Datos de las colecciones obtenidas
   */
  const obtenerColecciones = async (pagina = 1, total = 50) => {
    const endpoint = `https://api.pexels.com/v1/collections/featured?page=${pagina}&per_page=${total}`;
    return apiFetch(endpoint);
  };

  /**
   * @description Filtra las colecciones que tienen al menos un número mínimo de fotos.
   * @param {Object} colecciones Datos de las colecciones
   * @param {number} filtro Número mínimo de fotos para filtrar
   * @returns {Array} Colecciones filtradas
   */
  const filtrarColecciones = (colecciones, filtro) => {
    return colecciones.collections.filter(
      (coleccion) => coleccion.photos_count >= filtro
    );
  };

  /**
   * @description Obtiene las fotos de una colección específica.
   * @param {string} idColeccion ID de la colección a obtener
   * @returns {Array} Fotos de la colección
   */
  const obtenerFotosDeColeccion = async (idColeccion) => {
    const data = await apiFetch(
      `https://api.pexels.com/v1/collections/${idColeccion}?type=photos`
    );
    return data ? data.media : [];
  };

  /**
   * @description Inicializa las categorías seleccionando aleatoriamente 3 colecciones.
   */
  const inicializarCategorias = async () => {
    const colecciones = await obtenerColecciones();

    coleccionesFiltradas = filtrarColecciones(colecciones, 50);

    for (let i = 0; i < 4; i++) {
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
   * @description Crea el header de las categorías
   */
  const crearHeaderCategorias = () => {
    eliminarHeaderFooter();

    const header = document.createElement("SECTION");
    header.classList.add("categorias__header");

    const titulo = document.createElement("H2");
    titulo.textContent = "Categorías destacadas";

    const subtitulo = document.createElement("P");
    subtitulo.textContent = "Explora las colecciones más populares de Pexels";

    header.append(titulo, subtitulo);
    main.insertBefore(header, galeria);
  };

  /**
   * @description Crea el footer que aparece en la galería
   */
  const crearFooterGaleria = () => {
    eliminarHeaderFooter();

    const footer = document.createElement("SECTION");
    footer.classList.add("categorias__footer");

    const titulo = document.createElement("H3");
    titulo.textContent = "¿No encuentras lo que buscas?";

    const subtitulo = document.createElement("P");
    subtitulo.textContent =
      "Utiliza la barra de búsqueda para encontrar lo que quieras.";

    footer.append(titulo, subtitulo);
    main.append(footer);
  };

  /**
   * @description Elimina cualquier header o footer existente
   */
  const eliminarHeaderFooter = () => {
    const header = document.querySelector(".categorias__header");
    const footer = document.querySelector(".categorias__footer");
    if (header) header.remove();
    if (footer) footer.remove();
  };

  /**
   * @description Muestra las categorías en la galería.
   */
  const mostrarCategorias = async () => {
    eliminarHeaderFooter();
    crearHeaderCategorias();

    const botoneraExistente = document.querySelector(".botonera");
    if (botoneraExistente) botoneraExistente.remove();

    galeria.className = "galeria categorias__container";
    galeria.innerHTML = "";

    galeria.innerHTML = `<div class="spinner"></div>`;

    try {
      for (const cat of categoriasRandom) {
        const fotos = await obtenerFotosDeColeccion(cat.id);

        const imagenUrl = fotos[0].src.large;

        const card = document.createElement("DIV");
        card.classList.add("categoria__card");

        const imagen = document.createElement("IMG");
        imagen.alt = cat.title;
        imagen.src = imagenUrl;
        card.append(imagen);

        const nombre = document.createElement("DIV");
        nombre.classList.add("categoria__nombre");
        nombre.textContent = cat.title;
        card.append(nombre);

        card.addEventListener("click", () => {
          eliminarHeaderFooter();
          obtenerImagenes(cat.title);
        });

        fragment.append(card);
      }

      galeria.append(fragment);
    } catch (error) {
      console.error("Error al mostrar las categorías:", error);
    } finally {
      const spinner = galeria.querySelector(".spinner");
      if (spinner) spinner.remove();
    }
  };

  /**
   * @description Obtiene las imágenes de una categoría específica.
   * @param {string} categoria Categoría de imágenes a obtener
   * @returns {void}
   */
  const obtenerImagenes = async (categoria) => {
    galeria.innerHTML = `<div class="spinner"></div>`;
    const data = await apiFetch(
      `https://api.pexels.com/v1/search?query=${categoria}&per_page=78`
    );

    if (!data || !data.photos || data.photos.length === 0) {
      galeria.innerHTML = `<p class="texto-centrado--error">No se encontraron imágenes de ${categoria}.</p>`;
      return;
    }

    crearContenidoImg(categoria, data);
  };

  /**
   * @description Crea el contenido de imágenes para una categoría específica.
   * @param {string} categoria Categoría de imágenes
   * @param {Object} imgData Datos de las imágenes
   */
  const crearContenidoImg = async (categoria, imgData) => {
    crearFooterGaleria();

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
   * @param {Object} imgData Datos de las imágenes
   * @param {string} filtro Filtro de orientación ("all", "horizontal", "vertical")
   */
  const mostrarImagenes = (imgData, filtro = "all") => {
    const existentes = document.querySelectorAll(".galeria__link");
    existentes.forEach((el) => el.remove());

    const galeriaClassList = galeria.classList;
    galeriaClassList.remove("galeria--horizontal", "galeria--vertical");

    if (filtro === "horizontal") galeriaClassList.add("galeria--horizontal");
    else if (filtro === "vertical") galeriaClassList.add("galeria--vertical");

    const favoritosActuales = obtenerFavoritos();

    imgData.forEach((img) => {
      const orientation = img.width >= img.height ? "horizontal" : "vertical";

      if (filtro === "all" || filtro === orientation) {
        const link = document.createElement("A");
        link.href = img.src.original;
        link.target = "_blank";
        link.classList.add("galeria__link");

        const elementoFigure = document.createElement("FIGURE");
        elementoFigure.classList.add("galeria__miniatura");

        const favorito = document.createElement("DIV");
        favorito.classList.add("icon-fav");
        favorito.textContent = "🌟";

        const esFavorito = favoritosActuales.some(
          (f) => f.src.large === img.src.large
        );
        if (esFavorito) {
          favorito.classList.add("check");
        }

        elementoFigure.append(favorito);

        favorito.addEventListener("click", (ev) => {
          ev.preventDefault();

          favorito.classList.toggle("check");

          if (favorito.classList.contains("check")) {
            guardarFavorito(img);
          } else {
            eliminarFavorito(img);
          }
        });

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
   * @param {number} paginas Número de páginas
   * @param {string} categoria Categoría de imágenes
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
   * @param {string} categoria Categoría de imágenes
   * @param {number} pagina Número de página
   * @returns {void}
   */
  const cargarPagina = async (categoria, pagina) => {
    const data = await apiFetch(
      `https://api.pexels.com/v1/search?page=${pagina}&per_page=78&query=${categoria}`
    );
    if (data) mostrarImagenes(data.photos, "all");
  };

  /**
   * @description Guarda una imagen en la lista de favoritos.
   * @param {Object} img Imagen a guardar en favoritos
   */
  const guardarFavorito = (img) => {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    if (!favoritos.some((f) => f.src.large === img.src.large)) {
      favoritos.push(img);
      localStorage.setItem("favoritos", JSON.stringify(favoritos));
    }
  };

  /**
   * @description Elimina una imagen de la lista de favoritos.
   * @param {Object} img Imagen a eliminar de favoritos
   */
  const eliminarFavorito = (img) => {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    favoritos = favoritos.filter((f) => f.src.large !== img.src.large);
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  };

  /**
   * @description Obtiene la lista de imágenes favoritas desde localStorage.
   * @returns {Array} Lista de imágenes favoritas
   */
  const obtenerFavoritos = () => {
    return JSON.parse(localStorage.getItem("favoritos")) || [];
  };

  /**
   * @description Muestra una ventana modal con las imágenes favoritas.
   * @param {Array} favoritos Lista de imágenes guardadas en favoritos.
   */
  const mostrarFavoritos = (favoritos) => {
    if (favoritos.length === 0) {
      btnFavoritos.classList.toggle("favoritos--vacio");

      setTimeout(() => {
        btnFavoritos.classList.toggle("favoritos--vacio");
      }, 1000);
      return;
    }

    const modalOverlay = document.createElement("DIV");
    modalOverlay.classList.add("modal-overlay");

    const modal = document.createElement("DIV");
    modal.classList.add("modal");

    const btnCerrar = document.createElement("BUTTON");
    btnCerrar.classList.add("modal__cerrar");
    btnCerrar.textContent = "✖";
    btnCerrar.addEventListener("click", () => modalOverlay.remove());
    modal.append(btnCerrar);

    const titulo = document.createElement("H2");
    titulo.textContent = "Tus Favoritos";
    const btnEliminarTodo = document.createElement("BUTTON");
    btnEliminarTodo.textContent = "ELIMINAR TODO";
    btnEliminarTodo.classList.add("modal__eliminar");
    btnEliminarTodo.addEventListener("click", () => {
      let favoritos = [];
      localStorage.setItem("favoritos", JSON.stringify(favoritos));
      modalOverlay.remove();
    });

    modal.append(titulo, btnEliminarTodo);

    const contenedor = document.createElement("DIV");
    contenedor.classList.add("modal__contenedor");

    favoritos.forEach((img) => {
      const card = document.createElement("DIV");
      card.classList.add("modal__card");

      const imagen = document.createElement("IMG");
      imagen.src = img.src.large;
      imagen.alt = img.alt || "Foto favorita";

      const caption = document.createElement("P");
      caption.textContent = `Por ${img.photographer}`;

      const btnEliminar = document.createElement("BUTTON");
      btnEliminar.classList.add("modal__eliminar");
      btnEliminar.textContent = "Quitar";

      btnEliminar.addEventListener("click", () => {
        eliminarFavorito(img);
        card.remove();

        if (contenedor.children.length === 0) modalOverlay.remove();
      });

      card.append(imagen, caption, btnEliminar);
      contenedor.append(card);
    });

    modal.append(contenedor);
    modalOverlay.append(modal);
    document.body.append(modalOverlay);

    window.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.remove();
      }
    });
  };

  // Invocacion inicial
  inicializarCategorias();
});
