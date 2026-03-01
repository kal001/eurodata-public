## Primeros pasos

### Cómo empezar

Después de crear la cuenta e iniciar sesión, lo primero es añadir una cuenta bancaria. Ve al menú **Cuentas** y elige entre conectar un banco directamente (cuenta automática) o importar un extracto en PDF, Excel o CSV (cuenta manual).

La conexión automática se hace mediante proveedores certificados de acceso a datos bancarios (GoCardless y Enable Banking). Tus credenciales bancarias nunca pasan por los servidores de Eurodata: la autenticación se realiza directamente en la web del banco.

### Navegación principal

La barra superior da acceso a las cuatro secciones principales:

| Icono | Sección | Descripción |
|-------|---------|-------------|
| 🧾 | **Transacciones** | Listar, filtrar, categorizar y gestionar tus transacciones |
| 🏦 | **Cuentas** | Conectar bancos, importar extractos, gestionar cuentas |
| 📈 | **Análisis** | Gráficos de ingresos, gastos y tendencias |
| 🔄 | **Recurrentes** | Gestionar pagos e ingresos periódicos |

### Idioma y tema

En la esquina superior derecha puedes:

- **Cambiar el idioma** con el icono del globo — 8 idiomas: Inglés, Portugués, Español, Francés, Alemán, Italiano, Holandés, Polaco.
- **Cambiar entre tema claro y oscuro** con el icono luna/sol.

---

## Transacciones

Es la sección principal de la aplicación. Muestra todas las transacciones importadas, con herramientas para filtrar, categorizar y organizar.

### Tarjetas de cuentas (parte superior)

Arriba aparecen tarjetas por cada cuenta bancaria. Cada tarjeta muestra:

- **Logo del banco** (o icono genérico)
- **Tipo de cuenta:** icono de documento = cuenta manual (importada por archivo); icono de enlace = cuenta automática (conectada al banco)
- **Nombre de la cuenta** con su color
- **Nombre de la institución** y proveedor de datos
- **Saldo actual** y fecha de última actualización (si "Mostrar saldos" está activo en el perfil)

**Casilla en cada tarjeta:** marcar o desmarcar filtra las transacciones mostradas. Por defecto todas las cuentas están seleccionadas.

### Botones de acción (esquina superior derecha)

| Icono | Acción |
|-------|--------|
| ❓ | Abre la ayuda contextual de esta sección |
| 🔄 | **Actualizar transacciones** — importa nuevas transacciones en todas las cuentas automáticas. Se desactiva si se alcanza el límite |
| ⚖️ | **Actualizar saldos** — actualiza el saldo de todas las cuentas (solo si "Mostrar saldos" está activo) |

### Barra de la lista

| Elemento | Descripción |
|----------|-------------|
| **Seleccionar todo** (casilla) | Activa la selección múltiple; aparece "Eliminar seleccionadas" |
| 🗑️ **Eliminar seleccionadas** | Elimina las transacciones seleccionadas (solo con selección activa) |
| **Buscar** | Filtra por descripción o nombre de cuenta |
| **Filas por página** | 10, 20 o 50 transacciones por página |
| **Todas / Solo nuevas** | Mostrar todas o solo las marcadas como nuevas (no revisadas) |
| **Categorías** | Filtro por categorías; incluye "Sin categoría". Botones "Todas" / "Ninguna" |
| **Etiquetas** | Filtro por etiquetas; incluye "Sin etiqueta" |
| 📄 **Exportar CSV** | Exporta a CSV (compatible con Excel). También JSON y OFX |

### Elementos de cada fila

| Elemento | Descripción |
|----------|-------------|
| **Casilla** (izquierda) | Selecciona para acciones en masa |
| **Incluir en Análisis** (casilla) | Si está marcada, cuenta en gráficos y totales. Desmarca para excluir de estadísticas |
| **Descripción** | Texto de la transacción. Debajo, nombre de cuenta y color |
| **Etiqueta "Nueva"** | En transacciones recién importadas. Clic en **×** para marcar como revisada |
| **"Pendiente"** | La transacción aún no está procesada por el banco |
| **Categoría** (desplegable) | Asignada por IA. Clic para cambiar; el sistema aprende de tus correcciones |
| 🔔 **Recurrente** | Configura un pago recurrente desde esta transacción; alertas al ocurrir o al faltar |
| 💬 **Comentario** | Añade o edita una nota. El icono se rellena si hay comentario |
| 🗑️ **Eliminar** (rojo) | Elimina la transacción. Pide confirmación |
| **Etiquetas** | Etiquetas como badges. Clic para abrir el panel |
| **Importe** | Valor (derecha). Positivo = recibido; negativo = pagado |
| **Fecha de cargo** | Fecha en el extracto |
| **Fecha de valor** | Fecha original de la operación |
| ▲▼ **Flechas de fecha** | Ajusta la fecha ±1 día |

