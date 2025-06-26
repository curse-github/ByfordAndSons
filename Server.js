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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Lib_1 = require("./Lib");
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
let config = {};
let defaultWebData = {};
function readConfig() {
    config = {};
    const configIni = (0, fs_1.readFileSync)("./config.ini").toString() // read config file
        .split("\r")
        .join("") // remove carriage returns
        .split("\n");
    let sec = "";
    for (let i = 0; i < configIni.length; i++) {
        const line = configIni[i];
        if (line.startsWith("[")) {
            sec = line.split("[")[1].split("]")[0].trim();
            continue;
        }
        if (line.startsWith(";"))
            continue;
        if (line.split("=").length != 2)
            console.log("Invalid config.ini file, line #" + (i + 1) + ".");
        const [name, value] = line.split("=").map((el) => el.trim());
        config[sec] = config[sec] || [];
        config[sec][name] = value;
    }
    const site_title = config.WebData.site_title;
    const copyright = config.WebData.copyright;
    const facebook_link = config.WebData.facebook;
    defaultWebData = { site_title, copyright, facebook_link };
}
readConfig();
// #region express server
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/img/", express_1.default.static("Resources/img"));
app.use("/js/", express_1.default.static("Resources/js"));
app.get("/css/procedural.css", (req, res) => {
    res.send("* { --main-color: " + config.Css.main_color + " !important; --accent-color: " + config.Css.accent_color + " !important; --accent-color-dark: " + config.Css.accent_color_dark + " !important; --accent-color-darker: " + config.Css.accent_color_darker + " !important; }");
});
app.use("/css/", express_1.default.static("Resources/css"));
app.get("/favicon.ico", (req, res) => (0, Lib_1.sendFile)(res, __dirname.split("\\").join("/") + "/Resources/img/favicon.ico"));
app.get("*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = (new Date()).getTime();
    let path = req.path;
    // if they are searching for an image that was not found in /img folder, send them a missing resource
    if (path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".ico")) {
        (0, Lib_1.sendFile)(res, __dirname.split("\\").join("/") + "/Resources/img/missing." + path.substring(-3));
        return;
    }
    if (path == "/")
        path = "/landing";
    // get session information
    const cookies = (0, Lib_1.getCookies)(req);
    (0, Lib_1.expireSessions)(); // expire any sessions which may be old
    if (!(0, Lib_1.verifySession)(cookies)) {
        // if the user is not logged in you can still access pages on the base controller
        let loadPage = (0, Lib_1.loadController)("base");
        if (loadPage == undefined) {
            res.status(404).send("404, Page not found.");
            return;
        } // if base doesnt load for some reason
        // parse the args and actually load the page
        const args = path.split("/");
        args.shift(); // pop empty element
        let controllerPage = args.shift();
        readConfig();
        if (yield loadPage(req, res, -1, { id: "", expireTime: 0, user_id: -1, data: {} }, controllerPage, args, Object.assign({ isLoggedIn: false }, defaultWebData))) {
            (0, Lib_1.log)("debug", "Loading page \"/" + controllerPage + "\" took " + ((new Date()).getTime() / startTime) + "ms.");
        }
        else
            res.redirect("/login");
        return;
    }
    // session was verified
    const isLoggedIn = true;
    const session = (0, Lib_1.getSession)(cookies);
    const user_id = session.user_id;
    const userFullName = yield (0, Lib_1.loadModel)("user").getUserFullNameByUserId(user_id);
    (0, Lib_1.setSessionData)(session.id, "fullName", userFullName);
    // split apart controllerName, controllerPage, and args
    // ex: "/cont/view_profile/150" -> controllerName = "sentry", controllerPage = "view_profile", args = ["150"]
    const args = path.split("/");
    args.shift(); // pop empty element
    let controllerName = args.shift();
    if ((controllerName == "Base") || (controllerName == "controllerClass")) { // do not access these directly.
        (0, Lib_1.log)("error", "User \"" + userFullName + "\" tried to access non-existant page \"" + path + "\".");
        res.redirect("/login");
        return;
    }
    let controllerPage = args.shift();
    // load the corresponding controller
    let loadPage = (0, Lib_1.loadController)(controllerName);
    if (loadPage == undefined) {
        // controller didn't exist, change to change to controller "Base:
        // ex: /login to /Base/login
        args.unshift(controllerPage);
        controllerPage = controllerName;
        controllerName = "base";
        loadPage = (0, Lib_1.loadController)(controllerName);
    }
    if (loadPage == undefined) { // controller really didn't exist
        (0, Lib_1.log)("error", "User \"" + userFullName + "\" tried to access non-existant page \"" + path + "\".");
        res.redirect("/login");
        return;
    } // controller did exist
    (0, Lib_1.log)("info", "Successfully loaded controller: \"" + controllerName + "\".");
    // attempt to load page
    readConfig();
    if (yield loadPage(req, res, user_id, session, controllerPage, args, Object.assign({ isLoggedIn, userFullName }, defaultWebData))) {
        (0, Lib_1.log)("debug", "Loading page \"" + controllerName + "/" + controllerPage + "\" took " + ((new Date()).getTime() / startTime) + "ms.");
        return;
    } // return because it successfully loaded the page
    // page loading failed
    (0, Lib_1.log)("error", "User \"" + userFullName + "\" tried to access non-existant page \"" + path + "\".");
    res.redirect("/login");
}));
// #endregion express server
const hostname = config.Project.hostname;
const port = config.Project.port;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        console.clear();
        app.listen(Number(port), () => __awaiter(this, void 0, void 0, function* () {
            (0, Lib_1.log)("info", "====================================================================================");
            (0, Lib_1.log)("info", "Server is running at " + hostname + ":" + port + ".");
        }));
    });
}
run();
