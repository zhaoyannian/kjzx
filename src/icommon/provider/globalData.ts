/**
 * Created by shenqingqing on 2018/11/7.
 */
import { ENV } from './../../environments/environment.dev';
import { Injectable } from '@angular/core';
import _ from 'lodash';
import { myNotifyUri, staffIndex, staffClzName, dictOptionClzName, getWfInfoUri, getWfInstUri, querySelectResourceListUri, startWfInstUri, querySelectResourceListOfInstUri, actionUri } from './Constants'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/Rx';
import { ModalController, AlertController } from 'ionic-angular';
import { NativeService } from './native';
/**
 * 工作流服务
 */
@Injectable()
export class globalData {
    flowHandleHolder: any = {};
    userinfor: any;
    roles: any;
    constructor(public NativeService: NativeService, private alerCtrl: AlertController, private modalCtrl: ModalController, public http: HttpClient) {
        this.userinfor = JSON.parse(localStorage.getItem("objectList"));
        this.roles = this.userinfor['rolesTo'];
    }
    // 获取环节信息
    getPoints(holder) {
        let points = holder.workflowInstToAxis && holder.workflowInstToAxis.listPointInstTo;
        // 查询所有的办理资源
        var allResourceList = [];
        if (holder.wfInst) {
            allResourceList = _.flattenDeep(_.map(holder.wfInst.listPointInstTo, e => e.listResourceInst));
            // console.debug('allResourceList...', allResourceList);
        }
        // 从wfInfo里，将每个环节的配置信息取出，并设置seq
        let i = 1;
        _.map(points, n => {
            let pointId = n.pointId;
            n.config = holder.wfInfo.workflowDefData.points[pointId].config;
            n.listResource = holder.wfInfo.workflowDefData.points[pointId].listResource;
            // 查询最新的处理人
            let res = _.filter(allResourceList, e => e.pointId === pointId && e.allocateTime);
            if (res.length > 0) {
                n.handleUserId = _.orderBy(res, ['createTime'], ['desc'])[0]['resourceTargetId'];
            }
            n.seq = i;
            i++;
        });
        // 翻译
        let inputField = 'handleUserId';
        let valueFields = ['userName'];
        let destFields = ['handleUserName'];
        this.transformStaffEntity(inputField, valueFields, destFields, points, '0a');
        return points;
    }

