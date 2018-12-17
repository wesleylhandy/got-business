const mongodb = require('mongodb');
const moment = require('moment');

"use strict";
class User {
    constructor(username, password) {
        if (!(this instanceof User)) {
            return new User(username, password)
        }
        this.profile = {
            username,
            password,
            fullName: '',
            profilePicUrl: '',
            dateAdded: moment().format('x'),
            subscriptionStatus: 'basic',
            twitter: '',
            linkedIn: '',
            facebook: '',
            businessProfile: {
                businessName: '',
                addresses: [{
                    address1: '',
                    address2: '',
                    city: '',
                    state:'',
                    country: '',
                    zipCode: ''
                }],
                emailAddress: '',
                website: '',
                phone: '',
                logoUrl: '',
                contactEmails: [],
                twitter: '',
                linkedIn: '',
                facebook: ''
            },
            verified: false,
            contactedBusinesses: []
        }
    }
}

class UsersDAO {

    constructor(db) {
        if (!(this instanceof UsersDAO)) {
            return new UsersDAO(db)
        }
        this.db = db;
        this.collection = db.collection('users');
        this.indexes = [ 
            { 
                key: { 
                    email_address:1
                }, 
                name: "UserName", 
                unique: true, 
                background: true 
            }, {
                key: {
                    subscription_status: 1
                },
                name: "SubscriptionStatus"
            }, {
                key: { 
                    dateAdded: -1 
                }, 
                name: "DateAddedToDB"
            }
        ]
    }

    async createIndexes() {
        try {
            const result = await this.collection.createIndexes(this.indexes)
            console.log({ Users: { CreateIndexesResult: result } })
        } catch (err) {
            console.log("Create Index Error")
            console.error({ err })
        }
    }

}

module.exports = UsersDAO