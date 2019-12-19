import { NativeService } from './../../../../icommon/provider/native';
import { globalData } from './../../../../icommon/provider/globalData';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';
import _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { Observable, Subject } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';
/**
 * Generated class for the SelectPeoplePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-select-branch',
  templateUrl: 'select-branch.html',
})
export class SelectBranchPage {
  userinfor: any;
  data: any = [];
  array:any = [];
  params: any = {
    page: 1,//当前页码
    pageSize: 15,
    queryKey: ''
  }
  infiniteScroll: any;
  callback;
  id: any;
  @ViewChild('searchBar') searchBar;
  searchTextStream: Subject<string> = new Subject<string>();
  people: any;
  isFilter: boolean = false;
  heroes$: Observable<any[]>;
  constructor(public NativeService: NativeService, public http: HttpClient, public globalData: globalData,private viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    //接收myorder页面的searchBack
    this.callback = this.navParams.get('callback');
    this.id = this.navParams.get('id');
    if(!!this.id){
      this.array = this.id.split(",");
    }
  }

  getItems(term: string): void {
    this.searchTextStream.next(term);
  }
  ngOnInit() {
    this.searchBar.value = ''
    this.heroes$ = this.searchTextStream.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      switchMap((term: string) => this.searchHeroes(term))
    )
  }
  searchHeroes(term: string): Observable<any> {
    if (!term.trim()) {
      this.isFilter = false;
      this.params.queryKey='';
      this.loadOrderDataFn(null);
      return of([])
    }
    this.isFilter = true;
    this.params = { page: 1, pageSize: 100, queryKey: term };
    return this.http.post<any[]>(ENV.httpurl + '/api/networkService/queryMeetingRoomApp',null, { params: this.params }).pipe(
      map(result =>{
        this.data = result['data'];
        this.data.forEach(element => {
          element.checked = false;
        });
        return result['data']

      }),
      tap(_ => console.log(`found heroes matching "${term}"`))
    )
  }
  onClearFilter(ev: any) {

  }
  ionViewDidEnter() {
    this.loadOrderDataFn(null)
  }
  loadOrderDataFn(refresher) {
    this.params.page = 1;
    this.NativeService.showLoading();
    this.init(refresher, null)
  }
  init(refresher, infiniteScroll) {
    this.http.post(ENV.httpurl + '/api/networkService/queryMeetingRoomApp',null, { params: this.params }).subscribe(resp => {
      if (this.params.page == 1) {
        this.data = resp['data'];
      } else {
        this.data = this.data.concat(resp['data']);
      }
      _.map(this.data, (n) => {
        
        if (_.includes(this.array, n.id)) {
          n.checked = true;
        } else {
          n.checked = false;
        }
      });
      if (!!refresher) {
        refresher.complete()
      }
      if (infiniteScroll) {
        infiniteScroll.complete();
        if (this.data.length >= resp['count'] - 1) {
          infiniteScroll.enable(false);
          this.infiniteScroll = infiniteScroll;
        }
      }
      this.NativeService.hideLoading();
    }, error => {
      this.NativeService.hideLoading();
    });
  }
  //刷新
  tabslideRefreshFn(refresher) {
    this.params.page = 1;
    if (!!this.infiniteScroll) {
      //为了解决翻到最后一页，翻页组件被enable(false)禁用，刷新后不能在翻页的问题
      this.infiniteScroll.enable(true);
    }
    this.loadOrderDataFn(refresher);
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    this.params.page += 1;
    this.init(null, infiniteScroll)
  }
  showOk() {
    return _.filter(this.data, (entry) => entry.checked === true).length > 0;
  }

  save= _.debounce(function () {
     let selected = _.filter(this.data, (entry) => entry.checked === true);
     let selectedSize = selected.length;
    if (selectedSize<1) {
      this.NativeService.showAlert('必须选择' + 1 + '个或以上分会场！');
    } else {
      this.callback({ 'data': selected }).then(() => {
        this.navCtrl.pop();
      });
    }
  },800);


  chooseItem(item) {
    this.data.forEach(element => {
      element.checked = false;
    });
    item.checked = true;
  }
  updateItem(item){
    item.checked = !item.checked
  }
  close() {
    this.navCtrl.pop();
  }
}
