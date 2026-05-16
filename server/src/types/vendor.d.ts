declare module "bcrypt" {
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module "pdf-parse" {
  type TextResult = {
    text: string;
  };

  export class PDFParse {
    constructor(options: { data: Buffer | Uint8Array });
    getText(): Promise<TextResult>;
    destroy(): Promise<void>;
  }
}

declare namespace Express {
  namespace Multer {
    type File = {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer?: Buffer;
    };
  }

  interface Request {
    file?: Multer.File;
  }
}

declare module "multer" {
  import type { RequestHandler } from "express";

  type FileFilterCallback = (error: Error | null, acceptFile?: boolean) => void;
  type DiskStorageOptions = {
    destination: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => void;
    filename: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => void;
  };
  type MulterOptions = {
    storage?: unknown;
    limits?: {
      fileSize?: number;
    };
    fileFilter?: (req: Express.Request, file: Express.Multer.File, callback: FileFilterCallback) => void;
  };
  type MulterInstance = {
    single(fieldName: string): RequestHandler;
  };

  function multer(options?: MulterOptions): MulterInstance;

  namespace multer {
    function diskStorage(options: DiskStorageOptions): unknown;
  }

  export default multer;
}
