/**
 * Get token
 * @returns 
 */
export function getToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("whatsappToken", (result) => {
            if (result.whatsappToken) {
                resolve(result.whatsappToken);
            } else {
                reject("No token found");
            }
        });
    });
}

/**
 * Set token
 * @param {*} token 
 * @returns 
 */
export function setToken(token) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ whatsappToken: token }, () => {
        });
    });
}