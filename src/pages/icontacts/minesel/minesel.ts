import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';
import { ENV } from '@env/environment';
import { HttpClient } from '@angular/common/http';

/**
 * Generated class for the MineselPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-minesel',
  templateUrl: 'minesel.html',
})
export class MineselPage {
  model:any = [];
  constructor(public viewCtrl: ViewController, public http: HttpClient) {
    this.http.get(ENV.httpurl + '/api/addressApi/ulist').subscribe(data=> {
      this.model =  data;
    });
  }

  ionViewDidLoad() {
  }

  /**
   * 确定模态框时，返回已勾选人员信息
   */
  dismiss() {
    let arr = [];
    this.model.forEach(element => {
      element['data'].forEach(item => {
        if(item.check) {
          arr.push({
            'userId':item.userId,
            'userName':item.userName,
            'photo':item.photo
          })
        }
      });
    });
    if(arr.length > 0) {
      this.viewCtrl.dismiss(arr);
    }else {
      this.viewCtrl.dismiss();
    }
  }

  close() {
    this.viewCtrl.dismiss();
  }

  /**
   * 跳锚点
   * @param li 
   */
  goList(li) {
    let el = document.getElementById('minesel_'+li);
    if(el) {
      el.scrollIntoView();
    }
  }

}
