import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { globalData } from '../../../../icommon/provider/globalData';
import { ENV } from '@env/environment';
import { entryUri5, saveEntityUri5 } from '../../../../icommon/provider/Constants';
import { Observable } from 'rxjs/Rx';
import _ from 'lodash';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NativeService } from './../../../../icommon/provider/native';
import { Keyboard } from '@ionic-native/keyboard';
import { Events } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-network-edit',
    templateUrl: 'network-edit.html'
})
export class NetworkEditPage {
    editable: any;
    editingEntry = {};
    update: any;
    //流程信息
    wfHolderObj: any;
    isTodo: any;
    btns: any;
    opinionList: any;
    //
    userTypes: any;
    delays: any;
    businessTypes: any;
    roomAddress: any;
    accessTypes: any;
    purposeTypes: any;
    assetsTypes: any;
    //判断是否为“综合办审核”
    isAllOfficePoint: any;
    //表单
    myForm: FormGroup;
    saveUrl: any = saveEntityUri5;
    datamore: any = {};
    ismobile: boolean = false;
    vpnList: any = [
        { value: 'arpxt', name: 'ARP系统、公共资源（内部信息发布平台、质量信息平台、航天科技报告系统、标准全文数据库系统、电子培训平台等）' },
        { value: 'erpxt', name: 'ERP系统' },
        { value: 'ktjfcxxt', name: '课题经费查询系统' }
    ];
    vpnTypes: any = [];
    btnScroll: boolean = false;
    btnscollHeight: any;
    toggle:any;
    constructor(public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams, public fb: FormBuilder, private events: Events, private keyboard: Keyboard, public NativeService: NativeService) {
        this.editable = this.navParams.get("opeType") == 'view' ? false : true;
        if (this.navParams.get("opeType") == 'update') {
            this.update = true;
        }
        if (this.NativeService.isAndroid()) {
            this.ismobile = true;
        }
        this.myForm = this.fb.group({
            opinion: ['同意', [Validators.required]],
        });
        this.toggle = this.navParams.get("toggle")
    }

    ionViewDidEnter() {
        this.getTypes();
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
        this.http.get(ENV.httpurl + entryUri5 + '/' + this.navParams.get("id")).subscribe(async data => {
            this.editingEntry = data;
            if (!!this.editingEntry['delay']) {
                this.editingEntry['delayName'] = this.editingEntry['delay'];
            }
            if (!!this.editingEntry['businessType']) {
                this.editingEntry['businessTypeName'] = this.editingEntry['businessType'].split(',');
            }
            if (!!this.editingEntry['accessType']) {
                this.editingEntry['accessTypeName'] = this.editingEntry['accessType'].split(',');
            }
            if (!!this.editingEntry['assetsType']) {
                this.editingEntry['assetsTypeName'] = this.editingEntry['assetsType'].split(',');
            }
            if (!!this.editingEntry['roomAddress']) {
                this.editingEntry['roomAddressName'] = this.editingEntry['roomAddress'].split(',');
            }
            if (!!this.editingEntry['purpose']) {
                this.editingEntry['purposeName'] = this.editingEntry['purpose'].split(',');
            }
            if (!!this.editingEntry['vpnType']) {
                this.vpnTypes = this.editingEntry['vpnType'].split(',');
            }
        })
    }

    //获取工作流配置信息，实例信息
    wfHolder() {
        let that = this;
        if (!!this.navParams.get("wfAlias")) {
            this.globalData.getHolderFromWfAliasRef(this.navParams.get("wfAlias"), this.navParams.get("ref"), null).subscribe(async data => {
                this.wfHolderObj = this.globalData.compOtherInfo(data);
                this.isAllOfficePoint = _.includes(this.wfHolderObj.handlePoint.name, '数据室') ? true : false;
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

    getTypes() {
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_USERTYPE').subscribe(data => {
            this.userTypes = data;
        });
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_DELAY').subscribe(data => {
            this.delays = data;
        });
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_BUSINESSTYPE').subscribe(data => {
            this.businessTypes = data;
        });
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_ROOMTYPE').subscribe(data => {
            this.roomAddress = data;
        });
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_ACCESSTYPE').subscribe(data => {
            this.accessTypes = data;
        });
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_PURPOSETYPE').subscribe(data => {
            this.purposeTypes = data;
        });
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_ASSETSTYPE').subscribe(data => {
            this.assetsTypes = data;
        });
    }
    // 流程处理
    manage = _.throttle(function (btn) {
        let self = this;
        if (this.isAllOfficePoint) {
            let mess = '';
            if (_.includes(this.editingEntry['businessType'], 'ip') && !this.editingEntry['distributeIP']) {
                mess = '请分配IP地址';
            }
            // if(_.includes(this.editingEntry['businessType'],'vpn') && !this.editingEntry['distributeVPN']){
            //     mess ='请分配VPN地址';
            // }
            if (_.includes(this.editingEntry['businessType'], 'email') && !this.editingEntry['distributeEmail']) {
                mess = '请分配邮箱地址';
            }
            if (_.includes(this.editingEntry['businessType'], 'num') && !this.editingEntry['accountNumber']) {
                mess = '请分配网络实名制账号';
            }
            if (!!mess) {
                this.NativeService.showAlert(mess);
                return;
            }
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
    // 保存业务表数据
    save(): Observable<any> {
        return Observable.create(observer => {
            var self = this;
            return self.http.post(ENV.httpurl + saveEntityUri5, self.editingEntry).subscribe(resp => {
                self.editingEntry['id'] = resp['id']; // 将id重置回去，为了wfData获取数据
                observer.next(resp['businessKey']);// 在流程提交组件里获取
            }, error => {
                this.NativeService.hideLoading();
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
        this.navCtrl.pop();  // 流程提交后 返回的页面
        // return {}
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
        this.NativeService.hideLoading();
        this.navCtrl.pop();  // 流程提交后 返回的页面
    }
    // blurInput() {
    //     let that = this;
    //     that.btnScroll = false;
    //     that.btnscollHeight = 0;
    // }
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
    //判断是否显示
    checkShow(type) {
        if (!!this.editingEntry['businessTypeName']) {
            return _.includes(this.editingEntry['businessTypeName'], type);
        } else {
            return false;
        }
    }
    goback() {
        this.navCtrl.pop();
    }
}