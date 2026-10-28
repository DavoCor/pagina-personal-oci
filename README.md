# Taller 3. Mi página en una VM de OCI

**Estudiante:** David Correa
**Materia:** Infraestructura TI y Cloud Computing (2026-2)
**Página:** http://davidcorrea-oci.duckdns.org

## Qué hice

Creé una máquina virtual nueva en Oracle Cloud usando la red del taller 1, instalé Nginx, publiqué una página de repaso para el parcial y le puse un subdominio gratis de DuckDNS.

| Dato | Valor |
| --- | --- |
| Compartimento | `Infraestructura_y_Cloud` |
| Usuario | `estudiante-web` |
| Red y subred (del taller 1) | `red-infraestructura` / `subred-web` |
| Máquina | `servidor-personal`, Oracle Linux 9, `VM.Standard.E5.Flex`, 1 OCPU, 16 GB |
| IP pública | `157.137.218.28` |
| Subdominio | `davidcorrea-oci.duckdns.org` |

## La página

Es una página para repasar los talleres 1, 2 y 3. Está en la carpeta `sitio/`.

- **Secciones:** Inicio, Resumen de los talleres, Opción múltiple, Verdadero o falso y Tarjetas de repaso.
- **Imágenes:** cuatro SVG en `sitio/img/` (nube, diagrama de la red, iniciales e ícono de la pestaña).
- **CSS para celular:** en `css/estilos.css`, con `@media` las tarjetas pasan a una columna y aparece un botón de menú.
- **JavaScript:** en `js/app.js`, preguntas con puntaje, verdadero o falso, tarjetas que se voltean y modo oscuro.

---

## Fase 1. Subir la página a GitHub

### Paso 1.1. Crear el repositorio y subir los archivos

Desde la terminal de mi computador, dentro de la carpeta `pagina-personal-oci`:

```bash
gh repo create DavoCor/pagina-personal-oci --public
git init -b main
git add .gitignore README.md sitio
git commit -m "Agregar página personal y guía del taller 3"
git remote add origin https://github.com/DavoCor/pagina-personal-oci.git
git push -u origin main
```

El repositorio es público para que la máquina lo pueda descargar sin contraseña. El `.gitignore` evita que se suban las llaves (`*.key`, `*.pem`).

![Repositorio en GitHub](capturas/01-repositorio.png)

---

## Fase 2. Crear la máquina virtual

### Paso 2.1. Revisar la red del taller 1

Entré a la consola con el usuario `estudiante-web` y abrí **Networking > Virtual cloud networks > red-infraestructura**. La subred `subred-web` seguía ahí y la lista de seguridad tenía las reglas de entrada para los puertos 22 (SSH) y 80 (HTTP).

![Reglas de la lista de seguridad](capturas/02-red-existente.png)

### Paso 2.2. Elegir imagen y forma

En **Compute > Instances > Create instance**:

| Campo | Valor |
| --- | --- |
| Name | `servidor-personal` |
| Compartment | `Infraestructura_y_Cloud` |
| Image | Oracle Linux 9 |
| Shape | `VM.Standard.E5.Flex` |
| OCPU / Memory | 1 / 16 GB |

![Imagen y forma](capturas/03-imagen-forma.png)

### Paso 2.3. Elegir la red

| Campo | Valor |
| --- | --- |
| Virtual cloud network | `red-infraestructura` |
| Subnet | `subred-web` |
| Assign a public IPv4 address | Activado |

Así quedó en la pestaña **Networking** de la máquina:

![Red de la máquina](capturas/04-red-instancia.png)

### Paso 2.4. Generar las llaves y crear la máquina

Elegí **Generate a key pair for me**, descargué las dos llaves y renombré la privada como `llave-personal.key`. Esa llave no se sube a GitHub. Luego pulsé **Create** y esperé a que la máquina quedara en **Running**.

![Llaves descargadas](capturas/05-llaves.png)

![Máquina en Running con su IP](capturas/06-instancia-running.png)

---

## Fase 3. Instalar Nginx y publicar la página

### Paso 3.1. Conectarme por SSH desde Cloud Shell

Abrí **Cloud Shell** (con **Public Network**), subí la llave con **Upload** y le cambié los permisos, porque SSH no acepta llaves que otros pueden leer:

```bash
ls -l ~/llave-personal.key
chmod 600 ~/llave-personal.key
```

![Llave en Cloud Shell](capturas/07-cloudshell-llave.png)

```bash
ssh -i ~/llave-personal.key opc@157.137.218.28
whoami
```

`whoami` respondió `opc`, el usuario que trae Oracle Linux.

![Conexión por SSH](capturas/08-ssh-whoami.png)

### Paso 3.2. Instalar Nginx y Git

```bash
sudo dnf install -y nginx git
sudo systemctl enable --now nginx
systemctl is-active nginx
```

`enable --now` arranca Nginx y hace que vuelva a arrancar solo si la máquina se reinicia. El último comando dijo `active`.

![Instalación terminada](capturas/09-instalar-nginx.png)

![Nginx activo](capturas/10-nginx-activo.png)

### Paso 3.3. Descargar la página desde GitHub

