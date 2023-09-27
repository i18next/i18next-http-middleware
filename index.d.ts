import {
  Application,
  Handler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express-serve-static-core";
import * as i18next from "i18next";

/// <reference types="express-serve-static-core" />

type I18next = i18next.i18n;
type App = Application | Router;

type I18NextRequest = {
  language: string;
  languages: string[];
  i18n: i18next.i18n;
  t: i18next.TFunction;
};

declare global {
  namespace Express {
    interface Request extends I18NextRequest {}
  }
}

declare module 'fastify' {
  interface FastifyRequest extends I18NextRequest {}
}

interface ExtendedOptions extends Object {
  getPath?: (req: Request) => string;
  getOriginalUrl?: (req: Request) => string;
  getUrl?: (req: Request) => string;
  setUrl?: (req: Request, url: string) => void;
  getParams?: (req: Request) => Object;
  getSession?: (req: Request) => Object;
  getQuery?: (req: Request) => Object;
  getCookies?: (req: Request) => Object;
  getBody?: (req: Request) => Object;
  getHeaders?: (req: Request) => Object;
  getHeader?: (res: Response, name: string) => Object;
  setHeader?: (res: Response, name: string, value: string) => void;
  setContentType?: (res: Response, type: string) => void;
  setStatus?: (res: Response, code: number) => void;
  send?: (res: Response, body: any) => void;
}

interface HandleOptions extends ExtendedOptions {
  ignoreRoutes?: string[] | IgnoreRoutesFunction;
  removeLngFromUrl?: boolean;
}

interface GetResourcesHandlerOptions extends ExtendedOptions {
  maxAge?: number;
  cache?: boolean;
  lngParam?: string;
  nsParam?: string;
}

interface MissingKeyHandlerOptions extends ExtendedOptions {
  lngParam?: string;
  nsParam?: string;
}

type IgnoreRoutesFunction = (
  req: Request,
  res: Response,
  options: HandleOptions,
  i18next: I18next
) => boolean;

export function handle(i18next: I18next, options?: HandleOptions): Handler;

export function koaPlugin(i18next: I18next, options?: HandleOptions): (context: unknown, next: Function) => any;

export function plugin(
  instance: any,
  options: HandleOptions & { i18next?: I18next },
  next: NextFunction
): Handler;

export function getResourcesHandler(
  i18next: I18next,
  options?: GetResourcesHandlerOptions
): Handler;

export function missingKeyHandler(
  i18next: I18next,
  options?: MissingKeyHandlerOptions
): Handler;

export function addRoute(
  i18next: I18next,
  route: string,
  lngs: string[],
  app: App,
  verb: string,
  fc: RequestHandler
): void;

// LanguageDetector
type LanguageDetectorServices = any;
type LanguageDetectorOrder = string[];
type LanguageDetectorCaches = boolean | string[];
interface LanguageDetectorOptions {
  order?: LanguageDetectorOrder;
  lookupQuerystring?: string;
  lookupCookie?: string;
  lookupSession?: string;
  lookupFromPathIndex?: number;
  caches?: LanguageDetectorCaches;
  cookieExpirationDate?: Date;
  cookieDomain?: string;
}
interface LanguageDetectorAllOptions {
  fallbackLng: boolean | string | string[];
}
interface LanguageDetectorInterfaceOptions {
  [name: string]: any;
}
interface LanguageDetectorInterface {
  name: string;

  lookup: (
    req: Request,
    res: Response,
    options?: LanguageDetectorInterfaceOptions
  ) => string | string[] | undefined;

  cacheUserLanguage?: (
    req: Request,
    res: Response,
    lng: string,
    options?: Object
  ) => void;
}

export class LanguageDetector implements i18next.Module {
  type: "languageDetector";

  constructor(
    services: LanguageDetectorServices,
    options?: LanguageDetectorOptions,
    allOptions?: LanguageDetectorAllOptions
  );

  constructor(
    options?: LanguageDetectorOptions,
    allOptions?: LanguageDetectorAllOptions
  );

  init(
    services: LanguageDetectorServices,
    options?: LanguageDetectorOptions,
    allOptions?: LanguageDetectorAllOptions
  ): void;

  init(
    options?: LanguageDetectorOptions,
    allOptions?: LanguageDetectorAllOptions
  ): void;

  addDetector(detector: LanguageDetectorInterface): void;

  detect(
    req: Request,
    res: Response,
    detectionOrder: LanguageDetectorOrder
  ): void;

  cacheUserLanguage(
    req: Request,
    res: Response,
    lng: string,
    caches: LanguageDetectorCaches
  ): void;
}