    // 获取意见列表信息
    getOpinions(holder) {
        let wfInst = holder.wfInst;
        let opinionList = [];
        if (wfInst) {
            _.each(wfInst.listPointInstTo, n => {
                _.each(n.listResourceInst, m => {
                    if (m.resourceTargetId) {
                        m.pointName = n.pointName;
                        opinionList.push(m);
                    }
                });
            });
        }
        // 第一环节的送交人默认为办理人
        if (opinionList.length > 0) {
            opinionList[0].fromTargetId = opinionList[0].resourceTargetId;
        }
        // 翻转列表
        opinionList.reverse();
        // 翻译
        let inputField = 'fromTargetId';
        let valueFields = ['userName', 'photo_sm'];
        let destFields = ['fromTargetName', 'fromTarget_photo_sm'];
        this.transformStaffEntity(inputField, valueFields, destFields, opinionList, 'oa');
        let inputField2 = 'resourceTargetId';
        let destFields2 = ['resourceTargetName', 'resourceTarget_photo_sm'];
        this.transformStaffEntity(inputField2, valueFields, destFields2, opinionList, 'oa');
        return opinionList;
    }
    /**
     * @description 查询Staff实体的翻译，固定了userId为index
     * @param  {String} inputField  原始数据中的字段名称
     * @param  {Array} valueFields  查询实体中需要的value字段名称
     * @param  {Array} destFields   要将查询实体中的字段翻译的名称
     * @param  {Array} orgList      原始数据
     * @return
     */
    transformStaffEntity(inputField, valueFields, destFields, list, ipurl) {
        return this.transformEntity(staffClzName, inputField, staffIndex, valueFields, destFields, list, ipurl);
    }
    /**
     * @description 查询Dept实体的翻译，固定了deptId为index
     * @param  {String} inputField  原始数据中的字段名称
     * @param  {Array} valueFields  查询实体中需要的value字段名称
     * @param  {Array} destFields   要将查询实体中的字段翻译的名称
     * @param  {Array} orgList      原始数据
     * @return
     */
    transformDeptEntity(inputField, valueFields, destFields, list, ipurl) {
        return this.transformEntity('com.stonewomb.common.entity.Dept', inputField, 'deptId', valueFields, destFields, list, ipurl);
    }
    /**
     * @description 普通实体的翻译，XXX 但是条件只能是一条
     * @param  {String} clzName      翻译的全类名
     * @param  {String} inputField   原始数据中的字段名称
     * @param  {String} indexedField 查询实体中对应的index字段名称
     * @param  {Array} valueFields  查询实体中需要的value字段名称
     * @param  {Array} destFields   要将查询实体中的字段翻译的名称
     * @param  {Array} orgList      原始数据
     * @return
     */
    transformEntity(clzName, inputField, indexedField, valueFields, destFields, list, ipurl) {
        // 1、组装条件
        var conditionProducer = (input) => ({
            [indexedField]: input[inputField]
        });
        // 2、赋值语句
        console.assert(valueFields.length === destFields.length);
        var assignment = (orgData, foundData) => {
            for (let i = 0; i < valueFields.length; i++) {
                orgData[destFields[i]] = foundData[valueFields[i]];
            }
        };
        if (ipurl == 'oa') {
            return this.transform(clzName, conditionProducer).match(list, assignment);
        } else {
            return this.transformcg(clzName, conditionProducer).match(list, assignment);
        }

    }
    transformcg(clzName, ...conditionProducers) {
        var result = {
            match: (orgList, assignmentFn) => { //　匹配关系自己写
                // 1、将查询条件数组与查询条件进行一一对应
                var _matching = [];
                _.map(orgList, (raw) => {
                    _.map(conditionProducers, (conPro) => {
                        _matching.push({ raw, condi: conPro(raw) });
                    });
                });
                // 2、获取查询条件数组
                let _condis = _.map(_matching, 'condi');
                // 3、用全类名、查询条件数组查询
                return new Promise((resolve, reject) => {
                    // 门户查不到数据
                    return this.http.post(ENV.httpurlscm + '/api/dml/queryByMultiConditions/' + clzName, _condis).subscribe(async resp => {
                        let res: any = await this.getData(_matching, orgList, resp, assignmentFn);
                        resolve(res);
                    }, error => {
                        resolve([]);
                    });

                })
                // this.http.post(ENV.httpurl + '/api/dml/queryByMultiConditions/' + clzName, _condis).subscribe( async resp => {
                //     await this.getData(_matching,orgList,resp,assignmentFn);
                // });
                // return result;
            }
        };
        return result;
    }
    /** TODO 如何多次 .match，
      比如翻译 创建人、更新人，都需要有多个条件
      let conditionProducer = (input) => ({ userId: input.creater });
      let conditionProducer2 = (input) => ({ userId: input.updater });
      多个赋值方法
      let assignment = (orgData, foundData) => {
          orgData.createrName = foundData.userName;
      };
      let assignment2 = (orgData, foundData) => {
          orgData.updaterName = foundData.userName;
      };

      * @description 获取后端转换数据，不用外层进行判断
      * @param  {String} clzName        翻译的全类名
      * @param  {Function} conditionProducers 产生查询条件的方法，可以是多个
      * @return {Object} result         含有一个match方法的对象，其中match方法返回一个promise，满足一个翻译完成后，再去完成另一个操作
      */
    transform(clzName, ...conditionProducers) {
        var result = {
            match: (orgList, assignmentFn) => { //　匹配关系自己写
                // 1、将查询条件数组与查询条件进行一一对应
                var _matching = [];
                _.map(orgList, (raw) => {
                    _.map(conditionProducers, (conPro) => {
                        _matching.push({ raw, condi: conPro(raw) });
                    });
                });
                // 2、获取查询条件数组
                let _condis = _.map(_matching, 'condi');
                // 3、用全类名、查询条件数组查询
                return new Promise((resolve, reject) => {
                    // 门户查不到数据
                    return this.http.post(ENV.httpurl + '/api/dml/queryByMultiConditions/' + clzName, _condis).subscribe(async resp => {
                        let res: any = await this.getData(_matching, orgList, resp, assignmentFn);
                        resolve(res);
                    }, error => {
                        reject();
                    });

                })
                // this.http.post(ENV.httpurl + '/api/dml/queryByMultiConditions/' + clzName, _condis).subscribe( async resp => {
                //     await this.getData(_matching,orgList,resp,assignmentFn);
                // });
                // return result;
            }
        };
        return result;
    }
    getData(_matching, orgList, foundList, assignmentFn) {
        // 4、获取数据后，将查询结果放入_matching
        _.forEach(_matching, (one) => {
            var matchingOne = _.find(foundList, one.condi);
            if (matchingOne) {
                one.result = matchingOne;
            }
        });
        // 5、遍历找到的数据与原始数据，匹配关系，进行赋值操作
        _.map(foundList, (foundData) => {
            _.map(orgList, (orgData) => {
                _.forEach(_matching, (mat) => {
                    // deep comparison
                    if (_.isEqual(mat.raw, orgData) && _.isEqual(mat.result, foundData)) {
                        assignmentFn(orgData, foundData);
                    }
                });
            });
        });
        return orgList;
    }
    /**
    * @description 数据字典的翻译
    * @param  {Array} dictOpts 数据字典
    * @param  {Array} orgList 原始数据
    * @return
    */
    transformDict(dictOpts, orgList, ipurl) {
        // 1、实体名称
        var clzName = dictOptionClzName;
        // 2、产生多个条件方法
        var condPros = [];
        _.map(dictOpts, (dictOpt) => {
            let condPro = (input) => ({
                dictCode: dictOpt.dict,
                optionValue: input[dictOpt.orgField]
            });
            condPros.push(condPro);
        });
        // 3、产生一个赋值方法
        var assignment = (orgData, foundData) => {
            _.map(dictOpts, (dictOpt) => {
                if (foundData.dictCode === dictOpt.dict && orgData[dictOpt.orgField] === foundData.optionValue) {
                    orgData[dictOpt.destField] = foundData.optionName;
                }
            });
        };
        if (ipurl == 'oa') {
            // 将数组平铺传参，用 ... ES6语法
            return this.transformSimp(clzName, ...condPros).match(orgList, assignment);
        } else {
            // 将数组平铺传参，用 ... ES6语法
            return this.transformSimpcg(clzName, ...condPros).match(orgList, assignment);
        }

    }
    /**XXX 原始的翻译方法，目前只是翻译数据字典，而数据字典需要提取
       * @description 获取后端转换数据，简易版，需要用自己写判断条件
       * @param  {String} clzName        翻译的全类名
       * @param  {Function} conditionProducers 产生查询条件的方法，可以是多个
       * @return {Object} result         含有一个match方法的对象
       */
    transformSimpcg(clzName, ...conditionProducers) {
        var result = {
            match: (orgList, assignmentFn) => { //　匹配关系自己写
                let conds = [];
                _.map(conditionProducers, (conPro) => {
                    conds = _.concat(conds, _.map(orgList, conPro));
                });
                return new Promise((resolve, reject) => {
                    // 备注：门户域名查不到数据
                    return this.http.post(ENV.httpurlscm + '/api/dml/queryByMultiConditions/' + clzName, conds).subscribe(async resp => {
                        let res: any = await this.gettransformData(orgList, resp, assignmentFn);
                        resolve(res);
                    }, error => {
                        reject();
                    });

                })
                // this.http.post(ENV.httpurl + '/api/dml/queryByMultiConditions/' + clzName, conds).subscribe(async resp => {
                //     await this.gettransformData(orgList, resp, assignmentFn);
                // });
            }
        };
        return result;
    }
    /**XXX 原始的翻译方法，目前只是翻译数据字典，而数据字典需要提取
       * @description 获取后端转换数据，简易版，需要用自己写判断条件
       * @param  {String} clzName        翻译的全类名
       * @param  {Function} conditionProducers 产生查询条件的方法，可以是多个
       * @return {Object} result         含有一个match方法的对象
       */
    transformSimp(clzName, ...conditionProducers) {
        var result = {
            match: (orgList, assignmentFn) => { //　匹配关系自己写
                let conds = [];
                _.map(conditionProducers, (conPro) => {
                    conds = _.concat(conds, _.map(orgList, conPro));
                });
                return new Promise((resolve, reject) => {
                    // 备注：门户域名查不到数据
                    return this.http.post(ENV.httpurl + '/api/dml/queryByMultiConditions/' + clzName, conds).subscribe(async resp => {
                        let res: any = await this.gettransformData(orgList, resp, assignmentFn);
                        resolve(res);
                    }, error => {
                        reject();
                    });

                })
                // this.http.post(ENV.httpurl + '/api/dml/queryByMultiConditions/' + clzName, conds).subscribe(async resp => {
                //     await this.gettransformData(orgList, resp, assignmentFn);
                // });
            }
        };
        return result;
    }
    gettransformData(orgList, foundList, assignmentFn) {
        _.map(foundList, (foundData) => {
            _.map(orgList, (orgData) => assignmentFn(orgData, foundData));
        });
        return orgList;
    }

