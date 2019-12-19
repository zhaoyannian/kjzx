import { NativeService } from '../../../../icommon/provider/native';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { readFlowOpinionUri, readPointInfoUri, defaultDisplayPoint } from '../../../../icommon/provider/Constantscg';
import _ from 'lodash';
import 'rxjs/add/operator/timeout';
@IonicPage()
@Component({
  selector: 'page-flowprocess',
  templateUrl: 'flowprocess.html',
})
export class FlowprocessPage {
  entity: any;
  toggle = "listData";
  opinionList: any = [];
  points: any = [];
  len: any;
  currentPoint: any;
  n: any;
  constructor(public NativeService: NativeService, public http: HttpClient, public navCtrl: NavController, public navParams: NavParams) {
    this.entity = this.navParams.get("entry");
  }

  ionViewDidEnter() {
    this.init()
  }
  goback() {
    this.navCtrl.pop();
  }
  async init() {
    this.NativeService.showLoading();
    //获取环节信息
    await this.getPointInfo();
    //获取意见表
    await this.getOpinionList();
  }
  getPointInfo() {
    this.http.post(ENV.httpurlscm + readFlowOpinionUri + '/' + this.entity.flowInstId, {}).timeout(9000).subscribe(resp => {
      this.opinionList = resp;
      // 处理手写签名
      // _.each(this.opinionList, o => {
      //   this.http.get(ENV.httpurlscm + '/stoneVfs/local/wfSignture/' + this.entity.flowInstId + '/' + o.DATAID + '.txt').subscribe(resp => {
      //     o.dataUrl = resp;
      //   }, error => console.error(error));
      // });
    }, () => { this.NativeService.hideLoading(); });
  }
  getOpinionList() {
    this.http.post(ENV.httpurlscm + readPointInfoUri + '/' + this.entity.flowInstId, {}).timeout(9000).subscribe(resp => {
      this.points = resp;
      this.len = resp['length'];
      // 获取当前环节 STATE=2
      this.currentPoint = _.find(this.points, function (n) {
        return n.STATE === '2';
      });
      this.n = this.currentPoint ? this.getN(defaultDisplayPoint, this.len, this.currentPoint.SEQ) : 0;
      this.NativeService.hideLoading();
    }, error => {
      this.NativeService.hideLoading();
    })

  }
  /**
  * 建议一下
  */
  getN(dp, ap, cp) {
    return this.calcN(cp, Math.ceil(dp / 2), dp, ap); // 取中点为对齐环节，向上取整
  }
  /**
  * cur: 当前环节
  * align: 对齐环节
  * viewSize: 显示环节数量
  * size: 所有环节数量
  */
  calcN(cur, align, viewSize, size) {
    var sliding = Math.max((size - viewSize), 0); // 允许滑动的最大范围
    var sn = Math.max((cur - align), 0);  // 应该滑动的位置
    return Math.min(sn, sliding); // 实际滑动的位置
  }
  toggleClick(event: any) {
    this.toggle = event;
  }

}
