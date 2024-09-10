/***** all common helpers related to Remotes will be added here *****/

export const remotesHelpers = {
    getRemotes() {
        return Session.get("remotes");
    }
};