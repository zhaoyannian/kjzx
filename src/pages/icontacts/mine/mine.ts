import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, Slides,Events } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import * as $ from 'jquery';
import { MineviewPage } from '../mineview/mineview';
import { NativeService } from '../../../icommon/provider/native';
import { AlphaListComponent } from '../../../icommon/modules/alpha-list/alpha-list';
import _ from 'lodash';
import { SettingPage } from '../../imine/setting/setting';
declare var Swiper;
@Component({
  selector: 'page-mine',
  templateUrl: 'mine.html'
})
export class MinePage {
  data: any = [];//人员数据
  dept: any = [];//企业/部门数据
  state: any = ENV.httpurl;
  items = [];
  allItems: any;
  searchText: string;
  searchItems: any;
  isFilter = false;
  //总条数
  totalCount: number;
  page: any = 1;
  //一页多少条
  pageSize: any = 20;
  userinfo: any = {};
  userinforList: any;
  httpurl: any = ENV.httpurl;
  @ViewChild(AlphaListComponent) alist: AlphaListComponent;
  swiper2: any;
  @ViewChild('contentSlides') contentSlides: Slides;
  menus: Array<string> = ["人员通讯录", "机构通讯录"];
  constructor(public navCtrl: NavController, private modal: ModalController, public http: HttpClient,private events: Events,
    private nat: NativeService) {
    this.userinforList = JSON.parse(localStorage.getItem("objectList"));

    this.userinfo.picture = this.userinforList.staff.photo;
    // this.http.get(ENV.httpurl + '/api/addressApi/orgs/0').subscribe(data => {
    //   this.dept = data;
    // });
  }
  ionViewWillEnter() {
    // this.init(null);
    this.initSwiper();
  }
  initSwiper() {
    let that = this;
    that.swiper2 = new Swiper('.pageMenuSlides2 .swiper-container', {
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
  selectPageMenu($event, index) {
    this.setStyle(index);
    this.contentSlides.slideTo(index);
  }
  slideChanged() {
    let index = this.contentSlides.getActiveIndex();
    let that = this;
    that.setStyle(index);
    if(index ==0){
      that.events.publish('tabs:slide0', 'slide0');
    }
    that.swiper2.slideTo(index, 300);
    this.events.publish('tabs:slide0', 'slide0');
  }

  setStyle(index) {
    var slides = document.getElementsByClassName('pageMenuSlides2')[0].getElementsByClassName('swiper-slide');
    if (index < slides.length) {
      for (var i = 0; i < slides.length; i++) {
        var s = slides[i];
        s.className = "swiper-slide";
      }
      slides[index].className = "swiper-slide bottomLine";
    }
  }
  presentFilter() {
    this.navCtrl.push(SettingPage);
  }
  getcontact() {
    this.items = [];
    this.data.forEach((idx) => {
      idx.data.forEach((item) => {
        this.items.push(item);
      });
    });
    this.allItems = this.items.concat();
  }
  //刷新
  tabslideRefreshFn(refresher) {
    this.init(refresher)
    this.page = 1;
  }
  init(refresher) {
    if (!refresher) {
      this.nat.showLoading();
    }
    this.http.get(ENV.httpurl + '/api/addressApi/ulistNew/'+this.userinforList.staff.userId+'?page=' + this.page + '&pageSize=' + this.pageSize).subscribe(data => {
      this.totalCount = data['count'];
      this.data = data['data'];
      this.data.count = 0;
      _.map(this.data, n => {
        this.data.count += n.data.length;
      })
      if (!!refresher) {
        refresher.complete();
      }
      this.getcontact();
      this.nat.hideLoading();
    }, error => {
      if (!!refresher) {
        refresher.complete();
      }
      this.nat.hideLoading();
    });
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    if (this.totalCount == this.data.count) {
      infiniteScroll.complete();
    } else {
      this.page += 1;
      this.http.get(ENV.httpurl + '/api/addressApi/ulist?page=' + this.page + '&pageSize=' + this.pageSize).subscribe(data => {
        this.data = this.data.concat(data['data']);;
        this.data.count = 0;
        _.map(this.data, n => {
          this.data.count += n.data.length;
        })
        this.getcontact();
        infiniteScroll.complete();
      })
    }
  }
  getCurrentItems(ev: any) {
    if (!this.searchText) {
      this.searchItems = this.allItems.concat();
      this.isFilter = false;
      return;
    }
    this.isFilter = true;
    let val = ev.target.value;
    if (val && val.trim() != '') {
      this.searchItems = this.allItems.filter((item) => {
        return (item.userName.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
          item.type.toLowerCase().indexOf(val.toLowerCase()) > -1
        );
      });
    }
  }

  onClearFilter(ev: any) {
    this.isFilter = false;
  }
  goDetail(contact) {
    // this.navCtrl.push(MineviewPage, { 'info': contact });
    let modal = this.modal.create(MineviewPage, { 'info': contact });
    modal.present();
  }
  /**
   * 跳锚点
   * @param id 元素ID
   * @param i 交互下标
   */
  goList(id, i) {
    let el = document.getElementById(id);
    if (el) {
      el.scrollIntoView();
      $('.content').append('<span class="english">' + id + '</span>');
      $('span.english').fadeOut(800, function () {
        $(this).remove();
      });
    }
  }

  /**
   * 跳部门
   * @param id 部门ID
   * @param title 企业名称
   */
  goDept(id, title) {
    let param = [{ 'id': id, 'title': title }];
    this.navCtrl.push('MinedeptPage', { 'bread': param });
  }

  /**
   * 查看通讯录好友详情
   * @param item 
   */
  goView(item) {
    let modal = this.modal.create(MineviewPage, { 'info': item });
    modal.present();
  }

  /**
   * 如果photo为空，返回默认头像
   * @param photo 
   */
  getImg(photo) {
    if (!!photo) {
      return ENV.httpurl + '/base/fileinfo/getFileImage?id=' + photo;
    } else {
      return 'assets/imgs/people-head.png';
    }
  }



}
