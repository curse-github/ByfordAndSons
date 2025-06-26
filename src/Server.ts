import {
    generateUUID, getCookies, sha256, log,
    loadPageFunc, loadController, loadModel,
    sendFile, sendPage,
    sessionType, expireSessions, verifySession, getSession, createSession,
    setSessionData
} from "./Lib";
import express, { Request, Response, Application } from "express";
import { readFileSync } from "fs";

let config: {[sec: string]: {[key: string]: string}} = {};
let defaultWebData: {[key: string]: string} = {};
function readConfig() {
    config = {};
    const configIni: string[] = readFileSync("./config.ini").toString()// read config file
        .split("\r")
        .join("")// remove carriage returns
        .split("\n");
    let sec: string = "";
    for (let i = 0; i < configIni.length; i++) {
        const line: string = configIni[i];
        if (line.startsWith("[")) { sec = line.split("[")[1].split("]")[0].trim(); continue; }
        if (line.startsWith(";")) continue;
        if (line.split("=").length != 2) console.log("Invalid config.ini file, line #" + (i + 1) + ".");
        const [ name, value ]: [string, string] = line.split("=").map((el: string) => el.trim()) as [string, string];
        config[sec] = config[sec] || [];
        config[sec][name] = value;
    }
    const site_title: string = config.WebData.site_title;
    const copyright: string = config.WebData.copyright;
    const facebook_link: string = config.WebData.facebook;
    defaultWebData = { site_title, copyright, facebook_link };
}
readConfig();


// #region express server
var app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/img/", express.static("Resources/img"));
app.use("/js/", express.static("Resources/js"));
app.get("/css/procedural.css", (req: Request, res: Response) => {
    res.send(
        "* { --main-color: " + config.Css.main_color + " !important; --accent-color: " + config.Css.accent_color + " !important; --accent-color-dark: " + config.Css.accent_color_dark + " !important; --accent-color-darker: " + config.Css.accent_color_darker + " !important; }"
    );
});
app.use("/css/", express.static("Resources/css"));
app.get("/favicon.ico", (req: Request, res: Response) => sendFile(res, __dirname.split("\\").join("/") + "/Resources/img/favicon.ico"));

app.get("*", async (req: Request, res: Response) => {
    const startTime = (new Date()).getTime();
    let path: string = req.path;
    // if they are searching for an image that was not found in /img folder, send them a missing resource
    if (path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".ico")) {
        sendFile(res, __dirname.split("\\").join("/") + "/Resources/img/missing." + path.substring(-3)); return;
    }
    if (path == "/") path = "/landing";
    // get session information
    const cookies: { [key: string]: string } = getCookies(req);
    expireSessions();// expire any sessions which may be old
    if (!verifySession(cookies)) {
        // if the user is not logged in you can still access pages on the base controller
        let loadPage: loadPageFunc|undefined = loadController("base");
        if (loadPage == undefined) { res.status(404).send("404, Page not found."); return; }// if base doesnt load for some reason
        // parse the args and actually load the page
        const args: string[] = path.split("/");
        args.shift();// pop empty element
        let controllerPage: string = args.shift()!;
        readConfig();
        if (await loadPage(req, res, -1, { id: "", expireTime: 0, user_id: -1, data: {} }, controllerPage, args, { isLoggedIn: false, ...defaultWebData })) {
            log("debug", "Loading page \"/" + controllerPage + "\" took " + ((new Date()).getTime() / startTime) + "ms.");
        } else
            res.redirect("/login");
        return;
    }
    // session was verified
    const isLoggedIn: boolean = true;
    const session: sessionType = getSession(cookies)!;
    const user_id: number = session.user_id;
    const userFullName: string = await loadModel("user").getUserFullNameByUserId(user_id);
    setSessionData(session.id, "fullName", userFullName);

    // split apart controllerName, controllerPage, and args
    // ex: "/cont/view_profile/150" -> controllerName = "sentry", controllerPage = "view_profile", args = ["150"]
    const args: string[] = path.split("/");
    args.shift();// pop empty element
    let controllerName: string = args.shift()!;
    if ((controllerName == "Base") || (controllerName == "controllerClass")) { // do not access these directly.
        log("error", "User \"" + userFullName + "\" tried to access non-existant page \"" + path + "\".");
        res.redirect("/login");
        return;
    }
    let controllerPage: string = args.shift()!;

    // load the corresponding controller
    let loadPage: loadPageFunc|undefined = loadController(controllerName);
    if (loadPage == undefined) {
        // controller didn't exist, change to change to controller "Base:
        // ex: /login to /Base/login
        args.unshift(controllerPage);
        controllerPage = controllerName;
        controllerName = "base";
        loadPage = loadController(controllerName);
    }
    if (loadPage == undefined) { // controller really didn't exist
        log("error", "User \"" + userFullName + "\" tried to access non-existant page \"" + path + "\".");
        res.redirect("/login");
        return;
    }// controller did exist

    log("info", "Successfully loaded controller: \"" + controllerName + "\".");
    // attempt to load page
    readConfig();
    if (await loadPage(req, res, user_id, session, controllerPage, args, { isLoggedIn, userFullName, ...defaultWebData })) {
        log("debug", "Loading page \"" + controllerName + "/" + controllerPage + "\" took " + ((new Date()).getTime() / startTime) + "ms.");
        return;
    }// return because it successfully loaded the page
    
    // page loading failed
    log("error", "User \"" + userFullName + "\" tried to access non-existant page \"" + path + "\".");
    res.redirect("/login");
});
// #endregion express server

const hostname: string = config.Project.hostname;
const port: string = config.Project.port;
async function run() {
    console.clear();
    app.listen(Number(port), async () => {
        log("info", "====================================================================================");
        log("info", "Server is running at " + hostname + ":" + port + ".");
    });
}
run();