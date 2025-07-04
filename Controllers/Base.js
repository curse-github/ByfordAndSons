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
exports.default = loadPage;
const Lib_1 = require("../Lib");
const Lib_2 = require("../Lib");
const controllerClass_1 = require("./controllerClass");
// pages on this controller can be access without being logged in
// whether they are logged in or not is stored in this.data.isLoggedIn
class BASE extends controllerClass_1.Controller {
    constructor(req, res, active_user_id, session, data) {
        super(req, res, active_user_id, session, data);
        this.name = "";
        this.userModel = (0, Lib_1.loadModel)("user");
    }
    landing(args, query) {
        return __awaiter(this, void 0, void 0, function* () {
            this.res.redirect("/index");
        });
    }
    index(args, query) {
        return __awaiter(this, void 0, void 0, function* () {
            // this page is not editable and you cant get a message because there is no session
            this.data.pageEditable = false;
            this.data.message = "";
            this.data.pageTitle = "Home";
            this.data.pageHeader = "";
            this.sendPage("index");
        });
    }
    estimate(args, query) {
        return __awaiter(this, void 0, void 0, function* () {
            // this page is not editable and you cant get a message because there is no session
            this.data.pageEditable = false;
            this.data.message = "";
            this.data.pageTitle = "Estimate";
            this.data.pageHeader = "";
            this.sendPage("estimate");
        });
    }
    photosIndex(args, query) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, Lib_1.sendFile)(this.res, __dirname.replace("\\Controllers", "") + "/Resources/img/photos/photosIndex.json", "BASE");
        });
    }
    login(args, query) {
        return __awaiter(this, void 0, void 0, function* () {
            // if it has a session, clear it
            const cookies = (0, Lib_2.getCookies)(this.req);
            const sessionid = cookies.sessionid;
            if (sessionid != undefined) {
                this.res.clearCookie("sessionid");
                (0, Lib_2.clearSession)(sessionid);
                this.data.isLoggedIn = false;
                this.data.userFullName = "";
            }
            // this page is not editable and you cant get a message because there is no session
            this.data.pageEditable = false;
            this.data.message = "";
            this.data.pageTitle = "Login";
            this.data.pageHeader = "Please Log In";
            this.sendPage("login");
        });
    }
    tryLogin(args, query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data.isLoggedIn) {
                this.res.redirect("/login");
                return;
            }
            if (!(0, controllerClass_1.checkStringQuery)(query, ["email", "password"])) {
                this.res.json(false);
                return;
            }
            const email = query.email;
            const pass_hash = query.password;
            const user_id = yield this.userModel.validateLogin(email, pass_hash);
            if (user_id == -1) {
                this.debugLog("Failed login attempt.");
                this.res.json(false);
                return;
            } // invalid login
            // login succeeded, create session and send to landing page
            (0, Lib_2.expireSessions)(); // expire any sessions which may be old
            const sessionId = (0, Lib_2.createSession)(user_id, this.res);
            this.res.json(true);
            const user = yield this.userModel.getUserByUserId(user_id);
            this.log("info", "User \"" + user.first_name + " " + user.last_name + "\" logged in, sessionid: \"" + sessionId + "\".");
        });
    }
}
function loadPage(req, res, active_user_id, session, page, args, initialData) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, controllerClass_1.loadPageGivenController)(new BASE(req, res, active_user_id, session, initialData), page, args, req.query);
    });
}
