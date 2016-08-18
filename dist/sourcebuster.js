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
    cookies     = _dereq_('./helpers/cookies'),
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
},{"./data":"/Users/zlebnik/projects/sourcebuster-js/src/js/data.js","./helpers/cookies":"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/cookies.js","./helpers/uri":"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/uri.js","./helpers/utils":"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/utils.js","./migrations":"/Users/zlebnik/projects/sourcebuster-js/src/js/migrations.js","./params":"/Users/zlebnik/projects/sourcebuster-js/src/js/params.js","./terms":"/Users/zlebnik/projects/sourcebuster-js/src/js/terms.js"}],"/Users/zlebnik/projects/sourcebuster-js/src/js/migrations.js":[function(_dereq_,module,exports){
"use strict";

var data    = _dereq_('./data'),
    cookies = _dereq_('./helpers/cookies');

module.exports = {

  go: function(lifetime, domain, isolate) {

    var migrate = this.migrations,
        _with   = { l: lifetime, d: domain, i: isolate };

    var i;

    if (!cookies.get(data.containers.first) && !cookies.get(data.service.migrations)) {

      var mids = [];
      for (i = 0; i < migrate.length; i++) { mids.push(migrate[i].id); }

      var advance = '';
      for (i = 0; i < mids.length; i++) {
        advance += mids[i] + '=1';
        if (i < mids.length - 1) { advance += data.delimiter; }
      }
      cookies.set(data.service.migrations, advance, _with.l, _with.d, _with.i);

    } else if (!cookies.get(data.service.migrations)) {

      // We have only one migration for now, so just
      for (i = 0; i < migrate.length; i++) {
        migrate[i].go(migrate[i].id, _with);
      }

    }

  },

  migrations: [

    {
      id: '1418474375998',
      version: '1.0.0-beta',
      go: function(mid, _with) {

        var success = mid + '=1',
            fail    = mid + '=0';

        var safeReplace = function($0, $1, $2) {
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
      go: function(mid, _with) {

        var success = mid + '=1',
            fail    = mid + '=0',
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
    }

  ]

};
},{"./data":"/Users/zlebnik/projects/sourcebuster-js/src/js/data.js","./helpers/cookies":"/Users/zlebnik/projects/sourcebuster-js/src/js/helpers/cookies.js"}],"/Users/zlebnik/projects/sourcebuster-js/src/js/params.js":[function(_dereq_,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvc291cmNlYnVzdGVyLmpzIiwic3JjL2pzL2RhdGEuanMiLCJzcmMvanMvaGVscGVycy9jb29raWVzLmpzIiwic3JjL2pzL2hlbHBlcnMvdXJpLmpzIiwic3JjL2pzL2hlbHBlcnMvdXRpbHMuanMiLCJzcmMvanMvaW5pdC5qcyIsInNyYy9qcy9taWdyYXRpb25zLmpzIiwic3JjL2pzL3BhcmFtcy5qcyIsInNyYy9qcy90ZXJtcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGluaXQgPSByZXF1aXJlKCcuL2luaXQnKTtcblxudmFyIHNianMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uKHByZWZzKSB7XG4gICAgdGhpcy5nZXQgPSBpbml0KHByZWZzKTtcbiAgICBpZiAocHJlZnMgJiYgcHJlZnMuY2FsbGJhY2sgJiYgdHlwZW9mIHByZWZzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwcmVmcy5jYWxsYmFjayh0aGlzLmdldCk7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNianM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB0ZXJtcyA9IHJlcXVpcmUoJy4vdGVybXMnKSxcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4vaGVscGVycy91dGlscycpO1xuXG52YXIgZGF0YSA9IHtcblxuICBjb250YWluZXJzOiB7XG4gICAgY3VycmVudDogICAgICAgICAgJ3NianNfY3VycmVudCcsXG4gICAgY3VycmVudF9leHRyYTogICAgJ3NianNfY3VycmVudF9hZGQnLFxuICAgIGZpcnN0OiAgICAgICAgICAgICdzYmpzX2ZpcnN0JyxcbiAgICBmaXJzdF9leHRyYTogICAgICAnc2Jqc19maXJzdF9hZGQnLFxuICAgIHNlc3Npb246ICAgICAgICAgICdzYmpzX3Nlc3Npb24nLFxuICAgIHVkYXRhOiAgICAgICAgICAgICdzYmpzX3VkYXRhJyxcbiAgICBwcm9tb2NvZGU6ICAgICAgICAnc2Jqc19wcm9tbydcbiAgfSxcblxuICBzZXJ2aWNlOiB7XG4gICAgbWlncmF0aW9uczogICAgICAgJ3NianNfbWlncmF0aW9ucydcbiAgfSxcblxuICBkZWxpbWl0ZXI6ICAgICAgICAgICd8fHwnLFxuXG4gIGFsaWFzZXM6IHtcblxuICAgIG1haW46IHtcbiAgICAgIHR5cGU6ICAgICAgICAgICAndHlwJyxcbiAgICAgIHNvdXJjZTogICAgICAgICAnc3JjJyxcbiAgICAgIG1lZGl1bTogICAgICAgICAnbWRtJyxcbiAgICAgIGNhbXBhaWduOiAgICAgICAnY21wJyxcbiAgICAgIGNvbnRlbnQ6ICAgICAgICAnY250JyxcbiAgICAgIHRlcm06ICAgICAgICAgICAndHJtJ1xuICAgIH0sXG5cbiAgICBleHRyYToge1xuICAgICAgZmlyZV9kYXRlOiAgICAgICdmZCcsXG4gICAgICBlbnRyYW5jZV9wb2ludDogJ2VwJyxcbiAgICAgIHJlZmVyZXI6ICAgICAgICAncmYnXG4gICAgfSxcblxuICAgIHNlc3Npb246IHtcbiAgICAgIHBhZ2VzX3NlZW46ICAgICAncGdzJyxcbiAgICAgIGN1cnJlbnRfcGFnZTogICAnY3BnJ1xuICAgIH0sXG5cbiAgICB1ZGF0YToge1xuICAgICAgdmlzaXRzOiAgICAgICAgICd2c3QnLFxuICAgICAgaXA6ICAgICAgICAgICAgICd1aXAnLFxuICAgICAgYWdlbnQ6ICAgICAgICAgICd1YWcnXG4gICAgfSxcblxuICAgIHByb21vOiAgICAgICAgICAgICdjb2RlJ1xuXG4gIH0sXG5cbiAgcGFjazoge1xuXG4gICAgbWFpbjogZnVuY3Rpb24oc2Jqcykge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgZGF0YS5hbGlhc2VzLm1haW4udHlwZSAgICAgICsgJz0nICsgc2Jqcy50eXBlICAgICArIGRhdGEuZGVsaW1pdGVyICtcbiAgICAgICAgZGF0YS5hbGlhc2VzLm1haW4uc291cmNlICAgICsgJz0nICsgc2Jqcy5zb3VyY2UgICArIGRhdGEuZGVsaW1pdGVyICtcbiAgICAgICAgZGF0YS5hbGlhc2VzLm1haW4ubWVkaXVtICAgICsgJz0nICsgc2Jqcy5tZWRpdW0gICArIGRhdGEuZGVsaW1pdGVyICtcbiAgICAgICAgZGF0YS5hbGlhc2VzLm1haW4uY2FtcGFpZ24gICsgJz0nICsgc2Jqcy5jYW1wYWlnbiArIGRhdGEuZGVsaW1pdGVyICtcbiAgICAgICAgZGF0YS5hbGlhc2VzLm1haW4uY29udGVudCAgICsgJz0nICsgc2Jqcy5jb250ZW50ICArIGRhdGEuZGVsaW1pdGVyICtcbiAgICAgICAgZGF0YS5hbGlhc2VzLm1haW4udGVybSAgICAgICsgJz0nICsgc2Jqcy50ZXJtXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBleHRyYTogZnVuY3Rpb24odGltZXpvbmVfb2Zmc2V0KSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBkYXRhLmFsaWFzZXMuZXh0cmEuZmlyZV9kYXRlICAgICAgKyAnPScgKyB1dGlscy5zZXREYXRlKG5ldyBEYXRlLCB0aW1lem9uZV9vZmZzZXQpICsgZGF0YS5kZWxpbWl0ZXIgK1xuICAgICAgICBkYXRhLmFsaWFzZXMuZXh0cmEuZW50cmFuY2VfcG9pbnQgKyAnPScgKyBkb2N1bWVudC5sb2NhdGlvbi5ocmVmICAgICAgICAgICAgICAgICAgICsgZGF0YS5kZWxpbWl0ZXIgK1xuICAgICAgICBkYXRhLmFsaWFzZXMuZXh0cmEucmVmZXJlciAgICAgICAgKyAnPScgKyAoZG9jdW1lbnQucmVmZXJyZXIgfHwgdGVybXMubm9uZSlcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHVzZXI6IGZ1bmN0aW9uKHZpc2l0cywgdXNlcl9pcCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgZGF0YS5hbGlhc2VzLnVkYXRhLnZpc2l0cyArICc9JyArIHZpc2l0cyAgKyBkYXRhLmRlbGltaXRlciArXG4gICAgICAgIGRhdGEuYWxpYXNlcy51ZGF0YS5pcCAgICAgKyAnPScgKyB1c2VyX2lwICsgZGF0YS5kZWxpbWl0ZXIgK1xuICAgICAgICBkYXRhLmFsaWFzZXMudWRhdGEuYWdlbnQgICsgJz0nICsgbmF2aWdhdG9yLnVzZXJBZ2VudFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc2Vzc2lvbjogZnVuY3Rpb24ocGFnZXMpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICBkYXRhLmFsaWFzZXMuc2Vzc2lvbi5wYWdlc19zZWVuICAgKyAnPScgKyBwYWdlcyArIGRhdGEuZGVsaW1pdGVyICtcbiAgICAgIGRhdGEuYWxpYXNlcy5zZXNzaW9uLmN1cnJlbnRfcGFnZSArICc9JyArIGRvY3VtZW50LmxvY2F0aW9uLmhyZWZcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHByb21vOiBmdW5jdGlvbihwcm9tbykge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgZGF0YS5hbGlhc2VzLnByb21vICsgJz0nICsgdXRpbHMuc2V0TGVhZGluZ1plcm9Ub0ludCh1dGlscy5yYW5kb21JbnQocHJvbW8ubWluLCBwcm9tby5tYXgpLCBwcm9tby5tYXgudG9TdHJpbmcoKS5sZW5ndGgpXG4gICAgICApO1xuICAgIH1cblxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRhdGE7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBkZWxpbWl0ZXIgPSByZXF1aXJlKCcuLi9kYXRhJykuZGVsaW1pdGVyO1xuXG52YXIgcHJlZml4ID0gJyc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHNldFByZWZpeDogZnVuY3Rpb24ocCkge1xuICAgIHByZWZpeCA9IHA7XG4gIH0sXG5cbiAgZ2V0UHJlZml4OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcHJlZml4O1xuICB9LFxuXG4gIGVuY29kZURhdGE6IGZ1bmN0aW9uKHMpIHtcbiAgICByZXR1cm4gcHJlZml4ICsgZW5jb2RlVVJJQ29tcG9uZW50KHMpLnJlcGxhY2UoL1xcIS9nLCAnJTIxJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcfi9nLCAnJTdFJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcKi9nLCAnJTJBJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJy9nLCAnJTI3JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcKC9nLCAnJTI4JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcKS9nLCAnJTI5Jyk7XG4gIH0sXG5cbiAgZGVjb2RlRGF0YTogZnVuY3Rpb24ocykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHMucmVwbGFjZShuZXcgUmVnRXhwKCdeJyArIHByZWZpeCksICcnKSkucmVwbGFjZSgvXFwlMjEvZywgJyEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCU3RS9nLCAnficpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJTJBL2csICcqJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwlMjcvZywgXCInXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJTI4L2csICcoJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwlMjkvZywgJyknKTtcbiAgICB9IGNhdGNoKGVycjEpIHtcbiAgICAgIC8vIHRyeSB1bmVzY2FwZSBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgICAgdHJ5IHsgcmV0dXJuIHVuZXNjYXBlKHMpOyB9IGNhdGNoKGVycjIpIHsgcmV0dXJuICcnOyB9XG4gICAgfVxuICB9LFxuXG4gIHNldDogZnVuY3Rpb24obmFtZSwgdmFsdWUsIG1pbnV0ZXMsIGRvbWFpbiwgZXhjbF9zdWJkb21haW5zKSB7XG4gICAgdmFyIGV4cGlyZXMsIGJhc2Vob3N0O1xuXG4gICAgaWYgKG1pbnV0ZXMpIHtcbiAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoKTtcbiAgICAgIGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSArIChtaW51dGVzICogNjAgKiAxMDAwKSk7XG4gICAgICBleHBpcmVzID0gJzsgZXhwaXJlcz0nICsgZGF0ZS50b0dNVFN0cmluZygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBpcmVzID0gJyc7XG4gICAgfVxuICAgIGlmIChkb21haW4gJiYgIWV4Y2xfc3ViZG9tYWlucykge1xuICAgICAgYmFzZWhvc3QgPSAnO2RvbWFpbj0uJyArIGRvbWFpbjtcbiAgICB9IGVsc2Uge1xuICAgICAgYmFzZWhvc3QgPSAnJztcbiAgICB9XG4gICAgZG9jdW1lbnQuY29va2llID0gdGhpcy5lbmNvZGVEYXRhKG5hbWUpICsgJz0nICsgdGhpcy5lbmNvZGVEYXRhKHZhbHVlKSArIGV4cGlyZXMgKyBiYXNlaG9zdCArICc7IHBhdGg9Lyc7XG4gIH0sXG5cbiAgZ2V0OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG5hbWVFUSA9IHRoaXMuZW5jb2RlRGF0YShuYW1lKSArICc9JyxcbiAgICAgICAgY2EgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2EubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjID0gY2FbaV07XG4gICAgICB3aGlsZSAoYy5jaGFyQXQoMCkgPT09ICcgJykgeyBjID0gYy5zdWJzdHJpbmcoMSwgYy5sZW5ndGgpOyB9XG4gICAgICBpZiAoYy5pbmRleE9mKG5hbWVFUSkgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlRGF0YShjLnN1YnN0cmluZyhuYW1lRVEubGVuZ3RoLCBjLmxlbmd0aCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICBkZXN0cm95OiBmdW5jdGlvbihuYW1lLCBkb21haW4sIGV4Y2xfc3ViZG9tYWlucykge1xuICAgIHRoaXMuc2V0KG5hbWUsICcnLCAtMSwgZG9tYWluLCBleGNsX3N1YmRvbWFpbnMpO1xuICB9LFxuXG4gIHBhcnNlOiBmdW5jdGlvbih5dW1teSkge1xuXG4gICAgdmFyIGNvb2tpZXMgPSBbXSxcbiAgICAgICAgZGF0YSAgICA9IHt9O1xuXG4gICAgaWYgKHR5cGVvZiB5dW1teSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvb2tpZXMucHVzaCh5dW1teSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIHByb3AgaW4geXVtbXkpIHtcbiAgICAgICAgaWYgKHl1bW15Lmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgY29va2llcy5wdXNoKHl1bW15W3Byb3BdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGkxID0gMDsgaTEgPCBjb29raWVzLmxlbmd0aDsgaTErKykge1xuICAgICAgdmFyIGNvb2tpZV9hcnJheTtcbiAgICAgIGRhdGFbdGhpcy51bnNianMoY29va2llc1tpMV0pXSA9IHt9O1xuICAgICAgaWYgKHRoaXMuZ2V0KGNvb2tpZXNbaTFdKSkge1xuICAgICAgICBjb29raWVfYXJyYXkgPSB0aGlzLmdldChjb29raWVzW2kxXSkuc3BsaXQoZGVsaW1pdGVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvb2tpZV9hcnJheSA9IFtdO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgaTIgPSAwOyBpMiA8IGNvb2tpZV9hcnJheS5sZW5ndGg7IGkyKyspIHtcbiAgICAgICAgdmFyIHRtcF9hcnJheSA9IGNvb2tpZV9hcnJheVtpMl0uc3BsaXQoJz0nKSxcbiAgICAgICAgICAgIHJlc3VsdF9hcnJheSA9IHRtcF9hcnJheS5zcGxpY2UoMCwgMSk7XG4gICAgICAgIHJlc3VsdF9hcnJheS5wdXNoKHRtcF9hcnJheS5qb2luKCc9JykpO1xuICAgICAgICBkYXRhW3RoaXMudW5zYmpzKGNvb2tpZXNbaTFdKV1bcmVzdWx0X2FycmF5WzBdXSA9IHRoaXMuZGVjb2RlRGF0YShyZXN1bHRfYXJyYXlbMV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuXG4gIH0sXG5cbiAgdW5zYmpzOiBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKCdzYmpzXycsICcnKTtcbiAgfVxuXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHBhcnNlOiBmdW5jdGlvbihzdHIpIHtcbiAgICB2YXIgbyA9IHRoaXMucGFyc2VPcHRpb25zLFxuICAgICAgICBtID0gby5wYXJzZXJbby5zdHJpY3RNb2RlID8gJ3N0cmljdCcgOiAnbG9vc2UnXS5leGVjKHN0ciksXG4gICAgICAgIHVyaSA9IHt9LFxuICAgICAgICBpID0gMTQ7XG5cbiAgICB3aGlsZSAoaS0tKSB7IHVyaVtvLmtleVtpXV0gPSBtW2ldIHx8ICcnOyB9XG5cbiAgICB1cmlbby5xLm5hbWVdID0ge307XG4gICAgdXJpW28ua2V5WzEyXV0ucmVwbGFjZShvLnEucGFyc2VyLCBmdW5jdGlvbiAoJDAsICQxLCAkMikge1xuICAgICAgaWYgKCQxKSB7IHVyaVtvLnEubmFtZV1bJDFdID0gJDI7IH1cbiAgICB9KTtcblxuICAgIHJldHVybiB1cmk7XG4gIH0sXG5cbiAgcGFyc2VPcHRpb25zOiB7XG4gICAgc3RyaWN0TW9kZTogZmFsc2UsXG4gICAga2V5OiBbJ3NvdXJjZScsJ3Byb3RvY29sJywnYXV0aG9yaXR5JywndXNlckluZm8nLCd1c2VyJywncGFzc3dvcmQnLCdob3N0JywncG9ydCcsJ3JlbGF0aXZlJywncGF0aCcsJ2RpcmVjdG9yeScsJ2ZpbGUnLCdxdWVyeScsJ2FuY2hvciddLFxuICAgIHE6IHtcbiAgICAgIG5hbWU6ICAgJ3F1ZXJ5S2V5JyxcbiAgICAgIHBhcnNlcjogLyg/Ol58JikoW14mPV0qKT0/KFteJl0qKS9nXG4gICAgfSxcbiAgICBwYXJzZXI6IHtcbiAgICAgIHN0cmljdDogL14oPzooW146XFwvPyNdKyk6KT8oPzpcXC9cXC8oKD86KChbXjpAXSopKD86OihbXjpAXSopKT8pP0ApPyhbXjpcXC8/I10qKSg/OjooXFxkKikpPykpPygoKCg/OltePyNcXC9dKlxcLykqKShbXj8jXSopKSg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8pLyxcbiAgICAgIGxvb3NlOiAgL14oPzooPyFbXjpAXSs6W146QFxcL10qQCkoW146XFwvPyMuXSspOik/KD86XFwvXFwvKT8oKD86KChbXjpAXSopKD86OihbXjpAXSopKT8pP0ApPyhbXjpcXC8/I10qKSg/OjooXFxkKikpPykoKChcXC8oPzpbXj8jXSg/IVtePyNcXC9dKlxcLltePyNcXC8uXSsoPzpbPyNdfCQpKSkqXFwvPyk/KFtePyNcXC9dKikpKD86XFw/KFteI10qKSk/KD86IyguKikpPykvXG4gICAgfVxuICB9LFxuXG4gIGdldFBhcmFtOiBmdW5jdGlvbihjdXN0b21fcGFyYW1zKSB7XG4gICAgdmFyIHF1ZXJ5X3N0cmluZyA9IHt9LFxuICAgICAgICBxdWVyeSA9IGN1c3RvbV9wYXJhbXMgPyBjdXN0b21fcGFyYW1zIDogd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSksXG4gICAgICAgIHZhcnMgPSBxdWVyeS5zcGxpdCgnJicpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcGFpciA9IHZhcnNbaV0uc3BsaXQoJz0nKTtcbiAgICAgIGlmICh0eXBlb2YgcXVlcnlfc3RyaW5nW3BhaXJbMF1dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBxdWVyeV9zdHJpbmdbcGFpclswXV0gPSBwYWlyWzFdO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcXVlcnlfc3RyaW5nW3BhaXJbMF1dID09PSAnc3RyaW5nJykge1xuICAgICAgICB2YXIgYXJyID0gWyBxdWVyeV9zdHJpbmdbcGFpclswXV0sIHBhaXJbMV0gXTtcbiAgICAgICAgcXVlcnlfc3RyaW5nW3BhaXJbMF1dID0gYXJyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcXVlcnlfc3RyaW5nW3BhaXJbMF1dLnB1c2gocGFpclsxXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBxdWVyeV9zdHJpbmc7XG4gIH0sXG5cbiAgZ2V0SG9zdDogZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgIHJldHVybiB0aGlzLnBhcnNlKHJlcXVlc3QpLmhvc3QucmVwbGFjZSgnd3d3LicsICcnKTtcbiAgfVxuXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBlc2NhcGVSZWdleHA6IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xuICB9LFxuXG4gIHNldERhdGU6IGZ1bmN0aW9uKGRhdGUsIG9mZnNldCkge1xuICAgIHZhciB1dGNfb2Zmc2V0ICAgID0gZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpIC8gNjAsXG4gICAgICAgIG5vd19ob3VycyAgICAgPSBkYXRlLmdldEhvdXJzKCksXG4gICAgICAgIGN1c3RvbV9vZmZzZXQgPSBvZmZzZXQgfHwgb2Zmc2V0ID09PSAwID8gb2Zmc2V0IDogLXV0Y19vZmZzZXQ7XG5cbiAgICBkYXRlLnNldEhvdXJzKG5vd19ob3VycyArIHV0Y19vZmZzZXQgKyBjdXN0b21fb2Zmc2V0KTtcblxuICAgIHZhciB5ZWFyICAgID0gZGF0ZS5nZXRGdWxsWWVhcigpLFxuICAgICAgICBtb250aCAgID0gdGhpcy5zZXRMZWFkaW5nWmVyb1RvSW50KGRhdGUuZ2V0TW9udGgoKSArIDEsICAgMiksXG4gICAgICAgIGRheSAgICAgPSB0aGlzLnNldExlYWRpbmdaZXJvVG9JbnQoZGF0ZS5nZXREYXRlKCksICAgICAgICAyKSxcbiAgICAgICAgaG91ciAgICA9IHRoaXMuc2V0TGVhZGluZ1plcm9Ub0ludChkYXRlLmdldEhvdXJzKCksICAgICAgIDIpLFxuICAgICAgICBtaW51dGUgID0gdGhpcy5zZXRMZWFkaW5nWmVyb1RvSW50KGRhdGUuZ2V0TWludXRlcygpLCAgICAgMiksXG4gICAgICAgIHNlY29uZCAgPSB0aGlzLnNldExlYWRpbmdaZXJvVG9JbnQoZGF0ZS5nZXRTZWNvbmRzKCksICAgICAyKTtcblxuICAgIHJldHVybiAoeWVhciArICctJyArIG1vbnRoICsgJy0nICsgZGF5ICsgJyAnICsgaG91ciArICc6JyArIG1pbnV0ZSArICc6JyArIHNlY29uZCk7XG4gIH0sXG5cbiAgc2V0TGVhZGluZ1plcm9Ub0ludDogZnVuY3Rpb24obnVtLCBzaXplKSB7XG4gICAgdmFyIHMgPSBudW0gKyAnJztcbiAgICB3aGlsZSAocy5sZW5ndGggPCBzaXplKSB7IHMgPSAnMCcgKyBzOyB9XG4gICAgcmV0dXJuIHM7XG4gIH0sXG5cbiAgcmFuZG9tSW50OiBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGRhdGEgICAgICAgID0gcmVxdWlyZSgnLi9kYXRhJyksXG4gICAgdGVybXMgICAgICAgPSByZXF1aXJlKCcuL3Rlcm1zJyksXG4gICAgY29va2llcyAgICAgPSByZXF1aXJlKCcuL2hlbHBlcnMvY29va2llcycpLFxuICAgIHVyaSAgICAgICAgID0gcmVxdWlyZSgnLi9oZWxwZXJzL3VyaScpLFxuICAgIHV0aWxzICAgICAgID0gcmVxdWlyZSgnLi9oZWxwZXJzL3V0aWxzJyksXG4gICAgcGFyYW1zICAgICAgPSByZXF1aXJlKCcuL3BhcmFtcycpLFxuICAgIG1pZ3JhdGlvbnMgID0gcmVxdWlyZSgnLi9taWdyYXRpb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocHJlZnMpIHtcblxuICB2YXIgcCAgICAgICAgID0gcGFyYW1zLmZldGNoKHByZWZzKTtcbiAgdmFyIGdldF9wYXJhbSA9IHVyaS5nZXRQYXJhbSgpO1xuICB2YXIgZG9tYWluICAgID0gcC5kb21haW4uaG9zdCxcbiAgICAgIGlzb2xhdGUgICA9IHAuZG9tYWluLmlzb2xhdGUsXG4gICAgICBsaWZldGltZSAgPSBwLmxpZmV0aW1lO1xuXG4gIGNvb2tpZXMuc2V0UHJlZml4KHAucHJlZml4KTtcblxuICBtaWdyYXRpb25zLmdvKGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xuXG4gIHZhciBfX3NianNfdHlwZSxcbiAgICAgIF9fc2Jqc19zb3VyY2UsXG4gICAgICBfX3NianNfbWVkaXVtLFxuICAgICAgX19zYmpzX2NhbXBhaWduLFxuICAgICAgX19zYmpzX2NvbnRlbnQsXG4gICAgICBfX3NianNfdGVybTtcblxuICBmdW5jdGlvbiBtYWluRGF0YSgpIHtcbiAgICB2YXIgc2Jqc19kYXRhO1xuICAgIGlmIChcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbS51dG1fc291cmNlICAgICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbS51dG1fbWVkaXVtICAgICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbS51dG1fY2FtcGFpZ24gICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbS51dG1fY29udGVudCAgICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbS51dG1fdGVybSAgICAgICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbS5nY2xpZCAgICAgICAgICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbS55Y2xpZCAgICAgICAgICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbVtwLmNhbXBhaWduX3BhcmFtXSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICkge1xuICAgICAgc2V0Rmlyc3RBbmRDdXJyZW50RXh0cmFEYXRhKCk7XG4gICAgICBzYmpzX2RhdGEgPSBnZXREYXRhKHRlcm1zLnRyYWZmaWMudXRtKTtcbiAgICB9IGVsc2UgaWYgKGNoZWNrUmVmZXJlcih0ZXJtcy50cmFmZmljLm9yZ2FuaWMpKSB7XG4gICAgICBzZXRGaXJzdEFuZEN1cnJlbnRFeHRyYURhdGEoKTtcbiAgICAgIHNianNfZGF0YSA9IGdldERhdGEodGVybXMudHJhZmZpYy5vcmdhbmljKTtcbiAgICB9IGVsc2UgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbikgJiYgY2hlY2tSZWZlcmVyKHRlcm1zLnRyYWZmaWMucmVmZXJyYWwpKSB7XG4gICAgICBzZXRGaXJzdEFuZEN1cnJlbnRFeHRyYURhdGEoKTtcbiAgICAgIHNianNfZGF0YSA9IGdldERhdGEodGVybXMudHJhZmZpYy5yZWZlcnJhbCk7XG4gICAgfSBlbHNlIGlmICghY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLmZpcnN0KSAmJiAhY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLmN1cnJlbnQpKSB7XG4gICAgICBzZXRGaXJzdEFuZEN1cnJlbnRFeHRyYURhdGEoKTtcbiAgICAgIHNianNfZGF0YSA9IGdldERhdGEodGVybXMudHJhZmZpYy50eXBlaW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLmN1cnJlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBzYmpzX2RhdGE7XG4gIH1cblxuICBmdW5jdGlvbiBnZXREYXRhKHR5cGUpIHtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuXG4gICAgICBjYXNlIHRlcm1zLnRyYWZmaWMudXRtOlxuXG4gICAgICAgIF9fc2Jqc190eXBlID0gdGVybXMudHJhZmZpYy51dG07XG5cbiAgICAgICAgaWYgKHR5cGVvZiBnZXRfcGFyYW0udXRtX3NvdXJjZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBfX3NianNfc291cmNlID0gZ2V0X3BhcmFtLnV0bV9zb3VyY2U7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldF9wYXJhbS5nY2xpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBfX3NianNfc291cmNlID0gJ2dvb2dsZSc7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldF9wYXJhbS55Y2xpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBfX3NianNfc291cmNlID0gJ3lhbmRleCc7ICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfX3NianNfc291cmNlID0gdGVybXMubm9uZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgZ2V0X3BhcmFtLnV0bV9tZWRpdW0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgX19zYmpzX21lZGl1bSA9IGdldF9wYXJhbS51dG1fbWVkaXVtO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW0uZ2NsaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgX19zYmpzX21lZGl1bSA9ICdjcGMnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW0ueWNsaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgX19zYmpzX21lZGl1bSA9ICdjcGMnOyAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX19zYmpzX21lZGl1bSA9IHRlcm1zLm5vbmU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGdldF9wYXJhbS51dG1fY2FtcGFpZ24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgX19zYmpzX2NhbXBhaWduID0gZ2V0X3BhcmFtLnV0bV9jYW1wYWlnbjtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZ2V0X3BhcmFtW3AuY2FtcGFpZ25fcGFyYW1dICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IGdldF9wYXJhbVtwLmNhbXBhaWduX3BhcmFtXTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZ2V0X3BhcmFtLmdjbGlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9ICdnb29nbGVfY3BjJztcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZ2V0X3BhcmFtLnljbGlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9ICd5YW5kZXhfY3BjJzsgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IHRlcm1zLm5vbmU7XG4gICAgICAgIH1cblxuICAgICAgICBfX3NianNfY29udGVudCAgPSBnZXRfcGFyYW0udXRtX2NvbnRlbnQgfHwgdGVybXMubm9uZTtcbiAgICAgICAgX19zYmpzX3Rlcm0gICAgID0gZ2V0VXRtVGVybSgpICAgICAgICAgIHx8IHRlcm1zLm5vbmU7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIHRlcm1zLnRyYWZmaWMub3JnYW5pYzpcbiAgICAgICAgX19zYmpzX3R5cGUgICAgID0gdGVybXMudHJhZmZpYy5vcmdhbmljO1xuICAgICAgICBfX3NianNfc291cmNlICAgPSBfX3NianNfc291cmNlIHx8IHVyaS5nZXRIb3N0KGRvY3VtZW50LnJlZmVycmVyKTtcbiAgICAgICAgX19zYmpzX21lZGl1bSAgID0gdGVybXMucmVmZXJlci5vcmdhbmljO1xuICAgICAgICBfX3NianNfY2FtcGFpZ24gPSB0ZXJtcy5ub25lO1xuICAgICAgICBfX3NianNfY29udGVudCAgPSB0ZXJtcy5ub25lO1xuICAgICAgICBfX3NianNfdGVybSAgICAgPSB0ZXJtcy5ub25lO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSB0ZXJtcy50cmFmZmljLnJlZmVycmFsOlxuICAgICAgICBfX3NianNfdHlwZSAgICAgPSB0ZXJtcy50cmFmZmljLnJlZmVycmFsO1xuICAgICAgICBfX3NianNfc291cmNlICAgPSBfX3NianNfc291cmNlIHx8IHVyaS5nZXRIb3N0KGRvY3VtZW50LnJlZmVycmVyKTtcbiAgICAgICAgX19zYmpzX21lZGl1bSAgID0gX19zYmpzX21lZGl1bSB8fCB0ZXJtcy5yZWZlcmVyLnJlZmVycmFsO1xuICAgICAgICBfX3NianNfY2FtcGFpZ24gPSB0ZXJtcy5ub25lO1xuICAgICAgICBfX3NianNfY29udGVudCAgPSB1cmkucGFyc2UoZG9jdW1lbnQucmVmZXJyZXIpLnBhdGg7XG4gICAgICAgIF9fc2Jqc190ZXJtICAgICA9IHRlcm1zLm5vbmU7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIHRlcm1zLnRyYWZmaWMudHlwZWluOlxuICAgICAgICBfX3NianNfdHlwZSAgICAgPSB0ZXJtcy50cmFmZmljLnR5cGVpbjtcbiAgICAgICAgX19zYmpzX3NvdXJjZSAgID0gcC50eXBlaW5fYXR0cmlidXRlcy5zb3VyY2U7XG4gICAgICAgIF9fc2Jqc19tZWRpdW0gICA9IHAudHlwZWluX2F0dHJpYnV0ZXMubWVkaXVtO1xuICAgICAgICBfX3NianNfY2FtcGFpZ24gPSB0ZXJtcy5ub25lO1xuICAgICAgICBfX3NianNfY29udGVudCAgPSB0ZXJtcy5ub25lO1xuICAgICAgICBfX3NianNfdGVybSAgICAgPSB0ZXJtcy5ub25lO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgX19zYmpzX3R5cGUgICAgID0gdGVybXMub29wcztcbiAgICAgICAgX19zYmpzX3NvdXJjZSAgID0gdGVybXMub29wcztcbiAgICAgICAgX19zYmpzX21lZGl1bSAgID0gdGVybXMub29wcztcbiAgICAgICAgX19zYmpzX2NhbXBhaWduID0gdGVybXMub29wcztcbiAgICAgICAgX19zYmpzX2NvbnRlbnQgID0gdGVybXMub29wcztcbiAgICAgICAgX19zYmpzX3Rlcm0gICAgID0gdGVybXMub29wcztcbiAgICB9XG4gICAgdmFyIHNianNfZGF0YSA9IHtcbiAgICAgIHR5cGU6ICAgICAgICAgICAgIF9fc2Jqc190eXBlLFxuICAgICAgc291cmNlOiAgICAgICAgICAgX19zYmpzX3NvdXJjZSxcbiAgICAgIG1lZGl1bTogICAgICAgICAgIF9fc2Jqc19tZWRpdW0sXG4gICAgICBjYW1wYWlnbjogICAgICAgICBfX3NianNfY2FtcGFpZ24sXG4gICAgICBjb250ZW50OiAgICAgICAgICBfX3NianNfY29udGVudCxcbiAgICAgIHRlcm06ICAgICAgICAgICAgIF9fc2Jqc190ZXJtXG4gICAgfTtcblxuICAgIHJldHVybiBkYXRhLnBhY2subWFpbihzYmpzX2RhdGEpO1xuXG4gIH1cblxuICBmdW5jdGlvbiBnZXRVdG1UZXJtKCkge1xuICAgIHZhciByZWZlcmVyID0gZG9jdW1lbnQucmVmZXJyZXI7XG4gICAgaWYgKGdldF9wYXJhbS51dG1fdGVybSkge1xuICAgICAgcmV0dXJuIGdldF9wYXJhbS51dG1fdGVybTtcbiAgICB9IGVsc2UgaWYgKHJlZmVyZXIgJiYgdXJpLnBhcnNlKHJlZmVyZXIpLmhvc3QgJiYgdXJpLnBhcnNlKHJlZmVyZXIpLmhvc3QubWF0Y2goL14oPzouKlxcLik/eWFuZGV4XFwuLnsyLDl9JC9pKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHVyaS5nZXRQYXJhbSh1cmkucGFyc2UoZG9jdW1lbnQucmVmZXJyZXIpLnF1ZXJ5KS50ZXh0O1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrUmVmZXJlcih0eXBlKSB7XG4gICAgdmFyIHJlZmVyZXIgPSBkb2N1bWVudC5yZWZlcnJlcjtcbiAgICBzd2l0Y2godHlwZSkge1xuICAgICAgY2FzZSB0ZXJtcy50cmFmZmljLm9yZ2FuaWM6XG4gICAgICAgIHJldHVybiAoISFyZWZlcmVyICYmIGNoZWNrUmVmZXJlckhvc3QocmVmZXJlcikgJiYgaXNPcmdhbmljKHJlZmVyZXIpKTtcbiAgICAgIGNhc2UgdGVybXMudHJhZmZpYy5yZWZlcnJhbDpcbiAgICAgICAgcmV0dXJuICghIXJlZmVyZXIgJiYgY2hlY2tSZWZlcmVySG9zdChyZWZlcmVyKSAmJiBpc1JlZmVycmFsKHJlZmVyZXIpKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja1JlZmVyZXJIb3N0KHJlZmVyZXIpIHtcbiAgICBpZiAocC5kb21haW4pIHtcbiAgICAgIGlmICghaXNvbGF0ZSkge1xuICAgICAgICB2YXIgaG9zdF9yZWdleCA9IG5ldyBSZWdFeHAoJ14oPzouKlxcXFwuKT8nICsgdXRpbHMuZXNjYXBlUmVnZXhwKGRvbWFpbikgKyAnJCcsICdpJyk7XG4gICAgICAgIHJldHVybiAhKHVyaS5nZXRIb3N0KHJlZmVyZXIpLm1hdGNoKGhvc3RfcmVnZXgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAodXJpLmdldEhvc3QocmVmZXJlcikgIT09IHVyaS5nZXRIb3N0KGRvbWFpbikpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKHVyaS5nZXRIb3N0KHJlZmVyZXIpICE9PSB1cmkuZ2V0SG9zdChkb2N1bWVudC5sb2NhdGlvbi5ocmVmKSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNPcmdhbmljKHJlZmVyZXIpIHtcblxuICAgIHZhciB5X2hvc3QgID0gJ3lhbmRleCcsXG4gICAgICAgIHlfcGFyYW0gPSAndGV4dCcsXG4gICAgICAgIGdfaG9zdCAgPSAnZ29vZ2xlJztcblxuICAgIHZhciB5X2hvc3RfcmVnZXggID0gbmV3IFJlZ0V4cCgnXig/Oi4qXFxcXC4pPycgICsgdXRpbHMuZXNjYXBlUmVnZXhwKHlfaG9zdCkgICsgJ1xcXFwuLnsyLDl9JCcpLFxuICAgICAgICB5X3BhcmFtX3JlZ2V4ID0gbmV3IFJlZ0V4cCgnLionICAgICAgICAgICArIHV0aWxzLmVzY2FwZVJlZ2V4cCh5X3BhcmFtKSArICc9LionKSxcbiAgICAgICAgZ19ob3N0X3JlZ2V4ICA9IG5ldyBSZWdFeHAoJ14oPzp3d3dcXFxcLik/JyArIHV0aWxzLmVzY2FwZVJlZ2V4cChnX2hvc3QpICArICdcXFxcLi57Miw5fSQnKTtcblxuICAgIGlmIChcbiAgICAgICAgISF1cmkucGFyc2UocmVmZXJlcikucXVlcnkgJiZcbiAgICAgICAgISF1cmkucGFyc2UocmVmZXJlcikuaG9zdC5tYXRjaCh5X2hvc3RfcmVnZXgpICYmXG4gICAgICAgICEhdXJpLnBhcnNlKHJlZmVyZXIpLnF1ZXJ5Lm1hdGNoKHlfcGFyYW1fcmVnZXgpXG4gICAgICApIHtcbiAgICAgIF9fc2Jqc19zb3VyY2UgPSB5X2hvc3Q7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKCEhdXJpLnBhcnNlKHJlZmVyZXIpLmhvc3QubWF0Y2goZ19ob3N0X3JlZ2V4KSkge1xuICAgICAgX19zYmpzX3NvdXJjZSA9IGdfaG9zdDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoISF1cmkucGFyc2UocmVmZXJlcikucXVlcnkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5vcmdhbmljcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICB1cmkucGFyc2UocmVmZXJlcikuaG9zdC5tYXRjaChuZXcgUmVnRXhwKCdeKD86LipcXFxcLik/JyArIHV0aWxzLmVzY2FwZVJlZ2V4cChwLm9yZ2FuaWNzW2ldLmhvc3QpICArICckJywgJ2knKSkgJiZcbiAgICAgICAgICAgIHVyaS5wYXJzZShyZWZlcmVyKS5xdWVyeS5tYXRjaChuZXcgUmVnRXhwKCcuKicgICAgICAgICArIHV0aWxzLmVzY2FwZVJlZ2V4cChwLm9yZ2FuaWNzW2ldLnBhcmFtKSArICc9LionLCAnaScpKVxuICAgICAgICAgICkge1xuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSBwLm9yZ2FuaWNzW2ldLmRpc3BsYXkgfHwgcC5vcmdhbmljc1tpXS5ob3N0O1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpICsgMSA9PT0gcC5vcmdhbmljcy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzUmVmZXJyYWwocmVmZXJlcikge1xuICAgIGlmIChwLnJlZmVycmFscy5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHAucmVmZXJyYWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh1cmkucGFyc2UocmVmZXJlcikuaG9zdC5tYXRjaChuZXcgUmVnRXhwKCdeKD86LipcXFxcLik/JyArIHV0aWxzLmVzY2FwZVJlZ2V4cChwLnJlZmVycmFsc1tpXS5ob3N0KSArICckJywgJ2knKSkpIHtcbiAgICAgICAgICBfX3NianNfc291cmNlID0gcC5yZWZlcnJhbHNbaV0uZGlzcGxheSAgfHwgcC5yZWZlcnJhbHNbaV0uaG9zdDtcbiAgICAgICAgICBfX3NianNfbWVkaXVtID0gcC5yZWZlcnJhbHNbaV0ubWVkaXVtICAgfHwgdGVybXMucmVmZXJlci5yZWZlcnJhbDtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSArIDEgPT09IHAucmVmZXJyYWxzLmxlbmd0aCkge1xuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSB1cmkuZ2V0SG9zdChyZWZlcmVyKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfX3NianNfc291cmNlID0gdXJpLmdldEhvc3QocmVmZXJlcik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRGaXJzdEFuZEN1cnJlbnRFeHRyYURhdGEoKSB7XG4gICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLmN1cnJlbnRfZXh0cmEsIGRhdGEucGFjay5leHRyYShwLnRpbWV6b25lX29mZnNldCksIGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xuICAgIGlmICghY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLmZpcnN0X2V4dHJhKSkge1xuICAgICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLmZpcnN0X2V4dHJhLCBkYXRhLnBhY2suZXh0cmEocC50aW1lem9uZV9vZmZzZXQpLCBsaWZldGltZSwgZG9tYWluLCBpc29sYXRlKTtcbiAgICB9XG4gIH1cblxuICAoZnVuY3Rpb24gc2V0RGF0YSgpIHtcblxuICAgIC8vIE1haW4gZGF0YVxuICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5jdXJyZW50LCBtYWluRGF0YSgpLCBsaWZldGltZSwgZG9tYWluLCBpc29sYXRlKTtcbiAgICBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5maXJzdCkpIHtcbiAgICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5maXJzdCwgY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLmN1cnJlbnQpLCBsaWZldGltZSwgZG9tYWluLCBpc29sYXRlKTtcbiAgICB9XG5cbiAgICAvLyBVc2VyIGRhdGFcbiAgICB2YXIgdmlzaXRzLCB1ZGF0YTtcbiAgICBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy51ZGF0YSkpIHtcbiAgICAgIHZpc2l0cyAgPSAxO1xuICAgICAgdWRhdGEgICA9IGRhdGEucGFjay51c2VyKHZpc2l0cywgcC51c2VyX2lwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmlzaXRzICA9IHBhcnNlSW50KGNvb2tpZXMucGFyc2UoZGF0YS5jb250YWluZXJzLnVkYXRhKVtjb29raWVzLnVuc2JqcyhkYXRhLmNvbnRhaW5lcnMudWRhdGEpXVtkYXRhLmFsaWFzZXMudWRhdGEudmlzaXRzXSkgfHwgMTtcbiAgICAgIHZpc2l0cyAgPSBjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbikgPyB2aXNpdHMgOiB2aXNpdHMgKyAxO1xuICAgICAgdWRhdGEgICA9IGRhdGEucGFjay51c2VyKHZpc2l0cywgcC51c2VyX2lwKTtcbiAgICB9XG4gICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLnVkYXRhLCB1ZGF0YSwgbGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSk7XG5cbiAgICAvLyBTZXNzaW9uXG4gICAgdmFyIHBhZ2VzX2NvdW50O1xuICAgIGlmICghY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLnNlc3Npb24pKSB7XG4gICAgICBwYWdlc19jb3VudCA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhZ2VzX2NvdW50ID0gcGFyc2VJbnQoY29va2llcy5wYXJzZShkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbilbY29va2llcy51bnNianMoZGF0YS5jb250YWluZXJzLnNlc3Npb24pXVtkYXRhLmFsaWFzZXMuc2Vzc2lvbi5wYWdlc19zZWVuXSkgfHwgMTtcbiAgICAgIHBhZ2VzX2NvdW50ICs9IDE7XG4gICAgfVxuICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uLCBkYXRhLnBhY2suc2Vzc2lvbihwYWdlc19jb3VudCksIHAuc2Vzc2lvbl9sZW5ndGgsIGRvbWFpbiwgaXNvbGF0ZSk7XG5cbiAgICAvLyBQcm9tb2NvZGVcbiAgICBpZiAocC5wcm9tb2NvZGUgJiYgIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5wcm9tb2NvZGUpKSB7XG4gICAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMucHJvbW9jb2RlLCBkYXRhLnBhY2sucHJvbW8ocC5wcm9tb2NvZGUpLCBsaWZldGltZSwgZG9tYWluLCBpc29sYXRlKTtcbiAgICB9XG5cbiAgfSkoKTtcblxuICByZXR1cm4gY29va2llcy5wYXJzZShkYXRhLmNvbnRhaW5lcnMpO1xuXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZGF0YSAgICA9IHJlcXVpcmUoJy4vZGF0YScpLFxuICAgIGNvb2tpZXMgPSByZXF1aXJlKCcuL2hlbHBlcnMvY29va2llcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBnbzogZnVuY3Rpb24obGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSkge1xuXG4gICAgdmFyIG1pZ3JhdGUgPSB0aGlzLm1pZ3JhdGlvbnMsXG4gICAgICAgIF93aXRoICAgPSB7IGw6IGxpZmV0aW1lLCBkOiBkb21haW4sIGk6IGlzb2xhdGUgfTtcblxuICAgIHZhciBpO1xuXG4gICAgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuZmlyc3QpICYmICFjb29raWVzLmdldChkYXRhLnNlcnZpY2UubWlncmF0aW9ucykpIHtcblxuICAgICAgdmFyIG1pZHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWdyYXRlLmxlbmd0aDsgaSsrKSB7IG1pZHMucHVzaChtaWdyYXRlW2ldLmlkKTsgfVxuXG4gICAgICB2YXIgYWR2YW5jZSA9ICcnO1xuICAgICAgZm9yIChpID0gMDsgaSA8IG1pZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYWR2YW5jZSArPSBtaWRzW2ldICsgJz0xJztcbiAgICAgICAgaWYgKGkgPCBtaWRzLmxlbmd0aCAtIDEpIHsgYWR2YW5jZSArPSBkYXRhLmRlbGltaXRlcjsgfVxuICAgICAgfVxuICAgICAgY29va2llcy5zZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMsIGFkdmFuY2UsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuXG4gICAgfSBlbHNlIGlmICghY29va2llcy5nZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMpKSB7XG5cbiAgICAgIC8vIFdlIGhhdmUgb25seSBvbmUgbWlncmF0aW9uIGZvciBub3csIHNvIGp1c3RcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWdyYXRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG1pZ3JhdGVbaV0uZ28obWlncmF0ZVtpXS5pZCwgX3dpdGgpO1xuICAgICAgfVxuXG4gICAgfVxuXG4gIH0sXG5cbiAgbWlncmF0aW9uczogW1xuXG4gICAge1xuICAgICAgaWQ6ICcxNDE4NDc0Mzc1OTk4JyxcbiAgICAgIHZlcnNpb246ICcxLjAuMC1iZXRhJyxcbiAgICAgIGdvOiBmdW5jdGlvbihtaWQsIF93aXRoKSB7XG5cbiAgICAgICAgdmFyIHN1Y2Nlc3MgPSBtaWQgKyAnPTEnLFxuICAgICAgICAgICAgZmFpbCAgICA9IG1pZCArICc9MCc7XG5cbiAgICAgICAgdmFyIHNhZmVSZXBsYWNlID0gZnVuY3Rpb24oJDAsICQxLCAkMikge1xuICAgICAgICAgIHJldHVybiAoJDEgfHwgJDIgPyAkMCA6IGRhdGEuZGVsaW1pdGVyKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgLy8gU3dpdGNoIGRlbGltaXRlciBhbmQgcmVuZXcgY29va2llc1xuICAgICAgICAgIHZhciBfaW4gPSBbXTtcbiAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIGRhdGEuY29udGFpbmVycykge1xuICAgICAgICAgICAgaWYgKGRhdGEuY29udGFpbmVycy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgICBfaW4ucHVzaChkYXRhLmNvbnRhaW5lcnNbcHJvcF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2luLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoY29va2llcy5nZXQoX2luW2ldKSkge1xuICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gY29va2llcy5nZXQoX2luW2ldKS5yZXBsYWNlKC8oXFx8KT9cXHwoXFx8KT8vZywgc2FmZVJlcGxhY2UpO1xuICAgICAgICAgICAgICBjb29raWVzLmRlc3Ryb3koX2luW2ldLCBfd2l0aC5kLCBfd2l0aC5pKTtcbiAgICAgICAgICAgICAgY29va2llcy5kZXN0cm95KF9pbltpXSwgX3dpdGguZCwgIV93aXRoLmkpO1xuICAgICAgICAgICAgICBjb29raWVzLnNldChfaW5baV0sIGJ1ZmZlciwgX3dpdGgubCwgX3dpdGguZCwgX3dpdGguaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVXBkYXRlIGBzZXNzaW9uYFxuICAgICAgICAgIGlmIChjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbikpIHtcbiAgICAgICAgICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uLCBkYXRhLnBhY2suc2Vzc2lvbigwKSwgX3dpdGgubCwgX3dpdGguZCwgX3dpdGguaSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gWWF5IVxuICAgICAgICAgIGNvb2tpZXMuc2V0KGRhdGEuc2VydmljZS5taWdyYXRpb25zLCBzdWNjZXNzLCBfd2l0aC5sLCBfd2l0aC5kLCBfd2l0aC5pKTtcblxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAvLyBPb3BzXG4gICAgICAgICAgY29va2llcy5zZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMsIGZhaWwsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzE0NzE1MTk3NTI2MDAnLFxuICAgICAgdmVyc2lvbjogJzEuMC41JyxcbiAgICAgIGdvOiBmdW5jdGlvbihtaWQsIF93aXRoKSB7XG5cbiAgICAgICAgdmFyIHN1Y2Nlc3MgPSBtaWQgKyAnPTEnLFxuICAgICAgICAgICAgZmFpbCAgICA9IG1pZCArICc9MCcsXG4gICAgICAgICAgICBvbGRQcmVmaXggPSAnJyxcbiAgICAgICAgICAgIG5ld1ByZWZpeCA9IGNvb2tpZXMuZ2V0UHJlZml4KCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb29raWVzLnNldFByZWZpeChvbGRQcmVmaXgpO1xuXG4gICAgICAgICAgdmFyIF9pbiA9IFtdO1xuICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gZGF0YS5jb250YWluZXJzKSB7XG4gICAgICAgICAgICBpZiAoZGF0YS5jb250YWluZXJzLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgIF9pbi5wdXNoKGRhdGEuY29udGFpbmVyc1twcm9wXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfaW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvb2tpZXMuc2V0UHJlZml4KG9sZFByZWZpeCk7XG4gICAgICAgICAgICBpZiAoY29va2llcy5nZXQoX2luW2ldKSkge1xuICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gY29va2llcy5nZXQoX2luW2ldKTtcbiAgICAgICAgICAgICAgY29va2llcy5zZXRQcmVmaXgobmV3UHJlZml4KTtcbiAgICAgICAgICAgICAgY29va2llcy5zZXQoX2luW2ldLCBidWZmZXIsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFVwZGF0ZSBgc2Vzc2lvbmBcbiAgICAgICAgICBjb29raWVzLnNldFByZWZpeChvbGRQcmVmaXgpO1xuICAgICAgICAgIGlmIChjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbikpIHtcbiAgICAgICAgICAgIGNvb2tpZXMuc2V0UHJlZml4KG5ld1ByZWZpeCk7XG4gICAgICAgICAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbiwgZGF0YS5wYWNrLnNlc3Npb24oMCksIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFlheSFcbiAgICAgICAgICBjb29raWVzLnNldFByZWZpeChuZXdQcmVmaXgpO1xuICAgICAgICAgIGNvb2tpZXMuc2V0KGRhdGEuc2VydmljZS5taWdyYXRpb25zLCBzdWNjZXNzLCBfd2l0aC5sLCBfd2l0aC5kLCBfd2l0aC5pKTtcblxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAvLyBPb3BzXG4gICAgICAgICAgY29va2llcy5zZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMsIGZhaWwsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIF1cblxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHRlcm1zID0gcmVxdWlyZSgnLi90ZXJtcycpLFxuICAgIHVyaSAgID0gcmVxdWlyZSgnLi9oZWxwZXJzL3VyaScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBmZXRjaDogZnVuY3Rpb24ocHJlZnMpIHtcblxuICAgIHZhciB1c2VyICAgPSBwcmVmcyB8fCB7fSxcbiAgICAgICAgcGFyYW1zID0ge307XG5cbiAgICBwYXJhbXMucHJlZml4ID0gdGhpcy52YWxpZGF0ZS5pc1N0cmluZyh1c2VyLnByZWZpeCkgPyB1c2VyLnByZWZpeCA6ICcnO1xuXG4gICAgLy8gU2V0IGBsaWZldGltZSBvZiB0aGUgY29va2llYCBpbiBtb250aHNcbiAgICBwYXJhbXMubGlmZXRpbWUgPSB0aGlzLnZhbGlkYXRlLmNoZWNrRmxvYXQodXNlci5saWZldGltZSkgfHwgNjtcbiAgICBwYXJhbXMubGlmZXRpbWUgPSBwYXJzZUludChwYXJhbXMubGlmZXRpbWUgKiAzMCAqIDI0ICogNjApO1xuXG4gICAgLy8gU2V0IGBzZXNzaW9uIGxlbmd0aGAgaW4gbWludXRlc1xuICAgIHBhcmFtcy5zZXNzaW9uX2xlbmd0aCA9IHRoaXMudmFsaWRhdGUuY2hlY2tJbnQodXNlci5zZXNzaW9uX2xlbmd0aCkgfHwgMzA7XG5cbiAgICAvLyBTZXQgYHRpbWV6b25lIG9mZnNldGAgaW4gaG91cnNcbiAgICBwYXJhbXMudGltZXpvbmVfb2Zmc2V0ID0gdGhpcy52YWxpZGF0ZS5jaGVja0ludCh1c2VyLnRpbWV6b25lX29mZnNldCk7XG5cbiAgICAvLyBTZXQgYGNhbXBhaWduIHBhcmFtYCBmb3IgQWRXb3JkcyBsaW5rc1xuICAgIHBhcmFtcy5jYW1wYWlnbl9wYXJhbSA9IHVzZXIuY2FtcGFpZ25fcGFyYW0gfHwgZmFsc2U7XG5cbiAgICAvLyBTZXQgYHVzZXIgaXBgXG4gICAgcGFyYW1zLnVzZXJfaXAgPSB1c2VyLnVzZXJfaXAgfHwgdGVybXMubm9uZTtcblxuICAgIC8vIFNldCBgcHJvbW9jb2RlYFxuICAgIGlmICh1c2VyLnByb21vY29kZSkge1xuICAgICAgcGFyYW1zLnByb21vY29kZSA9IHt9O1xuICAgICAgcGFyYW1zLnByb21vY29kZS5taW4gPSBwYXJzZUludCh1c2VyLnByb21vY29kZS5taW4pIHx8IDEwMDAwMDtcbiAgICAgIHBhcmFtcy5wcm9tb2NvZGUubWF4ID0gcGFyc2VJbnQodXNlci5wcm9tb2NvZGUubWF4KSB8fCA5OTk5OTk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmFtcy5wcm9tb2NvZGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBTZXQgYHR5cGVpbiBhdHRyaWJ1dGVzYFxuICAgIGlmICh1c2VyLnR5cGVpbl9hdHRyaWJ1dGVzICYmIHVzZXIudHlwZWluX2F0dHJpYnV0ZXMuc291cmNlICYmIHVzZXIudHlwZWluX2F0dHJpYnV0ZXMubWVkaXVtKSB7XG4gICAgICBwYXJhbXMudHlwZWluX2F0dHJpYnV0ZXMgPSB7fTtcbiAgICAgIHBhcmFtcy50eXBlaW5fYXR0cmlidXRlcy5zb3VyY2UgPSB1c2VyLnR5cGVpbl9hdHRyaWJ1dGVzLnNvdXJjZTtcbiAgICAgIHBhcmFtcy50eXBlaW5fYXR0cmlidXRlcy5tZWRpdW0gPSB1c2VyLnR5cGVpbl9hdHRyaWJ1dGVzLm1lZGl1bTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyYW1zLnR5cGVpbl9hdHRyaWJ1dGVzID0geyBzb3VyY2U6ICcoZGlyZWN0KScsIG1lZGl1bTogJyhub25lKScgfTtcbiAgICB9XG5cbiAgICAvLyBTZXQgYGRvbWFpbmBcbiAgICBpZiAodXNlci5kb21haW4gJiYgdGhpcy52YWxpZGF0ZS5pc1N0cmluZyh1c2VyLmRvbWFpbikpIHtcbiAgICAgIHBhcmFtcy5kb21haW4gPSB7IGhvc3Q6IHVzZXIuZG9tYWluLCBpc29sYXRlOiBmYWxzZSB9O1xuICAgIH0gZWxzZSBpZiAodXNlci5kb21haW4gJiYgdXNlci5kb21haW4uaG9zdCkge1xuICAgICAgcGFyYW1zLmRvbWFpbiA9IHVzZXIuZG9tYWluO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbXMuZG9tYWluID0geyBob3N0OiB1cmkuZ2V0SG9zdChkb2N1bWVudC5sb2NhdGlvbi5ob3N0bmFtZSksIGlzb2xhdGU6IGZhbHNlIH07XG4gICAgfVxuXG4gICAgLy8gU2V0IGByZWZlcnJhbCBzb3VyY2VzYFxuICAgIHBhcmFtcy5yZWZlcnJhbHMgPSBbXTtcblxuICAgIGlmICh1c2VyLnJlZmVycmFscyAmJiB1c2VyLnJlZmVycmFscy5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKHZhciBpciA9IDA7IGlyIDwgdXNlci5yZWZlcnJhbHMubGVuZ3RoOyBpcisrKSB7XG4gICAgICAgIGlmICh1c2VyLnJlZmVycmFsc1tpcl0uaG9zdCkge1xuICAgICAgICAgIHBhcmFtcy5yZWZlcnJhbHMucHVzaCh1c2VyLnJlZmVycmFsc1tpcl0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IGBvcmdhbmljIHNvdXJjZXNgXG4gICAgcGFyYW1zLm9yZ2FuaWNzID0gW107XG5cbiAgICBpZiAodXNlci5vcmdhbmljcyAmJiB1c2VyLm9yZ2FuaWNzLmxlbmd0aCA+IDApIHtcbiAgICAgIGZvciAodmFyIGlvID0gMDsgaW8gPCB1c2VyLm9yZ2FuaWNzLmxlbmd0aDsgaW8rKykge1xuICAgICAgICBpZiAodXNlci5vcmdhbmljc1tpb10uaG9zdCAmJiB1c2VyLm9yZ2FuaWNzW2lvXS5wYXJhbSkge1xuICAgICAgICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHVzZXIub3JnYW5pY3NbaW9dKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ2JpbmcuY29tJywgICAgICBwYXJhbTogJ3EnLCAgICAgZGlzcGxheTogJ2JpbmcnICAgICAgICAgICAgfSk7XG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAneWFob28uY29tJywgICAgIHBhcmFtOiAncCcsICAgICBkaXNwbGF5OiAneWFob28nICAgICAgICAgICB9KTtcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICdhYm91dC5jb20nLCAgICAgcGFyYW06ICdxJywgICAgIGRpc3BsYXk6ICdhYm91dCcgICAgICAgICAgIH0pO1xuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ2FvbC5jb20nLCAgICAgICBwYXJhbTogJ3EnLCAgICAgZGlzcGxheTogJ2FvbCcgICAgICAgICAgICAgfSk7XG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAnYXNrLmNvbScsICAgICAgIHBhcmFtOiAncScsICAgICBkaXNwbGF5OiAnYXNrJyAgICAgICAgICAgICB9KTtcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICdnbG9ib3Nvc28uY29tJywgcGFyYW06ICdxJywgICAgIGRpc3BsYXk6ICdnbG9ibycgICAgICAgICAgIH0pO1xuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ2dvLm1haWwucnUnLCAgICBwYXJhbTogJ3EnLCAgICAgZGlzcGxheTogJ2dvLm1haWwucnUnICAgICAgfSk7XG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAncmFtYmxlci5ydScsICAgIHBhcmFtOiAncXVlcnknLCBkaXNwbGF5OiAncmFtYmxlcicgICAgICAgICB9KTtcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICd0dXQuYnknLCAgICAgICAgcGFyYW06ICdxdWVyeScsIGRpc3BsYXk6ICd0dXQuYnknICAgICAgICAgIH0pO1xuXG4gICAgcGFyYW1zLnJlZmVycmFscy5wdXNoKHsgaG9zdDogJ3QuY28nLCAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAndHdpdHRlci5jb20nICAgICB9KTtcbiAgICBwYXJhbXMucmVmZXJyYWxzLnB1c2goeyBob3N0OiAncGx1cy51cmwuZ29vZ2xlLmNvbScsICAgICAgICAgIGRpc3BsYXk6ICdwbHVzLmdvb2dsZS5jb20nIH0pO1xuXG5cbiAgICByZXR1cm4gcGFyYW1zO1xuXG4gIH0sXG5cbiAgdmFsaWRhdGU6IHtcblxuICAgIGNoZWNrRmxvYXQ6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHJldHVybiB2ICYmIHRoaXMuaXNOdW1lcmljKHBhcnNlRmxvYXQodikpID8gcGFyc2VGbG9hdCh2KSA6IGZhbHNlO1xuICAgIH0sXG5cbiAgICBjaGVja0ludDogZnVuY3Rpb24odikge1xuICAgICAgcmV0dXJuIHYgJiYgdGhpcy5pc051bWVyaWMocGFyc2VJbnQodikpID8gcGFyc2VJbnQodikgOiBmYWxzZTtcbiAgICB9LFxuXG4gICAgaXNOdW1lcmljOiBmdW5jdGlvbih2KXtcbiAgICAgIHJldHVybiAhaXNOYU4odik7XG4gICAgfSxcblxuICAgIGlzU3RyaW5nOiBmdW5jdGlvbih2KSB7XG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHYpID09PSAnW29iamVjdCBTdHJpbmddJztcbiAgICB9XG5cbiAgfVxuXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICB0cmFmZmljOiB7XG4gICAgdXRtOiAgICAgICAgJ3V0bScsXG4gICAgb3JnYW5pYzogICAgJ29yZ2FuaWMnLFxuICAgIHJlZmVycmFsOiAgICdyZWZlcnJhbCcsXG4gICAgdHlwZWluOiAgICAgJ3R5cGVpbidcbiAgfSxcblxuICByZWZlcmVyOiB7XG4gICAgcmVmZXJyYWw6ICAgJ3JlZmVycmFsJyxcbiAgICBvcmdhbmljOiAgICAnb3JnYW5pYycsXG4gICAgc29jaWFsOiAgICAgJ3NvY2lhbCdcbiAgfSxcblxuICBub25lOiAgICAgICAgICcobm9uZSknLFxuICBvb3BzOiAgICAgICAgICcoSG91c3Rvbiwgd2UgaGF2ZSBhIHByb2JsZW0pJ1xuXG59O1xuIl19
