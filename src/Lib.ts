
import { Request, Response } from "express";// types used in some of the functions

export function generateUUID(): string {
    var a = new Date().getTime();// Timestamp
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var b = Math.random() * 16;// random number between 0 and 16
        b = (a + b) % 16 | 0;
        a = Math.floor(a / 16);
        return (c === "x" ? b : ((b & 0x3) | 0x8)).toString(16);
    });
}
export function sha256(ascii: any) {
    function rightRotate(value: any, amount: any) {
        return (value >>> amount) | (value << (32 - amount));
    }
    
    var mathPow: any = Math.pow;
    var maxWord: any = mathPow(2, 32);
    var i: any;
    var j: any; // Used as a counters across the whole file
    var result: any = "";

    var words: any = [];
    var asciiBitLength: any = ascii.length * 8;
    
    //* caching results is optional - remove/add slash from front of this line to toggle
    // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
    // (we actually calculate the first 64, but extra values are just ignored)
    var hash: any = [];
    // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    var k: any = [];
    var primeCounter: any = k.length;
    /* /
    var hash = [], k = [];
    var primeCounter = 0;
    //*/

    var isComposite: any = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }
    
    ascii += "\x80"; // Append Ƈ' bit (plus zero padding)
    while ((ascii.length % 64) - 56) ascii += "\x00"; // More zero padding
    for (i = 0; i < ascii.length; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return; // ASCII check: only accept characters in range 0-255
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = ((asciiBitLength / maxWord) | 0);
    words[words.length] = (asciiBitLength);
    
    // process each chunk
    for (j = 0; j < words.length;) {
        var w: any = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
        var oldHash: any = hash;
        // This is now the undefinedworking hash", often labelled as variables a...g
        // (we have to truncate as well, otherwise extra entries at the end accumulate
        hash = hash.slice(0, 8);
        
        for (i = 0; i < 64; i++) {
            // Expand the message into 64 words
            // Used below if
            var w15: any = w[i - 15], w2 = w[i - 2];

            // Iterate
            var a: any = hash[0];
            var e: any = hash[4];
            var temp1: any = hash[7];
            temp1 += (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)); // S1
            temp1 += ((e & hash[5]) ^ ((~e) & hash[6])); // ch
            temp1 += k[i];
            // Expand the message schedule if needed
            temp1 += (w[i] = (i < 16) ? w[i] : (
                w[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) // s0+s1
            ) | 0);
            // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
            var temp2: any = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)); // S0
            temp2 += ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj
            
            hash = [ (temp1 + temp2) | 0 ].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
            hash[4] = (hash[4] + temp1) | 0;
        }
        
        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }
    
    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            var b: any = (hash[i] >> (j * 8)) & 255;
            result += ((b < 16) ? 0 : "") + b.toString(16);
        }
    }
    return result;
}

import { appendFileSync, readFileSync, writeFileSync } from "fs";
export function log(level: "debug"|"info"|"error", message: any) {
    const date: Date = new Date();
    const year: string = date.getFullYear().toString().padStart(4, "0");
    const month: string = (date.getMonth() + 1).toString().padStart(2, "0");
    const day: string = date.getDate().toString().padStart(2, "0");
    const hours: string = date.getHours().toString().padStart(2, "0");
    const minutes: string = date.getMinutes().toString().padStart(2, "0");
    const seconds: string = date.getSeconds().toString().padStart(2, "0");
    const timeString: string = month + "/" + day + "/" + year + " " + hours + ":" + minutes + ":" + seconds;
    const levelString: string = level.toUpperCase() + ((level == "info") ? " " : "");
    const header: string = levelString + " - " + timeString + " --> ";
    const fullMessage: string = header + (((typeof message) == "string") ? message : JSON.stringify(message));
    console.log(header, message);
    switch (level) {
        case "error":
            appendFileSync(__dirname + "/logs/logv1_error.log", fullMessage + "\n");
        case "info":
            appendFileSync(__dirname + "/logs/logv2_info.log", fullMessage + "\n");
        case "debug":
            appendFileSync(__dirname + "/logs/logv3_debug.log", fullMessage + "\n");
            break;
    }
}

