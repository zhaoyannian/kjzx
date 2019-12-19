import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from "ionic-angular";
import { NativeService } from "../../../icommon/provider/native";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";
import { Subject } from "rxjs/Rx";
import { FileService } from "./../../../icommon/provider/FileService";
import _ from "lodash";
import { queryListFileUri } from "../../../icommon/provider/Constants";
declare var window;

@IonicPage()
@Component({
  selector: "page-istaffadvise-view",
  templateUrl: "istaffadvise-view.html"
})
export class IstaffadviseViewPage {
  httpurl: any = ENV.httpurl;
  editable: any;
  editingEntry: any = {};
  searchTextStream: Subject<string> = new Subject<string>(); //允许将值多播到多个观察者Observer
  fileList: any = [];
  title: any;
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
  opinion: any;
  adviseEntiry: any = {};
  @ViewChild("uploadImg") uploadImg: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public NativeService: NativeService,
    public http: HttpClient,
    public FileService: FileService,
    private viewCtrl: ViewController
  ) {
    this.status = {
      DFP: "待分配",
      DHF: "待回复",
      YHF: "已回复",
      QBHF: "全部回复"
    };
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
    // this.getForCont(this.editingEntry, pageInfo);
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
  //返回上一层
  goback() {
    this.viewCtrl.dismiss();
  }

  //获取附件信息
  queryListFile(file) {
    this.http
      .get(ENV.httpurl + queryListFileUri + "/" + file)
      .subscribe(data => {
        this.fileList = data;
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
}
