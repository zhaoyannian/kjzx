import { Component, ViewChild } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { ENV } from "@env/environment";
import { HttpClient } from "@angular/common/http";
import { NativeService } from "../../../icommon/provider/native";
import _ from "lodash";
import { Observable, Subject } from "rxjs";
import { of } from "rxjs/observable/of";
import { catchError, map, tap } from "rxjs/operators";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";

@Component({
  selector: "page-selectPerson",
  templateUrl: "selectPerson.html"
})
export class SelectAdvisePersonPage {
  entry: any = {};
  data: any;
  dataList: any = [];
  userids: any = "";
  callback;
  loginObj: any = {};
  state: any = ENV.httpurl;
  params: any = {
    page: 1, //当前页码
    pageSize: 20,
    queryKey: ""
  };
  infiniteScroll: any;
  isFilter = false;
  heroes$: Observable<any[]>;
  private searchTerms = new Subject<string>();
  showcount: boolean = false;
  @ViewChild("searchBox") searchBox: any;
  userinfor: any;
  defaultPerson: any;
  choose: any;
  constructor(
    public NavCtrl: NavController,
    public nat: NativeService,
    public http: HttpClient,
    public navParams: NavParams
  ) {
    this.loginObj = JSON.parse(localStorage.getItem("objectList"));
    //接收myorder页面的searchBack
    this.callback = this.navParams.get("callback");
    this.userids = this.navParams.get("userids");
  }
  ionViewDidEnter() {
    this.loadOrderDataFn(null);
  }
  search(term: string): void {
    this.searchTerms.next(term);
  }
  ngOnInit() {
    this.searchBox.value = "";
    this.heroes$ = this.searchTerms.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((term: string) => this.searchHeroes(term))
    );
  }
  searchHeroes(term: string): Observable<any> {
    if (!term.trim()) {
      this.isFilter = false;
      this.params.page = 1;
      this.queryPage(null, null);
      return of([]);
    }
    this.isFilter = true;
    this.params.page = 1;
    return this.http
      .post<any[]>(
        ENV.httpurl +
          "/api/exchangeAdvise/queryAllStaffsByOrgIdPage?page=" +
          this.params.page +
          "&pageSize=100&queryKey=" +
          term,
        {}
      )
      .pipe(
        map(data => {
          this.data = data["rows"];
          for (let d in this.data) {
            this.data[d].checked = false;
            if (
              !!this.userids &&
              !!this.data[d].deptOrgId &&
              this.userids.indexOf(this.data[d].deptOrgId) >= 0
            ) {
              this.data[d].checked = true;
            }
          }
          return data["rows"];
        }),
        tap(_ => console.log(`found heroes matching "${term}"`))
      );
  }
  onClearFilter(ev: any) {}
  goback() {
    this.NavCtrl.pop();
  }
  loadOrderDataFn(refresher) {
    this.nat.showLoading();
    this.queryPage(refresher, null);
  }

  queryPage(refresher, infiniteScroll) {
    this.http
      .post(
        ENV.httpurl + "/api/exchangeAdvise/queryAllStaffsByOrgIdPage",
        null,
        {
          params: this.params
        }
      )
      .subscribe(
        resp => {
          if (this.params.page == 1) {
            this.data = resp["rows"];
          } else {
            this.data = this.data.concat(resp["rows"]);
          }

          for (let d in this.data) {
            this.data[d].checked = false;
            if (
              !!this.userids &&
              !!this.data[d].deptOrgId &&
              this.userids.indexOf(this.data[d].deptOrgId) >= 0
            ) {
              this.data[d].checked = true;
            }
          }

          if (!!refresher) {
            refresher.complete();
          }
          if (infiniteScroll) {
            infiniteScroll.complete();
            if (this.data.length >= resp["total"] - 1) {
              infiniteScroll.enable(false);
              this.infiniteScroll = infiniteScroll;
            }
          }
          this.nat.hideLoading();
        },
        error => {
          console.log(error);
          this.nat.hideLoading();
        }
      );
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
    this.queryPage(null, infiniteScroll);
  }

  close() {
    if (this.dataList.length <= 0) {
      this.nat.showAlert("请选择负责人");
    } else {
      this.callback({ dataList: this.dataList }).then(() => {
        this.NavCtrl.pop();
      });
    }
  }
  //选择人员
  select(item) {
    this.entry = item;
    if (this.entry.checked) {
      let login = _.filter(this.dataList, n => n.userId == this.entry.userId);
      //将选择人员加到集合this.dataList中
      if (login.length <= 0) {
        this.dataList.push(this.entry);
      }
    } else {
      let login = _.filter(this.dataList, n => n.userId == this.entry.userId);
      //删除未选择人员
      if (login.length > 0) {
        this.dataList = _.filter(
          this.dataList,
          n => n.userId != this.entry.userId
        );
      }
    }
  }

  getItems(e) {
    if (!!e.target.value) {
      this.params.page = 1;
      this.params.queryKey = e.target.value;
    } else {
      this.params.page = 1;
      this.params.queryKey = "";
    }
    this.loadOrderDataFn(null);
  }
}