// #region session stuff
export function getCookies(req: Request): { [key: string]: string } {
    return ((req.headers.cookie == undefined) ? {} : (Object.fromEntries(req.headers.cookie!.split(";").map((el) => (el.trim().split("=").map(decodeURIComponent))))));
}
const SESSION_LENGTH = 10 * 60 * 60 * 1000;// 10 hours
export type sessionType = {
    id: string,
    expireTime: number,
    user_id: number,
    data: { [key: string]: any }
};
let sessions: sessionType[] = [];
let sessionIdToIndex: { [id: string]: number } = {};

export function expireSessions() {
    for (let i = 0; i < sessions.length; i++) {
        const session: sessionType|undefined = sessions[i];
        if (session == undefined) continue;
        else if (session!.expireTime <= (new Date()).getTime()) {
            log("info", "Session for user \"" + session!.data.fullName + "\" has expired.");
            delete sessionIdToIndex[session!.id];
            delete sessions[i];
        }
    }
}
export function verifySession(cookies: { [key: string]: string }) {
    const id: string|undefined = cookies["sessionid"];
    if (id == undefined) return false;
    if (sessionIdToIndex[id] == undefined) return false;
    if (sessions[sessionIdToIndex[id]] == undefined) return false;
    return true;
}
export function getSession(cookies: { [key: string]: string }): sessionType|undefined {
    const id: string|undefined = cookies["sessionid"];
    if (id != undefined) return sessions[sessionIdToIndex[id]];
    else return undefined;
}
export function createSession(user_id: number, res: Response): string {
    let sessionId: string = generateUUID();
    for (let i = 0; i <= sessions.length; i++) {
        if (sessions[i] == undefined) {
            sessions[i] = {
                id: sessionId,
                expireTime: (new Date()).getTime() + SESSION_LENGTH,
                user_id,
                data: { message: "" }
            };
            sessionIdToIndex[sessionId] = i;
            res.cookie("sessionid", sessionId, { maxAge: SESSION_LENGTH, httpOnly: false });// set cookie for 5 hours
            return sessionId;
        }
    }
    return "";
}
export function clearSession(id: string): void {
    const index: number|undefined = sessionIdToIndex[id];
    if ((index == undefined) || (sessions[index] == undefined)) return;
    log("info", "Session for user \"" + sessions[index].data.fullName + "\" has been cleared.");
    delete sessions[index];
    delete sessionIdToIndex[id];
}

export function getSessionData(id: string, key: string): string {
    if (sessionIdToIndex[id] == undefined) return "";
    else return sessions[sessionIdToIndex[id]].data[key];
}
export function setSessionData(id: string, key: string, value: any): void {
    if (sessionIdToIndex[id] != undefined)
        sessions[sessionIdToIndex[id]].data[key] = value;
}
export function clearSessionData(id: string, key: string): void {
    delete sessions[sessionIdToIndex[id]].data[key];
}
// #endregion session stuff

// #region controller handling
export type loadPageFunc = (req: Request, res: Response, active_user_id: number, session: sessionType, page: string, args: string[], initialData: { [key: string]: any })=> Promise<boolean>;
export function loadController(name: string): loadPageFunc|undefined {
    let def: loadPageFunc|undefined = undefined;
    if (name.includes("/") || name.includes("\\") || name.includes("..")) return undefined;
    const fullname: string = "./Controllers/" + name[0].toUpperCase() + name.slice(1);
    try {
        require.cache = {};
        def = require(fullname).default as loadPageFunc;
        return def;
    } catch (err: any) {
        if ((name != "landing") && (name != "login") && (name != "tryLogin")) log("error", err);
        return undefined;
    }
}
// #endregion controller handling

// #region model handling
export function loadModel(name: string, controllerName: string = ""): { [key: string]: ((...args: any[])=> Promise<any>) } {
    if (name.includes("/") || name.includes("\\") || name.includes("..")) return {};
    const fullName: string = "./Models/" + name[0].toUpperCase() + name.slice(1) + "_model";
    try {
        require.cache = {};
        const model: { [key: string]: ((...args: any[])=> Promise<any>) } = require(fullName);
        return model;
    } catch (error) {
        log("error", controllerName + ": Model \"" + name + "\" was not found.");
        log("error", controllerName + ": " + error);
        return {};
    }
}
// #endregion model handling

