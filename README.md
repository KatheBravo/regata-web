## Historias de Usuario

### Épica 1: Autenticación y roles

#### HU-01 – Registro de jugador
**Como** visitante del sistema  
**quiero** registrarme como jugador con nombre, correo y contraseña  
**para** poder iniciar sesión y participar en carreras.

**Criterios de aceptación**
- Si el email no está registrado, el sistema crea un `Usuario` con rol por defecto `PLAYER` y `activo = true`.
- Si el email ya existe, el sistema devuelve error de conflicto (409).
- Al registrarme correctamente, el backend genera un JWT de acceso y lo devuelve al frontend.

---

#### HU-02 – Inicio de sesión
**Como** jugador registrado (`PLAYER`)  
**quiero** iniciar sesión con mi correo y contraseña  
**para** acceder al lobby y a mis recursos (barcos, partidas, etc.).

**Criterios de aceptación**
- Si las credenciales son correctas y el usuario está activo, el sistema devuelve un JWT válido.
- Si el usuario está inactivo, el sistema devuelve error 403.
- Si el email o la contraseña son incorrectos, devuelve error 401.
- Se registra una entrada en `AuthSession` con token, fecha de creación y expiración.

---

#### HU-03 – Acceso según rol
**Como** usuario autenticado (`ADMIN` o `PLAYER`)  
**quiero** que el sistema reconozca mi rol a partir del JWT  
**para** aplicar restricciones de acceso a los distintos endpoints.

**Criterios de aceptación**
- El JWT incluye el `sub` (id del usuario), el email y la lista de `roles`.
- Las rutas de autenticación (`/api/auth/**`) y JWKS (`/oauth2/jwks`) son públicas.
- El resto de rutas `/api/**` requieren JWT válido.
- Internamente se mapean los roles a `ROLE_ADMIN` y `ROLE_PLAYER`.

---

### Épica 2: Gestión de usuarios (ADMIN)

#### HU-04 – CRUD de usuarios
**Como** administrador (`ADMIN`)  
**quiero** crear, consultar, actualizar y eliminar usuarios  
**para** gestionar los jugadores y otros administradores del sistema.

**Criterios de aceptación**
- Puedo listar usuarios filtrando por rol, estado activo e email parcial.
- Puedo crear usuarios indicando nombre, email, contraseña, rol y estado `activo`.
- El email no puede repetirse; si existe, devuelve error 409.
- Puedo actualizar usuarios por PUT (todos los campos) o PATCH (campos parciales).
- Si el usuario tiene referencias (ej. barcos, partidas), al intentar eliminarlo se devuelve error de conflicto.

---

### Épica 3: Modelos de barco (ADMIN)

#### HU-05 – Alta de modelos de barco
**Como** administrador (`ADMIN`)  
**quiero** registrar modelos de barcos con atributos técnicos  
**para** definir las capacidades máximas de los barcos que se usarán en las carreras.

**Criterios de aceptación**
- Cada modelo tiene nombre, color, descripción, `velMax`, `acelMax` y `maniobrabilidad`.
- El nombre del modelo no puede repetirse; si ya existe, devuelve error 409.
- Si no se indican límites, se usan los valores por defecto definidos en la entidad.
- El modelo queda disponible para asociarlo a barcos.

---

#### HU-06 – Edición y eliminación de modelos
**Como** administrador (`ADMIN`)  
**quiero** modificar o eliminar modelos de barco  
**para** ajustar las reglas o eliminar modelos obsoletos.

**Criterios de aceptación**
- Puedo actualizar todos los campos por PUT o solo algunos por PATCH.
- No puedo cambiar el nombre a uno ya existente (error 409).
- Si un modelo está siendo usado por algún barco, al eliminarlo se devuelve error de conflicto.

---

#### HU-07 – Búsqueda de modelos
**Como** administrador (`ADMIN`)  
**quiero** listar y filtrar modelos por nombre  
**para** encontrarlos rápidamente al configurarlos.

**Criterios de aceptación**
- `/api/modelos` sin parámetros devuelve todos los modelos.
- `/api/modelos?q=texto` devuelve solo los modelos cuyo nombre contenga el texto, sin distinción de mayúsculas/minúsculas.

---

### Épica 4: Barcos de los jugadores

#### HU-08 – Crear barco para un jugador
**Como** administrador (`ADMIN`)  
**quiero** crear barcos asociados a un jugador y a un modelo  
**para** que cada jugador tenga barcos disponibles para participar en partidas.

**Criterios de aceptación**
- Debo indicar `usuarioId`, `modeloId` y nombre del barco.
- Si el usuario o el modelo no existen, el sistema devuelve error 422.
- El barco se crea con posición y velocidad iniciales (por defecto 0,0).
- El barco queda asociado al propietario (`Usuario`) y al `ModeloBarco`.

---

#### HU-09 – Consultar barcos
**Como** administrador (`ADMIN`)  
**quiero** consultar la lista de barcos, opcionalmente filtrando por jugador  
**para** revisar y administrar las opciones de cada usuario.

**Criterios de aceptación**
- `/api/barcos` devuelve todos los barcos.
- `/api/barcos?usuarioId=ID` devuelve solo los barcos del usuario indicado.

---

#### HU-10 – Actualizar barco
**Como** administrador (`ADMIN`)  
**quiero** actualizar la información de un barco existente  
**para** corregir datos o cambiar el modelo/asignación de propietario.

**Criterios de aceptación**
- PUT exige todos los campos requeridos del barco.
- PATCH permite enviar solo los campos a modificar (nombre, dueño, modelo, posición, velocidad).
- Si el nuevo usuario o modelo no existen, devuelve error 422.
- El sistema valida que el modelo sea utilizable según las reglas de visibilidad del modelo (público/propio).

