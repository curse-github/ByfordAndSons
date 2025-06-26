import { userType, getDatabaseTable, setDatabaseTable } from "./databaseHandler";
async function getUsers(): Promise<userType[]> {
    return await getDatabaseTable("users");
}
async function setUsers(users: userType[]): Promise<void> {
    return await setDatabaseTable("users", users);
}
// returns user_id or -1
export async function validateLogin(email: string, pass_hash: string): Promise<number> {
    const users: userType[] = await getUsers();
    for (let i = 0; i < users.length; i++) {
        const user: userType = users[i];
        if (email != user.email) continue;
        if (pass_hash != user.pass_hash) continue;
        return user.user_id;
    }
    return -1;
}

export async function ensureUser(user_id: number): Promise<boolean> {
    const users: userType[] = await getUsers();
    for (let i = 0; i < users.length; i++)
        if (users[i].user_id == user_id)
            return true;
    return false;
}
export async function getUserByUserId(user_id: number): Promise<userType|undefined> {
    const users: userType[] = await getUsers();
    for (let i = 0; i < users.length; i++)
        if (users[i].user_id == user_id) {
            const user: userType = users[i];
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
}
export async function setUserDataByUserId(user_id: number, email: string, first_name: string, last_name: string, phone: string): Promise<void> {
    let users: userType[] = await getUsers();
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
}

// accountType
export async function getUserTypeByUserId(user_id: number): Promise<"support"|"user"|undefined> {
    const users: userType[] = await getUsers();
    for (let i = 0; i < users.length; i++)
        if (users[i].user_id == user_id)
            return users[i].accountType;
    return undefined;
}

// email
export async function getUserEmailByUserId(user_id: number): Promise<string|undefined> {
    const users: userType[] = await getUsers();
    for (let i = 0; i < users.length; i++)
        if (users[i].user_id == user_id)
            return users[i].email;
    return undefined;
}
// returns user_id or -1
export async function getUserIdByUserEmail(email: string): Promise<number> {
    const users: userType[] = await getUsers();
    for (let i = 0; i < users.length; i++)
        if (users[i].email == email)
            return users[i].user_id;
    return -1;
}

// pass_hash
export async function getPassHashByUserId(user_id: number): Promise<string|undefined> {
    const users: userType[] = await getUsers();
    for (let i = 0; i < users.length; i++)
        if (users[i].user_id == user_id)
            return users[i].pass_hash;
    return undefined;
}
export async function setPassHashByUserId(user_id: number, pass_hash: string): Promise<void> {
    let users: userType[] = await getUsers();
    for (let i = 0; i < users.length; i++) {
        if (users[i].user_id == user_id) {
            users[i].pass_hash = pass_hash;
            setUsers(users);
            return;
        }
    }
}

// first_name
export async function getUserFirstNameByUserId(user_id: number): Promise<string|undefined> {
    const users: userType[] = await getUsers();
    for (let i = 0; i < users.length; i++)
        if (users[i].user_id == user_id)
            return users[i].first_name;
    return undefined;
}
// last_name
export async function getUserLastNameByUserId(user_id: number): Promise<string|undefined> {
    const users: userType[] = await getUsers();
    for (let i = 0; i < users.length; i++)
        if (users[i].user_id == user_id)
            return users[i].last_name;
    return undefined;
}
// first_name+" "+last_name
export async function getUserFullNameByUserId(user_id: number): Promise<string|undefined> {
    const users: userType[] = await getUsers();
    for (let i = 0; i < users.length; i++)
        if (users[i].user_id == user_id)
            return users[i].first_name + " " + users[i].last_name;
    return undefined;
}
// phone
export async function getUserPhoneByUserId(user_id: number): Promise<string|undefined> {
    const users: userType[] = await getUsers();
    for (let i = 0; i < users.length; i++)
        if (users[i].user_id == user_id)
            return users[i].phone;
    return undefined;
}