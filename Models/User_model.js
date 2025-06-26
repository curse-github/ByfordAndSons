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
exports.validateLogin = validateLogin;
exports.ensureUser = ensureUser;
exports.getUserByUserId = getUserByUserId;
exports.setUserDataByUserId = setUserDataByUserId;
exports.getUserTypeByUserId = getUserTypeByUserId;
exports.getUserEmailByUserId = getUserEmailByUserId;
exports.getUserIdByUserEmail = getUserIdByUserEmail;
exports.getPassHashByUserId = getPassHashByUserId;
exports.setPassHashByUserId = setPassHashByUserId;
exports.getUserFirstNameByUserId = getUserFirstNameByUserId;
exports.getUserLastNameByUserId = getUserLastNameByUserId;
exports.getUserFullNameByUserId = getUserFullNameByUserId;
exports.getUserPhoneByUserId = getUserPhoneByUserId;
const databaseHandler_1 = require("./databaseHandler");
function getUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, databaseHandler_1.getDatabaseTable)("users");
    });
}
function setUsers(users) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, databaseHandler_1.setDatabaseTable)("users", users);
    });
}
// returns user_id or -1
function validateLogin(email, pass_hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getUsers();
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (email != user.email)
                continue;
            if (pass_hash != user.pass_hash)
                continue;
            return user.user_id;
        }
        return -1;
    });
}
function ensureUser(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getUsers();
        for (let i = 0; i < users.length; i++)
            if (users[i].user_id == user_id)
                return true;
        return false;
    });
}
function getUserByUserId(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getUsers();
        for (let i = 0; i < users.length; i++)
            if (users[i].user_id == user_id) {
                const user = users[i];
                return {
                    user_id: user.user_id,
                    accountType: user.accountType,
                    email: user.email,
                    pass_hash: "NA",
                    first_name: user.first_name,
                    last_name: user.last_name,
                    phone: user.phone
                };
            }
        return undefined;
    });
}
function setUserDataByUserId(user_id, email, first_name, last_name, phone) {
    return __awaiter(this, void 0, void 0, function* () {
        let users = yield getUsers();
        for (let i = 0; i < users.length; i++) {
            if (users[i].user_id == user_id) {
                users[i].email = email;
                users[i].first_name = first_name;
                users[i].last_name = last_name;
                users[i].phone = phone;
                setUsers(users);
                return;
            }
        }
    });
}
// accountType
function getUserTypeByUserId(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getUsers();
        for (let i = 0; i < users.length; i++)
            if (users[i].user_id == user_id)
                return users[i].accountType;
        return undefined;
    });
}
// email
function getUserEmailByUserId(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getUsers();
        for (let i = 0; i < users.length; i++)
            if (users[i].user_id == user_id)
                return users[i].email;
        return undefined;
    });
}
// returns user_id or -1
function getUserIdByUserEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getUsers();
        for (let i = 0; i < users.length; i++)
            if (users[i].email == email)
                return users[i].user_id;
        return -1;
    });
}
// pass_hash
function getPassHashByUserId(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getUsers();
        for (let i = 0; i < users.length; i++)
            if (users[i].user_id == user_id)
                return users[i].pass_hash;
        return undefined;
    });
}
function setPassHashByUserId(user_id, pass_hash) {
    return __awaiter(this, void 0, void 0, function* () {
        let users = yield getUsers();
        for (let i = 0; i < users.length; i++) {
            if (users[i].user_id == user_id) {
                users[i].pass_hash = pass_hash;
                setUsers(users);
                return;
            }
        }
    });
}
// first_name
function getUserFirstNameByUserId(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getUsers();
        for (let i = 0; i < users.length; i++)
            if (users[i].user_id == user_id)
                return users[i].first_name;
        return undefined;
    });
}
// last_name
function getUserLastNameByUserId(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getUsers();
        for (let i = 0; i < users.length; i++)
            if (users[i].user_id == user_id)
                return users[i].last_name;
        return undefined;
    });
}
// first_name+" "+last_name
function getUserFullNameByUserId(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getUsers();
        for (let i = 0; i < users.length; i++)
            if (users[i].user_id == user_id)
                return users[i].first_name + " " + users[i].last_name;
        return undefined;
    });
}
// phone
function getUserPhoneByUserId(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getUsers();
        for (let i = 0; i < users.length; i++)
            if (users[i].user_id == user_id)
                return users[i].phone;
        return undefined;
    });
}
