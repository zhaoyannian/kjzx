import { NativeService } from './../../../../icommon/provider/native';
import { saveEntityUri, queryStaffsUri, queryDeptsUri, uuid } from './../../../../icommon/provider/Constants';
import { Component } from '@angular/core'
import { NavController, NavParams, ModalController, AlertController, Events, ViewController } from 'ionic-angular'
import { HttpClient } from '@angular/common/http'
import { WorkhoursEditMxPage } from './eidtDraftMx';
import _ from 'lodash';
import { Observable } from 'rxjs/Rx';
import { ENV } from '@env/environment';
import { globalData } from './../../../../icommon/provider/globalData';
import { wfAlias } from '../../../../icommon/provider/Constants';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { weekList } from '../../../../icommon/provider/utils';
import { Keyboard } from '@ionic-native/keyboard';
@Component({
    selector: "page-editworkhours",
    templateUrl: 'editDraft.html'
})

export class WorkhoursEditPage {
    editingEntry: any = {};
    callback2;
    projectList: any;
    userinfor: any;
    informantsList: any = [];
    selectedDeptInfo: any = [];
    totalDate: any = 0;
    editable: any;
    // detailTmpEntity:any ={};
    wfHolderObj: any;
    btns: any;
    isTodo: any;
    defaultValue: any;
    collspaed: any;
    myForm: FormGroup;
    weekab: any;
    datamore: any = {}
    ismobile: boolean = false;
    btnScroll: boolean = false;
    btnscollHeight: any;
    opinion: any;
    toggle: any;
    constructor(private viewCtrl: ViewController, private keyboard: Keyboard, private alerCtrl: AlertController, public globalData: globalData, public NativeService: NativeService, public modalCtrl: ModalController, public NavCtrl: NavController, public http: HttpClient, public navParams: NavParams, public fb: FormBuilder, private events: Events, ) {
        this.userinfor = JSON.parse(localStorage.getItem("objectList"));
        this.editable = this.navParams.get("opeType") === 'view' ? false : true;
        this.toggle = this.navParams.get("toggle");
        // this.defaultValue = new Date().toISOString();
        this.defaultValue = new Date((new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString();
        this.weekab = weekList[new Date().getDay()];
        if (this.NativeService.isAndroid()) {
            this.ismobile = true;
        }
        this.collspaed = true;
        // this.myForm = this.fb.group({
        //     opinion: ['', [Validators.required]],
        // });
        if (this.navParams.get("opeType") === 'cre') { // 创建
            Object.assign(this.editingEntry, {
                userId: this.userinfor.loginInfo.userId, // 创建人ID
                userName: this.userinfor.loginInfo.userName, //创建人名字
                deptId: this.userinfor.deptTo.deptId, //创建人部门ID
                deptName: this.userinfor.deptTo.deptName, //创建人部门名
                orgId: this.userinfor.staff.corpOrgId, //机构ID
                orgName: this.userinfor.deptTo.deptName, // 机构名称
                corpOrgId: this.userinfor.staff.corpOrgId, // 法人机构ID
                corpOrgName: this.userinfor.deptTo.deptName, // 法人机构名称
                procedureStatus: 'draft',
                startDate: this.defaultValue,
                remark: '',
                devices: [],
            });
            let curUser = {
                id: this.userinfor.loginInfo.id,
                userId: this.userinfor.loginInfo.userId,
                userName: this.userinfor.loginInfo.userName
            };
            this.informantsList.push(curUser);
            let curDept = {
                id: this.userinfor.deptTo.id,
                deptId: this.userinfor.deptTo.deptId,
                deptName: this.userinfor.deptTo.deptName
            };
            this.selectedDeptInfo.push(curDept);
        } else {
            this.editingEntry = this.navParams.get("entry");

            // 采购明细的ng-repeat 需要一个‘主键来区分’ 添加
            if (!!this.editingEntry.startDate && typeof (this.editingEntry.startDate) == 'number') {
                this.weekab = weekList[new Date(this.editingEntry.startDate).getDay()];
                // this.editingEntry.startDate = new Date(this.editingEntry.startDate).toISOString();
                this.editingEntry.startDate = new Date((this.editingEntry.startDate - (new Date().getTimezoneOffset() * 60 * 1000))).toISOString()
            } else {
                let time =new Date((Date.parse(this.editingEntry.startDate) +(new Date().getTimezoneOffset() * 60 * 1000))).toISOString()
                // this.editingEntry.startDate = new Date((Date.parse(this.editingEntry.startDate) - (new Date().getTimezoneOffset() * 60 * 1000))).toISOString()
                this.weekab = weekList[new Date(time).getDay()];
            }
            if (!!this.editingEntry.devices) {
                _.map(this.editingEntry.devices, (device) => {
                    device.detailId = device.id;
                    this.totalDate = (parseFloat(this.totalDate) + parseFloat(device.projectDate)).toFixed(1)
                });
            }
            this.getStaffs();
            this.getDepts();
        }
    }
    blurInput() {
        let that = this;
        that.btnScroll = false;
        that.btnscollHeight = 0;
    }
    focusInput() {
        let that = this;
        that.btnScroll = true;
        that.keyboard.onKeyboardShow().subscribe(data => {
            if (that.NativeService.isAndroid()) {
                that.btnScroll = true;
                that.btnscollHeight = data.keyboardHeight;
            }
        })
        if (that.btnscollHeight > 0) {
        } else {
            that.btnscollHeight = 267
        }
    }
    dismiss() {
        this.events.publish('tabs:AllData', 'AllData');
        this.viewCtrl.dismiss(this.editingEntry.startDate);
    }
    ionViewDidEnter() {
        this.wfHolder()
        let that = this;
        that.opinion = '';
        that.keyboard.onKeyboardWillHide().subscribe(data => {
            if (that.NativeService.isAndroid()) {
                that.datamore.btnscroll = false;
                that.datamore.btnscollHeight = 0;
            }
        })
    }
    // 获取工作流配置、实例信息
    wfHolder() {
        this.globalData.getHolderFromWfAliasRef(wfAlias, this.navParams.get("ref"), null).subscribe(async data => {
            this.wfHolderObj = this.globalData.compOtherInfo(data);
            this.btns = this.wfHolderObj.btns()
            this.isTodo = this.wfHolderObj.isTodo()
            this.globalData.setProc(this.wfHolderObj.btns())
        })
    }
    // 流程处理
    manage = _.throttle(function (btn) {
        let self = this;
        if (self.editingEntry.startDate) {
            if (self.totalDate > 1) {
                self.NativeService.showAlert('项目总用时不能大于一天，请重新填写！');
                return
            } else if (self.totalDate == 0) {
                self.NativeService.showAlert('请填写项目用时明细！');
                return
            }
        } else {
            self.NativeService.showAlert('请选择日期！');
            return;
        }
        if (self.wfHolderObj.opinionRequired()) {
            if (self.opinion.length == 0) {
                self.NativeService.showAlert('请填写办理意见！');
                return;
            }
        }
        btn.proc(self.opinion, () => self.sureSub(), () => self.getWfData(), () => self.lastDo(), () => self.beforeSelectRes(), (selected) => self.afterSelectRes(selected), () => self.getNextPoint(), () => self.procBackPoint());
        self.NativeService.showLoading(); // 
    },1500)
    // 选人之前处理，没有什么处理时，可以不写返回值
    beforeSelectRes() {
        return {}
    }
    procBackPoint() {
        return {}
    }
    // 选人之后处理
    afterSelectRes(selected) {
        console.debug('选择的人....', selected);
    }
    // 获取下一环节，默认提交给下一环节，可以不写返回值
    getNextPoint() {

    }
    // 提交流程后的操作
    lastDo() {
        this.NativeService.showToast("操作成功").then(() => {
            setTimeout(() => {
                if (this.toggle == 'awiatData') {
                    this.events.publish('tabs:awiatData', 'awiatData','');
                } else if (this.toggle == 'complateData') {
                    this.events.publish('tabs:complateData', 'complateData','');
                } else if (this.toggle == 'AllData') {

                    this.events.publish('tabs:AllData', 'AllData','');
                }
                // this.NavCtrl.pop()
                this.viewCtrl.dismiss();
            }, 800)
        })
        // this.NavCtrl.pop();  // 流程提交后 返回的页面
    }
    // 保存业务表数据
    sureSub(): Observable<any> {
        return Observable.create(observer => {
            let self = this;
            self.editingEntry.informantIds = self.informantsList && self.informantsList.length > 0 ? _.map(self.informantsList, 'userId').join(',') : '';
            self.editingEntry.informants = self.informantsList && self.informantsList.length > 0 ? _.map(self.informantsList, 'userName').join(',') : '';
            self.editingEntry.deptNameIds = self.selectedDeptInfo && self.selectedDeptInfo.length > 0 ? _.map(self.selectedDeptInfo, 'deptId').join(',') : '';
            self.editingEntry.deptNames = self.selectedDeptInfo && self.selectedDeptInfo.length > 0 ? _.map(self.selectedDeptInfo, 'deptName').join(',') : '';
            if (self.editingEntry.startDate) {
                if (self.totalDate > 1) {
                    self.NativeService.showAlert('项目总用时不能大于一天，请重新填写！');
                    return
                } else if (self.totalDate == 0) {
                    self.NativeService.showAlert('请填写项目用时明细！');
                    return
                }
            } else {
                self.NativeService.showAlert('请选择日期！');
                return;
            }
            this.editingEntry.totalDate = this.totalDate;
            this.editingEntry.startDate = new Date(Math.round(Date.parse(this.editingEntry.startDate)) + new Date().getTimezoneOffset() * 60 * 1000).toISOString();

            return self.http.post(ENV.httpurl + saveEntityUri, self.editingEntry).subscribe(resp => {
                self.NativeService.hideLoading();
                if(resp['businessKey'] == null){
                    //self.NativeService.showAlert('business 空提示!');
                    console.log('repeat submit');
                    observer.error(false);
                } else {
                    self.editingEntry.id = resp['id']; // 将id重置回去，为了wfData获取数据
                    observer.next(resp['businessKey']);// 在流程提交组件里获取
                }
            }, error => {
                self.NativeService.hideLoading();

                console.log('start error submit');

                observer.error(false);
            });
        });
    }
    // 暂存（有流程）/保存（无流程）
    saveAndReturn = _.debounce(function () {
        this.sureSub().subscribe(data => {
            if (this.toggle == 'awiatData') {
                this.events.publish('tabs:awiatData', 'awiatData','');
            } else if (this.toggle == 'complateData') {
                this.events.publish('tabs:complateData', 'complateData','');
            } else if (this.toggle == 'AllData') {

                this.events.publish('tabs:AllData', 'AllData','');
            }
            this.NativeService.showToast("保存成功").then(() => {
                setTimeout(() => {
                    // this.NavCtrl.pop()
                    this.viewCtrl.dismiss();
                }, 800)
            })
            // this.NavCtrl.push('WorkhoursPage', { 'alias': this.navParams.get("alias"), 'type': 1 });//1是新增
        }, error => {
        })
    }, 800)
    onChange(ev: any) {
        let time = new Date(Math.round(Date.parse(this.editingEntry.startDate)) + new Date().getTimezoneOffset() * 60 * 1000).toISOString();
        this.weekab = weekList[new Date(time).getDay()];


    }
    // 获取保存到流程实例workflowInstData字段中的数据，建议保存关联键（主键id）
    getWfData() {
        return { bizId: this.editingEntry.id };
    }
    delete(item, i) {
        this.alerCtrl.create({
            title: "确定删除吗？",
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
                        this.editingEntry.devices.forEach(element => {
                            if (element.id == item.id) {
                                this.totalDate = (parseFloat(this.totalDate) - parseFloat(element.projectDate)).toFixed(1)
                                this.editingEntry.devices.splice(i, 1);
                            }
                        });
                    }
                }
            ]
        }).present();

    }
    edit(item, i) {
        let profileModal = this.modalCtrl.create('EditProjectModalPage', { item: item });
        profileModal.onDidDismiss(data => {
            if (data) {
                item = data;
                this.totalDate = 0;
                this.editingEntry.devices.forEach(element => {
                    this.totalDate = (parseFloat(this.totalDate) + parseFloat(element.projectDate)).toFixed(1)
                });
            }
        });
        profileModal.present();
    }

    addWorkhoursMxFn() {
        let profileModal = this.modalCtrl.create(WorkhoursEditMxPage);
        profileModal.onDidDismiss(data => {
            if (data) {
                this.totalDate = (parseFloat(this.totalDate) + parseFloat(data.projectDate)).toFixed(1)
                data.detailId = uuid(); // 添加 "主键" 用于区分每条明细
                this.editingEntry.devices.push(data); // 数组操作
            }
        });
        profileModal.present();
        // this.NavCtrl.push(WorkhoursEditMxPage, { 'projectList': this.editingEntry.devices, 'callback2': this.myCallbackFunction })
    }
    myCallbackFunction = (params) => {
        return new Promise((resolve, reject) => {
            if (typeof (params) != 'undefined') {
                resolve('ok');
                params.projectList.forEach(element => {
                    this.totalDate = (parseFloat(this.totalDate) + parseFloat(element.projectDate)).toFixed(1)
                    element.detailId = uuid(); // 添加 "主键" 用于区分每条明细
                    this.editingEntry.devices.push(element); // 数组操作
                });
            } else {
                reject(Error('error'))
            }
        });
    }

    //初始化填报人
    getStaffs() {
        let ids = !!this.editingEntry.informantIds ? this.editingEntry.informantIds.split(',') : [];
        this.http.post(ENV.httpurl + queryStaffsUri, ids).subscribe(resp => {
            if (resp['data']) {
                this.informantsList = resp['data'];
            }
        }, error => {

        });
    }
    //初始化填报人所在部门
    getDepts() {
        let ids = !!this.editingEntry.deptNameIds ? this.editingEntry.deptNameIds.split(',') : [];
        return this.http.post(ENV.httpurl + queryDeptsUri, ids).subscribe(resp => {
            if (resp['data']) {
                this.selectedDeptInfo = resp['data'];
            }
        }, error => {

        });
    }
    goback() {
        this.NavCtrl.pop();
    }
}