    /**
    * 通过业务数据列表查询出流程实例数据列表
    *
    * @param {Array} bizList 业务数据列表
    */
    getWfInstListByBizList(bizList) {
        // let bizKeyIds = _.sortedUniq(_.map(bizList, n => {
        //     if (n.businessKey) {
        //         return n.businessKey.id;
        //     }
        // }));
        let bizKeyIds = _.sortedUniq(_.map(bizList, n => {
            if (!!n.businessKey) {
                return n.businessKey.id;
            }
        })).filter(n => n);
        return new Promise((resolve, reject) => {
            return this.http.post(ENV.httpurl + '/api/wf/wfInstFromBusinessKey', bizKeyIds).subscribe(resp => {
                resolve(resp);
            }, error => {
                reject();
            }) // 出错，返回空对象);
        })
    }
    //     getWfInstListByBizList(bizList : any): Observable<any> {
    //       if (!bizList || bizList.length === 0) {
    //         return Observable.of([]);
    //       }
    //       let bizKeyIds = _.sortedUniq(_.map(bizList, n => {
    //           if (n.businessKey) {
    //               return n.businessKey.id;
    //           }
    //       }));
    //       return Observable.create(observer => {
    //         this.http.post(ENV.httpurl + '/api/wf/wfInstFromBusinessKey', bizKeyIds).subscribe(resp => {
    //           observer.next(resp);
    //         },error =>{
    //           observer.error();
    //         });
    //       });
    //   }
    /**
     * 通过业务数据列表查询出流程资源数据列表
     *
     * @param {Array} bizList 业务数据列表
     */
    getWfResourceListByBizList(bizList) {
        // let bizKeyIds = _.sortedUniq(_.map(bizList, n => {
        //     if (n.businessKey) {
        //         return n.businessKey.id;
        //     }
        // }));
        let bizKeyIds = _.sortedUniq(_.map(bizList, n => {
            if (!!n.businessKey) {
                return n.businessKey.id;
            }
        })).filter(n => n)
        return new Promise((resolve, reject) => {
            return this.http.post(ENV.httpurl + '/api/wf/resInstFromBusinessKey', bizKeyIds).subscribe(resp => {
                resolve(resp);
            }, error => {
                reject();
            }) // 出错，返回空对象);
        })
    }
    // getWfResourceListByBizList(bizList : any): Observable<any>  {
    //     if (!bizList || bizList.length === 0) {
    //       return Observable.of([]);
    //     }
    //     let bizKeyIds = _.sortedUniq(_.map(bizList, n => {
    //         if (n.businessKey) {
    //             return n.businessKey.id;
    //         }
    //     }));
    //     return Observable.create(observer => {
    //       this.http.post(ENV.httpurl + '/api/wf/resInstFromBusinessKey', bizKeyIds).subscribe(resp => {
    //         observer.next(resp);
    //       },error =>{
    //         observer.error();
    //       });
    //     });
    // }
    /**
    * 通过流程定义信息、资源实例id获取holder
    *
    * @param {String/Object} wfUniqueKey 唯一键，流程的别名alias或者id，或者流程定义信息对象
    * @param {String} resourceInstId 资源实例id
    * @returns
    */
    getHolderFromWfAliasRef(wfUniqueKey: any, resourceInstId: any, version: any): Observable<any> {
        return Observable.create(observer => {
            if (resourceInstId === -1 || resourceInstId === '-1') {
                observer.next(this.createNullHolder());
            } else {
                if (!!resourceInstId) {
                    this.getHolderFromResourceNotify(resourceInstId).subscribe(result => {
                        observer.next(result);
                    })
                } else {
                    this.getHolder(wfUniqueKey, '', version).subscribe(result => {
                        observer.next(result);
                    })
                }
            }
        });
    }
    /**
     * 获取流程定义与实例信息，还有获取字段可编辑的方法
     * @param {String/Object} wfUniqueKey 唯一键，流程的别名alias或者id，或者流程定义信息对象
     * @param {String/Object} wfInstId 流程实例id，或者wfInst实例信息
     * @returns
     */
    getHolder(wfUniqueKey: any, wfInstId: any, version: any): Observable<any> {
        return Observable.create(observer => {
            let holder = {
                wfInfo: {},
                wfInst: {}
            };
            let that = this;
            wfUniqueKey = !!wfUniqueKey ? wfUniqueKey : '';
            wfInstId = !!wfInstId ? wfInstId : '';
            Observable.defer(async function () {
                if (!!wfUniqueKey) {
                    await that.getWfInfo(wfUniqueKey, version).then(data => {
                        holder.wfInfo = data;
                    }, error => {
                        holder.wfInfo = {}
                    });
                } else {
                    holder.wfInfo = {}
                }
                if (!!wfInstId) {
                    await that.getWfInst(wfInstId).then(data => {
                        holder.wfInst = data;
                    }, error => {
                        holder.wfInst = {}
                    })
                } else {
                    holder.wfInst = {}
                }
                return { holder }
            })
                .subscribe(x => {
                    observer.next(x.holder);
                })
        })
    }
    getHolderDetail() {

    }
    /**
     * 获取工作流信息
     *
     * @param {String} uniqueKey 唯一键，流程的别名alias或者id
     * @param {int} version 版本序号
     * @returns
     */
    getWfInfo(uniqueKey, version) {
        return new Promise((resolve, reject) => {
            let uri = ENV.httpurl + getWfInfoUri + '/' + uniqueKey;
            if (version) uri += '/' + version;
            return this.http.get(uri).subscribe(resp => {
                resolve(resp);
            }, error => {
                reject();
            }) // 出错，返回空对象);
        })
    }
    /**
     * 获取流程实例信息
     *
     * @param {String} wfInstId 流程实例id
     * @returns
     */
    getWfInst(wfInstId) {
        return new Promise((resolve, reject) => {
            this.http.get(ENV.httpurl + getWfInstUri + '/' + wfInstId).subscribe(resp => {
                resolve(resp);
            }, error => {
                reject();
            }) // 出错，返回空对象);
        })
    }
    /**
         * 为无流程的manage页创建一个空的holder
         */
    createNullHolder() {
        return {
            getPointEditable: () => true, // 默认可编辑
            getPointHidden: () => false, // 默认不隐藏
            hasFlow: () => false // 没有流程
        };
    }
    /**
       * 通过资源实例id获取wfInfo wfInst pointInst resourceInst
       * @param {String} resourceInstId 资源实例id
       * @returns
       */
    getHolderFromResourceNotify(resourceInstId: any): Observable<any> {
        return Observable.create(observer => {
            this.http.get(ENV.httpurl + '/api/wf/queryWorkflowInfoByNotify' + '/' + resourceInstId).subscribe(resp => {
                let holder = {
                    wfInfo: resp['workflowDefine'],
                    wfInst: resp['workflowInst'],
                    pointInst: resp['pointInst'],
                    resourceInst: resp['resourceInst'],
                    workflowInstToAxis: resp['workflowInstToAxis']
                };
                observer.next(holder);
            }, error => {
                observer.error(false);
            });
        }, error => {
        });
    }
    /**
    * 组装其它的信息到holder
    * @param {Object} holder 包含一个业务信息的holder
    * @returns
    */
    compOtherInfo(holder) {
        let that = this;
        // 当前处理环节id
        holder.handlePointId = holder.resourceInst ? holder.resourceInst.pointId : that.getStartPointId(holder.wfInfo);
        // 当前环节信息
        holder.handlePoint = that.getPoint(holder.wfInfo, holder.handlePointId);
        // 流程实例id
        if (holder.wfInst.workflowInst && holder.wfInst.workflowInst.id) {
            holder.wfInstId = holder.wfInst.workflowInst.id;
        }
        // 流程别名
        holder.wfAlias = holder.wfInfo.alias; // TODO: 目前先取流程的别名，用它启动，以后业务配置用id启动 holder.wfInfo.id
        // 其它方法
        Object.assign(holder, {
            getPointEditable(field) {
                // 取环节实例的状态，如果是“进行中”，则取配置，否则都不可编辑
                if (holder.pointInst) {
                    if (holder.pointInst.status === 'inprocess' || holder.pointInst.status === 'waiting') {
                        return that.getPointEditable(holder.wfInfo, holder.handlePointId, field);
                    } else {
                        return false;
                    }
                } else { // 新建的草稿
                    let firstPointId = that.getStartPointId(holder.wfInfo);
                    return that.getPointEditable(holder.wfInfo, firstPointId, field);
                }
            },
            getPointHidden(field) {
                if (holder.pointInst) {
                    return that.getPointHidden(holder.wfInfo, holder.handlePointId, field);
                } else { // 新建的草稿
                    let firstPointId = that.getStartPointId(holder.wfInfo);
                    return that.getPointHidden(holder.wfInfo, firstPointId, field);
                }
            },
            getNextPoint() {
                return that.getNextPoint(holder.wfInfo, holder.handlePointId);
            },
            isTodo() { // 是否是待办，是否显示意见、提交按钮
                if (holder.pointInst) { // 有环节实例，判断资源的环节状态是否是waiting
                    return holder.pointInst.status === 'waiting';
                } else { // 没有资源实例，是草稿
                    return true;
                }
            },
            opinionRequired() {
                return holder.handlePoint.config.showOpinionArea && holder.handlePoint.config.opinionRequred;
            },
            showOpinionArea() {
                return holder.handlePoint.config.showOpinionArea;
            },
            hasFlow() {
                return true;
            },
            getAllPoints() {
                return holder.wfInfo.workflowDefData.points;
            },
            getHandlePointId() {
                return holder.handlePointId;
            },
            isCombinRes(point) {
                return that.isCombinRes(point);
            },
            checkEnoughRes(point) {
                return that.checkEnoughRes(point, holder.wfInst.listPointInstTo);
            },
            btns() {
                this.userinfor = JSON.parse(localStorage.getItem("objectList"));
                this.roles = this.userinfor['rolesTo'];
                let btns = [];
                if (holder.handlePoint.config.isStar) {
                    if (holder.handlePoint.config.submitType === 'role') {
                        let wfky = false;
                        let wfld = false;
                        _.map(this.roles, (n) => {
                            if (n.name === holder.handlePoint.submitRole) {
                                wfky = true;
                            }
                            if (n.name === holder.handlePoint.bSubmitRole) {
                                wfld = true;
                            }
                        });
                        //科员
                        if (wfky) {
                            if (holder.handlePoint && holder.handlePoint.btns) {
                                btns = holder.handlePoint.btns;
                            }
                        }
                        //领导
                        if (wfld) {
                            _.map(holder.handlePoint.btns, (n) => {
                                if (n.title === '提交') {
                                    btns.push(n);
                                }
                            });
                        }
                        if (wfld == false && wfky == false) {
                            _.map(holder.handlePoint.btns, (n) => {
                                if (n.title === '提交') {
                                    btns.push(n);
                                }
                            });
                        }
                    } else if (holder.handlePoint.config.submitType === 'originator') {
                        let wfld = false;
                        _.map(this.roles, (n) => {
                            if (n.name === holder.handlePoint.bSubmitRole) {
                                wfld = true;
                            }
                        });
                        if (wfld) {
                            _.map(holder.handlePoint.btns, (n) => {
                                if (n.title === '提交至中心领导' || n.title === '提交' ) {
                                    n.title='提交';
                                    btns.push(n);
                                }
                            });
                        } else {
                            btns = holder.handlePoint.btns;
                        }
                    }
                } else {
                    btns = holder.handlePoint.btns;
                }
                _.each(btns, btn => {
                    that.setProc(btn);
                    btn.getHolder = () => holder;
                });
                return btns;
            },
            // 以后可能还会添加其它方法，例如：获取下一个通知列表getNextNotifyList()
        });
        return holder;
    }
    /**
   * 设置btn的proc，目前用于移动端流程的处理
   * @param {Object} btn 按钮
   */
    setProc(btn) {
        let that = this;
        btn.proc = (opinion, bizSaveRequest, wfData, finished, beforeSelectRes, afterSelectRes, procNextPoint, procBackPoint,objEntity) => {
            var holder = btn.getHolder();
            this.NativeService.showLoading();
            Object.assign(that.flowHandleHolder, { holder, opinion, bizSaveRequest, wfData, finished, beforeSelectRes, afterSelectRes, procNextPoint, procBackPoint,objEntity });
            that.handle(btn).then((resp) => {
                if (resp && resp.success) {
                    this.NativeService.hideLoading()
                    return that.flowHandleHolder.finished();
                } else if(resp == true){
                    this.NativeService.hideLoading()
                    return ;
                }else{
                    this.NativeService.hideLoading()
                    return that.flowHandleHolder.finished();
                }
            });
        };
    }
    /**
     * 获取某环节某字段是否可编辑，默认可编辑
     *
     * @param {Object} wfInfo 流程信息
     * @param {int} handlePointId 当前处理环节id
     * @param {String} field 字段
     * @returns
     */
    getPointEditable(wfInfo, handlePointId, field) {
        try {
            let handlePoint = this.getPoint(wfInfo, handlePointId);
            return !_.includes(handlePoint.config.lockFileds, field);
        } catch (e) {
            // console.error(e);
            return true;
        }
    }
    /**
     * 获取某环节某字段是否隐藏
     * @param {Object} wfInfo 流程信息
     * @param {int} handlePointId 当前处理环节id
     * @param {String} field 字段
     * @returns
     */
    getPointHidden(wfInfo, handlePointId, field) {
        try {
            let handlePoint = this.getPoint(wfInfo, handlePointId);
            return _.includes(handlePoint.config.hideFileds, field);
        } catch (e) {
            // console.error(e);
            return false; // 默认不隐藏
        }
    }
    /**
     * 获取某环节的下一个环节id
     * @param {Object} wfInfo 流程定义
     * @param {int} pointId 当前环节id
     * @returns
     */
    getNextPointId(wfInfo, pointId) {
        if (typeof pointId == 'string') {
            pointId = parseInt(pointId);
        }
        return _.find(wfInfo.workflowDefData.relations, { fromId: pointId })['toId'];
    }
    /**
     * 获取某个流程下，我的所有待办/已办列表
     * @param {Object} pageInfo 分页信息
     * @param {String} wfAlias 流程别名
     * @param {Boolean} isAllocated true - 已办 / false - 待办
     * @param {Object} filterParams 查询的条件数据
     */
    getMyNotify(pageInfo, wfAlias, isAllocated, filterParams) {
        let uri = myNotifyUri;
        if (wfAlias) {
            uri += '/' + wfAlias;
            // if (!!isAllocated) {
            uri += '/' + isAllocated;
            // }
        }
        return new Promise((resolve, reject) => {
            return this.http.post(ENV.httpurl + uri, filterParams, { params: pageInfo }).subscribe(resp => {
                resolve(resp);
            }, error => {
                reject();
            }) // 出错，返回空对象);
        })
    }
    /**
     * 获取启动环节id
     * @param {Object} wfInfo 流程定义
     * @returns
     */
    getStartPointId(wfInfo) {
        return wfInfo.workflowDefData.startPointId;
    }
    /**
     * 获取环节信息
     * @param {Object} wfInfo 流程定义
     * @param {int} pointId 环节id
     * @returns
     */
    getPoint(wfInfo, pointId) {
        if (typeof pointId == 'string') {
            pointId = parseInt(pointId);
        }
        return wfInfo.workflowDefData.points[pointId];
    }
    /**
     * 获取某环节的下一个环节
     * @param {Object} wfInfo 流程定义
     * @param {int} pointId 环节id
     */
    getNextPoint(wfInfo, pointId) {
        let nextPointId = this.getNextPointId(wfInfo, pointId);
        return this.getPoint(wfInfo, nextPointId);
    }
    /***************        以下是流程处理（提交/办结/退回等）的fun       ***************/


