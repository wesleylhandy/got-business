const mongodb = require('mongodb');
const moment = require('moment')
"use strict";
class BusinessDAO {

    constructor(db) {
        this.db = db;
        this.collection = db.collection('businesses');
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
                    trade_name_of_business: 1 
                }, 
                name: "BusinessName" 
            } , {
                key: {
                    business_classification: 1
                },
                name: "BusinessCategory"
            }
        ]
        this.createIndexes();
    }

    async createIndexes() {
        try {
            const result = await this.collection.createIndexes(this.indexes)
            console.log({ createIndexes: result })
        } catch (err) {
            console.log("Create Index Error")
            console.error({ err })
        }
    }
    async insertBusinesses(records){
        const Timestamp = mongodb.Timestamp;
        const dateAdded  = new Timestamp(moment().format('x'))
        //transform record
        let businesses = records.map(record=>{
            const discoveryDate = new Timestamp(moment(record.discovery_date).format('x'))
            record.govId = ("000" + record.id).slice(-5)
            record.called = false
            record.calledDate = null
            record.notes = ""
            record.dateAdded = dateAdded
            record.discovery_date = discoveryDate
            delete record.id
            return record
        })

        let docs = []
        try {
            docs = await this.getAllBusinesses()
        } catch (err) {
            console.log('Unable to retrieve docs')
            console.error({err})
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
            } catch (err) {
                console.log("Insert Many Error")
                console.error({ err })
                return { success: false,  err }
            }
        } else {
            console.log({ insertedCount: 0 })
        }

        return { success: true, businesses: await this.getAllBusinesses() }
    }

    async removeBusiness(record) {
        try {
            this.collection.deleteOne({ record })
        } catch (err) {
            console.log("Delete One Error")
            console.error({err})
            return { success: false, err}
        }
        return { success: true, businesses: await this.getAllBusinesses() }
    }

    async updateBusiness(record) {
        //needs logic
        return { success: true, businesses: await this.getAllBusinesses() }
    }

    async getfilteredBusinesses(type, start= 0, max = 5000, offset = 0) {

    }

    async getAllBusinesses() {
        const cursor = this.collection.find({});
        try {
            const docs = await cursor.toArray()
            return docs
        } catch (err) {
            throw new Error(err)
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
}

module.exports = BusinessDAO;