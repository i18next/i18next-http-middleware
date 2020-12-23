import * as express from "express";
import * as i18next from "i18next";

declare module "i18next-http-middleware" {
  type I18next = i18next.i18n;

  type I18NextRequest = express.Request & {
    language: string;
    languages: string[];
    i18n: i18next.i18n;
    t: i18next.TFunction;
  };
}
