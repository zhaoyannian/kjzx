import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { NativeService } from '../../../../icommon/provider/native';
import { globalData } from '../../../../icommon/provider/globalData';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { saveEntityUri8, wfAlias8 } from '../../../../icommon/provider/Constants';
import { Observable } from 'rxjs/Rx';
import { ENV } from '@env/environment';
import { weekList } from '../../../../icommon/provider/utils';
import { CalendarModal, CalendarModalOptions, } from 'ion2-calendar'

@IonicPage()
@Component({
    selector: 'page-evection-draft',
    templateUrl: 'evection-draft.html'
})
export class EvectionDraftPage {
    userinfor: any;
    editable: any;
    editingEntry: any = {};
    //表单
    myForm: FormGroup;
    //流程信息
    typeName: any;
    wfAlias: any;
    wfHolderObj: any;
    weekab: any;
    weekab2: any;
    date: Date = new Date();
    constructor(public NativeService: NativeService, public fb: FormBuilder, public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController) {
        this.userinfor = JSON.parse(localStorage.getItem("objectList"));
        this.editable = this.navParams.get("opeType") === 'view' ? false : true;

        this.myForm = this.fb.group({
            opinion: ['', [Validators.required]]
        });
        if (this.navParams.get("opeType") === 'cre') {
            Object.assign(this.editingEntry, {
                userId: this.userinfor.loginInfo.userId,
                userName: this.userinfor.loginInfo.userName,
                deptId: this.userinfor.deptTo.deptId, //创建人部门ID
                deptName: this.userinfor.deptTo.deptName, //创建人部门名
                orgId: this.userinfor.staff.corpOrgId, //机构ID
                orgName: this.userinfor.deptTo.deptName, // 机构名称
                corpOrgId: this.userinfor.staff.corpOrgId, // 法人机构ID
                corpOrgName: this.userinfor.deptTo.deptName, // 法人机构名称
                applyDate: new Date(),
                evApplyDate: new Date(),
                procedureStatus: 'draft'
            });
        } else {
            if (!!this.editingEntry.startDate) {
                this.weekab = weekList[new Date(this.editingEntry.evOutDate).getDay()];
            }
            if (!!this.editingEntry.endDate) {
                this.weekab2 = weekList[new Date(this.editingEntry.evBackDate).getDay()];
            }
        }
    }

    ionViewDidEnter() {
        this.wfHolder();
    }
    // 获取工作流配置、实例信息
    wfHolder() {
        this.globalData.getHolderFromWfAliasRef(wfAlias8, this.navParams.get("ref"), null).subscribe(async data => {
            this.wfHolderObj = this.globalData.compOtherInfo(data);
            this.globalData.setProc(this.wfHolderObj.btns())
        })
    }
    // 流程处理
    manage(btn) {
        let self = this;
        if (!this.editingEntry.evReason) {
            this.NativeService.showAlert('请填写出差事由！');
            return;
        }
        if (!this.editingEntry.evApplyDate) {
            this.NativeService.showAlert('请填写申请日期！');
            return;
        }
        if (!this.editingEntry.evOutDate) {
            this.NativeService.showAlert('请填写出差日期！');
            return;
        }
        if (!this.editingEntry.evBackDate) {
            this.NativeService.showAlert('请填写结束日期！');
            return;
        }
        if (!this.editingEntry.ecAddress) {
            this.NativeService.showAlert('请填写出差地点！');
            return;
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
          })  // 流程提交后 返回的页面
    }
    // 保存业务表数据
    sureSub(): Observable<any> {
        return Observable.create(observer => {
            let self = this;
            return self.http.post(ENV.httpurl + saveEntityUri8, self.editingEntry).subscribe(resp => {
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
                        case "evOutDate":
                            this.editingEntry.evOutDate = date.time;
                            this.weekab = weekList[new Date(this.editingEntry.evOutDate).getDay()];
                            this.setDays()
                            break;
                        case "evBackDate":
                            this.editingEntry.evBackDate = date.time;
                            this.weekab2 = weekList[new Date(this.editingEntry.evBackDate).getDay()];
                            this.setDays()
                            break;
                        case "evApplyDate":
                            this.editingEntry.evApplyDate = date.time;
                            break;
                    }

                }
            })
        }
    }
    //出差时间选择判断
    setDays() {
        let start = this.editingEntry.evOutDate;
        let end = this.editingEntry.evBackDate;
        if (!!start && !!end) {
            let startTime = start;
            let endTime = end;
            if (startTime > endTime) {
                this.NativeService.showAlert('结束时间不能在开始时间之前！');
                this.editingEntry.evNum = 0;
            } else if (startTime === endTime) {
                this.editingEntry.evNum = 1;
            } else {
                let days = (endTime - startTime) / (24 * 3600 * 1000);
                this.editingEntry.evNum = days+1;
            }
        }
    }
    goback(){
        this.navCtrl.pop();
      }
}