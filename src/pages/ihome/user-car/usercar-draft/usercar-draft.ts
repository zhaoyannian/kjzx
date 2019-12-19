import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { globalData } from '../../../../icommon/provider/globalData';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { ENV } from '@env/environment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NativeService } from '../../../../icommon/provider/native';
import _ from 'lodash';
import { saveEntityUri9, wfAlias9 } from '../../../../icommon/provider/Constants';
import { SelectPersonPage } from '../../../imeeting/meetings/editor/selectPerson';

@IonicPage()
@Component({
    selector: 'page-usercar-draft',
    templateUrl: 'usercar-draft.html'
})
export class UserCarDraftPage {
    userinfor: any;
    editable: any;
    editingEntry: any = {};
    //表单
    myForm: FormGroup;
    tripType: boolean = false;
    driverEntourage: boolean = true;
    selfDriving: boolean = false;
    //流程信息
    wfAlias: any;
    wfHolderObj: any;
    btns: any;
    isTodo: any;
    opeType: any;
    //用车人数组
    userCarStaffs: any = [];
    state: any = ENV.httpurl;
    constructor(public modalCtrl: ModalController, public NativeService: NativeService, public alertCtrl: AlertController, public fb: FormBuilder, public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams) {
        this.userinfor = JSON.parse(localStorage.getItem("objectList"));
        this.editable = this.navParams.get("opeType") === 'view' ? false : true;
        this.opeType = this.navParams.get("opeType") === 'cre' ? true : false;
        this.myForm = this.fb.group({
            opinion: ['', [Validators.required]],
        });
        if (this.navParams.get("opeType") === 'cre') {// 创建
            Object.assign(this.editingEntry, {
                userId: this.userinfor.loginInfo.userId,
                userName: this.userinfor.loginInfo.userName,
                orgId: this.userinfor.staff.corpOrgId, //机构ID
                orgName: this.userinfor.deptTo.deptName, // 机构名称
                corpOrgId: this.userinfor.staff.corpOrgId, // 法人机构ID
                corpOrgName: this.userinfor.deptTo.deptName, // 法人机构名称
                procedureStatus: 'draft',
                createTime: new Date(),
                userNumber: 1,
                tripType: this.tripType == true ? this.editingEntry.tripType = "返程" : this.editingEntry.tripType = "单程",
                driverEntourage: this.driverEntourage == true ? this.editingEntry.driverEntourage = "否" : this.editingEntry.driverEntourage = "是",
                selfDriving: this.selfDriving == true ? this.editingEntry.selfDriving = "是" : this.editingEntry.selfDriving = "否"
            });

            //设置初始默认值
            let normalDate = new Date();
            let btime = normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getUTCDate() + " " + normalDate.getHours()  + ":" + normalDate.getUTCMinutes() + ":00";
            let etime = normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getUTCDate() + " " + (normalDate.getHours() + 4) + ":" + normalDate.getUTCMinutes() + ":00";
            this.editingEntry.outTimeNew =this.getInitDate(btime);
            this.editingEntry.endTimeNew =this.getInitDate(etime);
            this.editingEntry.goOutTimeNew =this.getInitDate(btime);
            this.editingEntry.goEndTimeNew =this.getInitDate(etime);
            this.editingEntry.backOutTimeNew =this.getInitDate(btime);
            this.editingEntry.backEndTimeNew =this.getInitDate(etime);
        } else {
            this.editingEntry = this.navParams.get("entry");
            this.editingEntry.updateId = this.userinfor.loginInfo.userId;
            this.editingEntry.updateName = this.userinfor.loginInfo.userName;
            this.editingEntry.updateTime = new Date();

            this.editingEntry.tripType == "单程" ? this.tripType = false : this.tripType = true;
            this.editingEntry.driverEntourage == "是" ? this.driverEntourage = false : this.driverEntourage = true;
            this.editingEntry.selfDriving = "否" ? this.selfDriving = false : this.selfDriving = true;
            

            if (!!this.editingEntry.isMessage) {
                this.editingEntry.isMessageNew = this.editingEntry.isMessage.split(',');
            }
            //单程  出发-结束时间
            if (!!this.editingEntry.outTime) {
                this.editingEntry.outTimeNew = this.getDate(this.editingEntry.outTime);
            }
            if (!!this.editingEntry.endTime) {
                this.editingEntry.endTimeNew = this.getDate(this.editingEntry.endTime);
            }
            //往返 去 - 出发-结束时间
            if (!!this.editingEntry.goOutTime) {
                this.editingEntry.goOutTimeNew = this.getDate(this.editingEntry.goOutTime);
            }
            if (!!this.editingEntry.goEndTime) {
                this.editingEntry.goEndTimeNew = this.getDate(this.editingEntry.goEndTime);
            }
            //往返 回 - 出发-结束时间
            if (!!this.editingEntry.backOutTime) {
                this.editingEntry.backOutTimeNew = this.getDate(this.editingEntry.backOutTime);
            }
            if (!!this.editingEntry.backEndTime) {
                this.editingEntry.backEndTimeNew = this.getDate(this.editingEntry.backEndTime);
            }
            if (this.editingEntry.useCarUserId) {
                this.getUsers();
            }
        }
    }
    getUsers() {
        let userIds = this.editingEntry['useCarUserId'].split(',');
        this.http.post(ENV.httpurl + '/api/staff/queryStaffsInUserIds', userIds).subscribe(async data => {
            this.userCarStaffs = data;
        })
    }
    getInitDate(time){
        return new Date((new Date(Date.parse(time.replace(/-/g, "/"))).getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString();
    }
    getDate(date) {
        let normalDate = new Date(date);
        let time = normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getUTCDate() + " " + normalDate.getHours() + ":" + normalDate.getUTCMinutes() + ":" + normalDate.getUTCSeconds();
        return new Date((new Date(Date.parse(time.replace(/-/g, "/"))).getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString();
    }
    //修改日期
    getSaveDate(dateNew) {
        let de = new Date(dateNew);
        return new Date(de.getTime() - 8 * 60 * 60 * 1000);
    }

    ionViewDidEnter() {
        this.wfHolder();
    }

    // 获取工作流配置、实例信息
    wfHolder() {
        this.globalData.getHolderFromWfAliasRef(wfAlias9, this.navParams.get("ref"), null).subscribe(async data => {
            this.wfHolderObj = this.globalData.compOtherInfo(data);
            this.btns = this.wfHolderObj.btns()
            this.isTodo = this.wfHolderObj.isTodo()
            this.globalData.setProc(this.wfHolderObj.btns())
        })
    }

    // 流程处理
    manage(btn) {
        let self = this;
        if (this.userCarStaffs.length < 0 || !this.editingEntry.useCarUserName) {
            this.NativeService.showAlert('请选择用车人！');
            return;
        }
        if (!this.editingEntry.reason) {
            this.NativeService.showAlert('请填写用车事由！');
            return;
        }
        if (this.editingEntry.tripType === '单程') {
            if (!this.editingEntry.startPlace) {
                this.NativeService.showAlert('请填写出车地点！');
                return;
            }
            if (!this.editingEntry.arrivePlace) {
                this.NativeService.showAlert('请填写到达地点！');
                return;
            }
            if (!this.editingEntry.outTimeNew || !this.editingEntry.endTimeNew) {
                this.NativeService.showAlert('请重新选择出发时间或结束时间！');
                return;
            }
        } else {
            if (this.editingEntry.driverEntourage === '否') {
                if (!this.editingEntry.goStartPlace) {
                    this.NativeService.showAlert('请填写去程出车地点！');
                    return;
                }
                if (!this.editingEntry.goArrivePlace) {
                    this.NativeService.showAlert('请填写去程到达地点！');
                    return;
                }
                if (!this.editingEntry.backStartPlace) {
                    this.NativeService.showAlert('请填写返程出车地点！');
                    return;
                }
                if (!this.editingEntry.backArrivePlace) {
                    this.NativeService.showAlert('请填写返程到达地点！');
                    return;
                }
                if (!this.editingEntry.goOutTimeNew || !this.editingEntry.goEndTimeNew ||!this.editingEntry.backOutTimeNew||!this.editingEntry.backEndTimeNew) {
                    this.NativeService.showAlert('请重新选择出发时间或结束时间！');
                    return;
                }
            } else {
                if (!this.editingEntry.goStartPlace) {
                    this.NativeService.showAlert('请填写出车地点！');
                    return;
                }
                if (!this.editingEntry.goArrivePlace) {
                    this.NativeService.showAlert('请填写到达地点！');
                    return;
                }
                if (!this.editingEntry.goOutTimeNew || !this.editingEntry.goEndTimeNew) {
                    this.NativeService.showAlert('请重新选择出发时间或结束时间！');
                    return;
                }
            }
        }

        btn.proc(this.myForm.value.opinion, () => self.sureSub(), () => self.getWfData(), () => self.lastDo(), () => self.beforeSelectRes(), (selected) => self.afterSelectRes(selected), () => self.getNextPoint(), () => self.procBackPoint());
    }
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
        this.NativeService.showToast("操作成功").then(()=>{
            setTimeout(() => {
              this.navCtrl.pop()
            },800)
          })
        // this.navCtrl.pop();  // 流程提交后 返回的页面
    }

    // 保存业务表数据
    sureSub(): Observable<any> {
        return Observable.create(observer => {
            let self = this;
            if (this.editingEntry.isMessageNew) {
                this.editingEntry.isMessage = this.editingEntry.isMessageNew.join(',');
            }
            //单程  出发-结束时间
            if (this.editingEntry.tripType == "单程" && !!this.editingEntry.outTimeNew) {
                this.editingEntry.outTime = this.getSaveDate(this.editingEntry.outTimeNew);
            }
            if (this.editingEntry.tripType == "单程" && !!this.editingEntry.endTimeNew) {
                this.editingEntry.endTime = this.getSaveDate(this.editingEntry.endTimeNew);
            }
            //往返 去 - 出发-结束时间
            if (this.editingEntry.tripType == "往返" && !!this.editingEntry.goOutTimeNew) {
                this.editingEntry.goOutTime = this.getSaveDate(this.editingEntry.goOutTimeNew);
            }
            if (this.editingEntry.tripType == "往返" && !!this.editingEntry.goEndTimeNew) {
                this.editingEntry.goEndTime = this.getSaveDate(this.editingEntry.goEndTimeNew);
            }
            //往返 回 - 出发-结束时间
            if (this.editingEntry.tripType == "往返" &&this.editingEntry.driverEntourage == "否" &&!!this.editingEntry.backOutTimeNew) {
                this.editingEntry.backOutTime = this.getSaveDate(this.editingEntry.backOutTimeNew);
            }
            if (this.editingEntry.tripType == "往返" &&this.editingEntry.driverEntourage == "否" && !!this.editingEntry.backEndTimeNew) {
                this.editingEntry.backEndTime = this.getSaveDate(this.editingEntry.backEndTimeNew);
            }
            if (this.editingEntry.tripType == "单程") {
                //展示用出发时间
                this.editingEntry.showOutTime = this.editingEntry.outTime;
                //展示用结束时间
                this.editingEntry.showEndTime = this.editingEntry.endTime;

                this.editingEntry.showStartPlace = this.editingEntry.startPlace;
                this.editingEntry.showArrivePlace = this.editingEntry.arrivePlace;
                
            } else {
                if (this.editingEntry.driverEntourage == "是") {
                    //展示用出发时间
                    this.editingEntry.showOutTime = this.editingEntry.goOutTime;
                    //展示用结束时间
                    this.editingEntry.showEndTime = this.editingEntry.goEndTime;

                    this.editingEntry.showStartPlace = this.editingEntry.goStartPlace;
                    this.editingEntry.showArrivePlace = this.editingEntry.goArrivePlace;
                } else {
                    //展示用出发时间
                    this.editingEntry.showOutTime = this.editingEntry.goOutTime;
                    //展示用结束时间
                    this.editingEntry.showEndTime = this.editingEntry.backEndTime;

                    this.editingEntry.showStartPlace = this.editingEntry.goStartPlace;
                    this.editingEntry.showArrivePlace = this.editingEntry.goArrivePlace;
                }
            }
            return self.http.post(ENV.httpurl + saveEntityUri9, self.editingEntry).subscribe(resp => {
                self.editingEntry.id = resp['id']; // 将id重置回去，为了wfData获取数据
                observer.next(resp['businessKey']);// 在流程提交组件里获取
            }, error => {
                observer.error(false);
            });
        });
    }
    // 暂存（有流程）/保存（无流程）
    saveAndReturn() {
        this.sureSub().subscribe(data => {
            this.NativeService.showToast("操作成功").then(()=>{
                setTimeout(() => {
                  this.navCtrl.pop()
                },800)
              })
        }, error => {
        })
    }

    // 获取保存到流程实例workflowInstData字段中的数据，建议保存关联键（主键id）
    getWfData() {
        return { bizId: this.editingEntry.id };
    }

    //选择用车人员
    selectPerson() {
        this.navCtrl.push(SelectPersonPage, { 'callback': this.staffBackFunction, 'meetingStaff': this.userCarStaffs ,'defaultPerson':true});
    }
    //人员信息对应
    staffBackFunction = (params) => {
        return new Promise((resolve, reject) => {
            if (typeof (params) != 'undefined') {
                resolve('ok');
                if (!!params.dataList) {
                    this.userCarStaffs = params.dataList;

                    if (this.userCarStaffs.length > 0) {
                        this.editingEntry.useCarUserName = _.map(this.userCarStaffs, (n) => n.userName).join(',');
                        this.editingEntry.useCarUserId = _.map(this.userCarStaffs, (n) => n.userId).join(',');
                        this.editingEntry.deptName = this.userCarStaffs[0].deptName;
                        this.editingEntry.deptId = this.userCarStaffs[0].deptId;
                        this.editingEntry.useCarUserPhone = this.userCarStaffs[0].officeTel;
                        this.editingEntry.userNumber = this.userCarStaffs.length;
                    }
                }
            } else {
                reject(Error('error'))
            }
        });
    }
    /**
    * 删除参会人员
    * @param i 下标
    */
    deletePeer2(i) {
        console.log(this.userCarStaffs.splice(i, 1));
        if (this.userCarStaffs.length > 0) {
            this.editingEntry.useCarUserName = _.map(this.userCarStaffs, (n) => n.userName).join(',');
            this.editingEntry.useCarUserId = _.map(this.userCarStaffs, (n) => n.userId).join(',');
            this.editingEntry.deptName = this.userCarStaffs[0].deptName;
            this.editingEntry.deptId = this.userCarStaffs[0].deptId;
            this.editingEntry.useCarUserPhone = this.userCarStaffs[0].officeTel;
            this.editingEntry.userNumber = this.userCarStaffs.length;
        }else{
            this.editingEntry.useCarUserName = '';
            this.editingEntry.useCarUserId = '';
            this.editingEntry.deptName = '';
            this.editingEntry.deptId = '';
            this.editingEntry.useCarUserPhone = '';
            this.editingEntry.userNumber = 1;
        }
    }

    //设置行程类型
    changeTripType() {
        this.tripType == true ? this.editingEntry.tripType = "往返" : this.editingEntry.tripType = "单程";
    }
    changeDriver() {
        this.driverEntourage == true ? this.editingEntry.driverEntourage = "否" : this.editingEntry.driverEntourage = "是";
    }
    //选择是否自驾
    changeSelfDriving(){
        this.selfDriving == false ? this.editingEntry.selfDriving = "否" : this.editingEntry.selfDriving = "是";
    }
    //增加乘车人数
    addNum() {
        this.editingEntry.userNumber = parseInt(this.editingEntry.userNumber) + 1;
    }
    //减少乘车人数
    reduceNum() {
        this.editingEntry.userNumber = parseInt(this.editingEntry.userNumber) - 1;
    }
    //手动填写乘车人数
    changeNum(){
        if(parseInt(this.editingEntry.userNumber)<1 || !this.editingEntry.userNumber){
            this.editingEntry.userNumber = 1;
        }
    }
    //判断时间
    changeTime() {
        if (this.editingEntry.tripType == "单程") {
            if (!!this.editingEntry.outTimeNew && !!this.editingEntry.endTimeNew) {
                if (this.editingEntry.outTimeNew > this.editingEntry.endTimeNew) {
                    this.NativeService.showAlert('结束时间不能小于出发时间，请重新选择结束时间！');
                    this.editingEntry.endTimeNew = '';
                    return;
                }
            }
        } else {
            if (this.editingEntry.driverEntourage == "是") {
                if (!!this.editingEntry.goOutTimeNew && !!this.editingEntry.goEndTimeNew) {
                    if (this.editingEntry.goOutTimeNew > this.editingEntry.goEndTimeNew) {
                        this.NativeService.showAlert('结束时间不能小于出发时间，请重新选择结束时间！');
                        this.editingEntry.goEndTimeNew = '';
                        return;
                    }
                }
            } else {
                if (!!this.editingEntry.goOutTimeNew && !!this.editingEntry.goEndTimeNew) {
                    if (this.editingEntry.goOutTimeNew > this.editingEntry.goEndTimeNew) {
                        this.NativeService.showAlert('去程结束时间不能小于出发时间，请重新选择结束时间！');
                        this.editingEntry.goEndTimeNew = '';
                        return;
                    }
                }
                if (!!this.editingEntry.goEndTimeNew && !!this.editingEntry.backOutTimeNew) {
                    if (this.editingEntry.goEndTimeNew > this.editingEntry.backOutTimeNew) {
                        this.NativeService.showAlert('去程结束时间不能大于返程出发时间，请重新选择返程出发时间！');
                        this.editingEntry.backOutTimeNew ='';
                        return;
                    }
                }
                if (!!this.editingEntry.backOutTimeNew && !!this.editingEntry.backEndTimeNew) {
                    if (this.editingEntry.backOutTimeNew > this.editingEntry.backEndTimeNew) {
                        this.NativeService.showAlert('返程结束时间不能小于出发时间，请重新选择结束时间！');
                        this.editingEntry.backEndTimeNew ='';
                        return;
                    }
                }
            }
        }
    }
    goback(){
        this.navCtrl.pop();
      }
}