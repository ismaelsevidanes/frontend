# PITCH DREAMERS

#### Curso Escolar 2024-2025
#### Autor: [Ismael Sevidanes Del Moral](https://github.com/ismaelsevidanes/)
#### Tutor: [Antonio Gabriel González Casado](https://github.com/prof-antonio-gabriel)
#### Tutor del Proyecto: Mónica María Marcos Gutiérrez
#### Fecha de Inicio: 01-03-2025
#### Fecha de Finalización: xx-x-2025

## Breve descripción del proyecto

Este proyecto trata de una aplicación web sobre el funcionamiento de poder reservar y alquilar campos de fútbol de la localidad de Sevilla principalmente, ya sea campos de fútbol 7 como fútbol 11, en campos memorables y de césped artificial como natural, de equipos de pueblos o incluso campos de categorías mayores, donde sus prestaciones son mayores.

## Objetivo de la aplicación
- **¿Qué va a hacer la aplicación?**  
    Pitch Dreamers es una aplicación web que permite reservar y alquilar campos de fútbol de forma sencilla y online.
    
- **¿Cuál es su atractivo principal?**  
    Las principales características atractivas son: operar de forma online, la facilidad de uso, intuitivo para todos los usuarios y clara navegación. Poder conocer a personas y jugar con ellos.
 
- **¿Qué problema concreto va a resolver?**  
    El problema que resuelve la aplicación es la dificultad de reservar campos de fútbol de diversas ciudades o pueblos, teniendo que tener contacto con algún gerente de allí o reservar de forma presencial a cierta hora.
      
- **¿Qué necesidad va a cubrir?**  
    Las necesidades que cubre son poder usar la aplicación de forma sencilla y de forma online para poder jugar al fútbol con tus amigos o con personas que también reserven en el mismo campo y hora que tu reserva.

---

## Objetivo del Frontend
El objetivo del frontend es proporcionar una experiencia de usuario intuitiva, moderna y eficiente para la reserva y alquiler de campos de fútbol, integrándose con el backend para la gestión de usuarios, reservas, pagos y campos.

---

# Pitch Dreamers (Frontend)

Este proyecto corresponde al frontend de Pitch Dreamers, desarrollado con React y TypeScript. Aquí se detallan los pasos de instalación, estructura y funcionalidades implementadas.

## Requisitos
- Node.js (versión más reciente recomendada)

## Instalación
1. Clona este repositorio y navega a la carpeta frontend:
   ```bash
   git clone https://github.com/ismaelsevidanes/frontend.git
   cd frontend
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue
1. Compila el proyecto para producción:
   ```bash
   npm run build
   ```
2. Sirve los archivos estáticos generados en la carpeta `dist` con un servidor como `serve` o `nginx`.

---

# Guía de instalación del frontend (Pitch Dreamers)

Esta guía explica cómo instalar y ejecutar el frontend de Pitch Dreamers en un PC nuevo, desde cero.

## 1. Instalar Node.js
- Descargar e instalar la última versión LTS desde: [https://nodejs.org/](https://nodejs.org/)
- Verificar instalación:
  ```bash
  node -v
  npm -v
  ```

## 2. Clonar el repositorio y preparar el frontend
- Clonar el repositorio:
  ```bash
  git clone https://github.com/ismaelsevidanes/frontend.git
  cd frontend
  ```
- Instalar dependencias:
  ```bash
  npm install
  ```

## 3. Arrancar el frontend
- Iniciar el servidor de desarrollo:
  ```bash
  npm run dev
  ```
- El frontend estará disponible en: [http://localhost:5173](http://localhost:5173)

## 4. Conexión con el backend
- Asegúrate de que el backend esté instalado y corriendo en [http://localhost:3000](http://localhost:3000)
- Si necesitas instalar el backend, sigue la guía en el archivo [backend/README.md](../backend/README.md) o en el repositorio: [https://github.com/ismaelsevidanes/backend](https://github.com/ismaelsevidanes/backend)

---

## Estructura del Proyecto
- **src/features**: Funcionalidades principales del proyecto.
- **src/shared**: Componentes y utilidades reutilizables.
- **src/pages**: Páginas principales de la aplicación.

## Funcionalidades Implementadas
- Estructura inicial con React y TypeScript.
- Navegación y páginas principales.
- Componentes reutilizables y utilidades compartidas.

---

## Autor y Créditos
- Autor: [Ismael Sevidanes Del Moral](https://github.com/ismaelsevidanes/)
- Tutor: [Antonio Gabriel González Casado](https://github.com/prof-antonio-gabriel)
- Tutor del Proyecto: Mónica María Marcos Gutiérrez
