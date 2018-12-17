const mongodb = require('mongodb');
const moment = require('moment');

"use strict";
class User {
    constructor({displayName="", image="", id, emails=[{value:""}]}) {
        if (!(this instanceof User)) {
            return new User(profile)
        }
        this.fullName = displayName
        this.profilePicUrl=image.url
        this.dateAdded=moment().format('x')
        this.subscriptionStatus='basic'
        this.googleId=id
        this.email=emails[0].value
        this.twitterProfile={}
        this.linkedInProfile={}
        this.facebookProfile={}
        this.businessProfile={
                businessName:'',
                addresses:[{
                    address1:'',
                    address2:'',
                    city:'',
                    state:'',
                    country:'',
                    zipCode:''
                }],
                emailAddress:'',
                website:'',
                phone:'',
                logoUrl:'',
                contactEmails:[],
                twitter:'',
                linkedIn:'',
                facebook:''
            }
        this.verified=emails[0].value ? true : false
        this.contactedBusinesses=[];
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
                    googleId:1
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
        this.createIndexes();
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

    async getUser(query={}) {
        try {
            const user = await this.collection.findOne(query)
            return user;
        } catch(err) {
            throw new Error(err)
        }
    }

    async addUser({_json: profile}){
        const user = new User(profile)
        try {
            const {insertedId} = await this.collection.insertOne(user, {fullResult: true})
            console.log({insertedId})
            return insertedId
        } catch(err) {
            throw new Error(err)
        }
    }

}

module.exports = UsersDAO