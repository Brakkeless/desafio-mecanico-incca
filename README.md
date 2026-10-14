# Desafío Mecánico INCCA · Corferias 2026

Aplicación web responsive con diez desafíos mecánicos interactivos, puntuación educativa, ranking centralizado, modo de proyección y panel administrativo.

## Auditoría del prototipo recibido

El ZIP original contenía un único `index.html` y un README. Se conservaron sus contenidos científicamente válidos, la progresión de temas, la política de no restar puntos y el uso exclusivo de alias. Se corrigieron estas limitaciones:

- la clasificación solo vivía en `localStorage` y no se compartía entre celulares;
- el puntaje se calculaba y aceptaba completamente en el navegador;
- casi todos los niveles eran preguntas de selección con ilustraciones emoji, no minijuegos;
- no existían panel administrativo, estadísticas, moderación, exportación ni vista de proyección;
- no había pruebas automatizadas, arquitectura modular ni preparación real para Vercel/Supabase;
- faltaban controles de sonido, reducción de movimiento e instrucciones independientes.

## Ejecutar localmente

Requiere Node.js 20 o posterior.

```bash
npm install
npm run dev
```

Sin las variables del servidor, la aplicación cambia de forma explícita a **modo demostración** y guarda la clasificación en el navegador. Para simular las funciones Vercel localmente, use `npx vercel dev` después de vincular el proyecto.

## Configurar Supabase

1. Cree un proyecto en Supabase.
2. Abra **SQL Editor**, copie y ejecute `supabase/schema.sql`.
3. En **Project Settings > API**, copie la URL y la clave `service_role`.
4. Genere dos secretos largos y aleatorios para `RESULT_SIGNING_SECRET` y `ADMIN_TOKEN`.
5. Configure las variables indicadas en `.env.example` únicamente en Vercel. La clave `service_role` y los secretos nunca deben llevar el prefijo `VITE_`.

RLS está habilitado y no se concede acceso a `anon` ni `authenticated`. Todo acceso a resultados pasa por funciones de servidor. Cada partida recibe un UUID y un token HMAC; `run_id` es único, por lo que no puede enviarse dos veces. El servidor verifica duración, diez respuestas únicas y recalcula el puntaje desde respuestas canónicas.

## Publicar en Vercel

1. Suba este directorio a un repositorio Git.
2. Importe el repositorio en Vercel como proyecto Vite.
3. Configure las variables de `.env.example` para Production/Preview.
4. Use `npm run build` como Build Command y `dist` como Output Directory.
5. Despliegue y pruebe `/`, `/ranking-display` y `/admin`.
6. Solo cuando Vercel entregue una URL HTTPS definitiva, genere un QR que apunte a esa URL. Este repositorio no incluye un QR ficticio ni uno dirigido a localhost.

## GitHub Pages

El proyecto también puede publicarse gratis en GitHub Pages. En ese alojamiento funciona automáticamente en **modo demostración**, porque Pages sirve archivos estáticos y no ejecuta las funciones seguras de `api/`. El juego completo, los diez niveles y el ranking local funcionan; para el ranking compartido y el panel administrativo se debe desplegar el mismo repositorio en Vercel y configurar Supabase.

La vista para proyectar el ranking en GitHub Pages se abre con `?view=ranking`. En Vercel también está disponible como `/ranking-display`.

Los enlaces del programa y admisiones permanecen ocultos hasta definir `VITE_PROGRAM_URL` y `VITE_ADMISSIONS_URL` con enlaces institucionales verificados.

## Reglas

- Bases por nivel: 100 (fácil), 140 (intermedia), 190 (avanzada), 250 (final).
- Una respuesta correcta recibe hasta 30 puntos de bonificación; pierde solo un punto cada tres segundos y nunca queda por debajo de su base.
- Una respuesta incorrecta da 0, nunca resta y permite avanzar.
- Ranking: puntaje descendente, duración ascendente y fecha ascendente.
- La vista `/ranking-display` se actualiza cada 15 segundos.

## Panel administrativo

Visite `/admin` e introduzca `ADMIN_TOKEN`. El token se conserva solo en `sessionStorage`. El panel muestra participantes, promedios y precisión por nivel, permite exportar CSV, activar demo en el dispositivo y reiniciar el ranking con confirmación.

## Validación

```bash
npm test
npm run build
```

La suite verifica los diez niveles, respuestas canónicas, ausencia de puntajes negativos, límite de bonificación, rechazo de partidas incompletas/duplicadas y cálculo total. Antes del evento se recomienda una pasada física en iPhone Safari, Android Chrome y Edge con conexión móvil real, además de una prueba de carga del proyecto Supabase elegido.

## Privacidad y operación

Se almacenan alias, puntaje, duración, fecha y respuestas por nivel; no se solicitan datos de contacto. Defina con la Universidad el aviso de privacidad, el periodo de retención y el responsable del tratamiento antes de producción. Rote `ADMIN_TOKEN` y la clave service role si se exponen. Para moderar un alias se puede marcar `moderated=true` en Supabase; desaparece inmediatamente del ranking público.
