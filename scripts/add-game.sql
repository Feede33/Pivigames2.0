-- Script para agregar juegos a la base de datos
-- Solo necesitas el Steam App ID y opcionalmente un link de descarga

-- Ejemplo 1: Cyberpunk 2077
INSERT INTO games (steam_appid, links) 
VALUES ('1091500', 'https://playpaste.net/?v=jagI');

-- Ejemplo 2: Elden Ring
INSERT INTO games (steam_appid, links) 
VALUES ('1245620', 'https://tu-link-de-descarga.com');

-- Ejemplo 3: Red Dead Redemption 2
INSERT INTO games (steam_appid, links) 
VALUES ('1174180', 'https://tu-link-de-descarga.com');

-- Ejemplo 4: GTA V
INSERT INTO games (steam_appid, links) 
VALUES ('271590', 'https://tu-link-de-descarga.com');

-- Ejemplo 5: The Witcher 3
INSERT INTO games (steam_appid, links) 
VALUES ('292030', 'https://tu-link-de-descarga.com');

-- Ejemplo 6: Hogwarts Legacy
INSERT INTO games (steam_appid, links) 
VALUES ('990080', 'https://tu-link-de-descarga.com');

-- Ejemplo 7: Baldur's Gate 3
INSERT INTO games (steam_appid, links) 
VALUES ('1086940', 'https://tu-link-de-descarga.com');

-- Ejemplo 8: Starfield
INSERT INTO games (steam_appid, links) 
VALUES ('1716740', 'https://tu-link-de-descarga.com');

-- Ejemplo 9: Spider-Man Remastered
INSERT INTO games (steam_appid, links) 
VALUES ('1817070', 'https://tu-link-de-descarga.com');

-- Ejemplo 10: God of War
INSERT INTO games (steam_appid, links) 
VALUES ('1593500', 'https://tu-link-de-descarga.com');

-- NOTA: Toda la información del juego (título, descripción, imágenes, requisitos, etc.)
-- se obtiene automáticamente de la API de Steam usando el steam_appid
