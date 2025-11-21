## Link de video

https://youtu.be/v2xxJOuGRfo

## Historias de Usuario

### Épica 1: Autenticación y roles

#### HU-01 – Registro de jugador
**Como** visitante del sistema  
**quiero** registrarme como jugador con nombre, correo y contraseña  
**para** poder iniciar sesión y participar en carreras.

**Criterios de aceptación**
- Si el correo no está registrado, se crea un usuario con rol por defecto `PLAYER` y estado activo.
- Si el correo ya existe, el sistema informa que el correo está en uso.
- Tras registrarme correctamente, recibo un token de acceso para usar el sistema.

---

#### HU-02 – Inicio de sesión
**Como** jugador registrado (`PLAYER`)  
**quiero** iniciar sesión con mi correo y contraseña  
**para** acceder al lobby y a mis recursos (barcos, partidas, etc.).

**Criterios de aceptación**
- Si las credenciales son correctas y el usuario está activo, se genera y devuelve un token de acceso válido.
- Si la cuenta está desactivada, el sistema informa que el usuario no puede iniciar sesión.
- Si el correo o la contraseña son incorrectos, el sistema indica que las credenciales no son válidas.
- Se registra una sesión de autenticación con token, fecha de creación y expiración.

---

#### HU-03 – Reconocimiento de rol
**Como** usuario autenticado (`ADMIN` o `PLAYER`)  
**quiero** que el sistema reconozca mi rol a partir del token  
**para** aplicar las restricciones de acceso según mi perfil.

**Criterios de aceptación**
- El token emitido incluye el identificador del usuario, su correo y la lista de roles.
- El sistema traduce los roles a autoridades internas (`ROLE_ADMIN`, `ROLE_PLAYER`).
- La lógica de negocio utiliza el rol para permitir o denegar operaciones sensibles (gestión de usuarios, modelos, etc.).

---

### Épica 2: Gestión de usuarios (ADMIN)

#### HU-04 – CRUD de usuarios
**Como** administrador (`ADMIN`)  
**quiero** crear, consultar, actualizar y eliminar usuarios  
**para** gestionar los jugadores y otros administradores del sistema.

**Criterios de aceptación**
- Se puede obtener el detalle de un usuario por su identificador.
- Se puede crear un usuario indicando nombre, email, contraseña, rol y estado activo/inactivo.
- El sistema impide registrar dos usuarios con el mismo correo.
- Se puede actualizar la información de un usuario de forma completa o parcial (nombre, correo, contraseña, rol, activo).
- Si un usuario tiene registros dependientes (por ejemplo barcos o partidas), el sistema impide eliminarlo e informa del conflicto.

---

### Épica 3: Modelos de barco (ADMIN)

#### HU-05 – Alta de modelos de barco
**Como** administrador (`ADMIN`)  
**quiero** registrar modelos de barcos con atributos técnicos  
**para** definir las capacidades máximas de los barcos que se usarán en las carreras.

**Criterios de aceptación**
- Cada modelo incluye nombre, color, descripción, velocidad máxima (`velMax`), aceleración máxima (`acelMax`) y maniobrabilidad.
- El nombre de modelo debe ser único; si ya existe, el sistema informa del conflicto.
- Si no se indican ciertos límites, se usan los valores por defecto definidos en el modelo de dominio.
- Los modelos creados quedan disponibles para ser asociados a barcos.

---

#### HU-06 – Edición y eliminación de modelos
**Como** administrador (`ADMIN`)  
**quiero** modificar o eliminar modelos de barco  
**para** ajustar las reglas o eliminar modelos obsoletos.

**Criterios de aceptación**
- Se permite actualizar todos o algunos atributos de un modelo existente.
- No se puede cambiar el nombre de un modelo a uno que ya esté registrado.
- Si un modelo está siendo utilizado por al menos un barco, el sistema impide eliminarlo e informa del motivo.

---

#### HU-07 – Búsqueda de modelos
**Como** administrador (`ADMIN`)  
**quiero** listar y filtrar modelos por nombre  
**para** encontrarlos rápidamente al configurarlos.

**Criterios de aceptación**
- Se puede obtener el listado completo de modelos registrados.
- Se puede filtrar la lista por un texto de búsqueda contenido en el nombre, sin distinguir mayúsculas y minúsculas.

---

### Épica 4: Barcos de los jugadores

#### HU-08 – Crear barco para un jugador
**Como** administrador (`ADMIN`)  
**quiero** crear barcos asociados a un jugador y a un modelo  
**para** que cada jugador tenga barcos disponibles para participar en partidas.

**Criterios de aceptación**
- Para crear un barco se requiere un jugador existente, un modelo existente y un nombre de barco.
- Si el jugador o el modelo no existen, el sistema rechaza la operación indicando el error.
- El barco se crea asociado al propietario indicado y al modelo seleccionado.
- La posición y velocidad iniciales del barco quedan registradas (por defecto en cero si no se especifican).

---

#### HU-09 – Consultar barcos
**Como** administrador (`ADMIN`)  
**quiero** consultar la lista de barcos, opcionalmente filtrando por jugador  
**para** revisar y administrar las opciones de cada usuario.

**Criterios de aceptación**
- Se puede obtener el listado de todos los barcos del sistema.
- Es posible limitar el listado únicamente a los barcos de un jugador concreto.
- Para cada barco se muestra su nombre, propietario, modelo y estado de posición/velocidad.

---

#### HU-10 – Actualizar barco
**Como** administrador (`ADMIN`)  
**quiero** actualizar la información de un barco existente  
**para** corregir datos o cambiar el modelo/asignación de propietario.

