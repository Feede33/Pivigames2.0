/**
 * Librería de Seguridad - Protección contra XSS, SQL Injection y otras vulnerabilidades
 */

// ============================================
// SANITIZACIÓN DE HTML (Protección XSS)
// ============================================

/**
 * Sanitiza HTML para prevenir XSS
 * Elimina scripts, eventos y otros elementos peligrosos
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  // Crear un elemento temporal para parsear el HTML
  const temp = document.createElement('div');
  temp.textContent = html; // Esto escapa automáticamente el HTML
  
  // Lista de tags permitidos (whitelist)
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'];
  
  // Parsear el HTML de forma segura
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Eliminar todos los scripts
  const scripts = doc.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  // Eliminar todos los event handlers (onclick, onerror, etc.)
  const allElements = doc.querySelectorAll('*');
  allElements.forEach(element => {
    // Eliminar atributos peligrosos
    const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'];
    dangerousAttrs.forEach(attr => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });
    
    // Eliminar javascript: en href y src
    ['href', 'src'].forEach(attr => {
      const value = element.getAttribute(attr);
      if (value && value.toLowerCase().startsWith('javascript:')) {
        element.removeAttribute(attr);
      }
    });
    
    // Eliminar tags no permitidos
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      // Reemplazar con su contenido de texto
      const textNode = document.createTextNode(element.textContent || '');
      element.parentNode?.replaceChild(textNode, element);
    }
  });
  
  return doc.body.innerHTML;
}

/**
 * Sanitiza HTML de Steam (más permisivo pero aún seguro)
 * Permite algunos tags de formato que Steam usa
 */
export function sanitizeSteamHTML(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  // Verificar que estamos en el navegador
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    console.warn('DOMParser not available, returning plain text');
    // En servidor, devolver texto plano sin etiquetas pero sin escapar
    return html.replace(/<[^>]*>/g, '').trim();
  }
  
  try {
    // Steam usa algunos tags específicos que queremos mantener
    const allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'span', 'div', 'table', 'tr', 'td', 'th',
      'b', 'i', 'small', 'a'
    ];
    
    // Clases CSS permitidas de Steam (whitelist)
    const allowedClasses = ['bb_ul', 'bb_ol', 'bb_li'];
    
    // Limpiar el HTML de Steam
    let cleanedHtml = html
      // Eliminar prefijos de texto plano como "MÍNIMO:", "RECOMENDADO:", etc.
      .replace(/^(MÍNIMO|RECOMENDADO|MINIMUM|RECOMMENDED):\s*/i, '')
      // Normalizar <br> y convertir a saltos de línea reales
      .replace(/<br\s*\/?>/gi, '<br>')
      // Eliminar asteriscos extraños
      .replace(/\*:/g, ':')
      .trim();
    
    // Envolver en un div para asegurar que siempre haya un contenedor
    cleanedHtml = `<div>${cleanedHtml}</div>`;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedHtml, 'text/html');
    
    // Verificar que el documento se parseó correctamente
    if (!doc || !doc.body || !doc.body.firstChild) {
      console.warn('Failed to parse HTML, returning plain text');
      return html.replace(/<[^>]*>/g, '').trim();
    }
    
    // Eliminar scripts
    doc.querySelectorAll('script').forEach(el => el.remove());
    
    // Eliminar iframes
    doc.querySelectorAll('iframe').forEach(el => el.remove());
    
    // Eliminar objetos y embeds peligrosos
    doc.querySelectorAll('object, embed').forEach(el => el.remove());
    
    // Limpiar todos los elementos - convertir a array para evitar problemas con live collections
    const elements = Array.from(doc.querySelectorAll('*'));
    
    elements.forEach(element => {
      // Eliminar event handlers (onclick, onerror, etc.)
      Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          element.removeAttribute(attr.name);
        }
      });
      
      // Limpiar javascript: y data: en URLs
      ['href', 'src'].forEach(attr => {
        const value = element.getAttribute(attr);
        if (value) {
          const lowerValue = value.toLowerCase().trim();
          if (lowerValue.startsWith('javascript:') || lowerValue.startsWith('data:')) {
            element.removeAttribute(attr);
          }
        }
      });
      
      // Limpiar clases CSS - solo mantener las permitidas
      if (element.hasAttribute('class')) {
        const classes = element.className.split(' ').filter(cls => 
          allowedClasses.includes(cls.trim())
        );
        if (classes.length > 0) {
          element.className = classes.join(' ');
        } else {
          element.removeAttribute('class');
        }
      }
      
      // Eliminar tags no permitidos - reemplazar con su contenido
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        const parent = element.parentNode;
        if (parent && parent.nodeType === Node.ELEMENT_NODE) {
          // Mover los hijos del elemento al padre antes de eliminarlo
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
          }
          parent.removeChild(element);
        }
      }
    });
    
    // Obtener el contenido del div wrapper
    const wrapper = doc.body.firstChild as HTMLElement;
    let result = wrapper?.innerHTML || '';
    
    // Asegurar que el resultado no esté vacío
    if (!result || result.trim() === '') {
      return html.replace(/<[^>]*>/g, '').trim();
    }
    
    return result;
  } catch (error) {
    console.error('Error sanitizing Steam HTML:', error);
    // En caso de error, devolver texto plano sin etiquetas
    return html.replace(/<[^>]*>/g, '').trim();
  }
}

/**
 * Parsea y formatea los requisitos del sistema de Steam en una lista HTML estructurada
 */
