"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
exports.checkNumberArgs = checkNumberArgs;
exports.parseNumberArgs = parseNumberArgs;
exports.checkStringQuery = checkStringQuery;
exports.checkStringOrUndefinedQuery = checkStringOrUndefinedQuery;
exports.loadPageGivenController = loadPageGivenController;
const Lib_1 = require("../Lib");
class Controller {
    constructor(_req, _res, _active_user_id, _session, _data) {
        this.loadedPage = "";
        this.req = _req;
        this.res = _res;
        this.session = _session;
        this.active_user_id = _active_user_id;
        this.data = _data;
        this.controllerFinishLoading = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () { return resolve(); }));
    }
    log(level, message) {
        let prefix = ((this.name != "") ? this.name : "");
        if (prefix != "")
            prefix += ((this.loadedPage != "") ? ("/" + this.loadedPage) : "");
        if (prefix != "")
            prefix += ": ";
        (0, Lib_1.log)(level, prefix + message);
    }
    errorLog(message) {
        this.log("error", message);
    }
    infoLog(message) {
        this.log("info", message);
    }
    debugLog(message) {
        this.log("debug", message);
    }
    sendPage(...views) {
        (0, Lib_1.sendPage)(this.res, views, this.data, this.name);
    }
}
exports.Controller = Controller;
function checkNumberArgs(args, count) {
    for (let i = 0; i < count; i++)
        if (args[i] != Number(args[i]).toString())
            return false;
    return true;
}
function parseNumberArgs(args, count) {
    return args.slice(0, count).map((arg) => Number(arg));
}
function checkStringQuery(query, keys) {
    for (let i = 0; i < keys.length; i++)
        if ((query[keys[i]] == undefined) || ((typeof query[keys[i]]) != "string"))
            return false;
    return true;
}
function checkStringOrUndefinedQuery(query, keys) {
    for (let i = 0; i < keys.length; i++)
        if ((query[keys[i]] != undefined) && ((typeof query[keys[i]]) != "string"))
            return false;
    return true;
}
function loadPageGivenController(controller, page, args, query) {
    return __awaiter(this, void 0, void 0, function* () {
        // try to find page by getting keys of a USER object and checking that it exists and is a function
        if (page == "constructor")
            return false;
        // let controller: T = construct(req, res, active_user_id, session, initialData);
        yield controller.controllerFinishLoading;
        let func = controller[page];
        if ((func == undefined) || ((typeof func) != "function"))
            return false;
        func = func.bind(controller);
        controller.debugLog("Sucessfully loaded page \"" + page + "\".");
        controller.loadedPage = page;
        // attempt to load page
        func(args, query).catch(controller.errorLog.bind(controller)); // prent the error if it fails
        return true;
    });
}
