/**
 * Browser API polyfills for Node.js environment
 * Required for pdf-parse and pdfjs-dist to work in server-side contexts
 * 
 * This file MUST be imported before any pdf-parse or pdfjs-dist imports
 */

// Ensure we're in a Node.js environment
// Use multiple checks to ensure we get the right global object
interface GlobalWithDOMMatrix {
  DOMMatrix?: unknown;
  DOMParser?: unknown;
}

let globalObj: GlobalWithDOMMatrix;
if (typeof global !== 'undefined') {
  globalObj = global as GlobalWithDOMMatrix;
} else if (typeof globalThis !== 'undefined') {
  globalObj = globalThis as GlobalWithDOMMatrix;
} else if (typeof window !== 'undefined') {
  globalObj = window as unknown as GlobalWithDOMMatrix;
} else {
  globalObj = {} as GlobalWithDOMMatrix;
}

// Polyfill DOMMatrix for Node.js (required by pdfjs-dist)
// This MUST be set up before pdf-parse or pdfjs-dist are imported
if (!globalObj.DOMMatrix) {
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
    
    // Static methods required by TypeScript DOMMatrix interface
    static fromFloat32Array(array32: Float32Array): DOMMatrix {
      const matrix = new DOMMatrix();
      if (array32.length >= 6) {
        matrix.a = array32[0] || 1;
        matrix.b = array32[1] || 0;
        matrix.c = array32[2] || 0;
        matrix.d = array32[3] || 1;
        matrix.e = array32[4] || 0;
        matrix.f = array32[5] || 0;
        matrix.m11 = matrix.a;
        matrix.m12 = matrix.b;
        matrix.m21 = matrix.c;
        matrix.m22 = matrix.d;
        matrix.m41 = matrix.e;
        matrix.m42 = matrix.f;
      }
      return matrix;
    }
    
    static fromFloat64Array(array64: Float64Array): DOMMatrix {
      const matrix = new DOMMatrix();
      if (array64.length >= 6) {
        matrix.a = array64[0] || 1;
        matrix.b = array64[1] || 0;
        matrix.c = array64[2] || 0;
        matrix.d = array64[3] || 1;
        matrix.e = array64[4] || 0;
        matrix.f = array64[5] || 0;
        matrix.m11 = matrix.a;
        matrix.m12 = matrix.b;
        matrix.m21 = matrix.c;
        matrix.m22 = matrix.d;
        matrix.m41 = matrix.e;
        matrix.m42 = matrix.f;
      }
      return matrix;
    }
    
    static fromMatrix(other?: { a?: number; b?: number; c?: number; d?: number; e?: number; f?: number }): DOMMatrix {
      const matrix = new DOMMatrix();
      if (other) {
        matrix.a = other.a ?? 1;
        matrix.b = other.b ?? 0;
        matrix.c = other.c ?? 0;
        matrix.d = other.d ?? 1;
        matrix.e = other.e ?? 0;
        matrix.f = other.f ?? 0;
        matrix.m11 = matrix.a;
        matrix.m12 = matrix.b;
        matrix.m21 = matrix.c;
        matrix.m22 = matrix.d;
        matrix.m41 = matrix.e;
        matrix.m42 = matrix.f;
      }
      return matrix;
    }
  };
  
  // Set on both global and globalThis for maximum compatibility
  globalObj.DOMMatrix = DOMMatrixPolyfill;
  if (typeof global !== 'undefined') {
    (global as GlobalWithDOMMatrix).DOMMatrix = DOMMatrixPolyfill;
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as GlobalWithDOMMatrix).DOMMatrix = DOMMatrixPolyfill;
  }
  
  console.log("✅ DOMMatrix polyfill installed");
}

// Polyfill other DOM APIs that might be needed
if (!globalObj.DOMParser) {
  const DOMParserPolyfill = class DOMParser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    parseFromString(_str: string, _type: string): Document {
      // Minimal implementation - return empty document
      // Parameters are required by the DOMParser interface but not used in this minimal polyfill
      return {} as Document;
    }
  };
  
  globalObj.DOMParser = DOMParserPolyfill;
  if (typeof global !== 'undefined') {
    (global as GlobalWithDOMMatrix).DOMParser = DOMParserPolyfill;
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as GlobalWithDOMMatrix).DOMParser = DOMParserPolyfill;
  }
}

