import { Component ,ViewChild} from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { NewsDetailPage } from './newsDetail'
import { ENV } from '@env/environment';
import { globalData } from '../../../../icommon/provider/globalData';
import { NativeService } from '../../../../icommon/provider/native';
import { Observable, Subject} from 'rxjs';
import {of} from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

//@IonicPage()
@Component({
  selector: 'page-newsImg',
  templateUrl: 'newsText.html',
})
export class NewsTextPage {

  newTitle: any;
  newList: any;
  httpurl: any = ENV.httpurl;;
  menuId: any;
  firstEntry: any = {};//第一条顶部新闻
  pageInfo: any = {
    page: 1,//第几页
    pageSize: 10,//一页多少条
  }
  infiniteScroll: any;
  nomoreData:boolean= false;
  searchText: string;
  searchItems: any;
  heroes$: Observable<any []>;
  private searchTerms = new Subject<string>();
  @ViewChild('searchBox') searchBox: any;
  isFilter = false;
  page: any = 1;
  count:any;
  constructor(public navCtrl: NavController, public nat: NativeService, public navParams: NavParams, public http: HttpClient, public g: globalData) {
    let str = this.navParams.get("entity").mobleMenuType;
    this.newTitle = this.navParams.get("entity").name;
    this.menuId = str;
    this.loadOrderDataFn(null)
  }
  search(term: string): void {
    this.searchTerms.next(term);
  }
  ionViewDidEnter() {

  }
  ngOnInit(){
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
      this.count = 1;
      return of([])
    }
    this.isFilter = true;
    this.pageInfo.page = 1;
    let pa = {
      statusCodeArr: ['publIng'],
      menuId: this.menuId,
      title:term
    };
    this.pageInfo.title = term;
    return this.http.post<any[]>(ENV.httpurl + '/api/publArticle/queryilApp' ,pa, { params: this.pageInfo }).pipe(
      map(data => {
        this.count = data['count'];
        return data['data'];
      }),
      tap(_ => console.log(`found heroes matching "${term}"`))
    )
  }
  onClearFilter(ev: any) {

  }
  goback(){
    this.navCtrl.pop();
  }
  loadOrderDataFn(refresher) {
    this.nomoreData = false;
    this.nat.showLoading();
    this.init(refresher, null)
  }
  init(refresher, infiniteScroll) {
    let pa = {
      statusCodeArr: ['publIng'],
      menuId: this.menuId
    };
    this.http.post(ENV.httpurl + "/api/publArticle/queryilApp", pa, { params: this.pageInfo }).subscribe(async (resp) => {
      if (this.pageInfo.page == 1) {
        //第一页
        this.newList = resp['data'];
        // this.newList = resp['data'].slice(1);
        // this.firstEntry = resp['data'][0];
      } else {
        this.newList = this.newList.concat(resp['data']);
      }
      if (!!refresher) {
        refresher.complete()
      }
      if (infiniteScroll) {
        infiniteScroll.complete();
        if (this.newList.length >= resp['count'] - 1) {
          infiniteScroll.enable(false);
          this.nomoreData = true;
          this.infiniteScroll = infiniteScroll;
        }
      }
      this.nat.hideLoading();
    });
  }
  //刷新
  tabslideRefreshFn(refresher) {
    this.newList = [];
    this.pageInfo.page = 1;
    if (!!this.infiniteScroll) {
      //为了解决翻到最后一页，翻页组件被enable(false)禁用，刷新后不能在翻页的问题
      this.infiniteScroll.enable(true);
    }
    this.loadOrderDataFn(refresher);
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    this.pageInfo.page += 1;
    this.init(null, infiniteScroll)
  }
  viewNewsDetialFn(obj) {
    obj.readStatus = '已读';
    this.navCtrl.push(NewsDetailPage, { entity: obj, type: 'text', title: this.newTitle });
    this.http.post(ENV.httpurl + "/api/publArticle/viewArtcile_more/" + obj.id, {}).subscribe(data => {

    });
  }

}
