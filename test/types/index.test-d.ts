import {
  getResourcesHandler,
  missingKeyHandler,
  addRoute,
  handle,
  plugin,
  LanguageDetector,
} from "../../index";
import { expectType } from "tsd";
import {
  Handler,
  Application,
  Request,
  Response,
} from "express-serve-static-core";
import i18next from "i18next";

const noop = () => {};

expectType<Handler>(handle(i18next));

expectType<Handler>(plugin({}, { i18next: i18next }, noop));

expectType<Handler>(getResourcesHandler(i18next));

expectType<Handler>(missingKeyHandler(i18next));

expectType<void>(
  addRoute(i18next, "/path", ["en"], <Application>{}, "get", noop)
);

const languageDetector = new LanguageDetector();

expectType<void>(languageDetector.init({}));

expectType<void>(
  languageDetector.addDetector({
    name: "testDetector",
    lookup: () => "en",
    cacheUserLanguage: noop,
  })
);

expectType<void>(languageDetector.detect(<Request>{}, <Response>{}, ["en"]));

expectType<void>(
  languageDetector.cacheUserLanguage(<Request>{}, <Response>{}, "en", true)
);
