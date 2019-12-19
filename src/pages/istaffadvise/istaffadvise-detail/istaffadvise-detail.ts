import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  Events,
  ModalController
} from "ionic-angular";
import { NativeService } from "../../../icommon/provider/native";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";
import { Subject } from "rxjs/Rx";
import { FileService } from "./../../../icommon/provider/FileService";
import _ from "lodash";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Keyboard } from "@ionic-native/keyboard";
import {
  queryListFileUri,
  uploadFileUri
} from "../../../icommon/provider/Constants";
import { SelectDeptPage } from "./select-dept";
import { SelectAdvisePersonPage } from "./selectPerson";
import { SelectAdvisePage } from "./select-advise";
import { THROW_IF_NOT_FOUND } from "@angular/core/src/di/injector";
declare var window;

@IonicPage()
@Component({
  selector: "page-istaffadvise-detail",
  templateUrl: "istaffadvise-detail.html"
})
export class IstaffadviseDetailPage {
  httpurl: any = ENV.httpurl;
  userinfor: any = {};
  editable: any;
  opeType: any;
  toggle: any = "";
  editingEntry: any = {};
  searchTextStream: Subject<string> = new Subject<string>(); //允许将值多播到多个观察者Observer
  fileList: any = [];
  title: any;
  datamore: any = {};
  isShow: boolean = true;
  depts: any = [];
  replyList: any = [];
  replyInfoList: any = [];
  //总条数
  totalCount: number = 0;
  //第几页
  page: any = 1;
  //一页多少条
  pageSize: any = 10;
  status: any;
  datascroll: any = {};
  opinion: any;
  ismobile: boolean = false;
  adviseEntiry: any = {};
  @ViewChild("uploadImg") uploadImg: any;
  constructor(
    private alerCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public NativeService: NativeService,
    public http: HttpClient,
    private events: Events,
    public FileService: FileService,
    // public fb: FormBuilder,
    private keyboard: Keyboard,
    private modalCtrl: ModalController
  ) {
    this.status = {
      DFP: "待分配",
      DHF: "待回复",
      YHF: "已回复",
      QBHF: "全部回复"
    };
    this.events.subscribe(
      "btnscroll",
      content => {
        console.log(content);
        let that = this;
        if (!content.btnscroll) {
          that.datascroll.btnscroll = false;
          that.datascroll.btnscollHeight = 0;
        }
      },
      error => {
        let that = this;
        that.datascroll.btnscroll = false;
        that.datascroll.btnscollHeight = 0;
      }
    );
    if (this.NativeService.isAndroid()) {
      this.ismobile = true;
    }
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.opeType = this.navParams.get("opeType");
    this.editable = this.navParams.get("opeType") === "cre" ? true : false;
    this.toggle = this.navParams.get("toggle");

    if (this.navParams.get("opeType") === "cre") {
      this.editingEntry.createUser = this.userinfor.staff.userName;
      this.editingEntry.createUserId = this.userinfor.staff.userId;
      this.editingEntry.createUserName = this.userinfor.staff.userName;
      this.editingEntry.userPhone = this.userinfor.loginInfo.mobNum;
      this.editingEntry.userMail = this.userinfor.loginInfo.emailWork;
      this.editingEntry.isShowName = this.isShow == true ? "TRUE" : "FALSE";
      // 创建
    } else {
      this.editingEntry = this.navParams.get("entry");
      //获取明细信息
      this.getDetail(this.editingEntry.id);
      //获取回复负责人反馈情况
      let data = {
        exchangeId: this.editingEntry.id
      };
      // this.getReply(data);
      //获取互动跟进反馈内容区
      this.NativeService.showLoading();
      this.page = 1;
      let pageInfo = {
        page: 1,
        pageSize: this.pageSize
      };
      this.getReplyInfo(data, pageInfo, null);
      //查询转发回复内容
      this.getForCont(this.editingEntry, pageInfo);
    }
  }
  //查询反馈意见表信息
  getDetail(id) {
    this.http
      .get(ENV.httpurl + "/api/exchangeAdvise/queryById/" + id)
      .subscribe(data => {
        this.editingEntry = data;
        if (!!this.editingEntry["fileIds"]) {
          this.queryListFile(this.editingEntry["fileIds"]);
        }
        this.isShow = this.editingEntry.isShowName == "TRUE" ? true : false;
      });
  }
  //获取回复负责人反馈情况
  getReply(data) {
    this.http
      .post(ENV.httpurl + "/api/exchangeAdvise/queryReplyPage", data)
      .subscribe(data => {
        this.replyList = data["data"];
      });
  }
  //获取互动跟进反馈内容区
  getReplyInfo(data, pageInfo, infiniteScroll) {
    this.http
      .post(ENV.httpurl + "/api/exchangeAdvise/queryDetailPage", data, {
        params: pageInfo
      })
      .subscribe(
        data => {
          this.NativeService.hideLoading();
          if (this.page == 1) {
            this.totalCount = data["count"];
            this.replyInfoList = data["data"];
          } else {
            this.replyInfoList = this.replyInfoList.concat(data["data"]);
          }
          if (!!infiniteScroll) {
            infiniteScroll.complete();
          }
        },
        error => {
          this.NativeService.hideLoading();
          if (!!infiniteScroll) {
            infiniteScroll.complete();
          }
        }
      );
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    if (this.totalCount == this.replyInfoList.length) {
      infiniteScroll.complete();
    } else {
      let data = {
        exchangeId: this.editingEntry.id
      };
      this.page += 1;
      let pageInfo = {
        page: this.page,
        pageSize: this.pageSize
      };
      this.getReplyInfo(data, pageInfo, infiniteScroll);
    }
  }
  //初始化
  ionViewDidEnter() {
    let that = this;
    that.keyboard.onKeyboardWillHide().subscribe(data => {
      console.log(data);
      if (that.NativeService.isAndroid()) {
        that.datamore.btnscroll = false;
        that.datamore.btnscollHeight = 0;
      }
    });
  }
  //返回上一层
  goback() {
    switch (this.toggle) {
      case "myAdvise":
        this.events.publish("istaffadvise:slide0", this.toggle, "");
        break;
      case "assignment":
        this.events.publish("istaffadvise:slide1", this.toggle, "");
        break;
      case "reply":
        this.events.publish("istaffadvise:slide2", this.toggle, "");
        break;
      case "view":
        this.events.publish("istaffadvise:slide3", this.toggle, "");
        break;
    }
    this.navCtrl.pop();
  }