### Paginación

Debajo: "Mostrando X a Y de Z" y flechas anterior/siguiente.

---

## Cuentas

La sección **Cuentas** permite gestionar todas tus cuentas bancarias: conectar bancos, importar extractos o gestionar las existentes.

### Cuentas existentes

Cada cuenta en una tarjeta con:

- **Logo del banco** (clic en manuales para actualizar imagen)
- **Tipo:** documento (manual) o enlace (automática)
- **Nombre editable** — clic en 💾 para guardar
- **Institución** y proveedor
- **Saldo** (si está activo en el perfil)

**Botones por cuenta:**

| Icono | Acción |
|-------|--------|
| 🔔 **Alertas** | Ver y editar alertas (ej. saldo por debajo de X€) |
| 🔌 **Reconectar** | Reautenticar cuando expire (suele ser cada 90 días). Icono rojo cuando hace falta |
| 🔄 **Obtener transacciones** | Importa nuevas transacciones (automáticas) o abre el asistente de importación (manuales) |
| 🗑️ **Eliminar** (rojo) | Elimina la cuenta y todas sus transacciones. Irreversible |

### Conectar un banco nuevo

1. Selecciona el **país** en el desplegable
2. Busca el banco por nombre
3. Clic en el banco — redirección al sitio del banco para autorizar
4. Tras autorizar, la cuenta aparece y se importan las transacciones

La conexión dura unos 90 días; al expirar, clic en **Reconectar**.

### Importar extracto (cuentas manuales)

Clic en **Importar extracto** (icono de importar) o **Obtener transacciones** en una cuenta manual:

1. **Subir archivo** — PDF, Excel (.xlsx) o CSV
2. **Analizar** — la IA extrae las transacciones
3. **Revisar** — ver transacciones y opcionalmente invertir signos
4. **Asignar** — elegir cuenta existente o crear nueva

---

## Análisis

La sección **Análisis** muestra gráficos y tablas de ingresos, gastos y tendencias del período seleccionado.

### Panel de filtros

| Filtro | Descripción |
|--------|-------------|
| **Período** | Mes actual, Último mes, Año hasta hoy, Últimos 12 meses o Personalizado |
| **Cuentas** | Una o más cuentas a incluir |
| **Etiquetas** | Filtrar por etiquetas; "Sin etiqueta" |
| **Categorías** | Categorías a incluir; "Todas" / "Ninguna" |

**Configuraciones guardadas:**

| Icono | Acción |
|-------|--------|
| 📂 **Cargar config** | Cargar configuración guardada |
| 💾 **Guardar config** | Guardar la actual con un nombre; puede ser predeterminada |
| ⭐ **Definir predeterminada** | La actual se abre en la próxima visita |

### Exportar PDF

Botón 📄 **Exportar PDF** (arriba derecha) para imprimir o guardar la página como PDF.

### Tarjetas de análisis

Todas expandibles/recolgables. Los datos reflejan los filtros aplicados.

#### Recibidos

Tabla de transacciones de ingreso: fecha, descripción, cuenta, importe (verde). Resumen al pasar el ratón. Total por moneda al pie.

#### Pagados

Igual para gastos, importes en rojo.

#### Por categoría

Gráfico de barras horizontales por categoría. Verde ingresos, rojo gastos. En **Mes actual**, barra discontinua con estimación a fin de mes.

#### Totales

Tres cajas: **Total recibido** (verde), **Total pagado** (rojo), **Diferencia** (verde/rojo).

#### Saldo acumulado

Gráfico de línea del saldo en el período. En **Mes actual**, línea discontinua con proyección.

#### Comparación mensual

Tabla: Mes | Recibido | Pagado | Diferencia, con totales. En mes actual, fila en cursiva con estimación y exportación CSV.

---

## Recurrentes

