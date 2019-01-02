const mongodb = require('mongodb');
const moment = require('moment')
const getNewBusinessLicenses = require('../utils/get-new-business-licenses')

"use strict";
class LicensesDAO {

    constructor(db) {
        if (!(this instanceof LicensesDAO)) {
            return new LicensesDAO(db)
        }
        this.db = db;
        this.collection = db.collection('licenses');
        this.lastUpdate = 0;
        this.indexes = [ 
            { 
                key: { 
                    govId:1, 
                    trade_name_of_business: 1
                }, 
                name: "GovID", 
                unique: true, 
                background: true 
            }, { 
                key: { 
                    geocoded_column:"2dsphere" 
                }, 
                name: "GeoLocation" 
            }, {
                key: {
                    business_classification: "text",
                },
                "name": "BusinessCategory",
                "background":true
            }, {
                key: { 
                    dateAdded: -1 
                }, 
                name: "DateAddedToDB"
            }
        ]
        this.createIndexes();
        this.getLastUpdateTimestamp();
    }

    shouldGetNewLicenses(lastUpdate) {
        const previousTimestamp = moment(lastUpdate, 'x')
        // console.log({previousTimestamp, lastUpdate})
        const currentTimestamp = moment()
        const elapsed = currentTimestamp.diff(previousTimestamp, 'days')
        console.log({previousTimestamp: previousTimestamp.format('MMM Do YYYY, hh:mm:ss a'), currentTimestamp: currentTimestamp.format('MMM Do YYYY, hh:mm:ss a'), daysElapsed: elapsed})
        return elapsed > 0
    }

    async createIndexes() {
        try {
            const result = await this.collection.createIndexes(this.indexes)
            console.log({ Licenses: { CreateIndexesResult: result } })
        } catch (err) {
            console.log("Create Index Error")
            console.error(JSON.stringify(err, null, 2))
        }
    }

    async insertBusinesses(records){
        const dateAdded  = moment().format('x')
        //transform record
        let businesses = records.map(record=>{
            const discoveryDate = moment(new Date(record.discovery_date))
            const year = discoveryDate.format("YYYY")
            record.govId = "VB" + year + ("00000" + record.id).slice(-6)
            record.dateAdded = dateAdded
            record.discovery_date = discoveryDate.format("x")
            record.google_verified = false
            delete record.id
            return record
        })

        let docs = []
        try {
            const { businesses, err } = await this.getAllBusinesses()
            docs = businesses
            console.log({"CurrentBusinesses": docs.length})
            if (err) {
                console.log('Unable to retrieve docs')
                console.error(JSON.stringify(err, null, 2))
                return { success: false, err }
            }
        } catch (err) {
            console.log('Unable to retrieve docs')
            console.error(JSON.stringify(err, null, 2))
            return { success: false, err }
        }

        const govIds = docs.map(doc=>doc.govId)
        businesses = businesses.filter(business=> {
            const returnValue = !govIds.includes(business.govId)
            govIds.push(business.govId)
            return returnValue
        })

        console.log({ NewBusinesses: businesses.length })
        if (businesses.length) {
            try {
                const {result} = await this.collection.insertMany(businesses)
                console.log({ insertedCount: result.n })
                this.lastUpdate = dateAdded
            } catch (err) {
                console.log("Insert Many Error")
                console.error(JSON.stringify(err, null, 2))
                return { success: false,  err }
            }
        } else {
            console.log({ insertedCount: 0 })
        }

        return { success: true }
    }

    async removeBusiness(record) {
        try {
            this.collection.deleteOne({ record })
        } catch (err) {
            console.log("Delete One Error")
            console.error(JSON.stringify(err, null, 2))
            return { success: false, err}
        }
        return { success: true }
    }

    async updateBusiness(record) {
        //needs logic
        return { success: true }
    }

    async getfilteredBusinesses(category="", start = 0, step = 5000) {
        const query = category ? { $text: { $search: category, $caseSensitive: false } } : {}
        console.log({query})
        const cursor = this.collection.find(query, { skip: +start, limit: +step });
        try {
            const docs = await cursor.toArray()
            return { success: true, businesses: docs }
        } catch (err) {
            return { success: false, err }
        }
    }

    async getAllBusinesses() {
        const cursor = this.collection.find({});
        try {
            const docs = await cursor.toArray()
            return { success: true, businesses: docs }
        } catch (err) {
            return { success: false, err }
        }
    }
    async getBusinessCount(){
        try {
            const count = await this.collection.countDocuments({})
            return count;
        } catch (err) {
            throw new Error(err)
        }
    }

    async getLastUpdateTimestamp() {
        const cursor = await this.collection.find({}).sort({dateAdded: -1}).limit(1)
        try {
            const docs = await cursor.toArray()
            // console.log({docs})
            // console.log({dateAdded: docs[0].dateAdded})
            if (docs.length) {
                const lastUpdate = docs[0].dateAdded
                this.lastUpdate = lastUpdate
                if (this.shouldGetNewLicenses(lastUpdate)) {
                    getNewBusinessLicenses(this)
                } 
            } else {
                getNewBusinessLicenses(this)
            }
        } catch (err) {
            return { success: false, err }
        }
    }
}

module.exports = LicensesDAO;