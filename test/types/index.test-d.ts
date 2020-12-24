import {
  getResourcesHandler,
  missingKeyHandler,
  addRoute,
  handle,
  plugin,
  LanguageDetector,
} from "../../index";
import { expectType } from "tsd";
import express from "express";
import i18next from "i18next";

const noop = () => {};

expectType<express.Handler>(handle(i18next));

expectType<express.Handler>(plugin({}, { i18next: i18next }, noop));

expectType<express.Handler>(getResourcesHandler(i18next));

expectType<express.Handler>(missingKeyHandler(i18next));

expectType<void>(
  addRoute(i18next, "/path", ["en"], express.application, "get", noop)
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

expectType<void>(
  languageDetector.detect(<express.Request>{}, <express.Response>{}, ["en"])
);

expectType<void>(
  languageDetector.cacheUserLanguage(
    <express.Request>{},
    <express.Response>{},
    "en",
    true
  )
);
