import { Request, Response } from "express";
import { sessionType, loadModel, getSessionData, setSessionData, clearSessionData } from "../Lib";
import { userType } from "../Models/databaseHandler";
import { Controller, checkNumberArgs, parseNumberArgs, checkStringQuery, checkStringOrUndefinedQuery, loadPageGivenController } from "./controllerClass";

class USER extends Controller {
    name: string = "USER";

    userModel: { [key: string]: ((...args: any[])=> Promise<any>) };

    constructor(req: Request, res: Response, active_user_id: number, session: sessionType, data: { [key: string]: any }) {
        super(req, res, active_user_id, session, data);

        this.userModel = loadModel("user");
    }
    async landing(args: string[], query: { [key: string]: (string|string[]|undefined) }): Promise<void> {
        // if (!checkNumberArgs(args, 1)) { this.res.redirect("/login"); return; }// an argument was invalid or missing
        // const [user_id]:number[] = parseNumberArgs(args,1);

        this.data.pageTitle = this.data.pageHeader = "Hi";
        this.sendPage("index");
    }

    // #region view & edit pages
    async view_profile(args: string[], query: { [key: string]: (string|string[]|undefined) }): Promise<void> {
        // display information about the active user

        // get user data to display
        const user: userType = await this.userModel.getUserByUserId(this.active_user_id);
        this.data.user = user;

        // page is editable, set edit link
        this.data.pageEditable = true;
        this.data.editLink = "/user/edit_profile";
        // get message from a different page if there is one, and clear it so it wont show again
        this.data.message = getSessionData(this.session.id, "message") || "";
        clearSessionData(this.session.id, "message");

        // set the title and header and display the page
        this.data.pageTitle = this.data.pageHeader = "View Profile";
        this.sendPage("viewUser");
    }
    async edit_profile(args: string[], query: { [key: string]: (string|string[]|undefined) }): Promise<void> {
        // display information about the active user in a way that it can be edited

        if (checkStringOrUndefinedQuery(query, [ "submit_button", "first_name", "last_name", "phone", "user_id" ]) && (!!query.submit_button)) {
            this.data.user = { first_name: query.first_name || "", last_name: query.last_name || "", phone: query.phone || "", user_id: this.active_user_id };
            this.data.user.email = await this.userModel.getUserEmailByUserId(this.active_user_id);
        } else
            this.data.user = await this.userModel.getUserByUserId(this.active_user_id);
        
        // page is not editable
        this.data.pageEditable = false;
        // set form action link
        this.data.formActionLink = "/user/update_profile";
        this.data.chngPswdLink = "/user/edit_pswd";
        // get message from a different page if there is one, and clear it so it wont show again
        this.data.message = getSessionData(this.session.id, "message") || "";
        clearSessionData(this.session.id, "message");

        // set the title and header and display the page
        this.data.pageTitle = this.data.pageHeader = "Edit Profile";
        this.sendPage("editUser");
    }
    async update_profile(args: string[], query: { [key: string]: (string|string[]|undefined) }): Promise<void> {
        // link to actually change the user data and redirect you to the view_profile page
        // note, you cannot change your email
        if (!checkStringOrUndefinedQuery(query, [ "first_name", "last_name", "phone", "submmit_button", "cancel_button" ])) { this.res.json(false); return; }
        const { first_name, last_name, phone, user_id, submit_button, cancel_button } = query;
        const submit: boolean = (!!submit_button);
        const cancel: boolean = (!!cancel_button);
        if (cancel || !submit) { this.res.redirect("/user/view_profile"); return; }

        if ((first_name == "") || (last_name == "") || (phone == "") || (user_id != Number(user_id).toString()) || (Number(user_id) != this.active_user_id)) {
            if ((user_id != Number(user_id).toString()) || (Number(user_id) != this.active_user_id)) { this.res.redirect("/login"); return; }// url was most likely tampered with
            let message: string = "The following fields have errors, please correct and re-submit:";
            if (first_name == "")
                message += "<br>    Please enter a first name.";
            if (last_name == "")
                message += "<br>    Please enter a last name.";
            if (phone == "")
                message += "<br>    Please enter a phone number.";
            setSessionData(this.session.id, "message", message);
            this.edit_profile([], query);
            return;
        }
        const email: string = await this.userModel.getUserEmailByUserId(this.active_user_id);
        await this.userModel.setUserDataByUserId(this.active_user_id, email, first_name, last_name, phone);
        this.res.redirect("/user/view_profile");
    }
    
    async view_user(args: string[], query: { [key: string]: (string|string[]|undefined) }): Promise<void> {
        if (!checkNumberArgs(args, 1)) { this.res.redirect("/login"); return; }// an argument was invalid or missing
        const [ user_id ]: number[] = parseNumberArgs(args, 1);

        this.data.pageTitle = this.data.pageHeader = "View User";
        this.sendPage("viewUser");
    }
    async edit_user(args: string[], query: { [key: string]: (string|string[]|undefined) }): Promise<void> {
        if (!checkNumberArgs(args, 1)) { this.res.redirect("/login"); return; }// an argument was invalid or missing
        const [ user_id ]: number[] = parseNumberArgs(args, 1);

        this.data.pageTitle = this.data.pageHeader = "Edit User";
        this.sendPage("editUser");
    }
    // #endregion view & edit pages

}

export default async function loadPage(req: Request, res: Response, active_user_id: number, session: sessionType, page: string, args: string[], initialData: { [key: string]: any }) {
    return loadPageGivenController<USER>(new USER(req, res, active_user_id, session, initialData), page, args, req.query as { [key: string]: (string|string[]|undefined) });
}