    // 处理业务判断
    handle(btn) {
        // 先判断是否有流程实例信息
        if (this.flowHandleHolder.holder.wfInstId) { // 已开启，判断类型，调用不同的api
            // 只有“提交” “转发”按钮才选人 XXX: 以后可能需要转发按钮，也需要选人
            if (btn.type === 'submit') {
                return this.submitFlow(btn);
            } else {
                return this.notSelectFlow(btn);
            }
        } else { // 没有，开启
            return this.startFlow(btn);
        }
    }
    // 开启流程
    startFlow(btn) {
        var holder = this.flowHandleHolder.holder;
        return this.selectRes(querySelectResourceListUri + '/' + holder.wfAlias, startWfInstUri + '/' + holder.wfAlias, btn);
    }

    // 提交流程
    submitFlow(btn) {
        var holder = btn.getHolder();
        return this.selectRes(querySelectResourceListOfInstUri + '/' + holder.wfInstId, actionUri + '/' + holder.wfInstId, btn);
    }
    // 开启流程、提交流程时，需要选人的公共方法
    selectRes(selectResourceListUri, requestUri, btn) {
        // 用当前环节资源的配置 判断 是否是复合资源
        if (this.flowHandleHolder.holder.isCombinRes(this.flowHandleHolder.holder.handlePoint)) { // 是复合资源
            if (this.flowHandleHolder.holder.checkEnoughRes(this.flowHandleHolder.holder.handlePoint)) { // 最后一个
                return this.commitNextPoint(selectResourceListUri, requestUri, btn);
            } else { // 不是最后一个---不选人提交
                
                return new Promise((resolve, reject) => {// 选人
                    if (this.flowHandleHolder.beforeSelectRes) {
                        resolve("ok")
                    }
                }).then(() => {
                    let startWorkflowTo = {
                        listAllocateResInst: this.getListAllocateResInst(),
                        listNextNotifyResInst: [],
                        btnId: '',
                    };
                    if (btn) {
                        startWorkflowTo.btnId = btn.id;
                    }
                    return this.sendReq(requestUri, startWorkflowTo);
                });
            }
        } else { // 不是复合资源
            return this.commitNextPoint(selectResourceListUri, requestUri, btn);
        }
    }
    // 提交到下一环节
    commitNextPoint(selectResourceListUri, requestUri, btn) {
        var a =0;
        // 当前处理环节的下一环节，扩展：下一个环节可以由业务判断给定
        return new Promise((resolve, reject) => {
            if (this.flowHandleHolder.procNextPoint) {
                resolve("ok")
            }
        }).then(point => {
            // console.log('flowHandleHolder'+this.flowHandleHolder.objEntity.sealName);
            if (btn.targetPointId) {
                var nextPoint = this.getPoint(this.flowHandleHolder.holder.wfInfo, btn.targetPointId);
            } else {
                if(this.flowHandleHolder.holder.wfAlias =='SealApplyZxz'){
                    if (!!this.flowHandleHolder.objEntity &&this.flowHandleHolder.objEntity.isWfJump == 'no' && this.flowHandleHolder.holder.handlePointId==1) {
                        this.flowHandleHolder.holder.handlePointId = 3;
                        var nextPoint = this.flowHandleHolder.holder.getNextPoint();
                    }else{
                        var nextPoint = this.flowHandleHolder.holder.getNextPoint();
                    }
                }
                // else if(this.flowHandleHolder.holder.wfAlias =='SealApplyWxhtz'||this.flowHandleHolder.holder.wfAlias =='SealApplyHtzsk'){
                //   if (!!this.flowHandleHolder.objEntity && this.flowHandleHolder.holder.handlePointId==1) {
                //     this.flowHandleHolder.holder.handlePointId = 3;
                //     var nextPoint = this.flowHandleHolder.holder.getNextPoint();
                // }else{
                //     var nextPoint = this.flowHandleHolder.holder.getNextPoint();
                // }
                // }
                else{
                    var nextPoint = this.flowHandleHolder.holder.getNextPoint();
                }
                
            }
            
            // console.debug('下一环节', nextPoint);
            return nextPoint;
        }).then(nextPoint => {
            selectResourceListUri += '/' + nextPoint.id;
            var startWorkflowTo = {
                listAllocateResInst: this.getListAllocateResInst(), // 当前分配的资源列表
                pointId: nextPoint.id, // 下一环节id,
                btnId: '',
                listNextNotifyResInst: []
            };
            if (btn) {
                startWorkflowTo.btnId = btn.id;
            }
            return new Promise((resolve, reject) => {// 选人
                if (this.flowHandleHolder.beforeSelectRes) {
                    resolve("ok")
                }
            }).then(() => {
                return this.getNextPointHandleRes(selectResourceListUri, nextPoint).then(data => {
                    if(data['length']>0){
                        this.NativeService.showLoading();
                        // console.debug('提交给下一环节的人数据data....', data);
                        startWorkflowTo.listNextNotifyResInst = this.setNextNotifyResList(data, nextPoint);
                        return (this.flowHandleHolder.afterSelectRes && this.flowHandleHolder.afterSelectRes({ selected: data[0] }));
                    }else{
                        return 
                    }
                    
                },error=>{
                    return a=1
                }).then((a) => {
                    if(a==1){
                        return this.afterHandleFlow('a','b');
                    }else{
                        return this.sendReq(requestUri, startWorkflowTo);
                    }
                    
                });
            });
        });
    }
    // 获取下一环节的办理人
    getNextPointHandleRes(selectResourceListUri, nextPoint) {
        // 判断下一环节是否选人
        return new Promise((resolve, reject) => {// 选人
            if (nextPoint.config.modalSelect) {
                this.http.get(ENV.httpurl + selectResourceListUri).subscribe(resp => {
                    let list = [];
                    list = resp['targetObjects'].data
                    if (list.length > 1) {
                        // 弹出模态框还是怎么选
                        let chooseMOdel = this.modalCtrl.create('SelectPeoplePage', { selectResourceListUri: selectResourceListUri, nextPoint: nextPoint });
                        chooseMOdel.onDidDismiss(data => {
                            if (data.length > 0) {
                                resolve(data)
                            } else {
                                reject("fail")
                            }
                        })
                        chooseMOdel.present();
                    } else {
                        if (!!resp['targetObjects'].data[0]) {
                            let list = resp['targetObjects'].data;
                            let userId = resp['resourceTargetProp'];
                            list.push(userId);
                            resolve(list);
                        } else {
                            this.NativeService.showToast("环节未配置办理人，请联系管理员！").then(()=>{
                                this.NativeService.hideLoading();
                                reject("fail")
                                return;
                                
                            })
                        }
                    }
                });

            } else {// 不选择资源：默认提交给下一环节配置的所有人
                this.getNextPointAllRes(selectResourceListUri, nextPoint).subscribe(data => {
                    resolve(data)
                })
            }
        })
    }
    // 获取下一环节的所有资源列表
    getNextPointAllRes(selectResourceListUri: any, nextPoint: any): Observable<any> {
        return Observable.create(observer => {
            // let data = [
            //     [], ''
            // ]
            let userId;
            let result = [];
            let resList = nextPoint.listResource;
            if (resList && resList.length > 0) {
                this.http.get(ENV.httpurl + selectResourceListUri).subscribe(resp => {
                    let d = resp;
                    if (d && d['columnDef']) {
                        userId = d['resourceTargetProp'];
                        result = d['targetObjects'].data;
                        // data[0] = d['targetObjects'].data;
                        // data[1] = d['resourceTargetProp'];
                        result.push(userId)
                    }

                    observer.next(result);
                }, error => {
                    observer.error(false);
                });
            } else {
                observer.next(result.push(''));
            }
        });
    }
    // 设置下一环节资源
    setNextNotifyResList(data, nextPoint) {
        let list = [];
        let selected = data[0];
        let resourceTargetProp = data[1];
        let d = {};
        if (nextPoint.listResource.length > 0) {
            Object.assign(d, { resourceId: nextPoint.listResource[0].id });
        }
        if (resourceTargetProp && resourceTargetProp === 'userId') {
            Object.assign(d, { resourceTargetId: selected[resourceTargetProp] });
            list.push(d);
        } else {
            let dataNew = data.slice(0, data.length - 1);
            _.map(dataNew, (n) => {
                let e = { resourceId: d['resourceId'] };
                Object.assign(e, { resourceTargetId: n.userId });
                list.push(e);
            })
        }

        return list;
    }
    getListAllocateResInst() {
        return [{ resourceType: 'staff', resourceTargetId: JSON.parse(localStorage.getItem("objectList")).staff.userId, opinion: this.flowHandleHolder.opinion || '' }];
    }
    // 针对开启、提交的发送请求
    sendReq(uri, startWorkflowTo) {
        // 先保存业务表信息
        return new Promise((resolve, reject) => {
            if (this.flowHandleHolder.bizSaveRequest) {
                this.flowHandleHolder.bizSaveRequest().subscribe(data => {
                    resolve(data)
                })
            }
        }).then((businessKey) => {
            startWorkflowTo.workflowInstData = this.flowHandleHolder.wfData && this.flowHandleHolder.wfData(); // 暂时先存业务表实体
            startWorkflowTo.businessKey = businessKey;
            return new Promise((resolve, reject) => {
                this.http.post(ENV.httpurl + uri, startWorkflowTo).subscribe(data => {
                    resolve(data)
                },error=>{
                    resolve()
                })
            }).then(resp => {
                return this.afterHandleFlow(resp, startWorkflowTo);
            });
        })
    }
    // 保存业务表信息
    saveBizData() {
        return (this.flowHandleHolder.bizSaveRequest());
    }
    // 处理完流程后，发消息等
    afterHandleFlow(resp, startWorkflowTo) {
        this.NativeService.hideLoading();
        // if ($injector.has('$swFlowCommitListener')) {
        //     $injector.get('$swFlowCommitListener')(this.flowHandleHolder.holder, startWorkflowTo, resp.data);
        // }
        return resp;
    }
    // 回退、办结、终止
    notSelectFlow(btn) {

        var holder = btn.getHolder();
        let uri = actionUri + '/' + holder.wfInstId;
        let startWorkflowTo = {
            btnId: btn.id,
            listAllocateResInst: this.getListAllocateResInst(),
            pointId: ''
        };
        // 如果是回退：判断是否有自由回退
        if (btn.type === 'rollback') {
            return this.alerCtrl.create({
                title: "确认退回上一环节吗？",
                message: "",
                buttons: [
                    {
                        text: '取消',
                        handler: () => {
                        }
                    },
                    {
                        text: '确定',
                        handler: () => {
                            if (this.flowHandleHolder.procBackPoint && this.flowHandleHolder.procBackPoint({ btn })) {
                                return new Promise((resolve, reject) => {
                                    if (this.flowHandleHolder.procBackPoint && this.flowHandleHolder.procBackPoint({ btn })) {
                                        resolve(btn)
                                    }
                                }).then(point => {
                                    console.debug('回退到的环节', point);
                                    if (point) {
                                        startWorkflowTo.pointId = point['id'];
                                    }
                                }).then(() => {
                                    return this.notSelectFlowReq(uri, startWorkflowTo);
                                })
                            } else {
                                return this.notSelectFlowReq(uri, startWorkflowTo);
                            }

                        }
                    }
                ]
            }).present();
        } else if (btn.type === 'end') {
            return new Promise((resolve, reject) => {// 选人
                if (this.flowHandleHolder.beforeSelectRes) {
                    resolve("ok")
                }
            }).then(() => {
                return this.notSelectFlowReq(uri, startWorkflowTo);
            })
        } else {
            return this.notSelectFlowReq(uri, startWorkflowTo);
        }
    }

