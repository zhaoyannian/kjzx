import { NativeService } from '../../../../icommon/provider/native';
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
/**
 * Generated class for the PagingSelectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-paging-select',
  templateUrl: 'paging-select.html',
})
export class PagingSelectPage {
  page: any = 1;
  //一页多少条
  pageSize: any = 10;
  entitys: any = [];
  //总条数
  totalCount: number;
  isShow: any;
  pageInfo: any;
  queryKey: any = '';
  selectRadio: string = "";
  url: any;
  bizdata: any = {};
  bizType: any;
  requesttype: any;
  @ViewChild('searchBar') searchBar;
  searchTextStream: Subject<string> = new Subject<string>();
  people: any;
  isFilter: boolean = false;
  heroes$: Observable<any[]>;
  constructor(private viewCtrl: ViewController, public nativeService: NativeService, public navCtrl: NavController, public navParams: NavParams, public http: HttpClient) {
    this.url = this.navParams.get("url");
    this.bizdata = !!this.navParams.get("bizdata") ? this.navParams.get("bizdata") : {};
    this.bizType = !!this.navParams.get("bizType") ? this.navParams.get("bizType") : {};
    this.requesttype = this.navParams.get("requesttype");
  }
  // /api/staff/flowQueryStaffsByPage
  ionViewDidEnter() {
    this.init(this.queryKey, null, 'load')
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
      this.queryKey='';
      this.init(this.queryKey, null, 'load')
      return of([])
    }
    this.isFilter = true;
    this.pageInfo = { page: 1, pageSize: 100, queryKey: term };
    if (this.requesttype == 'post') {
      return this.http.post<any[]>(ENV.httpurlscm + this.url, this.bizdata, { params: this.pageInfo, observe: "response" }).pipe(
        map(result => {
          this.entitys = this.entitys.concat(result.body);
          this.entitys.forEach(element => {
            element.checked = false;
          });
          return result.body;
        }),
        tap(_ => console.log(`found heroes matching "${term}"`))
      )
    } else {
      return this.http.get<any[]>(ENV.httpurlscm + this.url, { params: this.pageInfo, observe: "response" }).pipe(
        map(result =>  {
          this.entitys = this.entitys.concat(result.body);
          this.entitys.forEach(element => {
            element.checked = false;
          });
          return result.body;
        }),
        tap(_ => console.log(`found heroes matching "${term}"`))
      )

    }

  }
  onClearFilter(ev: any) {

  }
  init(queryKey, refresher, load) {
    this.page = 1;
    this.pageInfo = { page: this.page, pageSize: this.pageSize, queryKey: queryKey };
    if (!!load) {
      this.nativeService.showLoading();
    }
    let fn;
    if (this.requesttype == 'post') {
      fn = this.http.post(ENV.httpurlscm + this.url, this.bizdata, { params: this.pageInfo, observe: "response" })
    } else {
      fn = this.http.get(ENV.httpurlscm + this.url, { params: this.pageInfo, observe: "response" })

    }
    fn.subscribe(result => {
      this.totalCount = Number(result.headers.get("count"));
      this.entitys = result.body;
      this.entitys.forEach(element => {
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
    this.init(this.queryKey, refresher, null)
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    if (this.totalCount == this.entitys.length) {
      infiniteScroll.complete();
    } else {
      this.page += 1;
      let pageInfo = { page: this.page, pageSize: this.pageSize, queryKey: this.queryKey };
      let fn;
      if (this.requesttype == 'post') {
        fn = this.http.post(ENV.httpurlscm + this.url, this.bizdata, { params: pageInfo, observe: "response" })
      } else {
        fn = this.http.get(ENV.httpurlscm + this.url, { params: pageInfo, observe: "response" })

      }
      fn.subscribe(result => {
        this.entitys = this.entitys.concat(result.body);
        this.entitys.forEach(element => {
          element.checked = false;
        });
        infiniteScroll.complete();
      })
    }
  }
  close() {
    if (this.selectRadio == null || this.selectRadio == "") {
      this.nativeService.showAlert("请选择人员!");
    } else {
      // let item = _.find(this.entitys, function (o) {
      //   return o.checked == true;
      // });
      let that = this;
      let s1 = _.find(that.entitys, function (o) {
        return o.userId == that.selectRadio;
      });
      console.log(that.selectRadio);
      this.viewCtrl.dismiss(s1);
    }
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }
  // getItems(ev) {
  //   var val = ev.target.value;
  //   if (val && val.trim() != '') {
  //     this.queryKey = val;
  //     this.init(this.queryKey, null, 'load')
  //   } else {
  //     this.queryKey = '';
  //     this.init(this.queryKey, null, 'load')
  //   }
  // }


}
