import { Request, Response } from "express";
import { sessionType, loadModel, sendFile } from "../Lib";
import { getSessionData, setSessionData, clearSessionData } from "../Lib";
import { createSession, expireSessions, getCookies, getSession, clearSession } from "../Lib";
import { userType } from "../Models/databaseHandler";
import { Controller, checkNumberArgs, parseNumberArgs, checkStringQuery, checkStringOrUndefinedQuery, loadPageGivenController } from "./controllerClass";

// pages on this controller can be access without being logged in
// whether they are logged in or not is stored in this.data.isLoggedIn
class BASE extends Controller {
    name: string = "";

    userModel: { [key: string]: ((...args: any[])=> Promise<any>) };

    constructor(req: Request, res: Response, active_user_id: number, session: sessionType, data: { [key: string]: any }) {
        super(req, res, active_user_id, session, data);

        this.userModel = loadModel("user");
    }
    async landing(args: string[], query: { [key: string]: (string|string[]|undefined) }): Promise<void> {
        this.res.redirect("/index");
    }
    async index(args: string[], query: { [key: string]: (string|string[]|undefined) }) {
        // this page is not editable and you cant get a message because there is no session
        this.data.pageEditable = false;
        this.data.message = "";

        this.data.pageTitle = "Home";
        // this.data.pageHeader = "Please Log In";
        this.sendPage("index");
    }
    async photosIndex(args: string[], query: { [key: string]: (string|string[]|undefined) }) {
        sendFile(this.res, __dirname.replace("\\Controllers", "") + "/Resources/img/photos/photosIndex.json", "BASE");
    }
    async login(args: string[], query: { [key: string]: (string|string[]|undefined) }) {
        // if it has a session, clear it
        const cookies = getCookies(this.req);
        const sessionid: string|undefined = cookies.sessionid;
        if (sessionid != undefined) {
            this.res.clearCookie("sessionid");
            clearSession(sessionid);
            this.data.isLoggedIn = false;
            this.data.userFullName = "";
        }
        // this page is not editable and you cant get a message because there is no session
        this.data.pageEditable = false;
        this.data.message = "";

        this.data.pageTitle = "Login";
        this.data.pageHeader = "Please Log In";
        this.sendPage("login");
    }
    async tryLogin(args: string[], query: { [key: string]: (string|string[]|undefined) }) {
        if (this.data.isLoggedIn) { this.res.redirect("/login"); return; }
        if (!checkStringQuery(query, [ "email", "password" ])) { this.res.json(false); return; }
        const email: string = query.email as string;
        const pass_hash: string = query.password as string;
        const user_id: number = await this.userModel.validateLogin(email, pass_hash);
        if (user_id == -1) {
            this.debugLog("Failed login attempt.");
            this.res.json(false); return;
        }// invalid login

        // login succeeded, create session and send to landing page
        expireSessions();// expire any sessions which may be old
        const sessionId: string = createSession(user_id, this.res);
        this.res.json(true);
        const user: userType = await this.userModel.getUserByUserId(user_id);
        this.log("info", "User \"" + user.first_name + " " + user.last_name + "\" logged in, sessionid: \"" + sessionId + "\".");
    }
}

export default async function loadPage(req: Request, res: Response, active_user_id: number, session: sessionType, page: string, args: string[], initialData: { [key: string]: any }) {
    return loadPageGivenController<BASE>(new BASE(req, res, active_user_id, session, initialData), page, args, req.query as { [key: string]: (string|string[]|undefined) });
}