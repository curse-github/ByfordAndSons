const hostname: string = "localhost";
const username: string = "fcit";
const password: string = "brownBi<e330";
const database: string = "gs";
const databaseFileLoc: string = "../Resources/database.json";
console.log(__dirname);
// #region types
export enum permissionEnum {
    None = 0,
    View = 1,
    Edit = 2
}
export type userType = {
    user_id: number,
    accountType: "support"|"user",
    email: string,
    pass_hash: string,
    first_name: string,
    last_name: string,
    phone: string
};
// #endregion types

import { getDatabaseFile, setDatabaseFile } from "../Lib";
export async function getDatabaseTable(name: string): Promise<any[]> {
    let database: { [table: string]: any[] } = getDatabaseFile();
    if (database[name] == undefined) database[name] = [];
    setDatabaseFile(database);
    return database[name];
}
export async function setDatabaseTable(name: string, data: any[]): Promise<void> {
    let database: { [table: string]: any[] } = getDatabaseFile();
    if (data == undefined) return;
    database[name] = data;
    setDatabaseFile(database);
}