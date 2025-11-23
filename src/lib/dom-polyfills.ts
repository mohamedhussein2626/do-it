/**
 * Browser API polyfills for Node.js environment
 * Required for pdf-parse and pdfjs-dist to work in server-side contexts
 * 
 * This file MUST be imported before any pdf-parse or pdfjs-dist imports
 */

// Ensure we're in a Node.js environment
const globalObj = typeof global !== 'undefined' ? global : typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : {};

// Polyfill DOMMatrix for Node.js (required by pdfjs-dist)
if (!(globalObj as any).DOMMatrix) {
  // Minimal DOMMatrix polyfill
  const DOMMatrixPolyfill = class DOMMatrix {
    a: number = 1;
    b: number = 0;
    c: number = 0;
    d: number = 1;
    e: number = 0;
    f: number = 0;
    m11: number = 1;
    m12: number = 0;
    m21: number = 0;
    m22: number = 1;
    m41: number = 0;
    m42: number = 0;
    
    constructor(init?: string | number[]) {
      if (typeof init === 'string') {
        // Parse matrix string (simplified)
        const values = init.match(/matrix\(([^)]+)\)/)?.[1]?.split(/\s*,\s*/);
        if (values && values.length >= 6) {
          this.a = parseFloat(values[0]) || 1;
          this.b = parseFloat(values[1]) || 0;
          this.c = parseFloat(values[2]) || 0;
          this.d = parseFloat(values[3]) || 1;
          this.e = parseFloat(values[4]) || 0;
          this.f = parseFloat(values[5]) || 0;
          this.m11 = this.a;
          this.m12 = this.b;
          this.m21 = this.c;
          this.m22 = this.d;
          this.m41 = this.e;
          this.m42 = this.f;
        }
      } else if (Array.isArray(init) && init.length >= 6) {
        this.a = init[0] || 1;
        this.b = init[1] || 0;
        this.c = init[2] || 0;
        this.d = init[3] || 1;
        this.e = init[4] || 0;
        this.f = init[5] || 0;
        this.m11 = this.a;
        this.m12 = this.b;
        this.m21 = this.c;
        this.m22 = this.d;
        this.m41 = this.e;
        this.m42 = this.f;
      }
    }
    
    multiply(other: DOMMatrix): DOMMatrix {
      const result = new DOMMatrix();
      result.a = this.a * other.a + this.c * other.b;
      result.b = this.b * other.a + this.d * other.b;
      result.c = this.a * other.c + this.c * other.d;
      result.d = this.b * other.c + this.d * other.d;
      result.e = this.a * other.e + this.c * other.f + this.e;
      result.f = this.b * other.e + this.d * other.f + this.f;
      result.m11 = result.a;
      result.m12 = result.b;
      result.m21 = result.c;
      result.m22 = result.d;
      result.m41 = result.e;
      result.m42 = result.f;
      return result;
    }
    
    translate(x: number, y: number): DOMMatrix {
      return this.multiply(new DOMMatrix([1, 0, 0, 1, x, y]));
    }
    
    scale(x: number, y?: number): DOMMatrix {
      return this.multiply(new DOMMatrix([x, 0, 0, y || x, 0, 0]));
    }
    
    rotate(angle: number): DOMMatrix {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return this.multiply(new DOMMatrix([cos, sin, -sin, cos, 0, 0]));
    }
  };
  
  // Set on both global and globalThis for maximum compatibility
  (globalObj as any).DOMMatrix = DOMMatrixPolyfill;
  if (typeof global !== 'undefined') {
    (global as any).DOMMatrix = DOMMatrixPolyfill;
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).DOMMatrix = DOMMatrixPolyfill;
  }
  
  console.log("✅ DOMMatrix polyfill installed");
}

// Polyfill other DOM APIs that might be needed
if (!(globalObj as any).DOMParser) {
  const DOMParserPolyfill = class DOMParser {
    parseFromString(str: string, type: string): Document {
      // Minimal implementation - return empty document
      return {} as Document;
    }
  };
  
  (globalObj as any).DOMParser = DOMParserPolyfill;
  if (typeof global !== 'undefined') {
    (global as any).DOMParser = DOMParserPolyfill;
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).DOMParser = DOMParserPolyfill;
  }
}

