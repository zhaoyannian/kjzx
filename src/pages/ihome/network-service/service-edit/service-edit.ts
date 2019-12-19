import { Component,ViewChild } from "@angular/core";
import { IonicPage, NavController, NavParams,AlertController,ModalController } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { globalData } from '../../../../icommon/provider/globalData';
import { ENV } from '@env/environment';
import { entryUri10, saveEntityUri10,queryListFileUri,uploadFileUri } from '../../../../icommon/provider/Constants';
import { Observable } from 'rxjs/Rx';
import _ from 'lodash';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NativeService } from './../../../../icommon/provider/native';
import { Keyboard } from '@ionic-native/keyboard';
import { Events } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-service-edit',
    templateUrl: 'service-edit.html'
})
export class ServiceEditPage {
    editable: any;
    editingEntry = {};
    entry = {};
    update: any;
    //流程信息
    wfHolderObj: any;
    isTodo: any;
    btns: any;
    opinionList: any;
    //
    webServiceTypes: any;
    isDoubleFlows: any;
    opeType: any;
    httpurl: any = ENV.httpurl;
    //附件列表信息
    fileList: any = [];
    wffileList: any = [];
    //上传网络带宽附件列表信息
    kdfileList: any = [];

    videofileList: any = [];
    //判断是否为“综合办审核”
    isAllOfficePoint: any;
    //表单
    myForm: FormGroup;
    saveUrl: any = saveEntityUri10;
    datamore: any = {};
    ismobile: boolean = false;
    vpnTypes: any = [];
    btnScroll: boolean = false;
    btnscollHeight: any;
    toggle:any;
    @ViewChild('uploadImg') uploadImg: any;
    constructor(public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams, public fb: FormBuilder, private events: Events, private keyboard: Keyboard, public NativeService: NativeService,private alertCtrl: AlertController,public modalCtrl: ModalController) {
        this.editable = this.navParams.get("opeType") == 'view' ? false : true;
        this.entry = this.navParams.get("entry");
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
        this.http.get(ENV.httpurl + entryUri10 + '/' + this.navParams.get("id")).subscribe(async data => {
            this.editingEntry = data;

            if (!!this.editingEntry['filesId']) {
                this.queryListFile(this.editingEntry['filesId'],'wift');
            }

            if (!!this.editingEntry['kdFilesId']) {
                this.queryListFile(this.editingEntry['kdFilesId'],'kd');
            }

             if (!!this.editingEntry['videoFileId']) {
                this.queryListFile(this.editingEntry['videoFileId'],'video');
            }

            if (!!this.editingEntry['applyDate']) {
                this.editingEntry['applyDateNew'] = this.getDate(this.editingEntry['applyDate']);
            }
            if (!!this.editingEntry['wifiTime']) {
                this.editingEntry['wifiTimeNew'] = this.getDate(this.editingEntry['wifiTime']);
            }
            if (!!this.editingEntry['wifiEndTime']) {
                this.editingEntry['wifiEndTimeNew'] = this.getDate(this.editingEntry['wifiEndTime']);
            }
            if (!!this.editingEntry['videoTime']) {
                this.editingEntry['videoTimeNew'] = this.getDate(this.editingEntry['videoTime']);
            }

            if (!!this.editingEntry['testTime']) {
                this.editingEntry['testTimeNew'] = this.getDate(this.editingEntry['testTime']);
            }

            if (!!this.editingEntry['kdTime']) {
                this.editingEntry['kdTimeNew'] = this.getDate(this.editingEntry['kdTime']);
            }

            if (!!this.editingEntry['kdEndTime']) {
                this.editingEntry['kdEndTimeNew'] = this.getDate(this.editingEntry['kdEndTime']);
            }

            if (!!this.editingEntry['webServiceType']) {
                this.editingEntry['webServiceName'] = this.editingEntry['webServiceType'].split(',');
            }
            if (!!this.editingEntry['isDoubleFlow']) {
                this.editingEntry['isDoubleFlowName'] = this.editingEntry['isDoubleFlow'];
            }
        })
    }

