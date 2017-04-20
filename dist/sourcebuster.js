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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvc291cmNlYnVzdGVyLmpzIiwic3JjL2pzL2RhdGEuanMiLCJzcmMvanMvaGVscGVycy9jb29raWVzLmpzIiwic3JjL2pzL2hlbHBlcnMvbG9jYWxTdG9yYWdlLmpzIiwic3JjL2pzL2hlbHBlcnMvdXJpLmpzIiwic3JjL2pzL2hlbHBlcnMvdXRpbHMuanMiLCJzcmMvanMvaW5pdC5qcyIsInNyYy9qcy9taWdyYXRpb25zLmpzIiwic3JjL2pzL3BhcmFtcy5qcyIsInNyYy9qcy90ZXJtcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpbml0ID0gcmVxdWlyZSgnLi9pbml0Jyk7XG5cbnZhciBzYmpzID0ge1xuICBpbml0OiBmdW5jdGlvbihwcmVmcykge1xuICAgIHRoaXMuZ2V0ID0gaW5pdChwcmVmcyk7XG4gICAgaWYgKHByZWZzICYmIHByZWZzLmNhbGxiYWNrICYmIHR5cGVvZiBwcmVmcy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcHJlZnMuY2FsbGJhY2sodGhpcy5nZXQpO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzYmpzOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdGVybXMgPSByZXF1aXJlKCcuL3Rlcm1zJyksXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuL2hlbHBlcnMvdXRpbHMnKTtcblxudmFyIGRhdGEgPSB7XG5cbiAgY29udGFpbmVyczoge1xuICAgIGN1cnJlbnQ6ICAgICAgICAgICdzYmpzX2N1cnJlbnQnLFxuICAgIGN1cnJlbnRfZXh0cmE6ICAgICdzYmpzX2N1cnJlbnRfYWRkJyxcbiAgICBmaXJzdDogICAgICAgICAgICAnc2Jqc19maXJzdCcsXG4gICAgZmlyc3RfZXh0cmE6ICAgICAgJ3NianNfZmlyc3RfYWRkJyxcbiAgICBzZXNzaW9uOiAgICAgICAgICAnc2Jqc19zZXNzaW9uJyxcbiAgICB1ZGF0YTogICAgICAgICAgICAnc2Jqc191ZGF0YScsXG4gICAgcHJvbW9jb2RlOiAgICAgICAgJ3NianNfcHJvbW8nXG4gIH0sXG5cbiAgc2VydmljZToge1xuICAgIG1pZ3JhdGlvbnM6ICAgICAgICdzYmpzX21pZ3JhdGlvbnMnXG4gIH0sXG5cbiAgZGVsaW1pdGVyOiAgICAgICAgICAnfHx8JyxcblxuICBhbGlhc2VzOiB7XG5cbiAgICBtYWluOiB7XG4gICAgICB0eXBlOiAgICAgICAgICAgJ3R5cCcsXG4gICAgICBzb3VyY2U6ICAgICAgICAgJ3NyYycsXG4gICAgICBtZWRpdW06ICAgICAgICAgJ21kbScsXG4gICAgICBjYW1wYWlnbjogICAgICAgJ2NtcCcsXG4gICAgICBjb250ZW50OiAgICAgICAgJ2NudCcsXG4gICAgICB0ZXJtOiAgICAgICAgICAgJ3RybSdcbiAgICB9LFxuXG4gICAgZXh0cmE6IHtcbiAgICAgIGZpcmVfZGF0ZTogICAgICAnZmQnLFxuICAgICAgZW50cmFuY2VfcG9pbnQ6ICdlcCcsXG4gICAgICByZWZlcmVyOiAgICAgICAgJ3JmJ1xuICAgIH0sXG5cbiAgICBzZXNzaW9uOiB7XG4gICAgICBwYWdlc19zZWVuOiAgICAgJ3BncycsXG4gICAgICBjdXJyZW50X3BhZ2U6ICAgJ2NwZydcbiAgICB9LFxuXG4gICAgdWRhdGE6IHtcbiAgICAgIHZpc2l0czogICAgICAgICAndnN0JyxcbiAgICAgIGlwOiAgICAgICAgICAgICAndWlwJyxcbiAgICAgIGFnZW50OiAgICAgICAgICAndWFnJ1xuICAgIH0sXG5cbiAgICBwcm9tbzogICAgICAgICAgICAnY29kZSdcblxuICB9LFxuXG4gIHBhY2s6IHtcblxuICAgIG1haW46IGZ1bmN0aW9uKHNianMpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGRhdGEuYWxpYXNlcy5tYWluLnR5cGUgICAgICArICc9JyArIHNianMudHlwZSAgICAgKyBkYXRhLmRlbGltaXRlciArXG4gICAgICAgIGRhdGEuYWxpYXNlcy5tYWluLnNvdXJjZSAgICArICc9JyArIHNianMuc291cmNlICAgKyBkYXRhLmRlbGltaXRlciArXG4gICAgICAgIGRhdGEuYWxpYXNlcy5tYWluLm1lZGl1bSAgICArICc9JyArIHNianMubWVkaXVtICAgKyBkYXRhLmRlbGltaXRlciArXG4gICAgICAgIGRhdGEuYWxpYXNlcy5tYWluLmNhbXBhaWduICArICc9JyArIHNianMuY2FtcGFpZ24gKyBkYXRhLmRlbGltaXRlciArXG4gICAgICAgIGRhdGEuYWxpYXNlcy5tYWluLmNvbnRlbnQgICArICc9JyArIHNianMuY29udGVudCAgKyBkYXRhLmRlbGltaXRlciArXG4gICAgICAgIGRhdGEuYWxpYXNlcy5tYWluLnRlcm0gICAgICArICc9JyArIHNianMudGVybVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgZXh0cmE6IGZ1bmN0aW9uKHRpbWV6b25lX29mZnNldCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgZGF0YS5hbGlhc2VzLmV4dHJhLmZpcmVfZGF0ZSAgICAgICsgJz0nICsgdXRpbHMuc2V0RGF0ZShuZXcgRGF0ZSwgdGltZXpvbmVfb2Zmc2V0KSArIGRhdGEuZGVsaW1pdGVyICtcbiAgICAgICAgZGF0YS5hbGlhc2VzLmV4dHJhLmVudHJhbmNlX3BvaW50ICsgJz0nICsgZG9jdW1lbnQubG9jYXRpb24uaHJlZiAgICAgICAgICAgICAgICAgICArIGRhdGEuZGVsaW1pdGVyICtcbiAgICAgICAgZGF0YS5hbGlhc2VzLmV4dHJhLnJlZmVyZXIgICAgICAgICsgJz0nICsgKGRvY3VtZW50LnJlZmVycmVyIHx8IHRlcm1zLm5vbmUpXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB1c2VyOiBmdW5jdGlvbih2aXNpdHMsIHVzZXJfaXApIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGRhdGEuYWxpYXNlcy51ZGF0YS52aXNpdHMgKyAnPScgKyB2aXNpdHMgICsgZGF0YS5kZWxpbWl0ZXIgK1xuICAgICAgICBkYXRhLmFsaWFzZXMudWRhdGEuaXAgICAgICsgJz0nICsgdXNlcl9pcCArIGRhdGEuZGVsaW1pdGVyICtcbiAgICAgICAgZGF0YS5hbGlhc2VzLnVkYXRhLmFnZW50ICArICc9JyArIG5hdmlnYXRvci51c2VyQWdlbnRcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHNlc3Npb246IGZ1bmN0aW9uKHBhZ2VzKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgZGF0YS5hbGlhc2VzLnNlc3Npb24ucGFnZXNfc2VlbiAgICsgJz0nICsgcGFnZXMgKyBkYXRhLmRlbGltaXRlciArXG4gICAgICBkYXRhLmFsaWFzZXMuc2Vzc2lvbi5jdXJyZW50X3BhZ2UgKyAnPScgKyBkb2N1bWVudC5sb2NhdGlvbi5ocmVmXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBwcm9tbzogZnVuY3Rpb24ocHJvbW8pIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGRhdGEuYWxpYXNlcy5wcm9tbyArICc9JyArIHV0aWxzLnNldExlYWRpbmdaZXJvVG9JbnQodXRpbHMucmFuZG9tSW50KHByb21vLm1pbiwgcHJvbW8ubWF4KSwgcHJvbW8ubWF4LnRvU3RyaW5nKCkubGVuZ3RoKVxuICAgICAgKTtcbiAgICB9XG5cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkYXRhOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZGVsaW1pdGVyID0gcmVxdWlyZSgnLi4vZGF0YScpLmRlbGltaXRlcjtcblxudmFyIHByZWZpeCA9ICcnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBzZXRQcmVmaXg6IGZ1bmN0aW9uKHApIHtcbiAgICBwcmVmaXggPSBwO1xuICB9LFxuXG4gIGdldFByZWZpeDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHByZWZpeDtcbiAgfSxcblxuICBlbmNvZGVEYXRhOiBmdW5jdGlvbihzKSB7XG4gICAgcmV0dXJuIHByZWZpeCArIGVuY29kZVVSSUNvbXBvbmVudChzKS5yZXBsYWNlKC9cXCEvZywgJyUyMScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXH4vZywgJyU3RScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCovZywgJyUyQScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCcvZywgJyUyNycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCgvZywgJyUyOCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCkvZywgJyUyOScpO1xuICB9LFxuXG4gIGRlY29kZURhdGE6IGZ1bmN0aW9uKHMpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzLnJlcGxhY2UobmV3IFJlZ0V4cCgnXicgKyBwcmVmaXgpLCAnJykpLnJlcGxhY2UoL1xcJTIxL2csICchJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwlN0UvZywgJ34nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCUyQS9nLCAnKicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJTI3L2csIFwiJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCUyOC9nLCAnKCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJTI5L2csICcpJyk7XG4gICAgfSBjYXRjaChlcnIxKSB7XG4gICAgICAvLyB0cnkgdW5lc2NhcGUgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICAgIHRyeSB7IHJldHVybiB1bmVzY2FwZShzKTsgfSBjYXRjaChlcnIyKSB7IHJldHVybiAnJzsgfVxuICAgIH1cbiAgfSxcblxuICBzZXQ6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBtaW51dGVzLCBkb21haW4sIGV4Y2xfc3ViZG9tYWlucykge1xuICAgIHZhciBleHBpcmVzLCBiYXNlaG9zdDtcblxuICAgIGlmIChtaW51dGVzKSB7XG4gICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgKyAobWludXRlcyAqIDYwICogMTAwMCkpO1xuICAgICAgZXhwaXJlcyA9ICc7IGV4cGlyZXM9JyArIGRhdGUudG9HTVRTdHJpbmcoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwaXJlcyA9ICcnO1xuICAgIH1cbiAgICBpZiAoZG9tYWluICYmICFleGNsX3N1YmRvbWFpbnMpIHtcbiAgICAgIGJhc2Vob3N0ID0gJztkb21haW49LicgKyBkb21haW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2Vob3N0ID0gJyc7XG4gICAgfVxuICAgIGRvY3VtZW50LmNvb2tpZSA9IHRoaXMuZW5jb2RlRGF0YShuYW1lKSArICc9JyArIHRoaXMuZW5jb2RlRGF0YSh2YWx1ZSkgKyBleHBpcmVzICsgYmFzZWhvc3QgKyAnOyBwYXRoPS8nO1xuICB9LFxuXG4gIGdldDogZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBuYW1lRVEgPSB0aGlzLmVuY29kZURhdGEobmFtZSkgKyAnPScsXG4gICAgICAgIGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYyA9IGNhW2ldO1xuICAgICAgd2hpbGUgKGMuY2hhckF0KDApID09PSAnICcpIHsgYyA9IGMuc3Vic3RyaW5nKDEsIGMubGVuZ3RoKTsgfVxuICAgICAgaWYgKGMuaW5kZXhPZihuYW1lRVEpID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlY29kZURhdGEoYy5zdWJzdHJpbmcobmFtZUVRLmxlbmd0aCwgYy5sZW5ndGgpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgZGVzdHJveTogZnVuY3Rpb24obmFtZSwgZG9tYWluLCBleGNsX3N1YmRvbWFpbnMpIHtcbiAgICB0aGlzLnNldChuYW1lLCAnJywgLTEsIGRvbWFpbiwgZXhjbF9zdWJkb21haW5zKTtcbiAgfSxcblxuICBwYXJzZTogZnVuY3Rpb24oeXVtbXkpIHtcblxuICAgIHZhciBjb29raWVzID0gW10sXG4gICAgICAgIGRhdGEgICAgPSB7fTtcblxuICAgIGlmICh0eXBlb2YgeXVtbXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb29raWVzLnB1c2goeXVtbXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBwcm9wIGluIHl1bW15KSB7XG4gICAgICAgIGlmICh5dW1teS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgIGNvb2tpZXMucHVzaCh5dW1teVtwcm9wXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpMSA9IDA7IGkxIDwgY29va2llcy5sZW5ndGg7IGkxKyspIHtcbiAgICAgIHZhciBjb29raWVfYXJyYXk7XG4gICAgICBkYXRhW3RoaXMudW5zYmpzKGNvb2tpZXNbaTFdKV0gPSB7fTtcbiAgICAgIGlmICh0aGlzLmdldChjb29raWVzW2kxXSkpIHtcbiAgICAgICAgY29va2llX2FycmF5ID0gdGhpcy5nZXQoY29va2llc1tpMV0pLnNwbGl0KGRlbGltaXRlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb29raWVfYXJyYXkgPSBbXTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkyID0gMDsgaTIgPCBjb29raWVfYXJyYXkubGVuZ3RoOyBpMisrKSB7XG4gICAgICAgIHZhciB0bXBfYXJyYXkgPSBjb29raWVfYXJyYXlbaTJdLnNwbGl0KCc9JyksXG4gICAgICAgICAgICByZXN1bHRfYXJyYXkgPSB0bXBfYXJyYXkuc3BsaWNlKDAsIDEpO1xuICAgICAgICByZXN1bHRfYXJyYXkucHVzaCh0bXBfYXJyYXkuam9pbignPScpKTtcbiAgICAgICAgZGF0YVt0aGlzLnVuc2Jqcyhjb29raWVzW2kxXSldW3Jlc3VsdF9hcnJheVswXV0gPSB0aGlzLmRlY29kZURhdGEocmVzdWx0X2FycmF5WzFdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcblxuICB9LFxuXG4gIHVuc2JqczogZnVuY3Rpb24gKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgnc2Jqc18nLCAnJyk7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgcHJlZml4ID0gJyc7XG52YXIgZGVsaW1pdGVyID0gcmVxdWlyZSgnLi4vZGF0YScpLmRlbGltaXRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICBzZXRQcmVmaXg6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgcHJlZml4ID0gcDtcbiAgICB9LFxuXG4gICAgZ2V0UHJlZml4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHByZWZpeDtcbiAgICB9LFxuXG4gICAgZW5jb2RlRGF0YTogZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcHJlZml4ICsgZW5jb2RlVVJJQ29tcG9uZW50KHMpLnJlcGxhY2UoL1xcIS9nLCAnJTIxJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFx+L2csICclN0UnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCovZywgJyUyQScpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJy9nLCAnJTI3JylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwoL2csICclMjgnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCkvZywgJyUyOScpO1xuICAgIH0sXG5cbiAgICBkZWNvZGVEYXRhOiBmdW5jdGlvbihzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHMucmVwbGFjZShuZXcgUmVnRXhwKCdeJyArIHByZWZpeCksICcnKSkucmVwbGFjZSgvXFwlMjEvZywgJyEnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCU3RS9nLCAnficpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJTJBL2csICcqJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwlMjcvZywgXCInXCIpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJTI4L2csICcoJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwlMjkvZywgJyknKTtcbiAgICAgICAgfSBjYXRjaChlcnIxKSB7XG4gICAgICAgICAgICAvLyB0cnkgdW5lc2NhcGUgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICAgICAgICAgIHRyeSB7IHJldHVybiB1bmVzY2FwZShzKTsgfSBjYXRjaChlcnIyKSB7IHJldHVybiAnJzsgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNldDogZnVuY3Rpb24obmFtZSwgdmFsdWUsIG1pbnV0ZXMpIHtcbiAgICAgICAgdmFyIGV4cGlyZXM7XG5cbiAgICAgICAgaWYgKG1pbnV0ZXMpIHtcbiAgICAgICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSArIChtaW51dGVzICogNjAgKiAxMDAwKSk7XG4gICAgICAgICAgICBleHBpcmVzID0gZGF0ZS52YWx1ZU9mKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleHBpcmVzID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgICAgIHRoaXMuZW5jb2RlRGF0YShuYW1lKSxcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgZXhwaXJlczogZXhwaXJlc1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHZhciBsc05hbWUgPSB0aGlzLmVuY29kZURhdGEobmFtZSk7XG5cbiAgICAgICAgdmFyIHNhdmVkVmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShsc05hbWUpO1xuICAgICAgICBpZiAoc2F2ZWRWYWx1ZSkge1xuICAgICAgICAgICAgc2F2ZWRWYWx1ZSA9IEpTT04ucGFyc2Uoc2F2ZWRWYWx1ZSk7XG5cbiAgICAgICAgICAgIGlmIChzYXZlZFZhbHVlLmV4cGlyZXMgJiYgKHBhcnNlSW50KHNhdmVkVmFsdWUuZXhwaXJlcykgPCAobmV3IERhdGUoKSkudmFsdWVPZigpKSkge1xuICAgICAgICAgICAgICAgIHNhdmVkVmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGxzTmFtZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHNhdmVkVmFsdWUudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG5cbiAgICBwYXJzZTogZnVuY3Rpb24oeXVtbXkpIHtcblxuICAgICAgICB2YXIgY29va2llcyA9IFtdLFxuICAgICAgICAgICAgZGF0YSAgICA9IHt9O1xuXG4gICAgICAgIGlmICh0eXBlb2YgeXVtbXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb29raWVzLnB1c2goeXVtbXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiB5dW1teSkge1xuICAgICAgICAgICAgICAgIGlmICh5dW1teS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICBjb29raWVzLnB1c2goeXVtbXlbcHJvcF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkxID0gMDsgaTEgPCBjb29raWVzLmxlbmd0aDsgaTErKykge1xuICAgICAgICAgICAgdmFyIGNvb2tpZV9hcnJheTtcbiAgICAgICAgICAgIGRhdGFbdGhpcy51bnNianMoY29va2llc1tpMV0pXSA9IHt9O1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KGNvb2tpZXNbaTFdKSkge1xuICAgICAgICAgICAgICAgIGNvb2tpZV9hcnJheSA9IHRoaXMuZ2V0KGNvb2tpZXNbaTFdKS5zcGxpdChkZWxpbWl0ZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb29raWVfYXJyYXkgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkyID0gMDsgaTIgPCBjb29raWVfYXJyYXkubGVuZ3RoOyBpMisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRtcF9hcnJheSA9IGNvb2tpZV9hcnJheVtpMl0uc3BsaXQoJz0nKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0X2FycmF5ID0gdG1wX2FycmF5LnNwbGljZSgwLCAxKTtcbiAgICAgICAgICAgICAgICByZXN1bHRfYXJyYXkucHVzaCh0bXBfYXJyYXkuam9pbignPScpKTtcbiAgICAgICAgICAgICAgICBkYXRhW3RoaXMudW5zYmpzKGNvb2tpZXNbaTFdKV1bcmVzdWx0X2FycmF5WzBdXSA9IHRoaXMuZGVjb2RlRGF0YShyZXN1bHRfYXJyYXlbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRhdGE7XG5cbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLmVuY29kZURhdGEobmFtZSkpO1xuICAgIH0sXG5cbiAgICB1bnNianM6IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKCdzYmpzXycsICcnKTtcbiAgICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgcGFyc2U6IGZ1bmN0aW9uKHN0cikge1xuICAgIHZhciBvID0gdGhpcy5wYXJzZU9wdGlvbnMsXG4gICAgICAgIG0gPSBvLnBhcnNlcltvLnN0cmljdE1vZGUgPyAnc3RyaWN0JyA6ICdsb29zZSddLmV4ZWMoc3RyKSxcbiAgICAgICAgdXJpID0ge30sXG4gICAgICAgIGkgPSAxNDtcblxuICAgIHdoaWxlIChpLS0pIHsgdXJpW28ua2V5W2ldXSA9IG1baV0gfHwgJyc7IH1cblxuICAgIHVyaVtvLnEubmFtZV0gPSB7fTtcbiAgICB1cmlbby5rZXlbMTJdXS5yZXBsYWNlKG8ucS5wYXJzZXIsIGZ1bmN0aW9uICgkMCwgJDEsICQyKSB7XG4gICAgICBpZiAoJDEpIHsgdXJpW28ucS5uYW1lXVskMV0gPSAkMjsgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHVyaTtcbiAgfSxcblxuICBwYXJzZU9wdGlvbnM6IHtcbiAgICBzdHJpY3RNb2RlOiBmYWxzZSxcbiAgICBrZXk6IFsnc291cmNlJywncHJvdG9jb2wnLCdhdXRob3JpdHknLCd1c2VySW5mbycsJ3VzZXInLCdwYXNzd29yZCcsJ2hvc3QnLCdwb3J0JywncmVsYXRpdmUnLCdwYXRoJywnZGlyZWN0b3J5JywnZmlsZScsJ3F1ZXJ5JywnYW5jaG9yJ10sXG4gICAgcToge1xuICAgICAgbmFtZTogICAncXVlcnlLZXknLFxuICAgICAgcGFyc2VyOiAvKD86XnwmKShbXiY9XSopPT8oW14mXSopL2dcbiAgICB9LFxuICAgIHBhcnNlcjoge1xuICAgICAgc3RyaWN0OiAvXig/OihbXjpcXC8/I10rKTopPyg/OlxcL1xcLygoPzooKFteOkBdKikoPzo6KFteOkBdKikpPyk/QCk/KFteOlxcLz8jXSopKD86OihcXGQqKSk/KSk/KCgoKD86W14/I1xcL10qXFwvKSopKFtePyNdKikpKD86XFw/KFteI10qKSk/KD86IyguKikpPykvLFxuICAgICAgbG9vc2U6ICAvXig/Oig/IVteOkBdKzpbXjpAXFwvXSpAKShbXjpcXC8/Iy5dKyk6KT8oPzpcXC9cXC8pPygoPzooKFteOkBdKikoPzo6KFteOkBdKikpPyk/QCk/KFteOlxcLz8jXSopKD86OihcXGQqKSk/KSgoKFxcLyg/OltePyNdKD8hW14/I1xcL10qXFwuW14/I1xcLy5dKyg/Ols/I118JCkpKSpcXC8/KT8oW14/I1xcL10qKSkoPzpcXD8oW14jXSopKT8oPzojKC4qKSk/KS9cbiAgICB9XG4gIH0sXG5cbiAgZ2V0UGFyYW06IGZ1bmN0aW9uKGN1c3RvbV9wYXJhbXMpIHtcbiAgICB2YXIgcXVlcnlfc3RyaW5nID0ge30sXG4gICAgICAgIHF1ZXJ5ID0gY3VzdG9tX3BhcmFtcyA/IGN1c3RvbV9wYXJhbXMgOiB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSxcbiAgICAgICAgdmFycyA9IHF1ZXJ5LnNwbGl0KCcmJyk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwYWlyID0gdmFyc1tpXS5zcGxpdCgnPScpO1xuICAgICAgaWYgKHR5cGVvZiBxdWVyeV9zdHJpbmdbcGFpclswXV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHF1ZXJ5X3N0cmluZ1twYWlyWzBdXSA9IHBhaXJbMV07XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBxdWVyeV9zdHJpbmdbcGFpclswXV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHZhciBhcnIgPSBbIHF1ZXJ5X3N0cmluZ1twYWlyWzBdXSwgcGFpclsxXSBdO1xuICAgICAgICBxdWVyeV9zdHJpbmdbcGFpclswXV0gPSBhcnI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeV9zdHJpbmdbcGFpclswXV0ucHVzaChwYWlyWzFdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHF1ZXJ5X3N0cmluZztcbiAgfSxcblxuICBnZXRIb3N0OiBmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2UocmVxdWVzdCkuaG9zdC5yZXBsYWNlKCd3d3cuJywgJycpO1xuICB9XG5cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGVzY2FwZVJlZ2V4cDogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bXFwtXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIik7XG4gIH0sXG5cbiAgc2V0RGF0ZTogZnVuY3Rpb24oZGF0ZSwgb2Zmc2V0KSB7XG4gICAgdmFyIHV0Y19vZmZzZXQgICAgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCkgLyA2MCxcbiAgICAgICAgbm93X2hvdXJzICAgICA9IGRhdGUuZ2V0SG91cnMoKSxcbiAgICAgICAgY3VzdG9tX29mZnNldCA9IG9mZnNldCB8fCBvZmZzZXQgPT09IDAgPyBvZmZzZXQgOiAtdXRjX29mZnNldDtcblxuICAgIGRhdGUuc2V0SG91cnMobm93X2hvdXJzICsgdXRjX29mZnNldCArIGN1c3RvbV9vZmZzZXQpO1xuXG4gICAgdmFyIHllYXIgICAgPSBkYXRlLmdldEZ1bGxZZWFyKCksXG4gICAgICAgIG1vbnRoICAgPSB0aGlzLnNldExlYWRpbmdaZXJvVG9JbnQoZGF0ZS5nZXRNb250aCgpICsgMSwgICAyKSxcbiAgICAgICAgZGF5ICAgICA9IHRoaXMuc2V0TGVhZGluZ1plcm9Ub0ludChkYXRlLmdldERhdGUoKSwgICAgICAgIDIpLFxuICAgICAgICBob3VyICAgID0gdGhpcy5zZXRMZWFkaW5nWmVyb1RvSW50KGRhdGUuZ2V0SG91cnMoKSwgICAgICAgMiksXG4gICAgICAgIG1pbnV0ZSAgPSB0aGlzLnNldExlYWRpbmdaZXJvVG9JbnQoZGF0ZS5nZXRNaW51dGVzKCksICAgICAyKSxcbiAgICAgICAgc2Vjb25kICA9IHRoaXMuc2V0TGVhZGluZ1plcm9Ub0ludChkYXRlLmdldFNlY29uZHMoKSwgICAgIDIpO1xuXG4gICAgcmV0dXJuICh5ZWFyICsgJy0nICsgbW9udGggKyAnLScgKyBkYXkgKyAnICcgKyBob3VyICsgJzonICsgbWludXRlICsgJzonICsgc2Vjb25kKTtcbiAgfSxcblxuICBzZXRMZWFkaW5nWmVyb1RvSW50OiBmdW5jdGlvbihudW0sIHNpemUpIHtcbiAgICB2YXIgcyA9IG51bSArICcnO1xuICAgIHdoaWxlIChzLmxlbmd0aCA8IHNpemUpIHsgcyA9ICcwJyArIHM7IH1cbiAgICByZXR1cm4gcztcbiAgfSxcblxuICByYW5kb21JbnQ6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZGF0YSAgICAgICAgPSByZXF1aXJlKCcuL2RhdGEnKSxcbiAgICB0ZXJtcyAgICAgICA9IHJlcXVpcmUoJy4vdGVybXMnKSxcbiAgICBjb29raWVzICAgICA9IHJlcXVpcmUoJy4vaGVscGVycy9sb2NhbFN0b3JhZ2UnKSxcbiAgICB1cmkgICAgICAgICA9IHJlcXVpcmUoJy4vaGVscGVycy91cmknKSxcbiAgICB1dGlscyAgICAgICA9IHJlcXVpcmUoJy4vaGVscGVycy91dGlscycpLFxuICAgIHBhcmFtcyAgICAgID0gcmVxdWlyZSgnLi9wYXJhbXMnKSxcbiAgICBtaWdyYXRpb25zICA9IHJlcXVpcmUoJy4vbWlncmF0aW9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByZWZzKSB7XG5cbiAgdmFyIHAgICAgICAgICA9IHBhcmFtcy5mZXRjaChwcmVmcyk7XG4gIHZhciBnZXRfcGFyYW0gPSB1cmkuZ2V0UGFyYW0oKTtcbiAgdmFyIGRvbWFpbiAgICA9IHAuZG9tYWluLmhvc3QsXG4gICAgICBpc29sYXRlICAgPSBwLmRvbWFpbi5pc29sYXRlLFxuICAgICAgbGlmZXRpbWUgID0gcC5saWZldGltZTtcblxuICBjb29raWVzLnNldFByZWZpeChwLnByZWZpeCk7XG5cbiAgbWlncmF0aW9ucy5nbyhsaWZldGltZSwgZG9tYWluLCBpc29sYXRlKTtcblxuICB2YXIgX19zYmpzX3R5cGUsXG4gICAgICBfX3NianNfc291cmNlLFxuICAgICAgX19zYmpzX21lZGl1bSxcbiAgICAgIF9fc2Jqc19jYW1wYWlnbixcbiAgICAgIF9fc2Jqc19jb250ZW50LFxuICAgICAgX19zYmpzX3Rlcm07XG5cbiAgZnVuY3Rpb24gbWFpbkRhdGEoKSB7XG4gICAgdmFyIHNianNfZGF0YTtcbiAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW0udXRtX3NvdXJjZSAgICAgICAgIT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW0udXRtX21lZGl1bSAgICAgICAgIT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW0udXRtX2NhbXBhaWduICAgICAgIT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW0udXRtX2NvbnRlbnQgICAgICAgIT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW0udXRtX3Rlcm0gICAgICAgICAgIT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW0uZ2NsaWQgICAgICAgICAgICAgIT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW0ueWNsaWQgICAgICAgICAgICAgIT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW1bcC5jYW1wYWlnbl9wYXJhbV0gIT09ICd1bmRlZmluZWQnXG4gICAgICApIHtcbiAgICAgIHNldEZpcnN0QW5kQ3VycmVudEV4dHJhRGF0YSgpO1xuICAgICAgc2Jqc19kYXRhID0gZ2V0RGF0YSh0ZXJtcy50cmFmZmljLnV0bSk7XG4gICAgfSBlbHNlIGlmIChjaGVja1JlZmVyZXIodGVybXMudHJhZmZpYy5vcmdhbmljKSkge1xuICAgICAgc2V0Rmlyc3RBbmRDdXJyZW50RXh0cmFEYXRhKCk7XG4gICAgICBzYmpzX2RhdGEgPSBnZXREYXRhKHRlcm1zLnRyYWZmaWMub3JnYW5pYyk7XG4gICAgfSBlbHNlIGlmICghY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLnNlc3Npb24pICYmIGNoZWNrUmVmZXJlcih0ZXJtcy50cmFmZmljLnJlZmVycmFsKSkge1xuICAgICAgc2V0Rmlyc3RBbmRDdXJyZW50RXh0cmFEYXRhKCk7XG4gICAgICBzYmpzX2RhdGEgPSBnZXREYXRhKHRlcm1zLnRyYWZmaWMucmVmZXJyYWwpO1xuICAgIH0gZWxzZSBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5maXJzdCkgJiYgIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5jdXJyZW50KSkge1xuICAgICAgc2V0Rmlyc3RBbmRDdXJyZW50RXh0cmFEYXRhKCk7XG4gICAgICBzYmpzX2RhdGEgPSBnZXREYXRhKHRlcm1zLnRyYWZmaWMudHlwZWluKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5jdXJyZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2Jqc19kYXRhO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0RGF0YSh0eXBlKSB7XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcblxuICAgICAgY2FzZSB0ZXJtcy50cmFmZmljLnV0bTpcblxuICAgICAgICBfX3NianNfdHlwZSA9IHRlcm1zLnRyYWZmaWMudXRtO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZ2V0X3BhcmFtLnV0bV9zb3VyY2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9IGdldF9wYXJhbS51dG1fc291cmNlO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW0uZ2NsaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9ICdnb29nbGUnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW0ueWNsaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9ICd5YW5kZXgnOyAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9IHRlcm1zLm5vbmU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGdldF9wYXJhbS51dG1fbWVkaXVtICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIF9fc2Jqc19tZWRpdW0gPSBnZXRfcGFyYW0udXRtX21lZGl1bTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZ2V0X3BhcmFtLmdjbGlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIF9fc2Jqc19tZWRpdW0gPSAnY3BjJztcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZ2V0X3BhcmFtLnljbGlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIF9fc2Jqc19tZWRpdW0gPSAnY3BjJzsgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9fc2Jqc19tZWRpdW0gPSB0ZXJtcy5ub25lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBnZXRfcGFyYW0udXRtX2NhbXBhaWduICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IGdldF9wYXJhbS51dG1fY2FtcGFpZ247XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldF9wYXJhbVtwLmNhbXBhaWduX3BhcmFtXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBfX3NianNfY2FtcGFpZ24gPSBnZXRfcGFyYW1bcC5jYW1wYWlnbl9wYXJhbV07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldF9wYXJhbS5nY2xpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBfX3NianNfY2FtcGFpZ24gPSAnZ29vZ2xlX2NwYyc7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldF9wYXJhbS55Y2xpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBfX3NianNfY2FtcGFpZ24gPSAneWFuZGV4X2NwYyc7ICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfX3NianNfY2FtcGFpZ24gPSB0ZXJtcy5ub25lO1xuICAgICAgICB9XG5cbiAgICAgICAgX19zYmpzX2NvbnRlbnQgID0gZ2V0X3BhcmFtLnV0bV9jb250ZW50IHx8IHRlcm1zLm5vbmU7XG4gICAgICAgIF9fc2Jqc190ZXJtICAgICA9IGdldFV0bVRlcm0oKSAgICAgICAgICB8fCB0ZXJtcy5ub25lO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSB0ZXJtcy50cmFmZmljLm9yZ2FuaWM6XG4gICAgICAgIF9fc2Jqc190eXBlICAgICA9IHRlcm1zLnRyYWZmaWMub3JnYW5pYztcbiAgICAgICAgX19zYmpzX3NvdXJjZSAgID0gX19zYmpzX3NvdXJjZSB8fCB1cmkuZ2V0SG9zdChkb2N1bWVudC5yZWZlcnJlcik7XG4gICAgICAgIF9fc2Jqc19tZWRpdW0gICA9IHRlcm1zLnJlZmVyZXIub3JnYW5pYztcbiAgICAgICAgX19zYmpzX2NhbXBhaWduID0gdGVybXMubm9uZTtcbiAgICAgICAgX19zYmpzX2NvbnRlbnQgID0gdGVybXMubm9uZTtcbiAgICAgICAgX19zYmpzX3Rlcm0gICAgID0gdGVybXMubm9uZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgdGVybXMudHJhZmZpYy5yZWZlcnJhbDpcbiAgICAgICAgX19zYmpzX3R5cGUgICAgID0gdGVybXMudHJhZmZpYy5yZWZlcnJhbDtcbiAgICAgICAgX19zYmpzX3NvdXJjZSAgID0gX19zYmpzX3NvdXJjZSB8fCB1cmkuZ2V0SG9zdChkb2N1bWVudC5yZWZlcnJlcik7XG4gICAgICAgIF9fc2Jqc19tZWRpdW0gICA9IF9fc2Jqc19tZWRpdW0gfHwgdGVybXMucmVmZXJlci5yZWZlcnJhbDtcbiAgICAgICAgX19zYmpzX2NhbXBhaWduID0gdGVybXMubm9uZTtcbiAgICAgICAgX19zYmpzX2NvbnRlbnQgID0gdXJpLnBhcnNlKGRvY3VtZW50LnJlZmVycmVyKS5wYXRoO1xuICAgICAgICBfX3NianNfdGVybSAgICAgPSB0ZXJtcy5ub25lO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSB0ZXJtcy50cmFmZmljLnR5cGVpbjpcbiAgICAgICAgX19zYmpzX3R5cGUgICAgID0gdGVybXMudHJhZmZpYy50eXBlaW47XG4gICAgICAgIF9fc2Jqc19zb3VyY2UgICA9IHAudHlwZWluX2F0dHJpYnV0ZXMuc291cmNlO1xuICAgICAgICBfX3NianNfbWVkaXVtICAgPSBwLnR5cGVpbl9hdHRyaWJ1dGVzLm1lZGl1bTtcbiAgICAgICAgX19zYmpzX2NhbXBhaWduID0gdGVybXMubm9uZTtcbiAgICAgICAgX19zYmpzX2NvbnRlbnQgID0gdGVybXMubm9uZTtcbiAgICAgICAgX19zYmpzX3Rlcm0gICAgID0gdGVybXMubm9uZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIF9fc2Jqc190eXBlICAgICA9IHRlcm1zLm9vcHM7XG4gICAgICAgIF9fc2Jqc19zb3VyY2UgICA9IHRlcm1zLm9vcHM7XG4gICAgICAgIF9fc2Jqc19tZWRpdW0gICA9IHRlcm1zLm9vcHM7XG4gICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IHRlcm1zLm9vcHM7XG4gICAgICAgIF9fc2Jqc19jb250ZW50ICA9IHRlcm1zLm9vcHM7XG4gICAgICAgIF9fc2Jqc190ZXJtICAgICA9IHRlcm1zLm9vcHM7XG4gICAgfVxuICAgIHZhciBzYmpzX2RhdGEgPSB7XG4gICAgICB0eXBlOiAgICAgICAgICAgICBfX3NianNfdHlwZSxcbiAgICAgIHNvdXJjZTogICAgICAgICAgIF9fc2Jqc19zb3VyY2UsXG4gICAgICBtZWRpdW06ICAgICAgICAgICBfX3NianNfbWVkaXVtLFxuICAgICAgY2FtcGFpZ246ICAgICAgICAgX19zYmpzX2NhbXBhaWduLFxuICAgICAgY29udGVudDogICAgICAgICAgX19zYmpzX2NvbnRlbnQsXG4gICAgICB0ZXJtOiAgICAgICAgICAgICBfX3NianNfdGVybVxuICAgIH07XG5cbiAgICByZXR1cm4gZGF0YS5wYWNrLm1haW4oc2Jqc19kYXRhKTtcblxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VXRtVGVybSgpIHtcbiAgICB2YXIgcmVmZXJlciA9IGRvY3VtZW50LnJlZmVycmVyO1xuICAgIGlmIChnZXRfcGFyYW0udXRtX3Rlcm0pIHtcbiAgICAgIHJldHVybiBnZXRfcGFyYW0udXRtX3Rlcm07XG4gICAgfSBlbHNlIGlmIChyZWZlcmVyICYmIHVyaS5wYXJzZShyZWZlcmVyKS5ob3N0ICYmIHVyaS5wYXJzZShyZWZlcmVyKS5ob3N0Lm1hdGNoKC9eKD86LipcXC4pP3lhbmRleFxcLi57Miw5fSQvaSkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB1cmkuZ2V0UGFyYW0odXJpLnBhcnNlKGRvY3VtZW50LnJlZmVycmVyKS5xdWVyeSkudGV4dDtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja1JlZmVyZXIodHlwZSkge1xuICAgIHZhciByZWZlcmVyID0gZG9jdW1lbnQucmVmZXJyZXI7XG4gICAgc3dpdGNoKHR5cGUpIHtcbiAgICAgIGNhc2UgdGVybXMudHJhZmZpYy5vcmdhbmljOlxuICAgICAgICByZXR1cm4gKCEhcmVmZXJlciAmJiBjaGVja1JlZmVyZXJIb3N0KHJlZmVyZXIpICYmIGlzT3JnYW5pYyhyZWZlcmVyKSk7XG4gICAgICBjYXNlIHRlcm1zLnRyYWZmaWMucmVmZXJyYWw6XG4gICAgICAgIHJldHVybiAoISFyZWZlcmVyICYmIGNoZWNrUmVmZXJlckhvc3QocmVmZXJlcikgJiYgaXNSZWZlcnJhbChyZWZlcmVyKSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tSZWZlcmVySG9zdChyZWZlcmVyKSB7XG4gICAgaWYgKHAuZG9tYWluKSB7XG4gICAgICBpZiAoIWlzb2xhdGUpIHtcbiAgICAgICAgdmFyIGhvc3RfcmVnZXggPSBuZXcgUmVnRXhwKCdeKD86LipcXFxcLik/JyArIHV0aWxzLmVzY2FwZVJlZ2V4cChkb21haW4pICsgJyQnLCAnaScpO1xuICAgICAgICByZXR1cm4gISh1cmkuZ2V0SG9zdChyZWZlcmVyKS5tYXRjaChob3N0X3JlZ2V4KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKHVyaS5nZXRIb3N0KHJlZmVyZXIpICE9PSB1cmkuZ2V0SG9zdChkb21haW4pKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICh1cmkuZ2V0SG9zdChyZWZlcmVyKSAhPT0gdXJpLmdldEhvc3QoZG9jdW1lbnQubG9jYXRpb24uaHJlZikpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzT3JnYW5pYyhyZWZlcmVyKSB7XG5cbiAgICB2YXIgeV9ob3N0ICA9ICd5YW5kZXgnLFxuICAgICAgICB5X3BhcmFtID0gJ3RleHQnLFxuICAgICAgICBnX2hvc3QgID0gJ2dvb2dsZSc7XG5cbiAgICB2YXIgeV9ob3N0X3JlZ2V4ICA9IG5ldyBSZWdFeHAoJ14oPzouKlxcXFwuKT8nICArIHV0aWxzLmVzY2FwZVJlZ2V4cCh5X2hvc3QpICArICdcXFxcLi57Miw5fSQnKSxcbiAgICAgICAgeV9wYXJhbV9yZWdleCA9IG5ldyBSZWdFeHAoJy4qJyAgICAgICAgICAgKyB1dGlscy5lc2NhcGVSZWdleHAoeV9wYXJhbSkgKyAnPS4qJyksXG4gICAgICAgIGdfaG9zdF9yZWdleCAgPSBuZXcgUmVnRXhwKCdeKD86d3d3XFxcXC4pPycgKyB1dGlscy5lc2NhcGVSZWdleHAoZ19ob3N0KSAgKyAnXFxcXC4uezIsOX0kJyk7XG5cbiAgICBpZiAoXG4gICAgICAgICEhdXJpLnBhcnNlKHJlZmVyZXIpLnF1ZXJ5ICYmXG4gICAgICAgICEhdXJpLnBhcnNlKHJlZmVyZXIpLmhvc3QubWF0Y2goeV9ob3N0X3JlZ2V4KSAmJlxuICAgICAgICAhIXVyaS5wYXJzZShyZWZlcmVyKS5xdWVyeS5tYXRjaCh5X3BhcmFtX3JlZ2V4KVxuICAgICAgKSB7XG4gICAgICBfX3NianNfc291cmNlID0geV9ob3N0O1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICghIXVyaS5wYXJzZShyZWZlcmVyKS5ob3N0Lm1hdGNoKGdfaG9zdF9yZWdleCkpIHtcbiAgICAgIF9fc2Jqc19zb3VyY2UgPSBnX2hvc3Q7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKCEhdXJpLnBhcnNlKHJlZmVyZXIpLnF1ZXJ5KSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHAub3JnYW5pY3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdXJpLnBhcnNlKHJlZmVyZXIpLmhvc3QubWF0Y2gobmV3IFJlZ0V4cCgnXig/Oi4qXFxcXC4pPycgKyB1dGlscy5lc2NhcGVSZWdleHAocC5vcmdhbmljc1tpXS5ob3N0KSAgKyAnJCcsICdpJykpICYmXG4gICAgICAgICAgICB1cmkucGFyc2UocmVmZXJlcikucXVlcnkubWF0Y2gobmV3IFJlZ0V4cCgnLionICAgICAgICAgKyB1dGlscy5lc2NhcGVSZWdleHAocC5vcmdhbmljc1tpXS5wYXJhbSkgKyAnPS4qJywgJ2knKSlcbiAgICAgICAgICApIHtcbiAgICAgICAgICBfX3NianNfc291cmNlID0gcC5vcmdhbmljc1tpXS5kaXNwbGF5IHx8IHAub3JnYW5pY3NbaV0uaG9zdDtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSArIDEgPT09IHAub3JnYW5pY3MubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc1JlZmVycmFsKHJlZmVyZXIpIHtcbiAgICBpZiAocC5yZWZlcnJhbHMubGVuZ3RoID4gMCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLnJlZmVycmFscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodXJpLnBhcnNlKHJlZmVyZXIpLmhvc3QubWF0Y2gobmV3IFJlZ0V4cCgnXig/Oi4qXFxcXC4pPycgKyB1dGlscy5lc2NhcGVSZWdleHAocC5yZWZlcnJhbHNbaV0uaG9zdCkgKyAnJCcsICdpJykpKSB7XG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9IHAucmVmZXJyYWxzW2ldLmRpc3BsYXkgIHx8IHAucmVmZXJyYWxzW2ldLmhvc3Q7XG4gICAgICAgICAgX19zYmpzX21lZGl1bSA9IHAucmVmZXJyYWxzW2ldLm1lZGl1bSAgIHx8IHRlcm1zLnJlZmVyZXIucmVmZXJyYWw7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgKyAxID09PSBwLnJlZmVycmFscy5sZW5ndGgpIHtcbiAgICAgICAgICBfX3NianNfc291cmNlID0gdXJpLmdldEhvc3QocmVmZXJlcik7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgX19zYmpzX3NvdXJjZSA9IHVyaS5nZXRIb3N0KHJlZmVyZXIpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2V0Rmlyc3RBbmRDdXJyZW50RXh0cmFEYXRhKCkge1xuICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5jdXJyZW50X2V4dHJhLCBkYXRhLnBhY2suZXh0cmEocC50aW1lem9uZV9vZmZzZXQpLCBsaWZldGltZSwgZG9tYWluLCBpc29sYXRlKTtcbiAgICBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5maXJzdF9leHRyYSkpIHtcbiAgICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5maXJzdF9leHRyYSwgZGF0YS5wYWNrLmV4dHJhKHAudGltZXpvbmVfb2Zmc2V0KSwgbGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgKGZ1bmN0aW9uIHNldERhdGEoKSB7XG5cbiAgICAvLyBNYWluIGRhdGFcbiAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMuY3VycmVudCwgbWFpbkRhdGEoKSwgbGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSk7XG4gICAgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuZmlyc3QpKSB7XG4gICAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMuZmlyc3QsIGNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5jdXJyZW50KSwgbGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSk7XG4gICAgfVxuXG4gICAgLy8gVXNlciBkYXRhXG4gICAgdmFyIHZpc2l0cywgdWRhdGE7XG4gICAgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMudWRhdGEpKSB7XG4gICAgICB2aXNpdHMgID0gMTtcbiAgICAgIHVkYXRhICAgPSBkYXRhLnBhY2sudXNlcih2aXNpdHMsIHAudXNlcl9pcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZpc2l0cyAgPSBwYXJzZUludChjb29raWVzLnBhcnNlKGRhdGEuY29udGFpbmVycy51ZGF0YSlbY29va2llcy51bnNianMoZGF0YS5jb250YWluZXJzLnVkYXRhKV1bZGF0YS5hbGlhc2VzLnVkYXRhLnZpc2l0c10pIHx8IDE7XG4gICAgICB2aXNpdHMgID0gY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLnNlc3Npb24pID8gdmlzaXRzIDogdmlzaXRzICsgMTtcbiAgICAgIHVkYXRhICAgPSBkYXRhLnBhY2sudXNlcih2aXNpdHMsIHAudXNlcl9pcCk7XG4gICAgfVxuICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy51ZGF0YSwgdWRhdGEsIGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xuXG4gICAgLy8gU2Vzc2lvblxuICAgIHZhciBwYWdlc19jb3VudDtcbiAgICBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uKSkge1xuICAgICAgcGFnZXNfY291bnQgPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYWdlc19jb3VudCA9IHBhcnNlSW50KGNvb2tpZXMucGFyc2UoZGF0YS5jb250YWluZXJzLnNlc3Npb24pW2Nvb2tpZXMudW5zYmpzKGRhdGEuY29udGFpbmVycy5zZXNzaW9uKV1bZGF0YS5hbGlhc2VzLnNlc3Npb24ucGFnZXNfc2Vlbl0pIHx8IDE7XG4gICAgICBwYWdlc19jb3VudCArPSAxO1xuICAgIH1cbiAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbiwgZGF0YS5wYWNrLnNlc3Npb24ocGFnZXNfY291bnQpLCBwLnNlc3Npb25fbGVuZ3RoLCBkb21haW4sIGlzb2xhdGUpO1xuXG4gICAgLy8gUHJvbW9jb2RlXG4gICAgaWYgKHAucHJvbW9jb2RlICYmICFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMucHJvbW9jb2RlKSkge1xuICAgICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLnByb21vY29kZSwgZGF0YS5wYWNrLnByb21vKHAucHJvbW9jb2RlKSwgbGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSk7XG4gICAgfVxuXG4gIH0pKCk7XG5cbiAgcmV0dXJuIGNvb2tpZXMucGFyc2UoZGF0YS5jb250YWluZXJzKTtcblxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEnKSxcbiAgICBjb29raWVzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2Nvb2tpZXMnKSxcbiAgICBscyA9IHJlcXVpcmUoJy4vaGVscGVycy9sb2NhbFN0b3JhZ2UnKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIGdvOiBmdW5jdGlvbiAobGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSkge1xuXG4gICAgICAgIHZhciBtaWdyYXRlID0gdGhpcy5taWdyYXRpb25zLFxuICAgICAgICAgICAgX3dpdGggPSB7bDogbGlmZXRpbWUsIGQ6IGRvbWFpbiwgaTogaXNvbGF0ZX07XG5cbiAgICAgICAgdmFyIGk7XG4gICAgICAgIHZhciBtaWRzID0gW107XG4gICAgICAgIHZhciBhZHZhbmNlID0gJyc7XG5cbiAgICAgICAgY29va2llcy5zZXRQcmVmaXgobHMuZ2V0UHJlZml4KCkpO1xuICAgICAgICBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5maXJzdCkgJiYgIWNvb2tpZXMuZ2V0KGRhdGEuc2VydmljZS5taWdyYXRpb25zKSkge1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbWlncmF0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG1pZHMucHVzaChtaWdyYXRlW2ldLmlkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWR2YW5jZSA9ICcnO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG1pZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBhZHZhbmNlICs9IG1pZHNbaV0gKyAnPTEnO1xuICAgICAgICAgICAgICAgIGlmIChpIDwgbWlkcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkdmFuY2UgKz0gZGF0YS5kZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29va2llcy5zZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMsIGFkdmFuY2UsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuc2VydmljZS5taWdyYXRpb25zKSkge1xuXG4gICAgICAgICAgICAvLyBXZSBoYXZlIG9ubHkgb25lIG1pZ3JhdGlvbiBmb3Igbm93LCBzbyBqdXN0XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbWlncmF0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG1pZ3JhdGVbaV0uZ28obWlncmF0ZVtpXS5pZCwgX3dpdGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtaWRzID0gY29va2llcy5nZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMpLnNwbGl0KGRhdGEuZGVsaW1pdGVyKTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWdyYXRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pZHMuaW5kZXhPZihtaWdyYXRlW2ldLmlkICsgJz0xJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtaWdyYXRpbmc6ICcgKyBtaWdyYXRlW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgbWlncmF0ZVtpXS5nbyhtaWdyYXRlW2ldLmlkLCBfd2l0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtaWRzID0gW107XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbWlncmF0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG1pZHMucHVzaChtaWdyYXRlW2ldLmlkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWR2YW5jZSA9ICcnO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG1pZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBhZHZhbmNlICs9IG1pZHNbaV0gKyAnPTEnO1xuICAgICAgICAgICAgICAgIGlmIChpIDwgbWlkcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkdmFuY2UgKz0gZGF0YS5kZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29va2llcy5zZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMsIGFkdmFuY2UsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuICAgICAgICB9XG5cbiAgICB9LFxuXG4gICAgbWlncmF0aW9uczogW1xuXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnMTQxODQ3NDM3NTk5OCcsXG4gICAgICAgICAgICB2ZXJzaW9uOiAnMS4wLjAtYmV0YScsXG4gICAgICAgICAgICBnbzogZnVuY3Rpb24gKG1pZCwgX3dpdGgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBzdWNjZXNzID0gbWlkICsgJz0xJyxcbiAgICAgICAgICAgICAgICAgICAgZmFpbCA9IG1pZCArICc9MCc7XG5cbiAgICAgICAgICAgICAgICB2YXIgc2FmZVJlcGxhY2UgPSBmdW5jdGlvbiAoJDAsICQxLCAkMikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCQxIHx8ICQyID8gJDAgOiBkYXRhLmRlbGltaXRlcik7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU3dpdGNoIGRlbGltaXRlciBhbmQgcmVuZXcgY29va2llc1xuICAgICAgICAgICAgICAgICAgICB2YXIgX2luID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gZGF0YS5jb250YWluZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb250YWluZXJzLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2luLnB1c2goZGF0YS5jb250YWluZXJzW3Byb3BdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2luLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29va2llcy5nZXQoX2luW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBidWZmZXIgPSBjb29raWVzLmdldChfaW5baV0pLnJlcGxhY2UoLyhcXHwpP1xcfChcXHwpPy9nLCBzYWZlUmVwbGFjZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29va2llcy5kZXN0cm95KF9pbltpXSwgX3dpdGguZCwgX3dpdGguaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29va2llcy5kZXN0cm95KF9pbltpXSwgX3dpdGguZCwgIV93aXRoLmkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb2tpZXMuc2V0KF9pbltpXSwgYnVmZmVyLCBfd2l0aC5sLCBfd2l0aC5kLCBfd2l0aC5pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBgc2Vzc2lvbmBcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLnNlc3Npb24sIGRhdGEucGFjay5zZXNzaW9uKDApLCBfd2l0aC5sLCBfd2l0aC5kLCBfd2l0aC5pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFlheSFcbiAgICAgICAgICAgICAgICAgICAgY29va2llcy5zZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMsIHN1Y2Nlc3MsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9vcHNcbiAgICAgICAgICAgICAgICAgICAgY29va2llcy5zZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMsIGZhaWwsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICcxNDcxNTE5NzUyNjAwJyxcbiAgICAgICAgICAgIHZlcnNpb246ICcxLjAuNScsXG4gICAgICAgICAgICBnbzogZnVuY3Rpb24gKG1pZCwgX3dpdGgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBzdWNjZXNzID0gbWlkICsgJz0xJyxcbiAgICAgICAgICAgICAgICAgICAgZmFpbCA9IG1pZCArICc9MCcsXG4gICAgICAgICAgICAgICAgICAgIG9sZFByZWZpeCA9ICcnLFxuICAgICAgICAgICAgICAgICAgICBuZXdQcmVmaXggPSBjb29raWVzLmdldFByZWZpeCgpO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29va2llcy5zZXRQcmVmaXgob2xkUHJlZml4KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgX2luID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gZGF0YS5jb250YWluZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb250YWluZXJzLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2luLnB1c2goZGF0YS5jb250YWluZXJzW3Byb3BdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2luLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29raWVzLnNldFByZWZpeChvbGRQcmVmaXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvb2tpZXMuZ2V0KF9pbltpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gY29va2llcy5nZXQoX2luW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29raWVzLnNldFByZWZpeChuZXdQcmVmaXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb2tpZXMuc2V0KF9pbltpXSwgYnVmZmVyLCBfd2l0aC5sLCBfd2l0aC5kLCBfd2l0aC5pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBgc2Vzc2lvbmBcbiAgICAgICAgICAgICAgICAgICAgY29va2llcy5zZXRQcmVmaXgob2xkUHJlZml4KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29va2llcy5zZXRQcmVmaXgobmV3UHJlZml4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uLCBkYXRhLnBhY2suc2Vzc2lvbigwKSwgX3dpdGgubCwgX3dpdGguZCwgX3dpdGguaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBZYXkhXG4gICAgICAgICAgICAgICAgICAgIGNvb2tpZXMuc2V0UHJlZml4KG5ld1ByZWZpeCk7XG4gICAgICAgICAgICAgICAgICAgIGNvb2tpZXMuc2V0KGRhdGEuc2VydmljZS5taWdyYXRpb25zLCBzdWNjZXNzLCBfd2l0aC5sLCBfd2l0aC5kLCBfd2l0aC5pKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAvLyBPb3BzXG4gICAgICAgICAgICAgICAgICAgIGNvb2tpZXMuc2V0KGRhdGEuc2VydmljZS5taWdyYXRpb25zLCBmYWlsLCBfd2l0aC5sLCBfd2l0aC5kLCBfd2l0aC5pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIFwiaWRcIjogJzE0NzE1MTk3NTI2MDUnLFxuICAgICAgICAgICAgXCJ2ZXJzaW9uXCI6ICcxLjEuMCcsXG4gICAgICAgICAgICBnbzogZnVuY3Rpb24obWlkLCBfd2l0aCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gZGF0YS5jb250YWluZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbnRhaW5lcnMuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbGQgPSBjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnNba10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbHMuc2V0KGRhdGEuY29udGFpbmVyc1trXSwgb2xkLCBfd2l0aC5sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb2tpZXMuZGVzdHJveShkYXRhLmNvbnRhaW5lcnNba10pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgXVxuXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdGVybXMgPSByZXF1aXJlKCcuL3Rlcm1zJyksXG4gICAgdXJpICAgPSByZXF1aXJlKCcuL2hlbHBlcnMvdXJpJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGZldGNoOiBmdW5jdGlvbihwcmVmcykge1xuXG4gICAgdmFyIHVzZXIgICA9IHByZWZzIHx8IHt9LFxuICAgICAgICBwYXJhbXMgPSB7fTtcblxuICAgIHBhcmFtcy5wcmVmaXggPSB0aGlzLnZhbGlkYXRlLmlzU3RyaW5nKHVzZXIucHJlZml4KSA/IHVzZXIucHJlZml4IDogJyc7XG5cbiAgICAvLyBTZXQgYGxpZmV0aW1lIG9mIHRoZSBjb29raWVgIGluIG1vbnRoc1xuICAgIHBhcmFtcy5saWZldGltZSA9IHRoaXMudmFsaWRhdGUuY2hlY2tGbG9hdCh1c2VyLmxpZmV0aW1lKSB8fCA2O1xuICAgIHBhcmFtcy5saWZldGltZSA9IHBhcnNlSW50KHBhcmFtcy5saWZldGltZSAqIDMwICogMjQgKiA2MCk7XG5cbiAgICAvLyBTZXQgYHNlc3Npb24gbGVuZ3RoYCBpbiBtaW51dGVzXG4gICAgcGFyYW1zLnNlc3Npb25fbGVuZ3RoID0gdGhpcy52YWxpZGF0ZS5jaGVja0ludCh1c2VyLnNlc3Npb25fbGVuZ3RoKSB8fCAzMDtcblxuICAgIC8vIFNldCBgdGltZXpvbmUgb2Zmc2V0YCBpbiBob3Vyc1xuICAgIHBhcmFtcy50aW1lem9uZV9vZmZzZXQgPSB0aGlzLnZhbGlkYXRlLmNoZWNrSW50KHVzZXIudGltZXpvbmVfb2Zmc2V0KTtcblxuICAgIC8vIFNldCBgY2FtcGFpZ24gcGFyYW1gIGZvciBBZFdvcmRzIGxpbmtzXG4gICAgcGFyYW1zLmNhbXBhaWduX3BhcmFtID0gdXNlci5jYW1wYWlnbl9wYXJhbSB8fCBmYWxzZTtcblxuICAgIC8vIFNldCBgdXNlciBpcGBcbiAgICBwYXJhbXMudXNlcl9pcCA9IHVzZXIudXNlcl9pcCB8fCB0ZXJtcy5ub25lO1xuXG4gICAgLy8gU2V0IGBwcm9tb2NvZGVgXG4gICAgaWYgKHVzZXIucHJvbW9jb2RlKSB7XG4gICAgICBwYXJhbXMucHJvbW9jb2RlID0ge307XG4gICAgICBwYXJhbXMucHJvbW9jb2RlLm1pbiA9IHBhcnNlSW50KHVzZXIucHJvbW9jb2RlLm1pbikgfHwgMTAwMDAwO1xuICAgICAgcGFyYW1zLnByb21vY29kZS5tYXggPSBwYXJzZUludCh1c2VyLnByb21vY29kZS5tYXgpIHx8IDk5OTk5OTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyYW1zLnByb21vY29kZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFNldCBgdHlwZWluIGF0dHJpYnV0ZXNgXG4gICAgaWYgKHVzZXIudHlwZWluX2F0dHJpYnV0ZXMgJiYgdXNlci50eXBlaW5fYXR0cmlidXRlcy5zb3VyY2UgJiYgdXNlci50eXBlaW5fYXR0cmlidXRlcy5tZWRpdW0pIHtcbiAgICAgIHBhcmFtcy50eXBlaW5fYXR0cmlidXRlcyA9IHt9O1xuICAgICAgcGFyYW1zLnR5cGVpbl9hdHRyaWJ1dGVzLnNvdXJjZSA9IHVzZXIudHlwZWluX2F0dHJpYnV0ZXMuc291cmNlO1xuICAgICAgcGFyYW1zLnR5cGVpbl9hdHRyaWJ1dGVzLm1lZGl1bSA9IHVzZXIudHlwZWluX2F0dHJpYnV0ZXMubWVkaXVtO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbXMudHlwZWluX2F0dHJpYnV0ZXMgPSB7IHNvdXJjZTogJyhkaXJlY3QpJywgbWVkaXVtOiAnKG5vbmUpJyB9O1xuICAgIH1cblxuICAgIC8vIFNldCBgZG9tYWluYFxuICAgIGlmICh1c2VyLmRvbWFpbiAmJiB0aGlzLnZhbGlkYXRlLmlzU3RyaW5nKHVzZXIuZG9tYWluKSkge1xuICAgICAgcGFyYW1zLmRvbWFpbiA9IHsgaG9zdDogdXNlci5kb21haW4sIGlzb2xhdGU6IGZhbHNlIH07XG4gICAgfSBlbHNlIGlmICh1c2VyLmRvbWFpbiAmJiB1c2VyLmRvbWFpbi5ob3N0KSB7XG4gICAgICBwYXJhbXMuZG9tYWluID0gdXNlci5kb21haW47XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmFtcy5kb21haW4gPSB7IGhvc3Q6IHVyaS5nZXRIb3N0KGRvY3VtZW50LmxvY2F0aW9uLmhvc3RuYW1lKSwgaXNvbGF0ZTogZmFsc2UgfTtcbiAgICB9XG5cbiAgICAvLyBTZXQgYHJlZmVycmFsIHNvdXJjZXNgXG4gICAgcGFyYW1zLnJlZmVycmFscyA9IFtdO1xuXG4gICAgaWYgKHVzZXIucmVmZXJyYWxzICYmIHVzZXIucmVmZXJyYWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIGZvciAodmFyIGlyID0gMDsgaXIgPCB1c2VyLnJlZmVycmFscy5sZW5ndGg7IGlyKyspIHtcbiAgICAgICAgaWYgKHVzZXIucmVmZXJyYWxzW2lyXS5ob3N0KSB7XG4gICAgICAgICAgcGFyYW1zLnJlZmVycmFscy5wdXNoKHVzZXIucmVmZXJyYWxzW2lyXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgYG9yZ2FuaWMgc291cmNlc2BcbiAgICBwYXJhbXMub3JnYW5pY3MgPSBbXTtcblxuICAgIGlmICh1c2VyLm9yZ2FuaWNzICYmIHVzZXIub3JnYW5pY3MubGVuZ3RoID4gMCkge1xuICAgICAgZm9yICh2YXIgaW8gPSAwOyBpbyA8IHVzZXIub3JnYW5pY3MubGVuZ3RoOyBpbysrKSB7XG4gICAgICAgIGlmICh1c2VyLm9yZ2FuaWNzW2lvXS5ob3N0ICYmIHVzZXIub3JnYW5pY3NbaW9dLnBhcmFtKSB7XG4gICAgICAgICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2godXNlci5vcmdhbmljc1tpb10pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAnYmluZy5jb20nLCAgICAgIHBhcmFtOiAncScsICAgICBkaXNwbGF5OiAnYmluZycgICAgICAgICAgICB9KTtcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICd5YWhvby5jb20nLCAgICAgcGFyYW06ICdwJywgICAgIGRpc3BsYXk6ICd5YWhvbycgICAgICAgICAgIH0pO1xuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ2Fib3V0LmNvbScsICAgICBwYXJhbTogJ3EnLCAgICAgZGlzcGxheTogJ2Fib3V0JyAgICAgICAgICAgfSk7XG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAnYW9sLmNvbScsICAgICAgIHBhcmFtOiAncScsICAgICBkaXNwbGF5OiAnYW9sJyAgICAgICAgICAgICB9KTtcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICdhc2suY29tJywgICAgICAgcGFyYW06ICdxJywgICAgIGRpc3BsYXk6ICdhc2snICAgICAgICAgICAgIH0pO1xuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ2dsb2Jvc29zby5jb20nLCBwYXJhbTogJ3EnLCAgICAgZGlzcGxheTogJ2dsb2JvJyAgICAgICAgICAgfSk7XG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAnZ28ubWFpbC5ydScsICAgIHBhcmFtOiAncScsICAgICBkaXNwbGF5OiAnZ28ubWFpbC5ydScgICAgICB9KTtcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICdyYW1ibGVyLnJ1JywgICAgcGFyYW06ICdxdWVyeScsIGRpc3BsYXk6ICdyYW1ibGVyJyAgICAgICAgIH0pO1xuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ3R1dC5ieScsICAgICAgICBwYXJhbTogJ3F1ZXJ5JywgZGlzcGxheTogJ3R1dC5ieScgICAgICAgICAgfSk7XG5cbiAgICBwYXJhbXMucmVmZXJyYWxzLnB1c2goeyBob3N0OiAndC5jbycsICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICd0d2l0dGVyLmNvbScgICAgIH0pO1xuICAgIHBhcmFtcy5yZWZlcnJhbHMucHVzaCh7IGhvc3Q6ICdwbHVzLnVybC5nb29nbGUuY29tJywgICAgICAgICAgZGlzcGxheTogJ3BsdXMuZ29vZ2xlLmNvbScgfSk7XG5cblxuICAgIHJldHVybiBwYXJhbXM7XG5cbiAgfSxcblxuICB2YWxpZGF0ZToge1xuXG4gICAgY2hlY2tGbG9hdDogZnVuY3Rpb24odikge1xuICAgICAgcmV0dXJuIHYgJiYgdGhpcy5pc051bWVyaWMocGFyc2VGbG9hdCh2KSkgPyBwYXJzZUZsb2F0KHYpIDogZmFsc2U7XG4gICAgfSxcblxuICAgIGNoZWNrSW50OiBmdW5jdGlvbih2KSB7XG4gICAgICByZXR1cm4gdiAmJiB0aGlzLmlzTnVtZXJpYyhwYXJzZUludCh2KSkgPyBwYXJzZUludCh2KSA6IGZhbHNlO1xuICAgIH0sXG5cbiAgICBpc051bWVyaWM6IGZ1bmN0aW9uKHYpe1xuICAgICAgcmV0dXJuICFpc05hTih2KTtcbiAgICB9LFxuXG4gICAgaXNTdHJpbmc6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodikgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xuICAgIH1cblxuICB9XG5cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHRyYWZmaWM6IHtcbiAgICB1dG06ICAgICAgICAndXRtJyxcbiAgICBvcmdhbmljOiAgICAnb3JnYW5pYycsXG4gICAgcmVmZXJyYWw6ICAgJ3JlZmVycmFsJyxcbiAgICB0eXBlaW46ICAgICAndHlwZWluJ1xuICB9LFxuXG4gIHJlZmVyZXI6IHtcbiAgICByZWZlcnJhbDogICAncmVmZXJyYWwnLFxuICAgIG9yZ2FuaWM6ICAgICdvcmdhbmljJyxcbiAgICBzb2NpYWw6ICAgICAnc29jaWFsJ1xuICB9LFxuXG4gIG5vbmU6ICAgICAgICAgJyhub25lKScsXG4gIG9vcHM6ICAgICAgICAgJyhIb3VzdG9uLCB3ZSBoYXZlIGEgcHJvYmxlbSknXG5cbn07XG4iXX0=
