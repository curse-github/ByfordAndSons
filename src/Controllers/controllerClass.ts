import { Request, Response } from "express";
import { log, sessionType, sendPage } from "../Lib";

export abstract class Controller {
    abstract name: string;
    req: Request;
    res: Response;
    session: sessionType;
    active_user_id: number;
    loadedPage: string = "";
    data: { [key: string]: any };

    controllerFinishLoading: Promise<void>;
    constructor(_req: Request, _res: Response, _active_user_id: number, _session: sessionType, _data: { [key: string]: any }) {
        this.req = _req; this.res = _res; this.session = _session;
        this.active_user_id = _active_user_id; this.data = _data;

        this.controllerFinishLoading = new Promise<void>(async (resolve:(()=> void)) => resolve());
    }
    log(level: "debug"|"info"|"error", message: any) {
        let prefix: string = ((this.name != "") ? this.name : "");
        if (prefix != "") prefix += ((this.loadedPage != "") ? ("/" + this.loadedPage) : "");
        if (prefix != "") prefix += ": ";
        log(level, prefix + message);
    }
    errorLog(message: any) {
        this.log("error", message);
    }
    infoLog(message: any) {
        this.log("info", message);
    }
    debugLog(message: any) {
        this.log("debug", message);
    }
    sendPage(...views: string[]) {
        sendPage(this.res, views, this.data, this.name);
    }
}
export function checkNumberArgs(args: string[], count: number): boolean {
    for (let i = 0; i < count; i++)
        if (args[i] != Number(args[i]).toString())
            return false;
    return true;
}
export function parseNumberArgs(args: string[], count: number): number[] {
    return args.slice(0, count).map((arg: string): number => Number(arg));
}
export function checkStringQuery(query: { [key: string]: (string|string[]|undefined) }, keys: string[]): boolean {
    for (let i = 0; i < keys.length; i++)
        if ((query[keys[i]] == undefined) || ((typeof query[keys[i]]) != "string"))
            return false;
    return true;
}
export function checkStringOrUndefinedQuery(query: { [key: string]: (string|string[]|undefined) }, keys: string[]): boolean {
    for (let i = 0; i < keys.length; i++)
        if ((query[keys[i]] != undefined) && ((typeof query[keys[i]]) != "string"))
            return false;
    return true;
}
export async function loadPageGivenController<T extends Controller>(controller: T, page: string, args: string[], query: { [key: string]: (string|string[]|undefined) }): Promise<boolean> {
    // try to find page by getting keys of a USER object and checking that it exists and is a function
    if (page == "constructor") return false;
    // let controller: T = construct(req, res, active_user_id, session, initialData);
    await controller.controllerFinishLoading;
    let func: (args: string[], query: { [key: string]: (string|string[]|undefined) })=> Promise<void> = (controller as any)[page];
    if ((func == undefined) || ((typeof func) != "function")) return false;
    func = func.bind(controller);
    controller.debugLog("Sucessfully loaded page \"" + page + "\".");
    controller.loadedPage = page;
    // attempt to load page
    func(args, query).catch(controller.errorLog.bind(controller));// prent the error if it fails
    return true;
}