**Criterios de aceptación**
- Se puede modificar el nombre, el usuario propietario, el modelo asociado, la posición y la velocidad del barco.
- Si se cambia el propietario o el modelo a valores inexistentes, el sistema rechaza la operación.
- El sistema valida que el modelo elegido sea utilizable por el propietario según las reglas de visibilidad (público/propio).

---

#### HU-11 – Eliminar barco
**Como** administrador (`ADMIN`)  
**quiero** eliminar un barco  
**para** depurar recursos que ya no se utilizarán.

**Criterios de aceptación**
- Si el barco no existe, el sistema informa que no se encontró.
- Si el barco existe y no tiene restricciones externas, se elimina correctamente.
- Tras la eliminación, el barco deja de aparecer en listados y consultas.

---

### Épica 5: Gestión de partidas

#### HU-12 – Crear partida (lobby)
**Como** usuario autenticado (`ADMIN` o `PLAYER`, según reglas de negocio)  
**quiero** crear una nueva partida asociada a un mapa  
**para** que otros jugadores puedan unirse desde el lobby.

**Criterios de aceptación**
- Se puede especificar un nombre para la partida y un número máximo de jugadores.
- Si no se indica un mapa concreto, se utiliza el primer mapa disponible en el sistema.
- La partida se crea en estado `WAITING` y sin host asignado inicialmente.

---

#### HU-13 – Listar partidas
**Como** jugador (`PLAYER`)  
**quiero** ver un listado de partidas  
**para** elegir a cuál unirme.

**Criterios de aceptación**
- El sistema devuelve un listado con el identificador, nombre, estado, número máximo de jugadores y mapa asociado de cada partida.
- Para partidas que ya tienen host o ganador, se muestra la información correspondiente.
- El listado es utilizable por el frontend para construir el lobby.

---

#### HU-14 – Unirse a una partida y seleccionar barco
**Como** jugador (`PLAYER`)  
**quiero** unirme a una partida seleccionando uno de mis barcos  
**para** participar en la carrera.

**Criterios de aceptación**
- Solo es posible unirse a partidas en estado `WAITING`.
- La partida no debe haber alcanzado su número máximo de jugadores.
- El barco elegido debe existir y pertenecer al jugador que se une.
- Un mismo jugador no puede participar dos veces en la misma partida.
- Un mismo barco no puede ser usado por dos participantes en la misma partida.
- El sistema asigna al participante una posición inicial en una celda de salida (`P`) y velocidad inicial cero.
- Si es el primer participante y la partida no tiene host, el usuario que se une queda marcado como host.

---

#### HU-15 – Iniciar la carrera
**Como** jugador host de la partida  
**quiero** iniciar la carrera cuando haya suficientes jugadores  
**para** comenzar el juego por turnos.

**Criterios de aceptación**
- Solo se puede iniciar una partida que siga en estado `WAITING`.
- Debe haber al menos dos participantes para que la carrera comience.
- Al iniciar, la partida pasa al estado `RUNNING` y se registra la fecha de inicio.

---

#### HU-16 – Consultar estado de una partida
**Como** jugador (`PLAYER`)  
**quiero** consultar el estado actual de una partida  
**para** ver la posición y velocidad de todos los barcos y quién va ganando.

**Criterios de aceptación**
- El estado incluye el layout del mapa como matriz de caracteres.
- Se devuelven todos los participantes con su posición, velocidad, si están vivos y si han llegado a meta.
- Se incluye información del host y, en caso de existir, del ganador.

---

### Épica 6: Movimiento y reglas de juego

#### HU-17 – Elegir aceleración en el turno
**Como** jugador participante en una carrera  
**quiero** decidir, en cada turno, la aceleración de mi barco en los ejes X e Y  
**para** controlar su trayectoria hacia la meta respetando el modelo de movimiento.

**Criterios de aceptación**
- Para cada turno se indican dos componentes de aceleración (`accX`, `accY`).
- Cada componente de aceleración está limitado por el valor `acelMax` del modelo de barco.
- La nueva velocidad se calcula sumando la aceleración a la velocidad actual y limitando cada componente por `velMax`.
- La nueva posición del barco se calcula sumando la nueva velocidad a la posición actual.

---

#### HU-18 – Colisiones, salida del mapa y meta
**Como** jugador  
**quiero** que el sistema aplique las reglas de colisión y llegada a meta  
**para** que la carrera siga las normas definidas por el mapa.

**Criterios de aceptación**
- Si la nueva posición queda fuera de los límites del mapa, el participante se marca como no vivo.
- Si la nueva posición corresponde a una celda de pared (`X`), el participante se marca como no vivo.
- Si la nueva posición corresponde a una celda de meta (`M` o `m`), el participante se marca como que llegó a meta y se registra como candidato a ganador.

---

#### HU-19 – Finalización de la partida
**Como** jugador  
**quiero** que la partida termine cuando algún barco cruza la meta  
**para** conocer el resultado final de la carrera.

**Criterios de aceptación**
- Cuando un participante llega a la meta, la partida pasa al estado `FINISHED`.
- Se registra qué participante es el ganador y la fecha de finalización.
- Mientras la partida está en `FINISHED`, no se aceptan nuevos movimientos para ninguno de los participantes.

---

### Épica 7: Seguridad y claves públicas

#### HU-20 – Exponer clave pública para validación de tokens
**Como** sistema externo  
**quiero** obtener la clave pública del servidor  
**para** poder validar los tokens emitidos por el backend.

**Criterios de aceptación**
- La aplicación expone su clave pública en formato de conjunto de claves (JWKS).
- La clave publicada incluye identificador de clave (`kid`) y algoritmo de firma utilizado.
- Los tokens generados por el backend pueden ser validados correctamente usando esta clave pública.
