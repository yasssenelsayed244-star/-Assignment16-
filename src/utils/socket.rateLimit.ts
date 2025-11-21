import { Socket } from "socket.io";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// Map للاحتفاظ بعدد الطلبات لكل socket
const rateLimitMap = new Map<string, RateLimitStore>();

// ==================== RATE LIMIT CONFIG ====================
const RATE_LIMIT = {
  MAX_REQUESTS: 10,        // عدد الطلبات المسموح بها
  WINDOW_MS: 60000         // خلال دقيقة واحدة
};

// ==================== RATE LIMITER MIDDLEWARE ====================
export const createRateLimiter = (maxRequests: number = RATE_LIMIT.MAX_REQUESTS, windowMs: number = RATE_LIMIT.WINDOW_MS) => {
  return (socket: Socket, next: Function) => {
    const socketId = socket.id;
    const now = Date.now();
    
    let rateLimitData = rateLimitMap.get(socketId);
    
    if (!rateLimitData) {
      // أول طلب من هذا الـ socket
      rateLimitMap.set(socketId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    // التحقق من انتهاء الـ window
    if (now > rateLimitData.resetTime) {
      // إعادة تعيين العداد
      rateLimitMap.set(socketId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    // زيادة العداد
    rateLimitData.count++;
    
    // التحقق من تجاوز الحد المسموح
    if (rateLimitData.count > maxRequests) {
      const error = new Error(`Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds`);
      return next(error);
    }
    
    next();
  };
};

// ==================== EVENT RATE LIMITER ====================
export const createEventRateLimiter = (eventName: string, maxRequests: number, windowMs: number) => {
  const eventRateLimitMap = new Map<string, RateLimitStore>();
  
  return (socket: Socket, args: any[], next: Function) => {
    const socketId = socket.id;
    const now = Date.now();
    
    let rateLimitData = eventRateLimitMap.get(socketId);
    
    if (!rateLimitData || now > rateLimitData.resetTime) {
      eventRateLimitMap.set(socketId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    rateLimitData.count++;
    
    if (rateLimitData.count > maxRequests) {
      socket.emit("rateLimitError", {
        event: eventName,
        message: `Too many ${eventName} events. Please slow down.`
      });
      return; // لا نستدعي next() لمنع تنفيذ الـ event
    }
    
    next();
  };
};

// ==================== CLEANUP ====================
// تنظيف الـ rate limit data للـ sockets المنقطعة
export const cleanupRateLimitData = (socketId: string) => {
  rateLimitMap.delete(socketId);
};

// تنظيف دوري للبيانات القديمة
setInterval(() => {
  const now = Date.now();
  for (const [socketId, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(socketId);
    }
  }
}, 60000); // كل دقيقة