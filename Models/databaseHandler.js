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
exports.permissionEnum = void 0;
exports.getDatabaseTable = getDatabaseTable;
exports.setDatabaseTable = setDatabaseTable;
const hostname = "localhost";
const username = "fcit";
const password = "brownBi<e330";
const database = "gs";
const databaseFileLoc = "../Resources/database.json";
console.log(__dirname);
// #region types
var permissionEnum;
(function (permissionEnum) {
    permissionEnum[permissionEnum["None"] = 0] = "None";
    permissionEnum[permissionEnum["View"] = 1] = "View";
    permissionEnum[permissionEnum["Edit"] = 2] = "Edit";
})(permissionEnum || (exports.permissionEnum = permissionEnum = {}));
// #endregion types
const Lib_1 = require("../Lib");
function getDatabaseTable(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let database = (0, Lib_1.getDatabaseFile)();
        if (database[name] == undefined)
            database[name] = [];
        (0, Lib_1.setDatabaseFile)(database);
        return database[name];
    });
}
function setDatabaseTable(name, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let database = (0, Lib_1.getDatabaseFile)();
        if (data == undefined)
            return;
        database[name] = data;
        (0, Lib_1.setDatabaseFile)(database);
    });
}
