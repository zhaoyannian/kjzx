import { NativeService } from "./../../../../icommon/provider/native";
import { globalData } from "./../../../../icommon/provider/globalData";
import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from "ionic-angular";
import _ from "lodash";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";
import { Observable, Subject } from "rxjs";
import { of } from "rxjs/observable/of";
import { catchError, map, tap } from "rxjs/operators";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
/**
 * Generated class for the SelectPeoplePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-select-people",
  templateUrl: "select-people.html"
})
export class SelectPeoplePage {
  userinfor: any;
  nextPoint: any;
  selectResourceListUri: any;
  peope: any = {};
  result: any;
  peopleData: any;
  userId: any;
  params: any = {
    page: 1, //当前页码
    pageSize: 20,
    queryKey: ""
  };
  infiniteScroll: any;
  data: any = [];
  searchText: string;
  searchItems: any;
  isFilter = false;
  heroes$: Observable<any[]>;
  private searchTerms = new Subject<string>();
  showcount: boolean = false;
  @ViewChild("searchBox") searchBox: any;
  totalCount: any = 0;
  httpurl: any;
  constructor(
    public NativeService: NativeService,
    public http: HttpClient,
    public globalData: globalData,
    private viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.httpurl = this.navParams.get("httpurl");
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.selectResourceListUri = this.navParams.get("selectResourceListUri");
    this.nextPoint = this.navParams.get("nextPoint");
    Object.assign(this.peope, {
      selectResTitle: "选择办理人员",
      currUserId: this.userinfor.staff.userId,
      currRoleIds: _.map(this.userinfor.staff.staffRoles, "roleId"),
      columnDefinition: [],
      isCombin: this.globalData.isCombinRes(this.nextPoint), // 复合资源判断
      resDef: {}
    });
    if (this.peope.isCombin) {
      this.peope.resDef = this.nextPoint.listResource[0];
      this.peope.selectResTitle =
        "选择" +
        this.peope.resDef.size +
        "个" +
        (this.peope.resDef.sizeCondition === ">=" ? "或以上" : "") +
        "办理人";
    }
  }
  //   isImmutable = (entry) => {
  //     if (!!this.nextPoint.config.excludeCurrentLogin && this.nextPoint.config.excludeCurrentLogin === false) {
  //         return false;
  //     } else { // 默认排除当前登录人
  //         return this.peope.currUserId === entry.resourceTargetId || _.includes(this.peope.currRoleIds, entry.resourceTargetId);
  //     }
  // };
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
      this.init(null, null);
      return of([]);
    }
    this.isFilter = true;
    this.params.page = 1;
    return this.http
      .get<any[]>(
        (!!this.httpurl ? this.httpurl : ENV.httpurl) +
          this.selectResourceListUri +
          "?page=" +
          this.params.page +
          "&pageSize=100&queryKey=" +
          term
      )
      .pipe(
        map(data => {
          this.peopleData = data;
          let d = data;
          if (d && d["columnDef"]) {
            // this.peope.selectedTitle = d['selectedTitltProp'];//"userName"
            // this.peope.resourceTargetProp = d['resourceTargetProp'];//userId
            this.userId = d["resourceTargetProp"];
            this.result = d["targetObjects"].data;
            this.result.forEach(element => {
              element.checked = false;
            });
          }
          this.data = this.result;
          // for (let d in this.data) {
          //     this.data[d].checked = false;
          //     if (!!this.defaultPerson) {
          //         if (this.data[d].userId === this.loginObj['loginInfo'].userId) {
          //             this.data[d].checked = true;
          //         }
          //     }
          //     for (let e in this.dataList) {
          //         if (this.data[d].userId === this.dataList[e].userId) {
          //             this.data[d].checked = true;
          //         }
          //     }
          // }
          return this.result;
        }),
        tap(_ => console.log(`found heroes matching "${term}"`))
      );
  }
  onClearFilter(ev: any) {}
  loadOrderDataFn(refresher) {
    this.init(refresher, null);
  }
  init(refresher, infiniteScroll) {
    this.NativeService.hideLoading();
    this.NativeService.showLoading();
    this.http
      .get(
        (!!this.httpurl ? this.httpurl : ENV.httpurl) +
          this.selectResourceListUri,
        { params: this.params }
      )
      .subscribe(
        resp => {
          this.peopleData = resp;
          let d = resp;
          if (d && d["columnDef"]) {
            // this.peope.selectedTitle = d['selectedTitltProp'];//"userName"
            // this.peope.resourceTargetProp = d['resourceTargetProp'];//userId
            this.userId = d["resourceTargetProp"];
            this.result = d["targetObjects"].data;
            this.totalCount = d["targetObjects"]["count"];
            this.result.forEach(element => {
              element.checked = false;
            });
          }

          if (this.params.page == 1) {
            this.data = this.result;
          } else {
            this.data = this.data.concat(this.result);
          }
          if (!!refresher) {
            refresher.complete();
          }
          if (infiniteScroll) {
            infiniteScroll.complete();
            // if (this.data.length >= resp['count'] - 1) {
            //   infiniteScroll.enable(false);
            //   this.infiniteScroll = infiniteScroll;
            // }
          }
          this.NativeService.hideLoading();
        },
        error => {
          this.NativeService.hideLoading();
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
    if (this.totalCount == this.data.length) {
      infiniteScroll.complete();
    } else {
      this.params.page += 1;
      this.init(null, infiniteScroll);
    }
  }
  showOk() {
    return _.filter(this.data, entry => entry.checked === true).length > 0;
  }
  save() {
    let selected = _.filter(this.data, entry => entry.checked === true);
    // 如果是复合资源则判断
    if (this.globalData.isCombinRes(this.nextPoint)) {
      let selectedSize = selected.length;
      if (
        this.peope.resDef.sizeCondition === "=" &&
        this.peope.resDef.size != selectedSize
      ) {
        this.NativeService.showAlert(
          "必须选择" + this.peope.resDef.size + "个办理人！"
        );
      } else if (
        this.peope.resDef.sizeCondition === ">=" &&
        this.peope.resDef.size > selectedSize
      ) {
        this.NativeService.showAlert(
          "必须选择" + this.peope.resDef.size + "个或以上办理人！"
        );
      } else {
        selected.push(this.userId);
        this.viewCtrl.dismiss(selected);
      }
    } else {
      let selectedSize = selected.length;
      if (
        this.peopleData.sizeCondition === "=" &&
        this.peopleData.size != selectedSize
      ) {
        this.NativeService.showAlert(
          "必须选择" + this.peopleData.size + "个办理人！"
        );
      } else if (
        this.peopleData.sizeCondition === ">=" &&
        this.peopleData.size > selectedSize
      ) {
        this.NativeService.showAlert(
          "必须选择" + this.peopleData.size + "个或以上办理人！"
        );
      } else {
        selected.push(this.userId);
        this.viewCtrl.dismiss(selected);
      }
    }
  }
  updateItem(item) {
    item.checked = !item.checked;
  }
  dismiss() {
    this.viewCtrl.dismiss([]);
  }
}
