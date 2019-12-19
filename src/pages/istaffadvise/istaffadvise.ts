import { Component, ViewChild } from "@angular/core";
import {
  NavController,
  NavParams,
  Events,
  Searchbar,
  ModalController,
  Slides,
  App
} from "ionic-angular";
import { NativeService } from "../../icommon/provider/native";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";
import { Subject } from "rxjs/Rx";
import _ from "lodash";
declare var Swiper;

declare var window;

@Component({
  selector: "page-istaffadvise",
  templateUrl: "istaffadvise.html"
})
export class IstaffadvisePage {
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
  address: any;
  searchTextStream: Subject<string> = new Subject<string>(); //允许将值多播到多个观察者Observer
  @ViewChild("contentSlides") contentSlides: Slides;
  menus: Array<string> = ["我的", "分配", "回复", "展示"];
  isShow: boolean = true;
  swiper2: any;
  //领导（分配意见办理人）
  showOne: boolean = false;
  pageView: any;
  roles: any = [];
  constructor(
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public NativeService: NativeService,
    public http: HttpClient,
    private events: Events,
    private app: App
  ) {
    this.userinforList = JSON.parse(localStorage.getItem("objectList"));
    this.roles = this.userinforList["rolesTo"]
      ? _.map(this.userinforList["rolesTo"], "name")
      : [];
    this.showOne =
      _.includes(this.roles, "fpfzr") || _.includes(this.roles, "superAdmin")
        ? true
        : false;

    if (this.showOne) {
      this.toggle = "assignment";
      this.menus = ["我的", "分配", "回复", "展示"];
    } else {
      this.toggle = "reply";
      this.menus = ["我的", "回复", "展示"];
    }
  }
  ionViewDidLoad() {
    // this.loadOrderDataFn();
    this.initSwiper();
    if (this.showOne) {
      this.pageView = "istaffadvise:slide0";
    } else {
      this.pageView = "istaffadvise:slide0";
    }
    this.events.publish(this.pageView, this.toggle, this.queryKey);
    this.isShow = true;
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
      // this.loadOrderDataFn();
    } else {
      this.queryKey = "";
      this.page = 1;
      // this.loadOrderDataFn();
    }
    switch (this.toggle) {
      case "myAdvise":
        this.events.publish("istaffadvise:slide0", this.toggle, this.queryKey);
        break;
      case "assignment":
        this.events.publish("istaffadvise:slide1", this.toggle, this.queryKey);
        break;
      case "reply":
        this.events.publish("istaffadvise:slide2", this.toggle, this.queryKey);
        break;
      case "view":
        this.events.publish("istaffadvise:slide3", this.toggle, this.queryKey);
        break;
    }
  }
  initSwiper() {
    let that = this;
    that.swiper2 = new Swiper(".pageMenuSlides2 .swiper-container", {
      slidesPerView: this.menus.length,
      spaceBetween: 0,
      breakpoints: {
        1024: {
          slidesPerView: this.menus.length,
          spaceBetween: 0
        },
        768: {
          slidesPerView: this.menus.length,
          spaceBetween: 0
        },
        640: {
          slidesPerView: this.menus.length,
          spaceBetween: 0
        },
        320: {
          slidesPerView: this.menus.length,
          spaceBetween: 0
        }
      }
    });
  }
  selectPageMenu($event, index) {
    this.contentSlides.slideTo(index);
  }
  ionViewWillLeave() {
    this.isShow = false;
  }
  ngOnDestroy() {
    this.events.unsubscribe("istaffadvise:slide0");
    this.events.unsubscribe("istaffadvise:slide1");
    this.events.unsubscribe("istaffadvise:slide2");
    this.events.unsubscribe("istaffadvise:slide3");
  }
  slideChanged() {
    let index = this.contentSlides.getActiveIndex();
    let that = this;
    // this.loadOrderDataFn();
    that.setStyle(index);
    that.swiper2.slideTo(index, 300);
  }
  setStyle(index) {
    var slides = document
      .getElementsByClassName("pageMenuSlides2")[0]
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
        this.toggle = "myAdvise";
        this.events.publish("istaffadvise:slide0", this.toggle, this.queryKey);
        break;
      case 1:
        if (this.showOne) {
          this.toggle = "assignment";
          this.pageView = "istaffadvise:slide1";
        } else {
          this.toggle = "reply";
          this.pageView = "istaffadvise:slide2";
        }
        this.events.publish(this.pageView, this.toggle, this.queryKey);
        break;
      case 2:
        if (this.showOne) {
          this.toggle = "reply";
          this.pageView = "istaffadvise:slide2";
        } else {
          this.toggle = "view";
          this.pageView = "istaffadvise:slide3";
        }
        this.events.publish(this.pageView, this.toggle, this.queryKey);
        break;
      case 3:
        this.toggle = "view";
        this.events.publish("istaffadvise:slide3", this.toggle, this.queryKey);
        break;
    }
  }
  loadOrderDataFn() {
    this.NativeService.showLoading();
    let data = {
      appUserId: ""
    };
    this.page = 1;
    let pageInfo = {
      page: 1,
      pageSize: this.pageSize,
      queryKey: this.queryKey
    };
    this.commonLoad(data, pageInfo, null);
  }
  commonLoad(data, pageInfo, infiniteScroll) {
    this.http
      .post(ENV.httpurl + "/api/VisitAdmini/queryYBVisitAdmini", data, {
        params: pageInfo
      })
      .subscribe(
        data => {
          this.NativeService.hideLoading();
          if (this.page == 1) {
            this.totalCount = data["count"];
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
  //返回上一层
  goback() {
    this.navCtrl.pop();
  }
  //新增
  addFn() {
    this.navCtrl.push("IstaffadviseDetailPage", {
      item: "",
      toggle: this.toggle,
      opeType: "cre"
    });
  }
}
