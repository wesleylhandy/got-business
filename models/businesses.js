var mongodb = require('mongodb');
"use strict";
class BusinessDAO {

    constructor(db, collection) {
        this.db = db;
        this.collection = collection;
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
            } 
        ]
    }

    async createIndexes() {
        try {
            const result = await this.collection.createIndexes(this.indexes)
            console.log({ result })
        } catch (err) {
            console.log("Create Index Error")
            console.error({ err })
        }
    }
    async insertBusinesses(records){
        //transform record
        let businesses = records.map(record=>{
            record.govId = ("000" + record.id).slice(-5)
            record.called = false
            record.calledDate = null
            record.notes = ""
            delete record.id
            return record
        })

        let docs = []
        try {
            docs = await this.getBusinesses()
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

        return { success: true, businesses: await this.getBusinesses() }
    }

    async removeBusiness(record) {
        try {
            this.collection.deleteOne({ record })
        } catch (err) {
            console.log("Delete One Error")
            console.error({err})
            return { success: false, err}
        }
        return { success: true, businesses: await this.getBusinesses() }
    }

    async updateBusiness(record) {
        //needs logic
        return { success: true, businesses: await this.getBusinesses() }
    }

    async getBusinesses() {
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