---

#### HU-11 – Eliminar barco
**Como** administrador (`ADMIN`)  
**quiero** eliminar un barco  
**para** depurar recursos que ya no se utilizarán.

**Criterios de aceptación**
- Si el barco no existe, devuelve 404.
- Si se elimina correctamente, devuelve 204 sin contenido.

---

### Épica 5: Gestión de partidas

#### HU-12 – Crear partida (lobby)
**Como** usuario autenticado (ADMIN o PLAYER, según política de negocio)  
**quiero** crear una nueva partida asociada a un mapa  
**para** que otros jugadores puedan unirse desde el lobby.

**Criterios de aceptación**
- Si no envío `mapaId`, se usa el primer mapa disponible en la base de datos.
- Puedo indicar un nombre y un número máximo de jugadores; si no, se asignan valores por defecto.
- La partida se crea en estado `WAITING` y sin host asignado inicialmente.

---

#### HU-13 – Listar partidas
**Como** jugador (`PLAYER`)  
**quiero** ver un listado de partidas  
**para** elegir a cuál unirme.

**Criterios de aceptación**
- `/api/partidas` devuelve todas las partidas con: id, nombre, estado, maxJugadores, host (si existe), ganador (si existe) y layout del mapa.
- El listado se usa para construir el lobby en el frontend.

---

#### HU-14 – Unirse a una partida y seleccionar barco
**Como** jugador (`PLAYER`)  
**quiero** unirme a una partida con uno de mis barcos  
**para** participar en la carrera.

**Criterios de aceptación**
- Solo puedo unirme si la partida está en estado `WAITING`.
- La partida no puede estar llena; si `participantes >= maxJugadores`, devuelve error de conflicto.
- Debo enviar `usuarioId` y `barcoId`:
  - El barco debe existir.
  - El barco debe pertenecer al usuario que se une.
  - No puede haber dos participantes con el mismo usuario ni el mismo barco en la misma partida.
- El sistema asigna una posición inicial en una celda `P` del mapa y velocidad (0,0).
- Si soy el primer participante y la partida no tiene host, paso a ser el host de la partida.

---

#### HU-15 – Iniciar la carrera
**Como** jugador host de la partida  
**quiero** iniciar la carrera cuando haya suficientes jugadores  
**para** comenzar el juego por turnos.

**Criterios de aceptación**
- Solo puede iniciarse si la partida está en estado `WAITING`.
- Debe haber al menos dos participantes; si no, devuelve error de precondición.
- Al iniciar, la partida pasa a estado `RUNNING` y se registra la fecha de inicio.

---

#### HU-16 – Consultar estado de una partida
**Como** jugador (`PLAYER`)  
**quiero** consultar el estado actual de una partida  
**para** ver la posición y velocidad de todos los barcos y quién va ganando.

**Criterios de aceptación**
- `/api/partidas/{id}/estado` devuelve:
  - Layout del mapa como lista de strings.
  - Lista de participantes con posición, velocidad, estado (vivo / llegó a meta) y orden.
  - Datos del host y, si existe, del ganador.
- El frontend utiliza esta información para pintar el mapa ASCII y la tabla lateral de participantes.

---

### Épica 6: Movimiento y reglas de juego

#### HU-17 – Elegir aceleración en el turno
**Como** jugador participante en una carrera  
**quiero** decidir, en cada turno, la aceleración de mi barco en los ejes X e Y  
**para** controlar su trayectoria hacia la meta respetando el modelo de movimiento.

**Criterios de aceptación**
- En cada turno envío un `TurnoRequest` con `participanteId`, `accX` y `accY`.
- Para cada componente, la aceleración por turno está acotada por `acelMax` del modelo (`|accX| <= acelMax` y `|accY| <= acelMax`).
- La velocidad nueva se calcula como `velNueva = velAnterior + acc`, limitada por `velMax` en cada eje.
- La posición nueva se calcula como `posNueva = posActual + velNueva`.

---

#### HU-18 – Colisiones, fuera de mapa y meta
**Como** jugador  
**quiero** que el sistema aplique las reglas de colisión y meta  
**para** que la carrera siga las normas definidas por el mapa.

**Criterios de aceptación**
- Si la nueva posición queda fuera del mapa, el barco se marca como `vivo = false` (eliminado).
- Si la nueva posición cae en una celda `X` (pared/obstáculo), el barco se marca como `vivo = false`.
- Si la nueva posición cae en una celda `M` o `m` (meta), el barco se marca con `llegoMeta = true`, la partida cambia a estado `FINISHED` y se registra el ganador.

---

#### HU-19 – Finalización de la partida
**Como** jugador  
**quiero** que la partida termine cuando alguien cruza la meta  
**para** conocer el resultado final de la carrera.

**Criterios de aceptación**
- Cuando un participante llega a meta, la partida pasa a `FINISHED` y se almacena el `ganador`.
- Se guarda la fecha de finalización.
- Una vez en estado `FINISHED`, no se aceptan más movimientos (`turno`) para esa partida.

---

### Épica 7: Seguridad y JWKS

#### HU-20 – Exponer JWKS para validación externa
**Como** sistema externo  
**quiero** obtener la clave pública del servidor  
**para** poder validar los JWT emitidos por el backend.

**Criterios de aceptación**
- El endpoint `/oauth2/jwks` devuelve un JSON Web Key Set con la clave pública usada para firmar los tokens.
- La respuesta incluye el `kid` y el algoritmo `RS256`, de forma compatible con validación estándar de JWT.
