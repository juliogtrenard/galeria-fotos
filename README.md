# Galeria de fotos

Página web que hace uso de la API de Pexels para mostrar una galería de fotos a partir de colecciones aleatorias.

## Funcionalidades

- Categorías aleatorias.
- Imágenes según la categoría seleccionada.
- Búsqueda de imágenes.
- Filtro por orientación.
- Favoritos.

## API Pexels

Endpoints utilizados en el proyecto:

#### Obtener colecciones

```
  GET https://api.pexels.com/v1/collections/featured?page=${pagina}&per_page=${total}
```

| Parameter | Type     | Description          |
| :-------- | :------- | :------------------- |
| `pagina`  | `number` | El número de página  |
| `total`   | `number` | Total de colecciones |

#### Obtener fotos de una colección

```
  GET https://api.pexels.com/v1/collections/${idColeccion}?type=photos
```

| Parameter     | Type     | Description        |
| :------------ | :------- | :----------------- |
| `idColeccion` | `string` | ID de la colección |

#### Obtener los objetos de una categoría

```
  GET https://api.pexels.com/v1/search?query=${categoria}&per_page=78
```

| Parameter   | Type     | Description        |
| :---------- | :------- | :----------------- |
| `categoria` | `string` | Categoria a buscar |

#### Obtener las páginas de una categoría

```
  GET https://api.pexels.com/v1/search?page=${pagina}&per_page=78&query=${categoria}
```

| Parameter   | Type     | Description      |
| :---------- | :------- | :--------------- |
| `pagina`    | `number` | Número de página |
| `categoria` | `string` | Categoria a usar |

## Autores

- [@juliogtrenard](https://github.com/juliogtrenard)
- [@sedagame01](https://github.com/sedagame01)
