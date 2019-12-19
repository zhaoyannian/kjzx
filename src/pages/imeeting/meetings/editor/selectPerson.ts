import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ENV } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { NativeService } from '../../../../icommon/provider/native';
import _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import {
    debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';
@Component({
    selector: 'page-selectPerson',
    templateUrl: 'selectPerson.html'
})


export class SelectPersonPage {

    entry: any = {};
    data: any;
    dataList: any = [];
    dataListAll: any = [];
    callback;
    loginObj: any = {};
    state: any = ENV.httpurl;
    params: any = {
        page: 1,//当前页码
        pageSize: 20,
        queryKey: ''
    }
    infiniteScroll: any;
    userLogin: any = {};
    type: any;
    allItems: any;
    searchText: string;
    searchItems: any;
    isFilter = false;
    heroes$: Observable<any[]>;
    private searchTerms = new Subject<string>();
    showcount: boolean = false;
    @ViewChild('searchBox') searchBox: any;
    userinfor: any;
    defaultPerson: any;
    choose:any;
    constructor(public NavCtrl: NavController, public nat: NativeService, public http: HttpClient, public navParams: NavParams) {
        this.loginObj = JSON.parse(localStorage.getItem("objectList"));
        //接收myorder页面的searchBack
        this.callback = this.navParams.get('callback');
        this.dataList = this.navParams.get("meetingStaff");
        this.dataListAll = this.navParams.get("meetingStaff");
        this.userinfor = JSON.parse(localStorage.getItem("objectList"));
        this.defaultPerson = this.navParams.get("defaultPerson");
        this.choose = this.navParams.get("choose");
    }
    ionViewDidEnter() {
        this.loadOrderDataFn(null)
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
            this.params.page = 1;
            this.queryPage(null, null)
            return of([])
        }
        this.isFilter = true;
        this.params.page = 1;
        return this.http.post<any[]>(ENV.httpurl + '/api/organization/queryStaffsApp?page=' + this.params.page + '&pageSize=100&queryKey=' + term,{}).pipe(
            map(data => {
                this.data = data['data'];
                for (let d in this.data) {
                    this.data[d].checked = false;
                    if (!!this.defaultPerson) {
                        if (this.data[d].userId === this.loginObj['loginInfo'].userId) {
                            this.data[d].checked = true;
                            //存储当前登录人对应信息
                            this.userLogin = this.data[d];
                            let login = _.filter(this.dataList, (n) => n.userId == this.userLogin.userId);
                            if (login.length <= 0) {
                                this.dataList.push(this.userLogin);
                            }
                        }
                    }
                    for (let e in this.dataList) {
                        if (this.data[d].userId === this.dataList[e].userId) {
                            this.data[d].checked = true;
                        }
                    }
                }
                return data['data'];
            }),
            tap(_ => console.log(`found heroes matching "${term}"`))
        )
    }
    onClearFilter(ev: any) {

    }
    goback() {
        if (this.dataListAll.length > 0 && this.dataList.length > 0) {
            if (this.dataListAll.length != this.dataList.length) {
                this.callback({ 'dataList': this.dataListAll }).then(() => {
                    this.NavCtrl.pop();
                });
            } else {
                this.NavCtrl.pop();
            }
        }else{
            this.NavCtrl.pop(); 
        }
        // this.NavCtrl.pop();
    }
    loadOrderDataFn(refresher) {
        this.nat.showLoading();
        this.queryPage(refresher, null)
    }

    queryPage(refresher, infiniteScroll) {
        this.http.get(ENV.httpurl + '/api/staff/queryAllStaffsNew', { params: this.params })
        .subscribe(resp => {
            if (this.params.page == 1) {
                this.data = resp['data'];
            } else {
                this.data = this.data.concat(resp['data']);
            }

            for (let d in this.data) {
                this.data[d].checked = false;
                if (!!this.defaultPerson) {
                    if (this.data[d].userId === this.loginObj['loginInfo'].userId) {
                        this.data[d].checked = true;
                        //存储当前登录人对应信息
                        this.userLogin = this.data[d];
                        let login = _.filter(this.dataList, (n) => n.userId == this.userLogin.userId);
                        if (login.length <= 0) {
                            this.dataList.push(this.userLogin);
                        }
                    }
                }
                for (let e in this.dataList) {
                    if (this.data[d].userId === this.dataList[e].userId) {
                        this.data[d].checked = true;
                    }
                }
            }

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
            this.nat.hideLoading();
        }, error => {
            console.log(error)
            this.nat.hideLoading();
        })
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
        this.queryPage(null, infiniteScroll)
    }

    close() {
        this.type = false;

        // this.dataList = _.filter(this.data, (n) => n.checked == true);
        // //判断选择集合this.dataList中是否包含发起人
        let a = _.find(this.dataList, (n) => n.id === this.loginObj['staff'].id);
        // for (let e in this.dataList) {
        //     if (this.dataList[e].id === this.loginObj['staff'].id) {
        //         this.type = true;
        //     }
        // }
        //若集合中不包含发起人，则增加对应发起人信息
        if(this.choose){
            if(!a){
                this.dataList.push({id:this.loginObj['staff'].id,
                userName:this.loginObj['staff'].userName,
                userId:this.loginObj['loginInfo'].userId});
            }
        }
        this.callback({ 'dataList': this.dataList }).then(() => {
            this.NavCtrl.pop();
        });
    }
    //选择人员
    select(item) {
        this.entry = item;
        if (this.entry.checked) {
            let login = _.filter(this.dataList, (n) => n.userId == this.entry.userId);
            //将选择人员加到集合this.dataList中
            if (login.length <= 0) {
                this.dataList.push(this.entry);
            }
        } else {
            let login = _.filter(this.dataList, (n) => n.userId == this.entry.userId);
            //删除未选择人员
            if (login.length > 0) {
                this.dataList = _.filter(this.dataList, (n) => n.userId != this.entry.userId);
            }
        }
    }

    getItems(e) {
        if (!!e.target.value) {
            this.params.page = 1;
            this.params.queryKey = e.target.value;

        } else {
            this.params.page = 1;
            this.params.queryKey = '';
        }
        this.loadOrderDataFn(null)
    }
}