    getDate(date) {
        let normalDate = new Date(date);
        let time = normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getUTCDate() + " " + normalDate.getHours() + ":" + normalDate.getUTCMinutes() + ":" + normalDate.getUTCSeconds();
        return new Date((new Date(Date.parse(time.replace(/-/g, "/"))).getTime() + 8 * 60 * 60 * 1000)).toISOString();
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
        //网络服务类型
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/BLQY_WEBSERVICE_TYPE').subscribe(data => {
            this.webServiceTypes = data;
        });
        //是否双流
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/SYSTEM_BOOLEAN_STATE').subscribe(data => {
            this.isDoubleFlows = data;
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
            //  if (!!this.editingEntry.webServiceName) {
            //     this.editingEntry.webServiceType = this.editingEntry.webServiceName.join(',');
            // }
            // if (!!this.editingEntry.webServiceName) {
            //     if (!!this.editingEntry.isDoubleFlowName) {
            //         this.editingEntry.isDoubleFlow = this.editingEntry.isDoubleFlowName;
            //     }
            // }
           
            // let de = new Date(this.editingEntry.applyDateNew);
            // let wt = new Date(this.editingEntry.wifiTimeNew);
            // let wet = new Date(this.editingEntry.wifiEndTimeNew);
            // let vt = new Date(this.editingEntry.videoTimeNew);
            // let tt = new Date(this.editingEntry.testTimeNew);
            // let kt = new Date(this.editingEntry.kdTimeNew);
            // let ket = new Date(this.editingEntry.kdEndTimeNew);

            // this.editingEntry.applyDate = new Date(de.getTime() - 8 * 60 * 60 * 1000);
            // this.editingEntry.wifiTime = new Date(wt.getTime() - 8 * 60 * 60 * 1000);
            // this.editingEntry.wifiEndTime = new Date(wet.getTime() - 8 * 60 * 60 * 1000);
            // this.editingEntry.videoTime = new Date(vt.getTime() - 8 * 60 * 60 * 1000);
            // this.editingEntry.testTime = new Date(tt.getTime() - 8 * 60 * 60 * 1000);
            // this.editingEntry.kdTime = new Date(kt.getTime() - 8 * 60 * 60 * 1000);
            // this.editingEntry.kdEndTime = new Date(ket.getTime() - 8 * 60 * 60 * 1000);

            return self.http.post(ENV.httpurl + saveEntityUri10, self.editingEntry).subscribe(resp => {
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
    }
    //判断是否显示
    checkShow(type) {
        if (!!this.editingEntry['webServiceName']) {
            return _.includes(this.editingEntry['webServiceName'], type);
        } else {
            return false;
        }
    }
    goback() {
        this.navCtrl.pop();
    }

    //获取附件信息
    queryListFile(file,type) {
        this.http.get(ENV.httpurl + queryListFileUri + '/' + file).subscribe(data => {

            if(type=='wift'){
                   this.wffileList = data;
                   this.datamore.wffileList=this.wffileList;
             }
             if(type=='kd'){
                   this.kdfileList = data;
                   this.datamore.kdfileList=this.kdfileList;
             }  
             if(type=='video'){
                   this.videofileList = data;
                   this.datamore.videofileList=this.videofileList;
             } 
            
        });
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
    //附件PDF预览
    showPd(id) {
        let url = '/assets/generic/web/viewer.html?file=';
        let urlN = ENV.httpurl + "/api/fileinfo/downloadFile/" + id;
        let pdf = this.modalCtrl.create('PdfViewPage', {
            options: url + encodeURIComponent(urlN) + "#page=1"
        });
        pdf.present();
    }

     // 上传文件
    uploadFile(ev,t) {
        console.log(ev)
        let formData = new FormData();
        formData.append('files', ev.target.files[0]);
        formData.append('filePath', 'file');

        this.http.post(ENV.httpurl + uploadFileUri, formData).subscribe(data => {
            this.uploadImg.nativeElement.value = ''
            console.log(data);
            if (!data['objBean']) {
                this.NativeService.showAlert('文件上传失败！');
            } else {
                if(t=='wift'){
                   this.wffileList.push(data['objBean']); 
                   this.datamore.wffileList=this.wffileList
                }
                if(t=='kd'){
                   this.kdfileList.push(data['objBean']);
                   this.datamore.kdfileList=this.kdfileList 
                }  

                 if(t=='video'){
                   this.videofileList.push(data['objBean']);
                   this.datamore.videofileList=this.videofileList 
                } 
 
            }
        }, error => {
            console.log(error)
        })
    }
    /**
  * 删除附件
  */
    removeFile(entity, i,type) {
        this.alertCtrl.create({
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
                        if(type='wift'){
                           _.remove(this.wffileList, (file) => {
                            return file['id'] == entity.id;
                           });
                           this.datamore.wffileList=this.wffileList 
                        }
                        if(type='kd'){
                             _.remove(this.kdfileList, (file) => {
                            return file['id'] == entity.id;
                            });
                            this.datamore.kdfileList=this.kdfileList 

                        }

                        if(type='video'){
                             _.remove(this.videofileList, (file) => {
                            return file['id'] == entity.id;
                            });
                            this.datamore.videofileList=this.videofileList 

                        }


                        
                         
                    
                        
                    }
                }
            ]
        }).present();

    }
}