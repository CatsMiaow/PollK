'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

// 스키마 구조
var PollReplySchema = new Schema({
    _id: { type:Schema.Types.ObjectId, required:true },
    itemMulti: [{
        _id: { type:Schema.Types.ObjectId, required:true },
        reply: [{
            _id: { type:Schema.Types.ObjectId, required:true },
            user: { type:String, required:true, trim:true }
        }]
    }],
    itemShort: [{
        _id: { type:Schema.Types.ObjectId, required:true },
        reply: [{
            user: { type:String, required:true, trim:true },
            content: { type:String, required:true, trim:true }
        }]
    }],
    characters: [{
        _id: { type:Schema.Types.ObjectId, required:true },
        reply: [{
            _id: { type:Schema.Types.ObjectId, required:true },
            user: { type:String, required:true, trim:true }
        }]
    }],
    users: [{
        _id: { type:String, required:true, trim:true },
        ip: { type:String, trim:true },
        agent: { type:String, trim:true }
    }],
    created: { type: Date, default: Date.now }
});

// 후킹
PollReplySchema.pre('save', function(next) {

    next();
});

// 자주쓰는 Model
PollReplySchema.static({
    load: function(id, callback, isCount) {
        if (isCount) {
            this.count({ _id: id }, callback);
        } else {
            this.findOne({ _id: id }, callback);
        }
    }
});


mongoose.model('PollReply', PollReplySchema);