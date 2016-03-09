var express = require('express');
var router = express.Router();
var async = require('async');

/**
 * 获取公告
 * 
 * @param {fuction} callback 
 */
var getAffiches = function(callback) {
  archiveModel.getOne({
    key: "Article_crumb",
    body: {
      url: "affiche"
    }
  }, function(err, data) {
    callback(err, data);
  })
}


/**
 * 获取最新的活动列表，默认为最新8个
 * 
 * @param {integer} num
 * @param {fuction} callback 
 */
function getActivesList(num, callback) {
  num = num || 8;
  activeModel.getSort({
    key: "Active",
    body: {},
    pages: { page: 1, pagesize: num },
    occupation: "aAddDate"
  }, function(err, data) {
    callback(err, data);
  })
};


/**
 * 获取"精彩文章"列表，包含了文章的作者和分类信息，默认为10篇
 * 
 * @param {integer} num
 * @param {fuction} callback 
 */

function getAchivesList(num, callback) {
  num = num || 10;
  getAchives(num, function(err, data) {
    async.map(data, function(item, callback) {
        fixAchives(item, function(err, result) {
          var userInfo = result[0] || {};
          var articleInfo = result[1] || {};
          item.user = userInfo.username || "";
          item.userId = userInfo._id || "";
          item.channel = articleInfo.name || "";
          item.channelUrl = articleInfo.url || "";
          callback(err, item);
        });
      },
      function(err, result) {
        callback(err, result);
      });
  })
}

/**
 * 获取文章列表，不包含了文章的作者和分类信息，默认为10篇，获取规则如下：
 * 1. 获取最新10篇头条文章
 * 2. 热门文章不够10篇，则取剩下最新文章补齐10篇
 * 
 * @param {integer} num
 * @param {fuction} callback 
 */
function getAchives(num, callback) {
  async.waterfall([
    function(callback) {
      // 获取头条文章
      archiveModel.getSort({
        key: "Archive",
        body: { type: 1, audit: true, diyType: { '$regex': /1/i } },
        pages: { page: 1, pagesize: num },
        occupation: "addDate"
      }, function(err, data) {
        callback(err, data);
      })
    },
    function(data01, callback) {
      // 如果头条文章不够10篇，获取最新的其他文章
      if (data01.lenght >= 10) {
        callback(null, data);
      } else {
        var len = num - data01.length
        archiveModel.getSort({
          key: "Archive",
          body: { type: 1, audit: true, diyType: { '$regex': /^((?!1).)+$|^$/ } },
          pages: { page: 1, pagesize: len },
          occupation: "addDate"
        }, function(err, data02) {
          callback(err, data01.concat(data02));
        })
      }
    }
  ], function(err, result) {
    callback(err, result);
  });
}

/**
 * 对获取的"文章"添加作者和分类信息
 * 
 * @param {Object} item  文章对象
 * @param {fuction} callback 
 */
function fixAchives(item, callback) {
  async.parallel([
    function(callback) {
      // 获取文章的作者信息
      usersModel.getOne({
        key: "User",
        body: {
          _id: item.userId
        }
      }, function(err, userData) {
        callback(err, userData);
      })
    },
    function(callback) {
      // 获取文章的类比信息
      archiveModel.getOne({
        key: "Article_channel",
        body: {
          _id: item.channelId
        }
      }, function(err, channelData) {
        callback(err, channelData);
      })
    }
  ], function(err, result) {
    callback(err, result);
  });
}

/**
 * 获取最新加入的会员，默认为最新8个
 * 
 * @param {Object} num  
 * @param {fuction} callback 
 */
function getUsersList(num, callback) {
  num = num || 8;
  usersModel.getSort({
    key: "User",
    body: { isActive: true, lock: false },
    pages: { page: 1, pagesize: num },
    occupation: "regTime"
  }, function(err, data) {
    async.map(data, function(item, callback) {
        fixUsers(item, function(err, result) {
          var userInfo = result[0] || {};
          var article = result[1] || [];
          item.userInfo = userInfo || {};
          item.article = article.length;
          callback(err, item);
        });
      },
      function(err, result) {
        callback(err, result);
      });
  })
}


/**
 * 对获取的"会员"添加详细信息和文章数
 * 
 * @param {Object} item 会员对象
 * @param {fuction} callback 
 */
function fixUsers(item, callback) {
  async.parallel([
    function(callback) {
      // 获取会员的详细信息
      usersInfosModel.getOne({
        key: "User_info",
        body: {
          userid: item._id
        }
      }, function(err, userInfo) {
        callback(err, userInfo);
      })
    },
    function(callback) {
      // 获取会员的文章信息
      archiveModel.getOne({
        key: "Archive",
        body: {
          _id: item._id,
          audit: true
        }
      }, function(err, article) {
        callback(err, article);
      })
    }
  ], function(err, result) {
    callback(err, result);
  });
}

/**
 * 获取会员总数，已激活并且未锁定的
 * 
 * @param {fuction} callback 
 */
var getUserSum = function(callback) {
  usersModel.count({isActive:true, lock:false}, {
    key: "User"
  }, function(err, result) {
    callback(err, result);
  })
}

/**
 * 获取所有数据后触发回调
 * 
 * @param {fuction} callback 
 */
function getData(callback) {
  async.parallel({
    affiche: function(callback) {
      getAffiches(callback);
    },
    actives: function(callback) {
      getActivesList(8, callback);
    },
    achives: function(callback) {
      getAchivesList(10, callback);
    },
    users: function(callback) {
      getUsersList(8, callback);
    },
    userSum: function(callback) {
      getUserSum(callback);
    }
  }, function(err, result) {
    callback(err, result);
  });
}

/**
 * 首页路由处理
 */
router.get('/', function(req, res) {
  getData(function(err, result) {
    if (err) {
      res.send("未知错误，请重试！");
    }
    // 封装数据，兼容旧版本
    var data = {
      title: '官网首页',
      affiche: result.affiche,
      active: {
        title: '精彩活动',
        result: result.actives
      },
      article: result.achives,
      users: {
        title: '会员信息',
        result: result.users,
        allCount: result.userSum
      }
    };
    res.render('index', data);
  })
});

module.exports = router;