```bash
git clone --depth 1 https://github.com/DavoCor/pagina-personal-oci.git ~/pagina-personal
ls -R ~/pagina-personal/sitio
```

![git clone](capturas/11-git-clone.png)

### Paso 3.4. Copiar la página a la carpeta de Nginx

```bash
git -C ~/pagina-personal archive --format=tar HEAD:sitio | sudo tar -x -C /usr/share/nginx/html
sudo restorecon -Rv /usr/share/nginx/html
ls -l /usr/share/nginx/html
```

`git archive` saca solo la carpeta `sitio` y `tar` la copia en `/usr/share/nginx/html`. `restorecon` es por SELinux: sin eso Nginx no puede leer los archivos y sale error 403.

![Archivos en la carpeta de Nginx](capturas/12-publicar-archivos.png)

### Paso 3.5. Abrir el firewall y probar

La lista de seguridad de OCI ya deja pasar el puerto 80, pero Oracle Linux tiene su propio firewall:

```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
curl -I http://localhost/
```

Salió `success` dos veces y `HTTP/1.1 200 OK`.

![Firewall y curl](capturas/13-firewall-curl.png)

### Paso 3.6. Abrir la página con la IP

Abrí `http://157.137.218.28` en el navegador. Después cambié el contenido por la página de repaso y la volví a publicar con los comandos del paso 5.1, así que la captura es de la versión final.

![Página con la IP](capturas/14-pagina-ip.png)

---

## Fase 4. Subdominio con DuckDNS

### Paso 4.1. Crear el subdominio

Entré a `duckdns.org` con mi cuenta, creé `davidcorrea-oci` y en **current ip** puse `157.137.218.28`. El token de DuckDNS no sale en la captura porque funciona como contraseña.

![DuckDNS](capturas/15-duckdns.png)

### Paso 4.2. Revisar que el nombre apunte a la máquina

Dentro de la máquina:

```bash
getent hosts davidcorrea-oci.duckdns.org
```

Respondió con `157.137.218.28`.

![getent hosts](capturas/16-dns.png)

### Paso 4.3. Configurar Nginx para el subdominio

Creé un archivo de configuración para el subdominio, con su propio registro de visitas:

```bash
sudo tee /etc/nginx/conf.d/pagina-personal.conf > /dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name davidcorrea-oci.duckdns.org;

    root /usr/share/nginx/html;
    index index.html;

    access_log /var/log/nginx/pagina-personal.access.log;

    location / {
        try_files $uri $uri/ =404;
    }
}
EOF
```

```bash
cat /etc/nginx/conf.d/pagina-personal.conf
sudo nginx -t
sudo systemctl reload nginx
```

`server_name` es el subdominio, `root` la carpeta de la página y `access_log` el archivo donde quedan las visitas. `nginx -t` dijo `syntax is ok` y `test is successful`.

![Configuración de Nginx](capturas/17-nginx-config.png)

### Paso 4.4. Probar desde fuera de la máquina

1. Salí de la máquina con `exit` y, desde Cloud Shell, corrí:

```bash
curl -I http://davidcorrea-oci.duckdns.org
```

Respondió `HTTP/1.1 200 OK` y `Server: nginx`.

![curl desde Cloud Shell](capturas/18-curl-subdominio.png)

2. En el celular, sin wifi y con datos móviles, abrí `http://davidcorrea-oci.duckdns.org`.

![Página en el celular](capturas/19-pagina-celular.png)

3. Probé el JavaScript respondiendo preguntas: una mal (sale en rojo) y una bien (sale en verde).

![Preguntas respondidas](capturas/20-funcion-js.png)

### Paso 4.5. Ver las visitas en el registro

Volví a entrar por SSH y busqué las visitas del celular y de Cloud Shell:

```bash
sudo grep -E "iPhone|curl" /var/log/nginx/pagina-personal.access.log | tail -n 5
```

Las últimas cinco líneas son del celular: cada una tiene la IP, la hora y el archivo que pidió.

![Registro de visitas](capturas/21-access-log.png)

---

## Fase 5. Cambios y cierre

### Paso 5.1. Publicar cambios de la página

Cuando cambio algo en GitHub, lo actualizo en la máquina con:

```bash
git -C ~/pagina-personal pull
git -C ~/pagina-personal archive --format=tar HEAD:sitio | sudo tar -x -C /usr/share/nginx/html
sudo restorecon -Rv /usr/share/nginx/html
```

La vez que cambié a la página de repaso también borré tres imágenes viejas que ya no se usaban:

```bash
sudo rm -f /usr/share/nginx/html/img/{fisica,precalculo,python}.svg
```

### Paso 5.2. Después de la calificación

La máquina queda encendida hasta que califiquen el taller. Después la elimino con **Terminate**, borrando también el disco de arranque.

---

## Problemas que tuve

- **`Permission denied` al hacer `ssh`:** corrí el `ssh` cuando ya estaba dentro de la máquina, y la llave está en Cloud Shell. Si la línea dice `opc@servidor-personal`, ya estoy dentro y no hace falta conectarse otra vez.
- **La página se veía desordenada con la IP:** el navegador tenía guardados los estilos de la versión anterior. Se arregló cerrando la ventana de incógnito y abriendo una nueva.