  //获取附件信息
  queryListFile(file) {
    this.http
      .get(ENV.httpurl + queryListFileUri + "/" + file)
      .subscribe(data => {
        this.fileList = data;
      });
  }
  // 上传文件
  uploadFile(ev) {
    this.NativeService.showLoading();
    let formData = new FormData();
    formData.append("files", ev.target.files[0]);
    formData.append("filePath", "file");

    this.http.post(ENV.httpurl + uploadFileUri, formData).subscribe(
      data => {
        this.NativeService.hideLoading();
        this.uploadImg.nativeElement.value = "";
        if (!data["objBean"]) {
          this.NativeService.showAlert("文件上传失败！");
        } else {
          this.fileList.push(data["objBean"]);
        }
      },
      error => {
        this.NativeService.hideLoading();
      }
    );
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
            }
          }
        ]
      })
      .present();
  }
  //是否公开姓名，字段赋值逻辑
  changeIsShow() {
    this.isShow == true
      ? (this.editingEntry.isShowName = "TRUE")
      : (this.editingEntry.isShowName = "FALSE");
  }
  //选择建议负责人部门
  selectDept() {
    this.navCtrl.push(SelectDeptPage, {
      callback: this.deptBackFunction,
      deptIds: this.editingEntry.recommendDeptId
    });
  }
  //负责人部门信息对应
  deptBackFunction = params => {
    return new Promise((resolve, reject) => {
      if (typeof params != "undefined") {
        resolve("ok");
        if (!!params.dataList) {
          //建议回复部门
          this.editingEntry.recommendDept = _.map(
            params.dataList,
            n => n.deptName
          ).join(",");
          //建议回复部门id
          this.editingEntry.recommendDeptId = _.map(
            params.dataList,
            n => n.deptOrgId
          ).join(",");
        }
      } else {
        reject(Error("error"));
      }
    });
  };
  //选择负责人
  selectPerson() {
    this.navCtrl.push(SelectAdvisePersonPage, {
      callback: this.staffBackFunction,
      userids: this.editingEntry.replyUserIds
    });
  }
  //负责人信息对应
  staffBackFunction = params => {
    return new Promise((resolve, reject) => {
      if (typeof params != "undefined") {
        resolve("ok");
        if (!!params.dataList) {
          //负责人
          this.editingEntry.replyUserNames = _.map(
            params.dataList,
            n => n.userName
          ).join(",");
          //负责人回复部门id
          this.editingEntry.replyUserIds = _.map(
            params.dataList,
            n => n.userId
          ).join(",");
          //负责人回复部门
          this.editingEntry.replyDeptNames = _.map(
            params.dataList,
            n => n.deptName
          ).join(",");
        }
      } else {
        reject(Error("error"));
      }
    });
  };
  //发布意见反馈
  savePublic = _.throttle(function() {
    if (!this.editingEntry.recommendDept) {
      this.NativeService.showAlert("请选择建议回复部门");
      return;
    }
    if (!this.editingEntry.title) {
      this.NativeService.showAlert("请填写互动标题！");
      return;
    }
    if (!this.editingEntry.communicateContent) {
      this.NativeService.showAlert("请填写互动内容！");
      return;
    }
    //附件字段赋值
    this.editingEntry.fileIds =
      !!this.fileList && this.fileList.length > 0
        ? _.map(this.fileList, "id").join(",")
        : null;
    return this.http
      .post(ENV.httpurl + "/api/exchangeAdvise/saveOrUpdate", this.editingEntry)
      .subscribe(
        resp => {
          this.NativeService.hideLoading();
          this.goback();
        },
        error => {
          this.NativeService.hideLoading();
        }
      );
  }, 800);
  //确认分配
  saveAssgin = _.throttle(function() {
    if (!this.editingEntry.isShowName) {
      this.NativeService.showAlert("请选择是否公开姓名");
      return;
    }
    if (!this.editingEntry.replyUserNames || !this.editingEntry.replyUserIds) {
      this.NativeService.showAlert("请分配负责人！");
      return;
    }
    this.NativeService.showLoading();
    return this.http
      .post(
        ENV.httpurl + "/api/exchangeAdvise/updateExchange",
        this.editingEntry
      )
      .subscribe(
        resp => {
          this.NativeService.hideLoading();
          this.goback();
        },
        error => {
          this.NativeService.hideLoading();
        }
      );
  }, 800);
  //确认回复
  saveReply = _.throttle(function(type) {
    if (!this.opinion) {
      this.NativeService.showAlert("您的意见不能为空！");
      return;
    }
    let entry = {
      exchangeId: this.editingEntry.id,
      options: this.opinion,
      replyType: type
    };
    this.NativeService.showLoading();
    return this.http
      .post(ENV.httpurl + "/api/exchangeAdvise/addExchangeDetail", entry)
      .subscribe(
        resp => {
          if (resp["result"]) {
            this.NativeService.hideLoading();
            this.NativeService.showAlert("发布成功！").then(() => {
              this.opinion = "";
              let data = {
                exchangeId: this.editingEntry.id
              };
              this.getReply(data);
              //获取互动跟进反馈内容区
              this.NativeService.showLoading();
              this.page = 1;
              let pageInfo = {
                page: 1,
                pageSize: this.pageSize
              };
              this.getReplyInfo(data, pageInfo, null);
            });
          } else {
            this.NativeService.showAlert("发布失败！");
          }
        },
        error => {
          this.NativeService.hideLoading();
        }
      );
  }, 800);
  //转发至他人
  forwardOther() {
    this.navCtrl.push(SelectAdvisePersonPage, {
      callback: this.staffForwardFunction,
      userids: ""
    });
  }
  //转发选人后操作
  staffForwardFunction = params => {
    return new Promise((resolve, reject) => {
      if (typeof params != "undefined") {
        resolve("ok");
        if (!!params.dataList) {
          //负责人
          let userNames = _.map(params.dataList, n => n.userName).join(",");
          //负责人回复部门id
          let userIds = _.map(params.dataList, n => n.userId).join(",");
          if (!!userNames && !!userIds) {
            this.alerCtrl
              .create({
                title:
                  "转发后你将无法再对此内容进行操作直至其他人再次转发给你。是否确认转发？",
                buttons: [
                  { text: "取消" },
                  {
                    text: "确定",
                    handler: () => {
                      this.NativeService.showLoading();
                      this.http
                        .post(
                          ENV.httpurl +
                            "/api/exchangeAdvise/forwardExchange" +
                            "/" +
                            userIds +
                            "/" +
                            userNames +
                            "/" +
                            this.editingEntry.id,
                          {}
                        )
                        .subscribe(
                          resp => {
                            if (resp["result"]) {
                              this.NativeService.showAlert("转发成功！").then(
                                () => {
                                  this.NativeService.hideLoading();
                                  this.goback();
                                }
                              );
                            } else {
                              this.NativeService.showAlert("转发失败！");
                            }
                          },
                          error => {
                            this.NativeService.hideLoading();
                          }
                        );
                    }
                  }
                ]
              })
              .present();
          }
        }
      } else {
        reject(Error("error"));
      }
    });
  };
  blurInput() {
    let that = this;
    that.datamore.btnscroll = true;
    this.keyboard.onKeyboardShow().subscribe(data => {
      if (that.NativeService.isAndroid()) {
        //   that.datascroll.btnscroll = true;
        that.datamore.btnscollHeight = data.keyboardHeight;
      }
    });
    if (that.datamore.btnscollHeight > 0) {
    } else {
      that.datamore.btnscollHeight = 267;
    }
  }
  //公开展示、归档、驳回
  publicShow = _.throttle(function(type) {
    this.NativeService.showLoading();
    let messageBefore = "";
    switch (type) {
      case "GK":
        messageBefore = "您确认要公开展示此意见反馈内容吗";
        break;
      case "GD":
        messageBefore = "您确认要归档此意见反馈内容吗";
        break;
      case "BH":
        messageBefore = "您确认要驳回此意见反馈内容吗";
        break;
      default:
        return;
    }
    this.alerCtrl
      .create({
        title: messageBefore,
        buttons: [
          { text: "取消" },
          {
            text: "确定",
            handler: () => {
              this.NativeService.showLoading();
              this.http
                .post(
                  ENV.httpurl +
                    "/api/exchangeAdvise/endExchange" +
                    "/" +
                    this.editingEntry.id +
                    "/" +
                    type,
                  {}
                )
                .subscribe(
                  resp => {
                    if (resp["result"]) {
                      this.NativeService.showAlert("操作成功！").then(() => {
                        this.NativeService.hideLoading();
                        this.goback();
                      });
                    } else {
                      this.NativeService.showAlert("操作失败！");
                    }
                  },
                  error => {
                    this.NativeService.hideLoading();
                  }
                );
            }
          }
        ]
      })
      .present();
  }, 800);

  //转发回复
  forwardReply = _.throttle(function() {
    if (!this.adviseEntiry.id) {
      this.NativeService.showAlert("请选择转发回复内容！");
    } else {
      this.alerCtrl
        .create({
          title: "是否转发回复？",
          buttons: [
            { text: "取消" },
            {
              text: "确定",
              handler: () => {
                this.NativeService.showLoading();
                this.http
                  .post(
                    ENV.httpurl +
                      "/api/exchangeAdvise/forwardExchange" +
                      "/" +
                      this.editingEntry.id +
                      "/" +
                      this.adviseEntiry.id,
                    {}
                  )
                  .subscribe(
                    resp => {
                      if (resp["result"]) {
                        this.NativeService.showAlert("转发回复成功！").then(
                          () => {
                            this.NativeService.hideLoading();
                            this.goback();
                          }
                        );
                      } else {
                        this.NativeService.showAlert("转发回复失败！");
                      }
                    },
                    error => {
                      this.NativeService.hideLoading();
                    }
                  );
              }
            }
          ]
        })
        .present();
    }
  }, 800);
  //选择转发内容
  selectAdvise() {
    this.navCtrl.push(SelectAdvisePage, {
      callback: this.adviseBackFunction
    });
  }
  //转发内容设置
  adviseBackFunction = params => {
    return new Promise((resolve, reject) => {
      if (typeof params != "undefined") {
        resolve("ok");
        if (!!params.dataList) {
          this.adviseEntiry = params.dataList[0];
        }
      } else {
        reject(Error("error"));
      }
    });
  };
  //删除转发内容
  deleteAdvise() {
    this.adviseEntiry = {};
  }
  //查询转发内容
  getForCont(item, pageInfo) {
    this.http
      .post(ENV.httpurl + "/api/exchangeAdvise/queryPageForForward", item, {
        params: pageInfo
      })
      .subscribe(
        data => {
          this.NativeService.hideLoading();
          if (data["rows"].length > 0) {
            this.adviseEntiry = data["rows"][0];
          }
        },
        error => {
          this.NativeService.hideLoading();
        }
      );
  }
  //申请人确认转发回复
  updateExchangeStatus = _.throttle(function(type) {
    this.NativeService.showLoading();
    return this.http
      .post(
        ENV.httpurl +
          "/api/exchangeAdvise/updateExchangeStatus" +
          "/" +
          this.editingEntry.id +
          "/" +
          type,
        {}
      )
      .subscribe(
        resp => {
          if (resp["result"]) {
            this.NativeService.hideLoading();
            this.NativeService.showAlert("操作成功！").then(() => {
              this.goback();
            });
          } else {
            this.NativeService.showAlert("操作失败！");
          }
        },
        error => {
          this.NativeService.hideLoading();
        }
      );
  }, 800);
  //转发意见反馈内容查看
  viewAdvise(entiry) {
    let chooseMOdel = this.modalCtrl.create("IstaffadviseViewPage", {
      entry: entiry
    });
    chooseMOdel.onDidDismiss(data => {});
    chooseMOdel.present();
  }
}
