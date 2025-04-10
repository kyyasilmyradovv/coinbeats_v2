const { validate } = require('uuid');
const validator = require('validator');

// Required fields for each models' creation(post)
let requiredFields = {
  login: ['email', 'password'],
  send_me_code: ['email'],
  refresh_token: ['refreshToken'],
  verify: ['email', 'code'],
  profile: [],
  submit_quiz: ['questionId', 'choiceId', 'seconds'],
};

// Common Functions
let parentFunctions = {
  isString: function (value) {
    return typeof value === 'string';
  },
  isNumber: function (value) {
    return typeof value === 'number';
  },
  isInteger: function (value) {
    return Number.isInteger(value);
  },
  isFloat: function (value) {
    return typeof value === 'number' && !Number.isInteger(value);
  },
  isObject: function (value) {
    return typeof value === 'object';
  },
  isBoolean: function (value) {
    return typeof value === 'boolean' || ['true', 'false'].includes(value);
  },
  isDate: function (value) {
    return Date.parse(value);
  },
  isTime: function (value) {
    return (
      typeof value === 'string' && new RegExp('([01]?[0-9]|2[0-3]):[0-5][0-9]')
    );
  },
  isEmail: function (value) {
    return validator.isEmail(value);
  },
  isUuid: function (value) {
    return validate(value);
  },
  isArrayOfIntegers: function (value) {
    return Array.isArray(value) && value.every((e) => Number.isInteger(e));
  },
  isArrayOfStrings: function (value) {
    return Array.isArray(value) && value.every((e) => typeof e === 'string');
  },
  isArrayOfUuids: function (value) {
    return Array.isArray(value) && value.every((e) => validate(e));
  },
  isArrayOfObjects: function (value) {
    return (
      Array.isArray(value) && value.every((e) => typeof value === 'object')
    );
  },
  isScore: function (value) {
    return typeof value === 'number' && 0 <= value && value <= 5;
  },
  isPhoneNumber: function (value) {
    return (
      typeof value === 'string' &&
      value.length === 11 &&
      value.substring(0, 3) === '993' &&
      +value <= 99371999999
    );
  },
};

// Validators for all fields of all models
let typeCheckers = {
  // String
  password: parentFunctions.isString,
  name: parentFunctions.isString,
  page: parentFunctions.isString,
  description: parentFunctions.isString,
  referral_profile: parentFunctions.isString,
  refreshToken: parentFunctions.isString,
  code: parentFunctions.isString,
  // Number
  order: parentFunctions.isNumber,
  count: parentFunctions.isNumber,
  value: parentFunctions.isNumber,
  choiceId: parentFunctions.isNumber,
  questionId: parentFunctions.isNumber,
  seconds: parentFunctions.isNumber,
  // Score
  rate: parentFunctions.isScore,
  // Boolean
  isActive: parentFunctions.isBoolean,
  // Date
  auto_close_at: parentFunctions.isDate,
  // Uuid
  movieUuid: parentFunctions.isUuid,
  // Array of strings
  accesses: parentFunctions.isArrayOfStrings,
  // Array of uuids
  awardUuids: parentFunctions.isArrayOfUuids,
  audioUuids: parentFunctions.isArrayOfUuids,
  // Array of objects
  coins: parentFunctions.isArrayOfObjects,
  // Customized validators
  email: parentFunctions.isEmail,
  phone: parentFunctions.isPhoneNumber,
  language: function (value) {
    return typeof value === 'string' && ['tm', 'ru'].includes(value);
  },
};

exports.checkInputs = (model, action) => {
  return (req, res, next) => {
    let requiredFields_ = requiredFields[model];
    let requestBody = req.body;
    let requestKeys = Object.keys(requestBody);

    // Return error if all required fields are not provided, works for only create(post) requests
    if (
      action === 'create' &&
      !requiredFields_.every((e) => e in requestBody)
    ) {
      let notProvidedFields = requiredFields_.filter(
        (e) => !Object.keys(requestBody).includes(e)
      );
      return res.status(400).send({
        message: `Invalid Credentials. Not provided fields: ${notProvidedFields.join(
          ', '
        )}`,
      });
    }

    // Return error if even one field is provided with invalid variable type or required field has null as value
    for (key of requestKeys) {
      if (
        !typeCheckers[key] ||
        (requestBody[key] === null && requiredFields_.includes(key)) ||
        (requestBody[key] !== null && !typeCheckers[key](requestBody[key]))
      ) {
        return res.status(400).send({
          message: `Invalid credentials: ${key}`,
        });
      }
    }

    return next();
  };
};
