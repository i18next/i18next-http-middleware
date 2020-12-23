import * as express from "express";
import * as i18next from "i18next";

type I18next = i18next.i18n;

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

declare module "i18next-http-middleware" {}
