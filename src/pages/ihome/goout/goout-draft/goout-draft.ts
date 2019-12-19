import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { globalData } from '../../../../icommon/provider/globalData';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { weekList } from '../../../../icommon/provider/utils';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { saveEntityUri6, wfAlias6 } from '../../../../icommon/provider/Constants'
import { NativeService } from '../../../../icommon/provider/native';
import { CalendarModal, CalendarModalOptions, } from 'ion2-calendar'
import { Observable } from 'rxjs/Rx';
import { Keyboard } from '@ionic-native/keyboard';
import _ from 'lodash';

@IonicPage()
@Component({
    selector: 'page-goout-draft',
    templateUrl: 'goout-draft.html',
})
export class GooutDraftPage {
    userinfor: any;
    editable: any;
    defaultValue: any;
    weekab: any;
    weekab2: any;
    myForm: FormGroup;
    editingEntry: any = {};
    ismobile: boolean = false;
    startHour: boolean = true;
    endHour: boolean = true;
    //流程信息
    wfAlias: any;
    wfHolderObj: any;
    btns: any;
    isTodo: any;
    datamore: any = {};
    date: Date = new Date();
    isBack:boolean = true;
    isDeptManager:boolean= false;
    isManager:boolean= false;
    constructor(private keyboard: Keyboard, public modalCtrl: ModalController, public NativeService: NativeService,public fb: FormBuilder, public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams) {
        this.userinfor = JSON.parse(localStorage.getItem("objectList"));
        this.editable = this.navParams.get("opeType") === 'view' ? false : true;
        this.defaultValue = new Date((new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString();
        this.weekab = '';
        this.weekab2 = '';
        if (this.NativeService.isAndroid()) {
            this.ismobile = true;
        }
        this.myForm = this.fb.group({
            opinion: ['', [Validators.required]],
        });
        let roles = this.userinfor.rolesTo ? _.map(this.userinfor.rolesTo, 'roleType') : [];
        this.isDeptManager = _.includes(roles, 'Dept_Leader') ? true : false;
        this.isManager = _.includes(roles, 'jituanfuzong') ? true : false;

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
                procedureStatus: this.isDeptManager || this.isManager ? 'complate' : 'draft',
                isBack: "yes",
                applyDate: new Date(),
                startType: this.startHour == true ? this.editingEntry.startType = "A" : this.editingEntry.startType = "P",
                endType: this.endHour == true ? this.editingEntry.endType = "A" : this.editingEntry.endType = "P"
            });
        } else {
            this.editingEntry = this.navParams.get("entry");
            if (!!this.editingEntry.startDate) {
                this.weekab = weekList[new Date(this.editingEntry.startDate).getDay()];
            }
            if (!!this.editingEntry.endDate) {
                this.weekab2 = weekList[new Date(this.editingEntry.endDate).getDay()];
            }

            this.editingEntry.startType == "A" ? this.startHour = true : this.startHour = false;
            this.editingEntry.endType == "A" ? this.endHour = true : this.endHour = false;
            this.editingEntry.isBack =="yes" ? this.isBack = true : this.isBack = false;
        }

    }
    
    ionViewDidEnter() {
        this.wfHolder();

        let that = this;
        that.keyboard.onKeyboardWillHide().subscribe(data => {
            console.log(data)
            if (that.NativeService.isAndroid()) {
                that.datamore.btnscroll = false;
                that.datamore.btnscollHeight = 0;
            }
        })
    }
    blurInput() {
        let that = this;
        that.datamore.btnscroll = true;
        this.keyboard.onKeyboardShow().subscribe(data => {
            if (that.NativeService.isAndroid()) {
                //   that.datamore.btnscroll = true;
                that.datamore.btnscollHeight = data.keyboardHeight;
            }
        })
        if (that.datamore.btnscollHeight > 0) {
        } else {
            that.datamore.btnscollHeight = 267
        }
    }
    // 获取工作流配置、实例信息
    wfHolder() {
        this.globalData.getHolderFromWfAliasRef(wfAlias6, this.navParams.get("ref"), null).subscribe(async data => {
            this.wfHolderObj = this.globalData.compOtherInfo(data);
            this.btns = this.wfHolderObj.btns()
            this.isTodo = this.wfHolderObj.isTodo()
            this.globalData.setProc(this.wfHolderObj.btns())
        })
    }
    //设置是否返回
    changeIsBack(){
        this.isBack == true ? this.editingEntry.isBack = "yes" : this.editingEntry.isBack = "no";
    }
    savestartHour() {
        console.log(this.startHour)
        //   下午是false；上午是true
        let that = this;
        this.startHour == true ? this.editingEntry.startType = "A" : this.editingEntry.startType = "P";
        that.setDays();
    }
    saveendHour() {
        console.log(this.endHour)
        //   下午是false；上午是true
        let that = this;
        this.endHour == true ? this.editingEntry.endType = "A" : this.editingEntry.endType = "P";
        that.setDays();
    }
    onChangeleaveStart(ev: any) {
        this.weekab = weekList[new Date(this.editingEntry.startDate).getDay()];
    }
    onChangeleaveEnd(ev: any) {
        this.weekab2 = weekList[new Date(this.editingEntry.endDate).getDay()];
    }
    //请假时间选择判断
    setDays() {
        let start = this.editingEntry.startDate;
        let end = this.editingEntry.endDate;
        let startHour = this.editingEntry.startType;
        let endHour = this.editingEntry.endType;
        if (!!start && !!end) {
            let startTime = start;
            let endTime = end;
            if (startTime > endTime) {
                this.NativeService.showAlert('结束时间不能在开始时间之前！');
                this.editingEntry.goOutDays = 0;
            } else if (startTime === endTime) {
                if (startHour === endHour) {
                    this.editingEntry.goOutDays = 0.5;
                } else if (startHour === 'A' && endHour === 'P') {
                    this.editingEntry.goOutDays = 1;
                } else {
                    this.NativeService.showAlert('时间选择错误，请重新选择！');
                    this.editingEntry.goOutDays = 0;
                }
            } else {
                let days = (endTime - startTime) / (24 * 3600 * 1000);
                if (startHour === endHour) {
                    this.editingEntry.goOutDays = (days + 0.5);
                } else if (startHour === 'A' && endHour === 'P') {
                    this.editingEntry.goOutDays = (days + 1);
                } else {
                    this.editingEntry.goOutDays = days;
                }
            }
        }
    }
    openCalendar(dateType) {
        if (this.editable) {
            const options: CalendarModalOptions = {
                title: '选择日期',
                defaultDate: this.date,
                monthFormat: 'YYYY 年 MM 月 DD日 ',
                weekdays: ['日', '一', '二', '三', '四', '五', '六'],
                weekStart: 0,
                closeLabel: '关闭',
                doneLabel: '确定',
                defaultScrollTo: this.date
            };
            let myCalendar = this.modalCtrl.create(CalendarModal, {
                options: options
            });
            myCalendar.present();
            myCalendar.onDidDismiss((date, type) => {
                if (type === 'done') {
                    switch (dateType) {
                        case "startDate":
                            this.editingEntry.startDate = date.time;
                            this.weekab = weekList[new Date(this.editingEntry.startDate).getDay()];
                            this.setDays()
                            break;
                        case "endDate":
                            this.editingEntry.endDate = date.time;
                            this.weekab2 = weekList[new Date(this.editingEntry.endDate).getDay()];
                            this.setDays()
                            break;
                    }

                }
            })
        }
    }
    //流程操作
    manage(btn, opinion) {
        if(!this.editingEntry.outInfo){
            this.NativeService.showAlert('请填写外出原因！');
            return; 
        }
        if (!this.editingEntry.address) {
            this.NativeService.showAlert('请填写外出地点！');
            return;
        }
        if(!this.editingEntry.startDate){
            this.NativeService.showAlert('请选择开始日期！');
            return; 
        }
        if(!this.editingEntry.endDate){
            this.NativeService.showAlert('请选择结束日期！');
            return; 
        }
        if(!this.editingEntry.isBack){
            this.NativeService.showAlert('请选择是否返回！');
            return; 
        }
        btn.proc(this.myForm.value.opinion, () => this.sureSub(), () => this.getWfData(), () => this.lastDo(), () => this.beforeSelectRes(), (selected) => this.afterSelectRes(selected), () => this.getNextPoint());
    }
    //保存业务表数据
    sureSub(): Observable<any> {
        return Observable.create(observer => {
            var self = this;
            return self.http.post(ENV.httpurl + saveEntityUri6, self.editingEntry).subscribe(resp => {
                self.editingEntry.id = resp['id']; // 将id重置回去，为了wfData获取数据
                observer.next(resp['businessKey']);// 在流程提交组件里获取
            }, error => {
                observer.error(error);
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

    // 选人之前处理，没有什么处理时，可以不写返回值
    beforeSelectRes() {

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
          }) // 流程提交后 返回的页面
    }
    // 获取保存到流程实例workflowInstData字段中的数据，建议保存关联键（主键id）
    getWfData() {
        return {
            bizId: this.editingEntry.id
        };
    }
    goback(){
        this.navCtrl.pop();
      }
}