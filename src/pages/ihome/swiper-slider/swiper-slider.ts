import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
declare var Swiper;

@IonicPage()
@Component({
  selector: 'page-swiper-slider',
  templateUrl: 'swiper-slider.html',
})
export class SwiperSliderPage {
  swiper: any;
  typeMold: any;
  aliasMold: any;
  toggle: any;
  @ViewChild('contentSlides') contentSlides: Slides;
  menus: Array<string> = ["待办", "已办", "我的申请"];
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.typeMold = this.navParams.get("type");
    this.aliasMold = this.navParams.get("alias");
  }

  ionViewDidLoad() {
    let that = this;
    that.initSwiper();
    that.typeMold = that.navParams.get("type");
    that.aliasMold = that.navParams.get("alias");
  }
  initSwiper() {
    this.swiper = new Swiper('.pageMenuSlides .swiper-container', {
      slidesPerView: 3,
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
      },
      activeIndex: this.typeMold == 1 ? 2 : 0
    });
    if (this.typeMold == 1) {
      this.swiper.slideTo(2, 300);
      this.contentSlides.slideTo(2);
      this.setStyle(2);
      this.toggle = 'AllData'
    } else {
      this.swiper.slideTo(0, 300);
      this.contentSlides.slideTo(0);
      this.setStyle(0);
      this.toggle = 'awiatData'
    }

  }
  selectPageMenu($event, index) {
    if (index == 0) {
      this.toggle = 'awiatData'
    } else if (index == 1) {
      this.toggle = 'complateData'
    } else if (index == 2) {
      this.toggle = 'complateData'
    }
    this.setStyle(index);
    this.contentSlides.slideTo(index);
  }
  slideChanged() {
    let index = this.contentSlides.getActiveIndex();
    if (index == 0) {
      this.toggle = 'awiatData'
    } else if (index == 1) {
      this.toggle = 'complateData'
    } else if (index == 2) {
      this.toggle = 'complateData'
    }
    this.setStyle(index);
    this.swiper.slideTo(index, 300);
  }

  setStyle(index) {
    var slides = document.getElementsByClassName('pageMenuSlides')[0].getElementsByClassName('swiper-slide');
    if (index < slides.length) {
      for (var i = 0; i < slides.length; i++) {
        var s = slides[i];
        s.className = "swiper-slide";
      }
      slides[index].className = "swiper-slide bottomLine";
    }
  }

}
