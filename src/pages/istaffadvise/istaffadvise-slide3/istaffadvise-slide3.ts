import { Component, ViewChild } from "@angular/core";
import {
  NavController,
  NavParams,
  Events,
  Searchbar,
  ModalController
} from "ionic-angular";
import { NativeService } from "../../../icommon/provider/native";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";
import { Subject } from "rxjs/Rx";
import _ from "lodash";
@Component({
  selector: "page-istaffadvise-slide3",
  templateUrl: "istaffadvise-slide3.html"
})
export class IstaffadviseSlide3Page {
  httpurl: any = ENV.httpurl;
  userinfo: any = {};
  userinforList: any;
  toggle: any;
  objMap: any = {};
  allList: any = [];
  //总条数
  totalCount: number = 0;
  //第几页
  page: any = 1;
  //一页多少条
  pageSize: any = 10;
  queryKey: any = "";
  @ViewChild("searchBar") searchBar: Searchbar;
  status: any;
  searchTextStream: Subject<string> = new Subject<string>(); //允许将值多播到多个观察者Observer
  constructor(
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public NativeService: NativeService,
    public http: HttpClient,
    private events: Events
  ) {
    this.status = {
      DFP: "待分配",
      DHF: "待回复",
      YHF: "已回复",
      QBHF: "全部回复",
      YZFHF: "已转发回复"
    };
    this.userinforList = JSON.parse(localStorage.getItem("objectList"));
    this.userinfo.picture = this.userinforList.staff.photo;
  }
  ngOnDestroy() {
    this.events.unsubscribe("istaffadvise:slide2");
  }
  ngOnInit() {
    this.events.subscribe("istaffadvise:slide2", async (id, key) => {
      this.toggle = id;
      this.queryKey = key;
      await this.loadOrderDataFn();
    });
  }
  loadOrderDataFn() {
    this.NativeService.showLoading();
    let data = {
      orderType: "reply",
      showAll: "TRUE"
    };
    this.page = 1;
    let pageInfo = {
      page: 1,
      pageSize: this.pageSize,
      queryKey: this.queryKey
    };
    this.commonLoad(data, pageInfo, null);
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    if (this.totalCount == this.allList.length) {
      infiniteScroll.complete();
    } else {
      let data = {
        orderType: "reply",
        showAll: "TRUE"
      };
      this.page += 1;
      let pageInfo = {
        page: this.page,
        pageSize: this.pageSize,
        queryKey: this.queryKey
      };
      this.commonLoad(data, pageInfo, infiniteScroll);
    }
  }
  commonLoad(data, pageInfo, infiniteScroll) {
    this.http
      .post(ENV.httpurl + "/api/exchangeAdvise/queryPageForReply", data, {
        params: pageInfo
      })
      .subscribe(
        data => {
          this.NativeService.hideLoading();
          if (this.page == 1) {
            this.totalCount = data["count"];
            this.allList = data["data"];
          } else {
            this.allList = this.allList.concat(data["data"]);
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
  goReply(item,type) {
    this.navCtrl.push("IstaffadviseDetailPage", {
      entry: item,
      toggle: "reply",
      opeType: type
    });
  }
}
