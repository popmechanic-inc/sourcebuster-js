"use strict";

var prefix = '';
var delimiter = require('../data').delimiter;

module.exports = {

    setPrefix: function(p) {
        prefix = p;
    },

    getPrefix: function() {
        return prefix;
    },

    encodeData: function(s) {
        return prefix + encodeURIComponent(s).replace(/\!/g, '%21')
                .replace(/\~/g, '%7E')
                .replace(/\*/g, '%2A')
                .replace(/\'/g, '%27')
                .replace(/\(/g, '%28')
                .replace(/\)/g, '%29');
    },

    decodeData: function(s) {
        try {
            return decodeURIComponent(s.replace(new RegExp('^' + prefix), '')).replace(/\%21/g, '!')
                .replace(/\%7E/g, '~')
                .replace(/\%2A/g, '*')
                .replace(/\%27/g, "'")
                .replace(/\%28/g, '(')
                .replace(/\%29/g, ')');
        } catch(err1) {
            // try unescape for backward compatibility
            try { return unescape(s); } catch(err2) { return ''; }
        }
    },

    set: function(name, value, minutes) {
        var expires;

        if (minutes) {
            var date = new Date();
            date.setTime(date.getTime() + (minutes * 60 * 1000));
            expires = date.valueOf();
        } else {
            expires = '';
        }

        localStorage.setItem(
            this.encodeData(name),
            JSON.stringify({
                value: value,
                expires: expires
            })
        );
    },

    get: function(name) {
        var lsName = this.encodeData(name);

        var savedValue = localStorage.getItem(lsName);
        if (savedValue) {
            savedValue = JSON.parse(savedValue);

            if (savedValue.expires && (parseInt(savedValue.expires) < (new Date()).valueOf())) {
                savedValue = null;
                localStorage.removeItem(lsName);

                return null;
            }

            return savedValue.value;
        }

        return null;
    },


    parse: function(yummy) {

        var cookies = [],
            data    = {};

        if (typeof yummy === 'string') {
            cookies.push(yummy);
        } else {
            for (var prop in yummy) {
                if (yummy.hasOwnProperty(prop)) {
                    cookies.push(yummy[prop]);
                }
            }
        }

        for (var i1 = 0; i1 < cookies.length; i1++) {
            var cookie_array;
            data[this.unsbjs(cookies[i1])] = {};
            if (this.get(cookies[i1])) {
                cookie_array = this.get(cookies[i1]).split(delimiter);
            } else {
                cookie_array = [];
            }
            for (var i2 = 0; i2 < cookie_array.length; i2++) {
                var tmp_array = cookie_array[i2].split('='),
                    result_array = tmp_array.splice(0, 1);
                result_array.push(tmp_array.join('='));
                data[this.unsbjs(cookies[i1])][result_array[0]] = this.decodeData(result_array[1]);
            }
        }

        return data;

    },

    destroy: function(name) {
        localStorage.removeItem(this.encodeData(name));
    },

    unsbjs: function (string) {
        return string.replace('sbjs_', '');
    }

};
