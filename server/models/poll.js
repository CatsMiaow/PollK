'use strict';

var mongoose = require('mongoose')
  , _ = require('underscore')
  , Schema = mongoose.Schema;

// 스키마 구조
var PollSchema = new Schema({
    ticket  : { type:Number, min:1000, max:9999, sparse: true },
    title   : { type:String, required:true, trim:true },
    password: { type:String, match: /^[0-9]{4}$/, lowercase:true, trim:true },
    minEntry: { type:Number, required:true, min:4 },
    characters: [{
        title: { type:String, required:true, trim:true },
        items: [{
            content: { type:String, required:true, trim:true }
        }]
    }],
    questions: [{
        isMulti: { type:Boolean, required:true },
        title: { type:String, required:true, trim:true },
        items: [{
            content: { type:String, required:true, trim:true }
        }]
    }],
    started: { type:Date, expires:'12h' },
    finished: { type:Boolean, default:false },
    created: { type:Date, default:Date.now },
    updated: { type:Date, default:Date.now }
});

// 후킹
PollSchema.pre('save', function(next) {
    if (this.isNew) {
        // console.log(this);
    }
    else {
        this.updated = new Date();
    }

    next();
});

// 자주쓰는 Model
PollSchema.static({
    load: function(id, callback, isCount, ticket) {
        var where = { _id: id, started: null, finished: false };

        if (ticket) {
            where.ticket = ticket;
            delete where.started;
        }
        
        if (isCount) {
            this.count(where, callback);
        } else {
            this.findOne(where, callback);
        }
    }
});


mongoose.model('Poll', PollSchema);