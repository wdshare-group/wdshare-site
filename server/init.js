var gravatar = require("gravatar"),
    config   = require("../server/config"),
    path     = require('path'),
    ejs      = require('ejs'),
    fs       = require('fs'),
    os       = require('os'),


    init     = {
        config: function (oSpring, ejs) {
            "use strict";
            ejs.open = '<%';
            ejs.close = '%>';
            //ejs.delimiter = '$';
            oSpring.locals.moment.locale(config.locale);
        },
        getIP : function(){
            "use strict";
            var map = {
                internal : {
                    IPv4 : [],
                    IPv6 : []
                },
                internet : {
                    IPv4 : [],
                    IPv6 : []
                }

            };
            var ifaces = os.networkInterfaces();

            for (var dev in ifaces) {
                if(ifaces.hasOwnProperty(dev) && (dev === '本地连接' || dev === 'lo' || dev === 'eth0' || dev === 'en0' || dev=== 'lo0' || dev === 'local connection')){
                    var x = ifaces[dev];
                    for(var i=0;i< x.length;i++){
                        var eth = x[i];
                        if(eth.internal === false ){
                            if(eth.family === 'IPv4'){
                                map.internet.IPv4.push(eth.address);
                            }else{
                                map.internet.IPv6.push(eth.address);
                            }
                            continue;
                        }
                        if(eth.internal === true){
                            if(eth.family === 'IPv4'){
                                map.internal.IPv4.push(eth.address);
                            }else{
                                map.internal.IPv6.push(eth.address);
                            }
                            continue;
                        }
                    }
                }
            }
            //console.log(map);
            return map;
        },

        authorize: function (req, res, next) {
            "use strict";
            if (!req.session.user) {
                res.redirect('/login');
            } else {
                next();
            }
        },
        goBack:function(referer){
            "use strict";
            var tmp = ["/login","/register"];

            if(!referer || tmp.indexOf(referer)){
                return "/";
            }else{
                return referer;
            }
        },
        gavatar:function(email){
            "use strict";
            return gravatar.url(email,{s:"43",r:"pg",d:"blank"});
        },
        pagination:function(current,totals,prelink){
            "use strict";
            var total = Math.ceil(totals/config.itemsPerPage),

                pagination = fs.readFileSync(path.join(__dirname, '../contents/theme/') + (config.theme || 'default') + "/pagination.html", 'utf-8');

            return ejs.render(pagination,{current:current,total:total,prelink:prelink});

        }
    };


module.exports = init;