# breaks

**Your time, under control.**

Herramienta personal para la gestión, consulta y proyección de días y horas de vacaciones y descanso.

🌐 **Sitio web:** [breaks.rk8.dev](https://breaks.rk8.dev)

---

## Descripción

**breaks** es una aplicación web personal diseñada para facilitar el seguimiento de las vacaciones, la consulta del saldo disponible y la planificación de descansos futuros.

El proyecto surge de una necesidad personal y está construido alrededor de mis propios requerimientos de organización y consulta. Busca ofrecer una forma sencilla de conocer los días disponibles, registrar descansos, consultar movimientos anteriores y estimar cómo evolucionará el saldo con el paso del tiempo.

La aplicación permite configurar los parámetros de acumulación de vacaciones, registrar descansos por días u horas y calcular proyecciones a partir de una fecha determinada.

Se trata de una herramienta de uso personal, no de un sistema oficial de gestión de recursos humanos.

## Autoría y uso de inteligencia artificial

Este proyecto fue desarrollado utilizando **inteligencia artificial como herramienta para la generación del código fuente**.

Es importante distinguir entre la autoría de la implementación y las decisiones que orientaron el desarrollo.

Mi participación en el proyecto se ha limitado a las siguientes áreas:

- **Arquitectura:** toma de decisiones sobre el planteamiento y la organización general de la solución.
- **Diseño:** definición de la dirección visual y de la experiencia de usuario.
- **Despliegue:** configuración y puesta en funcionamiento de la aplicación.
- **Definición del proyecto:** identificación de la necesidad personal y de los requerimientos que debía resolver.

**No he escrito personalmente ninguna parte del código fuente hasta el momento.** La implementación ha sido generada mediante inteligencia artificial.

Por transparencia, no atribuyo a mi autoría la escritura del código. Mi contribución se centra en las decisiones de arquitectura, diseño y despliegue, así como en la definición del propósito y los requerimientos de la herramienta.

Este proyecto representa también una experiencia práctica en el uso de inteligencia artificial como herramienta de apoyo para materializar soluciones de software adaptadas a necesidades concretas.

## Funcionalidades

### Consulta de vacaciones

- Visualización del saldo estimado de vacaciones disponibles.
- Representación del saldo en días y equivalencias de horas y minutos.
- Consulta de días consumidos y saldo disponible.
- Visualización de los días que se proyecta acumular hasta el final del año.
- Seguimiento de descansos programados y descontados.

### Proyección de saldo

- Consulta del saldo estimado para una fecha futura.
- Cálculo de la acumulación prevista entre fechas.
- Consideración de los descansos registrados dentro del período consultado.
- Visualización de las cantidades en días y unidades de tiempo equivalentes.

### Registro de descansos

- Registro de descansos por días o por horas.
- Selección de fechas de inicio y finalización.
- Cálculo automático de los días computables dentro de un intervalo.
- Conversión de horas de descanso a fracciones de días.
- Incorporación de notas descriptivas opcionales.
- Vista previa del impacto de un registro sobre el saldo.
- Eliminación de registros existentes y actualización de los cálculos.

### Bitácora

- Listado de movimientos registrados.
- Identificación de registros incluidos en el saldo base, descansos descontados y descansos programados.
- Visualización de fechas, cantidades y notas.
- Exportación de los descansos registrados a una hoja de cálculo (CSV), con rango de fechas configurable o de todo el historial.

### Configuración personalizada

La aplicación permite ajustar los parámetros utilizados para realizar los cálculos:

- Saldo inicial de vacaciones.
- Fecha de referencia del saldo.
- Cantidad de días acumulados por semestre.
- Horas equivalentes a un día de vacaciones.
- Días de la semana que deben contabilizarse como descanso.
- Días descansados durante el año hasta la fecha de referencia.

### Sincronización entre dispositivos

- Exportación del estado completo (configuración y descansos) a un archivo JSON.
- Importación del estado desde un archivo JSON, con vista previa antes de aplicar.
- Al importar, el archivo reemplaza por completo los datos del dispositivo.
- Validación del archivo antes de aplicar cambios; si el archivo no es válido, no se modifica nada.
- Diseño adaptable, con cierre del menú mediante botón, clic fuera o la tecla Escape.

### Experiencia de usuario

- Interfaz en español.
- Diseño adaptable a distintos tamaños de pantalla.
- Tipografía editorial combinada con una tipografía sans serif.
- Transiciones visuales y animaciones numéricas.
- Consideración de la preferencia del sistema operativo por reducir el movimiento.

## Tecnologías utilizadas

| Tecnología | Propósito |
|---|---|
| HTML5 | Estructura de la aplicación. |
| CSS3 | Estilos y presentación visual. |
| JavaScript | Lógica de negocio, cálculos, eventos y actualización de la interfaz. |
| Tailwind CSS | Utilidades de diseño y estilos mediante CDN. |
| Google Fonts | Tipografías Newsreader y Figtree. |
| LocalStorage | Persistencia local de la configuración y los registros. |
| Inteligencia artificial | Generación del código fuente utilizado en la implementación. |

La versión actual es una aplicación web del lado del cliente. No utiliza un backend ni una base de datos remota para almacenar los registros personales.

## Arquitectura general

La aplicación utiliza una arquitectura sencilla basada en tecnologías web nativas.

- **Presentación:** HTML y CSS para la estructura y el diseño de la interfaz.
- **Lógica de aplicación:** JavaScript para gestionar registros, validar entradas, calcular saldos y actualizar las vistas.
- **Persistencia:** `localStorage` para conservar los datos entre sesiones dentro del mismo navegador.
- **Recursos externos:** Tailwind CSS y Google Fonts para los estilos y las tipografías.

Esta estructura evita la necesidad de un proceso de compilación o de un servidor de aplicación para ejecutar la versión actual.

## Estructura del proyecto

```text
breaks/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── README.md
```

- `index.html`: contiene la estructura y los componentes de la interfaz.
- `css/styles.css`: contiene los estilos personalizados.
- `js/app.js`: contiene la lógica de cálculo, gestión de registros y persistencia.
- `README.md`: documentación general del proyecto.

Las rutas anteriores representan la estructura esperada por las referencias utilizadas en el HTML. Si los archivos se encuentran en otras ubicaciones dentro del repositorio, será necesario ajustar la estructura o actualizar las rutas correspondientes.

## Requisitos

- Navegador web moderno con soporte para HTML5, CSS3 y JavaScript.
- Servidor web estático para servir los archivos.
- Conexión a internet para cargar las dependencias y tipografías externas.

No se requiere Node.js, un gestor de paquetes ni un proceso de compilación para ejecutar la implementación actual.

## Instalación y ejecución local

### 1. Obtener el proyecto

Cloná el repositorio o descargá sus archivos en tu equipo.

### 2. Iniciar un servidor local

Si tenés Python instalado, podés ejecutar el siguiente comando desde el directorio raíz:

```bash
python -m http.server 8000
```

### 3. Abrir la aplicación

Accedé desde el navegador a:

```text
http://localhost:8000
```

El servidor debe ejecutarse desde el directorio que contiene `index.html`.

## Configuración inicial

Antes de utilizar los resultados como referencia personal, revisá la opción **Ajustar saldo base**.

Los principales parámetros son:

| Parámetro | Descripción |
|---|---|
| Saldo al corte | Cantidad de días disponibles en la fecha de referencia. |
| Fecha del corte | Fecha desde la que se calcula la evolución del saldo. |
| Días por semestre | Cantidad de días de vacaciones que se acumulan por semestre. |
| Horas por día | Cantidad de horas equivalentes a un día de vacaciones. |
| Días ya descansados | Días consumidos durante el año hasta la fecha de referencia. |
| Días computables | Define si se cuentan los días de lunes a viernes, de lunes a sábado o todos los días. |

La precisión de las proyecciones depende de la configuración inicial y de la corrección de los registros introducidos.

## Persistencia y respaldo

Los datos se guardan en `localStorage`, dentro del navegador utilizado.

Esto implica que:

- Los registros permanecen disponibles en el mismo navegador y perfil mientras se conserven los datos del sitio.
- No existe sincronización automática entre dispositivos.
- No hay cuentas de usuario ni almacenamiento centralizado.
- Borrar los datos del navegador puede provocar la pérdida de los registros guardados.
- La sincronización entre dispositivos se realiza exportando el estado a un archivo JSON y volviéndolo a importar en el otro dispositivo.

Se recomienda realizar exportaciones periódicas y conservar los archivos de respaldo en un lugar seguro.

## Privacidad

La configuración y los movimientos se almacenan localmente en el navegador. La aplicación no implementa por sí misma un servicio remoto para transmitir o sincronizar estos datos.

Sin embargo, la interfaz carga recursos externos para Tailwind CSS y Google Fonts. Por tanto, el funcionamiento actual no es completamente independiente de terceros.

## Alcance y limitaciones

breaks está diseñado para uso personal y sus resultados dependen de las reglas de cálculo implementadas y de los parámetros configurados.

- No sustituye los registros oficiales de vacaciones del empleador.
- No consulta automáticamente sistemas de recursos humanos ni nóminas.
- No verifica por sí mismo las condiciones laborales aplicables.
- No dispone de autenticación, gestión multiusuario ni sincronización en la nube.
- No implementa una base de datos centralizada.
- No debe considerarse un sistema de certificación de saldos laborales.

Las reglas configuradas deben reflejar las condiciones que correspondan al usuario. Los resultados son estimaciones para facilitar el seguimiento y la planificación personal.

## Posibles mejoras futuras

Entre las mejoras que podrían evaluarse posteriormente se encuentran:

- Pruebas automatizadas para validar los cálculos.
- Validaciones adicionales de fechas y cantidades.
- Importación de respaldos JSON.
- Historial de cambios en la configuración.
- Documentación más detallada de las reglas de acumulación.
- Evaluación de una versión instalable como aplicación web progresiva (PWA).
- Mejoras adicionales de accesibilidad.
- Incorporación de pruebas para distintos escenarios de acumulación y consumo.

Estas propuestas no representan funcionalidades implementadas actualmente.

## Licencia

El proyecto no tiene una licencia de distribución especificada en este momento.

La publicación del repositorio o de la aplicación no implica, por sí sola, que el código pueda reutilizarse, modificarse o redistribuirse sin restricciones. La licencia deberá definirse explícitamente si se desea establecer las condiciones de uso del proyecto.

---

*breaks — Una herramienta personal para consultar, organizar y proyectar el tiempo de descanso, construida mediante decisiones propias de arquitectura, diseño y despliegue, con inteligencia artificial como herramienta para la generación del código.*