// #region view handling
// loads a view
function readViewFile(view: string, controllerName: string = ""): string {
    let contents: string = "";
    try {
        contents = readFileSync(__dirname.split("\\").join("/") + "/Views/" + view + ".html").toString();
    } catch (err: any) {
        log("error", ((controllerName != "") ? (controllerName + ": ") : "") + "\"" + err.name + "\": " + err.message);
        contents = "<body>View \"" + view + "\" failed to load.</body>";
    }
    return contents;
}
export function processViewCollection(htmlData: string, data: { [key: string]: any }, controllerName: string = ""): string {
    // handle getting html from views array
    const htmlSplt: string[] = [];
    // "before <!-- blah blah blah --> outside" -> ["before ", " blah blah blah ", " outside"], every odd element is a
    htmlData.split("<!--").map((single: string) => single.split("-->")).forEach((tmpPart: string[]) => htmlSplt.push(...tmpPart));
    
    //
    let str: string = "";
    for (let i = 0; i < htmlSplt.length; i++) {
        let element1: string = htmlSplt[i];
        const isComment: boolean = (i % 2) == 1;
        // if its not a comment just add it to the file.
        if (!isComment) { str += element1; continue; }
        // this list element is a comment
        // remove whitespace
        const element2: string = element1.split("").filter((letter) => ((letter != " ") && (letter != "\t") && (letter != "\n") && (letter != "\r"))).join("");
        if (element2 == "}") continue;
        // if its just a variable, put the value of the variable into the string
        if (element2[0] == "$") {
            // get the value, hand handle statements like user.obj.list.0.id
            const varKeys: string[] = element2.substring(1).split(".");
            let objName: string = "";
            let tmpObj: { [key: string]: any } = data;
            for (let i = 0; i < varKeys.length; i++) {
                const key: string = varKeys[i];
                if (i == (varKeys.length - 1)) { // if it is the last key
                    if ((tmpObj[key] != undefined) && (((typeof tmpObj[key]) == "string") || ((typeof tmpObj[key]) == "number") || ((typeof tmpObj[key]) == "boolean"))) {
                        if ((typeof tmpObj[key]) == "boolean") str += (tmpObj[key] ? "true" : "false");
                        else str += tmpObj[key];
                        break;
                    } else {
                        log("error", controllerName + "/Warning: key \"" + key + "\" not found on object \"" + objName + "\".");
                        break;
                    }
                } else {
                    if ((tmpObj[key] != undefined) && ((typeof tmpObj[key]) == "object")) {
                        tmpObj = tmpObj[key];
                        objName += ((objName.length == 0) ? "" : ".") + key;
                        continue;
                    } else {
                        log("error", controllerName + "/Warning: key \"" + key + "\" not found on object \"" + objName + "\".");
                        break;
                    }
                }
            }
            continue;
        }

        // checks if statement
        // splits "IF($var){" into ["", "var){"]
        let splt: string[] = element2.split("IF($");
        if ((splt.length == 2) && (splt[0].length == 0)) { // (must contain "IF($", but only one) AND (nothing to the left of the statement)
            // splits "var){" into ["var", ""]
            splt = splt[1].split("){");
            if ((splt.length == 2) && (splt[1].length == 0) && (splt[0].length > 0)) { // (must contain "){", but only one) AND (nothing to the right of the statement) AND (variable name length > 0)
                // it is a valid if statement.
                // get the value, hand handle statements like user.list.3.bool
                const varKeys: string[] = splt[0].split(".");
                let varValue: boolean = false;
                let objName: string = "";
                let tmpObj: { [key: string]: any } = data;
                for (let i = 0; i < varKeys.length; i++) {
                    const key: string = varKeys[i];
                    if (i == (varKeys.length - 1)) { // if it is the last key
                        if ((tmpObj[key] != undefined) && ((typeof tmpObj[key]) == "boolean")) {
                            varValue = tmpObj[key];
                            break;
                        } else {
                            log("error", controllerName + "/Warning: key \"" + key + "\" not found on object \"" + objName + "\".");
                            varValue = false;
                            break;
                        }
                    } else {
                        if ((tmpObj[key] != undefined) && ((typeof tmpObj[key]) == "object")) {
                            tmpObj = tmpObj[key];
                            objName += ((objName.length == 0) ? "" : ".") + key;
                            continue;
                        } else {
                            log("error", controllerName + "/Warning: key \"" + key + "\" not found on object \"" + objName + "\".");
                            varValue = false;
                            break;
                        }
                    }
                }
                let k = i + 2;
                let num: number = 1;
                while (k < htmlSplt.length) {
                    let element2: string = htmlSplt[k];
                    if (element2.includes("{")) num++;
                    if (element2.includes("}")) num--;
                    if (num == 0) {
                        if (varValue) {
                            if (i < htmlSplt.length) str += htmlSplt[i + 1];
                            i++;
                        } else i = k;
                        break;
                    }
                    k += 2;
                }
                continue;
            }
        }
        
        // checks if statement
        // splits "JSON($var)" into ["", "var){"]
        splt = element2.split("JSON($");
        if ((splt.length == 2) && (splt[0].length == 0)) { // (must contain "JSON($", but only one) AND (nothing to the left of the statement)
            // splits "var)" into ["var", ""]
            splt = splt[1].split(")");
            if ((splt.length == 2) && (splt[1].length == 0) && (splt[0].length > 0)) { // (must contain ")", but only one) AND (nothing to the right of the statement) AND (variable name length > 0)
                // it is a valid if statement.
                // get the value, hand handle statements like user.list.3.bool
                const varKeys: string[] = splt[0].split(".");
                let objName: string = "";
                let tmpObj: { [key: string]: any } = data;
                for (let i = 0; i < varKeys.length; i++) {
                    const key: string = varKeys[i];
                    if (i == (varKeys.length - 1)) { // if it is the last key
                        if (tmpObj[key] != undefined) {
                            str += JSON.stringify(tmpObj[key]);
                            break;
                        } else {
                            log("error", controllerName + "/Warning: key \"" + key + "\" not found on object \"" + objName + "\".");
                            str += "undefined";
                            break;
                        }
                    } else {
                        if ((tmpObj[key] != undefined) && ((typeof tmpObj[key]) == "object")) {
                            tmpObj = tmpObj[key];
                            objName += ((objName.length == 0) ? "" : ".") + key;
                            continue;
                        } else {
                            log("error", controllerName + "/Warning: key \"" + key + "\" not found on object \"" + objName + "\".");
                            str += "undefined";
                            break;
                        }
                    }
                }
                continue;
            }
        }

        // if it reaches down here, it is simply a comment
        str += "<!--" + element1 + "-->";
    }
    return str;
}
export function sendViews(res: Response, views: string[], data: { [key: string]: any }, controllerName: string = ""): void {
    // append data of each view individually
    const htmlData: string = views.map((view: string) => (readViewFile(view, controllerName))).join("\n");
    // process variables, ifs, and fors
    const html: string = processViewCollection(htmlData, data, controllerName);
    // send html
    res.status(200).type("html").send(html);
}
// adds header or footer automatically, and formatted correctly
export function sendPage(res: Response, views: string[], data: { [key: string]: any }, controllerName: string = ""): void {
    // add header and footer, and tab over all views in between them
    const tabs: number = 3;
    let htmlData: string = readViewFile("header", controllerName) + "\n" + "    ".repeat(tabs);
    htmlData += views.map((view: string) => (readViewFile(view, controllerName).split("\n").join("\n" + "    ".repeat(tabs)))).join("\n" + "    ".repeat(tabs)) + "\n";
    htmlData += readViewFile("footer", controllerName);
    // process variables, ifs, and fors
    const html: string = processViewCollection(htmlData, data, controllerName);
    // send html
    res.status(200).type("html").send(html);
}
export function sendFile(res: Response, filename: string, controllerName: string = ""): void {
    res.sendFile(filename, (err: Error) => {
        if (err == undefined) return;
        log("error", ((controllerName != "") ? (controllerName + ": ") : "") + "\"" + err.name + "\": " + err.message);
        res.status(500).type("text").send("error 500, internal error");
    });
}
// #endregion view handling

export function getDatabaseFile(): any {
    let database: { [table: string]: any[] } = JSON.parse(readFileSync("./Resources/database.json").toString());
    return database;
}
export function setDatabaseFile(data: any): void {
    writeFileSync("./Resources/database.json", JSON.stringify(data, undefined, "    "));
}