import { HttpInterceptorFn } from '@angular/common/http';
import { HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<any>> => {
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

  // Detecta si la URL es de tu API (ajusta hosts/prefijos según tu entorno)
  const API_HOSTS = ['localhost:8080'];
  let isApiRequest = false;
  try {
    const u = new URL(req.url, 'http://localhost'); // base para URLs relativas
    isApiRequest = API_HOSTS.includes(u.host) || u.pathname.startsWith('/api');
  } catch {
    // Fallback si req.url es muy relativa
    isApiRequest = req.url.startsWith('/api') || req.url.startsWith('/municipalities/');
  }

  // Rutas públicas que sí deben pasar sin token
  const publicPaths = ['/auth/login']; // agrega aquí otras públicas si las tienes (p.ej. '/auth/refresh')
  let requestPath = '';
  try {
    requestPath = new URL(req.url, 'http://localhost').pathname;
  } catch { requestPath = req.url; }
  const isPublic = publicPaths.some(p => requestPath === p);

  // ⛔️ En SSR: NO envíes llamadas a la API (evita 401 en server)
  if (!isBrowser && isApiRequest && !isPublic) {
    return EMPTY;
  }

  // En browser: si no hay token y es una ruta protegida, NO enviar
  const token = isBrowser ? localStorage.getItem('token') : null;
  if (isBrowser && isApiRequest && !isPublic && !token) {
    return EMPTY;
  }

  // ---------- Agregar headers (Authorization + Content-Type) ----------
  // Helpers seguros para SSR
  const isInstanceOf = (v: any, Type: any) => typeof Type !== 'undefined' && v instanceof Type;

  const hasContentType = req.headers.has('Content-Type');
  const hasBodyMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
  const isFormData = isInstanceOf(req.body, (globalThis as any).FormData);
  const isBlob = isInstanceOf(req.body, (globalThis as any).Blob);
  const isArrayBuffer = isInstanceOf(req.body, (globalThis as any).ArrayBuffer);

  const shouldAddJsonCT =
    isApiRequest &&
    hasBodyMethod &&
    !hasContentType &&
    !isFormData &&
    !isBlob &&
    !isArrayBuffer;

  const setHeaders: Record<string, string> = {};

  // ⬅️ CAMBIO CLAVE: solo agregar Bearer si es API **y no es pública**
  if (isBrowser && token && isApiRequest && !isPublic) {
    setHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (shouldAddJsonCT) {
    setHeaders['Content-Type'] = 'application/json';
  }

  if (Object.keys(setHeaders).length > 0) {
    const modifiedReq = req.clone({ setHeaders });
    return next(modifiedReq);
  }

  // Todo lo demás pasa normal
  return next(req);
};
