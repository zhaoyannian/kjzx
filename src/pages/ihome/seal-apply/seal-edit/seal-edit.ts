import { Component ,ViewChild} from "@angular/core";
import { IonicPage, NavController, NavParams, ModalController ,AlertController} from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { globalData } from '../../../../icommon/provider/globalData';
import { ENV } from '@env/environment';
import { entryUri3, queryListFileUri, saveEntityUri3,uploadFileUri } from '../../../../icommon/provider/Constants';
import { NativeService } from './../../../../icommon/provider/native';
import { Keyboard } from '@ionic-native/keyboard';
import { Events } from 'ionic-angular';
import _ from 'lodash';
@IonicPage()
@Component({
    selector: 'page-seal-edit',
    templateUrl: 'seal-edit.html'
})
export class SealEditPage {
    editable: any;
    editingEntry = {};
    update: any;
    //附件列表信息
    fileList: any=[];
    //流程信息
    wfHolderObj: any;
    isTodo: any;
    btns: any;
    opinionList: any;
    //页面所需接口
    httpurl: any = ENV.httpurl;
    saveUrl: any = saveEntityUri3;
    isLegalSeal: boolean = true;
    isWfJump: boolean = true;
    datamore: any = {}
    //流程信息
    typeName: any;
    wfAlias: any;
    opinion_title:any ='同意';
    sealNameList: any = {
        Zxz: '中心章',
        Zhbz: '综合办章',
        // Cghtz: '采购合同章',
        Wxhtz: '外协合同章',
        Htzsk: '合同章（收款）',
        Frz: '法人章',
    };
    @ViewChild('uploadImg') uploadImg: any;
    entry:any={};
    constructor( private alerCtrl: AlertController,public modalCtrl: ModalController, public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams, private events: Events, private keyboard: Keyboard, public NativeService: NativeService) {
        this.editable = this.navParams.get("opeType") == 'view' ? false : true;
        this.wfAlias = this.navParams.get("wfAlias");
        this.entry = this.navParams.get("entry");
        if (this.navParams.get("opeType") == 'update') {
            this.update = true;
        }
    }
    goback() {
        this.navCtrl.pop();
    }
    dismiss() {
        // this.viewCtrl.dismiss();
    }
    ionViewDidEnter() {
        this.getEditingEntry();
        this.wfHolder();

        this.datamore.url = saveEntityUri3
        this.datamore.wfAlias=this.wfAlias
        this.keyboard.onKeyboardShow().subscribe(data => {
            if (this.NativeService.isAndroid()) {
                this.datamore.btnscroll = true;
                this.datamore.btnscollHeight = data.keyboardHeight;
                this.events.publish('btnscroll', this.datamore);
            }
        })
        this.keyboard.onKeyboardWillHide().subscribe(data => {
            if (this.NativeService.isAndroid()) {
                this.datamore.btnscroll = false;
                this.events.publish('btnscroll', this.datamore);
            }
        })
    }

    //获取详情信息
    getEditingEntry() {
        this.http.get(ENV.httpurl + entryUri3 + '/' + this.navParams.get("id")).subscribe(async data => {
            this.editingEntry = data;
            if (!!this.editingEntry['fileId']) {
                await this.queryListFile(this.editingEntry['fileId']);
            }
            this.isLegalSeal = this.editingEntry['isLegalSeal'] == '1' ? true : false;
            this.isWfJump = this.editingEntry['isWfJump'] == 'yes' ? true : false;
            this.typeName = !!this.editingEntry['sealName'] ? this.editingEntry['sealName'] : null;
            // this.getWfHolder(this.typeName);
        })
    }
    getWfHolder(typeName) {
      this.wfHolderObj = "";
      this.getWfAlias(typeName).then(wfAlias => {
        return this.globalData
          .getHolderFromWfAliasRef(wfAlias, this.navParams.get("ref"), null)
          .subscribe(async data => {
            return new Promise((resolve, reject) => {
              if (data) {
                resolve(data);
              }
            }).then(data => {
              this.wfHolderObj = this.globalData.compOtherInfo(data);
              this.globalData.setProc(this.wfHolderObj.btns());
              return this.wfHolderObj;
            });
          });
      });
    }
  getWfAlias(typeName) {
    return new Promise((resolve, reject) => {
      if (!!typeName) {
        this.editingEntry["sealNameCn"] = this.sealNameList[
          this.editingEntry["sealName"]
        ];
        this.wfAlias = "SealApply" + typeName;
        resolve(this.wfAlias);
      } else {
        this.wfAlias = "SealApplyZxz";
        resolve(this.wfAlias);
      }
    });
  }
  //获取附件信息
  queryListFile(file) {
    this.http
      .get(ENV.httpurl + queryListFileUri + "/" + file)
      .subscribe(data => {
        this.fileList = data;
        this.datamore.fileList = this.fileList;
      });
  }
  //获取工作流配置信息，实例信息
  wfHolder() {
    let that = this;
    if (!!this.navParams.get("wfAlias")) {
      this.globalData
        .getHolderFromWfAliasRef(
          this.navParams.get("wfAlias"),
          this.navParams.get("ref"),
          null
        )
        .subscribe(async data => {
          this.wfHolderObj = this.globalData.compOtherInfo(data);
          this.isTodo = this.wfHolderObj.isTodo();
          this.btns = this.wfHolderObj.btns(); //获取按钮
          this.globalData.setProc(this.wfHolderObj.btns()); //给按钮设置函数
          await that.getOptionAll(this.wfHolderObj);
        });
    }
  }
  //获取办理意见列表（1、获取工作流配置、实例信息得到wfHolder）
  getOptionAll(wfHolderObj) {
    this.opinionList = this.globalData.getOpinions(wfHolderObj);
  }

