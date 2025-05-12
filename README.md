# Pitch Dreamers - Frontend

Este es el frontend del proyecto Pitch Dreamers, desarrollado con React, TypeScript. A continuación, se describen los pasos de instalación, despliegue y estructura del proyecto.

---

## Requisitos

- Node.js (versión más reciente recomendada)

- React

- Typescript

---

## Instalación

1. Clona este repositorio:
   ```bash
   git clone
   ```
2. Navega a la carpeta del proyecto:
   ```bash
   cd frontend
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

---

## Despliegue

1. Compila el proyecto para producción:
   ```bash
   npm run build
   ```
2. Sirve los archivos estáticos generados en la carpeta `dist` con un servidor como `serve` o `nginx`.

---

## Estructura del Proyecto

- **`src/features`**: Contiene las funcionalidades principales del proyecto.
- **`src/shared`**: Componentes y utilidades reutilizables.
- **`src/pages`**: Páginas principales de la aplicación.
- **`src/assets`**: Recursos estáticos como imágenes y estilos globales.

---

## Funcionalidades Implementadas

1. **Estructura inicial:**
   - Configuración de React y TypeScript.
   - Estructura basada en Screaming Architecture.
2. **Componentes reutilizables:**
   - Modal, paginación y otros componentes compartidos.
3. **Estilos:**
   - Uso de CSS modular para estilos específicos de componentes.
4. **Páginas principales:**
   - Inicio, registro, inicio de sesión y dashboard administrativo.

---

## Notas adicionales

- Asegúrate de que el backend esté corriendo para probar la integración completa.
