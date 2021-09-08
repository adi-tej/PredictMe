module.exports = function(){
    var express = require('express');
    var app = express();

    var User = require("../routes/user.js");
    var UserDomain = require("../routes/userdomain.js");
    var UserEntity = require("../routes/userentity.js");
    var cipher = require('../routes/cipher.js').myCiphering;


    /*+++++++++++++++++++++++++ GET ALL DOMAINS +++++++++++++++++++++++++++++++++++++*/
    app.get('/domain', function (req, res) {
        var userId = res.get('userId');
        var domainIds;
        User.findOne({_id: userId}, function (err, user) {
            domainIds = user.domains;
            userId = user.id;

            UserDomain.find({_id: {$in: domainIds}}, {'domainName': 1, _id: 0}, function (err, userDomain) {
                if (userDomain.length == 0) {
                    res.send({
                        success: false,
                        message: "NO domains, please create a domain "
                    });
                } else {
                    res.send({
                        success: true,
                        userDomain: userDomain
                    });

                }

            });

        });
    });
/*++++++++++++++++++++++++++ GET DOMAINS of domain name +++++++++++++++++++++++++++++++++*/
    app.get('/domain/:domainName', function (req, res) {
        var domainName = req.params.domainName;
        var userId = res.get('userId');
        var domainIds;
        User.findOne({_id: userId}, function (err, user) {
            domainIds = user.domains;
            userId = user.id;

            UserDomain.findOne({'domainName': domainName, _id: {$in: domainIds}}, {'domainName': 1, _id: 0}, function (err, userDomain) {
                if (err) {
                    res.send({
                        success: false,
                        message: "no user domains of domain name: "+domainName
                    });
                    //console.log("no user domains of domain name: "+domainName);
                } else {
                    res.send({
                        success: true,
                        userDomain: userDomain
                    });
                    //console.log("required domain:" +userDomain);
                }

            });

        });

    });
/*+++++++++++++++++++++++++++ CREATE DOMAIN +++++++++++++++++++++++++++++++++++++*/
    app.put('/domain', function (req, res) {
        var userId = res.get('userId');
        var domainName = req.body.domainName;
        var domainIds;
        User.findOne({_id: userId}, function (err, user) {
            console.log('user: '+user);
            domainIds = user.domains;
            userId = user.id;

            UserDomain.find({'domainName': domainName, _id: {$in: domainIds}}, function (err, userDomain) {

                if (userDomain.length == 0) {
                    var userdomain = new UserDomain({'domainName': domainName});
                    userdomain.save();

                    user.domains.push(userdomain.id);
                    user.save();

                    res.send({
                        success: true,
                        message: "User Domain created"
                    });


                }
                else {
                    console.log("required domain: " + userDomain);
                    res.send({
                        success: false,
                        message: "User Domain Already Exists"
                    });

                }

            });

        });

    });
/*+++++++++++++++++++++++++++++ GET ALL ENTITIES +++++++++++++++++++++++++++++++++++*/
    app.get('/domain/:domainName/entity', function (req, res) {
        var userId = res.get('userId');
        var domainName = req.params.domainName;
        var domainIds;
        var entityIds;

        User.findOne({_id: userId}, function (err, user) {
            domainIds = user.domains;
            userId = user.id;
            UserDomain.findOne({'domainName': domainName, _id: {$in: domainIds}}, function (err, userDomain) {
                if (err) {
                    console.log("no user domains of domain name: "+domainName);
                } else {
                    domainName = userDomain.domainName;
                    entityIds = userDomain.entities;

                    UserEntity.find({_id: {$in: entityIds}}, {'entityName': 1, _id: 0}, function (err, userEntity) {
                        if (userEntity.length == 0) {
                            res.send({
                                success: false,
                                message: "NO entities, please create an entity"
                            });

                        } else {
                            res.send({
                                success: true,
                                userEntity: userEntity
                            });

                        }

                    });
                }

            });

        });

    });
/*+++++++++++++++++++++++++ GET ENTITIES of entity name +++++++++++++++++++++++++++++++++++++*/
    app.get('/domain/:domainName/entity/:entityName', function (req, res) {
        var userId = res.get('userId');
        var entityName = req.params.entityName;
        var domainName = req.params.domainName;
        var domainIds;
        var entityIds;

        User.findOne({_id: userId}, function (err, user) {
            domainIds = user.domains;
            UserDomain.findOne({'domainName': domainName, _id: {$in: domainIds}}, function (err, userDomain) {
                if (err) {
                    console.log("no user domains of domain name: "+domainName);
                } else {
                    domainName = userDomain.domainName;
                    entityIds = userDomain.entities;
                    UserEntity.findOne({'entityName': entityName, _id: {$in: entityIds}}, {'entityName': 1, _id: 0}, function (err, userEntity) {
                        if (err) {
                            res.send({
                                success: false,
                                message: "no user entities of entity name: "+entityName
                            });
                            //console.log("no user entities of entity name: "+entityName);
                        } else {
                            res.send({
                                success: true,
                                userEntity: userEntity
                            });
                           // console.log("required entity:" +userEntity);
                        }

                    });
                }

            });

        });

    });
/*+++++++++++++++++++++++ CREATE ENTITY ++++++++++++++++++++++++++++++++++++++++*/
    app.put('/domain/:domainName/entity', function (req, res) {
        var userId = res.get('userId');
        var entityName = req.body.entityName;
        var domainName = req.params.domainName;
        var domainIds;
        var entityIds;
        if(entityName==undefined){
            entityName = req.query.entityName;
        }
        User.findOne({_id: userId}, function (err, user) {
            domainIds = user.domains;
            UserDomain.findOne({'domainName': domainName, _id: {$in: domainIds}}, function (err, userDomain) {
                if (err) {
                    console.log("no user domains of domain name: "+domainName);
                } else {
                    domainName = userDomain.domainName;
                    entityIds = userDomain.entities;

                    UserEntity.find({'entityName': entityName, _id: {$in: entityIds}}, function (err, userEntity) {
                        if (userEntity.length == 0) {
                            var userentity = new UserEntity({'entityName': entityName, 'domainName': domainName,'userId': userId});
                            userentity.save();
                            userDomain.entities.push(userentity.id);
                            userDomain.save();
                            res.send({
                                success: true,
                                message: "User Entity created"
                            });

                        } else {
                            res.send({
                                success: false,
                                message: "User Entity Already Exists"
                            });

                        }

                    });


                }

            });

        });

    });
/*++++++++++++++++++++++++++++++ PUT DATA HEADERS +++++++++++++++++++++++++++++++++++++*/
    app.put('/domain/:domainName/entity/:entityName/data-headers', function (req, res) {
        var userId = res.get('userId');
        var entityName = req.params.entityName;
        var domainName = req.params.domainName;
        var domainIds;
        var entityIds;
        var headers = req.body.headers;
        //console.log(headers);

        User.findOne({_id: userId}, function (err, user) {
            domainIds = user.domains;
            UserDomain.findOne({'domainName': domainName, _id: {$in: domainIds}}, function (err, userDomain) {
                if (err) {
                       // console.log("no user domains of domain name: "+domainName);

                } else {
                    domainName = userDomain.domainName;
                    entityIds = userDomain.entities;

                    UserEntity.findOne({'entityName': entityName, _id: {$in: entityIds}}, function (err, userEntity) {
                        if(err){
                           // console.log("no user entities of entity name: "+entityName);
                        }else {
                            if (userEntity.attributeHeaders.length == 0) {
                                //console.log("loop starts here" + headers.dataHeaders.length);
                                for (var i = 0; i < headers.dataHeaders.length; i++) {
                                    //console.log("i is : " + i);
                                    UserEntity.update({_id: userEntity.id}, {
                                        $push: {
                                            'attributeHeaders': {
                                                'index': headers.dataHeaders[i].index,
                                                'attributeName': headers.dataHeaders[i].attributeName,
                                                'attributeType': headers.dataHeaders[i].attributeType,
                                                'optionValues':headers.dataHeaders[i].optionValues
                                            }
                                        }
                                    }, function (err) {
                                        if (err) {
                                            console.log("user entity update error"+err);
                                        } else {
                                            //console.log("Successfully added");
                                        }
                                    });
                                }
                                UserEntity.findOne({_id: userEntity.id}, function (err, userEntity) {
                                    if (err) {
                                       // console.log('error');
                                    }
                                    else {
                                        userEntity.save();

                                    }
                                });

                                res.send({
                                    success: true,
                                    message: "Headers created"
                                });
                            } else {
                                res.send({
                                    success: true,
                                    message: "Headers already created for this entity. Please create new entity"
                                });
                            }
                    }
                    });
                }
            });
        });
    });
/*+++++++++++++++++++++++++++ GET DATA HEADERS +++++++++++++++++++++++++++++++++++*/
    app.get('/domain/:domainName/entity/:entityName/data-headers', function (req, res) {
        var userId = res.get('userId');
        var entityName = req.params.entityName;
        var domainName = req.params.domainName;
        var domainIds;
        var entityIds;
        var headers = req.params.headers;


        User.findOne({_id: userId}, function (err, user) {
            domainIds = user.domains;
            UserDomain.findOne({'domainName': domainName, _id: {$in: domainIds}}, function (err, userDomain) {
                if(err){
                    console.log("no user domains of domain name: "+domainName);
                }else {
                    domainName = userDomain.domainName;
                    entityIds = userDomain.entities;

                    UserEntity.findOne({'entityName': entityName, _id: {$in: entityIds}}, function (err, userEntity) {
                        if(err){
                            console.log("no user entities of entity name: "+entityName);
                        }else {
                            headers = userEntity.attributeHeaders;

                        }
                    });
                }
            });

        });

    });
return app;
}();

