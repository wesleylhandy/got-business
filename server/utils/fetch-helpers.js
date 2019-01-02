const fetch = require('node-fetch');
/**
 * Asynchronous function
 * @param {string} uri - Endpoint being called
 * @param {Object} [options={}] - Request Options Object to set headers, method, body, etc
 * @returns {string|Object} - Resolves data being requested or Rejects Error
 */
async function callApi(uri, options = {}) {
    let data;
    try {
        data = await loadData(uri, options);
    } catch (err) {
        console.error(err)
        throw new Error(err.message);
    }

    return data;
}

/**
 * Calls FETCH API and expects Text or JSON response
 * @param {string} uri -  Endpoint being called
 * @param {Object} [options={}] - Options being passed to Fetch API
 * @returns {Object|string} - will return JSON if contentType is json or String if not, and an Error Object if call failes
 */
async function loadData(uri, options = {}) {
    let response = await fetch(uri, options);
    const contentType = response.headers.get("content-type");
    if (response.status >= 200 && response.status < 300) { 
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            return response.text();
        }
    } else {
        
        return getErrorBody(response, contentType)
            .then(body=>{
                return Promise.reject(body)
            })
    }
}

async function getErrorBody(response, contentType = 'text') {
    let body;
    if (contentType.includes('application/json')) {
        body = await response.json();
    } else {
        body = await response.text();
    }
    return body;
}

module.exports = callApi