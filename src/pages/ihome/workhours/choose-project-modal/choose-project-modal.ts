import { NativeService } from './../../../../icommon/provider/native';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';

@IonicPage()
@Component({
  selector: 'page-choose-project-modal',
  templateUrl: 'choose-project-modal.html',
})
export class ChooseProjectModalPage {
  page: any = 1;
  //一页多少条
  pageSize: any = 10;
  allList: any = [];
  //总条数
  totalCount: number;
  isShow: any;
  pageInfo: any;
  queryKey: any = '';
  searchText: string;
  searchItems: any;
  heroes$: Observable<any[]>;
  private searchTerms = new Subject<string>();
  @ViewChild('searchBox') searchBox: any;
  isFilter = false;
  selectRadio:string="";
  constructor(private viewCtrl: ViewController, public nativeService: NativeService, public navCtrl: NavController, public navParams: NavParams, public http: HttpClient) {

  }
  search(term: string): void {
    this.searchTerms.next(term);
  }
  ngOnInit() {
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
      this.init(this.queryKey, null)
      return of([])
    }
    this.isFilter = true;
    this.page = 1;
    this.pageInfo.queryKey = term;
    this.pageInfo.pageSize = 500;
    return this.http.post<any[]>(ENV.httpurl + '/api/projectTable/queryBySearchApp', {}, { params: this.pageInfo }).pipe(
      map(data =>{ 
        this.allList = data['data'];
        this.allList.forEach(element => {
          element.checked = false;
        });
        this.totalCount = data['count'];
        this.isShow = false;
        return data['data']
      }),
      tap(_ => console.log(`found heroes matching "${term}"`))
    )
  }
  onClearFilter(ev: any) {

  }
  ionViewDidEnter() {
    this.init(this.queryKey, null)
  }
  init(queryKey, refresher) {
    this.page = 1;
    this.pageInfo = { page: this.page, pageSize: this.pageSize, queryKey: queryKey };
    this.http.post(ENV.httpurl + '/api/projectTable/queryBySearchApp', {}, { params: this.pageInfo }).subscribe(result => {
      this.totalCount = result['count'];
      this.allList = result['data'];
      this.allList.forEach(element => {
        element.checked = false;
      });
      if (!!refresher) {
        refresher.complete();
      }
      this.nativeService.hideLoading();
    }, error => {
      if (!!refresher) {
        refresher.complete();
      }
      this.nativeService.hideLoading();
    })
  }
  //刷新
  tabslideRefreshFn(refresher) {
    this.init(this.queryKey, refresher)
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    if (this.totalCount == this.allList.length) {
      infiniteScroll.complete();
    } else {
      this.page += 1;
      let pageInfo = { page: this.page, pageSize: this.pageSize, queryKey: this.queryKey };
      this.http.post(ENV.httpurl + "/api/projectTable/queryBySearchApp", {}, { params: pageInfo }).subscribe(result => {
        this.allList = this.allList.concat(result['data']);
        this.allList.forEach(element => {
          element.checked = false;
        });
        infiniteScroll.complete();
      })
    }
  }
  chooseItem(item) {
    // if (this.isFilter) {
    //   this.heroes$.subscribe(data =>{
    //     console.log(data);
    //   })
    //   this.heroes$.forEach(element => {
    //     element['checked'] = false;
    //   });
    //   item.checked = true;
    //   this.isShow = _.find(this.heroes$, function (o) {
    //     return o['checked'] == true;
    //   });
    // } else {
      this.allList.forEach(element => {
        element.checked = false;
      });
      item.checked = true;
      this.isShow = _.find(this.allList, function (o) {
        return o.checked == true;
      });
    // }

  }
  dismiss() {
    this.viewCtrl.dismiss();
  }
  chooseItemList() {
    let that = this;
    let item = _.find(this.allList, function (o) {
      // return o.checked == true;
      return o.id == that.selectRadio
    });
    this.viewCtrl.dismiss(item);
  }
  getItems(ev) {
    var val = ev.target.value;
    if (val && val.trim() != '') {
      this.queryKey = val;
      this.init(this.queryKey, null)
    } else {
      this.queryKey = '';
      this.init(this.queryKey, null)
    }
  }

}
