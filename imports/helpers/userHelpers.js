/***** all common helpers related to Users will be added here *****/

export const userHelpers = {
    userRole() {
        return Session.get("userRole");
    }
};