La sección **Recurrentes** ayuda a seguir pagos e ingresos periódicos: alquiler, suscripciones, nómina, seguros, etc.

### Detección automática de sugerencias

El botón 🔍 **Ejecutar sugerencias** (arriba derecha) analiza los últimos 6 meses y detecta patrones recurrentes con al menos 60% de confianza.

### Vista lista

**Filtros:** Cuenta, Estado (Todos / Activo / Pausado / Sugerido), Ordenar por, Buscar.

**+ Crear recurrente manual** — abre el formulario.

#### Panel de sugerencias

| Botón | Acción |
|-------|--------|
| ✅ **Confirmar** | Acepta y añade el recurrente |
| ✏️ **Editar y confirmar** | Abre el formulario antes de confirmar |
| ⏭️ **Saltar** | Siguiente sugerencia |
| ✖️ **Descartar** | Rechaza |

#### Tabla de recurrentes

Columnas: **Nombre** | **Frecuencia** | **Próxima fecha** | **Importe** | **Estado** | **Cuenta** | **Acciones**

**Iconos de estado:** ✅ Activo, ⏸️ Pausado, 🕐 Sugerido, ✖️ Descartado.

**Acciones:** Confirmar, Editar, Pausar/Reanudar, Eliminar.

**Próxima fecha:** "Hoy", "Mañana" o "En N días".

### Vista calendario

Botón **Calendario**. Navegación por mes; cada día con marcadores: verde (ocurrido), rojo (falta), color por defecto (previsto). Barra de resumen; clic en marcador para detalles.

### Crear / editar recurrente

| Campo | Descripción |
|-------|-------------|
| **Nombre** | Ej. "Alquiler", "Netflix", "Nómina" |
| **Cuenta** | Cuenta asociada (solo creación) |
| **Patrón de descripción** | Texto típico en la descripción (para coincidencia) |
| **Frecuencia** | Semanal / Quincenal / Mensual / Trimestral / Anual |
| **Día ancla** | Día del mes (1–31) |
| **Importe esperado** | Valor habitual (negativo gastos; vacío si variable) |
| **Importe nominal** | Valor de referencia si es variable |
| **Tolerancia de días** | Margen antes/después del día ancla |
| **Tolerancia de importe** | Margen % o absoluto |
| **Alertar al ocurrir** | Notificación cuando se detecta la transacción |
| **Alertar al faltar** | Notificación si no se detecta en la tolerancia |

---

## Bot de Telegram

Eurodata puede enviar alertas y responder consultas por **Telegram** con el bot **@bancos_alerts_bot**.

### Cómo configurar

1. Ve a **Perfil** (menú superior derecho → Mi perfil)
2. En Telegram, clic en **Vincular Telegram** — enlace al bot **@bancos_alerts_bot**
3. Abre Telegram, envía un mensaje al bot y luego el **código de verificación** de la app (válido 10 min)
4. Tras vincular, activa **Alertas Telegram** en preferencias

También puedes buscar **@bancos_alerts_bot** en Telegram.

### Comandos

| Comando | Descripción |
|---------|-------------|
| `/transactions [N]` | Últimas N transacciones (por defecto 10; máx 100) |
| `/next [N]` | Próximas N recurrentes (por defecto 10) |
| `/balances` | Saldo por cuenta y total |
| `/month [nombre config]` | Totales del mes: recibido, pagado, diferencia |
| `/year [nombre config]` | Totales del año hasta hoy |

---

## Suscripción

### Período de prueba gratuito

La aplicación incluye una prueba gratuita con todas las funciones.

### Suscripción activa

Después hace falta una suscripción activa para:
- Mantener conexiones automáticas a bancos
- Recibir actualizaciones diarias de transacciones y saldos

Sin suscripción, las cuentas manuales (importación de archivos) siguen funcionando.

### Gestionar suscripción

**Mi perfil** → pestaña **Suscripción**:
- Ver estado actual
- Suscribirse o renovar
- Añadir cuentas automáticas extra (el plan base incluye 2)

---

## Soporte

Si tienes dudas o encuentras un problema:

- 🐛 **Reportar error** — abre un issue en el repositorio público
- 💡 **Sugerir funcionalidad** — comparte tus ideas
- 💬 **GitHub Discussions** — [github.com/kal001/eurodata-public/discussions](https://github.com/kal001/eurodata-public/discussions)

---
