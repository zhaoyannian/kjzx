import { zyglobalData } from "./../../../icommon/provider/zyglobalData";
import { Component, ViewChild } from "@angular/core";
import { IonicPage, NavController, NavParams, Slides } from "ionic-angular";
declare var Swiper;
/**
 * Generated class for the WorkFlowPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-zywork-flow",
  templateUrl: "zywork-flow.html"
})
export class ZyWorkFlowPage {
  opinionList: any;
  points: any;
  toggle = "listData";
  pointInstStatuss: any;
  strength = {
    waiting: false,
    inprocess: false,
    complate: false,
    back: false,
    null: false
  };
  wfHolderObj: any;
  swiper2: any;
  @ViewChild("contentSlides") contentSlides: Slides;
  @ViewChild(Slides) slides: Slides;
  index: number = 0;
  menus: Array<string> = ["办理意见列表", "流程图"];
  constructor(
    public globalData: zyglobalData,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.pointInstStatuss = {
      waiting: "待处理",
      inprocess: "启动",
      complate: "完成",
      back: "回退"
    };
  }
  ionViewDidLoad() {
    this.wfHolder();
    this.initSwiper();
  }
  initSwiper() {
    let that = this;
    that.swiper2 = new Swiper(".pageMenuSlides2 .swiper-container", {
      slidesPerView: 2,
      spaceBetween: 0,
      breakpoints: {
        1024: {
          slidesPerView: 2,
          spaceBetween: 0
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 0
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 0
        },
        320: {
          slidesPerView: 2,
          spaceBetween: 0
        }
      }
    });
  }
  goToSlide(index) {
    this.slides.slideTo(index, 500);
    this.addActive(index);
  }
  // 滑动切换
  slideDidChange() {
    let currentIndex = this.slides.getActiveIndex();
    this.addActive(currentIndex);
  }
  // 改变tab 颜色
  addActive(index) {
    this.index = index;
    // this.slides.container.scrollTop = 0;
    if (index == 0) {
      this.toggle = "awiatData";
    } else if (index == 1) {
      this.toggle = "complateData";
    }
  }
  selectPageMenu($event, index) {
    this.setStyle(index);
    this.contentSlides.slideTo(index);
  }
  slideChanged() {
    let index = this.contentSlides.getActiveIndex();
    let that = this;
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
  }
  wfHolder() {
    if (!!this.navParams.get("wfAlias")) {
      this.globalData
        .getHolderFromWfAliasRef(
          this.navParams.get("wfAlias"),
          this.navParams.get("ref"),
          null
        )
        .subscribe(async data => {
          this.wfHolderObj = this.globalData.compOtherInfo(data);
          await this.getOptionAll(this.wfHolderObj);
        });
    } else {
      // let a= this.globalData.getHolderFromWfAliasRef(wfAlias,this.navParams.get("ref"),null)
    }
  }
  // 获取办理意见列表（1、获取工作流配置、实例信息得到wfHolder）
  getOptionAll(wfHolderObj) {
    this.points = this.globalData.getPoints(wfHolderObj);
    this.opinionList = this.globalData.getOpinions(wfHolderObj);
  }
  toggleClick(event: any) {
    this.toggle = event;
  }
  goback() {
    this.navCtrl.pop();
  }
}
