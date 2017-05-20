/* tslint:disable */

declare global {
  interface System {
    import (request: string): Promise<any>;
  }
  var System: System;
}

export {};
