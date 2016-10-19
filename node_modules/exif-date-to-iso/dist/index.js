'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var moment = require('moment-timezone');

exports.default = {
  timezones: function timezones() {
    return moment.tz.names();
  },
  toISO: function toISO(exifDate) {
    var timeZone = arguments.length <= 1 || arguments[1] === undefined ? 'America/Los_Angeles' : arguments[1];

    var result = null;

    if (exifDate) {
      var dateTime = exifDate.split(' ');
      var regex = new RegExp(':', 'g');
      dateTime[0] = dateTime[0].replace(regex, '-');
      var newDateTime = dateTime[0] + ' ' + dateTime[1];

      var resultDate = moment.tz(newDateTime, 'YYYY-MM-DD HH:mm:ss', timeZone);

      if (resultDate.isValid()) {
        result = resultDate.toISOString();
      }
    }

    return result;
  }
};
module.exports = exports['default'];
