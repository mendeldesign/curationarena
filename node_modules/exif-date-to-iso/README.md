exif-date-to-iso
================
Convert an EXIF date to ISO 8601.

EXIF dates don't have a timezone, so a timezone name is passed in.

Future feature: Auto discovery of the timezone using an image's EXIF GPS coordinates.

Example Usage
-------------

### Convert to ISO in America/Los_Angeles timezone

    const exifDate = require('exif-date-to-iso');
    const exifDateTimeOriginal = '2015:03:17 19:39:10';

    console.log(exifDate.toISO(exifDateTimeOriginal, 'America/Los_Angeles'));

    '2015-03-18T02:39:10.000Z'

### For a list of all timezones

    exifDate.timezones();

### Unit tests

See `src/index.es6.spec.js`

Installation
------------

    npm install exif-date-to-iso

Build Status
------------

[![Build Status](https://travis-ci.org/briangershon/exif-date-to-iso.png?branch=master)](https://travis-ci.org/briangershon/exif-date-to-iso)
