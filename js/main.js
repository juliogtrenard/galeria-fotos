document.addEventListener("DOMContentLoaded", () => {
  // Variables
  const galeria = document.querySelector(".galeria");
  let coleccionesFiltradas = [];
  let categoriasRandom = [];
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
});
