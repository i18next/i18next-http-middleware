import * as express from "express";
import * as i18next from "i18next";

type I18next = i18next.i18n;
type App = express.Application | express.Router;

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

interface ExtendedOptions extends Object {
  getPath: (req: express.Request) => string;
  getOriginalUrl: (req: express.Request) => string;
  getUrl: (req: express.Request) => string;
  setUrl: (req: express.Request, url: string) => void;
  getParams: (req: express.Request) => Object;
  getSession: (req: express.Request) => Object;
  getQuery: (req: express.Request) => Object;
  getCookies: (req: express.Request) => Object;
  getBody: (req: express.Request) => Object;
  getHeaders: (req: express.Request) => Object;
  getHeader: (res: express.Response, name: string) => Object;
  setHeader: (res: express.Response, name: string, value: string) => void;
  setContentType: (res: express.Response, type: string) => void;
  setStatus: (res: express.Response, code: number) => void;
  send: (res: express.Response, body: any) => void;
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
  req: express.Request,
  res: express.Response,
  options: HandleOptions,
  i18next: I18next
) => boolean;

declare module "i18next-http-middleware" {
  export function handle(
    i18next: I18next,
    options?: HandleOptions
  ): express.Handler;

  export function plugin(
    instance: any,
    options: HandleOptions & { i18next: I18next },
    next: express.NextFunction
  ): express.Handler;

  export function getResourcesHandler(
    i18next: I18next,
    options?: GetResourcesHandlerOptions
  ): express.Handler;

  export function missingKeyHandler(
    i18next: I18next,
    options?: MissingKeyHandlerOptions
  ): express.Handler;

  export function addRoute(
    i18next: I18next,
    route: string,
    lngs: string[],
    app: App,
    verb: string,
    fc: express.RequestHandler
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
      req: express.Request,
      res: express.Response,
      options?: LanguageDetectorInterfaceOptions
    ) => string | string[];

    cacheUserLanguage?: (
      req: express.Request,
      res: express.Response,
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
      req: express.Request,
      res: express.Response,
      detectionOrder: LanguageDetectorOrder
    ): void;

    cacheUserLanguage(
      req: express.Request,
      res: express.Response,
      lng: string,
      caches: LanguageDetectorCaches
    ): void;
  }
}
