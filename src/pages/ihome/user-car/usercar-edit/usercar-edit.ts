import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { globalData } from '../../../../icommon/provider/globalData';
import { ENV } from '@env/environment';
import _ from 'lodash';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NativeService } from './../../../../icommon/provider/native';
import { Keyboard } from '@ionic-native/keyboard';
import { Events } from 'ionic-angular';
import { entryUri9, saveEntityUri9 } from '../../../../icommon/provider/Constants';
import { Observable } from 'rxjs/Rx';

@IonicPage()
@Component({
    selector: 'page-usercar-edit',
    templateUrl: 'usercar-edit.html'
})
export class UserCarEditPage {
    editable: any;
    editingEntry = {};
    update: any;
    //流程信息
    wfHolderObj: any;
    isTodo: any;
    btns: any;
    opinionList: any;
    //表单
    myForm: FormGroup;
    datamore: any = {};
    tripType: boolean = false;
    driverEntourage: boolean = true;
    selfDriving: boolean = false;
    //用车人数组
    userCarStaffs: any = [];
    isPersonResPoint: boolean = false;
    CarList:any = [];
    DriverList:any=[];
    state: any = ENV.httpurl;
    ismobile: boolean = false;
    constructor(public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams, public fb: FormBuilder, private events: Events, private keyboard: Keyboard, public NativeService: NativeService) {
        this.editable = this.navParams.get("opeType") == 'view' ? false : true;

        if (this.navParams.get("opeType") == 'update') {
            this.update = true;
            this.editingEntry['tripType'] == "单程" ? this.tripType = false : this.tripType = true;
            this.editingEntry['driverEntourage'] == "是" ? this.driverEntourage = false : this.driverEntourage = true;
            this.editingEntry['selfDriving'] == "是" ? this.selfDriving = true : this.selfDriving = false;
        }
        if (this.NativeService.isAndroid()) {
            this.ismobile = true;
        }
        this.myForm = this.fb.group({
            opinion: ['', [Validators.required]],
        });
        this.getEditingEntry();
    }
    getUsers() {
        if(!!this.editingEntry['useCarUserId']){
            let userIds = this.editingEntry['useCarUserId'].split(',');
            this.http.post(ENV.httpurl + '/api/staff/queryStaffsInUserIds', userIds).subscribe(async data => {
                this.userCarStaffs = data;
            })
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

    //获取详情信息
    getEditingEntry() {
        this.http.get(ENV.httpurl + entryUri9 + '/' + this.navParams.get("id")).subscribe(async data => {
            this.editingEntry = data;
            //判断是否选择车辆信息
            this.isPersonResPoint = this.editingEntry['procedureStatus'] == 'firstTrial' ? true : false;

            this.getUsers();
        })
    }

    //获取工作流配置信息，实例信息
    wfHolder() {
        let that = this;
        if (!!this.navParams.get("wfAlias")) {
            this.globalData.getHolderFromWfAliasRef(this.navParams.get("wfAlias"), this.navParams.get("ref"), null).subscribe(async data => {
                this.wfHolderObj = this.globalData.compOtherInfo(data);
                this.isTodo = this.wfHolderObj.isTodo();
                this.btns = this.wfHolderObj.btns();  //获取按钮
                this.globalData.setProc(this.wfHolderObj.btns()); //给按钮设置函数          

                await that.getOptionAll(this.wfHolderObj);
            })
        }
    }
    //获取办理意见列表（1、获取工作流配置、实例信息得到wfHolder）
    getOptionAll(wfHolderObj) {
        this.opinionList = this.globalData.getOpinions(wfHolderObj);
    }

    viewFlow() {
        this.navCtrl.push("WorkFlowPage", { wfAlias: this.navParams.get("wfAlias"), ref: this.navParams.get("ref") })
    }

    // 流程处理
    manage(btn) {
        let self = this;
        if(this.isPersonResPoint){
            if (!this.editingEntry['theCarType']) {
                this.NativeService.showAlert('请选择车辆类型！');
                return;
            }
            if (!this.editingEntry['theCarNumber']) {
                this.NativeService.showAlert('请填写车牌号！');
                return;
            }
            if (!this.editingEntry['driverName'] && this.editingEntry['selfDriving'] === '否') {
                this.NativeService.showAlert('请选择司机姓名！');
                return;
            }
            if (!this.editingEntry['driverPhone'] && this.editingEntry['selfDriving'] === '否') {
                this.NativeService.showAlert('请填写司机电话！');
                return;
            }
        }
        btn.proc(this.myForm.value.opinion, () => self.save(), () => self.getWfData(), () => self.lastDo(), () => self.beforeSelectRes(), (selected) => self.afterSelectRes(selected), () => self.getNextPoint(), () => self.procBackPoint());
    }
    // 保存业务表数据
    save(): Observable<any> {
        return Observable.create(observer => {
            var self = this;
            return self.http.post(ENV.httpurl + saveEntityUri9, self.editingEntry).subscribe(resp => {
                self.editingEntry['id'] = resp['id']; // 将id重置回去，为了wfData获取数据
                observer.next(resp['businessKey']);// 在流程提交组件里获取
            }, error => {
                observer.error(false);
            });
        });
    }
    getWfData() {
    }
    // 选人之前处理，没有什么处理时，可以不写返回值
    beforeSelectRes() {
        return {}
    }
    procBackPoint() {
        this.NativeService.showToast("操作成功").then(()=>{
            setTimeout(() => {
              this.navCtrl.pop()
            },800)
          })
        // this.navCtrl.pop();  // 流程提交后 返回的页面
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
    blurInput() {
        let that = this;
        that.datamore.btnscroll = true;
        this.keyboard.onKeyboardShow().subscribe(data => {
            if (that.NativeService.isAndroid()) {
                that.datamore.btnscollHeight = data.keyboardHeight;
            }
        })
        if (that.datamore.btnscollHeight > 0) {
        } else {
            that.datamore.btnscollHeight = 267
        }
    }
    //选择车辆
    selectCar() {
        this.navCtrl.push('SelectCarPage', { 'callback': this.carBackFunction, 'CarList': this.CarList,'entity':this.editingEntry  });
    }
    //车辆信息对应
    carBackFunction = (params) => {
        return new Promise((resolve, reject) => {
            if (typeof (params) != 'undefined') {
                resolve('ok');
                if (!!params.dataList) {
                    this.CarList = params.dataList;
                    this.editingEntry['theCarType'] = this.CarList.type;
                    this.editingEntry['theCarNumber'] = this.CarList.numberPlate;
                    this.editingEntry['theCarid'] = this.CarList.id;
                    //司机信息
                    if(this.editingEntry['selfDriving'] === '否'){
                        this.editingEntry['driverName'] = this.CarList.fulltimeDriver;
                        this.editingEntry['driverId'] = this.CarList.driverId;
                        //根据司机id查询司机电话
                        if(!!this.editingEntry['driverId']){
                            this.http.post(ENV.httpurl+'/api/ReserveCar/queryDriverInfo',{id:this.editingEntry['driverId']}).subscribe(data =>{
                                if(!!data){
                                    this.editingEntry['driverPhone'] = data['phoneNumber'];
                                }
                            });
                        }
                    }
                }   
            } else {
                reject(Error('error'))
            }
        });
    }
    //选择司机
    selectDriver() {
        this.navCtrl.push('SelectDriverPage', { 'callback': this.driverBackFunction, 'DriverList': this.DriverList,'entity':this.editingEntry });
    }
    //司机信息对应
    driverBackFunction = (params) => {
        return new Promise((resolve, reject) => {
            if (typeof (params) != 'undefined') {
                resolve('ok');
                if (!!params.dataList) {
                    this.DriverList = params.dataList;
                    this.editingEntry['driverName'] = this.DriverList.driverName;
                    this.editingEntry['driverPhone'] = this.DriverList.phoneNumber;
                    this.editingEntry['driverId'] = this.DriverList.id;
                }
            } else {
                reject(Error('error'))
            }
        });
    }
    goback(){
        this.navCtrl.pop();
      }
}