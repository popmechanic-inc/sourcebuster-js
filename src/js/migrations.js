"use strict";

var data = require('./data'),
    cookies = require('./helpers/cookies'),
    ls = require('./helpers/localStorage');


module.exports = {

    go: function (lifetime, domain, isolate) {

        var migrate = this.migrations,
            _with = {l: lifetime, d: domain, i: isolate};

        var i;
        var mids = [];
        var advance = '';

        cookies.setPrefix(ls.getPrefix());
        if (!cookies.get(data.containers.first) && !cookies.get(data.service.migrations)) {

            for (i = 0; i < migrate.length; i++) {
                mids.push(migrate[i].id);
            }

            advance = '';
            for (i = 0; i < mids.length; i++) {
                advance += mids[i] + '=1';
                if (i < mids.length - 1) {
                    advance += data.delimiter;
                }
            }
            cookies.set(data.service.migrations, advance, _with.l, _with.d, _with.i);

        } else if (!cookies.get(data.service.migrations)) {

            // We have only one migration for now, so just
            for (i = 0; i < migrate.length; i++) {
                migrate[i].go(migrate[i].id, _with);
            }

        } else {
            mids = cookies.get(data.service.migrations).split(data.delimiter);
            for (i = 0; i < migrate.length; i++) {
                if (mids.indexOf(migrate[i].id + '=1') === -1) {
                    console.log('migrating: ' + migrate[i]);
                    migrate[i].go(migrate[i].id, _with);
                }
            }

            mids = [];
            for (i = 0; i < migrate.length; i++) {
                mids.push(migrate[i].id);
            }

            advance = '';
            for (i = 0; i < mids.length; i++) {
                advance += mids[i] + '=1';
                if (i < mids.length - 1) {
                    advance += data.delimiter;
                }
            }
            cookies.set(data.service.migrations, advance, _with.l, _with.d, _with.i);
        }

    },

    migrations: [

        {
            id: '1418474375998',
            version: '1.0.0-beta',
            go: function (mid, _with) {

                var success = mid + '=1',
                    fail = mid + '=0';

                var safeReplace = function ($0, $1, $2) {
                    return ($1 || $2 ? $0 : data.delimiter);
                };

                try {

                    // Switch delimiter and renew cookies
                    var _in = [];
                    for (var prop in data.containers) {
                        if (data.containers.hasOwnProperty(prop)) {
                            _in.push(data.containers[prop]);
                        }
                    }

                    for (var i = 0; i < _in.length; i++) {
                        if (cookies.get(_in[i])) {
                            var buffer = cookies.get(_in[i]).replace(/(\|)?\|(\|)?/g, safeReplace);
                            cookies.destroy(_in[i], _with.d, _with.i);
                            cookies.destroy(_in[i], _with.d, !_with.i);
                            cookies.set(_in[i], buffer, _with.l, _with.d, _with.i);
                        }
                    }

                    // Update `session`
                    if (cookies.get(data.containers.session)) {
                        cookies.set(data.containers.session, data.pack.session(0), _with.l, _with.d, _with.i);
                    }

                    // Yay!
                    cookies.set(data.service.migrations, success, _with.l, _with.d, _with.i);

                } catch (err) {
                    // Oops
                    cookies.set(data.service.migrations, fail, _with.l, _with.d, _with.i);
                }
            }
        },
        {
            id: '1471519752600',
            version: '1.0.5',
            go: function (mid, _with) {

                var success = mid + '=1',
                    fail = mid + '=0',
                    oldPrefix = '',
                    newPrefix = cookies.getPrefix();

                try {
                    cookies.setPrefix(oldPrefix);

                    var _in = [];
                    for (var prop in data.containers) {
                        if (data.containers.hasOwnProperty(prop)) {
                            _in.push(data.containers[prop]);
                        }
                    }

                    for (var i = 0; i < _in.length; i++) {
                        cookies.setPrefix(oldPrefix);
                        if (cookies.get(_in[i])) {
                            var buffer = cookies.get(_in[i]);
                            cookies.setPrefix(newPrefix);
                            cookies.set(_in[i], buffer, _with.l, _with.d, _with.i);
                        }
                    }

                    // Update `session`
                    cookies.setPrefix(oldPrefix);
                    if (cookies.get(data.containers.session)) {
                        cookies.setPrefix(newPrefix);
                        cookies.set(data.containers.session, data.pack.session(0), _with.l, _with.d, _with.i);
                    }

                    // Yay!
                    cookies.setPrefix(newPrefix);
                    cookies.set(data.service.migrations, success, _with.l, _with.d, _with.i);

                } catch (err) {
                    // Oops
                    cookies.set(data.service.migrations, fail, _with.l, _with.d, _with.i);
                }
            }
        },
        {
            "id": '1471519752605',
            "version": '1.1.0',
            go: function(mid, _with) {
                for (var k in data.containers) {
                    if (data.containers.hasOwnProperty(k)) {
                        var old = cookies.get(data.containers[k]);
                        ls.set(data.containers[k], old, _with.l);
                        cookies.destroy(data.containers[k]);
                    }
                }
            }
        }
    ]

};