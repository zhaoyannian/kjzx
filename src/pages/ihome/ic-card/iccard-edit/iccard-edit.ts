import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams ,Events} from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { globalData } from '../../../../icommon/provider/globalData';
import { ENV } from '@env/environment';
import { entryUri4, queryListFileUri, saveEntityUri4 } from '../../../../icommon/provider/Constants';
import _ from 'lodash';
import { Observable } from 'rxjs/Rx';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NativeService } from '../../../../icommon/provider/native';
import { Keyboard } from '@ionic-native/keyboard';

@IonicPage()
@Component({
    selector: 'page-iccard-edit',
    templateUrl: 'iccard-edit.html'
})
export class IccardEditPage {
    editable: any;
    editingEntry = {};
    update: any;
    //附件列表信息
    fileList: any;
    //流程信息
    wfHolderObj: any;
    isTodo: any;
    btns: any;
    opinionList: any;
    //页面所需接口
    httpurl: any = ENV.httpurl;
    isPersonResPoint: any = false;
    isAllOfficePoint: any = false;
    //表单
    myForm: FormGroup;
    //
    nativePlaceTypes: any;
    cardTypes: any;
    businessTypes: any;
    datamore: any = {};
    ismobile: boolean = false;
    btnScroll: boolean = false;
    btnscollHeight: any;
    points:any;
    ponitstatus:any;
    toggle:any;
    constructor(public http: HttpClient, public NativeService: NativeService, public globalData: globalData, public navCtrl: NavController, public fb: FormBuilder, public navParams: NavParams, private keyboard: Keyboard,private events: Events,) {
        this.editable = this.navParams.get("opeType") == 'view' ? false : true;
        this.toggle = this.navParams.get("toggle")
        if (this.navParams.get("opeType") == 'update') {
            this.update = true;
        }
        if (this.NativeService.isAndroid()) {
            this.ismobile = true;
        }
        this.myForm = this.fb.group({
            opinion: ['同意', [Validators.required]],
        });
        this.getTypes();
    }
    ionViewDidEnter() {
        this.getEditingEntry();
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
        this.http.get(ENV.httpurl + entryUri4 + '/' + this.navParams.get("id")).subscribe(async data => {
            this.editingEntry = data;
            if (!!this.editingEntry['cardFile']) {
                await this.queryListFile(this.editingEntry['cardFile']);
            }
            if (!!this.editingEntry['contractStartTime']) {
                this.editingEntry['contractStartTimeNew'] = this.getDate(this.editingEntry['contractStartTime']);
            }
            if (!!this.editingEntry['contractEndTime']) {
                this.editingEntry['contractEndTimeNew'] = this.getDate(this.editingEntry['contractEndTime']);
            }
            if (!!this.editingEntry['cardStartTime']) {
                this.editingEntry['cardStartTimeNew'] = this.getDate(this.editingEntry['cardStartTime']);
            }
            if (!!this.editingEntry['cardEndTime']) {
                this.editingEntry['cardEndTimeNew'] = this.getDate(this.editingEntry['cardEndTime']);
            }
        })
    }
    getDate(date) {
        let normalDate = new Date(date);
        let time = normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getUTCDate() + " " + normalDate.getHours() + ":" + normalDate.getUTCMinutes() + ":" + normalDate.getUTCSeconds();
        return new Date((new Date(Date.parse(time.replace(/-/g, "/"))).getTime() + 8 * 60 * 60 * 1000)).toISOString();
    }
    //获取附件信息
    queryListFile(file) {
        this.http.get(ENV.httpurl + queryListFileUri + '/' + file).subscribe(data => {
            this.fileList = data;
        });
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
                //判断是否为“人力资源审核”、“研究生部”
                this.isPersonResPoint = (_.includes(this.wfHolderObj.handlePoint.name, '人力资源管理处') || _.includes(this.wfHolderObj.handlePoint.name, '研究生部')) ? true : false;
                //判断是否为“综合办审核”
                this.isAllOfficePoint = _.includes(this.wfHolderObj.handlePoint.name, '身份卡管理员') ? true : false;

                await that.getOptionAll(this.wfHolderObj);
                this.points = this.globalData.getPoints(this.wfHolderObj);
                this.ponitstatus= _.find(this.points,n=>{
                   return n.status == 'back';
                })
                // this.ponitstatus= _.find(this.points,n=>  n.status == 'back');
                 
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

    // 附件图标问题
    fileIcon(fileName) {
        let postfix = getFileExtName(fileName);
        //图片附件
        if ("|jpg|png|jpeg|bmp|gif|".indexOf(postfix) > 0) {
            return 'img';
            //word附件
        } else if ("|docx|doc|".indexOf(postfix) > 0) {
            return 'doc';
            //excel附件
        } else if ("|xlsx|xls|".indexOf(postfix) > 0) {
            return 'excel';
            //PDF附件
        } else if ("|pdf|".indexOf(postfix) > 0) {
            return 'pdf';
            //压缩包附件
        } else if ("|rar|zip|tar|gz|war|7z|".indexOf(postfix) > 0) {
            return 'zip';
            // ppt
        } else if ("|pptx|ppt|".indexOf(postfix) > 0) {
            return 'ppt';
            // txt
        } else if ("|txt|".indexOf(postfix) > 0) {
            return 'txt';
            // 其他附件
        } else {
            return 'file';
        }
        function getFileExtName(name) {
            try {
                return name.split('.').pop().toLowerCase();
            } catch (error) {
                return 'file';
            }
        }
    }

    // 流程处理
    manage = _.throttle(function (btn) {
        let self = this;
        if (this.isPersonResPoint && !this.editingEntry['contractStartTimeNew']&&btn.type=='submit') {
            let mess = '请选择' + (this.editingEntry['cardType'] === '0' ? '入学时间' : '合同开始时间');
            this.NativeService.showAlert(mess);
            return;
        }
        if (this.isPersonResPoint && !this.editingEntry['contractEndTimeNew']&&btn.type=='submit') {
            let mess = '请选择' + (this.editingEntry['cardType'] === '0' ? '毕业时间' : '合同结束时间');
            this.NativeService.showAlert(mess);
            return;
        }
        if (this.isAllOfficePoint && !this.editingEntry['cardNum']) {
            this.NativeService.showAlert('请填写身份卡卡号！');
            return;
        }
        if (this.isAllOfficePoint && !this.editingEntry['cardStartTimeNew']) {
            this.NativeService.showAlert('请选择身份卡生效时间！');
            return;
        }
        if (this.isAllOfficePoint && !this.editingEntry['cardEndTimeNew']) {
            this.NativeService.showAlert('请选择身份卡失效时间！');
            return;
        }
        if (this.isPersonResPoint) {
            this.editingEntry['contractStartTime'] = this.getSaveDate(this.editingEntry['contractStartTimeNew']);
            this.editingEntry['contractEndTime'] = this.getSaveDate(this.editingEntry['contractEndTimeNew']);
        }
        if (this.isAllOfficePoint) {
            this.editingEntry['cardStartTime'] = this.getSaveDate(this.editingEntry['cardStartTimeNew']);
            this.editingEntry['cardEndTime'] = this.getSaveDate(this.editingEntry['cardEndTimeNew']);
        }
        switch (this.toggle) {
            case 'awiatData':
                this.events.publish('tabs:awiatData', this.toggle, '');
                break;
            case 'complateData':
                this.events.publish('tabs:complateData', this.toggle, '');
                break;
            case 'AllData':
                this.events.publish('tabs:AllData', this.toggle, '');
                break;
        }
        btn.proc(this.myForm.value.opinion, () => self.save(), () => self.getWfData(), () => self.lastDo(), () => self.beforeSelectRes(), (selected) => self.afterSelectRes(selected), () => self.getNextPoint(), () => self.procBackPoint());
    }, 800);
    //修改日期
    getSaveDate(dateNew) {
        let de = new Date(dateNew);
        return new Date(de.getTime() - 8 * 60 * 60 * 1000);
    }
    // 保存业务表数据
    save(): Observable<any> {
        return Observable.create(observer => {
            var self = this;
            return self.http.post(ENV.httpurl + saveEntityUri4, self.editingEntry).subscribe(resp => {
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
        this.NativeService.hideLoading();
        this.navCtrl.pop();  // 流程提交后 返回的页面
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
        this.navCtrl.pop();  // 流程提交后 返回的页面
    }

    //获取下拉框内容
    getTypes() {
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/BLQY_ICCARD_NATIVEPLACE').subscribe(data => {
            this.nativePlaceTypes = data;
        });
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/BLQY_ICCARD_CARDTYPE').subscribe(data => {
            this.cardTypes = data;
        });
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/BLQY_ICCARD_BUSINESSTYPE').subscribe(data => {
            this.businessTypes = data;
        });
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
    // blurInput() {
    //     let that = this;
    //     that.btnScroll = false;
    //     that.btnscollHeight = 0;
    // }
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
        // let that = this;
        // that.datascroll.btnscroll = true;
        // this.keyboard.onKeyboardShow().subscribe(data => {
        //   if (that.NativeService.isAndroid()) {
        //       that.datascroll.btnscroll = true;
        //     that.datascroll.btnscollHeight = data.keyboardHeight;
        //   }
        // })
        // if (that.datascroll.btnscollHeight > 0) {
        // } else {
        //   that.datascroll.btnscollHeight = 267
        // }
    }
    goback() {
        this.navCtrl.pop();
    }
}