  viewFlow() {
    this.navCtrl.push("WorkFlowPage", {
      wfAlias: this.navParams.get("wfAlias"),
      ref: this.navParams.get("ref")
    });
  }
  // 附件图标问题
  fileIcon(fileName) {
    let postfix = getFileExtName(fileName);
    //图片附件
    if ("|jpg|png|jpeg|bmp|gif|".indexOf(postfix) > 0) {
      return "img";
      //word附件
    } else if ("|docx|doc|".indexOf(postfix) > 0) {
      return "doc";
      //excel附件
    } else if ("|xlsx|xls|".indexOf(postfix) > 0) {
      return "excel";
      //PDF附件
    } else if ("|pdf|".indexOf(postfix) > 0) {
      return "pdf";
      //压缩包附件
    } else if ("|rar|zip|tar|gz|war|7z|".indexOf(postfix) > 0) {
      return "zip";
      // ppt
    } else if ("|pptx|ppt|".indexOf(postfix) > 0) {
      return "ppt";
      // txt
    } else if ("|txt|".indexOf(postfix) > 0) {
      return "txt";
      // 其他附件
    } else {
      return "file";
    }
    function getFileExtName(name) {
      try {
        return name
          .split(".")
          .pop()
          .toLowerCase();
      } catch (error) {
        return "file";
      }
    }
  }
  //附件PDF预览
  showPd(id) {
    let url = "/assets/generic/web/viewer.html?file=";
    let urlN = ENV.httpurl + "/api/fileinfo/downloadFile/" + id;
    let pdf = this.modalCtrl.create("PdfViewPage", {
      options: url + encodeURIComponent(urlN) + "#page=1"
    });
    pdf.present();
  }
  // 上传文件
  uploadFile(ev) {
    console.log(ev);
    let formData = new FormData();
    formData.append("files", ev.target.files[0]);
    formData.append("filePath", "file");

    this.http.post(ENV.httpurl + uploadFileUri, formData).subscribe(
      data => {
        this.uploadImg.nativeElement.value = "";
        console.log(data);
        if (!data["objBean"]) {
          this.NativeService.showAlert("文件上传失败！");
        } else {
          this.fileList.push(data["objBean"]);
          this.datamore.fileList = this.fileList;
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  /**
   * 删除附件
   */
  removeFile(entity, i) {
    this.alerCtrl
      .create({
        title: "确定删除吗？",
        message: "",
        buttons: [
          {
            text: "取消",
            handler: () => {}
          },
          {
            text: "确定",
            handler: () => {
              _.remove(this.fileList, file => {
                return file["id"] == entity.id;
              });
              this.datamore.fileList = this.fileList;
            }
          }
        ]
      })
      .present();
  }
  changeIsLegalSeal() {
    this.isLegalSeal == true
      ? (this.editingEntry["isLegalSeal"] = "1")
      : (this.editingEntry["isLegalSeal"] = "0");
  }

    // changeisWfJump() {
    //     this.isWfJump == true ? this.editingEntry.isWfJump = 'yes' : this.editingEntry.isWfJump = 'no';
    // }
}