export function formatSteamRequirements(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  try {
    // Primero sanitizar el HTML
    const sanitized = sanitizeSteamHTML(html);
    
    // Extraer texto plano
    const text = sanitized.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Dividir por líneas usando patrones comunes de Steam
    // Steam suele usar patrones como "SO:", "Procesador:", "Memoria:", etc.
    const requirementPattern = /(SO|Procesador|Memoria|Gráficos|DirectX|Red|Almacenamiento|Tarjeta de sonido|Notas adicionales|OS|Processor|Memory|Graphics|Storage|Sound Card|Additional Notes|Network)(\s*\*?):/gi;
    
    // Dividir el texto en partes
    const parts = text.split(requirementPattern).filter(part => part && part.trim());
    
    // Si no hay partes reconocibles, devolver el HTML sanitizado original
    if (parts.length < 2) {
      return sanitized;
    }
    
    // Construir lista HTML
    let listHTML = '<ul class="requirements-list">';
    
    for (let i = 0; i < parts.length; i += 2) {
      const label = parts[i]?.trim();
      const value = parts[i + 1]?.trim();
      
      if (label && value) {
        // Limpiar el valor de asteriscos y espacios extra
        const cleanValue = value.replace(/\*+/g, '').trim();
        listHTML += `<li><strong>${escapeHTML(label)}:</strong> ${escapeHTML(cleanValue)}</li>`;
      }
    }
    
    listHTML += '</ul>';
    
    return listHTML;
  } catch (error) {
    console.error('Error formatting Steam requirements:', error);
    return sanitizeSteamHTML(html);
  }
}

// ============================================
// SANITIZACIÓN DE TEXTO (Protección XSS)
// ============================================

/**
 * Escapa caracteres HTML especiales
 * Convierte < > & " ' en entidades HTML
 */
export function escapeHTML(text: string): string {
  if (!text) return '';
  
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitiza texto de usuario (comentarios, nicknames, etc.)
 * Elimina caracteres peligrosos pero mantiene formato básico
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return '';
  
  // Eliminar caracteres de control
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Limitar longitud
  sanitized = sanitized.slice(0, 10000);
  
  // Escapar HTML
  sanitized = escapeHTML(sanitized);
  
  return sanitized.trim();
}

/**
 * Valida y sanitiza nickname
 */
export function sanitizeNickname(nickname: string): string {
  if (!nickname) return '';
  
  // Solo permitir letras, números, espacios, guiones y guiones bajos
  let sanitized = nickname.replace(/[^a-zA-Z0-9\s\-_]/g, '');
  
  // Limitar longitud (3-30 caracteres)
  sanitized = sanitized.slice(0, 30);
  
  // Eliminar espacios múltiples
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized.trim();
}

// ============================================
// VALIDACIÓN DE INPUTS
// ============================================

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida URL
 */
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Valida nickname
 */
export function isValidNickname(nickname: string): boolean {
  // 3-30 caracteres, solo letras, números, espacios, guiones y guiones bajos
  const nicknameRegex = /^[a-zA-Z0-9\s\-_]{3,30}$/;
  return nicknameRegex.test(nickname);
}

// ============================================
// PROTECCIÓN SQL INJECTION
// ============================================

/**
 * Valida UUID
 * Previene SQL injection en queries que usan IDs
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitiza parámetros de búsqueda
 * Previene SQL injection en búsquedas
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';
  
  // Eliminar caracteres SQL peligrosos
  let sanitized = query.replace(/[';\"\\]/g, '');
  
  // Limitar longitud
  sanitized = sanitized.slice(0, 100);
  
  return sanitized.trim();
}

// ============================================
// RATE LIMITING (Cliente)
// ============================================

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  /**
   * Verifica si una acción está permitida según el rate limit
   * @param key - Identificador único de la acción
   * @param maxRequests - Número máximo de requests
   * @param windowMs - Ventana de tiempo en milisegundos
   */
  isAllowed(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Filtrar requests dentro de la ventana de tiempo
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    // Agregar nuevo request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }
  
  /**
   * Limpia requests antiguos
   */
  cleanup() {
    const now = Date.now();
    this.requests.forEach((requests, key) => {
      const recent = requests.filter(time => now - time < 60000);
      if (recent.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recent);
      }
    });
  }
}

export const rateLimiter = new RateLimiter();

// Limpiar cada minuto
if (typeof window !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 60000);
}

// ============================================
// PROTECCIÓN CSRF
// ============================================

/**
 * Genera un token CSRF
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Almacena token CSRF en sessionStorage
 */
export function setCSRFToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf_token', token);
  }
}

/**
 * Obtiene token CSRF de sessionStorage
 */
export function getCSRFToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('csrf_token');
  }
  return null;
}

// ============================================
// UTILIDADES DE SEGURIDAD
// ============================================

/**
 * Verifica si el contenido es seguro para mostrar
 */
export function isContentSafe(content: string): boolean {
  // Lista de patrones peligrosos
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(content));
}

/**
 * Log de seguridad (solo en desarrollo)
 */
export function securityLog(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔒 [Security]', message, data);
  }
}

/**
 * Reporta intento de ataque (en producción, enviar a servidor)
 */
export function reportSecurityIncident(type: string, details: any): void {
  securityLog(`Security incident: ${type}`, details);
  
  // En producción, enviar a un endpoint de logging
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implementar endpoint de logging
    // fetch('/api/security/report', {
    //   method: 'POST',
    //   body: JSON.stringify({ type, details, timestamp: new Date().toISOString() })
    // });
  }
}
