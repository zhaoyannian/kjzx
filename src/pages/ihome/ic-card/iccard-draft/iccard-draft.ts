import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController,Events } from 'ionic-angular';
import { globalData } from '../../../../icommon/provider/globalData';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NativeService } from '../../../../icommon/provider/native';
import _ from 'lodash';
import { queryListFileUri, uploadFileUri, saveEntityUri4 } from '../../../../icommon/provider/Constants';
import { Observable } from 'rxjs/Rx';

@IonicPage()
@Component({
    selector: 'page-iccard-draft',
    templateUrl: 'iccard-draft.html',
})
export class IccardDraftPage {
    userinfor: any;
    editable: any;
    editingEntry: any = {};
    //表单
    myForm: FormGroup;
    //附件列表信息
    fileList: any = [];
    //流程信息
    typeName: any;
    wfAlias: any;
    wfHolderObj: any;
    @ViewChild('uploadImg') uploadImg: any;
    //
    nativePlaceTypes: any;
    cardTypes: any;
    businessTypes: any;
    //页面所需接口
    httpurl: any = ENV.httpurl;
    toggle:any;
    constructor(public modalCtrl: ModalController, public NativeService: NativeService, private alerCtrl: AlertController, public fb: FormBuilder, public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams,private events: Events, ) {
        this.userinfor = JSON.parse(localStorage.getItem("objectList"));
        this.editable = this.navParams.get("opeType") === 'view' ? false : true;
        this.toggle = this.navParams.get("toggle")
        this.myForm = this.fb.group({
            opinion: ['', [Validators.required]],
        });
        this.getTypes();
        if (this.navParams.get("opeType") === 'cre') {// 创建
            Object.assign(this.editingEntry, {
                userId: this.userinfor.loginInfo.userId,
                userName: this.userinfor.loginInfo.userName,
                officeAddress:this.userinfor.staff.officeAddr,
                teleNumber:this.userinfor.staff.officeTel,
                phoneNumber:this.userinfor.staff.mobile,
                email:this.userinfor.loginInfo.emailWork,
                deptId: this.userinfor.deptTo.deptId, //创建人部门ID
                deptName: this.userinfor.deptTo.deptName, //创建人部门名
                orgId: this.userinfor.staff.corpOrgId, //机构ID
                orgName: this.userinfor.deptTo.deptName, // 机构名称
                corpOrgId: this.userinfor.staff.corpOrgId, // 法人机构ID
                corpOrgName: this.userinfor.deptTo.deptName, // 法人机构名称
                applyDate: new Date(),
                procedureStatus: 'draft',
                createTime: new Date()
            });
            let normalDate = new Date();
            this.editingEntry.applyDateNew = this.getDate(normalDate);
        } else {
            this.editingEntry = this.navParams.get("entry");
            this.editingEntry.updateId = this.userinfor.loginInfo.userId;
            this.editingEntry.updateName = this.userinfor.loginInfo.userName;
            this.editingEntry.updateTime = new Date();

            if (!!this.editingEntry['cardFile']) {
                this.queryListFile(this.editingEntry['cardFile']);
            }
            if (!!this.editingEntry['applyDate']) {
                this.editingEntry['applyDateNew'] = this.getDate(this.editingEntry['applyDate']);
            }
        }

        this.getWfHolder();
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
    //获取流程定义
    getWfHolder() {
        this.getWfAlias().then(wfAlias => {
            return this.globalData.getHolderFromWfAliasRef(wfAlias, this.navParams.get("ref"), null).subscribe(async data => {
                return new Promise((resolve, reject) => {
                    if (data) {
                        resolve(data)
                    }
                }).then(data => {
                    this.wfHolderObj = this.globalData.compOtherInfo(data);
                    this.globalData.setProc(this.wfHolderObj.btns())
                    return this.wfHolderObj;
                })
            })
        });
    }
    //获取流程定义
    getWfAlias() {
        return new Promise((resolve, reject) => {
            //定义初始化流程别名
            var wf_alias = 'ICCard5';
            if (!!this.editingEntry.cardType && !!this.editingEntry.nativePlace) {
                if ((this.editingEntry.cardType == "2" || this.editingEntry.cardType == "4") && this.editingEntry.nativePlace == "1") {
                    wf_alias = "ICCard"; //外国国籍保密卡
                }
                if ((this.editingEntry.cardType == "2" || this.editingEntry.cardType == "4") && this.editingEntry.nativePlace == "0") {
                    wf_alias = "ICCard1"; //中国国籍保密卡
                }
                if (this.editingEntry.cardType == "0" && this.editingEntry.nativePlace == "1") {
                    wf_alias = "ICCard2"; //外国国籍学生卡
                }
                if (this.editingEntry.cardType == "0" && this.editingEntry.nativePlace == "0") {
                    wf_alias = "ICCard3"; //中国国籍学生卡
                }
                if (this.editingEntry.cardType == "1" && this.editingEntry.nativePlace == "1") {
                    wf_alias = "ICCard4"; //外国国籍普通卡
                }
                if (this.editingEntry.cardType == "1" && this.editingEntry.nativePlace == "0") {
                    wf_alias = "ICCard5"; //中国国籍普通卡
                }
            }
            this.wfAlias = wf_alias;
            resolve(this.wfAlias);
        });
    }
    // 上传文件
    uploadFile(ev) {
        this.NativeService.showLoading();
        let formData = new FormData();
        formData.append('files', ev.target.files[0]);
        formData.append('filePath', 'file');
        this.http.post(ENV.httpurl + uploadFileUri, formData).subscribe(data => {
            this.NativeService.hideLoading();
            this.uploadImg.nativeElement.value = ''
            if (!data['objBean']) {
                this.NativeService.showAlert('文件上传失败！');
            } else {
                this.fileList.push(data['objBean']);
            }
        }, error => {
            this.NativeService.hideLoading();
        })
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

    /**
   * 删除附件
   */
    removeFile(entity, i) {
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
                        _.remove(this.fileList, (file) => {
                            return file['id'] == entity.id;
                        });
                    }
                }
            ]
        }).present();

    }

    // 暂存（有流程）/保存（无流程）
    saveAndReturn= _.throttle(function () {
        this.NativeService.showLoading();
        this.editingEntry.cardFile = !!this.fileList && this.fileList.length > 0 ? _.map(this.fileList, 'id').join(',') : null;
        this.sureSub().subscribe(data => {
            this.NativeService.hideLoading();
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
            this.navCtrl.pop()
        }, error => {
            this.NativeService.hideLoading();
        })
    },800);
    //保存业务表数据
    sureSub(): Observable<any> {
        return Observable.create(observer => {
            var self = this;
            let de = new Date(this.editingEntry.applyDateNew);
            this.editingEntry.applyDate = new Date(de.getTime() - 8 * 60 * 60 * 1000);
            return self.http.post(ENV.httpurl + saveEntityUri4, self.editingEntry).subscribe(resp => {
                self.editingEntry.id = resp['id']; // 将id重置回去，为了wfData获取数据
                observer.next(resp['businessKey']);// 在流程提交组件里获取
            }, error => {
                this.NativeService.hideLoading();
                observer.error(error);
            });
        });
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
        this.NativeService.hideLoading();
        this.navCtrl.pop();  // 流程提交后 返回的页面
    }
    // 获取保存到流程实例workflowInstData字段中的数据，建议保存关联键（主键id）
    getWfData() {
        return {
            bizId: this.editingEntry.id
        };
    }
    //流程操作
    manage= _.throttle(function (btn,opinion) {
        if (!this.editingEntry.nativePlace) {
            this.NativeService.showAlert('请选择国籍类型！');
            return;
        }
        if (!this.editingEntry.officeAddress) {
            this.NativeService.showAlert('请填写经办人办公地点！');
            return;
        }
        if (!this.editingEntry.teleNumber) {
            this.NativeService.showAlert('请填写经办人办公电话！');
            return;
        }
        if (!this.editingEntry.phoneNumber) {
            this.NativeService.showAlert('请填写经办人手机！');
            return;
        }
        if (!this.editingEntry.email) {
            this.NativeService.showAlert('请填写经办人邮箱！');
            return;
        }
        if (!this.editingEntry.businessType) {
            this.NativeService.showAlert('请选择业务类型！');
            return;
        }
        if (!this.editingEntry.cardType) {
            this.NativeService.showAlert('请填写卡片类型！');
            return;
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
        this.editingEntry.cardFile = !!this.fileList && this.fileList.length > 0 ? _.map(this.fileList, 'id').join(',') : null;
        btn.proc(this.myForm.value.opinion, () => this.sureSub(), () => this.getWfData(), () => this.lastDo(), () => this.beforeSelectRes(), (selected) => this.afterSelectRes(selected), () => this.getNextPoint());
    },800);
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

    //选择参会人员
    selectPerson() {
        this.navCtrl.push('SelectPeopleNewPage', { 'callback': this.staffBackFunction, 'userId': this.editingEntry.applyICUserid });
    }
    //人员信息对应
    staffBackFunction = (params) => {
        return new Promise((resolve, reject) => {
            if (typeof (params) != 'undefined') {
                resolve('ok');
                if (!!params.data) {
                    this.editingEntry.applyICUserid = params.data[0].userId;
                    this.editingEntry.applyICUsername = params.data[0].userName;
                    this.editingEntry.applyICDeptid = params.data[0].orgId;
                    this.editingEntry.applyICDeptname = params.data[0].deptName;
                    this.editingEntry.applyOfficeAddress = params.data[0].officeAddr;
                    this.editingEntry.applyTeleNumber = params.data[0].officeTel;
                    this.editingEntry.applyPhoneNumber = params.data[0].mobile;
                    this.editingEntry.applyEmail = params.data[0].mail;
                }
            } else {
                reject(Error('error'))
            }
        });
    }
    goback() {
        this.navCtrl.pop();
    }

}