    // 回退、办结、终止的发送请求
    notSelectFlowReq(uri, startWorkflowTo) {
        return new Promise((resolve, reject) => {
            if (this.flowHandleHolder.bizSaveRequest) {
                this.flowHandleHolder.bizSaveRequest().subscribe(data => {
                    resolve(data)
                })
            }
        }).then((businessKey) => {
            startWorkflowTo.businessKey = businessKey;
            return new Promise((resolve, reject) => {
                this.http.post(ENV.httpurl + uri, startWorkflowTo).subscribe(data => {
                    resolve(data)
                })
            }).then(resp => {
                return this.afterHandleFlow(resp, startWorkflowTo);
            });
        })

    }





    /**
     * 判断是否是复合资源
     * @param {Object} point 环节
     */
    isCombinRes(point) {
        let resDefList = point.listResource;
        if (resDefList && resDefList.length > 0) {
            var resDef = resDefList[0];
            if (resDef && resDef.allocateSize !== 1 && (resDef.size > 1 || (resDef.size === 1 && resDef.sizeCondition === '>='))) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    /**
       * 
       * 判断某个环节复合资源是否满足：前提是复合资源
       * 
       * @param {Object} point 环节 
       * @param {Array} listPointInstTo 资源列表
       */
    checkEnoughRes(point, listPointInstTo) {
        let ba = false;
        let resDef = point.listResource[0];
        // 找到最新的环节id对应的资源列表
        // 当前环节的所有资源列表
        let currentResList = [];
        _.each(listPointInstTo, (r) => {
            if (r.pointInst.pointId === point.id) {
                currentResList = r.listResourceInst;
            }
        });
        // 当前环节已处理的数量
        let hasAllocateNum = _.filter(currentResList, r => r.resourceTargetId && r.allocated).length;
        // 提交给当前环节时，选的办理人数
        let currentTodoNum = _.filter(currentResList, r => r.resourceTargetId).length;
        if (resDef.allocateSize === 0) { // 所有人必须办理才能进入下一环节
            ba = hasAllocateNum === currentTodoNum - 1;
        } else { // allocateSize数量办理后可进入下一环节
            ba = hasAllocateNum === resDef.allocateSize - 1;
        }
        return ba;
    }
}
