import { NativeService } from './../../../../icommon/provider/native';
import { globalData } from './../../../../icommon/provider/globalData';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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
  selector: 'page-select-peoplenew',
  templateUrl: 'select-peoplenew.html',
})
export class SelectPeopleNewPage {
  userinfor: any;
  data: any = [];
  params: any = {
    page: 1,//当前页码
    pageSize: 15,
    queryKey: ''
  }
  infiniteScroll: any;
  callback;
  userId: any;
  @ViewChild('searchBar') searchBar;
  searchTextStream: Subject<string> = new Subject<string>();
  people: any;
  isFilter: boolean = false;
  heroes$: Observable<any[]>;
  selectRadio: string = "";
  constructor(public NativeService: NativeService, public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams) {
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    //接收myorder页面的searchBack
    this.callback = this.navParams.get('callback');
    this.userId = this.navParams.get('userId');
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
    return this.http.post<any[]>(ENV.httpurl + '/api/organization/queryStaffsApp', null, { params: this.params }).pipe(
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
    this.http.post(ENV.httpurl + '/api/organization/queryStaffsApp', null, { params: this.params }).subscribe(resp => {
      if (this.params.page == 1) {
        this.data = resp['data'];
      } else {
        this.data = this.data.concat(resp['data']);
      }
      _.map(this.data, (n) => {
        if (n.userId === this.userId) {
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
    if (this.selectRadio == null || this.selectRadio == "") {
      this.NativeService.showAlert("请选择人员!");
    } else {
      let that = this;
      let selected = _.find(that.data, function (o) {
        return o.userId == that.selectRadio;
      });
      this.callback({ 'data': [selected] }).then(() => {
        this.navCtrl.pop();
      });
    }
    // let selected = _.filter(this.data, (entry) => entry.checked === true);
    // this.callback({ 'data': selected }).then(() => {
    //   this.navCtrl.pop();
    // });
  },800);
  chooseItem(item) {
    this.data.forEach(element => {
      element.checked = false;
    });
    item.checked = true;
  }
  // getItems(e) {
  //   if (!!e.target.value) {
  //     this.params.page = 1;
  //     this.params.queryKey = e.target.value;

  //   } else {
  //     this.params.page = 1;
  //     this.params.queryKey = '';
  //   }
  //   this.loadOrderDataFn(null)
  // }
  close() {
    this.navCtrl.pop();
  }
}
