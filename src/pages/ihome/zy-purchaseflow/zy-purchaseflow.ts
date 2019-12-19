import { zyglobalData } from "./../../../icommon/provider/zyglobalData";
import { NativeService } from "./../../../icommon/provider/native";
import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Slides,
  Events,
  Searchbar
} from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";
import _ from "lodash";
import "rxjs/add/operator/timeout";
declare var Swiper;
@IonicPage()
@Component({
  selector: "page-zy-purchaseflow",
  templateUrl: "zy-purchaseflow.html"
})
export class ZyPurchaseflowPage {
  //当前选择的分组按钮
  toggle = "awiatData";
  //第几页
  page: any = 1;
  //一页多少条
  pageSize: any = 2;
  userinfor: any;
  allList: any = [];
  //总条数
  totalCount: number;
  flowType: any;
  queryKey: any = "";
  currUserId: any;
  status: any = "1";
  pageInfo: any;
  url: any;
  title: any;
  swiper5: any;
  wfAlias: any;
  dbtotalCount: any;
  @ViewChild("contentSlides") contentSlides: Slides;
  menus: Array<string> = ["待处理", "已处理", "我的申请"];
  isShow: boolean = true;
  @ViewChild("searchBar") searchBar: Searchbar;
  address: any;
  constructor(
    public zyglobalData: zyglobalData,
    public http: HttpClient,
    public nativeService: NativeService,
    public navCtrl: NavController,
    public navParams: NavParams,
    private events: Events
  ) {
    this.wfAlias = "yqj_apply,yqj_apply_zx";
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
  }
  //返回上一层
  goback() {
    this.navCtrl.pop();
  }
  initSwiper() {
    let that = this;
    that.swiper5 = new Swiper(".pageMenuSlides4 .swiper-container", {
      slidesPerView: 2,
      spaceBetween: 0,
      breakpoints: {
        1024: {
          slidesPerView: 3,
          spaceBetween: 0
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 0
        },
        640: {
          slidesPerView: 3,
          spaceBetween: 0
        },
        320: {
          slidesPerView: 3,
          spaceBetween: 0
        }
      }
    });
  }
  selectPageMenu($event, index) {
    this.contentSlides.slideTo(index);
  }
  slideChanged() {
    let index = this.contentSlides.getActiveIndex();
    let that = this;

    that.setStyle(index);
    // that.swiper5.slideTo(index, 300);
  }
  setStyle(index) {
    var slides = document
      .getElementsByClassName("pageMenuSlides4")[0]
      .getElementsByClassName("swiper-slide");
    if (index < slides.length) {
      for (var i = 0; i < slides.length; i++) {
        var s = slides[i];
        s.className = "swiper-slide";
      }
      slides[index].className = "swiper-slide bottomLine";
    }
    switch (index) {
      case 0:
        this.toggle = "awiatData";
        this.events.publish(
          "zy-purchase:awiatData",
          "awiatData",
          this.queryKey
        );
        break;
      case 1:
        this.toggle = "dealData";
        this.events.publish("zy-purchase:dealData", "dealData", this.queryKey);
        break;
      case 2:
        this.toggle = "complateData";
        this.events.publish(
          "zy-purchase:complateData",
          "complateData",
          this.queryKey
        );
        break;
    }
  }
  ngOnDestroy() {
    this.events.unsubscribe("zy-purchase:awiatData");
    this.events.unsubscribe("zy-purchase:dealData");
    this.events.unsubscribe("zy-purchase:complateData");
  }
  ionViewWillEnter() {
    this.initSwiper();
    this.isShow = true;
  }
  ionViewDidEnter() {
    var slides = document
      .getElementsByClassName("pageMenuSlides4")[0]
      .getElementsByClassName("swiper-slide");
    for (var i = 0; i < slides.length; i++) {
      var s = slides[i];
      if (s.className.indexOf("bottomLine") > -1) {
        this.selectPageMenu(null, i);
        this.swiper5.params.initialSlide = i;
        this.getConut();
        if (this.swiper5.params.initialSlide == 0) {
          this.setStyle(i);
        }
      }
    }
  }
  ionViewDidLeave() {
    this.swiper5.destroy(true, true);
  }
  getConut() {
    this.page = -1;
    this.pageInfo = { page: this.page, pageSize: this.pageSize };
    this.http
      .post(
        ENV.httpurlzyscm + "/api/wfApp/queryDbNotityCountApp/" + this.wfAlias,
        {},
        {
          params: this.pageInfo
        }
      )
      .subscribe(
        data => {
          if (data["total"] > 0) {
            this.dbtotalCount = data["total"] > 99 ? "99+" : data["total"];
          } else {
            this.dbtotalCount = "";
          }
        },
        error => {}
      );
  }
  toggleClick(event: any) {
    this.toggle = event;
    setTimeout(() => {
      this.loadOrderDataFn();
    }, 200);
  }
  loadOrderDataFn() {
    this.getConut();
  }

  ionViewWillLeave() {
    let that = this;
    that.isShow = false;
    this.events.unsubscribe("zy-purchase:awiatData");
    this.events.unsubscribe("zy-purchase:dealData");
    this.events.unsubscribe("zy-purchase:complateData");
  }
  clear() {
    this.address = "";
    this.searchBar.value = "";
    this.queryKey = "";
    this.getItems();
  }
  inputchange() {
    if (this.address.trim() == "") {
      this.getItems();
    }
  }
  keyUpSearch(event) {
    if (event.keyCode == 13) {
      this.getItems();
    }
  }
  getItems() {
    let that = this;
    var val = this.address;
    if (val && val.trim() != "") {
      this.queryKey = val;
      this.page = 1;
      this.loadOrderDataFn();
    } else {
      this.queryKey = "";
      this.page = 1;
      this.loadOrderDataFn();
    }
    switch (this.toggle) {
      case "awiatData":
        this.events.publish(
          "zy-purchase:awiatData",
          this.toggle,
          this.queryKey
        );
        break;
      case "dealData":
        this.events.publish("zy-purchase:dealData", this.toggle, this.queryKey);
        break;
      case "complateData":
        this.events.publish(
          "zy-purchase:complateData",
          this.toggle,
          this.queryKey
        );
        break;
    }
  }
}
