"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.EditWrapper = exports.Lexicon = void 0;
var Lexicon_1 = require("./Lexicon");
Object.defineProperty(exports, "Lexicon", { enumerable: true, get: function () { return Lexicon_1.Lexicon; } });
var EditWrapper_1 = require("./EditWrapper");
Object.defineProperty(exports, "EditWrapper", { enumerable: true, get: function () { return __importDefault(EditWrapper_1).default; } });
exports.VERSION = "2.11.3";
/*
  Change History - API changes since last version

  v2.11.3 - Up to react18 in peer dependency
  v2.11.2 - Up to react17 in peer dependency
  v2.11.1 - Reduce package size by moving react16 to peer dependency
  v2.11.0 — Renamed "addSubLexicon" to "addBranch", with old name aliased.

  v2.10.0 — Added "AddSubLexicon" function as a shortcut to embed lexicons in lexicons.

  v2.8.4 — Server has button to check if Github access token is working.

  v2.8.3 — Remove some debug logging. Visual improvements to Lexicon Server

  v2.8.2 — Making monorepo that contains NPM package and Rails server in one Git repo

  v2.8.0 — You can embed Lexicons within other Lexicons. get(), and editing works fine.

  v2.7.1 — Fix: didn't compile TS -> JS before commiting

  v2.7.0 — Lexicons can be stored inside other Lexicons
    * e.g. let lex = new Lexicon({
        en: {
          title: "...",
          subComp: new Lexicon(...)
        }
      })

      lex.get('subComp.subTitle')


  v2.6 — Refactor Lexicon to go with changes to LexiconServer
    * Simplify internal storage by using Object instead of Map

  v2.4 — More ways to pass component to <EditWrapper>
    * e.g. <Editwrapper compnent={MyComponent> lexicon={lexicon}/>
      or   <EditWrapper> <MyComponent lexicon={lexicon}/> </EditWrapper>

  v2.0 — Major API changes
    * Get rid of LexiconShape
    * use .get() method to retrieve values, instead of []

  v1.0 — Initial release
*/
