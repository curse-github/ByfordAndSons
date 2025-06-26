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
const controllerClass_1 = require("./controllerClass");
class USER extends controllerClass_1.Controller {
    constructor(req, res, active_user_id, session, data) {
        super(req, res, active_user_id, session, data);
        this.name = "USER";
        this.userModel = (0, Lib_1.loadModel)("user");
    }
    landing(args, query) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (!checkNumberArgs(args, 1)) { this.res.redirect("/login"); return; }// an argument was invalid or missing
            // const [user_id]:number[] = parseNumberArgs(args,1);
            this.data.pageTitle = this.data.pageHeader = "Hi";
            this.sendPage("index");
        });
    }
    // #region view & edit pages
    view_profile(args, query) {
        return __awaiter(this, void 0, void 0, function* () {
            // display information about the active user
            // get user data to display
            const user = yield this.userModel.getUserByUserId(this.active_user_id);
            this.data.user = user;
            // page is editable, set edit link
            this.data.pageEditable = true;
            this.data.editLink = "/user/edit_profile";
            // get message from a different page if there is one, and clear it so it wont show again
            this.data.message = (0, Lib_1.getSessionData)(this.session.id, "message") || "";
            (0, Lib_1.clearSessionData)(this.session.id, "message");
            // set the title and header and display the page
            this.data.pageTitle = this.data.pageHeader = "View Profile";
            this.sendPage("viewUser");
        });
    }
    edit_profile(args, query) {
        return __awaiter(this, void 0, void 0, function* () {
            // display information about the active user in a way that it can be edited
            if ((0, controllerClass_1.checkStringOrUndefinedQuery)(query, ["submit_button", "first_name", "last_name", "phone", "user_id"]) && (!!query.submit_button)) {
                this.data.user = { first_name: query.first_name || "", last_name: query.last_name || "", phone: query.phone || "", user_id: this.active_user_id };
                this.data.user.email = yield this.userModel.getUserEmailByUserId(this.active_user_id);
            }
            else
                this.data.user = yield this.userModel.getUserByUserId(this.active_user_id);
            // page is not editable
            this.data.pageEditable = false;
            // set form action link
            this.data.formActionLink = "/user/update_profile";
            this.data.chngPswdLink = "/user/edit_pswd";
            // get message from a different page if there is one, and clear it so it wont show again
            this.data.message = (0, Lib_1.getSessionData)(this.session.id, "message") || "";
            (0, Lib_1.clearSessionData)(this.session.id, "message");
            // set the title and header and display the page
            this.data.pageTitle = this.data.pageHeader = "Edit Profile";
            this.sendPage("editUser");
        });
    }
    update_profile(args, query) {
        return __awaiter(this, void 0, void 0, function* () {
            // link to actually change the user data and redirect you to the view_profile page
            // note, you cannot change your email
            if (!(0, controllerClass_1.checkStringOrUndefinedQuery)(query, ["first_name", "last_name", "phone", "submmit_button", "cancel_button"])) {
                this.res.json(false);
                return;
            }
            const { first_name, last_name, phone, user_id, submit_button, cancel_button } = query;
            const submit = (!!submit_button);
            const cancel = (!!cancel_button);
            if (cancel || !submit) {
                this.res.redirect("/user/view_profile");
                return;
            }
            if ((first_name == "") || (last_name == "") || (phone == "") || (user_id != Number(user_id).toString()) || (Number(user_id) != this.active_user_id)) {
                if ((user_id != Number(user_id).toString()) || (Number(user_id) != this.active_user_id)) {
                    this.res.redirect("/login");
                    return;
                } // url was most likely tampered with
                let message = "The following fields have errors, please correct and re-submit:";
                if (first_name == "")
                    message += "<br>    Please enter a first name.";
                if (last_name == "")
                    message += "<br>    Please enter a last name.";
                if (phone == "")
                    message += "<br>    Please enter a phone number.";
                (0, Lib_1.setSessionData)(this.session.id, "message", message);
                this.edit_profile([], query);
                return;
            }
            const email = yield this.userModel.getUserEmailByUserId(this.active_user_id);
            yield this.userModel.setUserDataByUserId(this.active_user_id, email, first_name, last_name, phone);
            this.res.redirect("/user/view_profile");
        });
    }
    view_user(args, query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, controllerClass_1.checkNumberArgs)(args, 1)) {
                this.res.redirect("/login");
                return;
            } // an argument was invalid or missing
            const [user_id] = (0, controllerClass_1.parseNumberArgs)(args, 1);
            this.data.pageTitle = this.data.pageHeader = "View User";
            this.sendPage("viewUser");
        });
    }
    edit_user(args, query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, controllerClass_1.checkNumberArgs)(args, 1)) {
                this.res.redirect("/login");
                return;
            } // an argument was invalid or missing
            const [user_id] = (0, controllerClass_1.parseNumberArgs)(args, 1);
            this.data.pageTitle = this.data.pageHeader = "Edit User";
            this.sendPage("editUser");
        });
    }
}
function loadPage(req, res, active_user_id, session, page, args, initialData) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, controllerClass_1.loadPageGivenController)(new USER(req, res, active_user_id, session, initialData), page, args, req.query);
    });
}
