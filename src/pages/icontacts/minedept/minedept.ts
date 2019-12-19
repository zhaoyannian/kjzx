import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform, Navbar,Events } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { NativeService } from '../../../icommon/provider/native';

/**
 * Generated class for the MinedeptPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-minedept',
  templateUrl: 'minedept.html',
})
export class MinedeptPage {
  title = '';
  model: any = [];//部门数据
  address: any = [];//通讯数据
  @ViewChild(Navbar) navBar: Navbar;//返回按钮
  mianbao: any = [];
  dept: any = [];
  param:any=[]
  page: any = 1;
  //一页多少条
  pageSize: any = 20;
  totalCount:any;
  orgId:any;
  constructor(private events: Events,public navCtrl: NavController, public navParams: NavParams, public http: HttpClient,
    private modal: ModalController, private platform: Platform, private nat: NativeService) {
    //注册物理返回键,直接返回到通讯录，而不一级一级返回
    // if (this.nat.isMobile()) {
    //   this.platform.ready().then(() => {
    //     this.platform.registerBackButtonAction(() => {
    //       this.navCtrl.popToRoot();
    //     });
    //   })
    // }

  }
  ngOnInit() {
    this.events.subscribe('tabs:slide0', (num, time) => {
      this.page=1;
      this.init(null,'slide0');
    });
    this.init('go','slide1');
    //注册返回键事件:订单提交成功后，进入本页，需要此事件返回根目录，而不再返回购物车页,menglong
    // this.navBar.backButtonClick = (e: UIEvent) => {
    //   this.navCtrl.popToRoot();
    // }
  }

  async init(type,slide) {
    if(slide == 'slide1'){
      this.nat.showLoading();
    }
    this.http.get(ENV.httpurl + '/api/addressApi/orgs/0').subscribe(async data => {
      this.dept = data;
      this.bread(type,data);
    });
  }
  async bread(type,data) {
    // if (this.navParams.get('bread') == undefined && this.navParams.data.length <= 0) {
    //   return;
    // }
    // this.mianbao = this.navParams.get('bread') || this.navParams.data;
    this.mianbao = data;
    this.title = this.mianbao[0]['deptName'];
    let max;
    if (type == 'go') {
      //获取面包屑最低长度
      max = this.mianbao.length - 1;
    } else {
      //获取面包屑最低长度
      max = this.mianbao.length - 1;
    }
    //取最后一组ID做为当前查询依据
    this.orgId = this.mianbao[max]['orgId'];
    // this.nat.showLoading();
    await this.http.get(ENV.httpurl + '/api/addressApi/orgs/' + this.orgId).subscribe(async data => {
      this.model = data;
      //如果返回空，就说明没有下级部门，获取所属成员
      // if(data['length'] ==0) {
      //   await this.http.get(ENV.httpurl + '/api/addressApi/orgus/' + orgId).subscribe(data => {
      //     this.address = data;
      //     this.nat.hideLoading();
      //   });
      // }else{
      //   this.nat.hideLoading();
      //   this.address = [];
      // }
    }, error => {
      this.nat.hideLoading();
    });
    await this.getdeptMember();
  }
  getdeptMember(){
     this.http.get(ENV.httpurl + '/api/addressApi/orgus/' +this. orgId+'?page=' + this.page + '&pageSize=' + this.pageSize).subscribe(data => {
       this.totalCount = data['count'];
      this.address = data['data'];
      this.nat.hideLoading();
    });
  }
   //刷新
   tabslideRefreshFn(refresher) {
    this.page = 1;
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    let that = this;
    if (this.totalCount == this.address.length) {
      infiniteScroll.complete();
    } else {
      this.page += 1;
      this.http.get(ENV.httpurl + '/api/addressApi/orgus/' +this. orgId+'?page=' + this.page + '&pageSize=' + this.pageSize).subscribe( data =>{
        this.address = this.address.concat(data['data']);;
        infiniteScroll.complete();
      })
    }
  }
  /**
   * 跳部门
   * @param id 
   */
  goDept(orgId, deptName) {
    // param = this.navParams.get('bread') ? this.navParams.get('bread') : this.navParams.data;
    this.mianbao.push({ 'orgId': orgId, 'deptName': deptName });
    this.address = [];
    this.model = [];
    this.page =1;
    this.bread('go',this.mianbao);
    // this.navCtrl.push('MinedeptPage',{'bread': param});
  }

  /**
   * 查看通讯录好友详情
   * @param item 
   */
  goView(item) {
    // this.navCtrl.push('MineviewPage', { 'info': item })
    let modal = this.modal.create('MineviewPage', { 'info': item });
    modal.present();
  }
  goback() {
    this.navCtrl.pop();
  }
  /**
   * 面包屑后退
   * @param i 下标
   */
  retreat(i) {
    //如果下标等于面包数组最大长度，视为当前层级，不可点击
    if (this.mianbao.length - 1 == i) {
      return false;
    }

    //移除i之后的所有数组
    this.mianbao = this.mianbao.slice(0, i + 1);
    this.param = this.mianbao;
    this.page =1;
    this.bread('back',this.param);
    // this.navCtrl.push('MinedeptPage',{'bread': this.mianbao});
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
