import { HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req,
  next
): Observable<HttpEvent<unknown>> => {
  const isBrowser =
    typeof window !== 'undefined' && typeof localStorage !== 'undefined';

  // Consideramos "API" todo lo que pegue a /api/
  const url = req.url;
  const isApiRequest = url.includes('/api/');

  // Endpoints públicos (sin Authorization)
  const isPublicAuth =
    url.includes('/api/auth/login') || url.includes('/api/auth/register');

  // Si no es navegador, o no es request a la API, o es público -> pasa tal cual
  if (!isBrowser || !isApiRequest || isPublicAuth) {
    return next(req);
  }

  // En navegador: intentar leer token
  const token = localStorage.getItem('token');

  // Si no hay token, dejamos pasar la request (el backend devolverá 401 si toca)
  if (!token) {
    return next(req);
  }

  // Clonamos la request y agregamos Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
