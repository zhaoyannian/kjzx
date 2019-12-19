import { Component, ViewChild } from "@angular/core";
import { NativeService } from "./../../../icommon/provider/native";
import { ENV } from "@env/environment";
import {
  NavController,
  NavParams,
  AlertController,
  Searchbar,
  Events
} from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs/Rx";

@Component({
  selector: "page-istaffadvise-slide4",
  templateUrl: "istaffadvise-slide4.html"
})
export class IstaffadviseSlide4Page {
  //第几页
  page: any = 1;
  //一页多少条
  pageSize: any = 10;
  queryKey: any = "";
  userinfor: any;
  toggle: any;
  allList: any = [];
  //总条数
  totalCount: number = 0;
  status: any;
  @ViewChild("searchBar") searchBar: Searchbar;
  searchTextStream: Subject<string> = new Subject<string>(); //允许将值多播到多个观察者Observer
  constructor(
    private alerCtrl: AlertController,
    public nativeService: NativeService,
    public NavCtrl: NavController,
    public navParams: NavParams,
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
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
  }
  ngOnDestroy() {
    this.events.unsubscribe("istaffadvise:slide3");
  }
  ngOnInit() {
    this.events.subscribe("istaffadvise:slide3", async (id, key) => {
      this.toggle = id;
      this.queryKey = key;
      await this.loadOrderDataFn();
    });
  }
  loadOrderDataFn() {
    this.nativeService.showLoading();
    let data = {
      showAll: "TRUE",
      isShow: "TRUE"
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
        appUserId: ""
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
      .post(ENV.httpurl + "/api/exchangeAdvise/queryPage", data, {
        params: pageInfo
      })
      .subscribe(
        data => {
          this.nativeService.hideLoading();
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
          this.nativeService.hideLoading();
          if (!!infiniteScroll) {
            infiniteScroll.complete();
          }
        }
      );
  }
  goShowDetail(item) {
    this.NavCtrl.push("IstaffadviseDetailPage", {
      entry: item,
      toggle: "view",
      opeType: "view"
    });
  }

  goback() {
    this.NavCtrl.pop();
  }
}
