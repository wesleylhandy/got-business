const callApi = require('./fetch-helpers')

async function getNewBusinessLicenses(licensesDAO) {

    const options = {
        method: "GET",
        headers: {
            "X-APP-Token": process.env.API_KEY,
            "Content-Type": 'application/json',
        }
    }
    const uri = process.env.VB_DATA_URI
    try {
        const businessData  = await callApi(uri, options)
        try {
            const { success } = await licensesDAO.insertBusinesses(businessData)
            if (!success) {
                console.log("Insert Licenses Error, no new documents added!")
            }
        } catch (err) {
            console.log("Insert Licenses Error, db down")
            console.error({err})
        }
    } catch (err) {
        console.log("License API ERROR")
        console.error({err})
    }

}

module.exports = getNewBusinessLicenses