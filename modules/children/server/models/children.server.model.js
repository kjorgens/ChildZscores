'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Child Schema
 */
var ChildSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  birthDate: {
    type: Date,
    default: Date.now
  },
  monthAge: {
    type: Number,
    default: '',
    trim: true
  },
  firstName: {
    type: String,
    default: '',
    trim: true,
    required: 'Name cannot be blank'
  },
  lastName: {
    type: String,
    default: '',
    trim: true,
    required: 'Last Name cannot be blank'
  },
  weight: {
    type: Number,
    default: '',
    trim: true,
    required: 'weight cannot be blank'
  },
  height: {
    type: Number,
    default: '',
    trim: true,
    required: 'height cannot be blank'
  },
  comments: {
    type: String,
    default: '',
    trim: true
  },
  father: {
    type: String,
    default: '',
    trim: true
  },
  mother: {
    type: String,
    default: '',
    trim: true
  },
  // branch: {
  //  type: String,
  //  default: '',
  //  trim: true
  // },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Child', ChildSchema);
