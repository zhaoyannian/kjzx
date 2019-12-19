import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController,Events } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import * as $ from 'jquery';
import { NativeService } from '../../../../icommon/provider/native';
import _ from 'lodash';
import { MineviewPage } from '../../mineview/mineview';
import { Observable, Subject} from 'rxjs';
import {of} from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';
/**
 * Generated class for the MinecontactPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-minecontact',
  templateUrl: 'minecontact.html',
})
export class MinecontactPage {
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
  userinfor: any;
  httpurl: any = ENV.httpurl;
  heroes$: Observable<any []>;
  private searchTerms = new Subject<string>();
  showcount:boolean =false;
  @ViewChild('searchBox') searchBox: any;
  constructor(public navCtrl: NavController, private modal: ModalController, public http: HttpClient,private events: Events,
    private nat: NativeService) {
      this.userinfor= JSON.parse(localStorage.getItem("objectList"));
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }
  ngOnInit(){
    this.events.subscribe('tabs:slide0', (num, time) => {
      this.searchBox.value = '';
      this.page = 1;
      this.isFilter = false;
      this.init(null,'slide0');
    });
    this.init(null,'slide1');
    this.searchBox.value = ''
    this.heroes$ = this.searchTerms.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((term: string) => this.searchHeroes(term))
    )
  }
  searchHeroes(term: string): Observable<any> {
    if (!term.trim()) {
      this.isFilter = false;
      return of([])
    }
    this.isFilter = true;
    this.page = 1;
    return this.http.get<any[]>(ENV.httpurl + '/api/addressApi/ulistNew/'+this.userinfor.staff.userId+'?page=' + this.page + '&pageSize=100&queryKey='+term).pipe(
      map(data => data['data']),
      tap(_ => console.log(`found heroes matching "${term}"`))
    )
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
  onClearFilter(ev: any) {

  }
  //刷新
  tabslideRefreshFn(refresher) {
    this.page = 1;
    this.init(refresher,'slide1')
  }
  init(refresher,slide) {
    if (!refresher && slide == 'slide1') {
      this.nat.showLoading();
    }
    
    this.http.get(ENV.httpurl + '/api/addressApi/ulistNew/'+this.userinfor.staff.userId+'?page=' + this.page + '&pageSize=' + this.pageSize).subscribe(data => {
    // this.http.get(ENV.httpurl + '/api/addressApi/ulist?page=' + this.page + '&pageSize=' + this.pageSize).subscribe(data => {
      this.totalCount = data['count'];
      this.data = data['data'];
      // this.data.count = 0;
      // _.map(this.data, n => {
      //   this.data.count += n.data.length;
      // })
      if (!!refresher) {
        refresher.complete();
      }
      if (!refresher && slide == 'slide1') {
        this.nat.hideLoading();
      }
    }, error => {
      if (!!refresher) {
        refresher.complete();
      }
      if (!refresher && slide == 'slide1') {
        this.nat.hideLoading();
      }
    });
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    let that = this;
    if (this.totalCount == this.data.count) {
      this.showcount = true;
      infiniteScroll.complete();
    } else {
      this.page += 1;
      this.http.get(ENV.httpurl + '/api/addressApi/ulistNew/'+this.userinfor.staff.userId+'?page=' + this.page + '&pageSize=' + this.pageSize).subscribe(data => {
        this.data = this.data.concat(data['data']);;
        // that.data.count = 0;
        // _.map(that.data, n => {
        //   that.data.count += n.data.length;
        // })
        infiniteScroll.complete();
      })
    }
  }
  /**
   * 查看通讯录好友详情
   * @param item 
   */
  goView(item) {
    let modal = this.modal.create(MineviewPage, { 'info': item });
    modal.present();
  }
}
