!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.sbjs=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/js/sourcebuster.js":[function(_dereq_,module,exports){
"use strict";

var init = _dereq_('./init');

var sbjs = {
  init: function(prefs) {
    this.get = init(prefs);
    if (prefs && prefs.callback && typeof prefs.callback === 'function') {
      prefs.callback(this.get);
    }
  }
};

module.exports = sbjs;
},{"./init":"/Users/zlebnik/projects/sourcebuster-js/src/js/init.js"}],"/Users/zlebnik/projects/sourcebuster-js/src/js/data.js":[function(_dereq_,module,exports){
"use strict";

var terms = _dereq_('./terms'),
    utils = _dereq_('./helpers/utils');

var data = {

  containers: {
    current:          'sbjs_current',
    current_extra:    'sbjs_current_add',
    first:            'sbjs_first',
    first_extra:      'sbjs_first_add',
    session:          'sbjs_session',
    udata:            'sbjs_udata',
    promocode:        'sbjs_promo'
  },

  service: {
    migrations:       'sbjs_migrations'
  },

  delimiter:          '|||',

  aliases: {

    main: {
      type:           'typ',
      source:         'src',
      medium:         'mdm',
      campaign:       'cmp',
      content:        'cnt',
      term:           'trm'
    },

    extra: {
      fire_date:      'fd',
      entrance_point: 'ep',
      referer:        'rf'
    },

    session: {
      pages_seen:     'pgs',
      current_page:   'cpg'
    },

    udata: {
      visits:         'vst',
      ip:             'uip',
      agent:          'uag'
    },

    promo:            'code'

  },

  pack: {

    main: function(sbjs) {
      return (
        data.aliases.main.type      + '=' + sbjs.type     + data.delimiter +
        data.aliases.main.source    + '=' + sbjs.source   + data.delimiter +
        data.aliases.main.medium    + '=' + sbjs.medium   + data.delimiter +
        data.aliases.main.campaign  + '=' + sbjs.campaign + data.delimiter +
        data.aliases.main.content   + '=' + sbjs.content  + data.delimiter +
        data.aliases.main.term      + '=' + sbjs.term
      );
    },

    extra: function(timezone_offset) {
      return (
        data.aliases.extra.fire_date      + '=' + utils.setDate(new Date, timezone_offset) + data.delimiter +
        data.aliases.extra.entrance_point + '=' + document.location.href                   + data.delimiter +
        data.aliases.extra.referer        + '=' + (document.referrer || terms.none)
      );
    },

    user: function(visits, user_ip) {
      return (
        data.aliases.udata.visits + '=' + visits  + data.delimiter +
        data.aliases.udata.ip     + '=' + user_ip + data.delimiter +
        data.aliases.udata.agent  + '=' + navigator.userAgent
      );
    },

    session: function(pages) {
      return (
      data.aliases.session.pages_seen   + '=' + pages + data.delimiter +
      data.aliases.session.current_page + '=' + document.location.href
      );
    },

    promo: function(promo) {
      return (
        data.aliases.promo + '=' + utils.setLeadingZeroToInt(utils.randomInt(promo.min, promo.max), promo.max.toString().length)
      );
    }

  }
};

module.exports = data;
},{"./helpers/utils":"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/utils.js","./terms":"/Users/zlebnik/projects/sourcebuster-js/src/js/terms.js"}],"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/cookies.js":[function(_dereq_,module,exports){
"use strict";

var delimiter = _dereq_('../data').delimiter;

var prefix = '';

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

  set: function(name, value, minutes, domain, excl_subdomains) {
    var expires, basehost;

    if (minutes) {
      var date = new Date();
      date.setTime(date.getTime() + (minutes * 60 * 1000));
      expires = '; expires=' + date.toGMTString();
    } else {
      expires = '';
    }
    if (domain && !excl_subdomains) {
      basehost = ';domain=.' + domain;
    } else {
      basehost = '';
    }
    document.cookie = this.encodeData(name) + '=' + this.encodeData(value) + expires + basehost + '; path=/';
  },

  get: function(name) {
    var nameEQ = this.encodeData(name) + '=',
        ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') { c = c.substring(1, c.length); }
      if (c.indexOf(nameEQ) === 0) {
        return this.decodeData(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },

  destroy: function(name, domain, excl_subdomains) {
    this.set(name, '', -1, domain, excl_subdomains);
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

  unsbjs: function (string) {
    return string.replace('sbjs_', '');
  }

};

},{"../data":"/Users/zlebnik/projects/sourcebuster-js/src/js/data.js"}],"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/localStorage.js":[function(_dereq_,module,exports){
"use strict";

var prefix = '';
var delimiter = _dereq_('../data').delimiter;

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

},{"../data":"/Users/zlebnik/projects/sourcebuster-js/src/js/data.js"}],"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/uri.js":[function(_dereq_,module,exports){
"use strict";

module.exports = {

  parse: function(str) {
    var o = this.parseOptions,
        m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str),
        uri = {},
        i = 14;

    while (i--) { uri[o.key[i]] = m[i] || ''; }

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) { uri[o.q.name][$1] = $2; }
    });

    return uri;
  },

  parseOptions: {
    strictMode: false,
    key: ['source','protocol','authority','userInfo','user','password','host','port','relative','path','directory','file','query','anchor'],
    q: {
      name:   'queryKey',
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  },

  getParam: function(custom_params) {
    var query_string = {},
        query = custom_params ? custom_params : window.location.search.substring(1),
        vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (typeof query_string[pair[0]] === 'undefined') {
        query_string[pair[0]] = pair[1];
      } else if (typeof query_string[pair[0]] === 'string') {
        var arr = [ query_string[pair[0]], pair[1] ];
        query_string[pair[0]] = arr;
      } else {
        query_string[pair[0]].push(pair[1]);
      }
    }
    return query_string;
  },

  getHost: function(request) {
    return this.parse(request).host.replace('www.', '');
  }

};
},{}],"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/utils.js":[function(_dereq_,module,exports){
"use strict";

module.exports = {

  escapeRegexp: function(string) {
    return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },

  setDate: function(date, offset) {
    var utc_offset    = date.getTimezoneOffset() / 60,
        now_hours     = date.getHours(),
        custom_offset = offset || offset === 0 ? offset : -utc_offset;

    date.setHours(now_hours + utc_offset + custom_offset);

    var year    = date.getFullYear(),
        month   = this.setLeadingZeroToInt(date.getMonth() + 1,   2),
        day     = this.setLeadingZeroToInt(date.getDate(),        2),
        hour    = this.setLeadingZeroToInt(date.getHours(),       2),
        minute  = this.setLeadingZeroToInt(date.getMinutes(),     2),
        second  = this.setLeadingZeroToInt(date.getSeconds(),     2);

    return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
  },

  setLeadingZeroToInt: function(num, size) {
    var s = num + '';
    while (s.length < size) { s = '0' + s; }
    return s;
  },

  randomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

};

},{}],"/Users/zlebnik/projects/sourcebuster-js/src/js/init.js":[function(_dereq_,module,exports){
"use strict";

var data        = _dereq_('./data'),
    terms       = _dereq_('./terms'),
    cookies     = _dereq_('./helpers/localStorage'),
    uri         = _dereq_('./helpers/uri'),
    utils       = _dereq_('./helpers/utils'),
    params      = _dereq_('./params'),
    migrations  = _dereq_('./migrations');

module.exports = function(prefs) {

  var p         = params.fetch(prefs);
  var get_param = uri.getParam();
  var domain    = p.domain.host,
      isolate   = p.domain.isolate,
      lifetime  = p.lifetime;

  cookies.setPrefix(p.prefix);

  migrations.go(lifetime, domain, isolate);

  var __sbjs_type,
      __sbjs_source,
      __sbjs_medium,
      __sbjs_campaign,
      __sbjs_content,
      __sbjs_term;

  function mainData() {
    var sbjs_data;
    if (
        typeof get_param.utm_source        !== 'undefined' ||
        typeof get_param.utm_medium        !== 'undefined' ||
        typeof get_param.utm_campaign      !== 'undefined' ||
        typeof get_param.utm_content       !== 'undefined' ||
        typeof get_param.utm_term          !== 'undefined' ||
        typeof get_param.gclid             !== 'undefined' ||
        typeof get_param.yclid             !== 'undefined' ||
        typeof get_param[p.campaign_param] !== 'undefined'
      ) {
      setFirstAndCurrentExtraData();
      sbjs_data = getData(terms.traffic.utm);
    } else if (checkReferer(terms.traffic.organic)) {
      setFirstAndCurrentExtraData();
      sbjs_data = getData(terms.traffic.organic);
    } else if (!cookies.get(data.containers.session) && checkReferer(terms.traffic.referral)) {
      setFirstAndCurrentExtraData();
      sbjs_data = getData(terms.traffic.referral);
    } else if (!cookies.get(data.containers.first) && !cookies.get(data.containers.current)) {
      setFirstAndCurrentExtraData();
      sbjs_data = getData(terms.traffic.typein);
    } else {
      return cookies.get(data.containers.current);
    }

    return sbjs_data;
  }

  function getData(type) {

    switch (type) {

      case terms.traffic.utm:

        __sbjs_type = terms.traffic.utm;

        if (typeof get_param.utm_source !== 'undefined') {
          __sbjs_source = get_param.utm_source;
        } else if (typeof get_param.gclid !== 'undefined') {
          __sbjs_source = 'google';
        } else if (typeof get_param.yclid !== 'undefined') {
          __sbjs_source = 'yandex';  
        } else {
          __sbjs_source = terms.none;
        }

        if (typeof get_param.utm_medium !== 'undefined') {
          __sbjs_medium = get_param.utm_medium;
        } else if (typeof get_param.gclid !== 'undefined') {
          __sbjs_medium = 'cpc';
        } else if (typeof get_param.yclid !== 'undefined') {
          __sbjs_medium = 'cpc';  
        } else {
          __sbjs_medium = terms.none;
        }

        if (typeof get_param.utm_campaign !== 'undefined') {
          __sbjs_campaign = get_param.utm_campaign;
        } else if (typeof get_param[p.campaign_param] !== 'undefined') {
          __sbjs_campaign = get_param[p.campaign_param];
        } else if (typeof get_param.gclid !== 'undefined') {
          __sbjs_campaign = 'google_cpc';
        } else if (typeof get_param.yclid !== 'undefined') {
          __sbjs_campaign = 'yandex_cpc';  
        } else {
          __sbjs_campaign = terms.none;
        }

        __sbjs_content  = get_param.utm_content || terms.none;
        __sbjs_term     = getUtmTerm()          || terms.none;
        break;

      case terms.traffic.organic:
        __sbjs_type     = terms.traffic.organic;
        __sbjs_source   = __sbjs_source || uri.getHost(document.referrer);
        __sbjs_medium   = terms.referer.organic;
        __sbjs_campaign = terms.none;
        __sbjs_content  = terms.none;
        __sbjs_term     = terms.none;
        break;

      case terms.traffic.referral:
        __sbjs_type     = terms.traffic.referral;
        __sbjs_source   = __sbjs_source || uri.getHost(document.referrer);
        __sbjs_medium   = __sbjs_medium || terms.referer.referral;
        __sbjs_campaign = terms.none;
        __sbjs_content  = uri.parse(document.referrer).path;
        __sbjs_term     = terms.none;
        break;

      case terms.traffic.typein:
        __sbjs_type     = terms.traffic.typein;
        __sbjs_source   = p.typein_attributes.source;
        __sbjs_medium   = p.typein_attributes.medium;
        __sbjs_campaign = terms.none;
        __sbjs_content  = terms.none;
        __sbjs_term     = terms.none;
        break;

      default:
        __sbjs_type     = terms.oops;
        __sbjs_source   = terms.oops;
        __sbjs_medium   = terms.oops;
        __sbjs_campaign = terms.oops;
        __sbjs_content  = terms.oops;
        __sbjs_term     = terms.oops;
    }
    var sbjs_data = {
      type:             __sbjs_type,
      source:           __sbjs_source,
      medium:           __sbjs_medium,
      campaign:         __sbjs_campaign,
      content:          __sbjs_content,
      term:             __sbjs_term
    };

    return data.pack.main(sbjs_data);

  }

  function getUtmTerm() {
    var referer = document.referrer;
    if (get_param.utm_term) {
      return get_param.utm_term;
    } else if (referer && uri.parse(referer).host && uri.parse(referer).host.match(/^(?:.*\.)?yandex\..{2,9}$/i)) {
      try {
        return uri.getParam(uri.parse(document.referrer).query).text;
      } catch (err) {
        return false;
      }
    } else {
      return false;
    }
  }

  function checkReferer(type) {
    var referer = document.referrer;
    switch(type) {
      case terms.traffic.organic:
        return (!!referer && checkRefererHost(referer) && isOrganic(referer));
      case terms.traffic.referral:
        return (!!referer && checkRefererHost(referer) && isReferral(referer));
      default:
        return false;
    }
  }

  function checkRefererHost(referer) {
    if (p.domain) {
      if (!isolate) {
        var host_regex = new RegExp('^(?:.*\\.)?' + utils.escapeRegexp(domain) + '$', 'i');
        return !(uri.getHost(referer).match(host_regex));
      } else {
        return (uri.getHost(referer) !== uri.getHost(domain));
      }
    } else {
      return (uri.getHost(referer) !== uri.getHost(document.location.href));
    }
  }

  function isOrganic(referer) {

    var y_host  = 'yandex',
        y_param = 'text',
        g_host  = 'google';

    var y_host_regex  = new RegExp('^(?:.*\\.)?'  + utils.escapeRegexp(y_host)  + '\\..{2,9}$'),
        y_param_regex = new RegExp('.*'           + utils.escapeRegexp(y_param) + '=.*'),
        g_host_regex  = new RegExp('^(?:www\\.)?' + utils.escapeRegexp(g_host)  + '\\..{2,9}$');

    if (
        !!uri.parse(referer).query &&
        !!uri.parse(referer).host.match(y_host_regex) &&
        !!uri.parse(referer).query.match(y_param_regex)
      ) {
      __sbjs_source = y_host;
      return true;
    } else if (!!uri.parse(referer).host.match(g_host_regex)) {
      __sbjs_source = g_host;
      return true;
    } else if (!!uri.parse(referer).query) {
      for (var i = 0; i < p.organics.length; i++) {
        if (
            uri.parse(referer).host.match(new RegExp('^(?:.*\\.)?' + utils.escapeRegexp(p.organics[i].host)  + '$', 'i')) &&
            uri.parse(referer).query.match(new RegExp('.*'         + utils.escapeRegexp(p.organics[i].param) + '=.*', 'i'))
          ) {
          __sbjs_source = p.organics[i].display || p.organics[i].host;
          return true;
        }
        if (i + 1 === p.organics.length) {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  function isReferral(referer) {
    if (p.referrals.length > 0) {
      for (var i = 0; i < p.referrals.length; i++) {
        if (uri.parse(referer).host.match(new RegExp('^(?:.*\\.)?' + utils.escapeRegexp(p.referrals[i].host) + '$', 'i'))) {
          __sbjs_source = p.referrals[i].display  || p.referrals[i].host;
          __sbjs_medium = p.referrals[i].medium   || terms.referer.referral;
          return true;
        }
        if (i + 1 === p.referrals.length) {
          __sbjs_source = uri.getHost(referer);
          return true;
        }
      }
    } else {
      __sbjs_source = uri.getHost(referer);
      return true;
    }
  }

  function setFirstAndCurrentExtraData() {
    cookies.set(data.containers.current_extra, data.pack.extra(p.timezone_offset), lifetime, domain, isolate);
    if (!cookies.get(data.containers.first_extra)) {
      cookies.set(data.containers.first_extra, data.pack.extra(p.timezone_offset), lifetime, domain, isolate);
    }
  }

  (function setData() {

    // Main data
    cookies.set(data.containers.current, mainData(), lifetime, domain, isolate);
    if (!cookies.get(data.containers.first)) {
      cookies.set(data.containers.first, cookies.get(data.containers.current), lifetime, domain, isolate);
    }

    // User data
    var visits, udata;
    if (!cookies.get(data.containers.udata)) {
      visits  = 1;
      udata   = data.pack.user(visits, p.user_ip);
    } else {
      visits  = parseInt(cookies.parse(data.containers.udata)[cookies.unsbjs(data.containers.udata)][data.aliases.udata.visits]) || 1;
      visits  = cookies.get(data.containers.session) ? visits : visits + 1;
      udata   = data.pack.user(visits, p.user_ip);
    }
    cookies.set(data.containers.udata, udata, lifetime, domain, isolate);

    // Session
    var pages_count;
    if (!cookies.get(data.containers.session)) {
      pages_count = 1;
    } else {
      pages_count = parseInt(cookies.parse(data.containers.session)[cookies.unsbjs(data.containers.session)][data.aliases.session.pages_seen]) || 1;
      pages_count += 1;
    }
    cookies.set(data.containers.session, data.pack.session(pages_count), p.session_length, domain, isolate);

    // Promocode
    if (p.promocode && !cookies.get(data.containers.promocode)) {
      cookies.set(data.containers.promocode, data.pack.promo(p.promocode), lifetime, domain, isolate);
    }

  })();

  return cookies.parse(data.containers);

};
},{"./data":"/Users/zlebnik/projects/sourcebuster-js/src/js/data.js","./helpers/localStorage":"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/localStorage.js","./helpers/uri":"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/uri.js","./helpers/utils":"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/utils.js","./migrations":"/Users/zlebnik/projects/sourcebuster-js/src/js/migrations.js","./params":"/Users/zlebnik/projects/sourcebuster-js/src/js/params.js","./terms":"/Users/zlebnik/projects/sourcebuster-js/src/js/terms.js"}],"/Users/zlebnik/projects/sourcebuster-js/src/js/migrations.js":[function(_dereq_,module,exports){
"use strict";

var data = _dereq_('./data'),
    cookies = _dereq_('./helpers/cookies'),
    ls = _dereq_('./helpers/localStorage');


module.exports = {

    go: function (lifetime, domain, isolate) {

        var migrate = this.migrations,
            _with = {l: lifetime, d: domain, i: isolate};

        var i;
        var mids = [];
        var advance = '';

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
                        //cookies.destroy(data.containers[k]);
                    }
                }
            }
        }
    ]

};
},{"./data":"/Users/zlebnik/projects/sourcebuster-js/src/js/data.js","./helpers/cookies":"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/cookies.js","./helpers/localStorage":"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/localStorage.js"}],"/Users/zlebnik/projects/sourcebuster-js/src/js/params.js":[function(_dereq_,module,exports){
"use strict";

var terms = _dereq_('./terms'),
    uri   = _dereq_('./helpers/uri');

module.exports = {

  fetch: function(prefs) {

    var user   = prefs || {},
        params = {};

    params.prefix = this.validate.isString(user.prefix) ? user.prefix : '';

    // Set `lifetime of the cookie` in months
    params.lifetime = this.validate.checkFloat(user.lifetime) || 6;
    params.lifetime = parseInt(params.lifetime * 30 * 24 * 60);

    // Set `session length` in minutes
    params.session_length = this.validate.checkInt(user.session_length) || 30;

    // Set `timezone offset` in hours
    params.timezone_offset = this.validate.checkInt(user.timezone_offset);

    // Set `campaign param` for AdWords links
    params.campaign_param = user.campaign_param || false;

    // Set `user ip`
    params.user_ip = user.user_ip || terms.none;

    // Set `promocode`
    if (user.promocode) {
      params.promocode = {};
      params.promocode.min = parseInt(user.promocode.min) || 100000;
      params.promocode.max = parseInt(user.promocode.max) || 999999;
    } else {
      params.promocode = false;
    }

    // Set `typein attributes`
    if (user.typein_attributes && user.typein_attributes.source && user.typein_attributes.medium) {
      params.typein_attributes = {};
      params.typein_attributes.source = user.typein_attributes.source;
      params.typein_attributes.medium = user.typein_attributes.medium;
    } else {
      params.typein_attributes = { source: '(direct)', medium: '(none)' };
    }

    // Set `domain`
    if (user.domain && this.validate.isString(user.domain)) {
      params.domain = { host: user.domain, isolate: false };
    } else if (user.domain && user.domain.host) {
      params.domain = user.domain;
    } else {
      params.domain = { host: uri.getHost(document.location.hostname), isolate: false };
    }

    // Set `referral sources`
    params.referrals = [];

    if (user.referrals && user.referrals.length > 0) {
      for (var ir = 0; ir < user.referrals.length; ir++) {
        if (user.referrals[ir].host) {
          params.referrals.push(user.referrals[ir]);
        }
      }
    }

    // Set `organic sources`
    params.organics = [];

    if (user.organics && user.organics.length > 0) {
      for (var io = 0; io < user.organics.length; io++) {
        if (user.organics[io].host && user.organics[io].param) {
          params.organics.push(user.organics[io]);
        }
      }
    }

    params.organics.push({ host: 'bing.com',      param: 'q',     display: 'bing'            });
    params.organics.push({ host: 'yahoo.com',     param: 'p',     display: 'yahoo'           });
    params.organics.push({ host: 'about.com',     param: 'q',     display: 'about'           });
    params.organics.push({ host: 'aol.com',       param: 'q',     display: 'aol'             });
    params.organics.push({ host: 'ask.com',       param: 'q',     display: 'ask'             });
    params.organics.push({ host: 'globososo.com', param: 'q',     display: 'globo'           });
    params.organics.push({ host: 'go.mail.ru',    param: 'q',     display: 'go.mail.ru'      });
    params.organics.push({ host: 'rambler.ru',    param: 'query', display: 'rambler'         });
    params.organics.push({ host: 'tut.by',        param: 'query', display: 'tut.by'          });

    params.referrals.push({ host: 't.co',                         display: 'twitter.com'     });
    params.referrals.push({ host: 'plus.url.google.com',          display: 'plus.google.com' });


    return params;

  },

  validate: {

    checkFloat: function(v) {
      return v && this.isNumeric(parseFloat(v)) ? parseFloat(v) : false;
    },

    checkInt: function(v) {
      return v && this.isNumeric(parseInt(v)) ? parseInt(v) : false;
    },

    isNumeric: function(v){
      return !isNaN(v);
    },

    isString: function(v) {
      return Object.prototype.toString.call(v) === '[object String]';
    }

  }

};
},{"./helpers/uri":"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/uri.js","./terms":"/Users/zlebnik/projects/sourcebuster-js/src/js/terms.js"}],"/Users/zlebnik/projects/sourcebuster-js/src/js/terms.js":[function(_dereq_,module,exports){
"use strict";

module.exports = {

  traffic: {
    utm:        'utm',
    organic:    'organic',
    referral:   'referral',
    typein:     'typein'
  },

  referer: {
    referral:   'referral',
    organic:    'organic',
    social:     'social'
  },

  none:         '(none)',
  oops:         '(Houston, we have a problem)'

};

},{}]},{},["./src/js/sourcebuster.js"])("./src/js/sourcebuster.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvc291cmNlYnVzdGVyLmpzIiwic3JjL2pzL2RhdGEuanMiLCJzcmMvanMvaGVscGVycy9jb29raWVzLmpzIiwic3JjL2pzL2hlbHBlcnMvbG9jYWxTdG9yYWdlLmpzIiwic3JjL2pzL2hlbHBlcnMvdXJpLmpzIiwic3JjL2pzL2hlbHBlcnMvdXRpbHMuanMiLCJzcmMvanMvaW5pdC5qcyIsInNyYy9qcy9taWdyYXRpb25zLmpzIiwic3JjL2pzL3BhcmFtcy5qcyIsInNyYy9qcy90ZXJtcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgaW5pdCA9IHJlcXVpcmUoJy4vaW5pdCcpO1xuXG52YXIgc2JqcyA9IHtcbiAgaW5pdDogZnVuY3Rpb24ocHJlZnMpIHtcbiAgICB0aGlzLmdldCA9IGluaXQocHJlZnMpO1xuICAgIGlmIChwcmVmcyAmJiBwcmVmcy5jYWxsYmFjayAmJiB0eXBlb2YgcHJlZnMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHByZWZzLmNhbGxiYWNrKHRoaXMuZ2V0KTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2JqczsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHRlcm1zID0gcmVxdWlyZSgnLi90ZXJtcycpLFxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi9oZWxwZXJzL3V0aWxzJyk7XG5cbnZhciBkYXRhID0ge1xuXG4gIGNvbnRhaW5lcnM6IHtcbiAgICBjdXJyZW50OiAgICAgICAgICAnc2Jqc19jdXJyZW50JyxcbiAgICBjdXJyZW50X2V4dHJhOiAgICAnc2Jqc19jdXJyZW50X2FkZCcsXG4gICAgZmlyc3Q6ICAgICAgICAgICAgJ3NianNfZmlyc3QnLFxuICAgIGZpcnN0X2V4dHJhOiAgICAgICdzYmpzX2ZpcnN0X2FkZCcsXG4gICAgc2Vzc2lvbjogICAgICAgICAgJ3NianNfc2Vzc2lvbicsXG4gICAgdWRhdGE6ICAgICAgICAgICAgJ3NianNfdWRhdGEnLFxuICAgIHByb21vY29kZTogICAgICAgICdzYmpzX3Byb21vJ1xuICB9LFxuXG4gIHNlcnZpY2U6IHtcbiAgICBtaWdyYXRpb25zOiAgICAgICAnc2Jqc19taWdyYXRpb25zJ1xuICB9LFxuXG4gIGRlbGltaXRlcjogICAgICAgICAgJ3x8fCcsXG5cbiAgYWxpYXNlczoge1xuXG4gICAgbWFpbjoge1xuICAgICAgdHlwZTogICAgICAgICAgICd0eXAnLFxuICAgICAgc291cmNlOiAgICAgICAgICdzcmMnLFxuICAgICAgbWVkaXVtOiAgICAgICAgICdtZG0nLFxuICAgICAgY2FtcGFpZ246ICAgICAgICdjbXAnLFxuICAgICAgY29udGVudDogICAgICAgICdjbnQnLFxuICAgICAgdGVybTogICAgICAgICAgICd0cm0nXG4gICAgfSxcblxuICAgIGV4dHJhOiB7XG4gICAgICBmaXJlX2RhdGU6ICAgICAgJ2ZkJyxcbiAgICAgIGVudHJhbmNlX3BvaW50OiAnZXAnLFxuICAgICAgcmVmZXJlcjogICAgICAgICdyZidcbiAgICB9LFxuXG4gICAgc2Vzc2lvbjoge1xuICAgICAgcGFnZXNfc2VlbjogICAgICdwZ3MnLFxuICAgICAgY3VycmVudF9wYWdlOiAgICdjcGcnXG4gICAgfSxcblxuICAgIHVkYXRhOiB7XG4gICAgICB2aXNpdHM6ICAgICAgICAgJ3ZzdCcsXG4gICAgICBpcDogICAgICAgICAgICAgJ3VpcCcsXG4gICAgICBhZ2VudDogICAgICAgICAgJ3VhZydcbiAgICB9LFxuXG4gICAgcHJvbW86ICAgICAgICAgICAgJ2NvZGUnXG5cbiAgfSxcblxuICBwYWNrOiB7XG5cbiAgICBtYWluOiBmdW5jdGlvbihzYmpzKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBkYXRhLmFsaWFzZXMubWFpbi50eXBlICAgICAgKyAnPScgKyBzYmpzLnR5cGUgICAgICsgZGF0YS5kZWxpbWl0ZXIgK1xuICAgICAgICBkYXRhLmFsaWFzZXMubWFpbi5zb3VyY2UgICAgKyAnPScgKyBzYmpzLnNvdXJjZSAgICsgZGF0YS5kZWxpbWl0ZXIgK1xuICAgICAgICBkYXRhLmFsaWFzZXMubWFpbi5tZWRpdW0gICAgKyAnPScgKyBzYmpzLm1lZGl1bSAgICsgZGF0YS5kZWxpbWl0ZXIgK1xuICAgICAgICBkYXRhLmFsaWFzZXMubWFpbi5jYW1wYWlnbiAgKyAnPScgKyBzYmpzLmNhbXBhaWduICsgZGF0YS5kZWxpbWl0ZXIgK1xuICAgICAgICBkYXRhLmFsaWFzZXMubWFpbi5jb250ZW50ICAgKyAnPScgKyBzYmpzLmNvbnRlbnQgICsgZGF0YS5kZWxpbWl0ZXIgK1xuICAgICAgICBkYXRhLmFsaWFzZXMubWFpbi50ZXJtICAgICAgKyAnPScgKyBzYmpzLnRlcm1cbiAgICAgICk7XG4gICAgfSxcblxuICAgIGV4dHJhOiBmdW5jdGlvbih0aW1lem9uZV9vZmZzZXQpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGRhdGEuYWxpYXNlcy5leHRyYS5maXJlX2RhdGUgICAgICArICc9JyArIHV0aWxzLnNldERhdGUobmV3IERhdGUsIHRpbWV6b25lX29mZnNldCkgKyBkYXRhLmRlbGltaXRlciArXG4gICAgICAgIGRhdGEuYWxpYXNlcy5leHRyYS5lbnRyYW5jZV9wb2ludCArICc9JyArIGRvY3VtZW50LmxvY2F0aW9uLmhyZWYgICAgICAgICAgICAgICAgICAgKyBkYXRhLmRlbGltaXRlciArXG4gICAgICAgIGRhdGEuYWxpYXNlcy5leHRyYS5yZWZlcmVyICAgICAgICArICc9JyArIChkb2N1bWVudC5yZWZlcnJlciB8fCB0ZXJtcy5ub25lKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgdXNlcjogZnVuY3Rpb24odmlzaXRzLCB1c2VyX2lwKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBkYXRhLmFsaWFzZXMudWRhdGEudmlzaXRzICsgJz0nICsgdmlzaXRzICArIGRhdGEuZGVsaW1pdGVyICtcbiAgICAgICAgZGF0YS5hbGlhc2VzLnVkYXRhLmlwICAgICArICc9JyArIHVzZXJfaXAgKyBkYXRhLmRlbGltaXRlciArXG4gICAgICAgIGRhdGEuYWxpYXNlcy51ZGF0YS5hZ2VudCAgKyAnPScgKyBuYXZpZ2F0b3IudXNlckFnZW50XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBzZXNzaW9uOiBmdW5jdGlvbihwYWdlcykge1xuICAgICAgcmV0dXJuIChcbiAgICAgIGRhdGEuYWxpYXNlcy5zZXNzaW9uLnBhZ2VzX3NlZW4gICArICc9JyArIHBhZ2VzICsgZGF0YS5kZWxpbWl0ZXIgK1xuICAgICAgZGF0YS5hbGlhc2VzLnNlc3Npb24uY3VycmVudF9wYWdlICsgJz0nICsgZG9jdW1lbnQubG9jYXRpb24uaHJlZlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcHJvbW86IGZ1bmN0aW9uKHByb21vKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBkYXRhLmFsaWFzZXMucHJvbW8gKyAnPScgKyB1dGlscy5zZXRMZWFkaW5nWmVyb1RvSW50KHV0aWxzLnJhbmRvbUludChwcm9tby5taW4sIHByb21vLm1heCksIHByb21vLm1heC50b1N0cmluZygpLmxlbmd0aClcbiAgICAgICk7XG4gICAgfVxuXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGF0YTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGRlbGltaXRlciA9IHJlcXVpcmUoJy4uL2RhdGEnKS5kZWxpbWl0ZXI7XG5cbnZhciBwcmVmaXggPSAnJztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgc2V0UHJlZml4OiBmdW5jdGlvbihwKSB7XG4gICAgcHJlZml4ID0gcDtcbiAgfSxcblxuICBnZXRQcmVmaXg6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwcmVmaXg7XG4gIH0sXG5cbiAgZW5jb2RlRGF0YTogZnVuY3Rpb24ocykge1xuICAgIHJldHVybiBwcmVmaXggKyBlbmNvZGVVUklDb21wb25lbnQocykucmVwbGFjZSgvXFwhL2csICclMjEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFx+L2csICclN0UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwqL2csICclMkEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwnL2csICclMjcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwoL2csICclMjgnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwpL2csICclMjknKTtcbiAgfSxcblxuICBkZWNvZGVEYXRhOiBmdW5jdGlvbihzKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocy5yZXBsYWNlKG5ldyBSZWdFeHAoJ14nICsgcHJlZml4KSwgJycpKS5yZXBsYWNlKC9cXCUyMS9nLCAnIScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJTdFL2csICd+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwlMkEvZywgJyonKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCUyNy9nLCBcIidcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwlMjgvZywgJygnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCUyOS9nLCAnKScpO1xuICAgIH0gY2F0Y2goZXJyMSkge1xuICAgICAgLy8gdHJ5IHVuZXNjYXBlIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAgICB0cnkgeyByZXR1cm4gdW5lc2NhcGUocyk7IH0gY2F0Y2goZXJyMikgeyByZXR1cm4gJyc7IH1cbiAgICB9XG4gIH0sXG5cbiAgc2V0OiBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgbWludXRlcywgZG9tYWluLCBleGNsX3N1YmRvbWFpbnMpIHtcbiAgICB2YXIgZXhwaXJlcywgYmFzZWhvc3Q7XG5cbiAgICBpZiAobWludXRlcykge1xuICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgKG1pbnV0ZXMgKiA2MCAqIDEwMDApKTtcbiAgICAgIGV4cGlyZXMgPSAnOyBleHBpcmVzPScgKyBkYXRlLnRvR01UU3RyaW5nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cGlyZXMgPSAnJztcbiAgICB9XG4gICAgaWYgKGRvbWFpbiAmJiAhZXhjbF9zdWJkb21haW5zKSB7XG4gICAgICBiYXNlaG9zdCA9ICc7ZG9tYWluPS4nICsgZG9tYWluO1xuICAgIH0gZWxzZSB7XG4gICAgICBiYXNlaG9zdCA9ICcnO1xuICAgIH1cbiAgICBkb2N1bWVudC5jb29raWUgPSB0aGlzLmVuY29kZURhdGEobmFtZSkgKyAnPScgKyB0aGlzLmVuY29kZURhdGEodmFsdWUpICsgZXhwaXJlcyArIGJhc2Vob3N0ICsgJzsgcGF0aD0vJztcbiAgfSxcblxuICBnZXQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbmFtZUVRID0gdGhpcy5lbmNvZGVEYXRhKG5hbWUpICsgJz0nLFxuICAgICAgICBjYSA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGMgPSBjYVtpXTtcbiAgICAgIHdoaWxlIChjLmNoYXJBdCgwKSA9PT0gJyAnKSB7IGMgPSBjLnN1YnN0cmluZygxLCBjLmxlbmd0aCk7IH1cbiAgICAgIGlmIChjLmluZGV4T2YobmFtZUVRKSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVEYXRhKGMuc3Vic3RyaW5nKG5hbWVFUS5sZW5ndGgsIGMubGVuZ3RoKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uKG5hbWUsIGRvbWFpbiwgZXhjbF9zdWJkb21haW5zKSB7XG4gICAgdGhpcy5zZXQobmFtZSwgJycsIC0xLCBkb21haW4sIGV4Y2xfc3ViZG9tYWlucyk7XG4gIH0sXG5cbiAgcGFyc2U6IGZ1bmN0aW9uKHl1bW15KSB7XG5cbiAgICB2YXIgY29va2llcyA9IFtdLFxuICAgICAgICBkYXRhICAgID0ge307XG5cbiAgICBpZiAodHlwZW9mIHl1bW15ID09PSAnc3RyaW5nJykge1xuICAgICAgY29va2llcy5wdXNoKHl1bW15KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiB5dW1teSkge1xuICAgICAgICBpZiAoeXVtbXkuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICBjb29raWVzLnB1c2goeXVtbXlbcHJvcF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaTEgPSAwOyBpMSA8IGNvb2tpZXMubGVuZ3RoOyBpMSsrKSB7XG4gICAgICB2YXIgY29va2llX2FycmF5O1xuICAgICAgZGF0YVt0aGlzLnVuc2Jqcyhjb29raWVzW2kxXSldID0ge307XG4gICAgICBpZiAodGhpcy5nZXQoY29va2llc1tpMV0pKSB7XG4gICAgICAgIGNvb2tpZV9hcnJheSA9IHRoaXMuZ2V0KGNvb2tpZXNbaTFdKS5zcGxpdChkZWxpbWl0ZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29va2llX2FycmF5ID0gW107XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpMiA9IDA7IGkyIDwgY29va2llX2FycmF5Lmxlbmd0aDsgaTIrKykge1xuICAgICAgICB2YXIgdG1wX2FycmF5ID0gY29va2llX2FycmF5W2kyXS5zcGxpdCgnPScpLFxuICAgICAgICAgICAgcmVzdWx0X2FycmF5ID0gdG1wX2FycmF5LnNwbGljZSgwLCAxKTtcbiAgICAgICAgcmVzdWx0X2FycmF5LnB1c2godG1wX2FycmF5LmpvaW4oJz0nKSk7XG4gICAgICAgIGRhdGFbdGhpcy51bnNianMoY29va2llc1tpMV0pXVtyZXN1bHRfYXJyYXlbMF1dID0gdGhpcy5kZWNvZGVEYXRhKHJlc3VsdF9hcnJheVsxXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG5cbiAgfSxcblxuICB1bnNianM6IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoJ3NianNfJywgJycpO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHByZWZpeCA9ICcnO1xudmFyIGRlbGltaXRlciA9IHJlcXVpcmUoJy4uL2RhdGEnKS5kZWxpbWl0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgc2V0UHJlZml4OiBmdW5jdGlvbihwKSB7XG4gICAgICAgIHByZWZpeCA9IHA7XG4gICAgfSxcblxuICAgIGdldFByZWZpeDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwcmVmaXg7XG4gICAgfSxcblxuICAgIGVuY29kZURhdGE6IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIHByZWZpeCArIGVuY29kZVVSSUNvbXBvbmVudChzKS5yZXBsYWNlKC9cXCEvZywgJyUyMScpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcfi9nLCAnJTdFJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwqL2csICclMkEnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCcvZywgJyUyNycpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcKC9nLCAnJTI4JylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwpL2csICclMjknKTtcbiAgICB9LFxuXG4gICAgZGVjb2RlRGF0YTogZnVuY3Rpb24ocykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzLnJlcGxhY2UobmV3IFJlZ0V4cCgnXicgKyBwcmVmaXgpLCAnJykpLnJlcGxhY2UoL1xcJTIxL2csICchJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwlN0UvZywgJ34nKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCUyQS9nLCAnKicpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJTI3L2csIFwiJ1wiKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCUyOC9nLCAnKCcpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJTI5L2csICcpJyk7XG4gICAgICAgIH0gY2F0Y2goZXJyMSkge1xuICAgICAgICAgICAgLy8gdHJ5IHVuZXNjYXBlIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAgICAgICAgICB0cnkgeyByZXR1cm4gdW5lc2NhcGUocyk7IH0gY2F0Y2goZXJyMikgeyByZXR1cm4gJyc7IH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXQ6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBtaW51dGVzKSB7XG4gICAgICAgIHZhciBleHBpcmVzO1xuXG4gICAgICAgIGlmIChtaW51dGVzKSB7XG4gICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgKyAobWludXRlcyAqIDYwICogMTAwMCkpO1xuICAgICAgICAgICAgZXhwaXJlcyA9IGRhdGUudmFsdWVPZigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXhwaXJlcyA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgICAgICB0aGlzLmVuY29kZURhdGEobmFtZSksXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgIGV4cGlyZXM6IGV4cGlyZXNcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIGdldDogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB2YXIgbHNOYW1lID0gdGhpcy5lbmNvZGVEYXRhKG5hbWUpO1xuXG4gICAgICAgIHZhciBzYXZlZFZhbHVlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0obHNOYW1lKTtcbiAgICAgICAgaWYgKHNhdmVkVmFsdWUpIHtcbiAgICAgICAgICAgIHNhdmVkVmFsdWUgPSBKU09OLnBhcnNlKHNhdmVkVmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAoc2F2ZWRWYWx1ZS5leHBpcmVzICYmIChwYXJzZUludChzYXZlZFZhbHVlLmV4cGlyZXMpIDwgKG5ldyBEYXRlKCkpLnZhbHVlT2YoKSkpIHtcbiAgICAgICAgICAgICAgICBzYXZlZFZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShsc05hbWUpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzYXZlZFZhbHVlLnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuXG4gICAgcGFyc2U6IGZ1bmN0aW9uKHl1bW15KSB7XG5cbiAgICAgICAgdmFyIGNvb2tpZXMgPSBbXSxcbiAgICAgICAgICAgIGRhdGEgICAgPSB7fTtcblxuICAgICAgICBpZiAodHlwZW9mIHl1bW15ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29va2llcy5wdXNoKHl1bW15KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4geXVtbXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoeXVtbXkuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29va2llcy5wdXNoKHl1bW15W3Byb3BdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpMSA9IDA7IGkxIDwgY29va2llcy5sZW5ndGg7IGkxKyspIHtcbiAgICAgICAgICAgIHZhciBjb29raWVfYXJyYXk7XG4gICAgICAgICAgICBkYXRhW3RoaXMudW5zYmpzKGNvb2tpZXNbaTFdKV0gPSB7fTtcbiAgICAgICAgICAgIGlmICh0aGlzLmdldChjb29raWVzW2kxXSkpIHtcbiAgICAgICAgICAgICAgICBjb29raWVfYXJyYXkgPSB0aGlzLmdldChjb29raWVzW2kxXSkuc3BsaXQoZGVsaW1pdGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29va2llX2FycmF5ID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpMiA9IDA7IGkyIDwgY29va2llX2FycmF5Lmxlbmd0aDsgaTIrKykge1xuICAgICAgICAgICAgICAgIHZhciB0bXBfYXJyYXkgPSBjb29raWVfYXJyYXlbaTJdLnNwbGl0KCc9JyksXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdF9hcnJheSA9IHRtcF9hcnJheS5zcGxpY2UoMCwgMSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0X2FycmF5LnB1c2godG1wX2FycmF5LmpvaW4oJz0nKSk7XG4gICAgICAgICAgICAgICAgZGF0YVt0aGlzLnVuc2Jqcyhjb29raWVzW2kxXSldW3Jlc3VsdF9hcnJheVswXV0gPSB0aGlzLmRlY29kZURhdGEocmVzdWx0X2FycmF5WzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkYXRhO1xuXG4gICAgfSxcblxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5lbmNvZGVEYXRhKG5hbWUpKTtcbiAgICB9LFxuXG4gICAgdW5zYmpzOiBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgnc2Jqc18nLCAnJyk7XG4gICAgfVxuXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHBhcnNlOiBmdW5jdGlvbihzdHIpIHtcbiAgICB2YXIgbyA9IHRoaXMucGFyc2VPcHRpb25zLFxuICAgICAgICBtID0gby5wYXJzZXJbby5zdHJpY3RNb2RlID8gJ3N0cmljdCcgOiAnbG9vc2UnXS5leGVjKHN0ciksXG4gICAgICAgIHVyaSA9IHt9LFxuICAgICAgICBpID0gMTQ7XG5cbiAgICB3aGlsZSAoaS0tKSB7IHVyaVtvLmtleVtpXV0gPSBtW2ldIHx8ICcnOyB9XG5cbiAgICB1cmlbby5xLm5hbWVdID0ge307XG4gICAgdXJpW28ua2V5WzEyXV0ucmVwbGFjZShvLnEucGFyc2VyLCBmdW5jdGlvbiAoJDAsICQxLCAkMikge1xuICAgICAgaWYgKCQxKSB7IHVyaVtvLnEubmFtZV1bJDFdID0gJDI7IH1cbiAgICB9KTtcblxuICAgIHJldHVybiB1cmk7XG4gIH0sXG5cbiAgcGFyc2VPcHRpb25zOiB7XG4gICAgc3RyaWN0TW9kZTogZmFsc2UsXG4gICAga2V5OiBbJ3NvdXJjZScsJ3Byb3RvY29sJywnYXV0aG9yaXR5JywndXNlckluZm8nLCd1c2VyJywncGFzc3dvcmQnLCdob3N0JywncG9ydCcsJ3JlbGF0aXZlJywncGF0aCcsJ2RpcmVjdG9yeScsJ2ZpbGUnLCdxdWVyeScsJ2FuY2hvciddLFxuICAgIHE6IHtcbiAgICAgIG5hbWU6ICAgJ3F1ZXJ5S2V5JyxcbiAgICAgIHBhcnNlcjogLyg/Ol58JikoW14mPV0qKT0/KFteJl0qKS9nXG4gICAgfSxcbiAgICBwYXJzZXI6IHtcbiAgICAgIHN0cmljdDogL14oPzooW146XFwvPyNdKyk6KT8oPzpcXC9cXC8oKD86KChbXjpAXSopKD86OihbXjpAXSopKT8pP0ApPyhbXjpcXC8/I10qKSg/OjooXFxkKikpPykpPygoKCg/OltePyNcXC9dKlxcLykqKShbXj8jXSopKSg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8pLyxcbiAgICAgIGxvb3NlOiAgL14oPzooPyFbXjpAXSs6W146QFxcL10qQCkoW146XFwvPyMuXSspOik/KD86XFwvXFwvKT8oKD86KChbXjpAXSopKD86OihbXjpAXSopKT8pP0ApPyhbXjpcXC8/I10qKSg/OjooXFxkKikpPykoKChcXC8oPzpbXj8jXSg/IVtePyNcXC9dKlxcLltePyNcXC8uXSsoPzpbPyNdfCQpKSkqXFwvPyk/KFtePyNcXC9dKikpKD86XFw/KFteI10qKSk/KD86IyguKikpPykvXG4gICAgfVxuICB9LFxuXG4gIGdldFBhcmFtOiBmdW5jdGlvbihjdXN0b21fcGFyYW1zKSB7XG4gICAgdmFyIHF1ZXJ5X3N0cmluZyA9IHt9LFxuICAgICAgICBxdWVyeSA9IGN1c3RvbV9wYXJhbXMgPyBjdXN0b21fcGFyYW1zIDogd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSksXG4gICAgICAgIHZhcnMgPSBxdWVyeS5zcGxpdCgnJicpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcGFpciA9IHZhcnNbaV0uc3BsaXQoJz0nKTtcbiAgICAgIGlmICh0eXBlb2YgcXVlcnlfc3RyaW5nW3BhaXJbMF1dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBxdWVyeV9zdHJpbmdbcGFpclswXV0gPSBwYWlyWzFdO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcXVlcnlfc3RyaW5nW3BhaXJbMF1dID09PSAnc3RyaW5nJykge1xuICAgICAgICB2YXIgYXJyID0gWyBxdWVyeV9zdHJpbmdbcGFpclswXV0sIHBhaXJbMV0gXTtcbiAgICAgICAgcXVlcnlfc3RyaW5nW3BhaXJbMF1dID0gYXJyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcXVlcnlfc3RyaW5nW3BhaXJbMF1dLnB1c2gocGFpclsxXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBxdWVyeV9zdHJpbmc7XG4gIH0sXG5cbiAgZ2V0SG9zdDogZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgIHJldHVybiB0aGlzLnBhcnNlKHJlcXVlc3QpLmhvc3QucmVwbGFjZSgnd3d3LicsICcnKTtcbiAgfVxuXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBlc2NhcGVSZWdleHA6IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xuICB9LFxuXG4gIHNldERhdGU6IGZ1bmN0aW9uKGRhdGUsIG9mZnNldCkge1xuICAgIHZhciB1dGNfb2Zmc2V0ICAgID0gZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpIC8gNjAsXG4gICAgICAgIG5vd19ob3VycyAgICAgPSBkYXRlLmdldEhvdXJzKCksXG4gICAgICAgIGN1c3RvbV9vZmZzZXQgPSBvZmZzZXQgfHwgb2Zmc2V0ID09PSAwID8gb2Zmc2V0IDogLXV0Y19vZmZzZXQ7XG5cbiAgICBkYXRlLnNldEhvdXJzKG5vd19ob3VycyArIHV0Y19vZmZzZXQgKyBjdXN0b21fb2Zmc2V0KTtcblxuICAgIHZhciB5ZWFyICAgID0gZGF0ZS5nZXRGdWxsWWVhcigpLFxuICAgICAgICBtb250aCAgID0gdGhpcy5zZXRMZWFkaW5nWmVyb1RvSW50KGRhdGUuZ2V0TW9udGgoKSArIDEsICAgMiksXG4gICAgICAgIGRheSAgICAgPSB0aGlzLnNldExlYWRpbmdaZXJvVG9JbnQoZGF0ZS5nZXREYXRlKCksICAgICAgICAyKSxcbiAgICAgICAgaG91ciAgICA9IHRoaXMuc2V0TGVhZGluZ1plcm9Ub0ludChkYXRlLmdldEhvdXJzKCksICAgICAgIDIpLFxuICAgICAgICBtaW51dGUgID0gdGhpcy5zZXRMZWFkaW5nWmVyb1RvSW50KGRhdGUuZ2V0TWludXRlcygpLCAgICAgMiksXG4gICAgICAgIHNlY29uZCAgPSB0aGlzLnNldExlYWRpbmdaZXJvVG9JbnQoZGF0ZS5nZXRTZWNvbmRzKCksICAgICAyKTtcblxuICAgIHJldHVybiAoeWVhciArICctJyArIG1vbnRoICsgJy0nICsgZGF5ICsgJyAnICsgaG91ciArICc6JyArIG1pbnV0ZSArICc6JyArIHNlY29uZCk7XG4gIH0sXG5cbiAgc2V0TGVhZGluZ1plcm9Ub0ludDogZnVuY3Rpb24obnVtLCBzaXplKSB7XG4gICAgdmFyIHMgPSBudW0gKyAnJztcbiAgICB3aGlsZSAocy5sZW5ndGggPCBzaXplKSB7IHMgPSAnMCcgKyBzOyB9XG4gICAgcmV0dXJuIHM7XG4gIH0sXG5cbiAgcmFuZG9tSW50OiBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGRhdGEgICAgICAgID0gcmVxdWlyZSgnLi9kYXRhJyksXG4gICAgdGVybXMgICAgICAgPSByZXF1aXJlKCcuL3Rlcm1zJyksXG4gICAgY29va2llcyAgICAgPSByZXF1aXJlKCcuL2hlbHBlcnMvbG9jYWxTdG9yYWdlJyksXG4gICAgdXJpICAgICAgICAgPSByZXF1aXJlKCcuL2hlbHBlcnMvdXJpJyksXG4gICAgdXRpbHMgICAgICAgPSByZXF1aXJlKCcuL2hlbHBlcnMvdXRpbHMnKSxcbiAgICBwYXJhbXMgICAgICA9IHJlcXVpcmUoJy4vcGFyYW1zJyksXG4gICAgbWlncmF0aW9ucyAgPSByZXF1aXJlKCcuL21pZ3JhdGlvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcmVmcykge1xuXG4gIHZhciBwICAgICAgICAgPSBwYXJhbXMuZmV0Y2gocHJlZnMpO1xuICB2YXIgZ2V0X3BhcmFtID0gdXJpLmdldFBhcmFtKCk7XG4gIHZhciBkb21haW4gICAgPSBwLmRvbWFpbi5ob3N0LFxuICAgICAgaXNvbGF0ZSAgID0gcC5kb21haW4uaXNvbGF0ZSxcbiAgICAgIGxpZmV0aW1lICA9IHAubGlmZXRpbWU7XG5cbiAgY29va2llcy5zZXRQcmVmaXgocC5wcmVmaXgpO1xuXG4gIG1pZ3JhdGlvbnMuZ28obGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSk7XG5cbiAgdmFyIF9fc2Jqc190eXBlLFxuICAgICAgX19zYmpzX3NvdXJjZSxcbiAgICAgIF9fc2Jqc19tZWRpdW0sXG4gICAgICBfX3NianNfY2FtcGFpZ24sXG4gICAgICBfX3NianNfY29udGVudCxcbiAgICAgIF9fc2Jqc190ZXJtO1xuXG4gIGZ1bmN0aW9uIG1haW5EYXRhKCkge1xuICAgIHZhciBzYmpzX2RhdGE7XG4gICAgaWYgKFxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtLnV0bV9zb3VyY2UgICAgICAgICE9PSAndW5kZWZpbmVkJyB8fFxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtLnV0bV9tZWRpdW0gICAgICAgICE9PSAndW5kZWZpbmVkJyB8fFxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtLnV0bV9jYW1wYWlnbiAgICAgICE9PSAndW5kZWZpbmVkJyB8fFxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtLnV0bV9jb250ZW50ICAgICAgICE9PSAndW5kZWZpbmVkJyB8fFxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtLnV0bV90ZXJtICAgICAgICAgICE9PSAndW5kZWZpbmVkJyB8fFxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtLmdjbGlkICAgICAgICAgICAgICE9PSAndW5kZWZpbmVkJyB8fFxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtLnljbGlkICAgICAgICAgICAgICE9PSAndW5kZWZpbmVkJyB8fFxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtW3AuY2FtcGFpZ25fcGFyYW1dICE9PSAndW5kZWZpbmVkJ1xuICAgICAgKSB7XG4gICAgICBzZXRGaXJzdEFuZEN1cnJlbnRFeHRyYURhdGEoKTtcbiAgICAgIHNianNfZGF0YSA9IGdldERhdGEodGVybXMudHJhZmZpYy51dG0pO1xuICAgIH0gZWxzZSBpZiAoY2hlY2tSZWZlcmVyKHRlcm1zLnRyYWZmaWMub3JnYW5pYykpIHtcbiAgICAgIHNldEZpcnN0QW5kQ3VycmVudEV4dHJhRGF0YSgpO1xuICAgICAgc2Jqc19kYXRhID0gZ2V0RGF0YSh0ZXJtcy50cmFmZmljLm9yZ2FuaWMpO1xuICAgIH0gZWxzZSBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uKSAmJiBjaGVja1JlZmVyZXIodGVybXMudHJhZmZpYy5yZWZlcnJhbCkpIHtcbiAgICAgIHNldEZpcnN0QW5kQ3VycmVudEV4dHJhRGF0YSgpO1xuICAgICAgc2Jqc19kYXRhID0gZ2V0RGF0YSh0ZXJtcy50cmFmZmljLnJlZmVycmFsKTtcbiAgICB9IGVsc2UgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuZmlyc3QpICYmICFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuY3VycmVudCkpIHtcbiAgICAgIHNldEZpcnN0QW5kQ3VycmVudEV4dHJhRGF0YSgpO1xuICAgICAgc2Jqc19kYXRhID0gZ2V0RGF0YSh0ZXJtcy50cmFmZmljLnR5cGVpbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuY3VycmVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNianNfZGF0YTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldERhdGEodHlwZSkge1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG5cbiAgICAgIGNhc2UgdGVybXMudHJhZmZpYy51dG06XG5cbiAgICAgICAgX19zYmpzX3R5cGUgPSB0ZXJtcy50cmFmZmljLnV0bTtcblxuICAgICAgICBpZiAodHlwZW9mIGdldF9wYXJhbS51dG1fc291cmNlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSBnZXRfcGFyYW0udXRtX3NvdXJjZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZ2V0X3BhcmFtLmdjbGlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSAnZ29vZ2xlJztcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZ2V0X3BhcmFtLnljbGlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSAneWFuZGV4JzsgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSB0ZXJtcy5ub25lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBnZXRfcGFyYW0udXRtX21lZGl1bSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBfX3NianNfbWVkaXVtID0gZ2V0X3BhcmFtLnV0bV9tZWRpdW07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldF9wYXJhbS5nY2xpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBfX3NianNfbWVkaXVtID0gJ2NwYyc7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldF9wYXJhbS55Y2xpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBfX3NianNfbWVkaXVtID0gJ2NwYyc7ICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfX3NianNfbWVkaXVtID0gdGVybXMubm9uZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgZ2V0X3BhcmFtLnV0bV9jYW1wYWlnbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBfX3NianNfY2FtcGFpZ24gPSBnZXRfcGFyYW0udXRtX2NhbXBhaWduO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW1bcC5jYW1wYWlnbl9wYXJhbV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgX19zYmpzX2NhbXBhaWduID0gZ2V0X3BhcmFtW3AuY2FtcGFpZ25fcGFyYW1dO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW0uZ2NsaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgX19zYmpzX2NhbXBhaWduID0gJ2dvb2dsZV9jcGMnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW0ueWNsaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgX19zYmpzX2NhbXBhaWduID0gJ3lhbmRleF9jcGMnOyAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX19zYmpzX2NhbXBhaWduID0gdGVybXMubm9uZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF9fc2Jqc19jb250ZW50ICA9IGdldF9wYXJhbS51dG1fY29udGVudCB8fCB0ZXJtcy5ub25lO1xuICAgICAgICBfX3NianNfdGVybSAgICAgPSBnZXRVdG1UZXJtKCkgICAgICAgICAgfHwgdGVybXMubm9uZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgdGVybXMudHJhZmZpYy5vcmdhbmljOlxuICAgICAgICBfX3NianNfdHlwZSAgICAgPSB0ZXJtcy50cmFmZmljLm9yZ2FuaWM7XG4gICAgICAgIF9fc2Jqc19zb3VyY2UgICA9IF9fc2Jqc19zb3VyY2UgfHwgdXJpLmdldEhvc3QoZG9jdW1lbnQucmVmZXJyZXIpO1xuICAgICAgICBfX3NianNfbWVkaXVtICAgPSB0ZXJtcy5yZWZlcmVyLm9yZ2FuaWM7XG4gICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IHRlcm1zLm5vbmU7XG4gICAgICAgIF9fc2Jqc19jb250ZW50ICA9IHRlcm1zLm5vbmU7XG4gICAgICAgIF9fc2Jqc190ZXJtICAgICA9IHRlcm1zLm5vbmU7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIHRlcm1zLnRyYWZmaWMucmVmZXJyYWw6XG4gICAgICAgIF9fc2Jqc190eXBlICAgICA9IHRlcm1zLnRyYWZmaWMucmVmZXJyYWw7XG4gICAgICAgIF9fc2Jqc19zb3VyY2UgICA9IF9fc2Jqc19zb3VyY2UgfHwgdXJpLmdldEhvc3QoZG9jdW1lbnQucmVmZXJyZXIpO1xuICAgICAgICBfX3NianNfbWVkaXVtICAgPSBfX3NianNfbWVkaXVtIHx8IHRlcm1zLnJlZmVyZXIucmVmZXJyYWw7XG4gICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IHRlcm1zLm5vbmU7XG4gICAgICAgIF9fc2Jqc19jb250ZW50ICA9IHVyaS5wYXJzZShkb2N1bWVudC5yZWZlcnJlcikucGF0aDtcbiAgICAgICAgX19zYmpzX3Rlcm0gICAgID0gdGVybXMubm9uZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgdGVybXMudHJhZmZpYy50eXBlaW46XG4gICAgICAgIF9fc2Jqc190eXBlICAgICA9IHRlcm1zLnRyYWZmaWMudHlwZWluO1xuICAgICAgICBfX3NianNfc291cmNlICAgPSBwLnR5cGVpbl9hdHRyaWJ1dGVzLnNvdXJjZTtcbiAgICAgICAgX19zYmpzX21lZGl1bSAgID0gcC50eXBlaW5fYXR0cmlidXRlcy5tZWRpdW07XG4gICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IHRlcm1zLm5vbmU7XG4gICAgICAgIF9fc2Jqc19jb250ZW50ICA9IHRlcm1zLm5vbmU7XG4gICAgICAgIF9fc2Jqc190ZXJtICAgICA9IHRlcm1zLm5vbmU7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBfX3NianNfdHlwZSAgICAgPSB0ZXJtcy5vb3BzO1xuICAgICAgICBfX3NianNfc291cmNlICAgPSB0ZXJtcy5vb3BzO1xuICAgICAgICBfX3NianNfbWVkaXVtICAgPSB0ZXJtcy5vb3BzO1xuICAgICAgICBfX3NianNfY2FtcGFpZ24gPSB0ZXJtcy5vb3BzO1xuICAgICAgICBfX3NianNfY29udGVudCAgPSB0ZXJtcy5vb3BzO1xuICAgICAgICBfX3NianNfdGVybSAgICAgPSB0ZXJtcy5vb3BzO1xuICAgIH1cbiAgICB2YXIgc2Jqc19kYXRhID0ge1xuICAgICAgdHlwZTogICAgICAgICAgICAgX19zYmpzX3R5cGUsXG4gICAgICBzb3VyY2U6ICAgICAgICAgICBfX3NianNfc291cmNlLFxuICAgICAgbWVkaXVtOiAgICAgICAgICAgX19zYmpzX21lZGl1bSxcbiAgICAgIGNhbXBhaWduOiAgICAgICAgIF9fc2Jqc19jYW1wYWlnbixcbiAgICAgIGNvbnRlbnQ6ICAgICAgICAgIF9fc2Jqc19jb250ZW50LFxuICAgICAgdGVybTogICAgICAgICAgICAgX19zYmpzX3Rlcm1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGRhdGEucGFjay5tYWluKHNianNfZGF0YSk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFV0bVRlcm0oKSB7XG4gICAgdmFyIHJlZmVyZXIgPSBkb2N1bWVudC5yZWZlcnJlcjtcbiAgICBpZiAoZ2V0X3BhcmFtLnV0bV90ZXJtKSB7XG4gICAgICByZXR1cm4gZ2V0X3BhcmFtLnV0bV90ZXJtO1xuICAgIH0gZWxzZSBpZiAocmVmZXJlciAmJiB1cmkucGFyc2UocmVmZXJlcikuaG9zdCAmJiB1cmkucGFyc2UocmVmZXJlcikuaG9zdC5tYXRjaCgvXig/Oi4qXFwuKT95YW5kZXhcXC4uezIsOX0kL2kpKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gdXJpLmdldFBhcmFtKHVyaS5wYXJzZShkb2N1bWVudC5yZWZlcnJlcikucXVlcnkpLnRleHQ7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tSZWZlcmVyKHR5cGUpIHtcbiAgICB2YXIgcmVmZXJlciA9IGRvY3VtZW50LnJlZmVycmVyO1xuICAgIHN3aXRjaCh0eXBlKSB7XG4gICAgICBjYXNlIHRlcm1zLnRyYWZmaWMub3JnYW5pYzpcbiAgICAgICAgcmV0dXJuICghIXJlZmVyZXIgJiYgY2hlY2tSZWZlcmVySG9zdChyZWZlcmVyKSAmJiBpc09yZ2FuaWMocmVmZXJlcikpO1xuICAgICAgY2FzZSB0ZXJtcy50cmFmZmljLnJlZmVycmFsOlxuICAgICAgICByZXR1cm4gKCEhcmVmZXJlciAmJiBjaGVja1JlZmVyZXJIb3N0KHJlZmVyZXIpICYmIGlzUmVmZXJyYWwocmVmZXJlcikpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrUmVmZXJlckhvc3QocmVmZXJlcikge1xuICAgIGlmIChwLmRvbWFpbikge1xuICAgICAgaWYgKCFpc29sYXRlKSB7XG4gICAgICAgIHZhciBob3N0X3JlZ2V4ID0gbmV3IFJlZ0V4cCgnXig/Oi4qXFxcXC4pPycgKyB1dGlscy5lc2NhcGVSZWdleHAoZG9tYWluKSArICckJywgJ2knKTtcbiAgICAgICAgcmV0dXJuICEodXJpLmdldEhvc3QocmVmZXJlcikubWF0Y2goaG9zdF9yZWdleCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICh1cmkuZ2V0SG9zdChyZWZlcmVyKSAhPT0gdXJpLmdldEhvc3QoZG9tYWluKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAodXJpLmdldEhvc3QocmVmZXJlcikgIT09IHVyaS5nZXRIb3N0KGRvY3VtZW50LmxvY2F0aW9uLmhyZWYpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc09yZ2FuaWMocmVmZXJlcikge1xuXG4gICAgdmFyIHlfaG9zdCAgPSAneWFuZGV4JyxcbiAgICAgICAgeV9wYXJhbSA9ICd0ZXh0JyxcbiAgICAgICAgZ19ob3N0ICA9ICdnb29nbGUnO1xuXG4gICAgdmFyIHlfaG9zdF9yZWdleCAgPSBuZXcgUmVnRXhwKCdeKD86LipcXFxcLik/JyAgKyB1dGlscy5lc2NhcGVSZWdleHAoeV9ob3N0KSAgKyAnXFxcXC4uezIsOX0kJyksXG4gICAgICAgIHlfcGFyYW1fcmVnZXggPSBuZXcgUmVnRXhwKCcuKicgICAgICAgICAgICsgdXRpbHMuZXNjYXBlUmVnZXhwKHlfcGFyYW0pICsgJz0uKicpLFxuICAgICAgICBnX2hvc3RfcmVnZXggID0gbmV3IFJlZ0V4cCgnXig/Ond3d1xcXFwuKT8nICsgdXRpbHMuZXNjYXBlUmVnZXhwKGdfaG9zdCkgICsgJ1xcXFwuLnsyLDl9JCcpO1xuXG4gICAgaWYgKFxuICAgICAgICAhIXVyaS5wYXJzZShyZWZlcmVyKS5xdWVyeSAmJlxuICAgICAgICAhIXVyaS5wYXJzZShyZWZlcmVyKS5ob3N0Lm1hdGNoKHlfaG9zdF9yZWdleCkgJiZcbiAgICAgICAgISF1cmkucGFyc2UocmVmZXJlcikucXVlcnkubWF0Y2goeV9wYXJhbV9yZWdleClcbiAgICAgICkge1xuICAgICAgX19zYmpzX3NvdXJjZSA9IHlfaG9zdDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoISF1cmkucGFyc2UocmVmZXJlcikuaG9zdC5tYXRjaChnX2hvc3RfcmVnZXgpKSB7XG4gICAgICBfX3NianNfc291cmNlID0gZ19ob3N0O1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICghIXVyaS5wYXJzZShyZWZlcmVyKS5xdWVyeSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLm9yZ2FuaWNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHVyaS5wYXJzZShyZWZlcmVyKS5ob3N0Lm1hdGNoKG5ldyBSZWdFeHAoJ14oPzouKlxcXFwuKT8nICsgdXRpbHMuZXNjYXBlUmVnZXhwKHAub3JnYW5pY3NbaV0uaG9zdCkgICsgJyQnLCAnaScpKSAmJlxuICAgICAgICAgICAgdXJpLnBhcnNlKHJlZmVyZXIpLnF1ZXJ5Lm1hdGNoKG5ldyBSZWdFeHAoJy4qJyAgICAgICAgICsgdXRpbHMuZXNjYXBlUmVnZXhwKHAub3JnYW5pY3NbaV0ucGFyYW0pICsgJz0uKicsICdpJykpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9IHAub3JnYW5pY3NbaV0uZGlzcGxheSB8fCBwLm9yZ2FuaWNzW2ldLmhvc3Q7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgKyAxID09PSBwLm9yZ2FuaWNzLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNSZWZlcnJhbChyZWZlcmVyKSB7XG4gICAgaWYgKHAucmVmZXJyYWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5yZWZlcnJhbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHVyaS5wYXJzZShyZWZlcmVyKS5ob3N0Lm1hdGNoKG5ldyBSZWdFeHAoJ14oPzouKlxcXFwuKT8nICsgdXRpbHMuZXNjYXBlUmVnZXhwKHAucmVmZXJyYWxzW2ldLmhvc3QpICsgJyQnLCAnaScpKSkge1xuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSBwLnJlZmVycmFsc1tpXS5kaXNwbGF5ICB8fCBwLnJlZmVycmFsc1tpXS5ob3N0O1xuICAgICAgICAgIF9fc2Jqc19tZWRpdW0gPSBwLnJlZmVycmFsc1tpXS5tZWRpdW0gICB8fCB0ZXJtcy5yZWZlcmVyLnJlZmVycmFsO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpICsgMSA9PT0gcC5yZWZlcnJhbHMubGVuZ3RoKSB7XG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9IHVyaS5nZXRIb3N0KHJlZmVyZXIpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIF9fc2Jqc19zb3VyY2UgPSB1cmkuZ2V0SG9zdChyZWZlcmVyKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldEZpcnN0QW5kQ3VycmVudEV4dHJhRGF0YSgpIHtcbiAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMuY3VycmVudF9leHRyYSwgZGF0YS5wYWNrLmV4dHJhKHAudGltZXpvbmVfb2Zmc2V0KSwgbGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSk7XG4gICAgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuZmlyc3RfZXh0cmEpKSB7XG4gICAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMuZmlyc3RfZXh0cmEsIGRhdGEucGFjay5leHRyYShwLnRpbWV6b25lX29mZnNldCksIGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xuICAgIH1cbiAgfVxuXG4gIChmdW5jdGlvbiBzZXREYXRhKCkge1xuXG4gICAgLy8gTWFpbiBkYXRhXG4gICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLmN1cnJlbnQsIG1haW5EYXRhKCksIGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xuICAgIGlmICghY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLmZpcnN0KSkge1xuICAgICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLmZpcnN0LCBjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuY3VycmVudCksIGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xuICAgIH1cblxuICAgIC8vIFVzZXIgZGF0YVxuICAgIHZhciB2aXNpdHMsIHVkYXRhO1xuICAgIGlmICghY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLnVkYXRhKSkge1xuICAgICAgdmlzaXRzICA9IDE7XG4gICAgICB1ZGF0YSAgID0gZGF0YS5wYWNrLnVzZXIodmlzaXRzLCBwLnVzZXJfaXApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2aXNpdHMgID0gcGFyc2VJbnQoY29va2llcy5wYXJzZShkYXRhLmNvbnRhaW5lcnMudWRhdGEpW2Nvb2tpZXMudW5zYmpzKGRhdGEuY29udGFpbmVycy51ZGF0YSldW2RhdGEuYWxpYXNlcy51ZGF0YS52aXNpdHNdKSB8fCAxO1xuICAgICAgdmlzaXRzICA9IGNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uKSA/IHZpc2l0cyA6IHZpc2l0cyArIDE7XG4gICAgICB1ZGF0YSAgID0gZGF0YS5wYWNrLnVzZXIodmlzaXRzLCBwLnVzZXJfaXApO1xuICAgIH1cbiAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMudWRhdGEsIHVkYXRhLCBsaWZldGltZSwgZG9tYWluLCBpc29sYXRlKTtcblxuICAgIC8vIFNlc3Npb25cbiAgICB2YXIgcGFnZXNfY291bnQ7XG4gICAgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbikpIHtcbiAgICAgIHBhZ2VzX2NvdW50ID0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFnZXNfY291bnQgPSBwYXJzZUludChjb29raWVzLnBhcnNlKGRhdGEuY29udGFpbmVycy5zZXNzaW9uKVtjb29raWVzLnVuc2JqcyhkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbildW2RhdGEuYWxpYXNlcy5zZXNzaW9uLnBhZ2VzX3NlZW5dKSB8fCAxO1xuICAgICAgcGFnZXNfY291bnQgKz0gMTtcbiAgICB9XG4gICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLnNlc3Npb24sIGRhdGEucGFjay5zZXNzaW9uKHBhZ2VzX2NvdW50KSwgcC5zZXNzaW9uX2xlbmd0aCwgZG9tYWluLCBpc29sYXRlKTtcblxuICAgIC8vIFByb21vY29kZVxuICAgIGlmIChwLnByb21vY29kZSAmJiAhY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLnByb21vY29kZSkpIHtcbiAgICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5wcm9tb2NvZGUsIGRhdGEucGFjay5wcm9tbyhwLnByb21vY29kZSksIGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xuICAgIH1cblxuICB9KSgpO1xuXG4gIHJldHVybiBjb29raWVzLnBhcnNlKGRhdGEuY29udGFpbmVycyk7XG5cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBkYXRhID0gcmVxdWlyZSgnLi9kYXRhJyksXG4gICAgY29va2llcyA9IHJlcXVpcmUoJy4vaGVscGVycy9jb29raWVzJyksXG4gICAgbHMgPSByZXF1aXJlKCcuL2hlbHBlcnMvbG9jYWxTdG9yYWdlJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICBnbzogZnVuY3Rpb24gKGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpIHtcblxuICAgICAgICB2YXIgbWlncmF0ZSA9IHRoaXMubWlncmF0aW9ucyxcbiAgICAgICAgICAgIF93aXRoID0ge2w6IGxpZmV0aW1lLCBkOiBkb21haW4sIGk6IGlzb2xhdGV9O1xuXG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgbWlkcyA9IFtdO1xuICAgICAgICB2YXIgYWR2YW5jZSA9ICcnO1xuXG4gICAgICAgIGlmICghY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLmZpcnN0KSAmJiAhY29va2llcy5nZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMpKSB7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWdyYXRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbWlkcy5wdXNoKG1pZ3JhdGVbaV0uaWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhZHZhbmNlID0gJyc7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbWlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGFkdmFuY2UgKz0gbWlkc1tpXSArICc9MSc7XG4gICAgICAgICAgICAgICAgaWYgKGkgPCBtaWRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSArPSBkYXRhLmRlbGltaXRlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb29raWVzLnNldChkYXRhLnNlcnZpY2UubWlncmF0aW9ucywgYWR2YW5jZSwgX3dpdGgubCwgX3dpdGguZCwgX3dpdGguaSk7XG5cbiAgICAgICAgfSBlbHNlIGlmICghY29va2llcy5nZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMpKSB7XG5cbiAgICAgICAgICAgIC8vIFdlIGhhdmUgb25seSBvbmUgbWlncmF0aW9uIGZvciBub3csIHNvIGp1c3RcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWdyYXRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbWlncmF0ZVtpXS5nbyhtaWdyYXRlW2ldLmlkLCBfd2l0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1pZHMgPSBjb29raWVzLmdldChkYXRhLnNlcnZpY2UubWlncmF0aW9ucykuc3BsaXQoZGF0YS5kZWxpbWl0ZXIpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG1pZ3JhdGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAobWlkcy5pbmRleE9mKG1pZ3JhdGVbaV0uaWQgKyAnPTEnKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ21pZ3JhdGluZzogJyArIG1pZ3JhdGVbaV0pO1xuICAgICAgICAgICAgICAgICAgICBtaWdyYXRlW2ldLmdvKG1pZ3JhdGVbaV0uaWQsIF93aXRoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1pZHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWdyYXRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbWlkcy5wdXNoKG1pZ3JhdGVbaV0uaWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhZHZhbmNlID0gJyc7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbWlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGFkdmFuY2UgKz0gbWlkc1tpXSArICc9MSc7XG4gICAgICAgICAgICAgICAgaWYgKGkgPCBtaWRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSArPSBkYXRhLmRlbGltaXRlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb29raWVzLnNldChkYXRhLnNlcnZpY2UubWlncmF0aW9ucywgYWR2YW5jZSwgX3dpdGgubCwgX3dpdGguZCwgX3dpdGguaSk7XG4gICAgICAgIH1cblxuICAgIH0sXG5cbiAgICBtaWdyYXRpb25zOiBbXG5cbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICcxNDE4NDc0Mzc1OTk4JyxcbiAgICAgICAgICAgIHZlcnNpb246ICcxLjAuMC1iZXRhJyxcbiAgICAgICAgICAgIGdvOiBmdW5jdGlvbiAobWlkLCBfd2l0aCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHN1Y2Nlc3MgPSBtaWQgKyAnPTEnLFxuICAgICAgICAgICAgICAgICAgICBmYWlsID0gbWlkICsgJz0wJztcblxuICAgICAgICAgICAgICAgIHZhciBzYWZlUmVwbGFjZSA9IGZ1bmN0aW9uICgkMCwgJDEsICQyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoJDEgfHwgJDIgPyAkMCA6IGRhdGEuZGVsaW1pdGVyKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBTd2l0Y2ggZGVsaW1pdGVyIGFuZCByZW5ldyBjb29raWVzXG4gICAgICAgICAgICAgICAgICAgIHZhciBfaW4gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBkYXRhLmNvbnRhaW5lcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbnRhaW5lcnMuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW4ucHVzaChkYXRhLmNvbnRhaW5lcnNbcHJvcF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfaW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb29raWVzLmdldChfaW5baV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGJ1ZmZlciA9IGNvb2tpZXMuZ2V0KF9pbltpXSkucmVwbGFjZSgvKFxcfCk/XFx8KFxcfCk/L2csIHNhZmVSZXBsYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29raWVzLmRlc3Ryb3koX2luW2ldLCBfd2l0aC5kLCBfd2l0aC5pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29raWVzLmRlc3Ryb3koX2luW2ldLCBfd2l0aC5kLCAhX3dpdGguaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29va2llcy5zZXQoX2luW2ldLCBidWZmZXIsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIGBzZXNzaW9uYFxuICAgICAgICAgICAgICAgICAgICBpZiAoY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLnNlc3Npb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbiwgZGF0YS5wYWNrLnNlc3Npb24oMCksIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gWWF5IVxuICAgICAgICAgICAgICAgICAgICBjb29raWVzLnNldChkYXRhLnNlcnZpY2UubWlncmF0aW9ucywgc3VjY2VzcywgX3dpdGgubCwgX3dpdGguZCwgX3dpdGguaSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gT29wc1xuICAgICAgICAgICAgICAgICAgICBjb29raWVzLnNldChkYXRhLnNlcnZpY2UubWlncmF0aW9ucywgZmFpbCwgX3dpdGgubCwgX3dpdGguZCwgX3dpdGguaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJzE0NzE1MTk3NTI2MDAnLFxuICAgICAgICAgICAgdmVyc2lvbjogJzEuMC41JyxcbiAgICAgICAgICAgIGdvOiBmdW5jdGlvbiAobWlkLCBfd2l0aCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHN1Y2Nlc3MgPSBtaWQgKyAnPTEnLFxuICAgICAgICAgICAgICAgICAgICBmYWlsID0gbWlkICsgJz0wJyxcbiAgICAgICAgICAgICAgICAgICAgb2xkUHJlZml4ID0gJycsXG4gICAgICAgICAgICAgICAgICAgIG5ld1ByZWZpeCA9IGNvb2tpZXMuZ2V0UHJlZml4KCk7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb29raWVzLnNldFByZWZpeChvbGRQcmVmaXgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBfaW4gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBkYXRhLmNvbnRhaW5lcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbnRhaW5lcnMuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW4ucHVzaChkYXRhLmNvbnRhaW5lcnNbcHJvcF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfaW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb2tpZXMuc2V0UHJlZml4KG9sZFByZWZpeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29va2llcy5nZXQoX2luW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBidWZmZXIgPSBjb29raWVzLmdldChfaW5baV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb2tpZXMuc2V0UHJlZml4KG5ld1ByZWZpeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29va2llcy5zZXQoX2luW2ldLCBidWZmZXIsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIGBzZXNzaW9uYFxuICAgICAgICAgICAgICAgICAgICBjb29raWVzLnNldFByZWZpeChvbGRQcmVmaXgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLnNlc3Npb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29raWVzLnNldFByZWZpeChuZXdQcmVmaXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLnNlc3Npb24sIGRhdGEucGFjay5zZXNzaW9uKDApLCBfd2l0aC5sLCBfd2l0aC5kLCBfd2l0aC5pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFlheSFcbiAgICAgICAgICAgICAgICAgICAgY29va2llcy5zZXRQcmVmaXgobmV3UHJlZml4KTtcbiAgICAgICAgICAgICAgICAgICAgY29va2llcy5zZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMsIHN1Y2Nlc3MsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9vcHNcbiAgICAgICAgICAgICAgICAgICAgY29va2llcy5zZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMsIGZhaWwsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgXCJpZFwiOiAnMTQ3MTUxOTc1MjYwNScsXG4gICAgICAgICAgICBcInZlcnNpb25cIjogJzEuMS4wJyxcbiAgICAgICAgICAgIGdvOiBmdW5jdGlvbihtaWQsIF93aXRoKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBkYXRhLmNvbnRhaW5lcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuY29udGFpbmVycy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZCA9IGNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVyc1trXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBscy5zZXQoZGF0YS5jb250YWluZXJzW2tdLCBvbGQsIF93aXRoLmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb29raWVzLmRlc3Ryb3koZGF0YS5jb250YWluZXJzW2tdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIF1cblxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHRlcm1zID0gcmVxdWlyZSgnLi90ZXJtcycpLFxuICAgIHVyaSAgID0gcmVxdWlyZSgnLi9oZWxwZXJzL3VyaScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBmZXRjaDogZnVuY3Rpb24ocHJlZnMpIHtcblxuICAgIHZhciB1c2VyICAgPSBwcmVmcyB8fCB7fSxcbiAgICAgICAgcGFyYW1zID0ge307XG5cbiAgICBwYXJhbXMucHJlZml4ID0gdGhpcy52YWxpZGF0ZS5pc1N0cmluZyh1c2VyLnByZWZpeCkgPyB1c2VyLnByZWZpeCA6ICcnO1xuXG4gICAgLy8gU2V0IGBsaWZldGltZSBvZiB0aGUgY29va2llYCBpbiBtb250aHNcbiAgICBwYXJhbXMubGlmZXRpbWUgPSB0aGlzLnZhbGlkYXRlLmNoZWNrRmxvYXQodXNlci5saWZldGltZSkgfHwgNjtcbiAgICBwYXJhbXMubGlmZXRpbWUgPSBwYXJzZUludChwYXJhbXMubGlmZXRpbWUgKiAzMCAqIDI0ICogNjApO1xuXG4gICAgLy8gU2V0IGBzZXNzaW9uIGxlbmd0aGAgaW4gbWludXRlc1xuICAgIHBhcmFtcy5zZXNzaW9uX2xlbmd0aCA9IHRoaXMudmFsaWRhdGUuY2hlY2tJbnQodXNlci5zZXNzaW9uX2xlbmd0aCkgfHwgMzA7XG5cbiAgICAvLyBTZXQgYHRpbWV6b25lIG9mZnNldGAgaW4gaG91cnNcbiAgICBwYXJhbXMudGltZXpvbmVfb2Zmc2V0ID0gdGhpcy52YWxpZGF0ZS5jaGVja0ludCh1c2VyLnRpbWV6b25lX29mZnNldCk7XG5cbiAgICAvLyBTZXQgYGNhbXBhaWduIHBhcmFtYCBmb3IgQWRXb3JkcyBsaW5rc1xuICAgIHBhcmFtcy5jYW1wYWlnbl9wYXJhbSA9IHVzZXIuY2FtcGFpZ25fcGFyYW0gfHwgZmFsc2U7XG5cbiAgICAvLyBTZXQgYHVzZXIgaXBgXG4gICAgcGFyYW1zLnVzZXJfaXAgPSB1c2VyLnVzZXJfaXAgfHwgdGVybXMubm9uZTtcblxuICAgIC8vIFNldCBgcHJvbW9jb2RlYFxuICAgIGlmICh1c2VyLnByb21vY29kZSkge1xuICAgICAgcGFyYW1zLnByb21vY29kZSA9IHt9O1xuICAgICAgcGFyYW1zLnByb21vY29kZS5taW4gPSBwYXJzZUludCh1c2VyLnByb21vY29kZS5taW4pIHx8IDEwMDAwMDtcbiAgICAgIHBhcmFtcy5wcm9tb2NvZGUubWF4ID0gcGFyc2VJbnQodXNlci5wcm9tb2NvZGUubWF4KSB8fCA5OTk5OTk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmFtcy5wcm9tb2NvZGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBTZXQgYHR5cGVpbiBhdHRyaWJ1dGVzYFxuICAgIGlmICh1c2VyLnR5cGVpbl9hdHRyaWJ1dGVzICYmIHVzZXIudHlwZWluX2F0dHJpYnV0ZXMuc291cmNlICYmIHVzZXIudHlwZWluX2F0dHJpYnV0ZXMubWVkaXVtKSB7XG4gICAgICBwYXJhbXMudHlwZWluX2F0dHJpYnV0ZXMgPSB7fTtcbiAgICAgIHBhcmFtcy50eXBlaW5fYXR0cmlidXRlcy5zb3VyY2UgPSB1c2VyLnR5cGVpbl9hdHRyaWJ1dGVzLnNvdXJjZTtcbiAgICAgIHBhcmFtcy50eXBlaW5fYXR0cmlidXRlcy5tZWRpdW0gPSB1c2VyLnR5cGVpbl9hdHRyaWJ1dGVzLm1lZGl1bTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyYW1zLnR5cGVpbl9hdHRyaWJ1dGVzID0geyBzb3VyY2U6ICcoZGlyZWN0KScsIG1lZGl1bTogJyhub25lKScgfTtcbiAgICB9XG5cbiAgICAvLyBTZXQgYGRvbWFpbmBcbiAgICBpZiAodXNlci5kb21haW4gJiYgdGhpcy52YWxpZGF0ZS5pc1N0cmluZyh1c2VyLmRvbWFpbikpIHtcbiAgICAgIHBhcmFtcy5kb21haW4gPSB7IGhvc3Q6IHVzZXIuZG9tYWluLCBpc29sYXRlOiBmYWxzZSB9O1xuICAgIH0gZWxzZSBpZiAodXNlci5kb21haW4gJiYgdXNlci5kb21haW4uaG9zdCkge1xuICAgICAgcGFyYW1zLmRvbWFpbiA9IHVzZXIuZG9tYWluO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbXMuZG9tYWluID0geyBob3N0OiB1cmkuZ2V0SG9zdChkb2N1bWVudC5sb2NhdGlvbi5ob3N0bmFtZSksIGlzb2xhdGU6IGZhbHNlIH07XG4gICAgfVxuXG4gICAgLy8gU2V0IGByZWZlcnJhbCBzb3VyY2VzYFxuICAgIHBhcmFtcy5yZWZlcnJhbHMgPSBbXTtcblxuICAgIGlmICh1c2VyLnJlZmVycmFscyAmJiB1c2VyLnJlZmVycmFscy5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKHZhciBpciA9IDA7IGlyIDwgdXNlci5yZWZlcnJhbHMubGVuZ3RoOyBpcisrKSB7XG4gICAgICAgIGlmICh1c2VyLnJlZmVycmFsc1tpcl0uaG9zdCkge1xuICAgICAgICAgIHBhcmFtcy5yZWZlcnJhbHMucHVzaCh1c2VyLnJlZmVycmFsc1tpcl0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IGBvcmdhbmljIHNvdXJjZXNgXG4gICAgcGFyYW1zLm9yZ2FuaWNzID0gW107XG5cbiAgICBpZiAodXNlci5vcmdhbmljcyAmJiB1c2VyLm9yZ2FuaWNzLmxlbmd0aCA+IDApIHtcbiAgICAgIGZvciAodmFyIGlvID0gMDsgaW8gPCB1c2VyLm9yZ2FuaWNzLmxlbmd0aDsgaW8rKykge1xuICAgICAgICBpZiAodXNlci5vcmdhbmljc1tpb10uaG9zdCAmJiB1c2VyLm9yZ2FuaWNzW2lvXS5wYXJhbSkge1xuICAgICAgICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHVzZXIub3JnYW5pY3NbaW9dKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ2JpbmcuY29tJywgICAgICBwYXJhbTogJ3EnLCAgICAgZGlzcGxheTogJ2JpbmcnICAgICAgICAgICAgfSk7XG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAneWFob28uY29tJywgICAgIHBhcmFtOiAncCcsICAgICBkaXNwbGF5OiAneWFob28nICAgICAgICAgICB9KTtcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICdhYm91dC5jb20nLCAgICAgcGFyYW06ICdxJywgICAgIGRpc3BsYXk6ICdhYm91dCcgICAgICAgICAgIH0pO1xuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ2FvbC5jb20nLCAgICAgICBwYXJhbTogJ3EnLCAgICAgZGlzcGxheTogJ2FvbCcgICAgICAgICAgICAgfSk7XG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAnYXNrLmNvbScsICAgICAgIHBhcmFtOiAncScsICAgICBkaXNwbGF5OiAnYXNrJyAgICAgICAgICAgICB9KTtcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICdnbG9ib3Nvc28uY29tJywgcGFyYW06ICdxJywgICAgIGRpc3BsYXk6ICdnbG9ibycgICAgICAgICAgIH0pO1xuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ2dvLm1haWwucnUnLCAgICBwYXJhbTogJ3EnLCAgICAgZGlzcGxheTogJ2dvLm1haWwucnUnICAgICAgfSk7XG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAncmFtYmxlci5ydScsICAgIHBhcmFtOiAncXVlcnknLCBkaXNwbGF5OiAncmFtYmxlcicgICAgICAgICB9KTtcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICd0dXQuYnknLCAgICAgICAgcGFyYW06ICdxdWVyeScsIGRpc3BsYXk6ICd0dXQuYnknICAgICAgICAgIH0pO1xuXG4gICAgcGFyYW1zLnJlZmVycmFscy5wdXNoKHsgaG9zdDogJ3QuY28nLCAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAndHdpdHRlci5jb20nICAgICB9KTtcbiAgICBwYXJhbXMucmVmZXJyYWxzLnB1c2goeyBob3N0OiAncGx1cy51cmwuZ29vZ2xlLmNvbScsICAgICAgICAgIGRpc3BsYXk6ICdwbHVzLmdvb2dsZS5jb20nIH0pO1xuXG5cbiAgICByZXR1cm4gcGFyYW1zO1xuXG4gIH0sXG5cbiAgdmFsaWRhdGU6IHtcblxuICAgIGNoZWNrRmxvYXQ6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHJldHVybiB2ICYmIHRoaXMuaXNOdW1lcmljKHBhcnNlRmxvYXQodikpID8gcGFyc2VGbG9hdCh2KSA6IGZhbHNlO1xuICAgIH0sXG5cbiAgICBjaGVja0ludDogZnVuY3Rpb24odikge1xuICAgICAgcmV0dXJuIHYgJiYgdGhpcy5pc051bWVyaWMocGFyc2VJbnQodikpID8gcGFyc2VJbnQodikgOiBmYWxzZTtcbiAgICB9LFxuXG4gICAgaXNOdW1lcmljOiBmdW5jdGlvbih2KXtcbiAgICAgIHJldHVybiAhaXNOYU4odik7XG4gICAgfSxcblxuICAgIGlzU3RyaW5nOiBmdW5jdGlvbih2KSB7XG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHYpID09PSAnW29iamVjdCBTdHJpbmddJztcbiAgICB9XG5cbiAgfVxuXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICB0cmFmZmljOiB7XG4gICAgdXRtOiAgICAgICAgJ3V0bScsXG4gICAgb3JnYW5pYzogICAgJ29yZ2FuaWMnLFxuICAgIHJlZmVycmFsOiAgICdyZWZlcnJhbCcsXG4gICAgdHlwZWluOiAgICAgJ3R5cGVpbidcbiAgfSxcblxuICByZWZlcmVyOiB7XG4gICAgcmVmZXJyYWw6ICAgJ3JlZmVycmFsJyxcbiAgICBvcmdhbmljOiAgICAnb3JnYW5pYycsXG4gICAgc29jaWFsOiAgICAgJ3NvY2lhbCdcbiAgfSxcblxuICBub25lOiAgICAgICAgICcobm9uZSknLFxuICBvb3BzOiAgICAgICAgICcoSG91c3Rvbiwgd2UgaGF2ZSBhIHByb2JsZW0pJ1xuXG59O1xuIl19
